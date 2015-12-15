exports.init = function(io) {
  var currentPlayers = 0; // keep track of the number of players

  // When a new connection is initiated
  io.sockets.on('connection', function (socket) {
    ++currentPlayers;
    // Send ("emit") a 'players' event back to the socket that just connected.
    socket.emit('players', { number: currentPlayers});
    /*
     * Emit players events also to all (i.e. broadcast) other connected sockets.
     * Broadcast is not emitted back to the current (i.e. "this") connection
     */
    socket.broadcast.emit('players', { number: currentPlayers});

    /*
     * Upon this connection disconnecting (sending a disconnect event)
     * decrement the number of players and emit an event to all other
     * sockets.  Notice it would be nonsensical to emit the event back to the
     * disconnected socket.
     */
    socket.on('disconnect', function () {
      --currentPlayers;
      socket.broadcast.emit('players', { number: currentPlayers});
    });
  });
};
