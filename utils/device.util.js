const { Device } = require('../models/Device')

// returns true means a device with the same name was already created
const checkDeviceNameUniqueness = async (
  deviceId,
  deviceName,
  action,
  userID
) => {
  console.log('checkDeviceNameUniqueness', deviceId, deviceName, action)
  try {
    if (action === 'add') {
      const device = await Device.findOne({ deviceName })
      return !!device
    } else if (action === 'edit') {
      const device = await Device.findOne({ deviceName })
      if (!device) return false
      const isSameDevice = device.toObject()._id.toString() === deviceId
      return !isSameDevice
    }
  } catch (e) {
    console.error(e)
  }
}

const getDevicesList = async () => {
  try {
    const devices = (await Device.find({})) || []
    return devices
  } catch (e) {
    console.error(e)
  }
}

const getDeviceById = async deviceId => {
  try {
    const device = (await Device.findOne({ _id: deviceId })) || {}
    return device
  } catch (e) {
    console.error(e)
  }
}

module.exports = {
  getDevicesList,
  getDeviceById,
  checkDeviceNameUniqueness
}
