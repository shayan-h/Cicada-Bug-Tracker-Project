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
  const email = req.user.email
  
  res.render('tags/newTagIndex')
})

router.post('/', (req, res) => {
    const email = req.user.email;
    const tagName = req.body.tagName
    const tagDescription = req.body.tagDescription
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
    const statusString = "Active"
  
    
})