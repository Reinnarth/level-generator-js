import React, { Component } from "react";
import Level from "../generator";

import "./canvas.css";

class Canvas extends Component {
  state = {
    mapSize: 50,
    tileSize: 12,
    iterations: 4,
    minIterations: 2,
    maxIterations: 10,
    widthRatio: 0.45,
    heightRatio: 0.45,
    minRoomSize: 5,
    maxRoomSize: 30,
    canvas: null
  };

  componentDidMount() {
    const canvas = this.refs.canvas;
    this.setState({
      canvas
    });
  }

  onClick = () => {
    const {
      mapSize,
      tileSize,
      iterations,
      widthRatio,
      heightRatio
    } = this.state;
    const map = new Level(this.state.canvas);
    map.init(mapSize, iterations, widthRatio, heightRatio, tileSize);
    map.paint(mapSize, tileSize);
  };

  handleChange = event => {
    let { value, min, max, name } = event.target;
    if (name === "mapSize") {
      value = Math.max(Number(min), Math.min(Number(max), Number(value)));
      const tileSize = 600 / value;
      this.setState({ [name]: value, tileSize: tileSize });
    } else if (name !== "iterations" && "mapSize") {
      this.setState({ [name]: value });
    } else {
      this.setState({ [name]: value });
    }
  };

  render() {
    const {
      mapSize,
      iterations,
      minIterations,
      maxIterations,
      widthRatio,
      heightRatio
    } = this.state;
    return (
      <div className="wrapper">
        <div className="slidecontainer">
          <span className="span">Размер карты</span>
          <input
            min="30"
            max="500"
            name="mapSize"
            className="input"
            value={mapSize}
            onChange={this.handleChange}
          />
          <input
            type="range"
            min="30"
            max="500"
            value={mapSize}
            className="slider"
            name="mapSize"
            onChange={this.handleChange}
          />
        </div>
        <div className="slidecontainer">
          <span className="span">Количество итераций</span>
          <span className="span">{iterations}</span>
          <input
            type="range"
            min={minIterations}
            max={maxIterations}
            value={iterations}
            className="slider"
            name="iterations"
            onChange={this.handleChange}
          />
        </div>

        <div className="slidecontainer">
          <span className="span">
            Минимальная ширина (% от размера контейнера)
          </span>
          <span className="span">{Math.round(widthRatio * 100)}%</span>
          <input
            type="range"
            step="0.01"
            min="0.2"
            max="0.8"
            value={widthRatio}
            className="slider"
            name="widthRatio"
            onChange={this.handleChange}
          />
        </div>
        <div className="slidecontainer">
          <span className="span">
            Минимальная высота (% от размера контейнера)
          </span>
          <span className="span">{Math.round(heightRatio * 100)}%</span>
          <input
            type="range"
            step="0.01"
            min="0.2"
            max="0.8"
            value={heightRatio}
            className="slider"
            name="heightRatio"
            onChange={this.handleChange}
          />
        </div>
        <button className="button" onClick={this.onClick}>
          Generate level
        </button>
        <div>
          <canvas ref="canvas" width={600} height={600} />
        </div>
      </div>
    );
  }
}
export default Canvas;
