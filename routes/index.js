const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../auth/auth')

/* GET home page. */
router.get('/', [ensureAuthenticated], (req, res) => {
  res.render('dashboard', { title: 'Pinnacle' })
})

module.exports = router
