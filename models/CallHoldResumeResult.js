/* eslint new-cap:0 */

const mongoose = require('mongoose')
const { getLocalNowWithTimezone } = require('../utils/time.util')

// Define a schema
const CallHoldResumeResultSchema = new mongoose.Schema({
  CallId: String,
  CallHoldStatus: String,
  CallResumeStatus: String,
  CallHoldErrorCause: String,
  CallHoldErrorDescription: String,
  CallResumeErrorCause: String,
  CallResumeErrorDescription: String
})

const CallHoldResumeResultReportSchema = new mongoose.Schema({
  data: Array,
  userID: String,
  taskId: String,
  type: String,
  date: {
    type: String,
    default: getLocalNowWithTimezone('Australia/Sydney')
  }
})

const CallHoldResumeResult = new mongoose.model(
  'CallHoldResumeResult',
  CallHoldResumeResultSchema
)

const CallHoldResumeResultReport = new mongoose.model(
  'CallHoldResumeResultReport',
  CallHoldResumeResultReportSchema
)

module.exports = {
  CallHoldResumeResult,
  CallHoldResumeResultReport
}
