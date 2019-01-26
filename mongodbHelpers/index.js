/* eslint camelcase:0 */

const { CallHistoryGetResultReport } = require('../models/CallHistoryGetResult')
const { CallHoldResumeResultReport } = require('../models/CallHoldResumeResult')
const {
  CallUnattendedTransferResultReport
} = require('../models/CallUnattendedTransferResult')
const { Task } = require('../models/Task')
const { Device } = require('../models/Device')
const { taskType } = require('../enums')

/* for Call History */
const saveCallHistoryGetResult = async data => {
  const result = await CallHistoryGetResultReport.create({ data })
  return result._id
}

const getCallHistoryGetResultByID = id => {
  return new Promise((resolve, reject) => {
    CallHistoryGetResultReport.findById(id, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}

const getCallHistoryGetResultByAssociatedReportId = associatedReportId => {
  return new Promise((resolve, reject) => {
    CallHistoryGetResultReport.findOne({ associatedReportId }, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  })
}

const getCallHistoryReportList = async userID => {
  const result = await CallHistoryGetResultReport.find({
    userID,
    type: taskType.CALL_STATUS
  }).sort({
    date: -1
  })
  return result
}

/* for Call Hold and Resume */
const getCallHoldResumeReportByID = id => {
  return new Promise((resolve, reject) => {
    CallHoldResumeResultReport.findById(id, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const getCallHoldResumeReportList = async userID => {
  const result = await CallHoldResumeResultReport.find({ userID }).sort({
    date: -1
  })
  return result
}

/* for Call Unattended Transfer */
const getCallUnattendedTransferResultReportID = id => {
  return new Promise((resolve, reject) => {
    CallUnattendedTransferResultReport.findById(id, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

const getCallUnattendedTransferResultReportList = async userID => {
  const result = await CallUnattendedTransferResultReport.find({ userID }).sort(
    {
      date: -1
    }
  )
  return result
}
/* for Task */

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

/* for Device */
const getDeviceSettingsByUserID = userID => {
  return new Promise((resolve, reject) => {
    Device.findOne({ userID }, { __v: 0 }, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

module.exports = {
  saveCallHistoryGetResult,
  getCallHistoryGetResultByID,
  getCallHistoryGetResultByAssociatedReportId,
  getCallHistoryReportList,
  getCallHoldResumeReportByID,
  getCallHoldResumeReportList,
  getCallUnattendedTransferResultReportID,
  getCallUnattendedTransferResultReportList,
  updateTaskStatus,
  findTaskByID,
  updateTaskByID,
  getDeviceSettingsByUserID
}
