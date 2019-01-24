const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error_msg', 'Please log in to view that resource')
  res.redirect('/users/login')
}

const ensureAdminAccess = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next()
  }
  req.flash('error_msg', 'Sorry, you don\'t have admin access to view this page ')
  res.redirect('/')
}

const ensureWebexAccess = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role.indexOf('webex') !== -1) {
    return next()
  }
  req.flash('error_msg', 'Sorry, you don\'t have permission to view this page ')
  res.redirect('/')
}

const ensurePureCloudAccess = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role.indexOf('purecloud') !== -1) {
    return next()
  }
  req.flash('error_msg', 'Sorry, you don\'t have permission access to view this page ')
  res.redirect('/')
}

module.exports = {
  ensureAuthenticated,
  ensureAdminAccess,
  ensureWebexAccess,
  ensurePureCloudAccess
}
