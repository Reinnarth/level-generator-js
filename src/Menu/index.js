import React, { Component } from "react";
import Slider from "rc-slider";
//Translation from vanilla
class Menu extends Component {
  state = {
    mapSize: props.mapSize,
    square: 600 / props.mapSize,
    iterations: 4,
    widthRatio: props.widthRatio,
    heightRatio: props.heightRatio,
    discardByRatio: props.discardByRatio
  };

  handle = (props) =>{
    const { value, dragging, index, ...restProps } = props;
  }

  render() {
    return (
      <div>
        <Slider min={0} max={20} defaultValue={3} handle={this.handle}></Slider>
      </div>
    );
  }
}
export default Menu;
