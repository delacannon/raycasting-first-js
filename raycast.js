const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = 15 * TILE_SIZE;
const WINDOW_HEIGHT = 11 * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

class Map {
	constructor() {
		this.grid = [
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
			[1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
			[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		];
	}

	hasWallAt(x, y) {
		if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
			return true;
		}
		let gridX = Math.floor(x / TILE_SIZE);
		let gridY = Math.floor(y / TILE_SIZE);
		return this.grid[gridY][gridX] != 0;
	}

	render() {
		for (let y = 0; y < MAP_NUM_ROWS; y++) {
			for (let x = 0; x < MAP_NUM_COLS; x++) {
				let tileX = x * TILE_SIZE;
				let tileY = y * TILE_SIZE;
				let tileColor = this.grid[y][x] === 1 ? "#222" : "#fff";
				stroke("#222");
				fill(tileColor);
				rect(
					tileX * MINIMAP_SCALE_FACTOR,
					tileY * MINIMAP_SCALE_FACTOR,
					TILE_SIZE * MINIMAP_SCALE_FACTOR,
					TILE_SIZE * MINIMAP_SCALE_FACTOR
				);
			}
		}
	}
}

class Player {
	constructor() {
		this.x = WINDOW_WIDTH / 2;
		this.y = WINDOW_HEIGHT / 2;
		this.radius = 6;
		this.turnDirection = 0; // -1 if left +1 if right
		this.walkDirection = 0; // -1 if back, +1 if front
		this.rotationAngle = Math.PI / 2;
		this.moveSpeed = 4.0;
		this.rotationSpeed = 4 * (Math.PI / 180); // convert to radians
	}
	render() {
		noStroke();
		fill("red");
		circle(
			this.x * MINIMAP_SCALE_FACTOR,
			this.y * MINIMAP_SCALE_FACTOR,
			this.radius * MINIMAP_SCALE_FACTOR
		);
	}
	update() {
		this.rotationAngle += this.turnDirection * this.rotationSpeed;

		let moveStep = this.walkDirection * this.moveSpeed;

		let newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
		let newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

		// only set new player position if is not colliding with map walls
		if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
			this.x = newPlayerX;
			this.y = newPlayerY;
		}
	}
}

class Ray {
	constructor(rayAngle) {
		this.rayAngle = normalizeAngle(rayAngle);
		this.wallHitX = 0;
		this.wallHitY = 0;
		this.distance = 0;

		this.wasHitVertical = false;

		this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
		this.isRayFacingUp = !this.isRayFacingDown;

		this.isRayFacingRight =
			this.rayAngle < Math.PI * 0.5 || this.rayAngle > Math.PI * 1.5;
		this.isRayFacingLeft = !this.isRayFacingRight;
	}

