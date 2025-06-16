const express = require("express");
const app = express();
const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("./config/config.json")[env];

// Override config with environment variables in production
if (env === "production") {
  console.log("DB_PORT environment variable:", process.env.DB_PORT);
  config.username = process.env.DB_USERNAME;
  config.password = process.env.DB_PASSWORD;
  config.database = process.env.DB_NAME;
  config.host = process.env.DB_HOST;
  config.port = 5432; // Hardcoded port for testing
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: false,
  },
);

const { Todo } = require("./models")(sequelize);

const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.set("view engine", "ejs");
//New syntax
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname + "/public")));

app.get("/", async (request, response) => {
  const allTodos = await Todo.getTodos();
  if (request.accepts("html")) {
    response.render("index", { allTodos });
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

  //Todo implement
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
