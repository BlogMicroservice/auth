import amqplib from 'amqplib';

export let channel: amqplib.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ Connection Error:', error);
  }
};

export const publishMessage = async (queue: string, message: any) => {
  await channel.assertQueue(queue, { durable: false });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log(`Sent message to ${queue}:`, message);
};