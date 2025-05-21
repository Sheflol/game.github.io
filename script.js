// 1. Получение доступа к элементам
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const playerNameInput = document.getElementById('player-name');
const startButton = document.getElementById('start-button');
const nameDisplay = document.getElementById('name');
const timeDisplay = document.getElementById('time');
const powerDisplay = document.getElementById('power');
const resultNameDisplay = document.getElementById('result-name');
const resultTimeDisplay = document.getElementById('result-time');
const restartButton = document.getElementById('restart-button');
const restartButtonOver = document.getElementById('restart-button-over');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const resultScoreDisplay = document.getElementById('result-score');
const gameoverScoreDisplay = document.getElementById('gameover-score');

// 2. Переменные игры
let playerName = '';
let time = 0;
let power = 50;
let gameInterval;
let walls = [];
let batteries = [];
let isGameRunning = false;
let playerY = canvas.height / 2;
let level = 1;
let wallSpeed = 5;
let wallIntervalTime = 2000;
let collisionAnimationFrames = [];
let currentAnimationFrame = 0;
let isColliding = false;
let timerInterval;
let wallInterval;
let score = 0;

// Звуки
const collisionSound = new Audio('audio/бумммммм.wav'); 
const batterySound = new Audio('audio/пуп.mp3'); 

// Изображения
const backgroundImage = new Image();
backgroundImage.src = 'img/фон.png';
const droneImage = new Image();
droneImage.src = 'img/дрон.png';

// 3. Функции
function showScreen(screen) {
    welcomeScreen.style.display = 'none';
    gameScreen.style.display = 'none';
    resultScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    screen.style.display = 'block';
}

function startGame() {
    playerName = playerNameInput.value;
    nameDisplay.textContent = playerName;
    resultNameDisplay.textContent = playerName;
    time = 0;
    power = 50;
    walls = [];
    batteries = [];
    playerY = canvas.height / 2;
    powerDisplay.textContent = power;
    timeDisplay.textContent = '00:00';
    level = 1;
    wallSpeed = 5;
    wallIntervalTime = 2000;
    score = 0;
    isGameRunning = true;
    showScreen(gameScreen);
    startTimer();
    generateWalls();
    gameInterval = requestAnimationFrame(gameLoop);
}

function gameOver(isWin) {
    isGameRunning = false;
    cancelAnimationFrame(gameInterval);
    clearInterval(wallInterval);
    clearInterval(timerInterval);

    // Расчет очков: время * коэффициент
    score = time * 10; 

    if (isWin) {
         resultTimeDisplay.textContent = timeDisplay.textContent;
         resultScoreDisplay.textContent = score; // Выводим очки
         showScreen(resultScreen);
    } else {
        gameoverScoreDisplay.textContent = score; // Выводим очки
        showScreen(gameOverScreen);
    }
}

function startTimer() {
    let seconds = 0;
    let minutes = 0;

    timerInterval = setInterval(() => {
        if (isGameRunning) {
            seconds++;
            if (seconds === 60) {
                minutes++;
                seconds = 0;
            }

            time = minutes * 60 + seconds;
            const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timeDisplay.textContent = formattedTime;

            power -= 1;
            powerDisplay.textContent = power;

            if (power <= 0) {
                clearInterval(timerInterval);
                gameOver(false);
            }
        }
        if (time % 30 === 0 && time > 0) {
            updateLevel();
        }
    }, 1000);
}

function updateLevel() {
    level++;
    wallSpeed += 0.5;
    wallIntervalTime -= 100;
    clearInterval(wallInterval);
    generateWalls();
}

