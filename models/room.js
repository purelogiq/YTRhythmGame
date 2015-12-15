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
  // Todo mongodb stuff
  console.log("closed room with id: " + this.roomId);
};