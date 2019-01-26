const express = require('express')
const router = express.Router()
const { Device } = require('../models/Device')
const { deviceTypes } = require('../enums')
const { getDeviceSettingsByUserID } = require('../mongodbHelpers')

// GET /settings/add_device
router.get('/add_device', async (req, res) => {
  const { _id } = req.user
  const settings = await getDeviceSettingsByUserID(_id) || {}
  const { name } = req.user

  const deviceKeys = Object.keys(deviceTypes)
  const currentDeviceIndex = deviceKeys.findIndex(
    key => key === settings.deviceType
  )

  // read user settings
  res.render('add_device', {
    title: 'Devices',
    name,
    settings,
    deviceKeys,
    currentDeviceIndex
  })
})

// GET /settings/admin_devices
router.get('/admin_devices', async (req, res) => {
  const { _id } = req.user
  const settings = await getDeviceSettingsByUserID(_id) || {}
  const { devices } = settings
  const { name } = req.user

  const deviceKeys = Object.keys(deviceTypes)

  // read user settings
  res.render('admin_devices', {
    title: 'Devices',
    name,
    devices,
    deviceKeys
  })
})

// POST /settings/add_device
router.post('/add_device', (req, res) => {
  const { _id } = req.user
  const body = req.body
  const newDevice = { ...body, userID: _id }
  Device.create(newDevice)
  req.flash('success_msg', 'Your device has been saved for testing')
  // read user settings
  res.redirect('/')
})

module.exports = router
