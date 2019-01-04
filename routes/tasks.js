const express = require("express");
const router = express.Router();
const { io } = require("../io");
// const { createTaskAsync, updateTaskAsync } = require("../MysqlDBHelpers");

router.post("/", async (req, res) => {
  const newTask = req.body;
  io.sockets.emit("newTask", newTask);
  res.status(200).send(newTask);
});

module.exports = router;
