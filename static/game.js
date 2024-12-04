let i = 1;
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        const dinoImage = new Image();
        dinoImage.src = 'imgs/dino1.png';

        const dinoImage1 = new Image();
        dinoImage1.src = 'imgs/dino2.png';

        const cactusImage = new Image();
        cactusImage.src = 'imgs/cactus1.png'; // Укажите путь к изображению кактуса

        const cactusImage1 = new Image();
        cactusImage.src = 'imgs/cactus2.png'; // Укажите путь к изображению кактуса

        // Переменные игры
        let dino = { x: 50, y: 350, width: 50, height: 50, dy: 0, jumping: false };
        let gravity = 1.2;
        let obstacles = [];
        let frame = 0;
        let score = 0;
        const scoreCounterElement = document.getElementById('scoreCounter');
        let gameOver = false;
        let nextObstacleDistance = Math.floor(100 + Math.random() * 100); // Рандомное расстояние до первого препятствия

        // Функция отрисовки динозаврика
        function drawDino() {
            ctx.drawImage(dinoImage, dino.x, dino.y, dino.width, dino.height);

        }

        function drawDino1() {
            ctx.drawImage(dinoImage1, dino.x, dino.y, dino.width, dino.height);

        }

        function drawObstacles() {
            obstacles.forEach(obstacle => {
                ctx.drawImage(cactusImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            });
        }

        // Функция отрисовки препятствий
        // function drawObstacles() {
        //     ctx.fillStyle = '#555';
        //     obstacles.forEach(obstacle => {
        //         ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        //     });
        // }

        // Функция обновления положения динозаврика
        function updateDino() {
            if (dino.jumping) {
                dino.dy += gravity;
                dino.y += dino.dy;

                // Возвращаем динозаврика на землю
                if (dino.y >= 350) {
                    dino.y = 350;
                    dino.jumping = false;
                    dino.dy = 0;
                }
            }
        }

        // Создаем препятствия с фиксированными размерами, но случайным интервалом
        function updateObstacles() {
            if (frame >= nextObstacleDistance) {
                obstacles.push({
                    x: canvas.width,
                    y: 350,
                    width: 20,
                    height: 50,
                    passed: false, // Флаг, чтобы не считать препятствие дважды
                });
                nextObstacleDistance = frame + Math.floor(50 + Math.random() * 100); // Генерация нового интервала
            }

            // Двигаем препятствия
            obstacles.forEach(obstacle => {
                obstacle.x -= 4;

                // Проверяем, перепрыгнуто ли препятствие
                if (!obstacle.passed && obstacle.x + obstacle.width < dino.x) {
                    obstacle.passed = true;
                    score++;
                    scoreCounterElement.textContent = score;
                }
            });

            // Убираем пройденные препятствия
            obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
        }

        // Проверка на столкновение
        function checkCollision() {
            obstacles.forEach(obstacle => {
                if (
                    dino.x*0.9 < obstacle.x + obstacle.width &&
                    dino.x*0.9 + dino.width > obstacle.x &&
                    dino.y*0.9 < obstacle.y + obstacle.height &&
                    dino.y*0.9 + dino.height > obstacle.y
                ) {
                    gameOver = true;
                    alert('Игра окончена! Ваш результат: ' + score);
                    location.reload();
                }
            });
        }

        // Обработка прыжка
        function jump() {
            if (!dino.jumping) {
                dino.jumping = true;
                dino.dy = -22;
            }
        }

        // Основной игровой цикл
        function gameLoop() {
            if (gameOver) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (i < 10) {
                drawDino();
                i += 1;
            }
            else if (i < 20) {
                drawDino1();
                i += 1;
            }
            else {
                i = 1;
                drawDino();
            }
            drawObstacles();

            updateDino();
            updateObstacles();
            checkCollision();

            frame++;
            requestAnimationFrame(gameLoop);
        }

        // Слушаем события клавиатуры
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                jump();
            }
        })
        document.addEventListener("touchstart", (e) => {
           jump();
        });;


document.getElementById("start-button").addEventListener("click", function () {
    const email = document.getElementById("email").value;
    if (!email) {
        alert("Введите почту!");
        return;
    }

    document.getElementById("email-form").style.display = "none";
    document.getElementById("game-container").style.display = "block";

    // Симуляция игры
    setTimeout(() => {
        gameLoop();

        // Отправка результата на сервер
        fetch("/save-score/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `email=${encodeURIComponent(email)}&points=${points}`,
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message);
            alert("Ваш результат сохранен!");
        })
        .catch((error) => {
            console.error("Ошибка:", error);
        });
    }, 50000000); // Игра длится 5 секунд
});




        // Запуск игры
