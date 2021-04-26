import React, { Component } from "react";

import coloursJSON from "./coloursJSON.json";
import Tooltip from "../tooltip";

import "./materials.css";

class Materials extends Component {
  state = { onlyMaxPerSplit: false };

  onOnlyMaxPerSplitChange = () => {
    this.setState((currentState) => ({
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
    currentMaterialsData.materials.forEach((row) => {
      row.forEach((mapMaterialsEntry) => {
        Object.keys(mapMaterialsEntry.materialsCounts).forEach(
          (materialColourSetId) => {
            if (onlyMaxPerSplit) {
              materialsCountDict[materialColourSetId] = Math.max(
                materialsCountDict[materialColourSetId],
                mapMaterialsEntry.materialsCounts[materialColourSetId]
              );
            } else {
              materialsCountDict[materialColourSetId] +=
                mapMaterialsEntry.materialsCounts[materialColourSetId];
            }
          }
        );
      });
    });
    const nonZeroMaterials = Object.fromEntries(
      Object.entries(materialsCountDict).filter(([_, value]) => value !== 0)
    );
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
    // 128 per map however if map is not built as split then only top 128 needed
    let supportBlockCount = 0;
    currentMaterialsData.supportBlockCount.forEach((row) => {
      row.forEach((count) => {
        if (onlyMaxPerSplit) {
          supportBlockCount = Math.max(supportBlockCount, count);
        } else {
          supportBlockCount += count;
        }
        // TODO ADD NOOBLINE, whether double or single etc needs option
      });
    });
    return supportBlockCount;
  }

  formatMaterialCount = (count) => {
    const numberOfStacks = Math.floor(count / 64);
    const remainder = count % 64;
    const numberOfShulkers = count / 1728; // to 2dp
    let returnString = count.toString();
    if (numberOfStacks !== 0) {
      returnString += " (" + numberOfStacks.toString() + "x64";
      if (remainder !== 0) {
        returnString += " + " + remainder.toString();
      }
      if (numberOfShulkers >= 1) {
        returnString += ", " + numberOfShulkers.toFixed(2) + " SB";
      }
      returnString += ")";
    }
    return returnString;
  };

  render() {
    const { getLocaleString, currentMaterialsData } = this.props;
    const { onlyMaxPerSplit } = this.state;
    const nonZeroMaterialsItems = this.getMaterialsCount_nonZeroMaterialsItems();
    const supportBlockCount = this.getMaterialsCount_supportBlock();
    return (
      <div className="section materialsDiv">
        <h2>{getLocaleString("MATERIALSTITLE")}</h2>
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-SPLITMATERIALS")}>
          <b>
            {getLocaleString("SETTINGS-SPLITMATERIALS")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input
          type="checkbox"
          checked={onlyMaxPerSplit}
          onChange={this.onOnlyMaxPerSplitChange}
        />
        <br />
        <table id="materialtable">
          <tbody>
            <tr>
              <th>{getLocaleString("MATERIALS-BLOCK")}</th>
              <th>{getLocaleString("MATERIALS-AMOUNT")}</th>
            </tr>
            {supportBlockCount !== 0 ? (
              <tr>
                <th>
                  <Tooltip
                    tooltipText={getLocaleString("MATERIALS-PLACEHOLDERBLOCK")}
                  >
                    <img
                      src="./images/null.png"
                      alt={getLocaleString("MATERIALS-PLACEHOLDERBLOCK")}
                      className={"blockImage"}
                      style={{
                        backgroundImage: 'url("./images/placeholder.png")',
                      }}
                    />
                  </Tooltip>
                </th>
                <th>{this.formatMaterialCount(supportBlockCount)}</th>
              </tr>
            ) : null}
            {nonZeroMaterialsItems.map(([colourSetId, materialCount]) =>
              currentMaterialsData.currentSelectedBlocks[colourSetId] !==
              "-1" ? (
                <tr key={colourSetId}>
                  <th>
                    <Tooltip
                      tooltipText={
                        coloursJSON[colourSetId]["blocks"][
                          currentMaterialsData.currentSelectedBlocks[
                            colourSetId
                          ]
                        ]["displayName"]
                      }
                    >
                      <img
                        src="./images/null.png"
                        alt={
                          coloursJSON[colourSetId]["blocks"][
                            currentMaterialsData.currentSelectedBlocks[
                              colourSetId
                            ]
                          ]["displayName"]
                        }
                        className={"blockImage"}
                        style={{
                          backgroundImage: 'url("./images/textures.png")',
                          backgroundPositionX:
                            "-" +
                            currentMaterialsData.currentSelectedBlocks[
                              colourSetId
                            ] +
                            "00%",
                          backgroundPositionY: "-" + colourSetId + "00%",
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
