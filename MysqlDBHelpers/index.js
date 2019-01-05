/* eslint camelcase:0 */

const mysql = require('../db/mysqldb')

const createTaskAsync = newTask => {
  const { task, task_category } = newTask
  const sql = `INSERT INTO tasks(task, task_category) VALUES('${task}', '${task_category}')`
  return new Promise((resolve, reject) => {
    mysql.db.query(sql, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

const updateTaskAsync = newTask => {
  const { task, task_id, task_category } = newTask
  const sql = `UPDATE tasks SET task='${task}', task_category='${task_category}' WHERE id=${task_id}`
  return new Promise((resolve, reject) => {
    mysql.db.query(sql, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

const findAllTasksAsync = () => {
  const sql = `SELECT * FROM tasks`
  return new Promise((resolve, reject) => {
    mysql.db.query(sql, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

const findTaskByIdAsync = id => {
  const sql = `SELECT * FROM tasks WHERE id=${id}`
  return new Promise((resolve, reject) => {
    mysql.db.query(sql, (err, result) => {
      if (err) return reject(err)
      return resolve(result)
    })
  })
}

module.exports = {
  createTaskAsync,
  updateTaskAsync,
  findAllTasksAsync,
  findTaskByIdAsync
}
