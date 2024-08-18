const canvas = document.querySelector("#ping-pong");
const context = canvas.getContext("2d");

const startBtn = document.querySelector("#start-btn");
const pauseBtn = document.querySelector("#pause-btn");
const restartBtn = document.querySelector("#restart-btn");
const startBtnTitle = document.querySelector("#start-btn-title");
const exitBtn = document.querySelector("#exit-btn");

let gameRunning = false;
let gameStarted = false;
let animationId;
let ballDirectionX = 0; // To store the direction of the ball after pause
let ballDirectionY = 0; // To store the direction of the ball after pause

// CREATE USER PADDLE
const user = {
  x: 0,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  color: "red",
  score: 0
};

// CREATE COMPUTER PADDLE
const computer = {
  x: canvas.width - 10,
  y: canvas.height / 2 - 100 / 2,
  width: 10,
  height: 100,
  color: "black",
  score: 0
};

// CREATE THE BALL
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 4, // Initial speed
  initialSpeed: 4, // Initial speed for each round
  velocityX: 0,
  velocityY: 0,
  color: "white"
};

// CREATE THE NET
const net = {
  x: canvas.width / 2 - 1,
  y: 0,
  width: 2,
  height: 10,
  color: "white"
};

// DRAW NET FUNCTION
function drawNet() {
  const netWidth = 4;
  const netSpacing = 15;
  context.shadowBlur = 10;
  context.shadowColor = "blue"; // Neon glow effect
  for (let i = 0; i <= canvas.height; i += netSpacing) {
    drawRectangle(net.x, net.y + i, netWidth, net.height, "white");
  }
  context.shadowBlur = 0; // Reset shadow
}

// DRAW RECTANGLE FUNCTION
function drawRectangle(x, y, w, h, color) {
  context.fillStyle = color;
  context.fillRect(x, y, w, h);
}

// DRAW CIRCLE FUNCTION
function drawCircle(x, y, r, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2, false);
  context.closePath();
  context.fill();
}

// DRAW TEXT FUNCTION
function drawText(text, x, y, color) {
  context.fillStyle = color;
  context.font = "45px fantasy";
  context.fillText(text, x, y);
}

// RENDER GAME FUNCTION
function render() {
  // CLEAR THE CANVAS
  drawRectangle(0, 0, canvas.width, canvas.height, "green");

  // DRAW THE NET
  drawNet();

  // DRAW THE SCORE
  drawText(user.score, canvas.width / 4, canvas.height / 5, "white");
  drawText(computer.score, (3 * canvas.width) / 4, canvas.height / 5, "white");

  // DRAW THE USER AND COMPUTER PADDLES
  drawRectangle(user.x, user.y, user.width, user.height, user.color);
  drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);

  // DRAW THE BALL
  drawCircle(ball.x, ball.y, ball.radius, ball.color);

  // DRAW THE WHITE LINE IN THE MIDDLE
  drawRectangle(net.x, net.y, net.width, canvas.height, net.color);
}

// CONTROL USER'S PADDLE
canvas.addEventListener("mousemove", movePaddle);

function movePaddle(evt) {
  let rectangle = canvas.getBoundingClientRect();
  user.y = evt.clientY - rectangle.top - user.height / 2;
}

// COLLISION DETECTION FUNCTION
function collision(b, p) {
  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom; 
}

// RESET BALL FUNCTION
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = ballDirectionX; // Maintain direction after pause
  ball.velocityY = ballDirectionY; // Maintain direction after pause
}

// RESET GAME FUNCTION
function resetGame() {
  user.score = 0;
  computer.score = 0;
  user.y = canvas.height / 2 - user.height / 2;
  computer.y = canvas.height / 2 - computer.height / 2;
  resetBall();
  render(); // Render the initial game screen
  gameStarted = false; // Allow the game to be started again
  ball.speed = ball.initialSpeed; // Reset ball speed to initial value
  ballDirectionX = 0; // Reset direction
  ballDirectionY = 0; // Reset direction
  ball.velocityX = 0;
  ball.velocityY = 0;

  if (gameRunning) {
    ballDirectionX = ball.speed; // Set initial movement
    ballDirectionY = ball.speed; // Set initial movement
    ball.velocityX = ballDirectionX;
    ball.velocityY = ballDirectionY;
    animate();
  }
}

