import mongoose from 'mongoose';
const kafka = require('./kafka')
const sleep = require("./sleep");
const pjson = require('../package.json');
const health = require('./health');
const mongo_root_username = 'root'
const mongo_root_password = 'example'
const mongo_admin = 'admin'

class Worker {
    private db_url = `mongodb://mongo:27017`;
    private consumer = kafka.consumer({ groupId: 'test-group' });
    private kafka_connected = false;

    constructor() {
    }

    async init() {
        await this.initializeConnections();
    }

    private async initializeConnections() {
        console.log(`MONGO_INITDB_URL: ${this.db_url}`);
        await mongoose.connect(`${this.db_url}`, {
            authSource: mongo_admin,
            auth: {
                username: mongo_root_username,
                password: mongo_root_password
            },
        }).then(() => {
            console.log("Mongodb connected!")
        }).catch((err: any) => {
            console.log(err)
        });
        let retry = 3;
        while (retry > 0 && this.kafka_connected === false) {
            try {
                await this.consumer.connect();
                this.kafka_connected = true;
            } catch (error) {
                console.log('Error connecting the consumer: ', error);
                this.kafka_connected = false;
            }
            sleep(1);
            retry--;
        }
        console.log('Kafka consumer connected: ', this.kafka_connected);
    }

    public run() {
        console.log(`App version ${pjson.version}`);

        (async () => {
            await this.consumer.subscribe({ topics: ['health'] });
            this.consumer.run({
                eachBatchAutoResolve: false,
                eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }: any) => {
                    for (let message of batch.messages) {
                        if (!isRunning() || isStale()) break
                        health({
                            topic: batch.topic,
                            partition: batch.partition,
                            highWatermark: batch.highWatermark,
                            message: {
                                offset: message.offset,
                                value: message.value.toString(),
                                headers: message.headers,
                            }
                        });
                        resolveOffset(message.offset)
                        await heartbeat()
                    }
                }
            })

        })();
    }
}
export default Worker;