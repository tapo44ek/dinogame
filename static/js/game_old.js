let canvas, ctx, dino, obstacles, scoreCounterElement, highestScoreElement;
let i = 1;
let frame = 0;
let gravity = 1.2;
let gameOver = false;
let score = 0;
//let highestScore = 0;
//
function initGame() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    dino = { x: 50, y: 350, width: 50, height: 50, dy: 0, jumping: false };
    obstacles = [];
    scoreCounterElement = document.getElementById("scoreCounter");
    highestScoreElement = document.getElementById("highestScore");
}

function drawDino() {
    const dinoImage = new Image();
    const dinoImage1 = new Image();
    dinoImage.src = "/static/imgs/dino1.png";
    dinoImage1.src = "/static/imgs/dino2.png";

    ctx.drawImage(i < 10 ? dinoImage : dinoImage1, dino.x, dino.y, dino.width, dino.height);
    i = (i + 1) % 20;
}

function drawObstacles() {
    const cactusImage = new Image();
    cactusImage.src = "/static/imgs/cactus1.png";

    obstacles.forEach(obstacle => {
        ctx.drawImage(cactusImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateDino() {
    if (dino.jumping) {
        dino.dy += gravity;
        dino.y += dino.dy;

        if (dino.y >= 350) {
            dino.y = 350;
            dino.jumping = false;
            dino.dy = 0;
        }
    }
}

function updateObstacles() {
    if (frame % 100 === 0) {
        obstacles.push({ x: canvas.width, y: 350, width: 20, height: 50, passed: false });
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= 4;

        if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
            obstacle.passed = true;
            score++;
            scoreCounterElement.textContent = score;

            // Проверяем, побит ли рекорд
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
            alert(`Игра окончена! Ваш результат: ${score}`);
            saveScore();
        }
    });
}

function saveScore() {
    fetch("/save-score/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&points=${score}`,
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error(error));
}

function jump() {
    if (!dino.jumping) {
        dino.jumping = true;
        dino.dy = -22;
    }
}

function startGame(email, initialHighestScore) {
    highestScore = initialHighestScore; // Устанавливаем начальный рекорд
    initGame();

    highestScoreElement.textContent = highestScore; // Отображаем рекорд

    document.addEventListener("keydown", e => {
        if (e.code === "Space") jump();
    });

    function gameLoop() {
        if (gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDino();
        drawObstacles();
        updateDino();
        updateObstacles();
        checkCollision();

        frame++;
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}