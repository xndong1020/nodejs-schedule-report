const { Device } = require('../models/Device')

// returns true means a device with the same name was already created
const checkDeviceNameUniqueness = async (
  deviceName,
  oldName,
  action,
  userID
) => {
  try {
    if (action === 'add') {
      const device = await Device.findOne({ deviceName })
      return !!device
    } else if (action === 'edit') {
      const device = await Device.findOne({ oldName })
      return !!device
    }
  } catch (e) {
    console.error(e)
  }
}

const getDevicesList = async () => {
  try {
    const devices = (await Device.find({ })) || []
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
