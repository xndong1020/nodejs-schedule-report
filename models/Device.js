const mongoose = require('mongoose')

const DeviceListSchema = new mongoose.Schema({
  deviceType: {
    type: String,
    required: true
  },
  deviceUrl: {
    type: String,
    required: true
  },
  deviceUsername: {
    type: String,
    required: true
  },
  devicePassword: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
})

const DeviceSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  devices: [DeviceListSchema]
})

const Device = mongoose.model('Device', DeviceSchema)

module.exports = {
  Device
}
