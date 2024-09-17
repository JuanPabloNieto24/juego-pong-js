let raquetaJugador;
let raquetaComputadora;
let pelota;
let puntajeJugador = 0;
let puntajeComputadora = 0;
let scoreDisplay;
let nivelDificultad = 1;
let fondo;
let barra1;
let barra2;
let bola;
let sonidoRebote; // Nueva variable para el sonido
let sonidoGol;


function setup() {
    let gameContainer = document.getElementById('game-container');
    let canvas = createCanvas(800, 400);

    if (gameContainer) {
        canvas.parent(gameContainer);
    } else {
        console.error("No se encontró el elemento 'game-container'. El canvas se añadirá al body.");
    }

    raquetaJugador = new Raqueta(20);
    raquetaComputadora = new Raqueta(width - 20);
    pelota = new Pelota();
    scoreDisplay = select('#score-display');
    fondo = loadImage('sprites/fondo2.png');
    barra1 = loadImage('sprites/barra1.png');
    barra2 = loadImage('sprites/barra2.png');
    bola = loadImage('sprites/bola.png');
    sonidoRebote = loadSound('sound/bounce.wav');
    sonidoGol = loadSound('sound/goal.wav');
}

function draw() {
    background(fondo);  // Fondo del juego

    // Dibujar línea central
    stroke(255, 50);  // Línea blanca semi-transparente
    strokeWeight(2);
    line(width / 2, 0, width / 2, height);

    // Actualizar puntaje
    if (scoreDisplay) {
        scoreDisplay.html(`${puntajeJugador} - ${puntajeComputadora}`);
    }

    raquetaJugador.mostrar(barra1);
    raquetaComputadora.mostrar(barra2);
    pelota.mostrar(bola);

    raquetaJugador.mover();
    raquetaComputadoraMover();
    pelota.mover();

    pelota.rebotarBordes();
    pelota.golpearRaqueta(raquetaJugador);
    pelota.golpearRaqueta(raquetaComputadora);

    if (pelota.anotarPunto()) {
        if (pelota.x > width / 2) {
            puntajeJugador++;
            aumentarDificultad();
        } else {
            puntajeComputadora++;
        }
        pelota.reiniciar();
    }
}

function aumentarDificultad() {
    nivelDificultad += 0.1;
    raquetaComputadora.velocidad = 5 * nivelDificultad;
}

class Raqueta {
    constructor(x) {
        this.x = x;
        this.y = height / 2;
        this.ancho = 10;
        this.alto = 80;
        this.velocidad = 5;
    }

    mostrar(imagen) {
        image(imagen, this.x - this.ancho / 2, this.y - this.alto / 2, this.ancho, this.alto);
    }

    mover() {
        if (keyIsDown(UP_ARROW) && this.y > this.alto / 2) {
            this.y -= this.velocidad;
        }
        if (keyIsDown(DOWN_ARROW) && this.y < height - this.alto / 2) {
            this.y += this.velocidad;
        }
    }
}

function raquetaComputadoraMover() {
    let objetivo = pelota.y - raquetaComputadora.alto / 2;
    let distancia = abs(raquetaComputadora.y - objetivo);
    let velocidadAjustada = min(distancia, raquetaComputadora.velocidad);
    
    if (distancia > 0) {
        if (raquetaComputadora.y < objetivo) {
            raquetaComputadora.y += velocidadAjustada;
        } else {
            raquetaComputadora.y -= velocidadAjustada;
        }
    }
    raquetaComputadora.y = constrain(raquetaComputadora.y, raquetaComputadora.alto / 2, height - raquetaComputadora.alto / 2);
}

class Pelota {
    constructor() {
        this.reiniciar();
        this.tamaño = 15;
        this.rotacion = 0;  // Ángulo de rotación inicial
    }

    reiniciar() {
        this.x = width / 2;
        this.y = height / 2;
        this.velocidadX = random([-5, -4, -3, 3, 4, 5]);
        this.velocidadY = random(-3, 3);
        this.rotacion = 0;  // Reiniciar rotación cuando la pelota se reinicia
    }

    mostrar(imagen) {
        push();  // Guardar el estado actual de la transformación
        translate(this.x, this.y);  // Mover el punto de referencia al centro de la pelota
        this.rotacion += (abs(this.velocidadX) + abs(this.velocidadY)) * 0.05;  // Aumentar el ángulo de rotación según la velocidad
        rotate(this.rotacion);  // Aplicar la rotación
        imageMode(CENTER);  // Dibujar la imagen desde su centro
        image(imagen, 0, 0, this.tamaño, this.tamaño);  // Dibujar la pelota con rotación
        pop();  // Restaurar el estado de la transformación
    }

    mover() {
        this.x += this.velocidadX;
        this.y += this.velocidadY;
    }

    rebotarBordes() {
        if (this.y < 0 || this.y > height) {
            this.velocidadY *= -1;
        }
    }

    golpearRaqueta(raqueta) {
        if (
            this.x - this.tamaño / 2 < raqueta.x + raqueta.ancho / 2 &&
            this.x + this.tamaño / 2 > raqueta.x - raqueta.ancho / 2 &&
            this.y > raqueta.y - raqueta.alto / 2 &&
            this.y < raqueta.y + raqueta.alto / 2
        ) {
            this.velocidadX *= -1.1;  // Aumenta ligeramente la velocidad
            this.velocidadY += (this.y - raqueta.y) / (raqueta.alto / 2) * 3;  // Añade efecto basado en dónde golpea la pelota
            sonidoRebote.play(); // Reproducir el sonido de rebote
        }
    }

    anotarPunto() {
        if (this.x < 0 || this.x > width) {
            sonidoGol.play(); // Reproducir el sonido de gol
            return true;
        }
        return false;
    }
}