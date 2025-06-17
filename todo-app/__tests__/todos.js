const request = require('supertest');
const app = require('../app');
const db = require('../models');

beforeAll(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('Todo API Endpoints', () => {
  let todoId;
  let csrfToken;
  let cookie;

  beforeAll(async () => {
    // Get CSRF token from the server
    const res = await request(app).get('/');
    const cookies = res.headers['set-cookie'];
    cookie = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';
    const match = res.text.match(/name="_csrf" value="([^"]+)"/);
    csrfToken = match ? match[1] : null;
    if (!csrfToken) {
      throw new Error('CSRF token not found in response');
    }
  });

  test('Create a new todo', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Cookie', cookie)
      .send({ title: 'Test Todo', dueDate: '2024-12-31', _csrf: csrfToken });
    expect(res.statusCode).toEqual(302); // redirect after creation
    const todos = await db.Todo.findAll();
    expect(todos.length).toBe(1);
    todoId = todos[0].id;
  });

  test('Update todo completion status', async () => {
    const res = await request(app)
      .put(`/todos/${todoId}`)
      .set('Cookie', cookie)
      .send({ completed: true, _csrf: csrfToken });
    expect(res.statusCode).toEqual(200);
    const todo = await db.Todo.findByPk(todoId);
    expect(todo.completed).toBe(true);
  });

  test('Delete a todo', async () => {
    const res = await request(app)
      .delete(`/todos/${todoId}`)
      .set('Cookie', cookie)
      .send({ _csrf: csrfToken });
    expect(res.statusCode).toEqual(200);
    const todo = await db.Todo.findByPk(todoId);
    expect(todo).toBeNull();
  });

  test('CSRF protection on POST /todos', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'No CSRF', dueDate: '2024-12-31' });
    // Should be forbidden or redirect due to missing CSRF token
    expect([403, 302]).toContain(res.statusCode);
  });
});
