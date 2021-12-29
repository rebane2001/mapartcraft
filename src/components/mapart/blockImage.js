import React, { Component } from "react";

import IMG_Null from "../../images/null.png";
import IMG_Textures from "../../images/textures.png";

import "./blockImage.css";

class BlockImage extends Component {
  render() {
    const { getLocaleString, coloursJSON, colourSetId, blockId, style, className, ...props_others } = this.props;
    const isNone = blockId === "-1"; // if barrier / no block selected for colourSetId
    const isUnknown = colourSetId === "64" && blockId === "2"; // if unknown / placeholder block
    return (
      <img
        src={IMG_Null}
        alt={
          isNone
            ? getLocaleString("NONE")
            : isUnknown
            ? getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")
            : coloursJSON[colourSetId].blocks[blockId].displayName
        }
        style={
          isNone
            ? {
                backgroundImage: `url(${IMG_Textures})`,
                backgroundPositionX: "-100%",
                backgroundPositionY: "-6400%",
                ...style,
              }
            : isUnknown
            ? {
                backgroundImage: `url(${IMG_Textures})`,
                backgroundPositionX: "-200%",
                backgroundPositionY: "-6400%",
                ...style,
              }
            : coloursJSON[colourSetId].blocks[blockId].presetIndex === "CUSTOM"
            ? {
                backgroundImage: `url(${IMG_Textures})`,
                backgroundPositionX: "-500%",
                backgroundPositionY: "-6400%",
                backgroundColor: `rgb(${coloursJSON[colourSetId].tonesRGB.normal.join(", ")})`,
                ...style,
              }
            : {
                backgroundImage: `url(${IMG_Textures})`,
                backgroundPositionX: `-${blockId}00%`,
                backgroundPositionY: `-${colourSetId}00%`,
                ...style,
              }
        }
        className={`blockImage ${className}`}
        {...props_others}
      />
    );
  }
}

export default BlockImage;
