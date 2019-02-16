const axios = require('axios')
const xml2jsonConverter = require('../utils/xml2json')
const { getBasicAuthHeader } = require('../utils/auth.util')
const { payloadFactory } = require('../factories/payloadFactory')

const getCallHistory = async device => {
  const { deviceUrl, deviceUsername, devicePassword } = device
  const callResponse = await axios.post(
    deviceUrl,
    payloadFactory('callHistoryGet', null),
    getBasicAuthHeader(deviceUsername, devicePassword)
  )

  const callResponseJson = await xml2jsonConverter(callResponse.data)
  return callResponseJson
}

const checkDeviceStatus = async device => {
  try {
    const callHistoryResponse = await getCallHistory(device)
    return !!callHistoryResponse
  } catch (e) {
    return false
  }
}

module.exports = {
  getCallHistory,
  checkDeviceStatus
}
