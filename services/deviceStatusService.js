const axios = require('axios')
const xml2jsonConverter = require('../utils/xml2json')
const { getBasicAuthHeader } = require('../utils/auth.util')
const { deviceStatusReader } = require('../readers/deviceStatusReader')

const deviceStatusUrlHelper = (
  deviceProtocol,
  deviceIPAddress,
  devicePortNumber
) => {
  if (!deviceProtocol || !deviceIPAddress || !devicePortNumber) return false
  return `${deviceProtocol}://${deviceIPAddress}:${devicePortNumber}/status.xml`
}

const getDeviceStatus = async device => {
  const {
    deviceProtocol,
    deviceIPAddress,
    devicePortNumber,
    deviceUsername,
    devicePassword
  } = device

  const statusResponse = await axios.get(
    deviceStatusUrlHelper(deviceProtocol, deviceIPAddress, devicePortNumber),
    getBasicAuthHeader(deviceUsername, devicePassword)
  )
  const statusResponseJson = await xml2jsonConverter(statusResponse.data)
  return statusResponseJson
}

const getDeviceInfo = async device => {
  const statusResponseJson = await getDeviceStatus(device)
  const info = await deviceStatusReader(statusResponseJson)
  return info
}

const checkDeviceStatus = async device => {
  try {
    const deviceInfoResponse = await getDeviceInfo(device)
    const { status } = deviceInfoResponse
    return status && status.toLowerCase() === 'Registered'.toLowerCase()
  } catch (e) {
    return false
  }
}

module.exports = {
  getDeviceStatus,
  getDeviceInfo,
  checkDeviceStatus
}
