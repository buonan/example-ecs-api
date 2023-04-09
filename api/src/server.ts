import express from 'express';
import mongoose from 'mongoose';
import * as http from 'http';

const crypto = require('crypto');
const kafka = require('./kafka');
const sleep = require("./sleep");
const pjson = require('../package.json');
const mongo_root_username = 'root';
const mongo_root_password = 'example';
const mongo_admin = 'admin';

class App {
    public app: express.Application;
    public server: http.Server | undefined;
    public port = process.env.PORT || 3000;
    private db_url = `mongodb://mongo:27017`;
    private producer = kafka.producer()
    private kafka_connected = false;

    private controllers = [
    ];
    constructor() {
        this.app = express();
    }

    async init() {
        await this.initializeConnections();
        await this.initializeControllers(this.controllers);
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
        }).catch((err) => {
            console.log(err)
        });
        let retry = 3;
        while (retry > 0 && this.kafka_connected === false) {
            try {
                await this.producer.connect();
                this.kafka_connected = true;
            } catch (error) {
                console.log('Error connecting the producer: ', error);
                this.kafka_connected = false;
            }
            sleep(1);
            retry--;
        }
        console.log('Kafka producer connected: ', this.kafka_connected);
    }

    private initializeControllers(controllers: any[]) {
        this.app.use('/health', (req: express.Request, res: express.Response) => {
            res.setHeader('Content-Type', 'application/json');
            const mongo_health = mongoose.connection.readyState === 1 ? 'up' : 'down';
            const kafka_health = this.kafka_connected;
            const health = JSON.stringify({
                ok: true,
                version: pjson.version,
                mongo: mongo_health,
                kafka: kafka_health,
            }, null, 3)
            console.log(`Health ${health}`)
            res.end(health);
        });
        this.app.use('/test-kafka', async (req: express.Request, res: express.Response) => {
            res.setHeader('Content-Type', 'application/json');
            const topicMessage = {
                topic: 'health',
                messages: [{ action: '', value: JSON.stringify('Hello, kafkajs') }]
            }
            try {
                if (this.kafka_connected) {
                    await this.producer?.send(topicMessage);
                } else {
                    throw new Error('Producer not connected!');
                }
            } catch (e) {
                console.log(`test-kafka ${e}`);
            }
            res.end(JSON.stringify({ kafka: true }));
        });
        this.app.use('/test-writer', async (req: express.Request, res: express.Response) => {
            let uuid = crypto.randomUUID();
            res.setHeader('Content-Type', 'application/json');
            const topicMessage = {
                topic: 'writer',
                messages: [{ action: 'write', value: JSON.stringify(`Write ${uuid} MongoDB`) }]
            }
            try {
                if (this.kafka_connected) {
                    await this.producer?.send(topicMessage);
                } else {
                    throw new Error('Producer not connected!');
                }
            } catch (e) {
                console.log(`test-writer ${e}`);
            }
            res.end(JSON.stringify({ writer: true }));
        });
    }

    public listen() {
        this.server = this.app.listen(this.port, () => {
            console.log(`App version ${pjson.version}`);
            console.log(`App listening on the port ${this.port}`);
        });
    }
}
export default App;