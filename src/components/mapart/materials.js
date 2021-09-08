import React, { Component } from "react";

import Tooltip from "../tooltip";

import BlockImage from "./blockImage";

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
    const { coloursJSON, currentMaterialsData } = this.props;
    const { onlyMaxPerSplit } = this.state;
    const materialsCount = {};
    for (const colourSetId of Object.keys(coloursJSON)) {
      materialsCount[colourSetId] = 0;
    }
    for (const row of currentMaterialsData.maps) {
      for (const map of row) {
        for (const [colourSetId, materialCount] of Object.entries(map.materials)) {
          if (onlyMaxPerSplit) {
            materialsCount[colourSetId] = Math.max(materialsCount[colourSetId], materialCount);
          } else {
            materialsCount[colourSetId] += materialCount;
          }
        }
      }
    }
    return Object.entries(materialsCount)
      .filter(([_, value]) => value !== 0)
      .sort((first, second) => {
        return second[1] - first[1];
      });
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
    const { coloursJSON, optionValue_version } = this.props;
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
    const { getLocaleString, coloursJSON, optionValue_supportBlock, currentMaterialsData } = this.props;
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
            {supportBlockCount !== 0 && (
              <tr>
                <th>
                  <Tooltip tooltipText={getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")}>
                    <BlockImage
                      getLocaleString={getLocaleString}
                      coloursJSON={coloursJSON}
                      colourSetId={supportBlockIds === null ? "64" : supportBlockIds.colourSetId}
                      blockId={supportBlockIds === null ? "2" : supportBlockIds.blockId}
                    />
                  </Tooltip>
                </th>
                <th>{this.formatMaterialCount(supportBlockCount)}</th>
              </tr>
            )}
            {nonZeroMaterialsItems.map(([colourSetId, materialCount]) => {
              const blockId = currentMaterialsData.currentSelectedBlocks[colourSetId];
              return (
                <tr key={colourSetId}>
                  <th>
                    <Tooltip tooltipText={coloursJSON[colourSetId].blocks[blockId].displayName}>
                      <BlockImage coloursJSON={coloursJSON} colourSetId={colourSetId} blockId={blockId} />
                    </Tooltip>
                  </th>
                  <th>{this.formatMaterialCount(materialCount)}</th>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Materials;
