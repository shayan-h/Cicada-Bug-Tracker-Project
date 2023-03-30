const express = require('express')
const router = express.Router()

// Projects route
router.get('/', (req, res) => {
    res.render('projects/projectsIndex') // renders view file
})

module.exports = router // exports router