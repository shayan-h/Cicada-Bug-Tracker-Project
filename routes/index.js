// All setup and middleware --------------------------------------------------------------------
const express = require('express')
const router = express.Router()


// Router setup for server -----------------------------------------------------------------------
router.get('/', isAuthenticated, (req, res) => {
    res.render('index')
})

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    }
    return next();
}



module.exports = router // exports router