const express = require('express')
const router = express.Router()
// const emailService = require('../services/emailService')
const { getImageBase64String } = require('../services/screenshotsService')

router.post('/:reportId', async (req, res) => {
  const { id } = req.user
  const { reportId } = req.params
  const { reportType } = req.body
  const reportUrl = `${req.protocol}://${req.get(
    'host'
  )}/reports/${reportType}/${reportId}`
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
    res.render('error')
  }
})

module.exports = router
