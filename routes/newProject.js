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
})

router.get('/', (req, res) => { 
  res.render('projects/newProjectIndex')
})

router.post('/', (req, res) => {
  const projectName = req.body.projectName
  const projectDescription = req.body.projectDescription
  const teamMembers = req.body.teamMembers || []
  console.log(teamMembers)

  const teamMembersJson = {}
  teamMembers.forEach((member, index) => {
    teamMembersJson[`Mem${index + 1}`] = member
  })

  const teamMembersJsonToString = JSON.stringify(teamMembersJson);
  const statusString = "In Progress"

  const query = "INSERT INTO projects (project_name, team_members, stat, des) VALUES (?, ?, ?, ?)"
  connection.query(query, [projectName, teamMembersJsonToString, statusString, projectDescription],
    (err, results) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Project created succesfully');
    })
    res.redirect('/dashboard')
})

module.exports = router // exports router