
const mqtt_url = 'http://127.0.0.1:1883';
const mongo_url = 'mongodb://localhost:27017/myproject';

const logMqttToDatabase = require('./mqtt_mongo');

const express = require('express');
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


logMqttToDatabase(mqtt_url, mongo_url).then(({ mongoDb, client  }) => {
  app.get('/topics/:topic/:limit', (req,res) => {
    const limit = Number(req.params.limit);
    const topic = req.params.topic;
    mongoDb.collection('topics').find({ topic }).limit(limit).toArray().then(val => res.send(val)).catch(() => res.status(500));
  });

  app.get('/topics/:topic_or_limit', (req, res) => {
    const param = req.params.topic_or_limit;
    if (Number.isNaN((Number(param)))){
      mongoDb.collection('topics').find({ topic : param }).limit(10).toArray().then(val => res.send(val)).catch(() => res.status(500));
    }else{
      mongoDb.collection('topics').find({ }).limit(Number(param)).toArray().then(val => res.send(val)).catch(() => res.status(500));
    }
  });

  app.get('/topics', (req, res) => {
    const query = req.body.query;
    const options = req.body.options;
    mongoDb.collection('topics').find(query, options).toArray().then(val => res.send(val)).catch(() => res.status(500));
  });

  app.listen(5000, function () {
    console.log('mongo server start on port 5000!')
  });

}).catch((err) => console.log(err));
