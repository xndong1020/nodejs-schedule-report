const express = require('express')
const router = express.Router()
const { Device } = require('../models/Device')
const { deviceTypes, deviceRoles } = require('../enums')
const { getDeviceSettingsByUserID } = require('../mongodbHelpers')
const { checkDeviceStatus } = require('../services/callHistoryService')
const { checkDeviceNameUniqueness } = require('../utils/device.util')

// GET /settings/add_device
router.get('/add_device', async (req, res) => {
  const { _id } = req.user
  const settings = (await getDeviceSettingsByUserID(_id)) || {}
  const { devices } = settings
  const deviceExitingRoles = devices.map(device => device.role)
  const { name } = req.user

  const deviceKeys = Object.keys(deviceTypes)
  const currentDeviceIndex = deviceKeys.findIndex(
    key => key === settings.deviceType
  )

  // available roles contains any unused roles
  let deviceRoleKeys = Object.keys(deviceRoles)
  deviceRoleKeys = deviceRoleKeys.filter(key => {
    return !deviceExitingRoles.includes(key.toLocaleLowerCase())
  })

  const currentDeviceRoleIndex = deviceRoleKeys.findIndex(
    key => key === settings.role
  )

  // read user settings
  res.render('add_device', {
    title: 'Add Device for Testing',
    name,
    settings,
    deviceKeys,
    currentDeviceIndex,
    deviceRoleKeys,
    currentDeviceRoleIndex
  })
})

// GET /settings/add_device
router.get('/edit_device/:deviceName', async (req, res) => {
  const { _id } = req.user
  const { deviceName } = req.params
  const settings = (await getDeviceSettingsByUserID(_id)) || {}
  const { devices } = settings
  const targetDevice = devices.find(device => device.deviceName === deviceName)
  const { deviceType, isDeviceApiControlled } = targetDevice

  const deviceKeys = Object.keys(deviceTypes)
  const currentDeviceIndex = Object.keys(deviceTypes).findIndex(
    key => deviceTypes[key] === deviceType
  )

  if (isDeviceApiControlled === 'controlled') {
    // read user settings
    res.render('edit_device_controlled', {
      title: 'Edit Device Details',
      deviceName,
      settings: targetDevice,
      deviceKeys,
      currentDeviceIndex
    })
  } else if (isDeviceApiControlled === 'uncontrolled') {
    // read user settings
    res.render('edit_device_uncontrolled', {
      title: 'Edit Device Details',
      deviceName,
      settings: targetDevice
    })
  }
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

// POST /settings/check_status
router.post('/check_status', async (req, res) => {
  try {
    const response = await checkDeviceStatus(req.body)
    res.status(200).send(response)
  } catch (err) {
    res.status(400).send(err)
  }
})

// POST /settings/check_uniqueness
router.post('/check_uniqueness', async (req, res) => {
  try {
    const { _id } = req.user
    const { deviceName, oldName, action } = req.body
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

// POST /settings/add_device
router.post('/add_device', async (req, res) => {
  const { _id } = req.user
  try {
    const settings = (await getDeviceSettingsByUserID(_id)) || {}
    const { devices } = settings || []
    const newDeviceObj = { userID: _id, devices: [...devices, req.body] }
    if (devices.length === 0) await Device.create(newDeviceObj)
    else await Device.updateOne({ _id: settings._id }, newDeviceObj)

    req.flash('success_msg', 'Your device has been saved for testing')
    // read user settings
    res.redirect('/settings/admin_devices')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/settings/admin_devices')
  }
})

// POST /settings/edit_device/myDevice
router.post('/edit_device/:deviceName', async (req, res) => {
  const { _id } = req.user
  const { deviceName } = req.params
  try {
    const targetDeviceObj = await Device.findOne({ userID: _id })
    const { devices } = targetDeviceObj || []
    let newDevicesList = [...devices]
    const targetDeviceIndex = devices.findIndex(
      device => device.deviceName === deviceName
    )
    newDevicesList[targetDeviceIndex] = { ...req.body }
    const newDeviceObj = {
      _id: targetDeviceObj._id,
      devices: newDevicesList,
      userID: _id
    }
    await Device.updateOne({ userID: _id }, newDeviceObj)

    req.flash('success_msg', 'Your device has been updated.')
    res.redirect('/settings/admin_devices')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later: ' + err
    )
    res.redirect('/settings/admin_devices')
  }
})

// POST /settings/delete_device/myDevice
router.post('/delete_device/:deviceName', async (req, res) => {
  const { _id } = req.user
  const { deviceName } = req.params
  console.log('deviceName', deviceName)
  try {
    const targetDeviceObj = await Device.findOne({ userID: _id })
    const { devices } = targetDeviceObj || []
    const newDeviceList = devices.filter(
      device => device.deviceName !== deviceName
    )
    console.log('newDeviceList', newDeviceList)
    const newDeviceObj = {
      _id: targetDeviceObj._id,
      devices: newDeviceList,
      userID: targetDeviceObj.userID
    }
    await Device.updateOne({ userID: _id }, newDeviceObj)

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
