const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'system123'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as id', connection.threadId);

  // Create database if it does not exist
  connection.query('CREATE DATABASE IF NOT EXISTS login', (err, results) => {
    if (err) {
      console.error('Error creating database:', err.stack);
    } else {
      console.log('Database created or already exists');
    }
  });

  // Use the 'login' database
  connection.query('USE login', (err, results) => {
    if (err) {
      console.error('Error selecting database:', err.stack);
    } else {
      console.log('Using database: login');
    }
  });

  // Create 'loginfo' table if it does not exist
  connection.query(`
    CREATE TABLE IF NOT EXISTS loginfo (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name varchar(40) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )AUTO_INCREMENT = 221002
  `, (err, results) => {
    if (err) {
      console.error('Error creating table:', err.stack);
    } else {
      console.log('Table created or already exists: loginfo');
    }
  });
});

app.use(express.static(__dirname));

app.post('/submit', (req, res) => {
  const action = req.body.action;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  switch (action) {
    case 'signup':
      const signupQuery = 'INSERT INTO loginfo (name, email, password) VALUES (?, ?, ?)';
      connection.query(signupQuery, [name, email, password], (err, result) => {
        if (err) {
          console.error('Error inserting user into database:', err.stack);
          res.send('Error signing up.');
        } else {
          res.send('User signed up successfully!');
        }
      });
      break;

    case 'login':
      const loginQuery = 'SELECT * FROM loginfo WHERE email = ? AND password = ?';
      connection.query(loginQuery, [email, password], (err, results) => {
        if (err) {
          console.error('Error querying database:', err.stack);
          res.send('Error logging in.');
        } else if (results.length > 0) {
          res.redirect('/index.html');
        } else {
          res.send('Incorrect email or password.');
        }
      });
      break;

    default:
      res.send('Invalid action.');
      break;
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
