const logMqttFromMongo = require('./mqtt_mongo');

const logMqttToMongo = ({ MQTT_URL , MONGO_URL }) => {
  if (MQTT_URL === undefined || typeof(MQTT_URL) !== typeof('')){
    throw (new Error('MQTT_URL must be defined as a string'));
  }else if (MONGO_URL === undefined || typeof(MONGO_URL) !== typeof('')){
    throw (new Error('MONGO URL must be defined as a string'));
  }
  return logMqttFromMongo(MQTT_URL, MONGO_URL);
};

module.exports = {
  logMqttToMongo,
};
