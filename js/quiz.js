"use strict";

// Personalise these to your own story whenever you like.
const QUIZ = [
  {
    q: "What is my favourite place in the world?",
    options: ["A faraway island", "Wherever you are", "The top of a mountain"],
    answer: 1
  },
  {
    q: "What sound do I never get tired of?",
    options: ["Your laugh", "City traffic", "A ringing phone"],
    answer: 0
  },
  {
    q: "What do I notice first every time I see you?",
    options: ["The weather", "My phone", "Your smile"],
    answer: 2
  },
  {
    q: "What is my favourite time of day with you?",
    options: ["Rush hour", "Late-night talks", "Monday mornings"],
    answer: 1
  },
  {
    q: "What do I think about when I cannot sleep?",
    options: ["Our next adventure", "Work emails", "Nothing at all"],
    answer: 0
  },
  {
    q: "If I could replay one moment forever, which would it be?",
    options: ["A boring Tuesday", "The alarm clock", "The first time you said you loved me"],
    answer: 2
  },
  {
    q: "What always makes a bad day better?",
    options: ["One message from you", "Winning the lottery", "A long meeting"],
    answer: 0
  },
  {
    q: "What do I want most for us?",
    options: ["A quick goodbye", "A long, gentle forever", "A crowded room"],
    answer: 1
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
