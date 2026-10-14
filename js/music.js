"use strict";

/*
 * MenaMusic — a tiny generative music engine.
 *
 * Every "song" and "beat" on this site is synthesized live in the browser
 * with the Web Audio API. There are no audio files: tracks are described as
 * data (scale, chord progression, tempo, seed) and this engine turns them
 * into a pleasant looping arrangement of pad, bass, melody, and drums.
 *
 * Public API (window.MenaMusic):
 *   supported()            -> boolean
 *   play(track)            -> starts a looping track, returns boolean
 *   stop()                 -> stops playback
 *   isPlaying(id)          -> boolean
 *   playingId()            -> current track id or null
 *   render(track, seconds) -> Promise<AudioBuffer> (offline render)
 *   toWav(buffer)          -> Blob (WAV file for download)
 *   AMBIENT                -> a gentle built-in background track
 */

(function () {
  const AC = window.AudioContext || window.webkitAudioContext;

  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    majorPentatonic: [0, 2, 4, 7, 9],
    minorPentatonic: [0, 3, 5, 7, 10]
  };

  const PROGRESSIONS = {
    bright: [0, 5, 3, 4],
    gentle: [0, 3, 4, 3],
    dream: [0, 4, 5, 3],
    sad: [5, 3, 0, 4],
    hopeful: [0, 4, 3, 4],
    loop: [0, 3, 5, 4],
    lift: [0, 4, 5, 3]
  };

  const MELODY_RHYTHM = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0];

  let ctx = null;
  let master = null;
  let timer = null;
  let prepared = null;
  let playing = false;
  let currentId = null;
  let nextStep = 0;
  let nextTime = 0;

  const AMBIENT = {
    id: "ambient",
    tempo: 66,
    root: 57,
    scale: "dorian",
    progression: "dream",
    waveform: "triangle",
    padWaveform: "sine",
    beat: false,
    melody: true,
    pad: true,
    bass: true,
    seed: 7
  };

  function supported() {
    return Boolean(AC);
  }

  function engine() {
    if (!AC) {
      return null;
    }
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended" && typeof ctx.resume === "function") {
      ctx.resume();
    }
    return ctx;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function prepare(track) {
    const scale = SCALES[track.scale] || SCALES.major;
    const progression = PROGRESSIONS[track.progression] || PROGRESSIONS.gentle;
    const stepsPerBar = 16;
    const totalSteps = stepsPerBar * progression.length;
    const rng = mulberry32(track.seed || 1);
    const choices = [0, 2, 4, 6, 7, 9];
    const degrees = [];

    for (let i = 0; i < totalSteps; i += 1) {
      degrees.push(choices[Math.floor(rng() * choices.length)]);
    }

    return {
      id: track.id,
      tempo: track.tempo || 84,
      root: track.root == null ? 60 : track.root,
      scale: scale,
      progression: progression,
      waveform: track.waveform || "triangle",
      padWaveform: track.padWaveform || "sine",
      beat: Boolean(track.beat),
      melody: track.melody !== false,
      pad: track.pad !== false,
      bass: track.bass !== false,
      stepsPerBar: stepsPerBar,
      totalSteps: totalSteps,
      degrees: degrees
    };
  }

  function stepDuration(p) {
    return 60 / p.tempo / 4;
  }

  function scaleDegree(p, degree) {
    const len = p.scale.length;
    const octave = Math.floor(degree / len);
    const index = ((degree % len) + len) % len;
    return p.root + p.scale[index] + 12 * octave;
  }

  function chordDegree(p, bar) {
    return p.progression[bar % p.progression.length];
  }

  function tone(c, dest, time, freq, dur, wave, peak) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    const p = Math.max(peak, 0.0001);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(p, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  }

  function kick(c, dest, time) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.12);
    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.32);
  }

  function noise(c, dest, time, dur, peak, highpass) {
    const frames = Math.max(1, Math.floor(c.sampleRate * dur));
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frames; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = c.createBufferSource();
    source.buffer = buffer;

    const gain = c.createGain();
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    let node = source;
    if (highpass) {
      const filter = c.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = highpass;
      node.connect(filter);
      node = filter;
    }
    node.connect(gain);
    gain.connect(dest);
    source.start(time);
    source.stop(time + dur + 0.02);
  }

  function scheduleStep(p, c, dest, step, time) {
    const inBar = step % p.stepsPerBar;
    const bar = Math.floor(step / p.stepsPerBar);
    const degree = chordDegree(p, bar);

    if (inBar === 0 && p.pad) {
      [0, 2, 4].forEach((interval, i) => {
        tone(
          c, dest, time,
          midiToFreq(scaleDegree(p, degree + interval)),
          stepDuration(p) * p.stepsPerBar * 0.98,
          p.padWaveform,
          0.06 / (i + 1)
        );
      });
    }

    if (p.bass && (inBar === 0 || inBar === 8)) {
      const root = inBar === 8 ? scaleDegree(p, degree + 4) : scaleDegree(p, degree);
      tone(c, dest, time, midiToFreq(root - 12), stepDuration(p) * 4, "sine", 0.22);
    }

    if (p.melody && MELODY_RHYTHM[inBar]) {
      const step_choice = p.degrees[step % p.degrees.length];
      tone(
        c, dest, time,
        midiToFreq(scaleDegree(p, degree + step_choice)),
        stepDuration(p) * 1.6,
        p.waveform,
        0.12
      );
    }

    if (p.beat) {
      if (inBar === 0 || inBar === 8) {
        kick(c, dest, time);
      }
      if (inBar === 4 || inBar === 12) {
        noise(c, dest, time, 0.14, 0.5, 1200);
      }
      if (inBar % 2 === 0) {
        noise(c, dest, time, 0.03, inBar % 4 === 0 ? 0.14 : 0.08, 7000);
      }
    }
  }

  function scheduleSteps(p, c, dest, startStep, count, baseTime) {
    const sd = stepDuration(p);
    for (let i = 0; i < count; i += 1) {
      scheduleStep(p, c, dest, startStep + i, baseTime + i * sd);
    }
  }

  function tick() {
    if (!ctx || !prepared) {
      return;
    }
    const horizon = ctx.currentTime + 0.25;
    while (nextTime < horizon) {
      scheduleStep(prepared, ctx, master, nextStep, nextTime);
      nextTime += stepDuration(prepared);
      nextStep += 1;
    }
  }

  function play(track) {
    const c = engine();
    if (!c) {
      return false;
    }

    stop();
    prepared = prepare(track);
    playing = true;
    currentId = track.id;
    nextStep = 0;
    nextTime = c.currentTime + 0.08;
    timer = window.setInterval(tick, 40);
    tick();
    return true;
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    playing = false;
    currentId = null;
    prepared = null;
  }

  function isPlaying(id) {
    return playing && currentId === id;
  }

  function playingId() {
    return playing ? currentId : null;
  }

  function render(track, seconds) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!OAC) {
      return Promise.resolve(null);
    }

    const sampleRate = 44100;
    const frames = Math.ceil((seconds + 1) * sampleRate);
    const offline = new OAC(1, frames, sampleRate);
    const out = offline.createGain();
    out.gain.value = 0.6;
    out.connect(offline.destination);

    const p = prepare(track);
    const totalSteps = Math.ceil(seconds / stepDuration(p));
    scheduleSteps(p, offline, out, 0, totalSteps, 0.05);

    return offline.startRendering();
  }

  function toWav(buffer) {
    const channels = buffer.numberOfChannels;
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = channels * bytesPerSample;
    const dataSize = length * blockAlign;
    const view = new DataView(new ArrayBuffer(44 + dataSize));
    let offset = 0;

    function writeString(text) {
      for (let i = 0; i < text.length; i += 1) {
        view.setUint8(offset, text.charCodeAt(i));
        offset += 1;
      }
    }
    function writeUint32(value) {
      view.setUint32(offset, value, true);
      offset += 4;
    }
    function writeUint16(value) {
      view.setUint16(offset, value, true);
      offset += 2;
    }

    writeString("RIFF");
    writeUint32(36 + dataSize);
    writeString("WAVE");
    writeString("fmt ");
    writeUint32(16);
    writeUint16(1);
    writeUint16(channels);
    writeUint32(sampleRate);
    writeUint32(sampleRate * blockAlign);
    writeUint16(blockAlign);
    writeUint16(16);
    writeString("data");
    writeUint32(dataSize);

    const data = [];
    for (let ch = 0; ch < channels; ch += 1) {
      data.push(buffer.getChannelData(ch));
    }

    for (let i = 0; i < length; i += 1) {
      for (let ch = 0; ch < channels; ch += 1) {
        let sample = Math.max(-1, Math.min(1, data[ch][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }

    return new Blob([view.buffer], { type: "audio/wav" });
  }

  window.MenaMusic = {
    supported: supported,
    play: play,
    stop: stop,
    isPlaying: isPlaying,
    playingId: playingId,
    render: render,
    toWav: toWav,
    AMBIENT: AMBIENT
  };
})();
