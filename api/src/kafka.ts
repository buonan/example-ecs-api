const { Kafka } = require('kafkajs')
const crypt = require('crypto');
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'kafka:9092';
console.log(`KAFKA_BROKERS: ${KAFKA_BROKERS}`)
const uuid = crypt.randomUUID();
const kafka = new Kafka({
  clientId: `server-${uuid}`,
  brokers: KAFKA_BROKERS.split(','),
})

module.exports = kafka