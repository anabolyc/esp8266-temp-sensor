const { PubSub } = require('@google-cloud/pubsub');
const express = require('express');
const path = require('path');
const Db = require('./data');
const db = new Db("projects/by-temp-sensors/subscriptions/telemetry-sub", 1, 20);
const PORT = process.env.PORT || 5000;

var app = express();

db.start();

app.get('/', (req, res) => {
  let indexPath = path.join(__dirname, 'static', 'index.html')
  res.sendFile(indexPath);
});
app.use(express.static(path.join(__dirname, 'static')));

app.get('/sensors', (req, res) => {
  res.json(db.sensors());
});

app.get('/data', (req, res) => {
  res.json(db.data());
});

var server = app.listen(PORT);
console.log(`Listening on ${PORT}`);

module.exports = app;
