const express = require("express");
const router = express.Router();
const { io } = require("../io");
const { createTaskAsync, updateTaskAsync } = require("../MysqlDBHelpers");

router.post("/", async (req, res) => {
  const newTask = req.body;
  const { task_id } = newTask;
  let result = undefined,
    isSqlSuccessful = undefined,
    task = {};

  if (!task_id) {
    result = await createTaskAsync(newTask);
    isSqlSuccessful = result.affectedRows === 1 && result.insertId > 0;
    task = { ...newTask, task_id: result.insertId };
  } else {
    result = await updateTaskAsync(newTask);
    isSqlSuccessful = result.affectedRows === 1 && result.changedRows > 0;
    task = { ...newTask };
  }

  if (isSqlSuccessful) {
    io.sockets.emit("newTask", task);
    res.status(200).send(task);
  } else {
    res.status(500).send("Failed to create task");
  }
});

module.exports = router;
