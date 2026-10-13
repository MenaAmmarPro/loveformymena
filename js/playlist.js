"use strict";

// EDIT ME: add your songs. Each item needs a title; urls are optional.
// Example: { title: "Our song", artist: "The band", spotify: "https://...", youtube: "https://..." }
const SONGS = [
  { title: "Song title one", artist: "Artist", spotify: "", youtube: "" },
  { title: "Song title two", artist: "Artist", spotify: "", youtube: "" },
  { title: "Song title three", artist: "Artist", spotify: "", youtube: "" },
  { title: "Song title four", artist: "Artist", spotify: "", youtube: "" },
  { title: "Song title five", artist: "Artist", spotify: "", youtube: "" }
];

document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("song-list");
  const button = document.getElementById("song-button");
  const pick = document.getElementById("song-pick");

  if (list) {
    SONGS.forEach((song) => {
      const li = document.createElement("li");
      li.className = "song-item";

      const title = document.createElement("span");
      title.className = "song-title";
      title.textContent = song.title;
      li.appendChild(title);

      if (song.artist) {
        const artist = document.createElement("span");
        artist.className = "song-artist";
        artist.textContent = song.artist;
        li.appendChild(artist);
      }

      const links = document.createElement("span");
      links.className = "song-links";

      [
        { label: "Spotify", url: song.spotify },
        { label: "YouTube", url: song.youtube }
      ].forEach((source) => {
        if (!source.url) {
          return;
        }
        const a = document.createElement("a");
        a.href = source.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = source.label;
        links.appendChild(a);
      });

      if (links.childElementCount) {
        li.appendChild(links);
      }

      list.appendChild(li);
    });
  }

  if (button && pick && SONGS.length) {
    button.addEventListener("click", () => {
      const song = SONGS[Math.floor(Math.random() * SONGS.length)];
      pick.textContent = "Play " + song.title + (song.artist ? " by " + song.artist : "") + " \u266B";
    });
  }
});
