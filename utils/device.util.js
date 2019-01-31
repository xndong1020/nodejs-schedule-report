const { Device } = require('../models/Device')

const checkDeviceNameUniqueness = async (
  deviceName,
  oldName,
  action,
  userID
) => {
  try {
    const deviceSettings = (await Device.findOne({ userID })) || {}
    const { devices } = deviceSettings
    if (Array.isArray(devices)) {
      if (action === 'add') {
        return devices.some(
          device => device.deviceName.toLowerCase() === deviceName.toLowerCase()
        )
      } else if (action === 'edit') {
        const otherDevices = devices.filter(
          device => device.deviceName.toLowerCase() !== oldName.toLowerCase()
        )
        return otherDevices.some(
          device => device.deviceName.toLowerCase() === deviceName.toLowerCase()
        )
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const getDevicesList = async userID => {
  try {
    const deviceSettings = (await Device.findOne({ userID })) || {}
    const { devices } = deviceSettings
    return devices.map(device => device.deviceName)
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  getDevicesList,
  checkDeviceNameUniqueness
}
