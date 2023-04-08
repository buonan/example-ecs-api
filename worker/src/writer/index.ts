import mongoose from 'mongoose';

// make Schema & model:
const Transfer = mongoose.model('Transfer', new mongoose.Schema({
    value: String,
}));

module.exports = ({
    topic,
    partition,
    highWatermark,
    message
}: any) => {
    console.log({
        topic: topic,
        partition: partition,
        highWatermark: highWatermark,
        message: {
            offset: message.offset,
            value: message.value.toString(),
            headers: message.headers,
        }
    });
    (async()=> {
        const data = new Transfer({value: message.value.toString()});
        await data.save();
    })();
    console.log(`Data saved!`);
}