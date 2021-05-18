import React, { Component } from "react";

import defaultPresets from "./defaultPresets.json";
import coloursJSON from "./coloursJSON.json";
import Tooltip from "../tooltip";

import IMG_Barrier from "../../images/barrier.png";
import IMG_Null from "../../images/null.png";
import IMG_Textures from "../../images/textures.png";

import "./blockSelection.css";

class BlockSelection extends Component {
  cssRGB(RGBArray) {
    // RGB array to css compatible string
    return "rgb(" + RGBArray.join(", ") + ")";
  }

  render() {
    const {
      getLocaleString,
      onChangeColourSetBlock,
      optionValue_version,
      optionValue_modeNBTOrMapdat,
      optionValue_staircasing,
      optionValue_unobtainable,
      selectedBlocks,
      customPresets,
      selectedPresetName,
      onPresetChange,
      onDeletePreset,
      onSavePreset,
      onSharePreset,
      onGetPDNPaletteClicked,
    } = this.props;
    return (
      <div className="section blockSelectionDiv">
        <div className="blockSelectionHeader">
          <h2 id="blockselectiontitle">
            {getLocaleString("BLOCKSELECTIONTITLE")}
          </h2>

          <b>{getLocaleString("PRESETS") + ": "}</b>
          <select
            id="presets"
            value={selectedPresetName}
            onChange={onPresetChange}
          >
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
          <button type="button" onClick={onDeletePreset}>
            {getLocaleString("PRESETS-DELETE")}
          </button>
          <button type="button" onClick={onSavePreset}>
            {getLocaleString("PRESETS-SAVE")}
          </button>
          <Tooltip tooltipText={getLocaleString("PRESETS-TT-SHARE")}>
            <button type="button" onClick={onSharePreset}>
              {getLocaleString("PRESETS-SHARE")}
            </button>
          </Tooltip>
          <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-PDN")}>
            <button type="button" onClick={onGetPDNPaletteClicked}>
              {getLocaleString("DOWNLOAD-PDN")}
            </button>
          </Tooltip>
        </div>
        <div className="blockSelectionBlocks">
          {Object.entries(coloursJSON).map(([colourSetId, colourSet]) => (
            <div key={colourSetId} className="colourSet">
              <div
                className="colourSetBox"
                style={{
                  background:
                    optionValue_staircasing === "off"
                      ? this.cssRGB(colourSet["tonesRGB"]["normal"])
                      : optionValue_modeNBTOrMapdat === "NBT" ||
                        !optionValue_unobtainable
                      ? "linear-gradient(" +
                        this.cssRGB(colourSet["tonesRGB"]["dark"]) +
                        " 33%, " +
                        this.cssRGB(colourSet["tonesRGB"]["normal"]) +
                        " 33%, " +
                        this.cssRGB(colourSet["tonesRGB"]["normal"]) +
                        " 66%, " +
                        this.cssRGB(colourSet["tonesRGB"]["light"]) +
                        " 66%)"
                      : "linear-gradient(" +
                        this.cssRGB(colourSet["tonesRGB"]["unobtainable"]) +
                        " 25%, " +
                        this.cssRGB(colourSet["tonesRGB"]["dark"]) +
                        " 25%, " +
                        this.cssRGB(colourSet["tonesRGB"]["dark"]) +
                        " 50%, " +
                        this.cssRGB(colourSet["tonesRGB"]["normal"]) +
                        " 50%, " +
                        this.cssRGB(colourSet["tonesRGB"]["normal"]) +
                        " 75%, " +
                        this.cssRGB(colourSet["tonesRGB"]["light"]) +
                        " 75%)",
                }}
              ></div>
              <label>
                <Tooltip tooltipText={getLocaleString("NONE")}>
                  <img
                    src={IMG_Barrier}
                    alt={getLocaleString("NONE")}
                    className={
                      selectedBlocks[colourSetId] === "-1"
                        ? "cursorPointer blockImage blockImage_selected"
                        : "cursorPointer blockImage"
                    }
                    onClick={() => onChangeColourSetBlock(colourSetId, "-1")}
                  />
                </Tooltip>
              </label>
              {Object.entries(colourSet["blocks"])
                .filter(([, block]) =>
                  Object.keys(block["validVersions"]).includes(
                    optionValue_version
                  )
                )
                .map(([blockId, block]) => (
                  <label key={blockId}>
                    <Tooltip tooltipText={block["displayName"]}>
                      <img
                        src={IMG_Null}
                        alt={block["displayName"]}
                        className={
                          selectedBlocks[colourSetId] === blockId
                            ? "cursorPointer blockImage blockImage_selected"
                            : "cursorPointer blockImage"
                        }
                        style={{
                          backgroundImage: `url(${IMG_Textures})`,
                          backgroundPositionX: "-" + blockId + "00%",
                          backgroundPositionY: "-" + colourSetId + "00%",
                        }}
                        onClick={() =>
                          onChangeColourSetBlock(colourSetId, blockId)
                        }
                      />
                    </Tooltip>
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
