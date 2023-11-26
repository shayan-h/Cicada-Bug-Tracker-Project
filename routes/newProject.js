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
  const email = req.user.email;
  const projectName = req.body.projectName
  const projectDescription = req.body.projectDescription
  let teamMembers = req.body.teamMembers || []
  // If teamMembers is a string, convert it to an array
  if (typeof teamMembers === 'string') {
    teamMembers = JSON.parse(teamMembers).filter(member => member !== "");
  }
  console.log(teamMembers);

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
  
  const query2 = "SELECT id FROM projects WHERE project_name = ?"
  let project_id
  connection.query(query2, [projectName],
    (err, results) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Project id fetched succesfully');
      project_id = results[0].id;
      console.log('Project ID: ', project_id)

      const query3 = "UPDATE users SET projects = JSON_SET(COALESCE(projects, '{}'), '$.proj', '?') WHERE email = ?"
      connection.query(query3, [project_id, email],
        (err, results) => {
          if (err) {
          console.error(err); 
          return;
        }
        console.log('Project added to user');
      })
      res.redirect('/dashboard')
  })

  
})

module.exports = router // exports router