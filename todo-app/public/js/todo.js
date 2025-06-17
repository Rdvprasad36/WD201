document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-todo-form');

  // Client-side validation for new todo form
  form.addEventListener('submit', (e) => {
    const title = document.getElementById('new-todo-title').value.trim();
    const dueDate = document.getElementById('new-todo-duedate').value.trim();
    if (!title) {
      e.preventDefault();
      alert('Title cannot be empty');
      return false;
    }
    if (!dueDate) {
      e.preventDefault();
      alert('Due date cannot be empty');
      return false;
    }
  });

  // Event delegation for checkbox change and delete button click
  document.body.addEventListener('change', async (e) => {
    if (e.target.classList.contains('complete-checkbox')) {
      const todoItem = e.target.closest('.Todo-Item');
      const todoId = todoItem.getAttribute('data-id');
      const completed = e.target.checked;

      try {
        const csrfToken = document.querySelector('input[name="_csrf"]').value;
        const response = await fetch('/todos/' + todoId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },
          body: JSON.stringify({ completed: completed.toString(), _csrf: csrfToken })
        });
      if (!response.ok) {
        alert('Failed to update todo');
        e.target.checked = !completed; // revert checkbox
      } else {
        // Reload page to reflect changes
        location.reload();
      }
      } catch (error) {
        alert('Error updating todo');
        e.target.checked = !completed; // revert checkbox
      }
    }
  });

  document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const todoItem = e.target.closest('.Todo-Item');
      const todoId = todoItem.getAttribute('data-id');

      // Removed confirmation prompt to delete immediately
      try {
        const csrfToken = document.querySelector('input[name="_csrf"]').value;
        const response = await fetch('/todos/' + todoId, {
          method: 'DELETE',
          headers: {
            'CSRF-Token': csrfToken
          }
        });
      if (!response.ok) {
          alert('Failed to delete todo');
        } else {
          // Reload page to reflect changes
          location.reload();
        }
      } catch (error) {
        alert('Error deleting todo');
      }
    }
  });
});
