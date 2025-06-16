document.addEventListener("DOMContentLoaded", () => {
  // Handle delete todo
  window.deleteTodo = async function(id) {
    if (!confirm("Are you sure you want to delete this todo?")) return;
    try {
      const response = await fetch(`/todos/${id}`, { method: "DELETE" });
      if (response.ok) {
        // Remove the todo item from the DOM
        const todoElement = document.querySelector(`[data-todo-id='${id}']`);
        if (todoElement) {
          todoElement.remove();
          updateCounts();
        }
      } else {
        alert("Failed to delete todo");
      }
    } catch (error) {
      alert("Error deleting todo");
    }
  };

  // Handle mark as completed
  window.toggleCompleted = async function(id, checkbox) {
    try {
      const response = await fetch(`/todos/${id}/markAsCompleted`, { method: "PUT" });
      if (!response.ok) {
        alert("Failed to update todo");
        checkbox.checked = !checkbox.checked; // revert
      }
    } catch (error) {
      alert("Error updating todo");
      checkbox.checked = !checkbox.checked; // revert
    }
  };

  // Handle add todo form submission
  const form = document.getElementById("add-todo-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const title = formData.get("title").trim();
    const dueDate = formData.get("dueDate");

    if (!title || !dueDate) {
      alert("Please enter a title and due date.");
      return;
    }

    try {
      const response = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate }),
      });
      if (response.ok) {
        const newTodo = await response.json();
        addTodoToDOM(newTodo);
        form.reset();
      } else {
        alert("Failed to add todo");
      }
    } catch (error) {
      alert("Error adding todo");
    }
  });

  // Add new todo item to the correct section in the DOM
  function addTodoToDOM(todo) {
    const today = new Date().toISOString().slice(0, 10);
    let sectionId, prefix;

    if (todo.dueDate < today) {
      sectionId = "count-overdue";
      prefix = "";
    } else if (todo.dueDate === today) {
      sectionId = "count-due-today";
      prefix = "today-";
    } else {
      sectionId = "count-due-later";
      prefix = "later-";
    }

    const countSpan = document.getElementById(sectionId);
    let count = parseInt(countSpan.textContent, 10);
    countSpan.textContent = count + 1;

    const ul = countSpan.closest("div").querySelector("ul");
    // Remove "No todos" message if present
    const noTodosLi = ul.querySelector("li.text-gray-500");
    if (noTodosLi) {
      noTodosLi.remove();
    }

    const li = document.createElement("li");
    li.setAttribute("data-todo-id", todo.id);
    li.className = "flex items-center space-x-2 p-2 rounded hover:bg-purple-50 group relative";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `todo-checkbox-${prefix}${count}`;
    checkbox.className = "w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500";
    checkbox.onchange = () => toggleCompleted(todo.id, checkbox);

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.className = "ml-2 text-sm text-gray-600 cursor-pointer";
    label.textContent = todo.title;

    const button = document.createElement("button");
    button.type = "button";
    button.title = "Delete";
    button.className = "ml-2 delete-bin-icon opacity-0 group-hover:opacity-100 transition absolute right-2 top-2 cursor-pointer text-gray-400 hover:text-red-600";
    button.onclick = () => deleteTodo(todo.id);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(button);

    ul.appendChild(li);
  }

  // Update counts after deletion
  function updateCounts() {
    ["count-overdue", "count-due-today", "count-due-later"].forEach((id) => {
      const countSpan = document.getElementById(id);
      const ul = countSpan.closest("div").querySelector("ul");
      const todosCount = ul.querySelectorAll("li[data-todo-id]").length;
      countSpan.textContent = todosCount;
      if (todosCount === 0) {
        const label = countSpan.closest("div").querySelector("h5").textContent.toLowerCase();
        const li = document.createElement("li");
        li.className = "text-gray-500";
        li.textContent = `No ${label} todos`;
        ul.appendChild(li);
      }
    });
  }
});