	cast(columnId) {
		var xintercept, yintercept;
		var xstep, ystep;

		//////////////////////////////////////////
		/// HORIZONTAL RAY GRID INTERSECTION CODE
		/////////////////////////////////////////
		var foundHorizontalWallHit = false;
		var wallHitX = 0;
		var wallHitY = 0;

		// Finde the y-coordinate of the closest horizontal grid intersection
		yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
		yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

		// Fin the x-coord of the closest horizontal grid intesection
		xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

		// Claculate the incremtnt of xstep and ystep
		ystep = TILE_SIZE;
		ystep *= this.isRayFacingUp ? -1 : 1;

		xstep = TILE_SIZE / Math.tan(this.rayAngle);
		xstep *= this.isRayFacingLeft && xstep > 0 ? -1 : 1;
		xstep *= this.isRayFacingRight && xstep < 0 ? -1 : 1;

		var nextHorizontalTouchX = xintercept;
		var nextHorizontalTouchY = yintercept;

		/*if (this.isRayFacingUp) {
			nextHorizontalTouchY--;
		}*/

		// increment xstep and ystep until we find a wall
		while (
			nextHorizontalTouchX >= 0 &&
			nextHorizontalTouchX <= WINDOW_WIDTH &&
			nextHorizontalTouchY >= 0 &&
			nextHorizontalTouchY <= WINDOW_HEIGHT
		) {
			if (
				grid.hasWallAt(
					nextHorizontalTouchX,
					nextHorizontalTouchY - (this.isRayFacingUp ? 1 : 0)
				)
			) {
				// we find a wall hit
				foundHorizontalWallHit = true;
				wallHitX = nextHorizontalTouchX;
				wallHitY = nextHorizontalTouchY;
				break;
			} else {
				nextHorizontalTouchX += xstep;
				nextHorizontalTouchY += ystep;
			}
		}

		//////////////////////////////////////////
		/// VERTICAL RAY GRID INTERSECTION CODE
		/////////////////////////////////////////
		var foundVerticalWallHit = false;
		var vertWallHitX = 0;
		var vertWallHitY = 0;

		// Finde the x-coordinate of the closest vertucak grid intersection
		xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
		xintercept += this.isRayFacingRight ? TILE_SIZE : 0;
		// Fin the y-coord of the closest vertical grid intesection
		yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

		// Claculate the incremtnt of xstep and ystep
		xstep = TILE_SIZE;
		xstep *= this.isRayFacingLeft ? -1 : 1;

		ystep = TILE_SIZE * Math.tan(this.rayAngle);
		ystep *= this.isRayFacingUp && ystep > 0 ? -1 : 1;
		ystep *= this.isRayFacingDown && ystep < 0 ? -1 : 1;

		var nextVerticalTouchX = xintercept;
		var nextVerticalTouchY = yintercept;

		/*if (this.isRayFacingLeft) {
			nextVerticalTouchX--;
		}*/

		// increment xstep and ystep until we find a wall
		while (
			nextVerticalTouchX >= 0 &&
			nextVerticalTouchX <= WINDOW_WIDTH &&
			nextVerticalTouchY >= 0 &&
			nextVerticalTouchY <= WINDOW_HEIGHT
		) {
			if (
				grid.hasWallAt(
					nextVerticalTouchX - (this.isRayFacingLeft ? 1 : 0),
					nextVerticalTouchY
				)
			) {
				// we find a wall hit
				foundVerticalWallHit = true;
				vertWallHitX = nextVerticalTouchX;
				vertWallHitY = nextVerticalTouchY;

				break;
			} else {
				nextVerticalTouchX += xstep;
				nextVerticalTouchY += ystep;
			}
		}

		// Calculate both horizontal and vertical distances and choose smalles value
		var horHitDist = foundHorizontalWallHit
			? distanceBetweenPoints(player.x, player.y, wallHitX, wallHitY)
			: Number.MAX_VALUE;
		var vertHitDist = foundVerticalWallHit
			? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
			: Number.MAX_VALUE;

		// only store the smalles of the distance
		this.wallHitX = horHitDist < vertHitDist ? wallHitX : vertWallHitX;
		this.wallHitY = horHitDist < vertHitDist ? wallHitY : vertWallHitY;
		this.distance = horHitDist < vertHitDist ? horHitDist : vertHitDist;
		this.wasHitVertical = vertHitDist < horHitDist;
	}

	render() {
		// TODO ...
		stroke(255, 0, 0, 200);
		// ELEMENT ...
		line(
			player.x * MINIMAP_SCALE_FACTOR,
			player.y * MINIMAP_SCALE_FACTOR,
			this.wallHitX * MINIMAP_SCALE_FACTOR,
			this.wallHitY * MINIMAP_SCALE_FACTOR
		);
	}
}

function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

var grid = new Map();
var player = new Player();
var rays = [];

function keyPressed() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 1;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = -1;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 1;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = -1;
	}
}

function keyReleased() {
	if (keyCode == UP_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == DOWN_ARROW) {
		player.walkDirection = 0;
	} else if (keyCode == RIGHT_ARROW) {
		player.turnDirection = 0;
	} else if (keyCode == LEFT_ARROW) {
		player.turnDirection = 0;
	}
}

function setup() {
	// Init all objects
	createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function castAllRays() {
	var columnId = 0;

	// start first ray subtracting half of FOV ( FOV / 2)

	var rayAngle = player.rotationAngle - FOV_ANGLE / 2;

	rays = [];

	// loop all columns casting the rays
	for (let i = 0; i < NUM_RAYS; i++) {
		let ray = new Ray(rayAngle);
		// TODO ...
		ray.cast(columnId);
		rays.push(ray);

		rayAngle += FOV_ANGLE / NUM_RAYS;
		columnId++;
	}
}

function normalizeAngle(angle) {
	angle = angle % (2 * Math.PI);
	if (angle < 0) {
		angle = 2 * Math.PI + angle;
	}
	return angle;
}

function render3DProjectedWalls() {
	// Projection
	for (let i = 0; i < NUM_RAYS; i++) {
		let ray = rays[i];
		let correctWallDistance =
			ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);

		// calculate the distance to the projection plane
		let distanceProjectionPlane = WINDOW_WIDTH / 2 / Math.tan(FOV_ANGLE / 2);

		// projected wall height
		let wallStripHeight =
			(TILE_SIZE / correctWallDistance) * distanceProjectionPlane;
		fill(255, 255, 255, wallStripHeight / 2);
		rect(
			i * WALL_STRIP_WIDTH,
			WINDOW_HEIGHT / 2 - wallStripHeight / 2,
			WALL_STRIP_WIDTH,
			wallStripHeight
		);
	}
}

function update() {
	// update all game objects before render the next frame

	player.update();
}

function draw() {
	clear("#212121");
	update();
	if (rays.length > 0) {
		render3DProjectedWalls();
	}
	// TODO: render all objects
	grid.render();
	for (ray of rays) {
		ray.render();
	}

	player.render();
	castAllRays();
}
