
const $ = (id) => document.getElementById(id);

// NAVEGAÇÃO ENTRE AS TELAS
function openScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-screen]").forEach((button) => {
  button.addEventListener("click", () => {
    openScreen(button.dataset.screen);
  });
});

// SALVAMENTO LOCAL
function loadData(key) {
  try {
    return JSON.parse(localStorage.getItem("studyflow_" + key)) ?? [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem("studyflow_" + key, JSON.stringify(data));
}

let tasks = loadData("tasks");
let schedule = loadData("schedule");
let notes = loadData("notes");
let reminders = loadData("reminders");

// CRIAR ELEMENTOS DE TEXTO COM SEGURANÇA
function createText(tag, text, className = "") {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function createDeleteButton(onDelete) {
  const button = createText("button", "Excluir", "delete-btn");
  button.type = "button";
  button.addEventListener("click", onDelete);
  return button;
}

function showEmpty(list, message) {
  list.appendChild(createText("p", message, "empty-message"));
}

// TAREFAS
function renderTasks() {
  const list = $("taskList");
  list.replaceChildren();

  if (tasks.length === 0) {
    showEmpty(list, "Você ainda não adicionou tarefas.");
  }

  tasks.forEach((task) => {
    const row = document.createElement("div");
    row.className = "list-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Concluir " + task.title);

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveData("tasks", tasks);
      renderTasks();
      renderProgress();
    });

    const title = createText("span", task.title);

    row.append(checkbox, title);
    row.appendChild(createDeleteButton(() => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveData("tasks", tasks);
      renderTasks();
      renderProgress();
    }));

    list.appendChild(row);
  });

  renderProgress();
}

$("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const title = $("taskInput").value.trim();
  if (!title) return;

  tasks.push({
    id: crypto.randomUUID(),
    title,
    done: false
  });

  saveData("tasks", tasks);
  $("taskInput").value = "";
  renderTasks();
});

// PROGRESSO
function renderProgress() {
  const completed = tasks.filter((task) => task.done).length;
  const percent = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  $("progressPercent").textContent = percent + "%";
  $("progressRing").style.background =
    `conic-gradient(var(--blue) 0%, var(--purple) ${percent}%, #292e58 ${percent}%)`;

  $("progressSummary").textContent =
    percent === 100 && tasks.length
      ? "Parabéns! Você concluiu tudo!"
      : percent > 0
        ? "Você está evoluindo!"
        : "Você está começando!";

  $("progressDetail").textContent =
    `${completed} de ${tasks.length} tarefas concluídas.`;
}

// CRONOGRAMA
function renderSchedule() {
  const list = $("scheduleList");
  list.replaceChildren();

  const sorted = [...schedule].sort((a, b) =>
    a.day.localeCompare(b.day, "pt-BR") ||
    a.time.localeCompare(b.time)
  );

  if (sorted.length === 0) {
    showEmpty(list, "Adicione suas matérias e horários.");
  }

  sorted.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "list-item";

    const text = document.createElement("span");
    text.appendChild(createText("strong", entry.subject));
    text.appendChild(createText("small", `${entry.day} · ${entry.time}`));

    row.appendChild(text);
    row.appendChild(createDeleteButton(() => {
      schedule = schedule.filter((item) => item.id !== entry.id);
      saveData("schedule", schedule);
      renderSchedule();
    }));

    list.appendChild(row);
  });
}

$("scheduleForm").addEventListener("submit", (event) => {
  event.preventDefault();

  schedule.push({
    id: crypto.randomUUID(),
    subject: $("subjectInput").value.trim(),
    day: $("dayInput").value,
    time: $("timeInput").value
  });

  saveData("schedule", schedule);
  $("scheduleForm").reset();
  renderSchedule();
});

// ANOTAÇÕES
function renderNotes() {
  const list = $("noteList");
  list.replaceChildren();

  if (!notes.length) {
    showEmpty(list, "Suas anotações aparecerão aqui.");
  }

  notes.forEach((note) => {
    const row = document.createElement("div");
    row.className = "list-item";

    const text = document.createElement("span");
    text.appendChild(createText("strong", note.title));
    text.appendChild(createText("small", note.content));

    row.appendChild(text);
    row.appendChild(createDeleteButton(() => {
      notes = notes.filter((item) => item.id !== note.id);
      saveData("notes", notes);
      renderNotes();
    }));

    list.appendChild(row);
  });
}

$("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();

  notes.unshift({
    id: crypto.randomUUID(),
    title: $("noteTitle").value.trim(),
    content: $("noteContent").value.trim()
  });

  saveData("notes", notes);
  $("noteForm").reset();
  renderNotes();
});

// LEMBRETES
function renderReminders() {
  const list = $("reminderList");
  list.replaceChildren();

  if (!reminders.length) {
    showEmpty(list, "Você ainda não tem lembretes.");
  }

  [...reminders]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((reminder) => {
      const row = document.createElement("div");
      row.className = "list-item";

      const [year, month, day] = reminder.date.split("-");
      const text = document.createElement("span");

      text.appendChild(createText("strong", reminder.title));
      text.appendChild(createText("small", `${day}/${month}/${year}`));

      row.appendChild(text);
      row.appendChild(createDeleteButton(() => {
        reminders = reminders.filter((item) => item.id !== reminder.id);
        saveData("reminders", reminders);
        renderReminders();
      }));

      list.appendChild(row);
    });
}

$("reminderForm").addEventListener("submit", (event) => {
  event.preventDefault();

  reminders.push({
    id: crypto.randomUUID(),
    title: $("reminderInput").value.trim(),
    date: $("reminderDate").value
  });

  saveData("reminders", reminders);
  $("reminderForm").reset();
  renderReminders();
});

// TEMPORIZADOR
let secondsLeft = 25 * 60;
let timerId = null;

function renderTimer() {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  $("timerDisplay").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  if (timerId !== null) return;

  if (secondsLeft <= 0) {
    secondsLeft = 25 * 60;
  }

  $("startTimer").textContent = "Ⅱ Pausar";
  $("timerStatus").textContent = "Concentre-se nos seus estudos!";

  timerId = setInterval(() => {
    secondsLeft--;
    renderTimer();

    if (secondsLeft <= 0) {
      stopTimer();
      $("startTimer").textContent = "▶ Iniciar";
      $("timerStatus").textContent = "Sessão concluída. Parabéns!";
      alert("Parabéns! Você concluiu sua sessão de estudos.");
    }
  }, 1000);
}

$("startTimer").addEventListener("click", () => {
  if (timerId !== null) {
    stopTimer();
    $("startTimer").textContent = "▶ Continuar";
    $("timerStatus").textContent = "Temporizador pausado.";
  } else {
    startTimer();
  }
});

$("resetTimer").addEventListener("click", () => {
  stopTimer();
  secondsLeft = 25 * 60;
  renderTimer();
  $("startTimer").textContent = "▶ Iniciar";
  $("timerStatus").textContent = "Pronto para começar?";
});

document.querySelectorAll("[data-minutes]").forEach((button) => {
  button.addEventListener("click", () => {
    stopTimer();
    secondsLeft = Number(button.dataset.minutes) * 60;
    renderTimer();
    $("startTimer").textContent = "▶ Iniciar";
    $("timerStatus").textContent = "Pronto para começar?";
  });
});

// INICIALIZAÇÃO
renderTasks();
renderSchedule();
renderNotes();
renderReminders();
renderProgress();
renderTimer();
