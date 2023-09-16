const express = require('express')
const router = express.Router()
const mysql = require('mysql2')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Roadkiller612$',
  database: 'cicadadb'
})
connection.connect(function(err) {
  if (err) {
      console.error('Error connecting: ' + err.stack)
      return
  }
  console.log('Tags connected as id ' + connection.threadId)
})

router.get('/', (req, res) => { // Check authenticated
    const email = req.user.email;
    const query = "SELECT first_name, user_role FROM users WHERE email = ?";
    connection.query(query, [email], (err, results) => {
      if (err) {
        // Handle any errors
        console.error(err);
        return;
      }
      const uzer = results[0]
      res.render('tags/tagsIndex', {email: uzer.first_name, userRole: uzer.user_role}) // renders view file
    })
})

module.exports = router // exports router