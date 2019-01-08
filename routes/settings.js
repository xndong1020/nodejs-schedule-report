const express = require('express')
const router = express.Router()
const Device = require('../models/Device')
const { ensureAuthenticated } = require('../auth/auth')

// GET /settings/devices
router.get('/devices', [ensureAuthenticated], (req, res) => {
  console.log(req.user)
  const { name } = req.user
  // read user settings
  res.render('settings_devices', { title: 'Devices', name })
})

// POST /settings/devices
router.post('/devices', [ensureAuthenticated], (req, res) => {
  const body = req.body
  const { _id } = req.user
  const newDevice = { ...body, userID: _id }
  Device.create(newDevice)
  req.flash('success_msg', 'Your device has been saved for testing')
  // read user settings
  res.redirect('/')
})

module.exports = router
