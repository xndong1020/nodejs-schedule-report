const axios = require('axios')
const xml2jsonConverter = require('../utils/xml2json')
const { getBasicAuthHeader } = require('../utils/auth.util')
const { payloadFactory } = require('../factories/payloadFactory')

const getCallHistory = async settings => {
  const { deviceUrl, deviceUsername, devicePassword } = settings
  const callResponse = await axios.post(
    deviceUrl,
    payloadFactory('callHistoryGet', null),
    getBasicAuthHeader(deviceUsername, devicePassword)
  )

  const callResponseJson = await xml2jsonConverter(callResponse.data)
  return callResponseJson
}

const checkDeviceStatus = async settings => {
  try {
    const callHistoryResponse = await getCallHistory(settings)
    return !!callHistoryResponse
  } catch (e) {
    return false
  }
}

module.exports = {
  getCallHistory,
  checkDeviceStatus
}
