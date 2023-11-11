const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
const config = require('./config');


const connection = mysql.createConnection({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database
})
connection.connect(function(err) {
  if (err) {
      console.error('Error connecting: ' + err.stack)
      return
  }
  console.log('Proj connected as id ' + connection.threadId)
})

// Most recent project route / all projects
router.get('/', (req, res) => { 
    const email = req.user.email;
    const query = "SELECT first_name, user_role FROM users WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      if (err) {
        // Handle any errors
        console.error(err);
        return;
      }
      const uzer = results[0]
      res.render('projects/projectsIndex', {email: uzer.first_name, userRole: uzer.user_role}) // renders view file
    })
})

// New project route (display form)
router.get('/new', (req, res) => {
    res.render('projects/new')
})

// Create project route (actually creating it)
router.post('/', (req, res) => {
    res.send('Create')
})

module.exports = router // exports router