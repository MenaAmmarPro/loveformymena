"use strict";

// The little messages that can appear inside the cookie.
const FORTUNES = [
  "Someone is thinking of you right this moment.",
  "A small kindness today will quietly come back to you.",
  "You are exactly where you are meant to be.",
  "Something you have been hoping for is closer than it looks.",
  "Your smile is somebody's favorite thing today.",
  "The best part of your week has not happened yet.",
  "You are allowed to rest. You have earned it.",
  "A lovely surprise is on its way to you.",
  "You make ordinary days feel like something special.",
  "The world is softer because you are in it.",
  "Trust the timing of your life. It knows the way.",
  "You are loved, more than you realize.",
  "A kind word you say today will be remembered for a long time.",
  "Good things are quietly gathering around you.",
  "Your heart is braver than you give it credit for.",
  "Today is a good day to be gentle with yourself.",
  "The right people find you at the right time.",
  "You are someone's reason to smile.",
  "Everything you are growing is worth the wait.",
  "Wherever you go, you carry a little light with you.",
  "Someone far away is smiling because of a memory of you.",
  "The kindest thing you do today will echo for a long time.",
  "You are becoming exactly who you were always meant to be.",
  "A door you thought was closed is quietly opening.",
  "You are more loved than any doubt in your head.",
  "The next good thing is already on its way to you.",
  "Your patience is about to be rewarded.",
  "You bring out the gentlest version of the people around you.",
  "A small adventure is waiting for you this week.",
  "You are allowed to want big things. Go get them.",
  "The way you keep going is a kind of magic.",
  "Something you lost is coming back in a better form.",
  "Your presence is a gift people feel before they notice.",
  "You will sleep well tonight, and wake up lighter.",
  "A warm conversation is closer than you think.",
  "You are the reason someone believes in good people.",
  "What you are worried about will work out kindly.",
  "Your best days are not behind you. They are next.",
  "You deserve the softness you give everyone else."
];

document.addEventListener("DOMContentLoaded", () => {
  const cookie = document.getElementById("fortune-cookie");
  const text = document.getElementById("fortune-text");

  if (!cookie || !text || !FORTUNES.length) {
    return;
  }

  let lastIndex = -1;

  function crack() {
    let index = Math.floor(Math.random() * FORTUNES.length);

    if (FORTUNES.length > 1) {
      while (index === lastIndex) {
        index = Math.floor(Math.random() * FORTUNES.length);
      }
    }

    lastIndex = index;
    text.textContent = FORTUNES[index];

    cookie.classList.remove("is-cracking");
    void cookie.offsetWidth;
    cookie.classList.add("is-cracking");

    text.classList.remove("pop");
    void text.offsetWidth;
    text.classList.add("pop");
  }

  cookie.addEventListener("click", crack);
});
