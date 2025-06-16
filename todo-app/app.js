const express = require("express");
const app = express();
const { Todo } = require("./models");
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  // Fetch todos and categorize them
  const allTodos = await Todo.getTodos();

  // Categorize todos into overdue, dueToday, dueLater
  const today = new Date().toISOString().slice(0, 10);

  const overdueTodos = allTodos.filter(todo => todo.dueDate < today && !todo.completed);
  const dueTodayTodos = allTodos.filter(todo => todo.dueDate === today && !todo.completed);
  const dueLaterTodos = allTodos.filter(todo => todo.dueDate > today && !todo.completed);

  if (request.accepts("html")) {
    response.render("index", { overdueTodos, dueTodayTodos, dueLaterTodos });
  } else {
    response.json(allTodos);
  }
});

app.get("/todos", async (_request, response) => {
  console.log("We have to fetch all the todos");
  try {
    const alltodos = await Todo.findAll();
    return response.send(alltodos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);

  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("We have to update a todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updateTodoToCompleted = await todo.markAsCompleted();
    return response.json(updateTodoToCompleted);
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("We have to delete a todo with ID: ", request.params.id);
  try {
    const dltTodo = await Todo.destroy({ where: { id: request.params.id } });
    response.send(dltTodo ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

module.exports = app;
