var express = require('express');
var session = require('express-session');
var net = require('net');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static(__dirname + '/public'));

var passport = require('passport');
var flash = require('connect-flash');

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
 extended: true
}));

app.set("view engine", "ejs");
app.set("views", "./views");


var BattleshipGame = require('./app/game.js');
var GameStatus = require('./app/gameStatus.js');

app.use(session({
  secret: 'justasecret',
  resave:true,
  saveUninitialized: true
 }));
 
 app.use(passport.initialize());
 app.use(passport.session());
 app.use(flash());
 
 require('./routes/routes.js')(app, passport);

var port = process.env.PORT || 3000;

var users = {};
var gameIdCounter = 1;

server.listen(port, function(){
  console.log('listening on *:' + port);
});

//Lưu tay id cho tay cầm
var gamepad1, gamepad2;
var check_gamepad1 = 0;
var check_gamepad2 = 0;
//Kiểm tra tay cầm
//----------------------------TCP-------------------------------//
net.createServer(function(sock) {
  tcp.name = sock.remoteAddress + ':' + sock.remotePort;
  console.log(socket.name + ' connected.');
  var signal = null;
  sock.on('data', function(data) {
    if(data.indexOf('1') === 0) { //Kiểm tra tay cầm 1
      signal = data.slice(1,2); //Lấy dữ liệu để điều khiển từ client 
      if(signal == 'u') {
        console.log('Signal GamePad1 sent: Move up! ')
      }
      if(signal == 'd') {
        console.log('Signal GamePad1 sent: Move down! ')
      }
      if(signal == 'l') {
        console.log('Signal GamePad1 sent: Move left! ')
      }
      if(signal == 'r') {
        console.log('Signal GamePad1 sent: Move right! ')
      }
      if(signal == 'f') {
        console.log('Signal GamePad1 sent: Fire! ')
      }
      //Gửi dữ liệu từ tay cầm 1 lên server
      io.to(gamepad1).emit('dataGamePad', signal);
    } else if(data.indexOf('2') === 0) {  //Kiểm tra tay cầm 2
      temp = data.slice(1,2); //Lấy dữ liệu để điều khiển từ client 
      if(signal == 'u') {
        console.log('Signal GamePad1 sent: Move up! ')
      }
      if(signal == 'd') {
        console.log('Signal GamePad1 sent: Move down! ')
      }
      if(signal == 'l') {
        console.log('Signal GamePad1 sent: Move left! ')
      }
      if(signal == 'r') {
        console.log('Signal GamePad1 sent: Move right! ')
      }
      if(signal == 'f') {
        console.log('Signal GamePad1 sent: Fire! ')
      }
      //Gửi dữ liệu từ tay cầm 2 lên server
      io.to(gamepad2).emit('dataGamePad', signal);
    }
  })
});

//----------------------------SOCKET.IO-------------------------------//

