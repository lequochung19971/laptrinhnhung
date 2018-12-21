var GameStatus = {
  inProgress: 1,
  gameOver: 2
}

var Game = (function() {
  var canvas = [], context = [], grid = [],
      gridHeight = 361, gridWidth = 361, gridBorder = 1,
      gridRows = 10, gridCols = 10, markPadding = 10, shipPadding = 3,
      squareHeight = (gridHeight - gridBorder * gridRows - gridBorder) / gridRows,
      squareWidth = (gridWidth - gridBorder * gridCols - gridBorder) / gridCols,
      turn = false, gameStatus, squareHover = { x: -1, y: -1 }, coordinate = {x: 0, y: 0};
  
  var imgHit = new Image()
  imgHit.src = 'images/hit.png';
  var imgMiss = new Image()
  imgMiss.src = 'images/miss.png';
  canvas[0] = document.getElementById('canvas-grid1'); // This player
  canvas[1] = document.getElementById('canvas-grid2'); // Opponent
  context[0] = canvas[0].getContext('2d');
  context[1] = canvas[1].getContext('2d');


  document.addEventListener('keydown', function(e) {
      if (turn) {

          stepnew_old(coordinate.y, coordinate.x, 1, 1);

          if (e.which == 39) //right
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.x = coordinate.x + 1;
              if (coordinate.x > (gridCols - 1)) {
                  coordinate.x = 0;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }
          if (e.which == 37) //left
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.x = coordinate.x - 1;
              if (coordinate.x < 0) {
                  coordinate.x = gridCols - 1;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }
          if (e.which == 38) //up
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.y = coordinate.y - 1;
              if (coordinate.y < 0) {
                  coordinate.y = gridRows - 1;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }
          if (e.which == 40) //down
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.y = coordinate.y + 1;
              if (coordinate.y > (gridCols - 1)) {
                  coordinate.y = 0;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }

          if (e.which == 32) //nut o ban
          {
              sendShot(coordinate);
          }
      }
  });

  function moveAndShot(e) {
      if (turn) {

          stepnew_old(coordinate.y, coordinate.x, 1, 1);

          if (e == 'r') //right
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.x = coordinate.x + 1;
              if (coordinate.x > (gridCols - 1)) {
                  coordinate.x = 0;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }
          if (e == 'l') //left
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.x = coordinate.x - 1;
              if (coordinate.x < 0) {
                  coordinate.x = gridCols - 1;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }
          if (e == 'u') //up
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.y = coordinate.y - 1;
              if (coordinate.y < 0) {
                  coordinate.y = gridRows - 1;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }
          if (e == 'd') //down
          {
              stepnew_old(coordinate.y, coordinate.x, 1, 0);

              coordinate.y = coordinate.y + 1;
              if (coordinate.y > (gridCols - 1)) {
                  coordinate.y = 0;
              }
              stepnew_old(coordinate.y, coordinate.x, 1, 1);
          }

          if (e == 'f') //nut o ban
          {
              
              sendShot(coordinate);
          }

      }
  };

  /**
   * Init new game
   */
  function initGame() {
      var i;

      gameStatus = GameStatus.inProgress;

      // Create empty grids for player and opponent
      grid[0] = {
          shots: Array(gridRows * gridCols),
          ships: []
      };
      grid[1] = {
          shots: Array(gridRows * gridCols),
          ships: []
      };

      for (i = 0; i < gridRows * gridCols; i++) {
          grid[0].shots[i] = 0;
          grid[1].shots[i] = 0;
      }

      // Reset turn status classes
      $('#turn-status').removeClass('alert-your-turn').removeClass('alert-opponent-turn')
          .removeClass('alert-winner').removeClass('alert-loser');

      drawGrid(0);
      drawGrid(1);
  };


  function updateGrid(player, gridState) {
      grid[player] = gridState;
      drawGrid(player);
  };


  function setTurn(turnState) {
      if (gameStatus !== GameStatus.gameOver) {
          turn = turnState;

          if (turn) {
              $('#turn-status').removeClass('alert-opponent-turn').addClass('alert-your-turn').html('Tới lượt bạn!');
          } else {
              $('#turn-status').removeClass('alert-your-turn').addClass('alert-opponent-turn').html('Đợi đối thủ');
          }
      }
  };


  function setGameOver(isWinner) {
      gameStatus = GameStatus.gameOver;
      turn = false;

      if (isWinner) {
          $('#turn-status').removeClass('alert-opponent-turn').removeClass('alert-your-turn')
              .addClass('alert-winner').html('You won! <a href="#" class="btn-leave-game">Chơi lại</a>.');
      } else {
          $('#turn-status').removeClass('alert-opponent-turn').removeClass('alert-your-turn')
              .addClass('alert-loser').html('You lost. <a href="#" class="btn-leave-game">Chơi lại</a>.');
      }
      $('.btn-leave-game').click(sendLeaveRequest);
  }


  function drawGrid(gridIndex) {
      drawSquares(gridIndex);
      drawShips(gridIndex);
      drawMarks(gridIndex);
  };


  function drawSquares(gridIndex) {
      var i, j, squareX, squareY;

      context[gridIndex].fillStyle = 'white';
      context[gridIndex].fillRect(0, 0, gridWidth, gridHeight);

      for (i = 0; i < gridRows; i++) {
          for (j = 0; j < gridCols; j++) {
              squareX = j * (squareWidth + gridBorder) + gridBorder;
              squareY = i * (squareHeight + gridBorder) + gridBorder;

              context[gridIndex].fillStyle = '#ffb3d9';
              context[gridIndex].fillRect(squareX, squareY, squareWidth, squareHeight);
            

              // if (j === coordinate.x && i === coordinate.y &&
              //     gridIndex === 1 && grid[gridIndex].shots[i * gridCols + j] === 0 && turn) {
              //     context[gridIndex].fillStyle = '#ff4da6';
              // }

              
          }
      }
  };


  function drawShips(gridIndex) {
      var ship, i, x, y,
          shipWidth, shipLength,
          cl1, cl2, cl3, clRandom, j = 0;
      

      context[gridIndex].shadowColor = "black"; 
      context[gridIndex].fillStyle = "#99ff33";

      for (i = 0; i < grid[gridIndex].ships.length; i++) {
          ship = grid[gridIndex].ships[i];
          j++;
          x = ship.x * (squareWidth + gridBorder) + gridBorder + shipPadding;
          y = ship.y * (squareHeight + gridBorder) + gridBorder + shipPadding;
          shipWidth = squareWidth - shipPadding * 2;
          shipLength = squareWidth * ship.size + (gridBorder * (ship.size - 1)) - shipPadding * 2;
         
          if (ship.horizontal) {
            context[gridIndex].shadowBlur = 20;
            context[gridIndex].fillRect(x, y, shipLength, shipWidth);
          } else {
            context[gridIndex].shadowBlur = 20;
            context[gridIndex].fillRect(x, y, shipWidth, shipLength);
          }
          context[gridIndex].shadowBlur = 0;
          context[gridIndex].fillStyle = "#99ff33";
      }
  };


  function drawMarks(gridIndex) {
      var i, j, squareX, squareY;
      for (i = 0; i < gridRows; i++) {
          for (j = 0; j < gridCols; j++) {
              squareX = j * (squareWidth + gridBorder) + gridBorder;
              squareY = i * (squareHeight + gridBorder) + gridBorder;

              // draw imageMiss if there is a missed shot on square
              if (grid[gridIndex].shots[i * gridCols + j] === 1) {
                context[gridIndex].drawImage(imgMiss, squareX - 15 + squareWidth / 2,squareY - 15 + squareWidth / 2, 30, 30);
              }
              // draw imageHit circle if hit on square
              else if (grid[gridIndex].shots[i * gridCols + j] === 2) {
                context[gridIndex].beginPath();
                context[gridIndex].drawImage(imgHit, squareX - 15 + squareWidth / 2,squareY - 15 + squareWidth / 2, 30, 30);         
              }
          }
      }
  };

  function stepnew_old(x, y, gridIndex, check) {
    if (check === 1) //step new
    {
        squareX = y * (squareWidth + gridBorder) + gridBorder + 3;
        squareY = x * (squareHeight + gridBorder) + gridBorder + 3;
        context[gridIndex].strokeStyle = '#b30047'; //Hồng đậm 
        context[gridIndex].strokeRect(squareX, squareY, squareWidth - shipPadding * 2, squareHeight - shipPadding * 2);
    }
    if (check === 0) //step old
    {
        if (grid[gridIndex].shots[x * gridCols + y] === 0) {
            context[gridIndex].strokeStyle = '#ffffff'; //Hồng nhạt
            context[gridIndex].strokeRect(squareX, squareY, squareWidth - shipPadding * 2, squareHeight - shipPadding * 2);

        }
        if (grid[gridIndex].shots[x * gridCols + y] === 1) {
          context[gridIndex].drawImage(imgMiss, squareX - 18 + squareWidth / 2,squareY - 18 + squareWidth / 2, 30, 30);
        }

        if (grid[gridIndex].shots[x * gridCols + y] === 2) {
            context[gridIndex].beginPath();
            context[gridIndex].drawImage(imgHit, squareX - 18 + squareWidth / 2,squareY - 18 + squareWidth / 2, 30, 30);         

        }
    }

  }

  return {
      'initGame': initGame,
      'updateGrid': updateGrid,
      'setTurn': setTurn,
      'setGameOver': setGameOver,
      'moveAndShot': moveAndShot
  };
})();
