import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import defaultPresets from "./defaultPresets.json";
import coloursJSON from "./SAOColoursList.json";

import "./blockSelection.css";

class BlockSelection extends Component {
  state = {
    customPresets: [],
    selectedPresetName: null,
  };

  constructor(props) {
    super(props);
    if (CookieManager.getCookie("presets") === "") {
      CookieManager.setCookie("presets", "[]", 9000);
    } else {
      let customPresets = JSON.parse(CookieManager.getCookie("presets"));
      this.state.customPresets = customPresets;
    }
  }

  onPresetChange = (e) => {
    console.log(e.target.value);
    this.setState({ selectedPresetName: e.target.value });
  };

  deletePreset = () => {};

  savePreset = () => {};

  sharePreset = () => {};

  render() {
    const {
      getLocaleString,
      onChangeVersion,
      onChangeColourSetBlock,
      version,
      selectedBlocks,
    } = this.props;
    return (
      <div className="blockSelection section">
        <div className="blockSelectionHeader">
          <h2 id="blockselectiontitle">
            {getLocaleString("BLOCKSELECTIONTITLE")}
          </h2>

          <b data-tooltip data-title={getLocaleString("SETTINGS-TT-VERSION")}>
            {getLocaleString("SETTINGS-VERSION") + ": "}
            <select
              id="version"
              onChange={onChangeVersion}
              defaultValue={version}
            >
              <option>1.12.2</option>
              <option>1.13.2</option>
              <option>1.14.4</option>
              <option>1.15.2</option>
              <option>1.16.5</option>
            </select>
          </b>

          <br></br>

          <b>{getLocaleString("PRESETS") + ": "}</b>
          <select id="presets" onChange={this.onPresetChange}>
            {defaultPresets.map((preset) => (
              <option key={preset["name"]}>
                {getLocaleString(preset["name"])}
              </option>
            ))}
            {/* {this.state.customPresets.map((preset) => (
            <option>{preset}</option>
          ))} */}
          </select>
          <button type="button" onClick={this.deletePreset}>
            {getLocaleString("PRESETS-DELETE")}
          </button>
          <button type="button" onClick={this.savePreset}>
            {getLocaleString("PRESETS-SAVE")}
          </button>
          <button
            type="button"
            onClick={this.sharePreset}
            data-tooltip
            data-title={getLocaleString("PRESETS-TT-SHARE")}
          >
            {getLocaleString("PRESETS-SHARE")}
          </button>
        </div>
        <div className="blockSelectionBlocks">
          {Object.entries(coloursJSON).map(([colourSetId, colourSet]) => (
            <div key={colourSetId} className="colourSet">
              <div
                className="colourSetBox"
                style={{
                  background:
                    "linear-gradient(" +
                    colourSet["tones"]["dark"] +
                    " 33%, " +
                    colourSet["tones"]["normal"] +
                    " 33%, " +
                    colourSet["tones"]["normal"] +
                    " 66%, " +
                    colourSet["tones"]["light"] +
                    " 66%)",
                }}
              ></div>
              <label>
                <img
                  src="./images/barrier.png"
                  alt={getLocaleString("NONE")}
                  className={
                    selectedBlocks[colourSetId] === "-1"
                      ? "blockImage blockImage_selected"
                      : "blockImage"
                  }
                  data-tooltip
                  data-title={getLocaleString("NONE")}
                  onClick={() => onChangeColourSetBlock(colourSetId, "-1")}
                ></img>
              </label>
              {Object.entries(colourSet["blocks"])
                .filter(([, block]) => block["validVersions"].includes(version))
                .map(([blockId, block]) => (
                  <label key={blockId}>
                    <img
                      src="./images/null.png"
                      alt={block["displayName"]}
                      className={
                        selectedBlocks[colourSetId] === blockId
                          ? "blockImage blockImage_selected"
                          : "blockImage"
                      }
                      data-tooltip
                      data-title={block["displayName"]}
                      style={{
                        backgroundImage: 'url("./images/textures.png")',
                        backgroundPositionX: "-" + blockId + "00%",
                        backgroundPositionY: "-" + colourSetId + "00%",
                      }}
                      onClick={() =>
                        onChangeColourSetBlock(colourSetId, blockId)
                      }
                    ></img>
                  </label>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default BlockSelection;
