const { Kafka } = require('kafkajs')
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'kafka:9092';
console.log(`KAFKA_BROKERS: ${KAFKA_BROKERS}`)
const kafka = new Kafka({
  clientId: 'kafka-client-1',
  brokers: KAFKA_BROKERS.split(','),
});
const consumer = kafka.consumer({ groupId: 'test-group' });

(async () => {
    await consumer.subscribe({ topics: ['test'] });
    consumer.run({
        eachBatchAutoResolve: false,
        eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }: any) => {
            for (let message of batch.messages) {
                if (!isRunning() || isStale()) break
                console.log({
                    topic: batch.topic,
                    partition: batch.partition,
                    highWatermark: batch.highWatermark,
                    message: {
                        offset: message.offset,
                        value: message.value.toString(),
                        headers: message.headers,
                    }
                })
                resolveOffset(message.offset)
                await heartbeat()
            }
        }
    })

})();