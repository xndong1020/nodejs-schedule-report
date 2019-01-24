const express = require('express')
const { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const passport = require('passport')
const { ensureAuthenticated, ensureAdminAccess } = require('../auth/auth')
const { userRole } = require('../enums')
const router = express.Router()

// GET: /users/login
router.get('/login', (req, res) => {
  res.render('login', { layout: 'layout_clear' })
})

// POST: /users/login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

// GET: /users/logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'you are logged out')
  res.redirect('/users/login')
})

// GET: /users/admin
router.get(
  '/admin',
  [ensureAuthenticated, ensureAdminAccess],
  async (req, res) => {
    const users = await User.find({})
    console.log('users', users)
    res.render('admin_user', { users })
  }
)

// GET: /users/register
router.get('/register', [ensureAuthenticated], (req, res) => {
  const roleKeys = Object.keys(userRole)
  const roleValues = Object.keys(userRole).map(key => {
    return userRole[key]
  })
  console.log(roleKeys, roleValues)
  res.render('register_user', {
    roleKeys,
    roleValues
  })
})

router.post('/delete', (req, res) => {
  const { userId } = req.body
  User.deleteOne({ _id: userId }, (err, data) => {
    if (err) res.status(400).send(err)
    else res.status(201).send(data)
  })
})

router.get('/edit/:userId', [ensureAuthenticated], async (req, res) => {
  const { userId } = req.params
  const roleKeys = Object.keys(userRole)
  const roleValues = Object.keys(userRole).map(key => {
    return userRole[key]
  })
  const user = await User.findOne({ _id: userId })
  const { name, email, role } = user
  const selectedIndex = roleValues.findIndex(roleValue => roleValue === role)
  console.log('selectedIndex', selectedIndex)
  res.render('edit_user', {
    name,
    email,
    userId,
    selectedIndex,
    roleKeys,
    roleValues
  })
})

router.post(
  '/edit/:userId',
  [
    // email must be an email
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
  ],
  async (req, res) => {
    const { name, email, role } = req.body
    const { userId } = req.params
    const checkResult = validationResult(req)
    let errors = []
    checkResult.array().map(item => errors.push(item.msg))
    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render('edit_user', {
        errors,
        name,
        email,
        error_msg: '',
        success_msg: ''
      })
    } else {
      // client-side validation passed
      const updatedUser = { name, email, role }
      try {
        await User.updateOne({ _id: userId }, updatedUser)
        req.flash('success_msg', 'You have successfully updated an user')
        res.redirect('/users/admin')
      } catch (error) {
        console.log('error', error)
        res.render('edit_user', {
          errors: error,
          error_msg: '',
          success_msg: ''
        })
      }
    }
  }
)

// POST: /users/reset_password/5c48f8220eeeac343ca9c21f
router.post(
  '/reset_password/:userId',
  [
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 chars long')
  ],
  async (req, res) => {
    const { password, password2 } = req.body
    const { userId } = req.params
    const checkResult = validationResult(req)
    let errors = []
    checkResult.array().map(item => errors.push(item.msg))
    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render('register_user', {
        errors,
        password,
        password2,
        error_msg: '',
        success_msg: ''
      })
    } else {
      // client-side validation passed
      try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const updatedUser = { password: hash }
        await User.updateOne({ _id: userId }, updatedUser)
        req.flash('success_msg', 'You have successfully updated user password')
        res.redirect('/users/admin')
      } catch (error) {
        console.log('error reset_password', error)
        res.render('register_user', {
          errors: error,
          error_msg: '',
          success_msg: ''
        })
      }
    }
  }
)

// POST: /users/register
router.post(
  '/register',
  [
    // email must be an email
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    // password must be at least 6 chars long
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 chars long')
  ],
  async (req, res) => {
    const roleKeys = Object.keys(userRole)
    const roleValues = Object.keys(userRole).map(key => {
      return userRole[key]
    })
    const { name, email, role, password, password2 } = req.body
    const checkResult = validationResult(req)
    let errors = []
    checkResult.array().map(item => errors.push(item.msg))
    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render('register_user', {
        errors,
        name,
        email,
        role,
        roleKeys,
        roleValues,
        password,
        password2,
        error_msg: '',
        success_msg: ''
      })
    } else {
      // client-side validation passed
      try {
        const user = await User.findOne({ email })
        // if an user with the same email address already exists
        if (user) {
          res.render('register_user', {
            errors: ['User with the same email address already exists'],
            name,
            email,
            role,
            roleKeys,
            roleValues,
            password,
            password2,
            error_msg: '',
            success_msg: ''
          })
        } else {
          const salt = await bcrypt.genSalt(10)
          const hash = await bcrypt.hash(password, salt)
          const newUser = { name, email, role, password: hash }
          await User.create(newUser)
          req.flash('success_msg', 'You have successfully created a new user')
          res.redirect('/users/admin')
        }
      } catch (error) {
        console.log(error)
        res.render('register_user', {
          errors: error,
          error_msg: '',
          success_msg: ''
        })
      }
    }
  }
)

module.exports = router
