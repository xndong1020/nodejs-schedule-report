const express = require('express')
const { check, body, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const { DateTime } = require('luxon')
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
    const usersWithDates = []
    users.forEach(user => {
      usersWithDates.push({
        ...user.toObject(),
        dateFormatted: DateTime.fromISO(user.date.toISOString()).toLocaleString(
          DateTime.DATETIME_MED_WITH_SECONDS
        )
      })
    })
    res.render('admin_user', { users: usersWithDates })
  }
)

// GET: /users/register
router.get('/register', [ensureAuthenticated], (req, res) => {
  const roleKeys = Object.keys(userRole)
  const roleValues = Object.keys(userRole).map(key => {
    return userRole[key]
  })
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

router.get('/edit', [ensureAuthenticated], async (req, res) => {
  const { _id } = req.user
  const roleKeys = Object.keys(userRole)
  const roleValues = Object.keys(userRole).map(key => {
    return userRole[key]
  })
  const user = await User.findOne({ _id })
  const { name, email, role } = user
  const selectedIndex = roleValues.findIndex(roleValue => roleValue === role)
  res.render('edit_user', {
    name,
    email,
    userId: _id,
    selectedIndex,
    roleKeys,
    roleValues,
    profileTab: 'active',
    passwordTab: ''
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
  res.render('edit_user', {
    name,
    email,
    userId,
    selectedIndex,
    roleKeys,
    roleValues,
    profileTab: 'active',
    passwordTab: ''
  })
})

router.post(
  '/edit/:userId',
  [
    check('name')
      .not()
      .isEmpty()
      .withMessage('Please provide a valid user name'),
    // email must be an email
    check('email')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    check('role')
      .not()
      .isEmpty()
      .withMessage('Please select an user role')
  ],
  async (req, res) => {
    const { name, email, role } = req.body
    const { userId } = req.params
    const checkResult = validationResult(req)
    const errors = checkResult.array()

    const roleKeys = Object.keys(userRole)
    const roleValues = Object.keys(userRole).map(key => {
      return userRole[key]
    })
    const selectedIndex = roleValues.findIndex(roleValue => roleValue === role)

    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render('edit_user', {
        errors,
        profileTab: 'active',
        passwordTab: '',
        name,
        email,
        userId,
        roleKeys,
        roleValues,
        selectedIndex,
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
          profileTab: 'active',
          passwordTab: '',
          name,
          email,
          userId,
          roleKeys,
          roleValues,
          selectedIndex,
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
      .withMessage('Password must be at least 6 chars long'),
    body('password2').custom((value, { req }) => {
      if (!value || value.length < 6) { throw new Error('Password confirmation must be at least 6 chars long') } else if (value !== req.body.password) { throw new Error('Password confirmation does not match password') } else return true
    })
  ],
  async (req, res) => {
    const { password, password2 } = req.body
    const { userId } = req.params
    const user = await User.findOne({ _id: userId })
    const { role } = user
    const checkResult = validationResult(req)
    const errors = checkResult.array()

    const roleKeys = Object.keys(userRole)
    const roleValues = Object.keys(userRole).map(key => {
      return userRole[key]
    })
    const selectedIndex = roleValues.findIndex(roleValue => roleValue === role)

    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render('edit_user', {
        errors,
        profileTab: '',
        passwordTab: 'active',
        password,
        password2,
        userId,
        roleKeys,
        roleValues,
        selectedIndex,
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
        res.render('edit_user', {
          errors: error,
          profileTab: '',
          passwordTab: 'active',
          password,
          password2,
          userId,
          roleKeys,
          roleValues,
          selectedIndex,
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
    check('name')
      .not()
      .isEmpty()
      .withMessage('Please provide a valid user name'),
    // email must be an email
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .trim(),
    // email is not in use
    body('email').custom(value => {
      return User.findOne({ email: value }).then(user => {
        if (user) {
          return Promise.reject(new Error('E-mail already in use'))
        }
      })
    }),
    check('role')
      .not()
      .isEmpty()
      .withMessage('Please select an user role'),
    // password must be at least 6 chars long
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 chars long'),
    body('password2').custom((value, { req }) => {
      if (!value || value.length < 6) { throw new Error('Password confirmation must be at least 6 chars long') } else if (value !== req.body.password) { throw new Error('Password confirmation does not match password') } else return true
    })
  ],
  async (req, res) => {
    const roleKeys = Object.keys(userRole)
    const roleValues = Object.keys(userRole).map(key => {
      return userRole[key]
    })
    const { name, email, role, password, password2 } = req.body
    const selectedIndex = roleValues.findIndex(roleValue => roleValue === role)
    const checkResult = validationResult(req)
    const errors = checkResult.array()
    if (!checkResult.isEmpty()) {
      // client-side validation failed
      res.render('register_user', {
        errors,
        name,
        email,
        role,
        roleKeys,
        roleValues,
        selectedIndex,
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
        const newUser = { name, email, role, password: hash }
        await User.create(newUser)
        req.flash('success_msg', 'You have successfully created a new user')
        res.redirect('/users/admin')
      } catch (error) {
        // console.log(error)
        res.render('register_user', {
          errors: error,
          name,
          email,
          role,
          roleKeys,
          roleValues,
          selectedIndex,
          password,
          password2,
          error_msg: '',
          success_msg: ''
        })
      }
    }
  }
)

module.exports = router
