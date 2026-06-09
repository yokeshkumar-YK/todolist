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

// ------------------------------------------------- LOCAL STORAGE -------------------------------------------------

let tasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

let streak =
    Number(localStorage.getItem("streak")) || 0;

let lastCompletedDate =
    localStorage.getItem("lastCompletedDate") || "";

let currentEditId = null;

//----------------------------------------------- INITIALIZE -------------------------------------------------

todayDate.textContent =
    new Date().toDateString();

updateStreakDisplay();
loadTheme();
renderTasks();

// ----------------------------------------------------------- EVENTS -------------------------------------------------------

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});

searchInput.addEventListener(
    "input",
    renderTasks
);

statusFilter.addEventListener(
    "change",
    renderTasks
);

themeToggle.addEventListener("click", toggleTheme);

saveEditBtn.addEventListener(
    "click",
    saveEditedTask
);

if (closeModalBtn) {
    closeModalBtn.addEventListener(
        "click",
        closeModal
    );
}

// ------------------------------------------------ TASK FUNCTIONS ------------------------------------------------

function addTask() {

    const text =
        taskInput.value.trim();

    if (!text) return;

    const task = {
        id: Date.now(),
        text,
        priority: priority.value,
        category: category.value,
        dueDate: dueDate.value,
        status: "Pending"
    };

    tasks.push(task);

    saveTasks();

    renderTasks();

    taskInput.value = "";
}

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    // Search

    const searchValue =
        searchInput.value.toLowerCase();

    filteredTasks =
        filteredTasks.filter(task =>
            task.text
                .toLowerCase()
                .includes(searchValue)
        );

    // Filter

    if (statusFilter.value !== "all") {

        filteredTasks =
            filteredTasks.filter(
                task =>
                    task.status ===
                    statusFilter.value
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

    filteredTasks.forEach(task => {

        const li =
            document.createElement("li");

        li.className =
            `task priority-${task.priority.toLowerCase()}`;

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

    ✏️ Edit

</button>

<button
class="delete-btn"
onclick="deleteTask(${task.id})">

    🗑️ Delete

</button>

</div>
`;

        taskList.appendChild(li);
    });

    updateDashboard();
}

// ------------------------------------------------ TOGGLE TASK ------------------------------------------------

function toggleTask(id) {

    tasks.forEach(task => {

        if (task.id === id) {

            task.completed =
                !task.completed;

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

    tasks =
        tasks.filter(
            task => task.id !== id
        );

    saveTasks();
    renderTasks();
}

// ------------------------------------------------ EDIT TASK ------------------------------------------------


function editTask(id) {

    currentEditId = id;

    const task =
        tasks.find(
            task => task.id === id
        );

    if (!task) return;

    editInput.value = task.text;

    modal.style.display = "flex";
}

function saveEditedTask() {

    const task =
        tasks.find(
            task =>
                task.id === currentEditId
        );

    if (!task) return;

    task.text =
        editInput.value.trim();

    saveTasks();

    renderTasks();

    closeModal();
}

function closeModal() {

    modal.style.display = "none";
}

// ------------------------------------------------ DASHBOARD ------------------------------------------------

function updateDashboard() {

    const total = tasks.length;

    const pending =
        tasks.filter(
            t => t.status === "Pending"
        ).length;

    const ongoing =
        tasks.filter(
            t => t.status === "Ongoing"
        ).length;

    const completed =
        tasks.filter(
            t => t.status === "Completed"
        ).length;

    totalTasks.textContent = total;

    pendingTasks.textContent =
        pending;

    document.getElementById(
        "ongoingTasks"
    ).textContent =
        ongoing;

    completedTasks.textContent =
        completed;
    if (pendingTasks) {
        pendingTasks.textContent =
            pending;
    }

    const progress =
        total === 0
            ? 0
            : (completed / total) * 100;

    progressFill.style.width =
        progress + "%";

    progressText.textContent =
        Math.round(progress) +
        "% Completed";

    const productivityScore =
        document.getElementById(
            "productivityScore"
        );

    if (productivityScore) {

        productivityScore.textContent =
            Math.round(progress) + "%";
    }
}

// ------------------------------------------------ STREAK ------------------------------------------------

function updateStreak() {

    const today =
        new Date().toDateString();

    if (
        lastCompletedDate !== today
    ) {

        streak++;

        lastCompletedDate = today;

        localStorage.setItem(
            "streak",
            streak
        );

        localStorage.setItem(
            "lastCompletedDate",
            today
        );
    }

    updateStreakDisplay();
}

function updateStreakDisplay() {

    const streakCount =
        document.getElementById(
            "streakCount"
        );

    if (streakCount) {

        streakCount.textContent =
            `${streak} Days`;
    }
}

// ------------------------------------------------ STORAGE ------------------------------------------------


function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

// ------------------------------------------------ THEME ------------------------------------------------

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    localStorage.setItem(
        "theme",
        document.body.classList.contains(
            "dark"
        )
    );
}

function loadTheme() {

    const dark =
        localStorage.getItem(
            "theme"
        );

    if (dark === "true") {

        document.body.classList.add(
            "dark"
        );
    }
}

// ------------------------------------------------ DRAG & DROP-----------------------------------------------

new Sortable(taskList, {

    animation: 150,

    onEnd() {

        const items =
            Array.from(
                taskList.children
            );

        const newTasks = [];

        items.forEach(item => {

            const taskId =
                Number(
                    item.dataset.id
                );

            const task =
                tasks.find(
                    t => t.id === taskId
                );

            if (task) {

                newTasks.push(task);
            }
        });

        tasks = newTasks;

        saveTasks();
    }
});

function changeStatus(id, status) {

    const task =
        tasks.find(
            t => t.id === id
        );

    if (!task) return;

    task.status = status;

    if (status === "Completed") {
        updateStreak();
    }

    saveTasks();
    renderTasks();
}

// ======================================
// SIDEBAR NAVIGATION
// ======================================

const sidebarItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".content-section");

sidebarItems.forEach(item => {

    item.addEventListener("click", () => {

        // Remove active from sidebar items
        sidebarItems.forEach(li =>
            li.classList.remove("active")
        );

        item.classList.add("active");

        // Hide all sections
        sections.forEach(section =>
            section.classList.remove("active-section")
        );

        // Show selected section
        const sectionName =
            item.dataset.section;

        const targetSection =
            document.getElementById(
                sectionName + "Section"
            );

        if (targetSection) {
            targetSection.classList.add(
                "active-section"
            );
        }
    });

});