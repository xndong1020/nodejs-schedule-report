const express = require('express')
const router = express.Router()
const { Device } = require('../models/Device')
const { deviceTypes } = require('../enums')
const { getDeviceSettingsByUserID } = require('../mongodbHelpers')

// GET /settings/add_device
router.get('/add_device', async (req, res) => {
  const { _id } = req.user
  const settings = (await getDeviceSettingsByUserID(_id)) || {}
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
  const settings = (await getDeviceSettingsByUserID(_id)) || {}
  const { devices } = settings
  const deviceId = settings._id
  const { name } = req.user

  const deviceKeys = Object.keys(deviceTypes)

  // read user settings
  res.render('admin_devices', {
    title: 'Devices',
    name,
    deviceId,
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

// POST /settings/add_device
router.post('/:deviceId/delete_device/:role', async (req, res) => {
  const { deviceId, role } = req.params
  try {
    const targetDeviceObj = await Device.findOne({ _id: deviceId })
    const { devices } = targetDeviceObj
    const newDeviceList = devices.filter(device => device.role !== role)
    const newDeviceObj = {
      _id: deviceId,
      devices: newDeviceList,
      userID: targetDeviceObj.userID
    }
    await Device.updateOne({ _id: deviceId }, newDeviceObj)

    req.flash('success_msg', 'Your device has been deleted.')
    res.redirect('/settings/admin_devices')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/settings/admin_devices')
  }
})

module.exports = router
