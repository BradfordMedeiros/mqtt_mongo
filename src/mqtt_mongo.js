const mqtt = require('mqtt');
const MongoClient = require('mongodb').MongoClient;

const MQTT_URL = 'http://127.0.0.1:1883';
const url  = 'mongodb://localhost:27017/myproject';


const ConnectToMongoAndMqtt = (MQTT_URL, url) => {
  const client = mqtt.connect(MQTT_URL);
  console.log('client up here ', client);
  let mongoConnectionResolver;
  let mqttConnectionResolver;
  const waitForMongoConnection = new Promise((resolve, reject) => {
    mongoConnectionResolver = resolve;
  });
  const waitForMqttConnection = new Promise((resolve, reject) => {
    mqttConnectionResolver = resolve;
  });

  client.on('connect', () => {
    mqttConnectionResolver();
  });

  let mongoDb;
  MongoClient.connect(url, (err, db) => {
    mongoDb = db;
    mongoConnectionResolver();
  });

  const connectedToMongoAndMqtt = new Promise((resolve, reject) =>{
    Promise.all([
      waitForMqttConnection,
      waitForMongoConnection,
    ]).then(() => {
      resolve({
        mongoDb,
        client,
      })
    }).catch(() => {
      console.log('could not create mongo mqtt connection');
    });
  });

  return connectedToMongoAndMqtt;
};

const log_mqtt_message = mongo => (topic, message) => {
  console.log('logging mqtt message');
  mongo.collection('topics').insertOne({ topic, message: message.toString() });
};


module.exports = () => ConnectToMongoAndMqtt(MQTT_URL, url).then((val) => {
  console.log('connected');
  const { mongoDb, client } = val;
  client.subscribe('#');
  client.on('message', log_mqtt_message(mongoDb));
});






