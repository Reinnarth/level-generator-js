import React, { Component } from "react";
//Translation from vanilla
class Tree extends Component {
  constructor(props) {
    super();
    this.state = {
      mapSize: props.mapSize,
      square: 600/props.mapSize,
      iterations: 4,
      widthRatio: props.widthRatio,
      heightRatio: props.heightRatio,
      discardByRatio: props.discardByRatio
    };
  }

  getLevel = (level, queue) => {
    if (queue === undefined) queue = [];
    if (level === 1) {
      queue.push(this);
    } else {
      if (this.lchild !== undefined) this.lchild.getLevel(level - 1, queue);
      if (this.rchild !== undefined) this.rchild.getLevel(level - 1, queue);
    }
    return queue;
  };

  paint = (c) => {
    this.leaf.paint(c);
    if (this.state.lchild !== undefined) {
        const lchild = this.paint(c)
        this.setState({ lchild: lchild})
    };
    if (this.state.rchild !== undefined) {
        const rchild = this.paint(c)
        this.setState({ rchild: rchild})
    };
  };

  render(){
    return(<></>)
  }
}
const Tree = function(leaf) {};
