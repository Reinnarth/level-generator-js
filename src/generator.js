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

  paint(context, tileSize) {
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

  paint(context, tileSize) {
    context.fillStyle = "#b09fc2";
    context.fillRect(
      this.x * tileSize,
      this.y * tileSize,
      this.width * tileSize,
      this.height * tileSize
    );
  }

  drawPath(context, point, tileSize) {
    context.beginPath();
    context.lineWidth = tileSize;
    context.strokeStyle = "#b09fc2";
    context.moveTo(this.center.x * tileSize, this.center.y * tileSize);
    context.lineTo(point.x * tileSize, point.y * tileSize);
    context.stroke();
  }
}

class RoomContainer extends Room {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.room = undefined;
  }

  paint(context, tileSize) {
    context.strokeStyle = "#6a1a99";
    context.lineWidth = 2;
    context.strokeRect(
      this.x,
      this.y,
      this.width * tileSize,
      this.height * tileSize
    );
  }

  createRoom() {
    let x, y, width, height;
    x = this.x + random(3, Math.floor(this.width / 3));
    y = this.y + random(3, Math.floor(this.height / 3));
    width = this.width - (x - this.x);
    height = this.height - (y - this.y);
    width -= random(3, width / 3);
    height -= random(3, height / 3);
    this.room = new Room(x, y, width, height);
  }
}

function randomSplit(room, widthRatio, heightRatio) {
  let r1, r2;
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
    let r1_w_ratio = r1.width / r1.height;
    let r2_w_ratio = r2.width / r2.height;
    if (r1_w_ratio < widthRatio || r2_w_ratio < widthRatio) {
      return randomSplit(room, widthRatio, heightRatio);
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
    let r1_h_ratio = r1.height / r1.width;
    let r2_h_ratio = r2.height / r2.width;
    if (r1_h_ratio < heightRatio || r2_h_ratio < heightRatio) {
      return randomSplit(room, widthRatio, heightRatio);
    }
  }
  return [r1, r2];
}

// function randomSplit(room, widthRatio, heightRatio) {
//   let r1, r2;
//   const { x, y, width, height } = room;
//   console.log(width, height);
//   if (width / height >= 1.25) {
//     r1 = new RoomContainer(
//       x,
//       y, // r1.x, r1.y
//       random(5, width),
//       height // r1.width, r1.height
//     );
//     r2 = new RoomContainer(
//       x + r1.width,
//       y, // r2.x, r2.y
//       width - r1.width,
//       height // r2.width, r2.height
//     );
//   } else if (height / width >= 1.25) {
//     r1 = new RoomContainer(
//       x,
//       y, // r1.x, r1.y
//       width,
//       random(5, height) // r1.width, r1.height
//     );
//     r2 = new RoomContainer(
//       x,
//       y + r1.height, // r2.x, r2.y
//       width,
//       height - r1.height // r2.width, r2.height
//     );
//   } else {
//     if (random(0, 1) === 0) {
//       // Vertical
//       r1 = new RoomContainer(
//         room.x,
//         room.y, // r1.x, r1.y
//         random(5, room.width),
//         room.height // r1.width, r1.height
//       );
//       r2 = new RoomContainer(
//         room.x + r1.width,
//         room.y, // r2.x, r2.y
//         room.width - r1.width,
//         room.height // r2.width, r2.height
//       );
//     } else {
//       // Horizontal
//       r1 = new RoomContainer(
//         room.x,
//         room.y, // r1.x, r1.y
//         room.width,
//         random(5, room.height) // r1.width, r1.height
//       );
//       r2 = new RoomContainer(
//         room.x,
//         room.y + r1.height, // r2.x, r2.y
//         room.width,
//         room.height - r1.height // r2.width, r2.height
//       );
//     }
//   }
//   return [r1, r2];
// }
function splitRoom(
  context,
  room,
  iterations,
  widthRatio,
  heightRatio,
  tileSize
) {
  let root = new Tree(room);
  room.paint(context, tileSize);

  if (iterations !== 0) {
    let sr = randomSplit(room, widthRatio, heightRatio);
    root.leftChild = splitRoom(
      context,
      sr[0],
      iterations - 1,
      widthRatio,
      heightRatio,
      tileSize
    );
    root.rightChild = splitRoom(
      context,
      sr[1],
      iterations - 1,
      widthRatio,
      heightRatio,
      tileSize
    );
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

  init(mapSize, iterations, widthRatio, heightRatio, tileSize) {
    const mainRoom = new RoomContainer(0, 0, mapSize, mapSize);
    this.roomTree = splitRoom(
      this.context,
      mainRoom,
      iterations,
      widthRatio,
      heightRatio,
      tileSize
    );
    this.growRooms();
  }

  growRooms() {
    if (this.roomTree) {
      let leafs = this.roomTree.getLeafs();
      for (let i = 0; i < leafs.length; i++) {
        leafs[i].createRoom();
        this.rooms.push(leafs[i].room);
      }
    }
  }

  clear() {
    this.context.fillStyle = "#000";
    this.context.fillRect(0, 0, this.width, this.height);
  }

  drawPaths(tree, tileSize) {
    if (tree.leftChild !== undefined && tree.rightChild !== undefined) {
      tree.leftChild.leaf.drawPath(
        this.context,
        tree.rightChild.leaf.center,
        tileSize
      );
      this.drawPaths(tree.leftChild, tileSize);
      this.drawPaths(tree.rightChild, tileSize);
    }
  }

  drawGrid(mapSize, tileSize) {
    let context = this.context;
    context.beginPath();
    context.strokeStyle = "rgba(255,255,255,0.4)";
    context.lineWidth = 0.5;
    for (let i = 0; i < mapSize; i++) {
      context.moveTo(i * tileSize, 0);
      context.lineTo(i * tileSize, mapSize * tileSize);
      context.moveTo(0, i * tileSize);
      context.lineTo(mapSize * tileSize, i * tileSize);
    }
    context.stroke();
    context.closePath();
  }

  drawContainers(tileSize) {
    this.roomTree.paint(this.context, tileSize);
  }

  drawRooms(tileSize) {
    for (let i = 0; i < this.rooms.length; i++)
      this.rooms[i].paint(this.context, tileSize);
  }

  paint(mapSize, tileSize) {
    this.clear();
    this.drawContainers(tileSize);
    this.drawRooms(tileSize);
    this.drawPaths(this.roomTree, tileSize);
    this.drawGrid(mapSize, tileSize);
  }
}
