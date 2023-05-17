// All setup and middleware --------------------------------------------------------------------
const session = require('express-session');
const Store = require('express-session').Store
const flash  = require('express-flash')
const BetterMemoryStore = require('session-memory-store')(session)
const LocalStrategy = require('passport-local').Strategy
const methodOverride = require('method-override')

const express = require('express') // import express
const app = express()
const cookie = require('cookie-parser') // cookie
const expressLayouts = require('express-ejs-layouts')
const mysql = require('mysql2')
const bcrypt = require('bcrypt')

const passport = require('passport')

const indexRouter = require('./routes/index') // reference to index route
const dashboardRouter = require('./routes/dashboard') // reference to dashboard route
const projectsRouter = require('./routes/projects') // reference to projects route
const tagsRouter = require('./routes/tags') // reference to tags route
const registerRouter = require('./routes/register'); // reference to tags route
const { use } = require('passport');

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(cookie())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const store = new BetterMemoryStore({expire: 60*60*1000, debug: true})
app.use(session({
    name: 'YOYOYO',
    secret: 'VERYVERYSECRETYO',
    store: store,
    resave: true,
    saveUninitialized: true
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    if (!email || !password) {
        return done(null, false, req.flash('message','All fields are required.'))
    }
    const sql = 'SELECT * FROM users WHERE email = ?'
    connection.query(sql, [email], async function(err, rows) {
        console.log('error: ' + err) 
        console.log(rows)
        console.log(email)
        if (err) {
            return done({message: err + '!'})
        }
        if(!rows.length) { 
            return done(null, false, {message: 'Invalid email or password'}) 
        }

        // const hashedPassword = await bcrypt.hash(password, 10)
        const hashedPasswordDB = rows[0].hashed_password
        // console.log(hashedPassword)
        console.log(hashedPasswordDB)
        bcrypt.compare(password, hashedPasswordDB, function(err, ok) {
            if (err || !ok) {
                console.log('HERE FIRST')
                return done(null, false, {message: 'Invalid email or password!'})
            } 
            console.log(rows)
            return done(null, rows);
        })
    })
}))

passport.serializeUser(function(user, done) {
    console.log('HERE')
    var arr = []
    arr = user
    var ele = arr[0]
    done(null, ele.id)
});

passport.deserializeUser(function(id, done) {
    connection.query("SELECT * FROM users WHERE id = " + id, function (err, rows) {
        done(err, rows[0])
    })
})

app.use('/login', indexRouter) // use the index router

// App post
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}), function(res, req, info) {
    res.render('index', {message: req.flash('message')})
})

app.delete('/logout', (req, res) => {
    req.logOut(function(err) {
        if (err) {
            return next(err)
        }
    })
    res.redirect('/login')
})

// Create a connection to the database -------------------------------------------------------
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Roadkiller612$',
    database: 'cicadadb'
})
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack)
        return
    }
    console.log('Connected as id ' + connection.threadId)
})

// Test SQL query ------------------------------------------------------------------------------
connection.query('SELECT * FROM cicadadb.users', function(err, rows) {
    if (err) {
        console.error(err)
        return 
    }
    console.log(rows)
})

// init passport (might move) ---------------------------------------------------------------


// App post



// Setup routes ------------------------------------------------------------------------------

app.use('/dashboard', dashboardRouter) // use the dashboard router
app.use('/projects', projectsRouter) // use the projects router
app.use('/tags', tagsRouter) // use the tags router
app.use('/sign-up', registerRouter) // use the register router

module.exports = app

app.listen(process.env.PORT || 3000) // defualt to port 3000

process.on('SIGINT', function() {
    connection.end();
    process.exit();
});
