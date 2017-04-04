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

const get_log_mqtt_message = mongo => (topic, message) => {
  mongo.collection('topics').insertOne({ topic, message: message.toString(), timestamp: new Date() });
};

const get_log_event = mongo => (topic, message) => {
  const event_split = topic.split('/').filter(x => x.length > 0);
  const isEvent = event_split[0] === 'event';
  if (isEvent){
    const event = topic;
    mongo.collection('events').insertOne({ event, timestamp: (new Date()).toString() });
  }
};

module.exports = (mqtt_url, mongo_url) => {
  const promise =  new Promise((resolve, reject) => {
    ConnectToMongoAndMqtt(mqtt_url, mongo_url).then((val) => {
      const { mongoDb, client } = val;
      const log_mqtt_message = get_log_mqtt_message(mongoDb);
      const log_event = get_log_event(mongoDb);

      client.subscribe('#');
      client.on('message', (topic, message) => {
        log_mqtt_message(topic, message);
        log_event(topic, message);
      });
      resolve(val);
    }).catch(() => reject());
  });
  return promise;
};




