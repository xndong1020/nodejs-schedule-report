require('dotenv').config()
const amqplib = require('amqplib')

const enqueueEmailMessage = async data => {
  try {
    const connection = await amqplib.connect(process.env.RABBITMQ_SERVER_URL)
    const channel = await connection.createChannel()
    await channel.assertQueue('email')
    await channel.sendToQueue('email', Buffer.from(data))
  } catch (err) {
    console.warn(err)
  }
}

module.exports = {
  enqueueEmailMessage
}
