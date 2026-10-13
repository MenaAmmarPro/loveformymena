"use strict";

// EDIT ME: change the questions, options, and the correct answer index (0, 1, 2...).
const QUIZ = [
  {
    q: "Where did we first meet?",
    options: ["Edit this answer", "Edit this answer", "Edit this answer"],
    answer: 0
  },
  {
    q: "What is our favorite thing to do together?",
    options: ["Edit this answer", "Edit this answer", "Edit this answer"],
    answer: 1
  },
  {
    q: "What was the first film or series we watched together?",
    options: ["Edit this answer", "Edit this answer", "Edit this answer"],
    answer: 0
  },
  {
    q: "If we could travel anywhere right now, where would we go?",
    options: ["Edit this answer", "Edit this answer", "Edit this answer"],
    answer: 2
  },
  {
    q: "What is my favorite small thing about you?",
    options: ["Edit this answer", "Edit this answer", "Edit this answer"],
    answer: 1
  },
  {
    q: "What do I order every single time?",
    options: ["Edit this answer", "Edit this answer", "Edit this answer"],
    answer: 0
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("quiz");

  if (!root || !QUIZ.length) {
    return;
  }

  let index = 0;
  let score = 0;

  function renderQuestion() {
    root.textContent = "";
    const item = QUIZ[index];

    const progress = document.createElement("p");
    progress.className = "quiz-progress";
    progress.textContent = "Question " + (index + 1) + " of " + QUIZ.length;
    root.appendChild(progress);

    const question = document.createElement("h2");
    question.className = "quiz-question";
    question.textContent = item.q;
    root.appendChild(question);

    const options = document.createElement("div");
    options.className = "quiz-options";

    item.options.forEach((label, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.textContent = label;
      button.addEventListener("click", () => choose(i, options));
      options.appendChild(button);
    });

    root.appendChild(options);
  }

  function choose(chosen, options) {
    const item = QUIZ[index];
    const isRight = chosen === item.answer;

    Array.from(options.children).forEach((child) => {
      child.disabled = true;
    });

    if (isRight) {
      score += 1;
      options.children[chosen].classList.add("is-right");
    } else {
      options.children[chosen].classList.add("is-wrong");
      if (options.children[item.answer]) {
        options.children[item.answer].classList.add("is-right");
      }
    }

    const feedback = document.createElement("p");
    feedback.className = "quiz-feedback";
    feedback.textContent = isRight
      ? "That is right \u2665"
      : "Aww, close \u2665";
    root.appendChild(feedback);

    const next = document.createElement("button");
    next.type = "button";
    next.className = "button button-primary quiz-next";
    next.textContent = index === QUIZ.length - 1 ? "See my score" : "Next";
    next.addEventListener("click", () => {
      index += 1;
      if (index < QUIZ.length) {
        renderQuestion();
      } else {
        renderResult();
      }
    });
    root.appendChild(next);
  }

  function renderResult() {
    root.textContent = "";
    const percent = Math.round((score / QUIZ.length) * 100);

    const heading = document.createElement("h2");
    heading.className = "quiz-question";
    heading.textContent = "You got " + score + " / " + QUIZ.length;
    root.appendChild(heading);

    const message = document.createElement("p");
    message.className = "quiz-feedback";
    message.textContent =
      percent === 100
        ? "Perfect score \u2014 you know us by heart."
        : percent >= 60
        ? "So close \u2014 and adorable anyway."
        : "Then we will just have to make more memories.";
    root.appendChild(message);

    const again = document.createElement("button");
    again.type = "button";
    again.className = "button button-primary quiz-next";
    again.textContent = "Play again";
    again.addEventListener("click", () => {
      index = 0;
      score = 0;
      renderQuestion();
    });
    root.appendChild(again);
  }

  renderQuestion();
});
