const http = require("http");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const port = args.port || 3000;

let homeContent = "";
let projectContent = "";
let registrationContent = "";
let stylesContent = "";
let clientScriptContent = "";

fs.readFile(path.join(__dirname, "home.html"), (err, data) => {
  if (err) throw err;
  homeContent = data;
});

fs.readFile(path.join(__dirname, "project.html"), (err, data) => {
  if (err) throw err;
  projectContent = data;
});

fs.readFile(path.join(__dirname, "registration.html"), (err, data) => {
  if (err) throw err;
  registrationContent = data;
});

fs.readFile(path.join(__dirname, "styles.css"), (err, data) => {
  if (err) throw err;
  stylesContent = data;
});

fs.readFile(path.join(__dirname, "index.js"), (err, data) => {
  if (err) throw err;
  clientScriptContent = data;
});

const server = http.createServer((req, res) => {
  let url = req.url;
  res.writeHead(200, { "Content-Type": "text/html" });

  switch (url) {
    case "/":
    case "/home":
    case "/home.html":
      res.end(homeContent);
      break;
    case "/project":
    case "/project.html":
      res.end(projectContent);
      break;
    case "/registration":
      res.end(registrationContent);
      break;
    case "/styles.css":
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(stylesContent);
      break;
    case "/index.js":
      res.writeHead(200, { "Content-Type": "application/javascript" });
      res.end(clientScriptContent);
      break;
    default:
      res.statusCode = 404;
      res.end("404 Not Found");
      break;
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
