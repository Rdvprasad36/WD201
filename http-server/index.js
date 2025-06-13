document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const entriesTableBody = document.querySelector('#entriesTable tbody');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const dob = document.getElementById('dob').value;
        const terms = document.getElementById('terms').checked;

        if (!terms) {
            alert('You must accept the terms and conditions.');
            return;
        }

        const newRow = document.createElement('tr');

        newRow.innerHTML = `
            <td>${name}</td>
            <td>${email}</td>
            <td>${password}</td>
            <td>${dob}</td>
            <td>${terms ? 'Yes' : 'No'}</td>
        `;

        entriesTableBody.appendChild(newRow);

        form.reset();
    });
});