io.on('connection', function(socket) {
  console.log((new Date().toISOString()) + ' ID ' + socket.id + ' connected.');

  // Tạo user để thêm dữ liệu
  users[socket.id] = {
    inGame: null,
    player: null,
    gamepad: 0
  }; 
  //Xác nhận tay cầm đã kết nối hay chưa ???
  socket.on('taycam1', function(indexGamepad) {
    socket.emit('showGamePad', indexGamepad);
  })

  //--------------------------Chọn gamepad-----------------------------
  socket.on('gamePad1', function(check) {
    gamepad1 = socket.id;
    check_gamepad1 = check;
    //Gửi dữ liệu để cập nhật tay cầm đã chọn.
    socket.broadcast.emit('update_gamepad', '1');
    console.log('GAMEPAD 1: ' + gamepad1);
    socket.join('waiting room');
    joinWaitingPlayers();
  });

  socket.on('gamePad2', function(check) {
    gamepad2 = socket.id;
    check_gamepad2 = check; 
    //Gửi dữ liệu để cập nhật tay cầm đã chọn.
    socket.broadcast.emit('update_gamepad', '2');
    console.log('GAMEPAD 2: ' + gamepad2);
    socket.join('waiting room');
    joinWaitingPlayers();
    
  });
    //Kiểm tra tay cầm có còn tồn tại hay không
    io.sockets.emit('checkGamePad', check_gamepad1);
    io.sockets.emit('checkGamePad', check_gamepad2);

  // join waiting room until there are enough players to start a new game
  //socket.join('waiting room');
  //console.log(socket.join('waiting room'));

  /**
   * ---------------------Xử lý bắn từ clients---------------------------
   */
  socket.on('shot', function(position) {
    var game = users[socket.id].inGame, opponent;
    //console.log(game);
    if(game !== null) {
      // Is it this users turn?
      if(game.currentPlayer === users[socket.id].player) {
        opponent = game.currentPlayer === 0 ? 1 : 0;

        if(game.shoot(position)) {
          // Valid shot
          checkGameOver(game);

          // Cập nhật trạng thái game của 2 clients
          io.to(socket.id).emit('update', game.getGameState(users[socket.id].player, opponent));
          io.to(game.getPlayerId(opponent)).emit('update', game.getGameState(opponent, opponent));
        }
      }
    }
  });
  
  /**
   * ------------------------------Xử lý thoát---------------------------------
   */
  socket.on('leave', function() {
    if(users[socket.id].inGame !== null) {
      leaveGame(socket);

      socket.join('waiting room');
      joinWaitingPlayers();
    }
  });

  /**
   * -------------------Xử lý clients ngắt kết nối-------------------------
   */
  socket.on('disconnect', function() {
    console.log((new Date().toISOString()) + ' ID ' + socket.id + ' disconnected.');
    if(socket.id === gamepad1) {
      io.sockets.emit('checkExit', '1');
      check_gamepad1 = 0;
      //delete users[gamepad1];
    } else if(socket.id === gamepad2) {
      io.sockets.emit('checkExit', '2');
      check_gamepad2 = 0
      //delete users[gamepad2];
    }
    leaveGame(socket);

    delete users[socket.id];
  });

  joinWaitingPlayers();
});

/**
 * Tạo game cho players trong waiting room
 * 
 */
function joinWaitingPlayers() {
  var players = getClientsInRoom('waiting room');
  //Chỉ cho 2 người vào game 
  if(players.length >= 2) {
    // 2 players chờ. Tạo game mới!
    var game = new BattleshipGame(gameIdCounter++, players[0].id, players[1].id);

    // Tạo phòng mới cho game 
    players[0].leave('waiting room');
    players[1].leave('waiting room');
    players[0].join('game' + game.id);
    players[1].join('game' + game.id);

    users[players[0].id].player = 0;
    users[players[1].id].player = 1;
    users[players[0].id].inGame = game;
    users[players[1].id].inGame = game;
    
    io.to('game' + game.id).emit('join', game.id);

    
    io.to(players[0].id).emit('update', game.getGameState(0, 0));
    io.to(players[1].id).emit('update', game.getGameState(1, 1));

    console.log((new Date().toISOString()) + " " + players[0].id + " and " + players[1].id + " have joined game ID " + game.id);
  }
}

/**
 * @param {type} socket
 */
function leaveGame(socket) {
  if(users[socket.id].inGame !== null) {
    console.log((new Date().toISOString()) + ' ID ' + socket.id + ' left game ID ' + users[socket.id].inGame.id);
    users[socket.id].gamepad = 1;

    
     // Notifty opponent
    socket.broadcast.to('game' + users[socket.id].inGame.id).emit('notification', {
      message: 'Opponent has left the game'
    });

    if(users[socket.id].inGame.gameStatus !== GameStatus.gameOver) {
      // Game is unfinished, abort it.
      users[socket.id].inGame.abortGame(users[socket.id].player);
      checkGameOver(users[socket.id].inGame);
    }

    socket.leave('game' + users[socket.id].inGame.id);

    users[socket.id].inGame = null;
    users[socket.id].player = null;

    io.to(socket.id).emit('leave');
    
  }
}
//----------------------------------------------------------------------------------
/**
 * Thống báo players nếu game kết thúc
 * @param {type} game
 */
function checkGameOver(game) {
  if(game.gameStatus === GameStatus.gameOver) {
    console.log((new Date().toISOString()) + ' Game ID ' + game.id + ' ended.');
    io.to(game.getWinnerId()).emit('gameover', true);
    io.to(game.getLoserId()).emit('gameover', false);
  }
}

/**
 * 
 * @param {type} room
 * @returns {Array}
 */
function getClientsInRoom(room) {
  var clients = [];
  for (var id in io.sockets.adapter.rooms[room]) {
    clients.push(io.sockets.adapter.nsp.connected[id]);
  }
  return clients;
}
