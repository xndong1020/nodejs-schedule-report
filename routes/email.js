const express = require('express')
const router = express.Router()
require('dotenv').config()
const { enqueueEmailMessage } = require('../services/rabbitmqService')

const SCREENSHOTS_BASE_URL = process.env.SCREENSHOTS_BASE_URL

router.post('/:reportId', async (req, res) => {
  const { id, name, email } = req.user
  const { reportId } = req.params
  const { reportType } = req.body
  const reportUrl = `${SCREENSHOTS_BASE_URL}/reports/${reportType}/${reportId}`

  try {
    // enqueue email to rabbitmq
    await enqueueEmailMessage(
      JSON.stringify({ id, name, email, reportUrl, reportId })
    )
    res.render('email', {
      title: 'Report has been sent to user.',
      name,
      email
    })
  } catch (error) {
    console.error('email error', error)
    res.render('error', { message: error.message, error })
  }
})

module.exports = router
