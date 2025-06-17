const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const { Todo, User, sequelize } = require("./models");
const path = require("path");
const bodyParser = require("body-parser");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: false,
}));

app.use(flash());

app.use(csrf({ cookie: true }));

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.currentUser = req.session.user || null;
  next();
});

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
  if (!request.session.user) {
    return response.redirect("/login");
  }
  const allTodos = await Todo.getTodos(request.session.user.id);
  if (request.accepts("html")) {
    response.render("index", { allTodos, csrfToken: request.csrfToken() });
  } else {
    response.json(allTodos);
  }
});

// Signup routes
app.get("/signup", (req, res) => {
  res.render("signup", { csrfToken: req.csrfToken() });
});

app.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !email || !password) {
    req.flash("error", "First name, email, and password are required.");
    return res.render("signup", {
      csrfToken: req.csrfToken(),
      messages: req.flash(),
      first_name,
      last_name,
      email,
    });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      req.flash("error", "Email already registered.");
      return res.render("signup", {
        csrfToken: req.csrfToken(),
        messages: req.flash(),
        first_name,
        last_name,
        email,
      });
    }
    const bcrypt = require("bcrypt");
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ first_name, last_name, email, password_hash });
    await req.session.save(); // Ensure session is saved before redirect
    req.session.user = { id: user.id, first_name: user.first_name, email: user.email };
    res.redirect("/");
  } catch (error) {
    console.error("Signup error:", error);
    console.error(error.stack);
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message);
      req.flash('error', messages);
    } else {
      req.flash("error", "Error creating user.");
    }
    return res.render("signup", {
      csrfToken: req.csrfToken(),
      messages: req.flash(),
      first_name,
      last_name,
      email,
    });
  }
});

// Login routes
app.get("/login", (req, res) => {
  res.render("login", { csrfToken: req.csrfToken() });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email and password are required.");
    return res.redirect("/login");
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    const bcrypt = require("bcrypt");
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    req.session.user = { id: user.id, first_name: user.first_name, email: user.email };
    await req.session.save(); // Ensure session is saved before redirect
    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Error logging in.");
    res.redirect("/login");
  }
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
app.get("/todos", async (request, response) => {
  if (!request.session.user) {
    return response.status(401).send("Unauthorized");
  }
  console.log("We have to fetch all the todos");
  try {
    const alltodos = await Todo.findAll({ where: { userId: request.session.user.id } });
    return response.send(alltodos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (request, response) => {
  if (!request.session.user) {
    return response.status(401).send("Unauthorized");
  }
  console.log("Creating a todo", request.body);

  if (!request.body.title || !request.body.dueDate) {
    request.flash("error", "Title and due date are required");
    return response.redirect("/");
  }

  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.session.user.id
    });
    // Redirect to home page after creation
    return response.redirect('/');
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

app.put("/todos/:id", async (request, response) => {
  if (!request.session.user) {
    return response.status(401).send("Unauthorized");
  }
  console.log("We have to update a todo with ID: ", request.params.id);
  const todo = await Todo.findOne({ where: { id: request.params.id, userId: request.session.user.id } });
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
  if (!request.session.user) {
    return response.status(401).send("Unauthorized");
  }
  console.log("We have to delete a todo with ID: ", request.params.id);
  try {
    const dltTodo = await Todo.destroy({ where: { id: request.params.id, userId: request.session.user.id } });
    response.send(dltTodo ? true : false);
  } catch (error) {
    console.log(error);
    return response.status(422).json();
  }
});

module.exports = app;