function generateWalls() {
    wallInterval = setInterval(() => {
        if (isGameRunning) {
            const wallHeight = Math.floor(Math.random() * 401) + 100;
            const topWall = Math.random() < 0.5;
            const wall = {
                x: canvas.width,
                width: 50,
                height: wallHeight,
                top: topWall,
            };
            walls.push(wall);

            if (Math.random() < 0.75) {
                const batteryY = Math.floor(Math.random() * (canvas.height - 20));
                const battery = {
                    x: canvas.width + 150,
                    y: batteryY,
                    size: 20,
                };
                batteries.push(battery);
            }
        }
    }, wallIntervalTime);
}

function drawPlayer() {
    ctx.drawImage(droneImage, 50, playerY - 45, 90, 90); 
}

function drawWalls() {
    ctx.fillStyle = '#6c7a89';
    for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        if (wall.top) {
            ctx.fillRect(wall.x, 0, wall.width, wall.height);
        } else {
            ctx.fillRect(wall.x, canvas.height - wall.height, wall.width, wall.height);
        }
    }
}

function drawBatteries() {
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < batteries.length; i++) {
        const battery = batteries[i];
        ctx.fillRect(battery.x, battery.y - battery.size / 2, battery.size, battery.size);
    }
}

function moveWallsAndBatteries() {
    for (let i = 0; i < walls.length; i++) {
        walls[i].x -= wallSpeed;
    }

    for (let i = 0; i < batteries.length; i++) {
        batteries[i].x -= wallSpeed;
    }
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function checkCollisions() {
    for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];

        const playerX = 50;
        const playerWidth = 90; 
        const playerHeight = 90; 

        if (
            playerX + playerWidth > wall.x &&
            playerX < wall.x + wall.width
        ) {
            if (wall.top && playerY - playerHeight / 2 < wall.height) {
                collisionSound.currentTime = 0;
                collisionSound.play();
                clearInterval(timerInterval);
                gameOver(false);
                return;
            } else if (!wall.top && playerY + playerHeight / 2 > canvas.height - wall.height) {
                collisionSound.currentTime = 0;
                collisionSound.play();
                clearInterval(timerInterval);
                gameOver(false);
                return;
            }
        }
    }
    for (let i = 0; i < batteries.length; i++) {
        const battery = batteries[i];
        if (
            50 + 90 > battery.x && //Учитываем размер дрона
            50 < battery.x + battery.size &&
            playerY > battery.y - battery.size / 2 &&
            playerY < battery.y + battery.size / 2
        ) {
            power += 5;
            powerDisplay.textContent = power;
            batterySound.currentTime = 0;
            batterySound.play();
            batteries.splice(i, 1);
            i--;
        }
    }
}
function cleanUpWallsAndBatteries() {
        walls = walls.filter(wall => wall.x + wall.width > 0);
        batteries = batteries.filter(battery => battery.x + battery.size > 0);
    }
function gameLoop() {
    if (isGameRunning) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawPlayer();
        drawWalls();
        drawBatteries();
        moveWallsAndBatteries();
        checkCollisions();
        cleanUpWallsAndBatteries();

        powerDisplay.textContent = power;
        gameInterval = requestAnimationFrame(gameLoop);
    }
}

// 4. Обработчики событий
startButton.addEventListener('click', startGame);

playerNameInput.addEventListener('input', () => {
    startButton.disabled = playerNameInput.value.trim() === '';
});

restartButton.addEventListener('click', startGame);
restartButtonOver.addEventListener('click', startGame);

document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        playerY -= 20;
    } else if (event.key === 's' || event.key === 'S') {
        playerY += 20;
    }

    if (playerY < 45) {
        playerY = 45;
    }
    if (playerY > canvas.height - 45) { 
        playerY = canvas.height - 45;
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (isGameRunning) {
            isGameRunning = false;
            cancelAnimationFrame(gameInterval);
            clearInterval(wallInterval);
            clearInterval(timerInterval);

        } else {
            isGameRunning = true;
            gameInterval = requestAnimationFrame(gameLoop);
            startTimer();
            generateWalls();
            
        }
    }
});

// 5. Инициализация
showScreen(welcomeScreen);
