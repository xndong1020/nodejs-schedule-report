const express = require('express')
const router = express.Router()
const { Device } = require('../models/Device')
const { deviceTypes } = require('../enums')
const { getDeviceSettingsByUserID } = require('../mongodbHelpers')

// GET /settings/devices
router.get('/add_devices', async (req, res) => {
  const { _id } = req.user
  const settings = await getDeviceSettingsByUserID(_id) || {}
  const { name } = req.user

  const deviceKeys = Object.keys(deviceTypes)
  const currentDeviceIndex = deviceKeys.findIndex(
    key => key === settings.deviceType
  )

  // read user settings
  res.render('add_devices', {
    title: 'Devices',
    name,
    settings,
    deviceKeys,
    currentDeviceIndex
  })
})

// POST /settings/devices
router.post('/add_devices', (req, res) => {
  const { _id } = req.user
  const body = req.body
  const newDevice = { ...body, userID: _id }
  Device.create(newDevice)
  req.flash('success_msg', 'Your device has been saved for testing')
  // read user settings
  res.redirect('/')
})

module.exports = router
