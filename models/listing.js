var Room = require('./room.js');

var rooms = [];

exports.addRoom = function(roomId, videoId){
  var room = new Room(roomId, videoId);
  rooms.push(room);
};

exports.getRoom = function(roomId){
  for(var idx = 0; idx < rooms.length; idx++){
    var item = rooms[idx];
    if(item.getId() == roomId){
      return item;
    }
  }
  return null;
};

exports.getRooms = function(){
  return rooms;
};