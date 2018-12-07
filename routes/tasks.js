const express = require("express");
const router = express.Router();
const { io } = require("../io");

router.post("/", (req, res) => {
  const task = req.body;
  io.sockets.emit("newTask", task);
  res.send(task);
});

module.exports = router;
