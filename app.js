//SPA
const links = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const target = link.getAttribute("data-page");
    const nextPage = document.getElementById(target);

    pages.forEach((page) => {
      page.classList.remove("active");
    });

    nextPage.classList.add("active");
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

const filterCompletedBtn = document.getElementById("filterCompleted");

if (filterCompletedBtn) {
  filterCompletedBtn.classList.add("active");
}

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

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
  const savedTheme = localStorage.getItem("theme") || "dark";

  document.body.classList.remove("dark", "light");
  document.body.classList.add(savedTheme);

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");

    document.body.classList.toggle("dark", !isDark);
    document.body.classList.toggle("light", isDark);

    localStorage.setItem("theme", isDark ? "light" : "dark");
  });
}

const startBtn = document.getElementById("startLearningBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    document.querySelector('[data-page="learning"]').click();
  });
}

const dashboardBtn = document.getElementById("goDashboardBtn");
if (dashboardBtn) {
  dashboardBtn.addEventListener("click", () => {
    document.querySelector('[data-page="dashboard"]').click();
  });
}

const loadUserBtn = document.getElementById("loadUserBtn");

const userImg = document.getElementById("userImg");
const userName = document.getElementById("userName");
const userLocation = document.getElementById("userLocation");
const userEmail = document.getElementById("userEmail");

if (loadUserBtn) {
  loadUserBtn.addEventListener("click", async () => {
    userName.textContent = "Loading...";

    try {
      const res = await fetch("https://randomuser.me/api/");
      const data = await res.json();

      const user = data.results[0];

      userImg.src = user.picture.large;
      userName.textContent = `${user.name.first} ${user.name.last}`;
      userLocation.textContent = `${user.location.country}`;
      userEmail.textContent = user.email;
    } catch (err) {
      userName.textContent = "Failed to load user";
    }
  });
}

const weatherBtn = document.getElementById("getWeatherBtn");

const weatherCity = document.getElementById("weatherCity");
const weatherTemp = document.getElementById("weatherTemp");
const weatherDesc = document.getElementById("weatherDesc");

if (weatherBtn) {
  weatherBtn.addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value;

    if (!city) {
      weatherCity.textContent = "Please enter a city!";
      return;
    }

    weatherCity.textContent = "Loading...";
    weatherTemp.textContent = "";
    weatherDesc.textContent = "";

    try {
      const res = await fetch(`https://wttr.in/${city}?format=j1`);
      const data = await res.json();

      const current = data.current_condition[0];

      weatherCity.textContent = `📍 ${city}`;
      weatherTemp.textContent = `🌡️ ${current.temp_C}°C`;
      weatherDesc.textContent = `🌥️ ${current.weatherDesc[0].value}`;
    } catch (error) {
      weatherCity.textContent = "Failed to load weather.";
    }
  });
}

const ctaBtn = document.getElementById("ctaStart");

if (ctaBtn) {
  ctaBtn.addEventListener("click", () => {
    document.querySelector('[data-page="dashboard"]').click();
  });
}

// INITIAL LOAD

if (tasks.length === 0) {
  loadFakeTasks();
} else {
  renderTasks();
  updateProgress();
}

const courses = [
  {
    id: 1,
    title: "JavaScript Basics",
    category: "frontend",
    level: "Beginner",
    duration: "4h",
  },
  {
    id: 2,
    title: "React Advanced",
    category: "frontend",
    level: "Advanced",
    duration: "8h",
  },
  {
    id: 3,
    title: "Node.js API",
    category: "backend",
    level: "Intermediate",
    duration: "6h",
  },
  {
    id: 4,
    title: "MongoDB",
    category: "backend",
    level: "Beginner",
    duration: "3h",
  },
  {
    id: 5,
    title: "Docker Essentials",
    category: "devops",
    level: "Intermediate",
    duration: "5h",
  },
  {
    id: 6,
    title: "Kubernetes Intro",
    category: "devops",
    level: "Advanced",
    duration: "7h",
  },
  {
    id: 7,
    title: "Micro Frontends Architecture",
    category: "frontend",
    level: "Advanced",
    duration: "10h",
  },
  {
    id: 8,
    title: "Web Animations with GSAP",
    category: "frontend",
    level: "Advanced",
    duration: "9h",
  },
  {
    id: 9,
    title: "TypeScript Mastery",
    category: "frontend",
    level: "Advanced",
    duration: "7h",
  },
  {
    id: 10,
    title: "Frontend Performance Optimization",
    category: "frontend",
    level: "Advanced",
    duration: "6h",
  },
];
let courseFilter = "all";
const cardsContainer = document.getElementById("cardsContainer");
const searchInput = document.getElementById("searchInput");
const emptyCourses = document.getElementById("emptyCourses");
const modal = document.getElementById("courseModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalLevel = document.getElementById("modalLevel");
const modalCategory = document.getElementById("modalCategory");
const modalDuration = document.getElementById("modalDuration");

function showSkeleton() {
  const skeleton = document.getElementById("skeleton");

  if (!skeleton) return;

  skeleton.innerHTML = "";

  for (let i = 0; i < 4; i++) {
    const div = document.createElement("div");
    div.classList.add("skeleton-card");
    skeleton.appendChild(div);
  }
}

function hideSkeleton() {
  const skeleton = document.getElementById("skeleton");
  if (skeleton) {
    skeleton.innerHTML = "";
  }
}
function renderCourses() {
  if (!cardsContainer || !searchInput) return;

  cardsContainer.innerHTML = "";

  showSkeleton();

  setTimeout(() => {
    hideSkeleton();

    let filtered = courses.filter((course) => {
      const matchCategory =
        courseFilter === "all" || course.category === courseFilter;

      const matchSearch = course.title
        .toLowerCase()
        .includes(searchInput.value.toLowerCase());

      return matchCategory && matchSearch;
    });

    if (emptyCourses) {
      emptyCourses.style.display = filtered.length === 0 ? "block" : "none";
    }

    filtered.forEach((course) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${course.title}</h3>
        <div class="course-meta">
          <span>${course.level}</span>
          <span>⏱ ${course.duration}</span>
        </div>
        <span class="tag">${course.category}</span>
      `;

      card.addEventListener("click", () => {
        if (!modal) return;

        modal.style.display = "flex";

        modalTitle.textContent = course.title;
        modalLevel.textContent = "Level: " + course.level;
        modalCategory.textContent = "Category: " + course.category;
        modalDuration.textContent = "Duration: " + course.duration;
      });

      cardsContainer.appendChild(card);
    });
  }, 600);
}

if (closeModal) {
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

const filterBtns = document.querySelectorAll(".filter-buttons button");

if (filterBtns.length > 0) {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-buttons button")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");

      courseFilter = btn.dataset.filter;

      renderCourses();
    });
  });
}

if (searchInput) {
  searchInput.addEventListener("input", renderCourses);
}

if (cardsContainer) {
  renderCourses();
}
