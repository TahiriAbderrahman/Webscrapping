let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicles = [];

let state = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 10; i++) {
    vehicles.push(new Vehicle(random(width), random(height)));
  }

  sliderRadiusSeperation = createSlider(10, 200, 24, 1);
  sliderSeperation = createSlider(0, 1, 0.9, 0.01);

  // Create an obstacle in the middle of the screen
  // a circle with a radius of 100px
  // TODO
  obstacle = new Obstacle(-width / 2, -height / 2, 100);
  obstacles.push(obstacle);
}

function draw() {
  // Change the background color
  background(30, 30, 50);

  target = createVector(mouseX, mouseY);

  // Draw the target following the mouse
  // Draw a circle with a radius of 32px at the mouse position
  fill(255, 0, 0);
  noStroke();
  ellipse(target.x, target.y, 32);

  // Draw obstacles
  // TODO
  obstacles.forEach((o) => {
    o.show();
  });
  let targetMouse = createVector(mouseX, mouseY);
  if (state) {
    console.log("State True");
    for (let i = 0; i < vehicles.length; i++) {
      if (i == 0) {
        vehicles[i].applyBehaviors(targetMouse, obstacles, vehicles);
        this.weightSeparation = 0;
      } else {
        let previousVehicle = vehicles[i - 1];

        let pointBehind = previousVehicle.vel.copy();
        pointBehind.normalize();
        pointBehind.mult(-50);
        pointBehind.add(previousVehicle.pos);

        fill(255, 100, 100); // Change vehicle color
        ellipse(pointBehind.x, pointBehind.y, 20); // Change vehicle shape

        vehicles[i].applyBehaviors(pointBehind, obstacles, vehicles);
        this.weightSeparation = 0;

        if (
          vehicles[i].pos.dist(pointBehind) < 20 &&
          vehicles[i].vel.mag() < 0.01
        ) {
          vehicles[i].weightArrive = 0;
          vehicles[i].weightObstacle = 0;
          vehicles[i].vel.setHeading(
            p5.Vector.sub(pointBehind, vehicles[i].pos).heading()
          );
        } else {
          vehicles[i].weightArrive = 0.3;
          vehicles[i].weightObstacle = 0.9;
        }
      }
      vehicles[i].update();
      vehicles[i].show();
    }
  } else {
    console.log("State False");
    for (let i = 0; i < vehicles.length; i++) {
      if (i == 0) {
        vehicles[i].applyBehaviors(targetMouse, obstacles, vehicles);
        this.weightSeparation = 0;
      } else {
        let previousVehicle = vehicles[0];

        let pointBehind = previousVehicle.vel.copy();
        pointBehind.normalize();
        pointBehind.mult(-100);
        pointBehind.add(previousVehicle.pos);

        fill(255, 100, 100); // Change vehicle color
        ellipse(pointBehind.x, pointBehind.y, 20); // Change vehicle shape

        vehicles[i].applyBehaviors(pointBehind, obstacles, vehicles);
        vehicles[i].weightSeparation = sliderSeperation.value();
        vehicles[i].perceptionRadius = sliderRadiusSeperation.value();
      }
      vehicles[i].update();
      vehicles[i].show();
    }
  }
}

function mousePressed() {
  obstacle = new Obstacle(mouseX, mouseY, random(5, 60));
  obstacles.push(obstacle);
}


function keyPressed() {
  if (key == "w") {
    for (let i = 0; i < vehicles.length; i++) {
      vehicles[i].wander()= !vehicles[i].wander();
    }
  }
  if (key == "v") {
    vehicles.push(new Vehicle(random(width), random(height)));
  }
  if (key == "s") {
    state = !state;
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  }

  if (key == "f") {
    const nbMissiles = 10;

    // Fire missiles!
    for (let i = 0; i < nbMissiles; i++) {
      let x = 20 + random(10);
      let y = random(height / 2 - 5, random(height / 2 + 5));

      let v = new Vehicle(x, y);
      vehicles.push(v);
    }
  }
}
