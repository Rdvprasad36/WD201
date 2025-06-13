const http = require("http");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const args = minimist(process.argv.slice(2));
const port = args.port || 3000;

const homeContent = fs.readFileSync(path.join(__dirname, "home.html"));
const projectContent = fs.readFileSync(path.join(__dirname, "project.html"));
const registrationContent = fs.readFileSync(path.join(__dirname, "registration.html"));
const stylesContent = fs.readFileSync(path.join(__dirname, "styles.css"));
const clientScriptContent = fs.readFileSync(path.join(__dirname, "index.js"));

const server = http.createServer((req, res) => {
  let url = req.url;
  switch (url) {
    case "/":
    case "/home":
    case "/home.html":
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(homeContent);
      break;
    case "/project":
    case "/project.html":
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(projectContent);
      break;
    case "/registration":
    case "/registration.html":
      res.writeHead(200, { "Content-Type": "text/html" });
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
