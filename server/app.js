const express = require("express");
const http = require("http");
const { initializeAPI } = require("./api");
const { rateLimit } = require("express-rate-limit");
const pino = require('pino-http')(); // Hier verwenden wir pino-http zur Protokollierung
const jwt = require('jsonwebtoken');

// Create the express server
const app = express();
app.disable('x-powered-by'); // Verbergen des Back-End-Frameworks -----------

app.use(pino); // Middleware für die Protokollierung
app.use(express.json());

const limiter = rateLimit({  // Zeit und Limit für Rate Limiting ---------
  windowMs: 60 * 1000, // 1 Minute
  limit: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
const server = http.createServer(app);

// deliver static files from the client folder like css, js, images
app.use(express.static("client"));
// route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client/index.html");
});

// Initialize the REST api
initializeAPI(app);

//start the web server
const serverPort = process.env.PORT || 3000;
server.listen(serverPort, () => {
  console.log(`Express Server started on port localhost:${serverPort}`);
});
