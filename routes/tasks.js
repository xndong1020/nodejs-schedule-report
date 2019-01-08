/* eslint camelcase:0 */

const express = require('express')
const router = express.Router()
const { Task } = require('../models/Task')
const { randomHexGenerator } = require('../utils/color.util')
const { io } = require('../io')

router.get('/', async (req, res) => {
  res.render('calendar')
})

router.get('/data', async (req, res) => {
  const tasks = await Task.find({}, { __v: 0 })
  const results = tasks.map(task => {
    return {
      id: task._id,
      recipient: task.recipient,
      task_type: task.task_type,
      text: task.text,
      start_date: task.start_date,
      end_date: task.end_date,
      color: task.color || ''
    }
  })
  res.send(results)
})

router.post('/data', (req, res) => {
  const body = req.body
  const { _id } = req.user
  let data = body.color
    ? { ...body }
    : { ...body, color: randomHexGenerator() }
  data.userID = _id
  console.log(data)

  // get operation type
  let mode = data['!nativeeditor_status']
  // get id of record
  const sid = data.id
  let tid = sid

  // remove properties which we do not want to save in DB
  delete data.id
  delete data['!nativeeditor_status']

  // output confirmation response
  const callback_response = (err, result) => {
    if (err) mode = 'error'
    else if (mode === 'inserted') tid = data._id

    const newTask = { action: mode, sid: sid, tid: tid }
    io.sockets.emit('newTask', newTask)
    res.setHeader('Content-Type', 'application/json')
    res.send(newTask)
  }

  // run db operation
  if (mode === 'updated') Task.updateOne({ _id: sid }, data, callback_response)
  else if (mode === 'inserted') Task.create(data, callback_response)
  else if (mode === 'deleted') Task.deleteOne({ _id: sid }, callback_response)
  else res.send('Not supported operation')
})

module.exports = router
