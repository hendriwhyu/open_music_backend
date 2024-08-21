const amqp = require('amqplib');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(connection);

    await channel.sendToQueue(queue, Buffer.from(message));
    setTimeout(() => {
      connection.close();
    }, 1000);
    return `Message sent to ${queue}: ${message}`;
  },
};

module.exports = ProducerService;
