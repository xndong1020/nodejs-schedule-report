const axios = require('axios')
require('dotenv').config()
const SCREENSHOTS_SERVICE_URL =
  process.env.SCREENSHOTS_SERVICE_URL || 'http://localhost:5000/screenshots'

const getImageBase64String = async (userID, url, reportId) => {
  const imageBase64str = await axios.post(SCREENSHOTS_SERVICE_URL, {
    userID,
    url,
    reportId
  })
  return imageBase64str
}

module.exports = {
  getImageBase64String
}
