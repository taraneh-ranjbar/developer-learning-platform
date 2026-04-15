//SPA
const links = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const target = link.getAttribute("data-page");

    // hide all pages
    pages.forEach((page) => {
      page.classList.remove("active");
    });

    // show selected page
    document.getElementById(target).classList.add("active");
  });
});

let currentFilter = "all";
let draggedItem = null;
// SELECT ELEMENTS
const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addTaskBtn");
const list = document.getElementById("taskList");
const filterInfo = document.getElementById("filterInfo");
const progressText = document.getElementById("progressText");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

// LOAD TASKS FROM LOCAL STORAGE
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


function loadFakeTasks() {
  const fakeData = [
    { text: "Learn JS", completed: false },
    { text: "Build Project", completed: true },
  ];

  tasks = fakeData;
  saveTasks();
  renderTasks();
}

// RENDER TASKS
function renderTasks() {
  list.innerHTML = "";

  let filteredTasks = tasks;

  if (tasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  if (currentFilter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");

    li.classList.add("fade-in");

    if (task.completed) {
      li.classList.add("completed");
    }
    li.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} data-index="${index}" class="toggle">

        <span class="task-text">${task.text}</span>

        <button data-index="${index}" class="edit-btn">✏️</button>

        <button data-index="${index}" class="delete-btn">❌</button>
      `;

    const textSpan = li.querySelector(".task-text");

    textSpan.addEventListener("click", () => {
      const inputEdit = document.createElement("input");
      inputEdit.type = "text";
      inputEdit.value = task.text;
      inputEdit.classList.add("edit-input");

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "✔";
      saveBtn.classList.add("save-btn");

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "✖";
      cancelBtn.classList.add("cancel-btn");

      const wrapper = document.createElement("div");
      wrapper.classList.add("edit-wrapper");

      wrapper.appendChild(inputEdit);
      wrapper.appendChild(saveBtn);
      wrapper.appendChild(cancelBtn);

      li.replaceChild(wrapper, textSpan);

      inputEdit.focus();

      // ✅ SAVE
      saveBtn.addEventListener("click", () => {
        task.text = inputEdit.value.trim() || task.text;
        saveTasks();
        renderTasks();
      });

      // ❌ CANCEL
      cancelBtn.addEventListener("click", () => {
        renderTasks();
      });
    });

    list.appendChild(li);

    li.setAttribute("draggable", true);
    li.addEventListener("dragstart", () => {
      draggedItem = task;
    });

    li.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    li.addEventListener("drop", () => {
      const draggedIndex = tasks.indexOf(draggedItem);
      const droppedIndex = tasks.indexOf(task);

      tasks.splice(draggedIndex, 1);
      tasks.splice(droppedIndex, 0, draggedItem);

      saveTasks();
      renderTasks();
    });
  });

  updateProgress();
}

document.getElementById("filterAll").addEventListener("click", () => {
  currentFilter = "all";
  filterInfo.textContent = "Showing all tasks (completed and active)";
  renderTasks();
});

document.getElementById("filterCompleted").addEventListener("click", () => {
  currentFilter = "completed";
  filterInfo.textContent = "Showing only completed tasks";
  renderTasks();
});

document.getElementById("filterActive").addEventListener("click", () => {
  currentFilter = "active";
  filterInfo.textContent = "Showing only active (incomplete) tasks";
  renderTasks();
});

function updateProgress() {
  const progress = document.getElementById("progress");

  if (tasks.length === 0) {
    progress.style.width = "0%";
    progressText.textContent = "No tasks yet";
    return;
  }
  document.getElementById("totalTasks").textContent = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = (completed / tasks.length) * 100;

  progress.style.width = percent + "%";

  if (completed === 0) {
    progressText.textContent = "No tasks completed yet";
  } else if (completed === tasks.length) {
    progressText.textContent = "All tasks completed 🎉";
  } else {
    progressText.textContent = `${completed} of ${tasks.length} tasks completed`;
  }

document.getElementById("completedTasks").textContent = completed;

document.getElementById("activeTasks").textContent = tasks.length - completed;
}

// SAVE TO LOCAL STORAGE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ADD TASK
addBtn.addEventListener("click", () => {
  const text = input.value.trim();

  const errorMsg = document.getElementById("errorMsg");

  if (text === "") {
    errorMsg.textContent = "Please enter a task!";
    errorMsg.style.display = "block";
    return;
  }

  errorMsg.style.display = "none";

  tasks.push({ text, completed: false });

  showToast("Task added successfully");
  
  input.value = "";
  input.focus();
  saveTasks();
  renderTasks();
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

// TOGGLE
list.addEventListener("change", (e) => {
  if (e.target.classList.contains("toggle")) {
    const index = e.target.dataset.index;
    tasks[index].completed = !tasks[index].completed;

    saveTasks();
    renderTasks();
  }
});

// DELETE
list.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;

    const item = e.target.closest("li");

    item.classList.add("fade-out");

    showToast("Task deleted");

    setTimeout(() => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }, 300);
  }

  // ✏️ EDIT BUTTON
  if (e.target.classList.contains("edit-btn")) {
    const index = e.target.dataset.index;
    const task = tasks[index];

    const li = e.target.closest("li");

    const inputEdit = document.createElement("input");
    inputEdit.type = "text";
    inputEdit.value = task.text;
    inputEdit.classList.add("edit-input");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "✔";
    saveBtn.classList.add("save-btn");

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "✖";
    cancelBtn.classList.add("cancel-btn");

    li.innerHTML = "";
    li.appendChild(inputEdit);
    li.appendChild(saveBtn);
    li.appendChild(cancelBtn);

    inputEdit.focus();

    // SAVE
    saveBtn.addEventListener("click", () => {
      task.text = inputEdit.value.trim() || task.text;
      saveTasks();
      renderTasks();
    });

    // CANCEL
    cancelBtn.addEventListener("click", () => {
      renderTasks();
    });
  }
});

document.querySelectorAll(".filters button").forEach((btn) => {
  btn.classList.remove("active");
});

document.getElementById("filterCompleted").classList.add("active");


function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

// INITIAL LOAD
// INITIAL LOAD

if (tasks.length === 0) {
  loadFakeTasks(); 
} else {
  renderTasks();
  updateProgress();
}
