// -------------------------------------- DOM ELEMENTS --------------------------------------

const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const category = document.getElementById("category");
const dueDate = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");
const themeToggle = document.getElementById("theme-toggle");
const modal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const saveEditBtn = document.getElementById("saveEdit");
const closeModalBtn = document.getElementById("closeModal");
const todayDate = document.getElementById("todayDate");

// CLEAR TASKS MODAL
const clearTasksBtn = document.getElementById("clearTasks");
const clearModal = document.getElementById("clearModal");
const confirmClearBtn = document.getElementById("confirmClear");
const cancelClearBtn = document.getElementById("cancelClear");
const closeClearModalBtn = document.getElementById("closeClearModal");

// TOAST
const toast = document.getElementById("toast");

// FOCUS TIMER

const timerDisplay = document.getElementById("timer");
const sessionInput = document.getElementById("sessionInput");
const startTimerBtn = document.getElementById("startTimer");
const pauseTimerBtn = document.getElementById("pauseTimer");
const resetTimerBtn = document.getElementById("resetTimer");
//Calender
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const addNoteBtn = document.getElementById("addNote");
const notesGrid = document.getElementById("notesGrid");

const goalInput = document.getElementById("goalInput");
const goalType = document.getElementById("goalType");
const addGoalBtn = document.getElementById("addGoal");
const goalsList = document.getElementById("goalsList");
console.log("taskList =", taskList);

// ------------------------------------------------- LOCAL STORAGE -------------------------------------------------

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let streak = Number(localStorage.getItem("streak")) || 0;
let goals = JSON.parse(localStorage.getItem("goals")) || [];

let lastCompletedDate = localStorage.getItem("lastCompletedDate") || "";
let notes = JSON.parse(localStorage.getItem("notes")) || [];

let currentEditId = null;

// FOCUS TIMER

let timerInterval = null;

let totalSeconds = 25 * 60;

let isRunning = false;

// Calender
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
//----------------------------------------------- INITIALIZE -------------------------------------------------

if (todayDate) {
  todayDate.textContent = new Date().toDateString();
}
updateStreakDisplay();
loadTheme();
renderTasks();
renderCalendar();
renderNotes();
renderGoals();
renderAnalytics();
// ----------------------------------------------------------- EVENTS -------------------------------------------------------

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

searchInput.addEventListener("input", renderTasks);

statusFilter.addEventListener("change", renderTasks);

themeToggle.addEventListener("click", toggleTheme);

saveEditBtn.addEventListener("click", saveEditedTask);

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

// CLEAR TASKS EVENTS

if (clearTasksBtn) {
  clearTasksBtn.addEventListener("click", openClearModal);
}

if (confirmClearBtn) {
  confirmClearBtn.addEventListener("click", clearAllTasks);
}

if (cancelClearBtn) {
  cancelClearBtn.addEventListener("click", closeClearModal);
}

if (closeClearModalBtn) {
  closeClearModalBtn.addEventListener("click", closeClearModal);
}
// FOCUS TIMER EVENTS

startTimerBtn.addEventListener("click", startTimer);

pauseTimerBtn.addEventListener("click", pauseResumeTimer);

resetTimerBtn.addEventListener("click", resetTimer);
if (addNoteBtn) {
  addNoteBtn.addEventListener("click", addNote);
}
if (addGoalBtn) {
  addGoalBtn.addEventListener("click", addGoal);
}
// ------------------------------------------------ TASK FUNCTIONS ------------------------------------------------

function addTask() {
  const text = taskInput.value.trim();

  if (!text) {
    showToast("⚠ Task Title is required");
    taskInput.focus();
    return;
  }

  if (!dueDate.value) {
    showToast("⚠ Deadline Date is required");
    dueDate.focus();
    return;
  }

  const task = {
    id: Date.now(),
    text,
    priority: priority.value,
    category: category.value,
    dueDate: dueDate.value,
    createdDate: new Date().toISOString().split("T")[0],
    completedDate: null,
    status: "Pending",
  };

  tasks.push(task);

  saveTasks();
  renderAnalytics();

  renderTasks();

  taskInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = [...tasks];

  // Search

  const searchValue = searchInput.value.toLowerCase();

  filteredTasks = filteredTasks.filter((task) =>
    task.text.toLowerCase().includes(searchValue),
  );

  // Filter

  if (statusFilter.value !== "all") {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === statusFilter.value,
    );
  }

  // Empty State

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
        <li class="task">
            No tasks found.
        </li>
        `;

    updateDashboard();
    return;
  }

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    li.className = `task priority-${task.priority.toLowerCase()}`;

    li.dataset.id = task.id;

    li.innerHTML = `

