"use strict";

// The starter bucket list shown the first time you open the page.
const STARTER_BUCKET = [
  "Watch the sunrise together",
  "Take a photo in every city we visit",
  "Cook a whole meal together",
  "Dance in the kitchen at midnight",
  "See the stars away from the city lights",
  "Write each other a letter to open in a year",
  "Take a slow road trip with no fixed plan",
  "Learn to make each other's favourite meal",
  "Fall asleep under the stars at least once",
  "Start a tiny tradition just for the two of us",
  "Plant something and watch it grow together",
  "Take a class in something we are both bad at",
  "Watch the sunrise every day for a whole week",
  "Build a blanket fort and stay in it all day",
  "Make a playlist that is only ours",
  "Go somewhere neither of us has ever been",
  "Take silly photos in a photo booth",
  "Read the same book and talk about it after",
  "Have a picnic in the rain anyway",
  "Dance in the kitchen at midnight, again",
  "Write down our favourite day, then relive it",
  "Grow old together and still hold hands"
];

const STORAGE_KEY = "mena-bucket-list";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bucket-form");
  const input = document.getElementById("bucket-input");
  const list = document.getElementById("bucket-list");
  const reset = document.getElementById("bucket-reset");

  if (!form || !input || !list) {
    return;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item) => item && typeof item.text === "string")
            .map((item) => ({ text: item.text, done: Boolean(item.done) }));
        }
      }
    } catch {
      // Fall back to the starter list.
    }
    return STARTER_BUCKET.map((text) => ({ text, done: false }));
  }

  function save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // The list still works for this visit if storage is unavailable.
    }
  }

  let items = load();

  function render() {
    list.textContent = "";

    if (!items.length) {
      const empty = document.createElement("li");
      empty.className = "bucket-empty";
      empty.textContent = "Nothing here yet \u2014 add your first dream above.";
      list.appendChild(empty);
      return;
    }

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "bucket-item" + (item.done ? " is-done" : "");

      const label = document.createElement("label");
      label.className = "bucket-label";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.done;
      checkbox.addEventListener("change", () => {
        items[index].done = checkbox.checked;
        save(items);
        render();
      });

      const span = document.createElement("span");
      span.textContent = item.text;

      label.appendChild(checkbox);
      label.appendChild(span);
      li.appendChild(label);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "bucket-remove";
      remove.setAttribute("aria-label", "Remove this item");
      remove.textContent = "\u00D7";
      remove.addEventListener("click", () => {
        items.splice(index, 1);
        save(items);
        render();
      });
      li.appendChild(remove);

      list.appendChild(li);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();

    if (!text) {
      return;
    }

    items.push({ text, done: false });
    input.value = "";
    save(items);
    render();
    input.focus();
  });

  if (reset) {
    reset.addEventListener("click", () => {
      items = STARTER_BUCKET.map((text) => ({ text, done: false }));
      save(items);
      render();
    });
  }

  render();
});
