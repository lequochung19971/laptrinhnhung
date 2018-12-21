var socket = io('http://13.250.67.15:3000/');

$(function() {
  
  //Kiểm tra có Gamepad nào trong phòng
  socket.on('checkGamePad', function(check) {
    var gp = document.getElementById('player1'+check);
    
    gp.disabled = true;
   
  });
  socket.on('checkExit', function(check) {
    
      var gp = document.getElementById('player' + check);
      gp.disabled = false;
  });
  socket.on('update_gamepad', function (data) {
    if(data === '1') {
      var gp1 = document.getElementById('player1');
      gp1.disabled = true;
    } else if(data === '2') {
      var gp2 = document.getElementById('player2');
      gp2.disabled = true;
    }
    
  });
  socket.on('connect', function() {
    console.log('Connected to server.');
    $('#disconnected').hide();
    $('#gamepad').show();
    $(document).ready(function(){
      $('#player1').click(function(){
        $('#gamepad').hide();
        $('#waiting-room').show(); 
        socket.emit('gamePad1', '1');  
      })
    });
    $(document).ready(function(){
      $('#player2').click(function(){
        $('#gamepad').hide();
        $('#waiting-room').show();   
        socket.emit('gamePad2', '2');  
      })
    })
  });
  /**
   * Xử lý dữ liệu từ server gửi đến
   */
  socket.on('dataGamePad', function(action) {
    //alert(action);
    Game.moveAndShot(action);
  });
  /**
   * Disconnected from server event
   */
  socket.on('disconnect', function() {
    console.log('Disconnected from server.');
    $('#waiting-room').hide();
    $('#game').hide();
    $('#gamepad').hide();
    $('#disconnected').show();
  });

  /**
   * User has joined a game
   */
  socket.on('join', function(gameId) {
    Game.initGame();
    $('#disconnected').hide();
    $('#waiting-room').hide();
    $('#game').show();
    $('#game-number').html(gameId);
  })

  /**
   * Update player's game state
   */
  socket.on('update', function(gameState) {
    Game.setTurn(gameState.turn);
    Game.updateGrid(gameState.gridIndex, gameState.grid);
  });


  /**
   * Change game status to game over
   */
  socket.on('gameover', function(isWinner) {
    Game.setGameOver(isWinner);
  });
  
  /**
   * Leave game and join waiting room
   */
  socket.on('leave', function() {
    $('#game').hide();
    $('#waiting-room').show();
  });

});

/**
 * Send leave game request
 * @param {type} e Event
 */
function sendLeaveRequest(e) {
  e.preventDefault();
  socket.emit('leave');
}

/**
 * Send shot coordinates to server
 * @param {type} square
 */
function sendShot(square) {
  socket.emit('shot', square);
}
