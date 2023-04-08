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
            action: message.action,
            value: message.value,
            headers: message.headers,
        }
    })
}