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
    await Task.updateOne(
      { _id: taskId },
      {
        ...req.body,
        start_date: (new Date(req.body.start_date)).toISOString(),
        end_date: (new Date(req.body.end_date)).toISOString()
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
    start_date: (new Date(req.body.start_date)).toISOString(),
    end_date: (new Date(req.body.end_date)).toISOString(),
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