<div class="task-info">

    <strong>${task.text}</strong>

    <span>📁 ${task.category}</span>

    <span>
        📅 ${task.dueDate || "No Date"}
    </span>

</div>

<div class="task-actions">

<select
class="status-select"
onchange="changeStatus(${task.id}, this.value)">

    <option value="Pending"
    ${task.status === "Pending" ? "selected" : ""}>
        Pending
    </option>

    <option value="Ongoing"
    ${task.status === "Ongoing" ? "selected" : ""}>
        Ongoing
    </option>

    <option value="Completed"
    ${task.status === "Completed" ? "selected" : ""}>
        Completed
    </option>

</select>

<button
class="edit-btn"
onclick="editTask(${task.id})">

    Edit

</button>

<button
class="delete-btn"
onclick="deleteTask(${task.id})">

    Delete

</button>

</div>
`;

    taskList.appendChild(li);
  });

  updateDashboard();
}

// ------------------------------------------------ TOGGLE TASK ------------------------------------------------

function toggleTask(id) {
  tasks.forEach((task) => {
    if (task.id === id) {
      task.completed = !task.completed;

      if (task.completed) {
        updateStreak();
      }
    }
  });

  saveTasks();
  renderTasks();
}

// ------------------------------------------------ DELETE TASK ------------------------------------------------

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
  renderAnalytics();
}

// ------------------------------------------------ EDIT TASK ------------------------------------------------

function editTask(id) {
  currentEditId = id;

  const task = tasks.find((task) => task.id === id);

  if (!task) return;

  editInput.value = task.text;

  modal.style.display = "flex";
}

function saveEditedTask() {
  const task = tasks.find((task) => task.id === currentEditId);

  if (!task) return;

  task.text = editInput.value.trim();

  saveTasks();

  renderTasks();
  renderAnalytics();

  closeModal();
}

function closeModal() {
  modal.style.display = "none";
}

// ------------------------------------------------ DASHBOARD ------------------------------------------------

function updateDashboard() {
  const total = tasks.length;

  const pending = tasks.filter((t) => t.status === "Pending").length;

  const ongoing = tasks.filter((t) => t.status === "Ongoing").length;

  const completed = tasks.filter((t) => t.status === "Completed").length;

  totalTasks.textContent = total;

  pendingTasks.textContent = pending;

  document.getElementById("ongoingTasks").textContent = ongoing;

  completedTasks.textContent = completed;
  if (pendingTasks) {
    pendingTasks.textContent = pending;
  }

  const progress = total === 0 ? 0 : (completed / total) * 100;

  progressFill.style.width = progress + "%";

  progressText.textContent = Math.round(progress) + "% Completed";

  const productivityScore = document.getElementById("productivityScore");

  if (productivityScore) {
    productivityScore.textContent = Math.round(progress) + "%";
  }
}

// ------------------------------------------------ STREAK ------------------------------------------------

function updateStreak() {
  const today = new Date().toDateString();

  if (lastCompletedDate !== today) {
    streak++;

    lastCompletedDate = today;

    localStorage.setItem("streak", streak);

    localStorage.setItem("lastCompletedDate", today);
  }

  updateStreakDisplay();
}

function updateStreakDisplay() {
  const streakCount = document.getElementById("streakCount");

  if (streakCount) {
    streakCount.textContent = `${streak} Days`;
  }
}

// ------------------------------------------------ STORAGE ------------------------------------------------

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ------------------------------------------------ THEME ------------------------------------------------

function toggleTheme() {
  document.body.classList.toggle("dark");

  localStorage.setItem("theme", document.body.classList.contains("dark"));
}

function loadTheme() {
  const dark = localStorage.getItem("theme");

  if (dark === "true") {
    document.body.classList.add("dark");
  }
}

// ------------------------------------------------ DRAG & DROP-----------------------------------------------

new Sortable(taskList, {
  animation: 150,

  onEnd() {
    const items = Array.from(taskList.children);

    const newTasks = [];

    items.forEach((item) => {
      const taskId = Number(item.dataset.id);

      const task = tasks.find((t) => t.id === taskId);

      if (task) {
        newTasks.push(task);
      }
    });

    tasks = newTasks;

    saveTasks();
  },
});
function changeStatus(id, status) {
  const task = tasks.find((t) => t.id === id);

  if (!task) return;

  task.status = status;

  if (status === "Completed") {
    task.completedDate = new Date().toISOString().split("T")[0];
    updateStreak();
  } else {
    task.completedDate = null;
  }

  saveTasks();
  renderTasks();
  renderAnalytics();
}

// ======================================
// SIDEBAR NAVIGATION
// ======================================

const sidebarItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".content-section");

sidebarItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Remove active from sidebar items
    sidebarItems.forEach((li) => li.classList.remove("active"));

    item.classList.add("active");

    // Hide all sections
    sections.forEach((section) => section.classList.remove("active-section"));

    // Show selected section
    const sectionName = item.dataset.section;

    const targetSection = document.getElementById(sectionName + "Section");

    if (targetSection) {
      targetSection.classList.add("active-section");
    }
  });
});

// ------------------------------------------------ CLEAR TASKS ------------------------------------------------

function openClearModal() {
  clearModal.style.display = "flex";
}

function closeClearModal() {
  clearModal.style.display = "none";
}

function clearAllTasks() {
  tasks = [];
  localStorage.removeItem("tasks");
  renderTasks();
  updateDashboard();
  closeClearModal();
  renderAnalytics();
  showToast("✅ Tasks cleared successfully!");
}

// -------------------------------------------------- TOAST ------------------------------------------------

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ------------------------------------------------ FOCUS TIMER ------------------------------------------------

function updateTimerDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  if (isRunning) return;

  if (totalSeconds === 0 || totalSeconds === Number(sessionInput.value) * 60) {
    totalSeconds = Number(sessionInput.value) * 60;
  }

  isRunning = true;

  timerInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);

      timerInterval = null;

      isRunning = false;

      pauseTimerBtn.textContent = "⏸ Pause";

      showToast("🎉 Focus Session Completed!");

      return;
    }

    totalSeconds--;

    updateTimerDisplay();
  }, 1000);
}
function pauseResumeTimer() {
  if (isRunning) {
    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    pauseTimerBtn.textContent = "▶ Resume";
  } else {
    isRunning = true;

    pauseTimerBtn.textContent = "⏸ Pause";

    timerInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timerInterval);

        timerInterval = null;

        isRunning = false;

        showToast("🎉 Focus Session Completed!");

        return;
      }

      totalSeconds--;

      updateTimerDisplay();
    }, 1000);
  }
}
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  totalSeconds = Number(sessionInput.value) * 60;
  updateTimerDisplay();
  pauseTimerBtn.textContent = "⏸ Pause";
  showToast("🔄 Timer Reset");
}

function renderCalendar() {
  if (!calendar) return;

  calendar.innerHTML = "";

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  monthYear.textContent = new Date(currentYear, currentMonth).toLocaleString(
    "default",
    {
      month: "long",
      year: "numeric",
    },
  );

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");

    calendar.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayBox = document.createElement("div");

    dayBox.className = "calendar-day";

    dayBox.innerHTML = `<div class="day-number">${day}</div>`;

    const dayTasks = tasks.filter((task) => task.dueDate === dateString);

    dayTasks.forEach((task) => {
      const badge = document.createElement("div");

      badge.className = "task-badge";

      badge.textContent = task.text;

      dayBox.appendChild(badge);
    });

    calendar.appendChild(dayBox);
  }
}
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  renderCalendar();
});

// ======================================
// NOTES SYSTEM
// ======================================

function addNote() {
  const title = noteTitle.value.trim();

  const content = noteContent.value.trim();

  if (!content) return;

  const colors = ["#FFF8B3", "#D7F8E3", "#D9EFFF", "#FFE0E0", "#F3E8FF"];

  const note = {
    id: Date.now(),
    title,
    content,
    color: colors[Math.floor(Math.random() * colors.length)],
  };

  notes.push(note);

  saveNotes();

  renderNotes();

  noteTitle.value = "";

  noteContent.value = "";

  showToast("📝 Note Added");
}

function renderNotes() {
  if (!notesGrid) return;

  notesGrid.innerHTML = "";

  notes.forEach((note) => {
    const card = document.createElement("div");

    card.className = "note-card";

    card.style.background = note.color;

    card.innerHTML = `

      <h3>${note.title || "Untitled Note"}</h3>

      <p>${note.content}</p>

      <div class="note-actions">

        <button onclick="editNote(${note.id})">
          ✏
        </button>

        <button onclick="deleteNote(${note.id})">
          🗑
        </button>

      </div>

    `;

    notesGrid.appendChild(card);
  });
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);

  saveNotes();

  renderNotes();

  showToast("🗑 Note Deleted");
}

function editNote(id) {
  const note = notes.find((note) => note.id === id);

  if (!note) return;

  const newTitle = prompt("Edit Title", note.title);

  if (newTitle === null) return;

  const newContent = prompt("Edit Note", note.content);

  if (newContent === null) return;

  note.title = newTitle;

  note.content = newContent;

  saveNotes();

  renderNotes();

  showToast("✏ Note Updated");
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}
function addGoal() {
  const text = goalInput.value.trim();

  if (!text) return;

  const selectedType = goalType.value;

  // Maximum 3 goals

  if (goals.length >= 3) {
    showToast("Maximum 3 goals allowed");
    return;
  }

  // Only 1 Primary Goal

  const primaryCount = goals.filter((goal) => goal.type === "Primary").length;

  if (selectedType === "Primary" && primaryCount >= 1) {
    showToast("Only one Primary Goal allowed");
    return;
  }

  // Only 2 Secondary Goals

  const secondaryCount = goals.filter(
    (goal) => goal.type === "Secondary",
  ).length;

  if (selectedType === "Secondary" && secondaryCount >= 2) {
    showToast("Only two Secondary Goals allowed");
    return;
  }

  const goal = {
    id: Date.now(),
    text,
    type: selectedType,
    progress: 0,
  };

  goals.push(goal);

  saveGoals();

  renderGoals();

  goalInput.value = "";

  showToast("🎯 Goal Added");
}
function renderGoals() {
  if (!goalsList) return;

  goalsList.innerHTML = "";

  goals.forEach((goal) => {
    const card = document.createElement("div");

    card.className = "goal-card";

    card.innerHTML = `

      <div class="goal-header">

        <h3>${goal.text}</h3>

        <span class="goal-type ${
          goal.type === "Primary" ? "primary-goal" : "secondary-goal"
        }">

          ${goal.type}

        </span>

      </div>

      <div class="goal-progress">

        <p>
          Progress: ${goal.progress}%
        </p>

        <input
          type="range"
          min="0"
          max="100"
          value="${goal.progress}"
          onchange="updateGoalProgress(${goal.id}, this.value)"
        />

      </div>

      <div class="goal-actions">

        <button onclick="editGoal(${goal.id})">
          ✏ Edit
        </button>

        <button onclick="deleteGoal(${goal.id})">
          🗑 Delete
        </button>

      </div>

    `;

    goalsList.appendChild(card);
  });
}

function updateGoalProgress(id, value) {
  const goal = goals.find((goal) => goal.id === id);

  if (!goal) return;

  goal.progress = Number(value);

  saveGoals();

  renderGoals();
}

function deleteGoal(id) {
  goals = goals.filter((goal) => goal.id !== id);

  saveGoals();

  renderGoals();

  showToast("Goal Deleted");
}

function editGoal(id) {
  const goal = goals.find((goal) => goal.id === id);

  if (!goal) return;

  const updated = prompt("Edit Goal", goal.text);

  if (!updated) return;

  goal.text = updated;

  saveGoals();

  renderGoals();
}

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}
function renderAnalytics() {
  const tableBody = document.getElementById("analyticsTableBody");

  if (!tableBody) return;

  const completedTasksList = tasks.filter(
    (task) => task.status === "Completed",
  );

  tableBody.innerHTML = "";

  completedTasksList.forEach((task) => {
    let statusText = "No Deadline";

    if (task.dueDate && task.completedDate) {
      const due = new Date(task.dueDate);
      const completed = new Date(task.completedDate);
      const diff = Math.floor((due - completed) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        statusText = `+${diff} Days Early`;
      } else if (diff < 0) {
        statusText = `${diff} Days Late`;
      } else {
        statusText = "On Time";
      }
    }
    tableBody.innerHTML += `
      <tr>

        <td>${task.text}</td>

        <td>${task.priority}</td>

        <td>${task.category}</td>

        <td>${task.createdDate}</td>

        <td>${task.dueDate || "-"}</td>

        <td>${task.completedDate || "-"}</td>

        <td>${statusText}</td>

      </tr>
    `;
  });
}
