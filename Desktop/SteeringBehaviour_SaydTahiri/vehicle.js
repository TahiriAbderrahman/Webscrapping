/*
  Calculates the orthogonal projection of point a onto vector b.
  Points a and b are vectors calculated as follows:
  let v1 = p5.Vector.sub(a, pos); // v1 represents pos -> a
  let v2 = p5.Vector.sub(b, pos); // v2 represents pos -> b
*/
function findProjection(pos, a, b) {
  let v1 = p5.Vector.sub(a, pos);
  let v2 = p5.Vector.sub(b, pos);
  v2.normalize();
  let sp = v1.dot(v2);
  v2.mult(sp);
  v2.add(pos);
  return v2;
}

class Vehicle {
  static debug = false;

  constructor(x, y) {
    // Vehicle position
    this.pos = createVector(x, y);
    // Vehicle velocity
    this.vel = createVector(0, 0);
    // Vehicle acceleration
    this.acc = createVector(0, 0);
    // Maximum speed of the vehicle
    this.maxSpeed = 6;
    // Maximum force applied to the vehicle
    this.maxForce = 0.9;
    this.color = "white";
    // Approximately in seconds
    this.lifespan = 5;
    this.weightArrive = 0.3;
    this.weightObstacle = 0.9;
    this.weightSeparation = 0.9;
    this.r_pourDessin = 16;
    // Vehicle radius for avoidance
    this.r = this.r_pourDessin * 2;
    this.perceptionRadius = 24;

    // For obstacle avoidance
    this.largeurZoneEvitementDevantVaisseau = this.r / 2;

    // Path behind vehicles
    this.path = [];
    this.pathMaxLength = 30;
  }

  wander() {
    // Point in front of the vehicle
    let wanderPoint = this.vel.copy();
    wanderPoint.setMag(100);
    wanderPoint.add(this.pos);

    // Circle around the point
    let wanderRadius = 50;

    // Calculate the point on the circle
    let theta = this.wanderTheta + this.vel.heading();
    let x = wanderRadius * cos(theta);
    let y = wanderRadius * sin(theta);
    wanderPoint.add(x, y);

    // Calculate the desired speed vector
    let steer = wanderPoint.sub(this.pos);
    steer.setMag(this.maxForce);
    this.applyForce(steer);

    // Move the point on the circle (in radians)
    this.displaceRange = 0.3;
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
  }

  applyBehaviors(target, obstacles, vehicules) {
    let arriveForce = this.arrive(target);
    let separationForce = this.separation(vehicules);
    let avoidForce = this.avoidAmeliore(obstacles, vehicules, false);

    arriveForce.mult(this.weightArrive);
    avoidForce.mult(this.weightObstacle);
    separationForce.mult(this.weightSeparation);

    this.applyForce(arriveForce);
    this.applyForce(avoidForce);
    this.applyForce(separationForce);
  }

  separation(v) {
    let steering = createVector();
    let total = 0;
    for (let other of v) {
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
      if (other != this && d < this.perceptionRadius) {
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.div(d * d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(this.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(this.maxForce);
    }
    return steering;
  }

  avoid(obstacles) {
    // Calculate a vector ahead in front of the vehicle
    let ahead = this.vel.copy();
    ahead.normalize();
    ahead.mult(100);

    // Detect the nearest obstacle
    let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);

    // Calculate the distance between the circle and the end of the ahead vector
    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);

    // Draw the point for debugging
    fill("red");
    noStroke();
    circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);

    // Draw the avoidance zone
    stroke(color(255, 200, 0, 90));
    strokeWeight(this.largeurZoneEvitementDevantVaisseau);
    line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);

