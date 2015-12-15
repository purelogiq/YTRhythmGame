var Room = require('../models/room.js');
var listing = require('../models/listing.js');
var roomIdCounter = 1;

exports.init = function(app) {
  app.get("/", listRooms);
  app.get("/room/:roomId/", joinRoom);
  app.get("/room/:roomId/info", getRoomInfo);
  app.post("/room/new", createRoom);
};

var listRooms = function(req, res) {
  var allRooms = listing.getRooms();
  var openRooms = [];
  for(var idx = 0; idx < allRooms.length; idx++){
    var aRoom = allRooms[idx];
    if(!aRoom.isFull()){
      openRooms.push(aRoom);
    }
  }

  var pastRooms = Room.getPastRoom(function(err, rooms){
    res.render('index', {rooms: openRooms, pastRooms: rooms});
  });
};

var joinRoom = function(req, res){
  var roomId = req.params.roomId;
  var username = req.query.username;
  var role = req.query.role;
  var room = listing.getRoom(roomId);

  // Join the player to the room
  room.addPlayer(username, role);
  res.render('play', {currentRole: role, roomId: roomId});
};

var createRoom = function(req, res){
  var videoId = req.body.videoId.trim();
  var role = req.body.role;
  var username = req.body.username;

  var currentRoomId = roomIdCounter;
  listing.addRoom(roomIdCounter, videoId);
  roomIdCounter++;

  res.redirect('/room/' + currentRoomId + '/?username=' + username + '&role=' + role);
};

var getRoomInfo = function(req, res){
  var roomId = req.params.roomId;
  var room = listing.getRoom(roomId);
  var videoId = room.getVideoId();
  var noteMaker = room.getNoteMaker();
  var notePlayer = room.getNotePlayer();

  var roomInfo = {
    videoId: videoId,
    noteMaker: noteMaker,
    notePlayer: notePlayer
  };

  res.json(roomInfo);
};