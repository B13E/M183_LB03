const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const tweetsTableExists =
  "SELECT name FROM sqlite_master WHERE type='table' AND name='tweets'";
const createTweetsTable = `CREATE TABLE tweets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  timestamp TEXT,
  text TEXT
)`;
const usersTableExists =
  "SELECT name FROM sqlite_master WHERE type='table' AND name='users'";
const createUsersTable = `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)`;
const seedUsersTable = `INSERT INTO users (username, password) VALUES
  ('switzerchees', '$2b$10$OjYJ88r56oBxG2kGRfclo.QPw.MHjxrIVsRyJ9FdjEo2h/dSF8CjG'), /* Hash for '123456' */
  ('john', '$2b$10$OjYJ88r56oBxG2kGRfclo.QPw.MHjxrIVsRyJ9FdjEo2h/dSF8CjG'),
  ('jane', '$2b$10$OjYJ88r56oBxG2kGRfclo.QPw.MHjxrIVsRyJ9FdjEo2h/dSF8CjG')
`;

const initializeDatabase = async () => {
  const db = new sqlite3.Database("./minitwitter.db");

  db.serialize(() => {
    db.get(tweetsTableExists, [], async (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        await db.run(createTweetsTable);
      }
    });
    db.get(usersTableExists, [], async (err, row) => {
      if (err) return console.error(err.message);
      if (!row) {
        db.run(createUsersTable, [], async (err) => {
          if (err) return console.error(err.message);
          db.run(seedUsersTable);
        });
      }
    });
  });

  return db;
};

const insertDB = (db, query) => {
  return new Promise((resolve, reject) => {
    db.run(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const queryDB = (db, query) => {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = { initializeDatabase, queryDB, insertDB };
