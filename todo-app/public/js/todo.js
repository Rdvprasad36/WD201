document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-todo-form");
  const titleInput = document.getElementById("new-todo-title");
  const dueDateInput = document.getElementById("new-todo-duedate");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    const dueDate = dueDateInput.value;

    if (!title || !dueDate) return;

    try {
      const response = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate: dueDate }),
      });
      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to add todo");
      }
    } catch (error) {
      alert("Error adding todo");
    }
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const li = e.target.closest("li.todo-item");
      const id = li.getAttribute("data-id");
      if (!id) return;

      if (!confirm("Are you sure you want to delete this todo?")) return;

      try {
        const response = await fetch(`/todos/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          li.remove();
        } else {
          alert("Failed to delete todo");
        }
      } catch (error) {
        alert("Error deleting todo");
      }
    });
  });

  document.querySelectorAll(".complete-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const li = e.target.closest("li.todo-item");
      const id = li.getAttribute("data-id");
      if (!id) return;

      try {
        const response = await fetch(`/todos/${id}/markAsCompleted`, {
          method: "PUT",
        });
        if (response.ok) {
          window.location.reload();
        } else {
          alert("Failed to update todo");
        }
      } catch (error) {
        alert("Error updating todo");
      }
    });
  });
});
