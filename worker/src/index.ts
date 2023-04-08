const pjson = require('../package.json');
import Worker from './worker';
console.log(`App version ${pjson.version}`);

const worker = new Worker(process.env.TOPIC);
worker.init().then(async () => {
    worker.run();
});
