const express = require('express')
const router = express.Router()
const { Device } = require('../models/Device')
const { deviceTypes } = require('../enums')
const { checkDeviceStatus } = require('../services/callHistoryService')
const {
  checkDeviceNameUniqueness,
  getDeviceById
} = require('../utils/device.util')

// GET /devices/add_device
router.get('/add_device', async (req, res) => {
  const deviceKeys = Object.keys(deviceTypes)
  res.render('add_device', {
    title: 'Add Device for Testing',
    deviceKeys
  })
})

// GET /devices/add_device
router.get('/edit_device/:deviceId', async (req, res) => {
  const { deviceId } = req.params
  const targetDevice = (await getDeviceById(deviceId)) || {}
  const { deviceType, isDeviceApiControlled, deviceProtocol } = targetDevice

  const deviceKeys = Object.keys(deviceTypes)
  const currentDeviceIndex = Object.keys(deviceTypes).findIndex(
    key => deviceTypes[key] === deviceType
  )

  const httpCheckedStatus = deviceProtocol === 'http' ? 'checked' : ''
  const httpsCheckedStatus = deviceProtocol === 'https' ? 'checked' : ''

  if (isDeviceApiControlled === 'controlled') {
    // read user settings
    res.render('edit_device_controlled', {
      title: 'Edit Device Details',
      settings: targetDevice,
      deviceKeys,
      currentDeviceIndex,
      httpCheckedStatus,
      httpsCheckedStatus
    })
  } else if (isDeviceApiControlled === 'uncontrolled') {
    // read user settings
    res.render('edit_device_uncontrolled', {
      title: 'Edit Device Details',
      settings: targetDevice
    })
  }
})

// GET /devices/admin_devices
router.get('/admin_devices', async (req, res) => {
  const devices = (await Device.find({}, { __v: 0 })) || []
  const deviceKeys = Object.keys(deviceTypes)

  // read user settings
  res.render('admin_devices', {
    title: 'Devices',
    devices,
    deviceKeys
  })
})

// POST /devices/check_status
router.post('/check_status', async (req, res) => {
  try {
    const response = await checkDeviceStatus(req.body)
    res.status(200).send(response)
  } catch (err) {
    res.status(400).send(err)
  }
})

// POST /devices/check_uniqueness
router.post('/check_uniqueness', async (req, res) => {
  try {
    const { _id } = req.user
    const { deviceName, oldName, action } = req.body
    // checkDeviceNameUniqueness returns true means a device with the same name was already created
    const response = await checkDeviceNameUniqueness(
      deviceName,
      oldName,
      action,
      _id
    )
    res.status(200).send(response)
  } catch (err) {
    res.status(400).send(err)
  }
})

// POST /devices/add_device
router.post('/add_device', async (req, res) => {
  const { _id, name } = req.user
  try {
    await Device.create({
      ...req.body,
      userID: _id,
      modifiedBy: `created by ${name}`
    })
    req.flash('success_msg', 'Your device has been saved for testing')
    // read user settings
    res.redirect('/devices/admin_devices')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/devices/admin_devices')
  }
})

// POST /devices/edit_device/myDevice
router.post('/edit_device/:deviceId', async (req, res) => {
  const { _id, name } = req.user
  const { deviceId } = req.params
  try {
    await Device.findOneAndUpdate(
      { _id: deviceId },
      { ...req.body, userID: _id, modifiedBy: `last modified by ${name}` }
    )

    req.flash('success_msg', 'Your device has been updated.')
    res.redirect('/devices/admin_devices')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later: ' + err
    )
    res.redirect('/devices/admin_devices')
  }
})

// POST /devices/delete_device/myDevice
router.post('/delete_device/:deviceId', async (req, res) => {
  const { deviceId } = req.params
  try {
    await Device.findOneAndRemove({ _id: deviceId })
    req.flash('success_msg', 'Your device has been deleted.')
    res.redirect('/devices/admin_devices')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/devices/admin_devices')
  }
})

module.exports = router
