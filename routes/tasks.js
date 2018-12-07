var express = require("express");
var router = express.Router();
var { io } = require("../io");

router.post("/", function(req, res, next) {
  const task = req.body;
  io.sockets.emit("newTask", task);
  res.send(task);
});

module.exports = router;
