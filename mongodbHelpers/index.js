/* eslint camelcase:0 */

const { CallHistoryGetResultReport } = require('../models/CallHistoryGetResult')
const { CallHoldResumeResultReport } = require('../models/CallHoldResumeResult')
const { Task } = require('../models/Task')

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

const findTaskByID = id => {
  return new Promise((resolve, reject) => {
    Task.findById(id, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const updateTaskByID = (id, newTask) => {
  return new Promise((resolve, reject) => {
    Task.updateOne({ _id: id }, newTask, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const updateTaskStatus = async (taskId, status, date, reportId) => {
  try {
    let result
    const taskInDb = await findTaskByID(taskId)

    if (taskInDb) {
      let { completion_date } = taskInDb
      completion_date.push(date)
      taskInDb.completion_date = completion_date
      taskInDb.status = status
      taskInDb.reportId = reportId

      result = await updateTaskByID(taskId, taskInDb)
    }
    return result
  } catch (e) {
    console.log(e)
  }
}

module.exports = {
  saveCallHistoryGetResult,
  readCallHistoryGetResultByID,
  getCallHistoryReportList,
  readCallHoldResumeReportByID,
  getCallHoldResumeReportList,
  updateTaskStatus,
  findTaskByID,
  updateTaskByID
}
