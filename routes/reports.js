const express = require('express')
const router = express.Router()
const {
  readCallHistoryGetResultByID,
  getCallHistoryReportList,
  readCallHoldResumeReportByID,
  getCallHoldResumeReportList
} = require('../mongodbHelpers')
// const mailer = require("../services/emailService");

// GET: /reports/call_status/:reportId
router.get('/call_status/:reportId', async (req, res) => {
  const id = req.params.reportId
  const result = await readCallHistoryGetResultByID(id)
  res.render('call_status_report', {
    title: `Report for ${id}`,
    results: result.data,
    results_str: JSON.stringify(result.data)
  })
})

// GET: /reports/call_status/
router.get('/call_status', async (req, res) => {
  const results = (await getCallHistoryReportList()).map(data => {
    return {
      reportId: data._id,
      date: data.date,
      status: data.data[0].status
    }
  })
  res.render('call_status_reports_list', {
    title: `call_status Reports`,
    results
  })
})

// GET: /reports/hold_resume/:reportId
router.get('/hold_resume/:reportId', async (req, res) => {
  const id = req.params.reportId
  const result = await readCallHoldResumeReportByID(id)
  res.render('hold_resume_report', {
    title: `Report for ${id}`,
    results: result.data,
    results_str: JSON.stringify(result.data)
  })
})

// GET: /reports/hold_resume/
router.get('/hold_resume', async (req, res) => {
  const results = (await getCallHoldResumeReportList()).map((data, idx) => {
    return {
      reportId: data._id,
      date: data.date,
      passed:
        data.data[idx].CallHoldStatus === 'OK' &&
        data.data[idx].CallResumeStatus === 'OK',
      status: `Hold status is ${
        data.data[idx].CallHoldStatus
      }, resume status is ${data.data[idx].CallResumeStatus}`
    }
  })

  res.render('hold_resume_reports_list', {
    title: `hold_resume Reports`,
    results
  })
})

module.exports = router
