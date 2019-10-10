"use strict";
const { PubSub } = require('@google-cloud/pubsub');

module.exports = function (subscriptionName, maxInProgress, pointsToKeep) {
    
    this.subscriptionName = subscriptionName;
    this.maxInProgress = maxInProgress;
    this.pointsToKeep = pointsToKeep;

    this.subscription = null;
    this.messages = [];

    this.start = () => {
        const pubsub = new PubSub();
        var subscription = pubsub.subscription(this.subscriptionName, {
            flowControl: {
                maxMessages: this.maxInProgress,
            },
        });

        console.log(
            `Subscriber to subscription ${subscription.name} is ready to receive messages at a controlled volume of ${this.maxInProgress} messages.`
        );

        subscription.on(`message`, message => {
            this.messages.push(message);
            while (this.messages.length > this.pointsToKeep) {
                this.messages.shift();
            }

            var node = message.attributes.deviceId;
            console.debug(`Received message from ${node}: ${message.id} at ${message.publishTime}`);
            // console.log(message);
            // console.log(`\tData: ${message.data}`);
            // console.log(`\tDeviceId: ${message.attributes.deviceId}`);
            message.ack();
        });
        
        this.subscription = subscription;
    };

    this.close = () => {
        if (subscription)
            subscription.close();
    };

    this.data = () => {
        return this.messages.map(x => {return {
            dt: x.publishTime,
            sensor: x.attributes.deviceId,
            data: `${x.data}`
        }});
    };

    this.sensors = () => {
        return this.messages.map(x => x.attributes.deviceId).filter((v, i, a) => a.indexOf(v) === i);
    };
};