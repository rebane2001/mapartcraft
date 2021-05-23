import React, { Component } from "react";

import DitherMethods from "./ditherMethods.json";
import Tooltip from "../tooltip";

import "./mapSettings.css";

class MapSettings extends Component {
  render() {
    const {
      getLocaleString,
      supportedVersions,
      optionValue_version,
      onOptionChange_version,
      optionValue_mapSize_x,
      onOptionChange_mapSize_x,
      optionValue_mapSize_y,
      onOptionChange_mapSize_y,
      optionValue_modeNBTOrMapdat,
      onOptionChange_modeNBTOrMapdat,
      optionValue_cropImage,
      onOptionChange_cropImage,
      optionValue_showGridOverlay,
      onOptionChange_showGridOverlay,
      optionValue_staircasing,
      onOptionChange_staircasing,
      optionValue_whereSupportBlocks,
      onOptionChange_WhereSupportBlocks,
      optionValue_supportBlock,
      onOptionChange_SupportBlock,
      optionValue_unobtainable,
      onOptionChange_unobtainable,
      optionValue_transparency,
      onOptionChange_transparency,
      optionValue_betterColour,
      onOptionChange_BetterColour,
      optionValue_dithering,
      onOptionChange_dithering,
      optionValue_preprocessingEnabled,
      onOptionChange_PreProcessingEnabled,
      preProcessingValue_brightness,
      onOptionChange_PreProcessingBrightness,
      preProcessingValue_contrast,
      onOptionChange_PreProcessingContrast,
      preProcessingValue_saturation,
      onOptionChange_PreProcessingSaturation,
      onViewOnlineClicked,
      onGetNBTClicked,
      onGetNBTSplitClicked,
      onGetMapdatSplitClicked,
    } = this.props;
    return (
      <div className="section settingsDiv">
        <h2>{getLocaleString("SETTINGSTITLE")}</h2>
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-MODE")}>
          <b>
            {getLocaleString("SETTINGS-MODE")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select onChange={onOptionChange_modeNBTOrMapdat} value={optionValue_modeNBTOrMapdat}>
          <option value="NBT">Schematic (NBT)</option>
          <option value="Mapdat">Datafile (map.dat)</option>
        </select>
        <br />
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-VERSION")}>
          <b>
            {getLocaleString("SETTINGS-VERSION")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select value={optionValue_version} onChange={onOptionChange_version}>
          {supportedVersions.map((supportedVersion) => (
            <option key={supportedVersion.MCVersion}>{supportedVersion.MCVersion}</option>
          ))}
        </select>
        <br />
        <b>
          {getLocaleString("SETTINGS-MAPSIZE")}
          {": "}
        </b>
        <input className="mapSizeInput" type="number" min="1" step="1" value={optionValue_mapSize_x} onChange={onOptionChange_mapSize_x} />
        x
        <input className="mapSizeInput" type="number" min="1" step="1" value={optionValue_mapSize_y} onChange={onOptionChange_mapSize_y} />
        <br />
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-CROP")}>
          <b>
            {getLocaleString("SETTINGS-CROP")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_cropImage} onChange={onOptionChange_cropImage} />
        <br />
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-GRIDOVERLAY")}>
          <b>
            {getLocaleString("SETTINGS-GRIDOVERLAY")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_showGridOverlay} onChange={onOptionChange_showGridOverlay} />
        <br />
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-3D")}>
          <b>
            {getLocaleString("SETTINGS-3D")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select onChange={onOptionChange_staircasing} value={optionValue_staircasing}>
          <option value="off">{getLocaleString("SETTINGS-3D-OFF")}</option>
          <option value="classic">{getLocaleString("SETTINGS-3D-CLASSIC")}</option>
          <option value="optimized">{getLocaleString("SETTINGS-3D-OPTIMIZED")}</option>
        </select>
        <br />
        {optionValue_modeNBTOrMapdat === "NBT" ? (
          <span>
            <b>
              {getLocaleString("SETTINGS-UNDERBLOCKS")}
              {": "}
            </b>
            <select value={optionValue_whereSupportBlocks} onChange={onOptionChange_WhereSupportBlocks}>
              <option value="None">{getLocaleString("SETTINGS-UNDERBLOCKS-NOBLOCKS")}</option>
              <option value="Important">{getLocaleString("SETTINGS-UNDERBLOCKS-IMPBLOCKS")}</option>
              <option value="AllOptimized">{getLocaleString("SETTINGS-UNDERBLOCKS-ALLBLOCKSOPT")}</option>
              <option value="AllDoubleOptimized">{getLocaleString("SETTINGS-UNDERBLOCKS-DOUBLEBLOCKSOPT")}</option>
            </select>
            <br />
            <b>
              {getLocaleString("SETTINGS-BLOCKTOADD")}
              {": "}
            </b>
            <input type="text" value={optionValue_supportBlock} onChange={onOptionChange_SupportBlock} />
            <br />
          </span>
        ) : (
          <span>
            <Tooltip tooltipText={getLocaleString("SETTINGS-TT-UNOBT")}>
              <b>
                {getLocaleString("SETTINGS-UNOBT")}
                {":"}
              </b>
            </Tooltip>{" "}
            <input type="checkbox" checked={optionValue_unobtainable} onChange={onOptionChange_unobtainable} />
            <br />
            <Tooltip tooltipText={getLocaleString("SETTINGS-TT-TRANS")}>
              <b>
                {getLocaleString("SETTINGS-TRANS")}
                {":"}
              </b>
            </Tooltip>{" "}
            <input type="checkbox" checked={optionValue_transparency} onChange={onOptionChange_transparency} />
            <br />
          </span>
        )}
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-BETTERCOL")}>
          <b>
            {getLocaleString("SETTINGS-BETTERCOL")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_betterColour} onChange={onOptionChange_BetterColour} />
        <br />
        <Tooltip tooltipText={getLocaleString("SETTINGS-TT-DITHER")}>
          <b>
            {getLocaleString("SETTINGS-DITHER")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select value={optionValue_dithering} onChange={onOptionChange_dithering}>
          {Object.keys(DitherMethods).map((ditherMethodKey) => (
            <option key={DitherMethods[ditherMethodKey]["uniqueId"]} value={DitherMethods[ditherMethodKey]["uniqueId"]}>
              {"localeKey" in DitherMethods[ditherMethodKey]
                ? getLocaleString(DitherMethods[ditherMethodKey]["localeKey"])
                : DitherMethods[ditherMethodKey]["name"]}
            </option>
          ))}
        </select>
        <br />
        <details>
          <summary>{getLocaleString("SETTINGS-PREPROCESSING")}</summary>
          <b>
            {getLocaleString("SETTINGS-PREPROCESSING-ENABLE")}
            {": "}
          </b>
          <input type="checkbox" checked={optionValue_preprocessingEnabled} onChange={onOptionChange_PreProcessingEnabled} />
          <br />
          <table>
            <tbody>
              <tr>
                <th>
                  <b>
                    {getLocaleString("SETTINGS-PREPROCESSING-BRIGHTNESS")}
                    {": "}
                  </b>
                </th>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={preProcessingValue_brightness}
                    onChange={onOptionChange_PreProcessingBrightness}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
                <td>
                  <input
                    className="preProcessingInputBox"
                    type="number"
                    min="0"
                    step="1"
                    value={preProcessingValue_brightness}
                    onChange={onOptionChange_PreProcessingBrightness}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <b>
                    {getLocaleString("SETTINGS-PREPROCESSING-CONTRAST")}
                    {": "}
                  </b>
                </th>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={preProcessingValue_contrast}
                    onChange={onOptionChange_PreProcessingContrast}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
                <td>
                  <input
                    className="preProcessingInputBox"
                    type="number"
                    min="0"
                    step="1"
                    value={preProcessingValue_contrast}
                    onChange={onOptionChange_PreProcessingContrast}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <b>
                    {getLocaleString("SETTINGS-PREPROCESSING-SATURATION")}
                    {": "}
                  </b>
                </th>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={preProcessingValue_saturation}
                    onChange={onOptionChange_PreProcessingSaturation}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
                <td>
                  <input
                    className="preProcessingInputBox"
                    type="number"
                    min="0"
                    step="1"
                    value={preProcessingValue_saturation}
                    onChange={onOptionChange_PreProcessingSaturation}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </details>
        <br />
        {optionValue_modeNBTOrMapdat === "NBT" ? (
          <span>
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-VIEWONLINE")}>
              <span className="greenButton" onClick={onViewOnlineClicked}>
                {getLocaleString("DOWNLOAD-VIEWONLINE")}
              </span>
            </Tooltip>
            <br />
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-NBT")}>
              <span className="greenButton" onClick={onGetNBTClicked} style={{ fontSize: "24px", height: "50px" }}>
                {getLocaleString("DOWNLOAD-NBT")}
              </span>
            </Tooltip>
            <br />
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-NBTSPLIT")}>
              <span className="greenButton" onClick={onGetNBTSplitClicked}>
                {getLocaleString("DOWNLOAD-NBTSPLIT")}
              </span>
            </Tooltip>
          </span>
        ) : (
          <span>
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-MAPDAT")}>
              <span className="greenButton" onClick={onGetMapdatSplitClicked} style={{ fontSize: "24px", height: "50px" }}>
                {getLocaleString("DOWNLOAD-MAPDAT")}
              </span>
            </Tooltip>
          </span>
        )}
        <br />
        <Tooltip tooltipText={getLocaleString("DONATEBUTTON-TT")}>
          <a className="donateA" href="./supporters">
            <span className="greenButton">{getLocaleString("DONATEBUTTON")}</span>
            <br />
          </a>
        </Tooltip>
      </div>
    );
  }
}

export default MapSettings;
