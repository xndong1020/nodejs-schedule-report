const io = require('socket.io').listen(4000)

let socketCounter = 0

io.sockets.on('connection', socket => {
  socketCounter++
  io.sockets.emit('client connect', socketCounter)

  socket.on('disconnect', () => {
    socketCounter--
    io.sockets.emit('client connect', socketCounter)
  })

  socket.on('taskComplete', data => {
    console.log('taskComplete', data)
  })
})

module.exports = {
  io
}
