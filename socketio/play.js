var listing = require("../models/listing.js");

exports.init = function(io) {
  // When a new connection is initiated
  io.sockets.on('connection', function (socket) {
    socket.on('joinRoom', function(room) {
      socket.join(room);
      console.log("JOINED TO ROOMID: " + room);
    });

    socket.on('playerJoined', function(data){
      socket.broadcast.to(data.room).emit('joinedInfo', data.username);
      console.log("BROADCASTED TO " + data.room + " THAT USER " + data.username + " HAS JOINED.");
    });

    socket.on('tap', function(data){
      socket.broadcast.to(data.room).emit('tap', {loc: data.loc, release: data.release});
      console.log("BROADCASTED TO " + data.room + " THE TAP " + data.loc + " AS " + data.release);
    });

    socket.on('finished', function(roomId){
      var room = listing.getRoom(roomId);
      room.closeAndRecord();
    });
  });
};
