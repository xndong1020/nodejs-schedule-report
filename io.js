var io = require("socket.io").listen(4000);

socketCounter = 0;

io.sockets.on("connection", socket => {
  socketCounter++;
  io.sockets.emit("client connect", socketCounter);

  socket.on("disconnect", () => {
    socketCounter--;
    io.sockets.emit("client connect", socketCounter);
  });
});

module.exports = {
  io
};
