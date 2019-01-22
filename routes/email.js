const express = require('express')
const router = express.Router()
const { getCallHistoryGetResultByID } = require('../mongodbHelpers')
const mailer = require('../services/emailService')

router.get('/:reportId', async (req, res) => {
  const reportId = req.params.reportId
  const result = await getCallHistoryGetResultByID(reportId)
  // send email to users
  try {
    await mailer.sendMail('isdance2004@hotmail.com', result.data)
    res.render('email', { title: 'Report has been sent to user.', reportId })
  } catch (error) {
    res.render('error')
  }
})

module.exports = router
