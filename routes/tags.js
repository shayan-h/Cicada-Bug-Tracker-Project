const express = require('express')
const router = express.Router()

// Tags route
router.get('/', (req, res) => {
    res.render('tags/tagsIndex') // renders view file
})

module.exports = router // exports router