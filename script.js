//Define el canvas llamándolo desde el documento poniendo un contexto 2d
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
//Crea un array para determinar que tecla está presionada y establece como variables las dos teclas que utilizaremos(flecha arriba y flecha abajo) inicializándolas con los valores correspondientes
const keysPressed = [];
const keyUp = "ArrowUp";
const keyDown = "ArrowDown";

//Si una tecla está pulsada se activa el movimiento, añadiendo la tecla al array
window.addEventListener("keydown", function (e) {
    keysPressed[e.code] = true;
});
//Si se deja de pulsar, se quita su código del array para que pueda escuchar eventos nuevos, y asi pueda ir al lado contrario
window.addEventListener("keyup", function (e) {
    keysPressed[e.code] = false;
});

//Define el tamaño del canvas para que ocupe toda la pantalla
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

//Esta función define las coordenadas para que en otras funciones sea más fácil determinar la posición o velocidad de los elementos del programa
function vec2(x, y) {
    return {x: x, y: y}
}
//Esta función se encarga de crear la pelota. Añadiendo los parámetros posición y velocidad, los cuales vendrán determinados por vec2 y el parámetro radio que simplemente es un número
function Ball(pos, velocity, radius) {
    this.pos = pos;
    this.velocity = velocity;
    this.radius = radius;
    //Esta parte se encarga del movimiento de la pelota, que simplemente va sumando la velocidad a la posición para que esta cambie y simule el movimiento
    this.update = function () {
        this.pos.x += this.velocity.x;
        this.pos.y += this.velocity.y;
    }
    //Esta parte de la función se encarga de dibujar la pelota
    this.draw = function () {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}
//Función que crea las palas. Añadiendo los parámetros posición y velocidad, los cuales vendrán determinados por vec2 y los parámetros anchura y altura que simplemente son números
function Paddle(pos, velocity, width, height) {
    this.pos = pos;
    this.velocity = velocity;
    this.width = width;
    this.height = height;
    //Determina por defecto la puntuación del jugador asociado a la pala a 0, y según vayan ocurriendo los puntos esta se irá actualizando en funciones siguientes.
    this.score = 0;
    //Esta parte se encarga del movimiento de la pala, que simplemente va sumando o restando(dependiendo de si se pulsa la flecha de subida o de bajada) la velocidad a la posición para que esta cambie y simule el movimiento
    this.update = function () {
        if (keysPressed[keyUp]) {
            this.pos.y -= this.velocity.y;
        }
        if (keysPressed[keyDown]) {
            this.pos.y += this.velocity.y;
        }
    }
    //Esta parte de la función dibuja la pala
    this.draw = function () {
        ctx.fillStyle = "#33ff00"
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height)
    }
    //Esta parte de la función calcula la mitad del ancho la pala
    this.getHalfWidth = function () {
        return this.width / 2
    }
    //Esta parte de la función calcula la mitad del alto la pala
    this.getHalfHeight = function () {
        return this.height / 2
    }
    //Esta parte de la función calcula el centro de la pala
    this.getCenter = function () {
        return vec2(this.pos.x + this.getHalfWidth(), this.pos.y + this.getHalfHeight(),)
    }
}
//Esta función establece la colisión entre la bola y la pala
function ballPaddleCollision(ball, paddle) {
    let dx = Math.abs(ball.pos.x - paddle.getCenter().x)
    let dy = Math.abs(ball.pos.y - paddle.getCenter().y)
    if (dx <= (ball.radius + paddle.getHalfWidth()) && dy <= (paddle.getHalfHeight() + ball.radius)) {
        ball.velocity.x *= -1;
    }
}
//que la pala siga a la bola cuando se mueve hacia ella
function Player2AI(ball, paddle) {
    if (ball.velocity.x > 0) {
        if (ball.pos.y > paddle.pos.y) {
            paddle.pos.y += paddle.velocity.y;
            if (paddle.pos.y + paddle.height >= canvas.height) {
                paddle.pos.y = canvas.height - paddle.height;
            }
        }
    }
    if (ball.pos.y < paddle.pos.y) {
        paddle.pos.y -= paddle.velocity.y;
        if (paddle.pos.y <= 0) {
            paddle.pos.y = 0;
        }
    }
}
//Utilizando la función anterior creamos una pelota
const ball = new Ball(vec2(200, 200), vec2(10, 10), 20);
//Creamos las palas
const paddle1 = new Paddle(vec2(30, 50), vec2(15, 15), 20, 160);
const paddle2 = new Paddle(vec2(canvas.width - 40, 50), vec2(15, 15), 20, 160);
//Colisión de la pelota con los ejes. Importante entender que arriba a la izquierda el valor de los ejes es (0,0) y abajo a la derecha(max width, max height).
//Si llega abajo y su posición(centro) MÁS el radio es superior al max height, la velocidad se multiplica por -1 para cambiar de dirección y que se mantenga la velocidad.
//Si llega arriba y su posición(centro) MENOS el radio es inferior a 0, cambiamos de dirección. Y lo mismo sucede con los ejes laterales.
function respawn(ball) {
    if (ball.velocity.x > 0) {
        ball.pos.x = canvas.width - 150;
        ball.pos.y = (Math.random() * (canvas.height - 200)) + 100;
    }
    if (ball.velocity.x < 0) {
        ball.pos.x = 150;
        ball.pos.y = (Math.random() * (canvas.height - 200)) + 100;
    }
    ball.velocity.x *= -1;
    ball.velocity.y *= -1;

}
function IncreaseScore(ball, paddle1, paddle2) {
    if (ball.pos.x <= 0) {
        paddle2.score += 1;
        document.getElementById("player2score").innerHTML = paddle2.score
        respawn(ball)
    }
    if (ball.pos.x >= canvas.width - ball.radius) {
        paddle1.score += 1;
        document.getElementById("player1score").innerHTML = paddle1.score
        respawn(ball)
    }
}
function ballCollisionEdges(ball) {
    if (ball.pos.y + ball.radius >= canvas.height) {
        ball.velocity.y *= -1;
    }
    if (ball.pos.y - ball.radius <= 0) {
        ball.velocity.y *= -1;
    }
}
function paddleCollisionEdges(paddle) {
    if (paddle.pos.y + paddle.height >= canvas.height) {
        paddle.pos.y = canvas.height - paddle.height
    }
    if (paddle.pos.y <= 0) {
        paddle.pos.y = 0
    }
}
function gameUpdate() {
    ball.update()
    ballCollisionEdges(ball)
    paddle1.update()
    paddleCollisionEdges(paddle1)
    ballPaddleCollision(ball, paddle1)
    ballPaddleCollision(ball, paddle2)
    Player2AI(ball, paddle2)
    IncreaseScore(ball, paddle1, paddle2)
}
function gameDraw() {
    ball.draw();
    paddle1.draw();
    paddle2.draw();
}
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    window.requestAnimationFrame(gameLoop);
    gameUpdate();
    gameDraw();
}
gameLoop()