/* eslint camelcase:0 */

const express = require('express')
const { DateTime } = require('luxon')
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
  const start_date_str = DateTime.fromFormat(
    targetTaskObj.start_date,
    'MMMM d, yyyy'
  ).toISODate()
  const end_date_str = DateTime.fromFormat(
    targetTaskObj.end_date,
    'MMMM d, yyyy'
  ).toISODate()

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
    await Task.updateOne(
      { _id: taskId },
      {
        ...req.body
      }
    )
    io.sockets.emit('taskUpdated', taskId)
    req.flash('success_msg', 'Task has been updated successfully.')
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
    start_date: DateTime.fromFormat(
      req.body.start_date,
      'MMMM d, yyyy'
    ).toLocaleString(DateTime.DATE_FULL),
    end_date: DateTime.fromFormat(
      req.body.end_date,
      'MMMM d, yyyy'
    ).toLocaleString(DateTime.DATE_FULL),
    userID: _id,
    status: 'pending',
    reportId: '',
    completion_date: []
  }

  try {
    const newTask = await Task.create(data)
    io.sockets.emit('newTask', newTask)
    req.flash('success_msg', 'New task has been created successfully.')
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
    io.sockets.emit('taskDeleted', taskId)
    req.flash('success_msg', 'Task has been deleted successfully.')
    res.redirect('/tasks/admin_tasks')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/tasks/admin_tasks')
  }
})

module.exports = router
