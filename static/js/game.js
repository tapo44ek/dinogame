let canvas, ctx, dino, obstacles, scoreCounterElement, highestScoreElement, playAgainButton;
let i = 1;
let frame = 0;
let gravity = 1.2;
let gameOver = false;
let score = 0;
let nextObstacleFrame = 0;
//let highestScore = 0;

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

    // Скрываем кнопку при старте игры
    playAgainButton.style.display = "none";
    console.log("Кнопка скрыта при старте"); // Лог для проверки
    playAgainButton.removeEventListener("click", restartGame); // Убираем предыдущий обработчик
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

        if (dino.y >= canvas.height - 50) {
            dino.y = canvas.height - 50;
            dino.jumping = false;
            dino.dy = 0;
        }
    }
}

function updateObstacles() {
        // Проверка: если игра только началась, создаём первое препятствие
    if (obstacles.length === 0 && frame === 0) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 50,
            width: 20,
            height: 50,
            passed: false
        });

        // Устанавливаем интервал для следующего препятствия
        nextObstacleFrame = frame + Math.floor(50 + Math.random() * 100);
    }

    // Если текущий кадр достиг момента генерации следующего препятствия
    if (frame >= nextObstacleFrame) {
        obstacles.push({
            x: canvas.width, // Начальная позиция справа за пределами экрана
            y: canvas.height - 50, // Привязка к нижнему краю (50px высота препятствия)
            width: 20,
            height: 50,
            passed: false
        });

        // Устанавливаем случайное расстояние до следующего препятствия
        nextObstacleFrame = frame + Math.floor(50 + Math.random() * 100); // От 50 до 150 кадров
    }

    // Обновляем положение препятствий
    obstacles.forEach((obstacle) => {
        obstacle.x -= 4; // Двигаем препятствие влево

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
            saveScore();
            alert(`Игра окончена! Ваш результат: ${score}`);
            showPlayAgainButton();
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
        .then(data => console.log(data.message))
        .catch(error => console.error(error));
}

function showPlayAgainButton() {
    playAgainButton.style.display = "block";
    console.log("Кнопка 'Играть ещё раз' отображена"); // Лог для проверки
    playAgainButton.addEventListener("click", restartGame);
}

function jump() {
    if (!dino.jumping) {
        dino.jumping = true;
        dino.dy = -22;
    }
}

function restartGame() {
    console.log("Перезапуск игры"); // Лог для проверки
    score = 0;
    scoreCounterElement.textContent = score;
    frame = 0;
    gameOver = false;
    startGame(email, highestScore);
}

function startGame(email, initialHighestScore) {
    highestScore = initialHighestScore; // Устанавливаем начальный рекорд
    initGame();

    highestScoreElement.textContent = highestScore; // Отображаем рекорд

    document.addEventListener("keydown", e => {
        if (e.code === "Space") jump();
    });

    document.addEventListener("touchstart", e => {
        e.preventDefault(); // Предотвращаем ненужное поведение браузера (например, скроллинг)
        jump();
    });

//    canvas.addEventListener("touchstart", (e) => {
//        e.preventDefault(); // Предотвращаем ненужное поведение браузера (например, скроллинг)
//        jump();
//    });

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