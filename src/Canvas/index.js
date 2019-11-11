import React, { Component } from "react";
import Level from "../demo";

class Canvas extends Component {
  state = {
    canvas: null
    //   context: null
  };
  componentDidMount() {
    const canvas = this.refs.canvas;
    //  const ctx = canvas.getContext("2d");
    this.setState({
      canvas
      //  context
    });
  }

  onClick = () => {
    const map = new Level(this.state.canvas);
    map.init();
    map.paint();
  };

  render() {
    return (
      <div>
        <canvas ref="canvas" width={600} height={600} />
        <button onClick={this.onClick}>Generate level</button>
      </div>
    );
  }
}
export default Canvas;
