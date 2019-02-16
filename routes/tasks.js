/* eslint camelcase:0 */

const express = require('express')
const { DateTime } = require('luxon')
const router = express.Router()
const { Task } = require('../models/Task')
const { taskType } = require('../enums')
const { getDevicesList } = require('../utils/device.util')
const { io } = require('../io')
const { check, validationResult } = require('express-validator/check')

router.get('/', async (req, res) => {
  res.render('calendar', { layout: 'layout_calendar' })
})

router.get('/admin_tasks', async (req, res) => {
  const tasks = await Task.find({}, { __v: 0 })
  res.render('admin_tasks', { tasks })
})

router.get('/create', async (req, res) => {
  const { _id } = req.user
  const taskTypeKeys = Object.keys(taskType)
  const taskTypeValues = Object.keys(taskType).map(key => {
    return taskType[key]
  })
  const deviceList = (await getDevicesList(_id)) || []
  const deviceNameList = deviceList.map(device => device.deviceName)
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

  const deviceList = (await getDevicesList(_id)) || []
  const deviceNameList = deviceList.map(device => device.deviceName)

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

router.post(
  '/edit/:taskId',
  [
    check('text')
      .not()
      .isEmpty()
      .withMessage('Please provide a valid task description'),
    check('task_type')
      .not()
      .isEmpty()
      .withMessage('Please select a valid task type'),
    check('primary_device')
      .not()
      .isEmpty()
      .withMessage('Please select a device for testing'),
    check('secondary_device')
      .not()
      .isEmpty()
      .withMessage('Please select a device for testing'),
    check('third_device')
      .not()
      .isEmpty()
      .withMessage('Please select a device for testing')
  ],
  async (req, res) => {
    const { taskId } = req.params
    const { _id } = req.user
    const checkResult = validationResult(req)
    const errors = checkResult.array()

    if (!checkResult.isEmpty()) {
      const taskTypeKeys = Object.keys(taskType)
      const taskTypeValues = Object.keys(taskType).map(key => {
        return taskType[key]
      })
      const {
        primary_device,
        secondary_device,
        third_device,
        fourth_device,
        task_type
      } = req.body
      const taskTypeIndex = taskTypeValues.findIndex(key => key === task_type)

      const deviceList = (await getDevicesList(_id)) || []
      const deviceNameList = deviceList.map(device => device.deviceName)

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
      const start_date_str = req.body.start_date
        ? DateTime.fromFormat(req.body.start_date, 'MMMM d, yyyy').toISODate()
        : ''
      const end_date_str = req.body.end_date
        ? DateTime.fromFormat(req.body.end_date, 'MMMM d, yyyy').toISODate()
        : ''

      res.render('edit_task', {
        title: 'Edit Task',
        errors,
        deviceNameList,
        taskTypeKeys,
        taskTypeValues,
        task: { ...req.body, _id: taskId },
        taskTypeIndex,
        primaryDeviceIndex,
        secondaryDeviceIndex,
        thirdDeviceIndex,
        fourthDeviceIndex,
        start_date: start_date_str,
        end_date: end_date_str,
        error_msg: '',
        success_msg: ''
      })
    } else {
      try {
        const run_now =
          !req.body.start_date && !req.body.end_date && !req.body.run_at
        await Task.updateOne(
          { _id: taskId },
          {
            ...req.body,
            run_now
          }
        )
        io.sockets.emit('taskUpdated', {
          ...req.body,
          run_now
        })
        req.flash('success_msg', 'Task has been updated successfully.')
        res.redirect('/tasks/admin_tasks')
      } catch (err) {
        req.flash(
          'error_msg',
          'Oops. Something went wrong on our server. Please try again later' +
            err
        )
        res.redirect('/tasks/admin_tasks')
      }
    }
  }
)

router.post(
  '/create',
  [
    check('text')
      .not()
      .isEmpty()
      .withMessage('Please provide a valid task description'),
    check('task_type')
      .not()
      .isEmpty()
      .withMessage('Please select a valid task type'),
    check('primary_device')
      .not()
      .isEmpty()
      .withMessage('Please select a device for testing'),
    check('secondary_device')
      .not()
      .isEmpty()
      .withMessage('Please select a device for testing'),
    check('third_device')
      .not()
      .isEmpty()
      .withMessage('Please select a device for testing')
  ],
  async (req, res) => {
    const { _id } = req.user
    const taskTypeKeys = Object.keys(taskType)
    const taskTypeValues = Object.keys(taskType).map(key => {
      return taskType[key]
    })
    const deviceList = (await getDevicesList(_id)) || []
    const deviceNameList = deviceList.map(device => device.deviceName)
    const checkResult = validationResult(req)
    const errors = checkResult.array()

    if (!checkResult.isEmpty()) {
      // client-side validation failed
      const {
        text,
        task_type,
        primary_device,
        secondary_device,
        fourth_device,
        third_device,
        start_date,
        end_date,
        run_at
      } = req.body
      res.render('create_task', {
        errors,
        title: 'Create Task',
        text,
        task_type,
        primary_device,
        secondary_device,
        third_device,
        fourth_device,
        start_date,
        end_date,
        run_at,
        taskTypeKeys,
        taskTypeValues,
        deviceNameList,
        error_msg: '',
        success_msg: ''
      })
    } else {
      let data
      if (req.body.start_date && req.body.end_date && req.body.run_at) {
        data = {
          ...req.body,
          start_date: DateTime.fromFormat(
            req.body.start_date,
            'MMMM d, yyyy'
          ).toLocaleString(DateTime.DATE_FULL),
          end_date: DateTime.fromFormat(
            req.body.end_date,
            'MMMM d, yyyy'
          ).toLocaleString(DateTime.DATE_FULL),
          run_now: false,
          userID: _id,
          status: 'pending',
          reportId: '',
          completion_date: []
        }
      } else {
        data = {
          ...req.body,
          run_now: true,
          userID: _id,
          status: 'pending',
          reportId: '',
          completion_date: []
        }
      }

      try {
        const newTask = await Task.create(data)
        io.sockets.emit('newTask', newTask)
        req.flash('success_msg', 'New task has been created successfully.')
        res.redirect('/tasks/admin_tasks')
      } catch (err) {
        console.error('create err', err)
        req.flash(
          'error_msg',
          'Oops. Something went wrong on our server. Please try again later' +
            err
        )
        res.redirect('/tasks/admin_tasks')
      }
    }
  }
)

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

router.post('/reset/:taskId', async (req, res) => {
  const { taskId } = req.params

  try {
    await Task.updateOne(
      { _id: taskId },
      {
        $set: {
          status: 'pending'
        }
      }
    )
    req.flash('success_msg', 'Task has been reset successfully.')
    res.redirect('/tasks/admin_tasks')
  } catch (err) {
    req.flash(
      'error_msg',
      'Oops. Something went wrong on our server. Please try again later' + err
    )
    res.redirect('/tasks/admin_tasks')
  }
})

router.post('/run/:taskId', async (req, res) => {
  const { taskId } = req.params

  try {
    await Task.updateOne(
      { _id: taskId },
      {
        $set: {
          status: 'pending'
        }
      }
    )
    const updatedTask = await Task.findOne({ _id: taskId })
    io.sockets.emit('taskUpdated', updatedTask)
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

module.exports = router
