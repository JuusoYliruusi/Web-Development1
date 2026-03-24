const STORAGE_KEY = "moodEntries";

let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const moodPicker = document.getElementById("moodPicker");
const moodButtons = document.querySelectorAll(".mood-picker button");
const activitiesInput = document.getElementById("activities");
const saveBtn = document.getElementById("save-btn");
const filterBar = document.getElementById("filter");
const entriesList = document.getElementById("entries-list");
const statsDiv = document.getElementById("stats");

let selectedMood = "";
let activeFilter = "";

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function setActiveFilterButton() {
  const buttons = filterBar.querySelectorAll("button");
  buttons.forEach((btn) => {
    const mood = btn.dataset.filter;
    btn.classList.toggle("active", mood === activeFilter);
  });
}

moodPicker.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return; 

  moodButtons.forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  selectedMood = btn.dataset.mood;
});

saveBtn.addEventListener("click", () => {
  const rawText = activitiesInput.value;

  const activities = rawText
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!selectedMood) {
    alert("Please select a mood first.");
    return;
  }

  if (activities.length === 0) {
    alert("Please write at least one activity.");
    return; 
  }

  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    mood: selectedMood,
    activities: activities, 
  };

  entries.push(entry);
  saveToStorage();

  activitiesInput.value = "";
  moodButtons.forEach((b) => b.classList.remove("selected"));
  selectedMood = "";

  renderEntries(activeFilter);
  updateStats();
});

filterBar.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  activeFilter = btn.dataset.filter;
  setActiveFilterButton();
  renderEntries(activeFilter);
});

entriesList.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-action='delete']");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const ok = confirm("Delete this entry?");
  if (!ok) return;

  entries = entries.filter((e) => e.id !== id);
  saveToStorage();

  renderEntries(activeFilter);
  updateStats();
});

function renderEntries(filterMood) {
  entriesList.innerHTML = "";

  const filtered = filterMood ? entries.filter((e) => e.mood === filterMood) : entries;
  const sorted = [...filtered].sort((a, b) => b.id - a.id); 

  if (sorted.length === 0) { 
    entriesList.innerHTML = "<p>No entries for this filter yet.</p>"; 
    return;
  }

  sorted.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "entry";

    const activityHtml = entry.activities.map((a) => `• ${a}`).join("<br>");

    div.innerHTML = `
      <div>
        <strong>${entry.date} ;  ${entry.mood.toUpperCase()}</strong><br>
        ${activityHtml}
      </div>
      <button type="button" data-action="delete" data-id="${entry.id}">Delete</button>
    `; 

    entriesList.appendChild(div); 
  });
}

function updateStats() { 
  if (entries.length === 0) {
    statsDiv.innerHTML = "<p>No entries yet. Add your first mood!</p>"; 
    return; 
  }

  const moodCount = {};

  entries.forEach((e) => {
    moodCount[e.mood] = (moodCount[e.mood] || 0) + 1;
  });

  let mostCommon = ""; 
  let highest = 0;

  for (const mood in moodCount) {
    if (moodCount[mood] > highest) {
      highest = moodCount[mood]; 
      mostCommon = mood; 
    } 
  }

  statsDiv.innerHTML = `
    <p>Total entries: ${entries.length}</p>
    <p>Most common mood: ${mostCommon} (${highest} times)</p>
  `;
} 

setActiveFilterButton();
renderEntries(activeFilter);
updateStats();