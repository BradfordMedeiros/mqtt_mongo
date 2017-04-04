# mqtt_mongo

### Description ###
Logs mqtt topics to a mongo database.  All topics are logged to the collection topics.
Special collection called events produced which will log redundant topics that are prefixed with /event and logged to the collection events.

This requires you to have a MQTT broker and MongoDB instance that you can connect to.


### Usage ###
~~~

const mqtt_mongo = require('mqtt_mongo');

const config = {
  MQTT_URL : 'http://127.0.0.1:1883', 
  MONGO_URL: 'mongodb://localhost:27017/databaseName' }
}

mqtt_mongo.logMqttToMongo(config);

~~~


An example of a record from the topic collection:
~~~~
{ 
  "_id" : ObjectId("58e34271bd9277145fae0258"), 
  "topic" : "/any/topic/here", 
  "message" : "324234", 
  "timestamp" : ISODate("2017-04-04T06:51:29.832Z") 
}
~~~~

And a record the event collection:
~~~~
{ 
  "_id" : ObjectId("58e3423a2ba24d13fb898214"), 
  "event" : "event/can/be/used/for/a/variety/of/special/purposes/or/not/at/all", 
  "timestamp" : ISODate("2017-04-04T06:51:29.832Z") 
}
~~~~




### Need Help? ###
Feel free to send me an message or raise an issue on github.
