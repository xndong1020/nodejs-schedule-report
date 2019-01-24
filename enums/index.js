const taskType = {
  CALL_STATUS: 'call_status',
  CALL_HOLD_RESUME: 'hold_resume',
  UNATTENDED_TRANSFER: 'unattended_transfer'
}

const userRole = {
  ADMIN: 'admin',
  WEBEX_ADMIN: 'webex_admin',
  WEBEX_USER: 'webex_user',
  PURECLOUD_ADMIN: 'purecloud_admin',
  PURECLOUD_USER: 'purecloud_user'
}

module.exports = {
  taskType,
  userRole
}
