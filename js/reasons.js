"use strict";

// EDIT ME: add, remove, or change the reasons below.
// Each line is one reason shown in the list and in the "Tell me another" button.
const REASONS = [
  "The way you smile when you think no one is looking.",
  "How a boring day turns gentle the moment we talk.",
  "The way you say my name.",
  "Your laugh \u2014 the real one, the loud one.",
  "How you always notice the small things.",
  "How you care about people even when you are tired.",
  "How safe the world feels when you are beside me.",
  "The way you get excited about tiny things.",
  "How you make ordinary places feel like memories.",
  "Your kindness, even on your hardest days.",
  "The way you listen \u2014 really listen.",
  "How you remember the little things I mention once.",
  "The way you look when you are thinking.",
  "Your patience with me.",
  "How you turn my bad days around.",
  "The way you sing when you forget I can hear.",
  "Your stubborn little pout.",
  "How you always know when something is wrong.",
  "The way you make me want to be better.",
  "Your hands. Just\u2026 your hands.",
  "How the world slows down when you are close.",
  "The way you say goodnight.",
  "Your random, perfect messages.",
  "How you laugh at your own jokes.",
  "The way you love the people you love.",
  "Your sleepy voice in the morning.",
  "How you make me feel like home.",
  "The way you dance when you think no one is watching.",
  "How proud I am just to know you.",
  "The way your eyes light up.",
  "Your courage, even when you are scared.",
  "How you forgive me when I do not deserve it.",
  "The way you talk about your dreams.",
  "Your soft heart in a loud world.",
  "How every song sounds like you now.",
  "The way you hold my hand a little tighter.",
  "Your everything. Yes, everything.",
  "How you make forever sound too short.",
  "The way you are simply, completely you.",
  "Because you are Mena. That is the whole reason."
];

document.addEventListener("DOMContentLoaded", () => {
  const text = document.getElementById("reason-text");
  const button = document.getElementById("reason-button");
  const list = document.getElementById("reason-list");

  if (list) {
    REASONS.forEach((reason) => {
      const li = document.createElement("li");
      li.textContent = reason;
      list.appendChild(li);
    });
  }

  if (!text || !button || !REASONS.length) {
    return;
  }

  let lastIndex = -1;

  button.addEventListener("click", () => {
    let index = Math.floor(Math.random() * REASONS.length);

    if (REASONS.length > 1) {
      while (index === lastIndex) {
        index = Math.floor(Math.random() * REASONS.length);
      }
    }

    lastIndex = index;
    text.textContent = REASONS[index];

    text.classList.remove("pop");
    void text.offsetWidth;
    text.classList.add("pop");
  });
});
