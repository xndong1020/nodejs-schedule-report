const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../auth/auth')

/* GET home page. */
router.get('/', [ensureAuthenticated], (req, res) => {
  const { role } = req.user
  const showAdminComponents = role === 'admin'
  const showWebexComponents = role === 'admin' || role.indexOf('webex') !== -1
  const showPurecloudComponents =
    role === 'admin' || role.indexOf('purecloud') !== -1

  res.render('dashboard', {
    title: 'Pinnacle',
    showAdminComponents,
    showWebexComponents,
    showPurecloudComponents
  })
})

module.exports = router
