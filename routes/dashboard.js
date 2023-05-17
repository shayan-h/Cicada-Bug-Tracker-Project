const express = require('express')
const router = express.Router()


// Main dashboard route ?
router.get('/', isAuthenticated, (req, res) => { // Check authenticated
    res.render('dashboard/dashboardIndex') // renders view file
})

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
}



module.exports = router // exports router