    let distance = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);

    if (distance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau + this.r) {
      // Collision possible
      obstacleLePlusProche.color = "red";
      let force = p5.Vector.sub(pointAuBoutDeAhead, obstacleLePlusProche.pos);

      // Draw the force vector for debugging
      this.drawVector(obstacleLePlusProche.pos, force, "yellow");

      // Steering (piloting) step
      force.setMag(this.maxSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    } else {
      // No collision possible
      obstacleLePlusProche.color = "green";
      return createVector(0, 0);
    }
  }

  avoidAmeliore(obstacles, vehicules, vehiculesAsObstacles = false) {
    // Calculate a vector ahead in front of the vehicle
    let ahead = this.vel.copy();
    ahead.normalize();
    ahead.mult(20 * this.vel.mag() * 0.8);

    // Second vector half the size
    let ahead2 = ahead.copy();
    ahead2.mult(0.5);

    // Draw the vectors if in debug mode
    if (Vehicle.debug) {
      this.drawVector(this.pos, ahead, "lightblue");
      this.drawVector(this.pos, ahead2, "red");
    }

    // Detection of the nearest obstacle
    let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);
    let vehiculeLePlusProche = this.getVehiculeLePlusProche(vehicules);

    // Calculate the distance between the circle and the end of the ahead vectors
    let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
    let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);

    // Draw the point for debugging
    if (Vehicle.debug) {
      fill("red");
      noStroke();
      circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 10);

      // Draw the avoidance zone
      stroke(color(255, 200, 0, 90));
      strokeWeight(this.largeurZoneEvitementDevantVaisseau);
      line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
    }

    let distance1 = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
    let distance2 = pointAuBoutDeAhead2.dist(obstacleLePlusProche.pos);
    let distance3 = this.pos.dist(obstacleLePlusProche.pos);
    let distance4 = Infinity;
    if (vehiculeLePlusProche) {
      distance4 = this.pos.dist(vehiculeLePlusProche.pos);
    }

    let plusPetiteDistance = min(distance1, distance2);
    plusPetiteDistance = min(plusPetiteDistance, distance3);

    let pointDeReference;
    if (distance1 < distance2) {
      pointDeReference = pointAuBoutDeAhead;
    } else {
      pointDeReference = pointAuBoutDeAhead2;
    }
    if ((distance3 < distance1) && (distance3 < distance2)) {
      pointDeReference = this.pos;
    }

    let alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche = (distance3 < obstacleLePlusProche.r);

    if (vehiculesAsObstacles) {
      if (!alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche) {
        let distanceAvecVehiculeLePlusProche = distance4;
        let distanceAvecObstacleLePlusProche = distance3;

        if (distanceAvecVehiculeLePlusProche < distanceAvecObstacleLePlusProche) {
          obstacleLePlusProche = vehiculeLePlusProche;
          plusPetiteDistance = distanceAvecVehiculeLePlusProche;
        }
      }
    }

    if (plusPetiteDistance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
      // Collision possible
      obstacleLePlusProche.color = "red";
      let force = p5.Vector.sub(pointDeReference, obstacleLePlusProche.pos);

      if (Vehicle.debug) {
        this.drawVector(obstacleLePlusProche.pos, force, "yellow");
      }

      // Steering (piloting) step
      force.setMag(this.maxSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);

      if (alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche) {
        force.setMag(this.maxForce * 2);
      }
      return force;
    } else {
      // No collision possible
      obstacleLePlusProche.color = "green";
      return createVector(0, 0);
    }
  }

  getObstacleLePlusProche(obstacles) {
    let plusPetiteDistance = 100000000;
    let obstacleLePlusProche;

    obstacles.forEach(o => {
      const distance = this.pos.dist(o.pos);
      if (distance < plusPetiteDistance) {
        plusPetiteDistance = distance;
        obstacleLePlusProche = o;
      }
    });

    return obstacleLePlusProche;
  }

  getVehiculeLePlusProche(vehicules) {
    let plusPetiteDistance = Infinity;
    let vehiculeLePlusProche;

    vehicules.forEach(v => {
      if (v != this) {
        const distance = this.pos.dist(v.pos);
        if (distance < plusPetiteDistance) {
          plusPetiteDistance = distance;
          vehiculeLePlusProche = v;
        }
      }
    });

    return vehiculeLePlusProche;
  }

  getClosestObstacle(pos, obstacles) {
    let closestObstacle = null;
    let closestDistance = 1000000000;
    for (let obstacle of obstacles) {
      let distance = pos.dist(obstacle.pos);
      if (closestObstacle == null || distance < closestDistance) {
        closestObstacle = obstacle;
        closestDistance = distance;
      }
    }
    return closestObstacle;
  }

  arrive(target) {
    // The second argument enables the arrival behavior
    return this.seek(target, true);
  }

  seek(target, arrival = false) {
    let force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      let slowRadius = 100;
      let distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.ajoutePosAuPath();
    this.lifespan -= 0.01;
  }

  ajoutePosAuPath() {
    this.path.push(this.pos.copy());
    if (this.path.length > this.pathMaxLength) {
      this.path.shift();
    }
  }

  show() {
    this.drawPath();
    this.drawVehicle();
  }

  drawVehicle() {
    stroke(255);
    strokeWeight(2);
    fill(this.color);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    triangle(-this.r_pourDessin, -this.r_pourDessin / 2, -this.r_pourDessin, this.r_pourDessin / 2, this.r_pourDessin, 0);
    pop();
    this.drawVector(this.pos, this.vel, color(255, 0, 0));
    if (Vehicle.debug) {
      stroke(255);
      noFill();
      circle(this.pos.x, this.pos.y, this.r);
    }
  }

  drawPath() {
    push();
    stroke(255);
    noFill();
    strokeWeight(1);
    fill(this.color);
    this.path.forEach((p, index) => {
      if (!(index % 5)) {
        circle(p.x, p.y, 1);
      }
    });
    pop();
  }

  drawVector(pos, v, color) {
    push();
    strokeWeight(3);
    stroke(color);
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize,0);
    pop();
  }

  
    
    edges() {
      if (this.pos.x > width + this.r) {
        this.pos.x = -this.r;
      } else if (this.pos.x < -this.r) {
        this.pos.x = width + this.r;
      }
      if (this.pos.y > height + this.r) {
        this.pos.y = -this.r;
      } else if (this.pos.y < -this.r) {
        this.pos.y = height + this.r;
      }
    }
  }
  
  class Target extends Vehicle {
    constructor(x, y) {
      super(x, y);
      this.vel = p5.Vector.random2D();
      this.vel.mult(5);
    }
  
    show() {
      push();
      stroke(255);
      strokeWeight(2);
      fill("#F063A4");
      push();
      translate(this.pos.x, this.pos.y);
      circle(0, 0, this.r * 2);
      pop();
      pop();
    }
  }