import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import defaultPresets from "./defaultPresets.json";
import coloursJSON from "./SAOColoursList.json";

import "./blockSelection.css";

class BlockSelection extends Component {
  state = {
    customPresets: [],
    selectedPresetName: defaultPresets[0]["name"],
  };

  constructor(props) {
    super(props);
    this.state.customPresets = JSON.parse(
      CookieManager.touchCookie("customPresets", "[]")
    );
  }

  onPresetChange = (e) => {
    const { onChangeColourSetBlocks } = this.props;
    const { customPresets } = this.state;
    const presetName = e.target.value;

    this.setState({ selectedPresetName: presetName });

    const defaultPreset = defaultPresets.find(
      (preset) => preset["name"] === presetName
    );
    if (defaultPreset !== undefined) {
      onChangeColourSetBlocks(defaultPreset["blocks"]);
      return;
    }

    const customPreset = customPresets.find(
      (preset) => preset["name"] === presetName
    );
    if (customPreset !== undefined) {
      onChangeColourSetBlocks(customPreset["blocks"]);
      return;
    }
  };

  deletePreset = () => {
    const { customPresets, selectedPresetName } = this.state;
    if (
      !customPresets.find((preset) => preset["name"] === selectedPresetName)
    ) {
      // if a default preset selected then return
      return;
    }

    const customPresets_new = customPresets.filter(
      (preset) => preset["name"] !== selectedPresetName
    );
    this.setState({
      customPresets: customPresets_new,
      selectedPresetName: defaultPresets[0]["name"],
    });
    CookieManager.setCookie("customPresets", JSON.stringify(customPresets_new), 9000);
  };

  savePreset = () => {
    const { getLocaleString, selectedBlocks } = this.props;
    const { customPresets } = this.state;

    let presetName = prompt(getLocaleString("PRESETS-ENTERNAME"), "");
    if (presetName === null) {
      return;
    }

    const otherPresets = customPresets.filter(
      (preset) => preset["name"] !== presetName
    );
    let newPreset = { name: presetName, blocks: [] };
    Object.keys(selectedBlocks).forEach((key) => {
      newPreset["blocks"].push([parseInt(key), parseInt(selectedBlocks[key])]);
    });
    const customPresets_new = [...otherPresets, newPreset];
    this.setState({ customPresets: customPresets_new });
    CookieManager.setCookie("customPresets", JSON.stringify(customPresets_new), 9000);
  };

  sharePreset = () => {};

  importPreset = () => {};

  render() {
    const {
      getLocaleString,
      onChangeVersion,
      onChangeColourSetBlock,
      version,
      selectedBlocks,
    } = this.props;
    const { customPresets } = this.state;
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
              <option value={preset["name"]} key={preset["localeKey"]}>
                {getLocaleString(preset["localeKey"])}
              </option>
            ))}
            {customPresets.map((preset) => (
              <option value={preset["name"]} key={preset["name"]}>
                {preset["name"]}
              </option>
            ))}
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
