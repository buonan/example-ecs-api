const { Kafka } = require('kafkajs')

const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'kafka:9092';
console.log(`KAFKA_BROKERS: ${KAFKA_BROKERS}`)
const kafka = new Kafka({
  clientId: `kafka-worker-${process.env.TOPIC}`,
  brokers: KAFKA_BROKERS.split(','),
});
module.exports = kafka