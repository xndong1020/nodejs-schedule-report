/* eslint camelcase:0 */

const { DateTime } = require('luxon')
const io = require('socket.io').listen(4000)
const { updateTaskStatus } = require('./mongodbHelpers')

let socketCounter = 0

io.sockets.on('connection', socket => {
  socketCounter++
  io.sockets.emit('client connect', socketCounter)

  socket.on('disconnect', () => {
    socketCounter--
    io.sockets.emit('client connect', socketCounter)
  })

  // forward message to client side
  socket.on('taskComplete', data => {
    io.sockets.emit('taskComplete', data)
  })

  socket.on('testProcessReport', data => {
    io.sockets.emit('testProcessReport', data)
  })

  socket.on('taskComplete', async data => {
    const { reportId, taskID, error } = data
    console.log('reportId', reportId, taskID)
    const task_status = reportId && !error ? 'complete' : 'fail'
    const completion_date = DateTime.local().toLocaleString(
      DateTime.DATETIME_MED_WITH_SECONDS
    )
    await updateTaskStatus(taskID, task_status, completion_date, reportId)
  })
})

module.exports = {
  io
}
