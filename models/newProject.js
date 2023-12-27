const express = require('express')
const router = express.Router()
const mysql = require('mysql2')
const config = require('../routes/config');

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
    teamMembers = JSON.parse(teamMembers).filter(member => member !== "")
  }
  console.log(teamMembers);

  const teamMembersJson = {}
  teamMembers.forEach((member, index) => {
    teamMembersJson[`Mem${index + 1}`] = member
  })

  const teamMembersJsonToString = JSON.stringify(teamMembersJson);
  const statusString = "In Progress"

  // SEND team members email to join project through API

  // Add new project into projects table
  const query = "INSERT INTO projects (project_name, team_members, stat, des) VALUES (?, ?, ?, ?)"
  connection.query(query, [projectName, teamMembersJsonToString, statusString, projectDescription],
    (err, results) => {
      if (err) {
        console.error(err)
        return;
      }
      console.log('Project created succesfully')
    })
  
  // Get project ID of the project that was just added so that it can be added to the user's projects column
  const query2 = "SELECT id FROM projects WHERE project_name = ?"
  let project_id
  connection.query(query2, [projectName],
    (err, results) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Project id fetched succesfully')
      project_id = results[0].id;

      // Get the users projects column to update it with latest project
      const query3 = "SELECT projects FROM users WHERE email = ?"
      connection.query(query3, [email],
        (err, results) => {
          if (err) {
            console.error(err)
            return;
          }
          let projectsJson = results[0].projects ? results[0].projects : {}
          const projKey = `proj${Object.keys(projectsJson).length + 1}`
          
          projectsJson[projKey] = `${project_id}`
          
          // Update the user's project column
          const updateQuery = "UPDATE users SET projects = ? WHERE email = ?"
          connection.query(updateQuery, [JSON.stringify(projectsJson), email],
            (err, updateResults) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log('Project added to user')
              res.redirect('/dashboard')
            })
        })  
        
        // Update the team member's project column
        teamMembers.forEach((teamMemberEmail) => {
          const updateTeamMemberQuery = "SELECT projects FROM users WHERE email = ?"
          connection.query(updateTeamMemberQuery, [teamMemberEmail],
            (err, updateTeamMemberRes) => {
              if (err) {
                console.log(err)
                return;
              }
              let teamMemberProjectsJson = updateTeamMemberRes[0].projects ? updateTeamMemberRes[0].projects : {}
              const teamMemberProjKey = `proj${Object.keys(teamMemberProjectsJson).length + 1}`
              teamMemberProjectsJson[teamMemberProjKey] = `${project_id}`

              // Update the team member's projects column
              const updateTeamMemberProjectsQuery = "UPDATE users SET projects = ? WHERE email = ?"
                connection.query(updateTeamMemberProjectsQuery, [JSON.stringify(teamMemberProjectsJson), teamMemberEmail],
                  (err, updateTeamMemberResults) => {
                    if (err) {
                      console.error(err)
                      return
                    }
                    console.log(`Project added to team member: ${teamMemberEmail}`)
                  })
            })
        })
  })
})

module.exports = router // exports router