const express = require("express");
const app = express();
const { Todo, sequelize } = require("./models");
const path = require("path");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.set("view engine", "ejs");
//New syntax
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname + "/public")));

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", { allTodos, csrfToken: request.csrfToken() });
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

  if (!request.body.title || !request.body.dueDate) {
    return response.status(400).send("Title and due date are required");
  }

  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
    });
    // Redirect to home page after creation
    return response.redirect('/');
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

app.put("/todos/:id", async (request, response) => {
  console.log("We have to update a todo with ID: ", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  if (todo) {
    try {
      // Convert completed to boolean properly
      const completed = request.body.completed === true || request.body.completed === "true";
      await todo.setCompletionStatus(completed);
      return response.json(todo);
    } catch (error) {
      console.log(error);
      return response.status(422).json();
    }
  } else {
    return response.status(404).json();
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
