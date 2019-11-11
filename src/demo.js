const MAP_SIZE = 100;
const SQUARE = 600 / MAP_SIZE;
const N_ITERATIONS = 5;
const W_RATIO = 0.45;
const H_RATIO = 0.45;
const DISCARD_BY_RATIO = true;
const D_GRID = false;
const D_BSP = true;
const D_ROOMS = true;
const D_PATHS = true;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Tree {
  constructor(leaf) {
    this.leaf = leaf;
    this.leftChild = undefined;
    this.rightChild = undefined;
  }

  getLeafs() {
    if (this.leftChild === undefined && this.rightChild === undefined)
      return [this.leaf];
    else
      return [].concat(this.leftChild.getLeafs(), this.rightChild.getLeafs());
  }

  paint(context) {
    this.leaf.paint(context);
    if (this.leftChild !== undefined) this.leftChild.paint(context);
    if (this.rightChild !== undefined) this.rightChild.paint(context);
  }
}
class Room {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.center = new Point(this.x + this.width / 2, this.y + this.height / 2);
  }
  paint(context) {
    context.fillStyle = "#b09fc2";
    context.fillRect(
      this.x * SQUARE,
      this.y * SQUARE,
      this.width * SQUARE,
      this.height * SQUARE
    );
  }
  drawPath(context, point) {
    context.beginPath();
    context.lineWidth = SQUARE;
    context.strokeStyle = "#b09fc2";
    context.moveTo(this.center.x * SQUARE, this.center.y * SQUARE);
    context.lineTo(point.x * SQUARE, point.y * SQUARE);
    context.stroke();
  }
}

class RoomContainer extends Room {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.room = undefined;
  }
  paint(context) {
    context.strokeStyle = "#6a1a99";
    context.lineWidth = 2;
    context.strokeRect(
      this.x * SQUARE,
      this.y * SQUARE,
      this.width * SQUARE,
      this.height * SQUARE
    );
  }
  growRoom() {
    var x, y, width, height;
    x = this.x + random(3, Math.floor(this.width / 3));
    y = this.y + random(3, Math.floor(this.height / 3));
    width = this.width - (x - this.x);
    height = this.height - (y - this.y);
    width -= random(3, width / 3);
    height -= random(3, height / 3);
    this.room = new Room(x, y, width, height);
  }
}

function random_split(room) {
  var r1, r2;
  if (random(0, 1) === 0) {
    // Vertical
    r1 = new RoomContainer(
      room.x,
      room.y, // r1.x, r1.y
      random(1, room.width),
      room.height // r1.width, r1.height
    );
    r2 = new RoomContainer(
      room.x + r1.width,
      room.y, // r2.x, r2.y
      room.width - r1.width,
      room.height // r2.width, r2.height
    );
    if (DISCARD_BY_RATIO) {
      var r1_w_ratio = r1.width / r1.height;
      var r2_w_ratio = r2.width / r2.height;
      if (r1_w_ratio < W_RATIO || r2_w_ratio < W_RATIO) {
        return random_split(room);
      }
    }
  } else {
    // Horizontal
    r1 = new RoomContainer(
      room.x,
      room.y, // r1.x, r1.y
      room.width,
      random(1, room.height) // r1.width, r1.height
    );
    r2 = new RoomContainer(
      room.x,
      room.y + r1.height, // r2.x, r2.y
      room.width,
      room.height - r1.height // r2.width, r2.height
    );
    if (DISCARD_BY_RATIO) {
      var r1_h_ratio = r1.height / r1.width;
      var r2_h_ratio = r2.height / r2.width;
      if (r1_h_ratio < H_RATIO || r2_h_ratio < H_RATIO) {
        return random_split(room);
      }
    }
  }
  return [r1, r2];
}

function split_room(context, room, iter) {
  var root = new Tree(room);
  room.paint(context);
  if (iter !== 0) {
    var sr = random_split(room);
    root.leftChild = split_room(context, sr[0], iter - 1);
    root.rightChild = split_room(context, sr[1], iter - 1);
  }
  return root;
}

export default class Level {
  constructor(canvas) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.rooms = [];
  }
  init() {
    var main_room = new RoomContainer(0, 0, MAP_SIZE, MAP_SIZE);
    this.room_tree = split_room(this.context, main_room, N_ITERATIONS);
    this.growRooms();
  }
  growRooms() {
    var leafs = this.room_tree.getLeafs();
    for (var i = 0; i < leafs.length; i++) {
      leafs[i].growRoom();
      this.rooms.push(leafs[i].room);
    }
  }
  clear() {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.width, this.height);
  }
  drawPaths(tree) {
    if (tree.leftChild !== undefined && tree.rightChild !== undefined) {
      tree.leftChild.leaf.drawPath(this.context, tree.rightChild.leaf.center);
      this.drawPaths(tree.leftChild);
      this.drawPaths(tree.rightChild);
    }
  }
  drawGrid() {
    var context = this.context;
    context.beginPath();
    context.strokeStyle = "rgba(255,255,255,0.4)";
    context.lineWidth = 0.5;
    for (var i = 0; i < MAP_SIZE; i++) {
      context.moveTo(i * SQUARE, 0);
      context.lineTo(i * SQUARE, MAP_SIZE * SQUARE);
      context.moveTo(0, i * SQUARE);
      context.lineTo(MAP_SIZE * SQUARE, i * SQUARE);
    }
    context.stroke();
    context.closePath();
  }
  drawContainers() {
    this.room_tree.paint(this.context);
  }
  drawRooms() {
    for (var i = 0; i < this.rooms.length; i++)
      this.rooms[i].paint(this.context);
  }
  paint() {
    this.clear();
    if (D_BSP) this.drawContainers();
    if (D_ROOMS) this.drawRooms();
    if (D_PATHS) this.drawPaths(this.room_tree);
    if (D_GRID) this.drawGrid();
  }
}

// const map = new Level(document.getElementById("genmap"));
// map.init();
// map.paint();
