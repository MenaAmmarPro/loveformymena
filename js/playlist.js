"use strict";

// Every track here is generated live in the browser by js/music.js.
// No audio files are used: each one is described by its key, scale, tempo,
// chord progression, and a seed that decides its melody.
const TRACKS = [
  {
    id: "starlight",
    title: "Starlight",
    mood: "gentle, wide-open",
    kind: "song",
    tempo: 76,
    root: 60,
    scale: "major",
    progression: "bright",
    waveform: "sine",
    beat: false,
    seed: 11,
    seconds: 24
  },
  {
    id: "slow-dance",
    title: "Slow Dance",
    mood: "warm, close",
    kind: "song",
    tempo: 72,
    root: 57,
    scale: "minor",
    progression: "dream",
    waveform: "triangle",
    beat: true,
    seed: 23,
    seconds: 24
  },
  {
    id: "morning-light",
    title: "Morning Light",
    mood: "bright, hopeful",
    kind: "song",
    tempo: 92,
    root: 62,
    scale: "major",
    progression: "hopeful",
    waveform: "sine",
    beat: true,
    seed: 31,
    seconds: 24
  },
  {
    id: "rainy-window",
    title: "Rainy Window",
    mood: "quiet, nostalgic",
    kind: "song",
    tempo: 68,
    root: 55,
    scale: "minor",
    progression: "sad",
    waveform: "triangle",
    padWaveform: "sine",
    beat: false,
    seed: 43,
    seconds: 24
  },
  {
    id: "city-lights",
    title: "City Lights",
    mood: "late-night drive",
    kind: "beat",
    tempo: 100,
    root: 53,
    scale: "minor",
    progression: "loop",
    waveform: "sawtooth",
    melody: false,
    beat: true,
    seed: 57,
    seconds: 24
  },
  {
    id: "lullaby",
    title: "Lullaby",
    mood: "soft, sleepy",
    kind: "song",
    tempo: 60,
    root: 60,
    scale: "major",
    progression: "gentle",
    waveform: "sine",
    beat: false,
    seed: 61,
    seconds: 24
  },
  {
    id: "heartbeat",
    title: "Heartbeat",
    mood: "steady, alive",
    kind: "beat",
    tempo: 110,
    root: 53,
    scale: "minor",
    progression: "loop",
    waveform: "square",
    pad: false,
    beat: true,
    seed: 71,
    seconds: 24
  },
  {
    id: "forever",
    title: "Forever",
    mood: "dreamy, endless",
    kind: "song",
    tempo: 80,
    root: 60,
    scale: "lydian",
    progression: "dream",
    waveform: "triangle",
    beat: false,
    seed: 83,
    seconds: 24
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("song-list");
  const button = document.getElementById("song-button");
  const pick = document.getElementById("song-pick");
  const music = window.MenaMusic;

  function describe(track) {
    return track.title + " \u2014 " + track.mood;
  }

  function refresh() {
    Array.from(document.querySelectorAll(".song-play")).forEach((b) => {
      const id = b.getAttribute("data-id");
      b.textContent = music && music.isPlaying(id) ? "Stop" : "Play";
    });
  }

  function toggle(track, origin) {
    if (!music || !music.supported()) {
      if (pick) {
        pick.textContent = "Your browser cannot play the generated music.";
      }
      return;
    }

    if (music.isPlaying(track.id)) {
      music.stop();
      if (origin && origin.id === "song-button") {
        pick.textContent = "";
      }
    } else {
      music.play(track);
      if (pick) {
        pick.textContent = "Now playing: " + describe(track) + " \u266B";
      }
    }

    refresh();
  }

  function save(track, btn) {
    if (!music || !music.supported()) {
      return;
    }

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "\u2026";

    music
      .render(track, track.seconds || 24)
      .then((buffer) => {
        if (!buffer) {
          throw new Error("render unavailable");
        }
        const blob = music.toWav(buffer);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = track.id + ".wav";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        if (pick) {
          pick.textContent = "Saved " + track.title + " as a WAV file \u2665";
        }
      })
      .catch(() => {
        if (pick) {
          pick.textContent = "Could not save that one.";
        }
      })
      .then(() => {
        btn.disabled = false;
        btn.textContent = original;
      });
  }

  if (list) {
    TRACKS.forEach((track) => {
      const li = document.createElement("li");
      li.className = "song-item";

      const info = document.createElement("span");
      info.className = "song-info";

      const title = document.createElement("span");
      title.className = "song-title";
      title.textContent = track.title;

      const mood = document.createElement("span");
      mood.className = "song-artist";
      mood.textContent = track.mood + " \u00B7 " + track.kind;

      info.appendChild(title);
      info.appendChild(mood);
      li.appendChild(info);

      const actions = document.createElement("span");
      actions.className = "song-actions";

      const play = document.createElement("button");
      play.type = "button";
      play.className = "song-play";
      play.setAttribute("data-id", track.id);
      play.textContent = "Play";
      play.setAttribute("aria-label", "Play " + track.title);
      play.addEventListener("click", () => toggle(track, play));

      const download = document.createElement("button");
      download.type = "button";
      download.className = "song-download";
      download.textContent = "Save";
      download.setAttribute("aria-label", "Save " + track.title + " as a WAV file");
      download.addEventListener("click", () => save(track, download));

      actions.appendChild(play);
      actions.appendChild(download);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }

  if (button) {
    button.addEventListener("click", () => {
      const track = TRACKS[Math.floor(Math.random() * TRACKS.length)];
      toggle(track, button);
    });
  }
});