// UPDATE FUNCTION
function update() {
  if (!gameRunning) return; // Do not update if game is not running

  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // SIMPLE AI TO CONTROL THE COMPUTER PADDLE
  let computerLevel = 0.1;
  computer.y += (ball.y - (computer.y + computer.height / 2)) * computerLevel;

  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }

  let player = (ball.x < canvas.width / 2) ? user : computer;

  if (collision(ball, player)) {
    let collidePoint = ball.y - (player.y + player.height / 2);
    collidePoint = collidePoint / (player.height / 2);
    let angleRad = collidePoint * Math.PI / 4;
    let direction = (ball.x < canvas.width / 2) ? 1 : -1;

    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);
    ball.speed *= 1.10; // Increase the ball's speed by 1.5% each hit
  }

  // UPDATE THE SCORE
  if (ball.x - ball.radius < 0) {
    computer.score++;
    resetBall();
    ball.speed = ball.initialSpeed; // Reset ball speed to initial value
    ballDirectionX = ball.speed;
    ballDirectionY = ball.speed;
    ball.velocityX = ballDirectionX;
    ball.velocityY = ballDirectionY;
    if (!gameRunning) {
      gameRunning = true;
      animate();
    }
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    resetBall();
    ball.speed = ball.initialSpeed; // Reset ball speed to initial value
    ballDirectionX = -ball.speed; // Direction changes after each round
    ballDirectionY = ball.speed;
    ball.velocityX = ballDirectionX;
    ball.velocityY = ballDirectionY;
    if (!gameRunning) {
      gameRunning = true;
      animate();
    }
  }
}

// GAME INITIALIZATION FUNCTION
function animate() {
  if (!gameRunning) {
    return; // Don't continue the animation if it's paused
  }

  update();
  render();
  animationId = requestAnimationFrame(animate);
}

// SHOW GAME SCREEN FUNCTION
function showGameScreen() {
  document.getElementById("title-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  resetGame(); // Render the game screen without starting the game loop
}

// START GAME BUTTON FUNCTION
startBtnTitle.addEventListener("click", showGameScreen);

// START GAME BUTTON FUNCTION
startBtn.addEventListener("click", () => {
  if (!gameRunning && !gameStarted) {
    gameRunning = true;
    gameStarted = true; // Mark the game as started
    ballDirectionX = ball.speed; // Set initial direction
    ballDirectionY = ball.speed; // Set initial direction
    ball.velocityX = ballDirectionX;
    ball.velocityY = ballDirectionY;
    animate();
  } else if (!gameRunning && gameStarted) {
    ball.velocityX = ballDirectionX; // Resume movement in previous direction
    ball.velocityY = ballDirectionY; // Resume movement in previous direction
    gameRunning = true;
    animate();
  }
});

// PAUSE GAME BUTTON FUNCTION
pauseBtn.addEventListener("click", () => {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  ballDirectionX = ball.velocityX; // Store the direction for later use
  ballDirectionY = ball.velocityY; // Store the direction for later use
});

// RESTART GAME BUTTON FUNCTION
restartBtn.addEventListener("click", () => {
  gameRunning = false; // Stop the game if running
  cancelAnimationFrame(animationId); // Cancel the ongoing animation
  resetGame(); // Reset the game state
  render(); // Render the game screen without starting the game loop
});

// EXIT GAME BUTTON FUNCTION
exitBtn.addEventListener("click", () => {
  gameRunning = false; // Stop the game if running
  cancelAnimationFrame(animationId); // Cancel the ongoing animation
  document.getElementById("game-screen").style.display = "none"; // Hide the game screen
  document.getElementById("title-screen").style.display = "flex"; // Show the title screen
});
