const mqtt = require('mqtt');
const MongoClient = require('mongodb').MongoClient;

const ConnectToMongoAndMqtt = (MQTT_URL, url) => {
  const client = mqtt.connect(MQTT_URL);
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
  mongo.collection('topics').insertOne({ topic, message: message.toString(), timestamp: new Date() });
};


module.exports = (mqtt_url, mongo_url) => {
  const promise =  new Promise((resolve, reject) => {
    ConnectToMongoAndMqtt(mqtt_url, mongo_url).then((val) => {
      const { mongoDb, client } = val;
      client.subscribe('#');
      client.on('message', log_mqtt_message(mongoDb));
      resolve(val);
    }).catch(() => reject());
  });
  return promise;
};






