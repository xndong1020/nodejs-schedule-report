const express = require('express')
const router = express.Router()
require('dotenv').config()
// const emailService = require('../services/emailService')
const { getImageBase64String } = require('../services/screenshotsService')

const SCREENSHOTS_BASE_URL = process.env.SCREENSHOTS_BASE_URL

router.post('/:reportId', async (req, res) => {
  const { id } = req.user
  const { reportId } = req.params
  const { reportType } = req.body
  const reportUrl = `${SCREENSHOTS_BASE_URL}/reports/${reportType}/${reportId}`
  // send email to users
  try {
    // await emailService.sendMail('isdance2004@hotmail.com', result.data)
    // console.log('reportUrl', reportUrl, reportId)
    const imageStr = await getImageBase64String(id, reportUrl, reportId)
    res.render('email', {
      title: 'Report has been sent to user.',
      layout: 'layout_clear',
      imageStr: imageStr.data
    })
  } catch (error) {
    console.error('email error', error)
    res.render('error', { message: error.message, error })
  }
})

module.exports = router
