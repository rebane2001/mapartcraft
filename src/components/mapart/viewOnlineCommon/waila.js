import React, { Component } from "react";

import coloursJSON from "../coloursJSON.json";

import IMG_Null from "../../../images/null.png";
import IMG_Textures from "../../../images/textures.png";

import "./waila.css";

// What Am I Looking At

class Waila extends Component {
  render() {
    const { getLocaleString, selectedBlock, styleOverrides } = this.props;
    return (
      <div className={"viewOnline_waila"} style={styleOverrides}>
        <h3>{`x: ${selectedBlock.x.toString()} y: ${selectedBlock.y.toString()} z: ${selectedBlock.z.toString()}`}</h3>
        {selectedBlock.colourSetId === 64 && selectedBlock.blockId === 2 ? (
          <React.Fragment>
            <img
              src={IMG_Null}
              alt={getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")}
              style={{
                backgroundImage: `url(${IMG_Textures})`,
                backgroundPositionX: "-200%",
                backgroundPositionY: "-6400%",
                verticalAlign: "middle",
              }}
            />{" "}
            {getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <img
              src={IMG_Null}
              alt={coloursJSON[selectedBlock.colourSetId].blocks[selectedBlock.blockId].displayName}
              style={{
                backgroundImage: `url(${IMG_Textures})`,
                backgroundPositionX: `-${selectedBlock.blockId}00%`,
                backgroundPositionY: `-${selectedBlock.colourSetId}00%`,
                verticalAlign: "middle",
              }}
            />{" "}
            {coloursJSON[selectedBlock.colourSetId].blocks[selectedBlock.blockId].displayName}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default Waila;
