const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const session = require('express-session')
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const reportsRouter = require('./routes/reports')
const tasksRouter = require('./routes/tasks')
const emailsRouter = require('./routes/email')
const settingsRouter = require('./routes/settings')

// mongodb
require('./db')
// passport
require('./auth/passport')(passport)
require('dotenv').config() // e.g. process.env.Environment

const { ensureAuthenticated } = require('./auth/auth')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(expressLayouts)
// app.set('layout extractScripts', true)
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
)

// connect flash
app.use(flash())

// put after session
// create a custom middleware for adding global variables for flash msg
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error') // for passport error
  next()
})

// put after session
// passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/reports', [ensureAuthenticated], reportsRouter)
app.use('/tasks', [ensureAuthenticated], tasksRouter)
app.use('/emails', [ensureAuthenticated], emailsRouter)
app.use('/settings', [ensureAuthenticated], settingsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', { title: 'Error Page' })
})

module.exports = app
