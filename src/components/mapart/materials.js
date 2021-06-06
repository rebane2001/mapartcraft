import React, { Component } from "react";

import coloursJSON from "./coloursJSON.json";
import Tooltip from "../tooltip";

import IMG_Null from "../../images/null.png";
import IMG_Textures from "../../images/textures.png";
import IMG_Placeholder from "../../images/placeholder.png";

import "./materials.css";

class Materials extends Component {
  state = { onlyMaxPerSplit: false };

  onOnlyMaxPerSplitChange = () => {
    this.setState((currentState) => ({
      // nb this method of passing currentState instead of using this.state... is prefered; TODO neaten up controller uses
      onlyMaxPerSplit: !currentState.onlyMaxPerSplit,
    }));
  };

  getMaterialsCount_nonZeroMaterialsItems() {
    const { currentMaterialsData } = this.props;
    const { onlyMaxPerSplit } = this.state;
    const materialsCountDict = {};
    Object.keys(coloursJSON).forEach((colourSetId) => {
      materialsCountDict[colourSetId] = 0;
    });
    currentMaterialsData.maps.forEach((row) => {
      row.forEach((map) => {
        const mapMaterialsEntry = map.materials;
        Object.keys(mapMaterialsEntry).forEach((materialColourSetId) => {
          if (onlyMaxPerSplit) {
            materialsCountDict[materialColourSetId] = Math.max(materialsCountDict[materialColourSetId], mapMaterialsEntry[materialColourSetId]);
          } else {
            materialsCountDict[materialColourSetId] += mapMaterialsEntry[materialColourSetId];
          }
        });
      });
    });
    const nonZeroMaterials = Object.fromEntries(Object.entries(materialsCountDict).filter(([_, value]) => value !== 0));
    let nonZeroMaterialsItems = Object.keys(nonZeroMaterials).map((key) => {
      return [key, nonZeroMaterials[key]];
    });
    nonZeroMaterialsItems.sort((first, second) => {
      return second[1] - first[1];
    });
    return nonZeroMaterialsItems;
  }

  getMaterialsCount_supportBlock() {
    const { currentMaterialsData } = this.props;
    const { onlyMaxPerSplit } = this.state;
    let supportBlockCount = 0;
    currentMaterialsData.maps.forEach((row) => {
      row.forEach((map) => {
        const count = map.supportBlockCount;
        if (onlyMaxPerSplit) {
          supportBlockCount = Math.max(supportBlockCount, count);
        } else {
          supportBlockCount += count;
        }
      });
    });
    return supportBlockCount;
  }

  formatMaterialCount = (count) => {
    const numberOfStacks = Math.floor(count / 64);
    const remainder = count % 64;
    const numberOfShulkers = count / 1728;
    return `${count.toString()}${
      numberOfStacks !== 0
        ? ` (${numberOfStacks.toString()}x64${remainder !== 0 ? ` + ${remainder.toString()}` : ""}${
            numberOfShulkers >= 1 ? `, ${numberOfShulkers.toFixed(2)} SB` : ""
          })`
        : ""
    }`;
  };

  colourSetIdAndBlockIdFromNBTName(blockName) {
    const { optionValue_version } = this.props;
    for (const [colourSetId, colourSet] of Object.entries(coloursJSON)) {
      for (const [blockId, block] of Object.entries(colourSet.blocks)) {
        if (!(optionValue_version.MCVersion in block.validVersions)) {
          continue;
        }
        let blockNBTData = block.validVersions[optionValue_version.MCVersion];
        if (typeof blockNBTData === "string") {
          // this is of the form eg "&1.12.2"
          blockNBTData = block.validVersions[blockNBTData.slice(1)];
        }
        if (
          Object.keys(blockNBTData.NBTArgs).length === 0 && // no exotic blocks for noobline
          blockName.toLowerCase() === blockNBTData.NBTName.toLowerCase()
        ) {
          return { colourSetId, blockId };
        }
      }
    }
    return null; // if block not found
  }

  render() {
    const { getLocaleString, optionValue_supportBlock, currentMaterialsData } = this.props;
    const { onlyMaxPerSplit } = this.state;
    const nonZeroMaterialsItems = this.getMaterialsCount_nonZeroMaterialsItems();
    const supportBlockCount = this.getMaterialsCount_supportBlock();
    const supportBlockIds = this.colourSetIdAndBlockIdFromNBTName(optionValue_supportBlock);
    return (
      <div className="section materialsDiv">
        <h2>{getLocaleString("MATERIALS/TITLE")}</h2>
        <Tooltip tooltipText={getLocaleString("MATERIALS/SHOW-PER-SPLIT-TT")}>
          <b>
            {getLocaleString("MATERIALS/SHOW-PER-SPLIT")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={onlyMaxPerSplit} onChange={this.onOnlyMaxPerSplitChange} />
        <br />
        <table id="materialtable">
          <tbody>
            <tr>
              <th>{getLocaleString("MATERIALS/BLOCK")}</th>
              <th>{getLocaleString("MATERIALS/AMOUNT")}</th>
            </tr>
            {supportBlockCount !== 0 ? (
              <tr>
                <th>
                  <Tooltip tooltipText={getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")}>
                    <img
                      src={IMG_Null}
                      alt={getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")}
                      className={"blockImage"}
                      style={
                        supportBlockIds === null
                          ? {
                              backgroundImage: `url(${IMG_Placeholder})`,
                            }
                          : {
                              backgroundImage: `url(${IMG_Textures})`,
                              backgroundPositionX: `-${supportBlockIds.blockId}00%`,
                              backgroundPositionY: `-${supportBlockIds.colourSetId}00%`,
                            }
                      }
                    />
                  </Tooltip>
                </th>
                <th>{this.formatMaterialCount(supportBlockCount)}</th>
              </tr>
            ) : null}
            {nonZeroMaterialsItems.map(([colourSetId, materialCount]) =>
              currentMaterialsData.currentSelectedBlocks[colourSetId] !== "-1" ? (
                <tr key={colourSetId}>
                  <th>
                    <Tooltip tooltipText={coloursJSON[colourSetId]["blocks"][currentMaterialsData.currentSelectedBlocks[colourSetId]]["displayName"]}>
                      <img
                        src={IMG_Null}
                        alt={coloursJSON[colourSetId]["blocks"][currentMaterialsData.currentSelectedBlocks[colourSetId]]["displayName"]}
                        className={"blockImage"}
                        style={{
                          backgroundImage: `url(${IMG_Textures})`,
                          backgroundPositionX: `-${currentMaterialsData.currentSelectedBlocks[colourSetId]}00%`,
                          backgroundPositionY: `-${colourSetId}00%`,
                        }}
                      />
                    </Tooltip>
                  </th>
                  <th>{this.formatMaterialCount(materialCount)}</th>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Materials;
