import React, { Component } from "react";

import coloursJSON from "./coloursJSON.json";

import "./materials.css";

class Materials extends Component {
  state = { onlyMaxPerSplit: false };

  onOnlyMaxPerSplitChange = () => {
    this.setState((currentState) => ({
      onlyMaxPerSplit: !currentState.onlyMaxPerSplit,
    }));
  };

  getMaterialsCount_nonZeroMaterials() {
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
    return nonZeroMaterials;
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

  render() {
    const { getLocaleString, currentMaterialsData } = this.props;
    const { onlyMaxPerSplit } = this.state;
    if (currentMaterialsData === null) {
      return null;
    }
    const nonZeroMaterials = this.getMaterialsCount_nonZeroMaterials();
    const supportBlockCount = this.getMaterialsCount_supportBlock();
    return (
      <div className="section materialsDiv">
        <h2>{getLocaleString("MATERIALSTITLE")}</h2>
        <b
          data-tooltip
          data-title={getLocaleString("SETTINGS-TT-SPLITMATERIALS")}
        >
          {getLocaleString("SETTINGS-SPLITMATERIALS")}
          {": "}
        </b>
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
            <tr>
              <th>
                <img
                  src="./images/null.png"
                  alt={getLocaleString("MATERIALS-PLACEHOLDERBLOCK")}
                  className={"blockImage"}
                  data-tooltip
                  data-title={getLocaleString("MATERIALS-PLACEHOLDERBLOCK")}
                  style={{
                    backgroundImage: 'url("./images/placeholder.png")',
                  }}
                ></img>
              </th>
              <th>{supportBlockCount}</th>
            </tr>
            {Object.entries(nonZeroMaterials).map(
              ([colourSetId, materialCount]) =>
                currentMaterialsData.currentSelectedBlocks[colourSetId] !==
                "-1" ? (
                  <tr key={colourSetId}>
                    <th>
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
                        data-tooltip
                        data-title={
                          coloursJSON[colourSetId]["blocks"][
                            currentMaterialsData.currentSelectedBlocks[
                              colourSetId
                            ]
                          ]["displayName"]
                        }
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
                      ></img>
                    </th>
                    <th>{materialCount}</th>
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
