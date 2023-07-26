const express = require('express')
const router = express.Router()

// Most recent project route / all projects
router.get('/', (req, res) => {
    res.render('projects/projectsIndex') // renders view file
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