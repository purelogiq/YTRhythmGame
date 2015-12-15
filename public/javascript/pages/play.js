/**
 * Initialization script for the play page.
 */

// Run materialize stuff on doc load.
$(function() {
  $(".button-collapse").sideNav();
});

var Play = new function(){
  // State fields
  var self = this;
  var socket = null;
  var roomId = $("#current-room-id").val();
  var currentUsername = localStorage.getItem('username');
  var currentRole = $("#current-role").val().trim();
  var notePlayer = null;
  var noteMaker = null;
  var playing = false;
  var video = {
    videoURL: null,
    containment:'body',
    autoPlay:false,
    mute:false,
    startAt:0,
    opacity:1,
    loop:false,
    ratio:"16/9",
    addRaster:true,
    stopMovieOnBlur: false
  };

  // Render fields
  var renderer = null;
  var stage = null;

  // Sprites
  var controlL = null;
  var controlR = null;
  var controlU = null;
  var controlD = null;
  var pressedL = null;
  var pressedR = null;
  var pressedU = null;
  var pressedD = null;
  var noteL = null;
  var noteR = null;
  var noteU = null;
  var noteD = null;
  var hitL = null;
  var hitR = null;
  var hitU = null;
  var hitD = null;
  var missL = null;
  var missR = null;
  var missU = null;
  var missD = null;

  // Timers
  var noteLTime = null;
  var noteRTime = null;
  var noteUTime = null;
  var noteDTime = null;

  // Methods

  this.initialize = function() {
    $.getJSON("/room/" + roomId + "/info", function(data){
      video.videoURL = data.videoId;
      notePlayer = data.notePlayer;
      noteMaker = data.noteMaker;

      self.setupSockets();

      $("body").append('<div id="bgndVideo" class="player" data-property=\'' + JSON.stringify(video) + '\'>My video</div>');
      $(".player").YTPlayer();

      $('#bgndVideo').on("YTPReady",function(e){
        $('#loading-div').hide();
        if(notePlayer == null || notePlayer == undefined){
          $('#waiting-for-join').show();
        }else{
          socket.emit('playerJoined', {room: roomId, username: currentUsername});
          self.startPlaying();
        }
      });

      $('#bgndVideo').on("YTPEnd",function(e){
        if(currentRole == 'noteMaker'){
          socket.emit('finished', roomId);
        }
      });

      self.setupCanvas();
    });
  };

  this.startPlaying = function(){
    $('#info-div').append("<span>Note Maker: </span>" + noteMaker + "<br />");
    $('#info-div').append("<span>Note Player: </span>" + notePlayer + "<br />");
    $('#waiting-for-join').hide();
    $('#render-canvas').show();
    setTimeout(self.startVideo, 20);
    playing = true;
  };

  this.animate = function(){
    requestAnimationFrame(self.animate);
    var time = (new Date()).getTime();
    //console.log(time);
    renderer.render(stage);
  };

  this.handleMakerTap = function(loc, isRelease){
    if(isRelease){
      if(loc == 'left') pressedL.visible = false;
      if(loc == 'right') pressedR.visible = false;
      if(loc == 'up') pressedU.visible = false;
      if(loc == 'down') pressedD.visible = false;
      return;
    }

    if(loc == 'left') pressedL.visible = true;
    if(loc == 'right') pressedR.visible = true;
    if(loc == 'up') pressedU.visible = true;
    if(loc == 'down') pressedD.visible = true;
    console.log("The maker (" + noteMaker + ") tapped: " + loc);
  };

  this.handlePlayerTap = function(loc, isRelease){
    if(isRelease) return;
    console.log("The player (" + notePlayer + ") tapped: " + loc);
  };

  this.startVideo = function(){
    $('#bgndVideo').YTPPlay();
  };

  this.setupSockets = function(){
    socket = io.connect("http://ytgame-cmuimadueme.rhcloud.com:8000");
    socket.on('joinedInfo', function(username){
      if(currentRole == 'noteMaker'){
        notePlayer = username;
      }else{
        noteMaker = username;
      }
      self.startPlaying();
    });

    socket.on('tap', function(data){
      if(currentRole == 'noteMaker'){
        self.handlePlayerTap(data.loc, data.release);
      }else{
        self.handleMakerTap(data.loc, data.release);
      }
    });

    socket.emit('joinRoom', roomId);
  };

  this.setupCanvas = function(){
    renderer = PIXI.autoDetectRenderer(640, 640,{view: document.getElementById("render-canvas"), transparent: true});
    stage = new PIXI.Container();

    var container = new PIXI.Container();
    stage.addChild(container);
    self.createSprites(container);
    self.setupInputListeners();
    self.animate();
  };

  this.setupInputListeners = function(){
    var leftKey = keyboard(37);
    var rightKey = keyboard(39);
    var upKey = keyboard(38);
    var downKey = keyboard(40);

    var makeHandler = function(loc, isRelease){
      var loc = loc;
      var isRelease = isRelease;
      return function(){
        if(currentRole == 'noteMaker'){
            socket.emit('tap', {room: roomId, loc: loc, release: isRelease});
            self.handleMakerTap(loc, isRelease);
        }else{
          socket.emit('tap', {room: roomId, loc: loc, release: isRelease});
          self.handlePlayerTap(loc, isRelease);
        }
      }
    };

    leftKey.press = makeHandler('left', false);
    leftKey.release = makeHandler('left', true);

    rightKey.press = makeHandler('right', false);
    rightKey.release = makeHandler('right', true);

    upKey.press = makeHandler('up', false);
    upKey.release = makeHandler('up', true);

    downKey.press = makeHandler('down', false);
    downKey.release = makeHandler('down', true);
  };

  this.createSprites = function(container){
    controlL = PIXI.Sprite.fromImage('/images/assets/arrow_left_control.png');
    controlR = PIXI.Sprite.fromImage('/images/assets/arrow_right_control.png');
    controlU = PIXI.Sprite.fromImage('/images/assets/arrow_up_control.png');
    controlD = PIXI.Sprite.fromImage('/images/assets/arrow_down_control.png');
    controlL.anchor = new PIXI.Point(0.5, 0.5);
    controlR.anchor = new PIXI.Point(0.5, 0.5);
    controlU.anchor = new PIXI.Point(0.5, 0.5);
    controlD.anchor = new PIXI.Point(0.5, 0.5);
    controlL.width = 125; controlL.height = 125;
    controlR.width = 125; controlR.height = 125;
    controlU.width = 125; controlU.height = 125;
    controlD.width = 125; controlD.height = 125;
    controlL.x = 320 - 100; controlL.y = 320;
    controlR.x = 320 + 100; controlR.y = 320;
    controlU.x = 320; controlU.y = 320 - 100;
    controlD.x = 320; controlD.y = 320 + 100;
    container.addChild(controlL);
    container.addChild(controlR);
    container.addChild(controlU);
    container.addChild(controlD);

    pressedL = PIXI.Sprite.fromImage('/images/assets/arrow_left_hit.png');
    pressedR = PIXI.Sprite.fromImage('/images/assets/arrow_right_hit.png');
    pressedU = PIXI.Sprite.fromImage('/images/assets/arrow_up_hit.png');
    pressedD = PIXI.Sprite.fromImage('/images/assets/arrow_down_hit.png');
    pressedL.anchor = new PIXI.Point(0.5, 0.5);
    pressedR.anchor = new PIXI.Point(0.5, 0.5);
    pressedU.anchor = new PIXI.Point(0.5, 0.5);
    pressedD.anchor = new PIXI.Point(0.5, 0.5);
    pressedL.width = 125; pressedL.height = 125;
    pressedR.width = 125; pressedR.height = 125;
    pressedU.width = 125; pressedU.height = 125;
    pressedD.width = 125; pressedD.height = 125;
    pressedL.x = 320 - 100; pressedL.y = 320;
    pressedR.x = 320 + 100; pressedR.y = 320;
    pressedU.x = 320; pressedU.y = 320 - 100;
    pressedD.x = 320; pressedD.y = 320 + 100;
    pressedL.visible = false;
    pressedR.visible = false;
    pressedU.visible = false;
    pressedD.visible = false;
    container.addChild(pressedL);
    container.addChild(pressedR);
    container.addChild(pressedU);
    container.addChild(pressedD);

    noteL = PIXI.Sprite.fromImage('/images/assets/arrow_left_8.png');
    noteR = PIXI.Sprite.fromImage('/images/assets/arrow_right_8.png');
    noteU = PIXI.Sprite.fromImage('/images/assets/arrow_up_8.png');
    noteD = PIXI.Sprite.fromImage('/images/assets/arrow_down_8.png');
    noteL.anchor = new PIXI.Point(0.5, 0.5);
    noteR.anchor = new PIXI.Point(0.5, 0.5);
    noteU.anchor = new PIXI.Point(0.5, 0.5);
    noteD.anchor = new PIXI.Point(0.5, 0.5);
    noteL.width = 125; noteL.height = 125;
    noteR.width = 125; noteR.height = 125;
    noteU.width = 125; noteU.height = 125;
    noteD.width = 125; noteD.height = 125;
    noteL.x = 320 - 100 - 20 - 125; noteL.y = 320;
    noteR.x = 320 + 100 + 20 + 125; noteR.y = 320;
    noteU.x = 320; noteU.y = 320 - 100 - 20 - 125;
    noteD.x = 320; noteD.y = 320 + 100 + 20 + 125;
    noteL.visible = false;
    noteR.visible = false;
    noteU.visible = false;
    noteD.visible = false;
    container.addChild(noteL);
    container.addChild(noteR);
    container.addChild(noteU);
    container.addChild(noteD);

    hitL = PIXI.Sprite.fromImage('/images/assets/hit.png');
    hitR = PIXI.Sprite.fromImage('/images/assets/hit.png');
    hitU = PIXI.Sprite.fromImage('/images/assets/hit.png');
    hitD = PIXI.Sprite.fromImage('/images/assets/hit.png');
    hitL.anchor = new PIXI.Point(0.5, 0.5);
    hitR.anchor = new PIXI.Point(0.5, 0.5);
    hitU.anchor = new PIXI.Point(0.5, 0.5);
    hitD.anchor = new PIXI.Point(0.5, 0.5);
    hitL.width = 80; hitL.height = 60;
    hitR.width = 80; hitR.height = 60;
    hitU.width = 80; hitU.height = 60;
    hitD.width = 80; hitD.height = 60;
    hitL.x = 320 - 100 - 20 - 125; hitL.y = 320;
    hitR.x = 320 + 100 + 20 + 125; hitR.y = 320;
    hitU.x = 320; hitU.y = 320 - 100 - 20 - 125;
    hitD.x = 320; hitD.y = 320 + 100 + 20 + 125;
    hitL.visible = false;
    hitR.visible = false;
    hitU.visible = false;
    hitD.visible = false;
    container.addChild(hitL);
    container.addChild(hitR);
    container.addChild(hitU);
    container.addChild(hitD);

    missL = PIXI.Sprite.fromImage('/images/assets/miss.png');
    missR = PIXI.Sprite.fromImage('/images/assets/miss.png');
    missU = PIXI.Sprite.fromImage('/images/assets/miss.png');
    missD = PIXI.Sprite.fromImage('/images/assets/miss.png');
    missL.anchor = new PIXI.Point(0.5, 0.5);
    missR.anchor = new PIXI.Point(0.5, 0.5);
    missU.anchor = new PIXI.Point(0.5, 0.5);
    missD.anchor = new PIXI.Point(0.5, 0.5);
    missL.width = 80; missL.height = 60;
    missR.width = 80; missR.height = 60;
    missU.width = 80; missU.height = 60;
    missD.width = 80; missD.height = 60;
    missL.x = 320 - 100 - 20 - 125; missL.y = 320;
    missR.x = 320 + 100 + 20 + 125; missR.y = 320;
    missU.x = 320; missU.y = 320 - 100 - 20 - 125;
    missD.x = 320; missD.y = 320 + 100 + 20 + 125;
    missL.visible = false;
    missR.visible = false;
    missU.visible = false;
    missD.visible = false;
    container.addChild(missL);
    container.addChild(missR);
    container.addChild(missU);
    container.addChild(missD);
  };

  /**
   * Input handler helper method.
   * Credit to this great pixijs tutorial by kittykatattack here:
   * https://github.com/kittykatattack/learningPixi#gamestates
   */
  var keyboard = function (keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function(event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;
  }
};

// Runs after body is loaded because of script location in html.
Play.initialize();

