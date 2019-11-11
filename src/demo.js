MAP_SIZE = 50;
SQUARE = 600 / MAP_SIZE;
N_ITERATIONS = 4;
W_RATIO = 0.45;
H_RATIO = 0.45;
DISCARD_BY_RATIO = true;
D_GRID = false;
D_BSP = true;
D_ROOMS = true;
D_PATHS = true;

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// export const random = (min, max) => {
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

var Point = function(x, y) {
  this.x = x;
  this.y = y;
};


var Tree = function(leaf) {
  this.leaf = leaf;
  this.leftChild = undefined;
  this.rightChild = undefined;
};

Tree.prototype.print = function() {
  if (this.leftChild !== undefined) this.leftChild.print();
  if (this.rightChild !== undefined) this.rightChild.print();
};

Tree.prototype.getLeafs = function() {
  if (this.leftChild === undefined && this.rightChild === undefined)
    return [this.leaf];
  else return [].concat(this.leftChild.getLeafs(), this.rightChild.getLeafs());
};

Tree.prototype.getLevel = function(level, queue) {
  if (queue === undefined) queue = [];
  if (level == 1) {
    queue.push(this);
  } else {
    if (this.leftChild !== undefined) this.leftChild.getLevel(level - 1, queue);
    if (this.rightChild !== undefined)
      this.rightChild.getLevel(level - 1, queue);
  }
  return queue;
};

Tree.prototype.paint = function(context) {
 // var context = context;
  this.leaf.paint(context);
  if (this.leftChild !== undefined) this.leftChild.paint(context);
  if (this.rightChild !== undefined) this.rightChild.paint(context);
};

var Room = function(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.center = new Point(this.x + this.w / 2, this.y + this.h / 2);
};

Room.prototype.paint = function(context) {
  context.fillStyle = "#b09fc2";
  context.fillRect(
    this.x * SQUARE,
    this.y * SQUARE,
    this.w * SQUARE,
    this.h * SQUARE
  );
};

Room.prototype.drawPath = function(context, point) {
  context.beginPath();
  context.lineWidth = SQUARE;
  context.strokeStyle = "#b09fc2";
  context.moveTo(this.center.x * SQUARE, this.center.y * SQUARE);
  context.lineTo(point.x * SQUARE, point.y * SQUARE);
  context.stroke();
};

var RoomContainer = function(x, y, w, h) {
  Room.call(this, x, y, w, h);
  this.room = undefined;
};

RoomContainer.prototype = Object.create(Room.prototype);

RoomContainer.prototype.constructor = RoomContainer;

RoomContainer.prototype.paint = function(context) {
  context.strokeStyle = "#6a1a99";
  context.lineWidth = 2;
  context.strokeRect(
    this.x * SQUARE,
    this.y * SQUARE,
    this.w * SQUARE,
    this.h * SQUARE
  );
};

RoomContainer.prototype.growRoom = function() {
  var x, y, w, h;
  x = this.x + random(3, Math.floor(this.w / 3));
  y = this.y + random(3, Math.floor(this.h / 3));
  w = this.w - (x - this.x);
  h = this.h - (y - this.y);
  w -= random(3, w / 3);
  h -= random(3, h / 3);
  this.room = new Room(x, y, w, h);
};

function random_split(room) {
  var r1, r2;
  if (random(0, 1) == 0) {
    // Vertical
    r1 = new RoomContainer(
      room.x,
      room.y, // r1.x, r1.y
      random(1, room.w),
      room.h // r1.w, r1.h
    );
    r2 = new RoomContainer(
      room.x + r1.w,
      room.y, // r2.x, r2.y
      room.w - r1.w,
      room.h // r2.w, r2.h
    );
    if (DISCARD_BY_RATIO) {
      var r1_w_ratio = r1.w / r1.h;
      var r2_w_ratio = r2.w / r2.h;
      if (r1_w_ratio < W_RATIO || r2_w_ratio < W_RATIO) {
        return random_split(room);
      }
    }
  } else {
    // Horizontal
    r1 = new RoomContainer(
      room.x,
      room.y, // r1.x, r1.y
      room.w,
      random(1, room.h) // r1.w, r1.h
    );
    r2 = new RoomContainer(
      room.x,
      room.y + r1.h, // r2.x, r2.y
      room.w,
      room.h - r1.h // r2.w, r2.h
    );
    if (DISCARD_BY_RATIO) {
      var r1_h_ratio = r1.h / r1.w;
      var r2_h_ratio = r2.h / r2.w;
      if (r1_h_ratio < H_RATIO || r2_h_ratio < H_RATIO) {
        return random_split(room);
      }
    }
  }
  return [r1, r2];
}

function split_room(room, iter) {
  var root = new Tree(room);
  room.paint(document.getElementById("genmap").getContext("2d"));
  if (iter != 0) {
    var sr = random_split(room);
    root.leftChild = split_room(sr[0], iter - 1);
    root.rightChild = split_room(sr[1], iter - 1);
  }
  return root;
}

const Level = function(canvas) {
  this.width = canvas.width;
  this.height = canvas.height;
  this.context = canvas.getContext("2d");
  this.rooms = [];
};

Level.prototype.init = function() {
  var main_room = new RoomContainer(0, 0, MAP_SIZE, MAP_SIZE);
  this.room_tree = split_room(main_room, N_ITERATIONS);
  this.growRooms();
};

Level.prototype.growRooms = function() {
  var leafs = this.room_tree.getLeafs();
  for (var i = 0; i < leafs.length; i++) {
    leafs[i].growRoom();
    this.rooms.push(leafs[i].room);
  }
};

Level.prototype.clear = function() {
  this.context.fillStyle = "#000";
  this.context.fillRect(0, 0, this.width, this.height);
};

Level.prototype.drawPaths = function(tree) {
  if (tree.leftChild !== undefined && tree.rightChild !== undefined) {
    tree.leftChild.leaf.drawPath(this.context, tree.rightChild.leaf.center);
    this.drawPaths(tree.leftChild);
    this.drawPaths(tree.rightChild);
  }
};

Level.prototype.drawGrid = function() {
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
};

Level.prototype.drawContainers = function() {
  this.room_tree.paint(this.context);
};

Level.prototype.drawRooms = function() {
  for (var i = 0; i < this.rooms.length; i++) this.rooms[i].paint(this.context);
};

Level.prototype.paint = function() {
  this.clear();
  if (D_BSP) this.drawContainers();
  if (D_ROOMS) this.drawRooms();
  if (D_PATHS) this.drawPaths(this.room_tree);
  if (D_GRID) this.drawGrid();
};

var map = new Level(document.getElementById("genmap"));
map.init();
map.paint();
