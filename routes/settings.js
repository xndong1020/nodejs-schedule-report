const express = require('express')
const router = express.Router()
const { Device } = require('../models/Device')
const { getDeviceSettingsByUserID } = require('../mongodbHelpers')

// GET /settings/devices
router.get('/devices', async (req, res) => {
  const { _id } = req.user
  const settings = await getDeviceSettingsByUserID(_id)
  const { name } = req.user
  // read user settings
  res.render('settings_devices', { title: 'Devices', name, settings })
})

// POST /settings/devices
router.post('/devices', (req, res) => {
  const { _id } = req.user
  const body = req.body
  const newDevice = { ...body, userID: _id }
  Device.create(newDevice)
  req.flash('success_msg', 'Your device has been saved for testing')
  // read user settings
  res.redirect('/')
})

module.exports = router
