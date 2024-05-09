let player;
let circles = [];
let suns = [];
let triangles = [];
let score = 0;
let gameover = false;
let highscore = -1;

function setup() {
  
  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
  pHtmlMsg.style('color', 'deeppink');
  
  createCanvas(400, 600);
  noStroke();
  player = new Player(width / 2, height - 20, 100, 20);
  
  // Retrieve the high score from local storage if it exists
  if (localStorage.getItem('highscore')) {
    highscore = parseInt(localStorage.getItem('highscore'));
  }
}


function draw() {
  background(195, 217, 255);
  
  if (!gameover) {
    // Display player
    player.display();

    // Move player left or right
      player.move(currSerialVal);

    // Create new circle randomly
    if (random(1) < 0.02) {
      let x = random(width);
      let y = -20;
      let r = random(10, 30);
      let speed = random(1, 5);
      let circle = new Circle(x, y, r, speed);
      circles.push(circle);
    }

    // Create new triangle randomly
    if (random(1) < 0.01) {
      let x = random(width);
      let y = -20;
      let s = random(20, 40);
      let speed = random(1, 5);
      let triangle = new Triangle(x, y, s, speed);
      triangles.push(triangle);
    }
    
    // Create new sun randomly
    if (random(1) < 0.01) {
      let x = random(width);
      let y = -20;
      let r = random(30, 50);
      let speed = random(2, 6);
      let sun = new Sun(x, y, r, speed);
      suns.push(sun);
    }

    // Display and update circles
    for (let i = circles.length - 1; i >= 0; i--) {
      circles[i].display();
      circles[i].update();

      // Check collision with player
      if (circles[i].intersects(player)) {
        circles.splice(i, 1);
        score++;
      } else if (circles[i].offScreen()) {
        circles.splice(i, 1);
      }
    }

    // Display and update triangles
    for (let i = triangles.length - 1; i >= 0; i--) {
      triangles[i].display();
      triangles[i].update();

      // Check collision with player
      if (triangles[i].intersects(player)) {
        gameover = true;
        break;
      } else if (triangles[i].offScreen()) {
        triangles.splice(i, 1);
      }
    }
      
    // Display and update suns
    for (let i = suns.length - 1; i >= 0; i--) {
      suns[i].display();
      suns[i].update();

      // Check collision with player
      if (suns[i].intersects(player)) {
        suns.splice(i, 1);
        score += 2;
      } else if (suns[i].offScreen()) {
        suns.splice(i, 1);
      }
    }
  
    // Display score
    textAlign(LEFT);
    fill('#175616');
    textSize(20);
    text("Score: " + score, 10, 30);
    
  } else {
    // Update high score if the current score is higher
    if (score > highscore) {
      highscore = score;
      // Store the high score in local storage
      localStorage.setItem('highscore', highscore);
    }
    
    fill('#175616');
    textSize(32);
    textAlign(CENTER, CENTER);
    text("😈 Game Over 😈", width / 2, height / 2 - 80);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("Score: " + score, width / 2, height / 2 - 40);
    textSize(28);
    text("High Score: " + highscore, width / 2, height / 2);
    textSize(16);
    text("Press enter to play again!", width / 2, height / 2 + 40);
    textSize(40);
    text("🌞", width / 2, height / 2 + 80);

    if (keyIsPressed && keyCode === ENTER) {
      resetGame();
    }
  }
}

function resetGame() {
  circles = [];
  triangles = [];
  score = 0;
  gameover = false;
  player.x = width / 2;
  localStorage.setItem('highscore', highscore);
}

class Player {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  
  display() {
    fill('#CC5500'); // Royal blue player rectangle
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h);
  }
  
  move(step) {
    this.x += step;
    this.x = constrain(this.x, this.w / 2, width - this.w / 2);
  }
}

class Circle {
  constructor(x, y, r, speed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = speed;
  }
  
  display() {
    fill('#9DC183'); // Sage circles
    ellipse(this.x, this.y, this.r * 2);
  }
  
  update() {
    this.y += this.speed;
  }
  
  intersects(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.r + player.w / 2 && this.y + this.r > player.y - player.h / 2;
  }
  
  offScreen() {
    return this.y > height + this.r;
  }
}

class Triangle {
  constructor(x, y, s, speed) {
    this.x1 = x - s / 2;
    this.x2 = x + s / 2;
    this.x3 = x;
    this.y1 = y + s / 2;
    this.y2 = y + s / 2;
    this.y3 = y - s / 2;
    this.speed = speed;
  }
  
  display() {
    fill('#8F2100'); // Terra cotta triangles
    triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
  }
  
  update() {
    this.y1 += this.speed;
    this.y2 += this.speed;
    this.y3 += this.speed;
  }
  
  intersects(player) {
    // Check if player rectangle intersects with the triangle's bounding box
    return player.x + player.w / 2 > this.x1 && player.x - player.w / 2 < this.x2 &&
           player.y + player.h / 2 > this.y3 && player.y - player.h / 2 < this.y1;
  }
  
  offScreen() {
    return this.y1 > height && this.y2 > height && this.y3 > height;
  }
}

class Sun {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
  }
  
  display() {
    fill('#FFD700'); // Gold color
    textSize(this.size); // Set the size of the text
    text("🌞", this.x, this.y); // Draw the sun emoji
  }
  
  update() {
    this.y += this.speed;
  }
  
  intersects(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.w / 2 && this.y + this.size / 2 > player.y - player.h / 2;
  }
  
  offScreen() {
    return this.y > height + this.size / 2;
  }
}


