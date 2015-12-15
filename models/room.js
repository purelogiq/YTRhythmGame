var mongoClient = require('mongodb').MongoClient;

// Following mongo code mainly from class handout.
var connection_string = 'localhost:27017/ytgame';

/*
 * If OPENSHIFT env variables have values, then this app must be running on
 * OPENSHIFT.  Therefore use the connection info in the OPENSHIFT environment
 * variables to replace the connection_string.
 */
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
      process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
      process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
      process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
      process.env.OPENSHIFT_APP_NAME;
}

var mongoDB;

// Use connect method to connect to the MongoDB server
mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) {
    mongoDB = null;
  }else {
    console.log("Connected to MongoDB server at: " + connection_string);
    mongoDB = db; // Make reference to db globally available.
  }
});

var Room = function(id, videoId){
  this.roomId = id;
  this.videoId = videoId;
  this.noteMaker = null;
  this.notePlayer = null;
};

Room.prototype.constructor = Room;
module.exports = Room;

Room.prototype.getId = function(){
  return this.roomId;
};

Room.prototype.getVideoId = function(){
  return this.videoId;
};

Room.prototype.getNotePlayer = function(){
  return this.notePlayer;
};

Room.prototype.getNoteMaker = function(){
  return this.noteMaker;
};

Room.prototype.addPlayer = function(username, role){
  if(role.trim() == 'noteMaker'){
    this._setNoteMaker(username);
  }else{
    this._setNotePlayer(username);
  }
};

Room.prototype._setNoteMaker = function(username){
  //if(this.noteMaker != null){
  //  throw "This room with videoId " + this.videoId + " already has a note maker";
  //}
  this.noteMaker = username;
};

Room.prototype._setNotePlayer = function(username){
  //if(this.notePlayer != null){
  //  throw "This room with videoId " + this.videoId + " already has a note player";
  //}
  this.notePlayer = username;
};

Room.prototype.isFull = function(){
  return this.noteMaker != null && this.notePlayer != null;
};

Room.prototype.getListingUsername = function(){
  if(this.noteMaker == null){
    return this.notePlayer;
  }else{
    return this.noteMaker;
  }
};

Room.prototype.getListingRole = function(){
  if(this.noteMaker == null){
    return "noteMaker";
  }else{
    return "notePlayer";
  }
};

Room.prototype.closeAndRecord = function(){
  console.log("closed room with id: " + this.roomId);
  mongoDB.collection('pastRooms').insertOne(
      {videoId: this.videoId, notePlayer: this.notePlayer, noteMaker: this.noteMaker});
};

Room.getPastRoom = function(callback){
  mongoDB.collection('pastRooms').find().toArray(callback);
};