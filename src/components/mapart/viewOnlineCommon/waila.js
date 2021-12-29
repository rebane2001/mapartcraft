import React, { Component } from "react";

import BlockImage from "../blockImage";

import "./waila.css";

// What Am I Looking At

class Waila extends Component {
  render() {
    const { getLocaleString, coloursJSON, selectedBlock, ...props_others } = this.props;
    return (
      <div className={"viewOnline_waila"} {...props_others}>
        <h3>{`x: ${selectedBlock.x.toString()} y: ${selectedBlock.y.toString()} z: ${selectedBlock.z.toString()}`}</h3>
        <BlockImage
          getLocaleString={getLocaleString}
          coloursJSON={coloursJSON}
          colourSetId={selectedBlock.colourSetId.toString()}
          blockId={selectedBlock.blockId.toString()}
          style={{ verticalAlign: "middle" }}
        />{" "}
        {selectedBlock.colourSetId === 64 && selectedBlock.blockId === 2
          ? getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")
          : coloursJSON[selectedBlock.colourSetId.toString()].blocks[selectedBlock.blockId.toString()].displayName}
      </div>
    );
  }
}

export default Waila;
