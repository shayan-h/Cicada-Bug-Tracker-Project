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
  console.log('Dashboard connected as id ' + connection.threadId)
})


// Main dashboard route ?
router.get('/', isAuthenticated, (req, res) => { // Check authenticated
    const email = req.user.email;
    const query = "SELECT first_name, user_role, projects FROM users WHERE email = ?";
    connection.query(query, [email], async (err, results) => {
      if (err) {
        // Handle any errors
        console.error(err);
        return;
      }
      const uzer = results[0]
      const userProjects = uzer.projects
      const projectsArray = []

      for (const projectId in userProjects) {
        const projectDetails = await getProjectDetails(userProjects[projectId]);
        // console.log('Project Details:', projectDetails);
        projectsArray.push({
          id: userProjects[projectId],
          projName: projectDetails.project_name,
          teamMembers: projectDetails.team_members,
          status: projectDetails.stat
        })
      }

      res.render('dashboard/dashboardIndex', {
        email: uzer.first_name, 
        userRole: uzer.user_role, 
        projects: projectsArray
      }) // renders view file
    })
})

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function getProjectDetails(projectId) {
  const query = "SELECT project_name, team_members, stat FROM projects WHERE id = ?";
  return new Promise((resolve,reject) => {
    connection.query(query, [projectId], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0]);
      }
    })
  })
}


module.exports = router // exports router