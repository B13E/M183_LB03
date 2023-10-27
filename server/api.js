const { initializeDatabase, queryDB, insertDB } = require("./database");
const jwt = require("jsonwebtoken");
const pino = require('pino-http')(); // Hier verwenden wir pino-http zur Protokollierung 
const { body, validationResult } = require("express-validator");
const express = require('express');

let db;

const initializeAPI = async (app) => {
  db = await initializeDatabase();
  app.use(pino); // Middleware für die Protokollierung
  app.get("/api/feed", getFeed);
  app.post("/api/feed", [
    body("query").notEmpty().withMessage("Tweet text is required"),
  ], postTweet);
  app.post("/api/login", [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ], login);
};

const getFeed = async (req, res) => {
  const query = req.query.q;
  const tweets = await queryDB(db, query);
  res.json(tweets);
};

const postTweet = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  insertDB(db, req.body.query);
  res.json({ status: "ok" });
};

const login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = await queryDB(db, query);
  res.log.info({user: username}, "Successful login attempt");
  if (user.length === 1) {
    res.json(user[0]);
  } else {
    res.log.warn({user: username}, "Failed login attempt");
    res.json(null);
  }
};

module.exports = { initializeAPI };
