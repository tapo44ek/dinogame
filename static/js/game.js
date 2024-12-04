let canvas, ctx, dino, obstacles, scoreCounterElement, highestScoreElement, playAgainButton;
let i = 1;
let gravity = 1200; // Гравитация в пикселях/сек^2
let gameOver = false;
let score = 0;
let nextObstacleTime = 0; // Время для следующего препятствия в секундах
let highestScore = 0;
let lastFrameTime = 0; // Время предыдущего кадра

function initGame() {
    canvas = document.getElementById("gameCanvas");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.4;
    ctx = canvas.getContext("2d");
    dino = { x: 50, y: canvas.height - 50, width: 50, height: 50, dy: 0, jumping: false };
    obstacles = [];
    scoreCounterElement = document.getElementById("scoreCounter");
    highestScoreElement = document.getElementById("highestScore");
    playAgainButton = document.getElementById("playAgainButton");

    playAgainButton.style.display = "none";
    playAgainButton.removeEventListener("click", restartGame);
}

function drawDino() {
    const dinoImage = new Image();
    const dinoImage1 = new Image();
    dinoImage.src = "/dinogame/static/imgs/dino1.png";
    dinoImage1.src = "/dinogame/static/imgs/dino2.png";

    ctx.drawImage(i < 10 ? dinoImage : dinoImage1, dino.x, dino.y, dino.width, dino.height);
    i = (i + 1) % 20;
}

function drawObstacles() {
    const cactusImage = new Image();
    cactusImage.src = "/dinogame/static/imgs/cactus1.png";

    obstacles.forEach(obstacle => {
        ctx.drawImage(cactusImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateDino(deltaTime) {
    if (dino.jumping) {
        dino.dy += gravity * deltaTime; // Ускорение с учётом времени
        dino.y += dino.dy * deltaTime; // Перемещение с учётом времени

        if (dino.y >= canvas.height - 50) {
            dino.y = canvas.height - 50;
            dino.jumping = false;
            dino.dy = 0;
        }
    }
}

function updateObstacles(deltaTime) {
    // Генерация препятствий
    nextObstacleTime -= deltaTime;
    if (nextObstacleTime <= 0) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50,
            width: 20,
            height: 50,
            passed: false
        });
        nextObstacleTime = 1 + Math.random() * 1; // Новое препятствие через 1-2 секунды
    }

    // Движение препятствий
    const speed = 200; // Скорость движения препятствий в пикселях/сек
    obstacles.forEach((obstacle) => {
        obstacle.x -= speed * deltaTime;

        if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
            obstacle.passed = true;
            score++;
            scoreCounterElement.textContent = score;

            if (score > highestScore) {
                highestScore = score;
                highestScoreElement.textContent = highestScore;
            }
        }
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            gameOver = true;
            saveScore();
            alert(`Игра окончена! Ваш результат: ${score}`);
            showPlayAgainButton();
        }
    });
}

function saveScore() {
    fetch("/dinogame/save-score/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&points=${score}`,
    })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error(error));
}

function showPlayAgainButton() {
    playAgainButton.style.display = "block";
    playAgainButton.addEventListener("click", restartGame);
}

function jump() {
    if (!dino.jumping) {
        dino.jumping = true;
        dino.dy = -500; // Начальная скорость прыжка в пикселях/сек
    }
}

function restartGame() {
    score = 0;
    scoreCounterElement.textContent = score;
    gameOver = false;
    startGame(email, highestScore);
}

function startGame(email, initialHighestScore) {
    highestScore = initialHighestScore;
    initGame();
    highestScoreElement.textContent = highestScore;

    document.addEventListener("keydown", e => {
        if (e.code === "Space") jump();
    });

    document.addEventListener("touchstart", e => {
        e.preventDefault();
        jump();
    });

    function gameLoop(currentTime) {
        if (gameOver) return;

        const deltaTime = (currentTime - lastFrameTime) / 1000; // Время между кадрами в секундах
        lastFrameTime = currentTime;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDino();
        drawObstacles();
        updateDino(deltaTime);
        updateObstacles(deltaTime);
        checkCollision();

        requestAnimationFrame(gameLoop);
    }

    lastFrameTime = performance.now(); // Устанавливаем начальное время
    gameLoop(lastFrameTime);
}