import React, { Component } from "react";

import DitherMethods from "./Const_DitherMethods";

import "./mapSettings.css";

class MapSettings extends Component {
  render() {
    const {
      getLocaleString,
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
        <br />
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-MODE")}>
          {getLocaleString("SETTINGS-MODE")}
          {": "}
          <select
            onChange={onOptionChange_modeNBTOrMapdat}
            value={optionValue_modeNBTOrMapdat}
          >
            <option value="NBT">Schematic (NBT)</option>
            <option value="Mapdat">Datafile (map.dat)</option>
          </select>
        </b>
        <br />
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-VERSION")}>
          {getLocaleString("SETTINGS-VERSION")}
          {": "}
        </b>
        <select value={optionValue_version} onChange={onOptionChange_version}>
          <option>1.12.2</option>
          <option>1.13.2</option>
          <option>1.14.4</option>
          <option>1.15.2</option>
          <option>1.16.5</option>
        </select>
        <br />
        <b>
          {getLocaleString("SETTINGS-MAPSIZE")}
          {": "}
        </b>
        <input
          className="mapSizeInput"
          type="number"
          min="1"
          step="1"
          value={optionValue_mapSize_x}
          onChange={onOptionChange_mapSize_x}
        />
        x
        <input
          className="mapSizeInput"
          type="number"
          min="1"
          step="1"
          value={optionValue_mapSize_y}
          onChange={onOptionChange_mapSize_y}
        />
        <br />
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-CROP")}>
          {getLocaleString("SETTINGS-CROP")}
          {": "}
        </b>
        <input
          type="checkbox"
          checked={optionValue_cropImage}
          onChange={onOptionChange_cropImage}
        />
        <br />
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-GRIDOVERLAY")}>
          {getLocaleString("SETTINGS-GRIDOVERLAY")}
          {": "}
        </b>
        <input
          type="checkbox"
          checked={optionValue_showGridOverlay}
          onChange={onOptionChange_showGridOverlay}
        />
        <br />
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-3D")}>
          {getLocaleString("SETTINGS-3D")}
          {": "}
        </b>
        <select
          onChange={onOptionChange_staircasing}
          value={optionValue_staircasing}
        >
          <option value="off">{getLocaleString("SETTINGS-3D-OFF")}</option>
          <option value="classic">
            {getLocaleString("SETTINGS-3D-CLASSIC")}
          </option>
          <option value="optimized">
            {getLocaleString("SETTINGS-3D-OPTIMIZED")}
          </option>
        </select>
        <br />
        {optionValue_modeNBTOrMapdat === "NBT" ? (
          <span>
            <b>
              {getLocaleString("SETTINGS-UNDERBLOCKS")}
              {": "}
            </b>
            <select
              value={optionValue_whereSupportBlocks}
              onChange={onOptionChange_WhereSupportBlocks}
            >
              <option value="None">
                {getLocaleString("SETTINGS-UNDERBLOCKS-NOBLOCKS")}
              </option>
              <option value="Important">
                {getLocaleString("SETTINGS-UNDERBLOCKS-IMPBLOCKS")}
              </option>
              <option value="All">
                {getLocaleString("SETTINGS-UNDERBLOCKS-ALLBLOCKS")}
              </option>
              <option value="AllDoubleOptimized">
                {getLocaleString("SETTINGS-UNDERBLOCKS-DOUBLEBLOCKSOPT")}
              </option>
              <option value="AllDouble">
                {getLocaleString("SETTINGS-UNDERBLOCKS-DOUBLEBLOCKS")}
              </option>
            </select>
            <br />
            <b
              data-tooltip
              data-title={getLocaleString("SETTINGS-TT-BLOCKTOADD")}
            >
              {getLocaleString("SETTINGS-BLOCKTOADD")}
              {": "}
            </b>
            <input
              type="text"
              value={optionValue_supportBlock}
              onChange={onOptionChange_SupportBlock}
            />
            <br />
          </span>
        ) : (
          <span>
            <b data-tooltip data-title={getLocaleString("SETTINGS-TT-UNOBT")}>
              {getLocaleString("SETTINGS-UNOBT")}
              {": "}
            </b>
            <input
              type="checkbox"
              checked={optionValue_unobtainable}
              onChange={onOptionChange_unobtainable}
            />
            <br />
            <b data-tooltip data-title={getLocaleString("SETTINGS-TT-TRANS")}>
              {getLocaleString("SETTINGS-TRANS")}
              {": "}
            </b>
            <input
              type="checkbox"
              checked={optionValue_transparency}
              onChange={onOptionChange_transparency}
            />
            <br />
          </span>
        )}
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-BETTERCOL")}>
          {getLocaleString("SETTINGS-BETTERCOL")}
          {": "}
        </b>
        <input
          type="checkbox"
          checked={optionValue_betterColour}
          onChange={onOptionChange_BetterColour}
        />
        <br />
        <b data-tooltip data-title={getLocaleString("SETTINGS-TT-DITHER")}>
          {getLocaleString("SETTINGS-DITHER")}
          {": "}
        </b>
        <select
          value={optionValue_dithering}
          onChange={onOptionChange_dithering}
        >
          {Object.keys(DitherMethods).map((ditherMethodKey) => (
            <option
              key={DitherMethods[ditherMethodKey]["uniqueId"]}
              value={DitherMethods[ditherMethodKey]["uniqueId"]}
            >
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
          <input
            type="checkbox"
            checked={optionValue_preprocessingEnabled}
            onChange={onOptionChange_PreProcessingEnabled}
          />
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
            <span
              className="greenButton"
              onClick={onViewOnlineClicked}
              data-tooltip
              data-title={getLocaleString("DOWNLOAD-TT-VIEWONLINE")}
            >
              {getLocaleString("DOWNLOAD-VIEWONLINE")}
            </span>
            <br />
            <span
              className="greenButton"
              onClick={onGetNBTClicked}
              data-tooltip
              data-title={getLocaleString("DOWNLOAD-TT-NBT")}
              style={{ fontSize: "24px", height: "50px" }}
            >
              {getLocaleString("DOWNLOAD-NBT")}
            </span>
            <br />
            <span
              className="greenButton"
              onClick={onGetNBTSplitClicked}
              data-tooltip
              data-title={getLocaleString("DOWNLOAD-TT-NBTSPLIT")}
            >
              {getLocaleString("DOWNLOAD-NBTSPLIT")}
            </span>
          </span>
        ) : (
          <span>
            <span
              className="greenButton"
              onClick={onGetMapdatSplitClicked}
              data-tooltip
              data-title={getLocaleString("DOWNLOAD-TT-MAPDAT")}
              style={{ fontSize: "24px", height: "50px" }}
            >
              {getLocaleString("DOWNLOAD-MAPDAT")}
            </span>
          </span>
        )}
        <br />
        <a
          className="donateA"
          href="./supporters"
          data-tooltip
          data-title={getLocaleString("DONATEBUTTON-TT")}
        >
          <span className="greenButton">{getLocaleString("DONATEBUTTON")}</span>
          <br />
        </a>
      </div>
    );
  }
}

export default MapSettings;
