const { Device } = require('../models/Device')

const checkDeviceNameUniqueness = async (deviceName, userID) => {
  try {
    const deviceSettings =
      (await Device.findOne({ userID })) || {}
    const { devices } = deviceSettings
    if (Array.isArray(devices)) {
      return devices.some(
        device => device.deviceName.toLowerCase() === deviceName.toLowerCase()
      )
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  checkDeviceNameUniqueness
}
