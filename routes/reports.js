const express = require('express')
const router = express.Router()
const {
  readCallHistoryGetResultByID,
  getCallHistoryReportList,
  readCallHoldResumeReportByID,
  getCallHoldResumeReportList,
  readCallUnattendedTransferResultReportID,
  getCallUnattendedTransferResultReportList

} = require('../mongodbHelpers')
// const mailer = require("../services/emailService");

// GET: /reports/
router.get('/', async (req, res) => {
  res.render('reports_lists', {
    title: `All Reports`
  })
})

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
  const { _id } = req.user
  const results = (await getCallHistoryReportList(_id)).map(data => {
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
  const { _id } = req.user
  const response = await getCallHoldResumeReportList(_id)
  const results = response.map((data, idx, results) => {
    const { _id, date } = data
    const allTests = results[0].data
    const failedTest = allTests.filter(
      test => test.CallHoldStatus !== 'OK' || test.CallResumeStatus !== 'OK'
    )

    return {
      reportId: _id,
      date,
      passed: failedTest.length === 0
    }
  })

  res.render('hold_resume_reports_list', {
    title: `hold_resume Reports`,
    results
  })
})

// GET: /reports/unattended_transfer/:reportId
router.get('/unattended_transfer/:reportId', async (req, res) => {
  const id = req.params.reportId
  const result = await readCallUnattendedTransferResultReportID(id)
  res.render('unattended_transfer_report', {
    title: `Report for ${id}`,
    results: result.data,
    results_str: JSON.stringify(result.data)
  })
})

// GET: /reports/unattended_transfer/
router.get('/unattended_transfer', async (req, res) => {
  const { _id } = req.user
  const response = await getCallUnattendedTransferResultReportList(_id)
  const results = response.map((data, idx, results) => {
    const { _id, date } = data
    const allTests = results[0].data
    const failedTest = allTests.filter(
      test => test.callUnattendedTransferStatus !== 'OK'
    )

    return {
      reportId: _id,
      date,
      passed: failedTest.length === 0
    }
  })

  res.render('unattended_transfer_reports_list', {
    title: `unattended_transfer Reports`,
    results
  })
})

module.exports = router
