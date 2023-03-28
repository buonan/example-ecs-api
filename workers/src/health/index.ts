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
    })
}