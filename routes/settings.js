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
  console.log('Settings connected as id ' + connection.threadId)
})


// Main dashboard route ?
router.get('/', isAuthenticated, (req, res) => { // Check authenticated
    const email = req.user.email;
    const query = "SELECT first_name, user_role FROM users WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      if (err) {
        // Handle any errors
        console.error(err);
        return;
      }
      const uzer = results[0]
      res.render('settings/settingsIndex', {email: uzer.first_name, userRole: uzer.user_role}) // renders view file
    })
})

// Main dashboard route ?
router.get('/', isAuthenticated, (req, res) => { // Check authenticated
    res.render('settings/settingsIndex') // renders view file
})

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}



module.exports = router