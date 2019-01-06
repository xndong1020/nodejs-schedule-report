const { CallHistoryGetResultReport } = require('../models/CallHistoryGetResult')
const { CallHoldResumeResultReport } = require('../models/CallHoldResumeResult')

const saveCallHistoryGetResult = async data => {
  const result = await CallHistoryGetResultReport.create({ data })
  return result._id
}

const readCallHistoryGetResultByID = id => {
  return new Promise((resolve, reject) => {
    CallHistoryGetResultReport.findById(id, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const getCallHistoryReportList = async () => {
  const result = await CallHistoryGetResultReport.find({}).sort({ date: -1 })
  return result
}

const readCallHoldResumeReportByID = id => {
  return new Promise((resolve, reject) => {
    CallHoldResumeResultReport.findById(id, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const getCallHoldResumeReportList = async () => {
  const result = await CallHoldResumeResultReport.find({}).sort({ date: -1 })
  return result
}

module.exports = {
  saveCallHistoryGetResult,
  readCallHistoryGetResultByID,
  getCallHistoryReportList,
  readCallHoldResumeReportByID,
  getCallHoldResumeReportList
}
