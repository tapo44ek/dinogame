let canvas, ctx, dino, obstacles, scoreCounterElement, highestScoreElement, playAgainButton;
let baseGravity = 1350; // Базовая гравитация
let baseJumpForce = -550; // Базовая начальная скорость прыжка
let gravity, jumpForce;
let gameOver = false;
let score = 0;
let nextObstacleTime = 0; // Время до появления следующего препятствия
//let highestScore = 0;
let lastFrameTime = 0; // Время последнего кадра
let gameSpeed = 1;
let jumpSpeed = 1;// Начальная скорость игры (множитель)

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

    // Устанавливаем начальные значения
    gravity = baseGravity;
    jumpForce = baseJumpForce;
    gameSpeed = 1;
}

function drawDino() {
    const dinoImage = new Image();
    const dinoImage1 = new Image();
    dinoImage.src = "/dinogame/static/imgs/dino1.png";
    dinoImage1.src = "/dinogame/static/imgs/dino2.png";

    const image = performance.now() % 400 < 200 ? dinoImage : dinoImage1;
    ctx.drawImage(image, dino.x, dino.y, dino.width, dino.height);
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
        dino.dy += gravity * deltaTime; // Ускорение вниз под действием гравитации
        dino.y += dino.dy * deltaTime; // Обновляем положение динозавра

        if (dino.y >= canvas.height - 50) { // Если динозавр касается земли
            dino.y = canvas.height - 50;
            dino.jumping = false; // Завершаем прыжок
            dino.dy = 0;
        }
    }
}

function updateObstacles(deltaTime) {
    const baseSpeed = 200; // Базовая скорость препятствий в пикселях/сек
    const obstacleSpeed = baseSpeed * gameSpeed; // Ускоренная скорость

    // Уменьшаем таймер до следующего препятствия
    nextObstacleTime -= deltaTime;

    if (nextObstacleTime <= 0) {
        // Создаём новое препятствие
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50,
            width: 20,
            height: 50,
            passed: false
        });

        nextObstacleTime = (1 + Math.random()) / gameSpeed; // Устанавливаем время до следующего препятствия
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= obstacleSpeed * deltaTime;

        if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
            obstacle.passed = true;
            score++;
            scoreCounterElement.textContent = score;

            if (score > highestScore) {
                highestScore = score;
                highestScoreElement.textContent = highestScore;
            }

            // Увеличиваем скорость игры при наборе каждого 5-го очка
            if (score % 5 === 0) {
                gameSpeed += 0.1; // Увеличиваем скорость на 10%
                jumpSpeed += 0.02;
                gravity = baseGravity * gameSpeed; // Увеличиваем гравитацию
                jumpForce = baseJumpForce * jumpSpeed; // Увеличиваем силу прыжка (в отрицательную сторону)
            }
        }
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function checkCollision() {
    obstacles.forEach(obstacle => {
        if (
            dino.x*0.9 < obstacle.x + obstacle.width &&
            dino.x*0.9 + dino.width > obstacle.x &&
            dino.y*0.9 < obstacle.y + obstacle.height &&
            dino.y*0.9 + dino.height > obstacle.y
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
        dino.dy = jumpForce; // Используем увеличенную начальную силу прыжка
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

    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
}