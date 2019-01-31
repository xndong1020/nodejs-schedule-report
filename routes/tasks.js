/* eslint camelcase:0 */

const express = require('express')
const moment = require('moment')
const router = express.Router()
const { Task } = require('../models/Task')
const { taskType } = require('../enums')
const { getDevicesList } = require('../utils/device.util')
const { io } = require('../io')

router.get('/', async (req, res) => {
  res.render('calendar', { layout: 'layout_calendar' })
})

router.get('/admin_tasks', async (req, res) => {
  const { _id } = req.user
  const tasks = await Task.find({ userID: _id }, { __v: 0 })
  res.render('admin_tasks', { tasks })
})

router.get('/create', async (req, res) => {
  const { _id } = req.user
  const taskTypeKeys = Object.keys(taskType)
  const taskTypeValues = Object.keys(taskType).map(key => {
    return taskType[key]
  })
  const deviceNameList = await getDevicesList(_id)
  res.render('create_task', {
    title: 'Create Task',
    deviceNameList,
    taskTypeKeys,
    taskTypeValues
  })
})

router.get('/edit/:taskId', async (req, res) => {
  const { _id } = req.user
  const { taskId } = req.params
  const targetTaskObj = await Task.findOne({ _id: taskId })
  const {
    primary_device,
    secondary_device,
    third_device,
    fourth_device,
    task_type
  } = targetTaskObj
  const taskTypeKeys = Object.keys(taskType)
  const taskTypeValues = Object.keys(taskType).map(key => {
    return taskType[key]
  })
  const taskTypeIndex = taskTypeValues.findIndex(key => key === task_type)

  const deviceNameList = await getDevicesList(_id)

  const primaryDeviceIndex = deviceNameList.findIndex(
    device => device === primary_device
  )
  const secondaryDeviceIndex = deviceNameList.findIndex(
    device => device === secondary_device
  )
  const thirdDeviceIndex = deviceNameList.findIndex(
    device => device === third_device
  )
  const fourthDeviceIndex = deviceNameList.findIndex(
    device => device === fourth_device
  )
  const start_date_str = moment(targetTaskObj.start_date).format('L')
  const end_date_str = moment(targetTaskObj.end_date).format('L')

  res.render('edit_task', {
    title: 'Edit Task',
    deviceNameList,
    taskTypeKeys,
    taskTypeValues,
    task: targetTaskObj,
    taskTypeIndex,
    primaryDeviceIndex,
    secondaryDeviceIndex,
    thirdDeviceIndex,
    fourthDeviceIndex,
    start_date: start_date_str,
    end_date: end_date_str
  })
})

router.post('/edit/:taskId', async (req, res) => {
  const { taskId } = req.params

  try {
    await Task.updateOne({ _id: taskId }, { ...req.body })
    io.sockets.emit('taskUpdated', taskId)
    req.flash('success_msg', 'New Task Has Been Updated Successfully.')
    res.redirect('/tasks/admin_tasks')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/tasks/admin_tasks')
  }
})

router.post('/create', async (req, res) => {
  const { _id } = req.user
  const data = {
    ...req.body,
    userID: _id,
    status: 'pending',
    reportId: '',
    completion_date: []
  }

  try {
    const newTask = await Task.create(data)
    io.sockets.emit('newTask', newTask)
    req.flash('success_msg', 'New Task Has Been Created Successfully.')
    res.redirect('/tasks/admin_tasks')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/tasks/admin_tasks')
  }
})

router.post('/delete/:taskId', async (req, res) => {
  const { taskId } = req.params

  try {
    await Task.deleteOne({ _id: taskId })
    req.flash('success_msg', 'New Task Has Been Deleted Successfully.')
    res.redirect('/tasks/admin_tasks')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/tasks/admin_tasks')
  }
})

// router.get('/data', async (req, res) => {
//   const { _id } = req.user
//   const tasks = await Task.find({ userID: _id }, { __v: 0 })
//   const results = tasks.map(task => {
//     return {
//       id: task._id,
//       userID: _id,
//       task_type: task.task_type,
//       primary_device: task.primary_device,
//       secondary_device: task.secondary_device,
//       third_device: task.third_device,
//       text: task.text,
//       start_date: task.start_date,
//       end_date: task.end_date,
//       color: task.color || ''
//     }
//   })
//   res.send(results)
// })

// router.post('/data', (req, res) => {
//   const body = req.body
//   let data = { ...body }
//   data.status = 'pending'
//   data.reportId = ''
//   data.completion_date = []

//   // get operation type
//   let mode = data['!nativeeditor_status']
//   // get id of record
//   const sid = data.id
//   let tid = sid

//   // remove properties which we do not want to save in DB
//   delete data.id
//   delete data['!nativeeditor_status']

//   // output confirmation response
//   const callback_response = (err, result) => {
//     if (err) mode = 'error'
//     else if (mode === 'inserted') tid = data._id

//     const newTask = { action: mode, sid: sid, tid: tid }
//     io.sockets.emit('newTask', newTask)
//     res.setHeader('Content-Type', 'application/json')
//     res.send(newTask)
//   }

//   // run db operation
//   if (mode === 'updated') Task.updateOne({ _id: sid }, data, callback_response)
//   else if (mode === 'inserted') Task.create(data, callback_response)
//   else if (mode === 'deleted') Task.deleteOne({ _id: sid }, callback_response)
//   else res.send('Not supported operation')
// })

module.exports = router
