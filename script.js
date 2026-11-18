let tasksData = {};

const todo = document.querySelector("#to-do");
const progress = document.querySelector("#in-progress");
const done = document.querySelector("#done");

const columns = [todo, progress, done];

let draggedTask = null;
let placeholder = document.createElement("div");

placeholder.classList.add("task-placeholder");

const toggleButton = document.querySelector("#toggle-modal");
const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".modal .bg");
const addTaskBtn = document.querySelector("#add-new-task");


function createTaskElement(title, description) {

    const div = document.createElement("div");
    div.classList.add("task-body");
    div.setAttribute("draggable", "true");

    div.innerHTML = `<h3>${title}</h3>
                     <p>${description}</p>
                     <button class="delete-task">Delete</button>`;

    div.addEventListener("dragstart", () => {
        draggedTask = div;
        setTimeout(() => div.style.display = "none", 0);
    });

    div.addEventListener("dragend", () => {
        div.style.display = "flex";
        placeholder.remove();
        draggedTask = null;
    });

    div.querySelector(".delete-task").addEventListener("click", () => {
        div.remove();
        updateState();
    });

    div.addEventListener("dblclick", () => {

        const titleEl = div.querySelector("h3");
        const descEl = div.querySelector("p");

        const currentTitle = titleEl.innerText;
        const currentDesc = descEl.innerText;

        const titleInput = document.createElement("input");
        const descInput = document.createElement("textarea");

        titleInput.value = currentTitle;
        descInput.value = currentDesc;

        div.setAttribute("draggable", "false");

        titleEl.replaceWith(titleInput);
        descEl.replaceWith(descInput);

        titleInput.focus();
        let saved = false;

        function saveEdit() {

            if (saved) return;
            saved = true;

            const newTitle = titleInput.value.trim();
            const newDesc = descInput.value.trim();

            const newTitleEl = document.createElement("h3");
            const newDescEl = document.createElement("p");

            newTitleEl.innerText = newTitle || currentTitle;
            newDescEl.innerText = newDesc || currentDesc;

            titleInput.replaceWith(newTitleEl);
            descInput.replaceWith(newDescEl);

            div.setAttribute("draggable", "true");
            updateState();
        }

        titleInput.addEventListener("blur", saveEdit);
        descInput.addEventListener("blur", saveEdit);

    });

    return div;
}


function updateState() {

    columns.forEach(column => {

        const tasks = column.querySelectorAll(".task-body");
        const count = column.querySelector(".right-heading");

        tasksData[column.id] = Array.from(tasks).map(task => ({
            title: task.querySelector("h3").innerText,
            description: task.querySelector("p").innerText
        }));

        count.innerText = tasks.length;

    });

    localStorage.setItem("tasks", JSON.stringify(tasksData));

}


function loadTasks() {

    const stored = localStorage.getItem("tasks");
    if (!stored) return;
    const data = JSON.parse(stored);

    for (const columnId in data) {

        const column = document.querySelector(`#${columnId}`);
        data[columnId].forEach(task => {
            const taskElement = createTaskElement(task.title, task.description);
            column.appendChild(taskElement);
        });

    }
    updateState();

}


function addDragEvents(column) {

    column.addEventListener("dragenter", (e) => {
        e.preventDefault();
        column.classList.add("hover-over");
    });

    column.addEventListener("dragleave", () => {
        column.classList.remove("hover-over");
    });

    column.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (!draggedTask) return;
        const afterElement = getDragAfterElement(column, e.clientY);

        if (afterElement == null) {
            column.appendChild(placeholder);
        } else {
            column.insertBefore(placeholder, afterElement);
        }
    });

    column.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!draggedTask) return;
        placeholder.replaceWith(draggedTask);
        column.classList.remove("hover-over");
        updateState();
    });

}
columns.forEach(addDragEvents);


function getDragAfterElement(column, y) {

    const elements = [...column.querySelectorAll(".task-body:not(.dragging)")];

    return elements.reduce((closest, child) => {

        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element;

}

toggleButton.addEventListener("click", () => {
    modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
    modal.classList.remove("active");
});


addTaskBtn.addEventListener("click", () => {

    const title = document.querySelector("#task-title").value.trim();
    const description = document.querySelector("#task-description").value.trim();

    if (!title) {
        alert("Task title required");
        return;
    }

    const taskElement = createTaskElement(title, description);
    todo.appendChild(taskElement);
    document.querySelector("#task-title").value = "";
    document.querySelector("#task-description").value = "";
    modal.classList.remove("active");
    updateState();
});

loadTasks();
