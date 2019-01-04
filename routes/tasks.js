const express = require("express");
const router = express.Router();
const { Task } = require("../models/Task");
const { io } = require("../io");


router.get("/", async (req, res) => {
  res.render("calendar");
});

router.post("/", async (req, res) => {
  const newTask = req.body;
  io.sockets.emit("newTask", newTask);
  res.status(200).send(newTask);
});

// router.get('/init', async (req, res) =>{
//   await Task.create({ 
//       text:"My test event A", 
//       task_type: "call_test",
//       start_date: new Date(2019,1,3),
//       end_date:   new Date(2019,1,5)
//   });
//   await Task.create({ 
//       text:"One more test event", 
//       task_type: "onhold_test",
//       start_date: new Date(2019,1,3),
//       end_date:   new Date(2019,1,8),
//       color: "#DD8616"
//   });

//   /*... skipping similar code for other test events...*/

//   res.send("Test events were added to the database")
// });


router.get('/data', async (req, res) => {
  const tasks = await Task.find({},{ __v:0 });
  const results = tasks.map(task => {
    return {
      id: task._id,
      task_type: task.task_type,
      text: task.text,
      start_date: task.start_date,
      end_date: task.end_date,
      color: task.color || "" 
    }
  });
  res.send(results);
});

router.post('/data', function(req, res){
  var data = req.body;
  console.log(data);
  //get operation type
  var mode = data["!nativeeditor_status"];
  //get id of record
  var sid = data.id;
  var tid = sid;

  //remove properties which we do not want to save in DB
  delete data.id;
  delete data["!nativeeditor_status"];


  //output confirmation response
  function callback_response(err, result){
      if (err)
          mode = "error";
      else if (mode == "inserted")
          tid = data._id;

      res.setHeader("Content-Type","application/json");
      res.send({action: mode, sid: sid, tid: tid});

  }

  //run db operation
  if (mode == "updated")
      Task.update({_id: sid}, data, callback_response);
  else if (mode == "inserted")
      Task.create(data, callback_response);
  else if (mode == "deleted")
      Task.deleteOne( {_id: sid}, callback_response);
  else
      res.send("Not supported operation");
});

module.exports = router;
