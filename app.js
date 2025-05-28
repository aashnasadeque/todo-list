let categories = [];
let tasks = [];

const categorySelect = document.getElementById("categorySelect");
const categoryList = document.getElementById("categoryList");
const taskContainer = document.getElementById("taskContainer");

function addCategory(e) {
  e.preventDefault();
  const name = document.getElementById("newCategoryName").value.trim();
  const color = document.getElementById("newCategoryColor").value;
  if (!name) return;

  const id = `cat-${Date.now()}`;
  categories.push({ id, name, color });
  document.getElementById("newCategoryName").value = "";
  saveData();
  updateCategoryUI();
  renderTasks();
}

function updateCategoryUI() {
  categorySelect.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  categoryList.innerHTML = "";
  categories.forEach((cat) => {
    const li = document.createElement("li");

    const nameInput = document.createElement("input");
    nameInput.value = cat.name;
    nameInput.oninput = () => {
      cat.name = nameInput.value.trim();
      saveData();
      updateCategoryUI();
      renderTasks();
    };

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = cat.color;
    colorInput.oninput = () => {
      cat.color = colorInput.value;
      saveData();
      updateCategoryUI();
      renderTasks();
    };

    const del = document.createElement("button");
    del.textContent = "🗑";
    del.onclick = () => {
      categories = categories.filter((c) => c.id !== cat.id);
      tasks = tasks.filter((t) => t.categoryId !== cat.id);
      saveData();
      updateCategoryUI();
      renderTasks();
    };

    li.appendChild(colorInput);
    li.appendChild(nameInput);
    li.appendChild(del);
    categoryList.appendChild(li);
  });

  renderCategorySections();
}

function renderCategorySections() {
  taskContainer.innerHTML = "";
  categories.forEach((cat) => {
    const section = document.createElement("div");
    section.className = "category-section";
    section.id = `section-${cat.id}`;

    const title = document.createElement("h2");
    title.textContent = cat.name;
    title.style.backgroundColor = cat.color;
    title.onclick = () => section.classList.toggle("collapsed");

    const list = document.createElement("div");
    list.className = "task-list";

    section.appendChild(title);
    section.appendChild(list);
    taskContainer.appendChild(section);
  });
}

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const categoryId = categorySelect.value;
  const date = document.getElementById("taskDate").value;
  const time = document.getElementById("taskTime").value;
  const recurrenceEl = document.getElementById("recurrenceSelect");
  const recurrence = recurrenceEl ? recurrenceEl.value : "none";

  if (!text || !categoryId) return;

  tasks.push({
    id: Date.now(),
    text,
    categoryId,
    date,
    time,
    recurrence,
    done: false,
  });

  saveData();
  renderTasks();

  document.getElementById("taskInput").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("recurrenceSelect").value = "none";
}

function renderTasks() {
  document
    .querySelectorAll(".task-list")
    .forEach((list) => (list.innerHTML = ""));

  categories.forEach((cat) => {
    const section = document.getElementById(`section-${cat.id}`);
    if (!section) return;

    const list = section.querySelector(".task-list");

    const catTasks = tasks
      .filter((t) => t.categoryId === cat.id)
      .sort((a, b) => a.done - b.done || compareDateTime(a, b));

    catTasks.forEach((task) => {
      const taskEl = document.createElement("div");
      taskEl.className = "task";
      if (task.done) taskEl.classList.add("done");

      const content = document.createElement("div");
      content.className = "text";

      let dateTime = "";
      if (task.date || task.time) {
        const dateStr = task.date
          ? new Date(task.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";
        const timeStr = task.time
          ? new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : "";
        const dot = task.date && task.time ? " • " : "";
        const recur =
          task.recurrence && task.recurrence !== "none"
            ? `<br><small>🔁 ${task.recurrence}</small>`
            : "";
        dateTime = `<small>📅 ${dateStr}${dot}${timeStr}</small>${recur}`;
      }

      content.innerHTML = `<strong>${task.text}</strong> — <span style="color:${cat.color};">${cat.name}</span>${dateTime}`;

      const buttons = document.createElement("div");
      buttons.className = "buttons";

      const doneBtn = document.createElement("button");
      doneBtn.textContent = "✓";
      doneBtn.onclick = () => {
        task.done = !task.done;
        saveData();
        renderTasks();
      };

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑";
      delBtn.onclick = () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveData();
        renderTasks();
      };

      buttons.appendChild(doneBtn);
      buttons.appendChild(delBtn);

      taskEl.appendChild(content);
      taskEl.appendChild(buttons);

      list.appendChild(taskEl);
    });
  });
}

function compareDateTime(a, b) {
  const aDate = new Date(`${a.date || "9999-12-31"}T${a.time || "23:59"}`);
  const bDate = new Date(`${b.date || "9999-12-31"}T${b.time || "23:59"}`);
  return aDate - bDate;
}

function saveData() {
  localStorage.setItem("todo_categories", JSON.stringify(categories));
  localStorage.setItem("todo_tasks", JSON.stringify(tasks));
}

function loadData() {
  const catData = localStorage.getItem("todo_categories");
  const taskData = localStorage.getItem("todo_tasks");

  if (catData && JSON.parse(catData).length > 0) {
    categories = JSON.parse(catData);
  } else {
    categories = [
      { id: "cat1", name: "Fitness", color: "#e74c3c" },
      { id: "cat2", name: "School", color: "#2980b9" },
      { id: "cat3", name: "Work", color: "#27ae60" },
      { id: "cat4", name: "Home", color: "#8e44ad" },
      { id: "cat5", name: "Appointments", color: "#d35400" },
      { id: "cat6", name: "Shopping", color: "#f39c12" },
      { id: "cat7", name: "Errands", color: "#2c3e50" },
    ];
  }

  if (taskData) tasks = JSON.parse(taskData);
}

// DARK MODE
const toggleBtn = document.getElementById("toggleTheme");

toggleBtn.onclick = () => {
  const isDark = document.body.classList.toggle("dark");
  toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("todo_theme", isDark ? "dark" : "light");
};

function loadTheme() {
  const saved = localStorage.getItem("todo_theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️ Light Mode";
  }
}

// COLLAPSIBLE SIDEBAR
const toggleSidebarBtn = document.getElementById("toggleSidebar");

toggleSidebarBtn.onclick = () => {
  document.body.classList.toggle("collapsed");
  const collapsed = document.body.classList.contains("collapsed");
  localStorage.setItem("sidebar_collapsed", collapsed ? "true" : "false");
  toggleSidebarBtn.textContent = collapsed ? "» Expand" : "« Collapse";
};

function loadSidebarState() {
  const collapsed = localStorage.getItem("sidebar_collapsed") === "true";
  if (collapsed) {
    document.body.classList.add("collapsed");
    toggleSidebarBtn.textContent = "» Expand";
  }
}

loadData();
updateCategoryUI();
renderTasks();
loadTheme();
loadSidebarState();
