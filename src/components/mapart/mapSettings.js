import React, { Component } from "react";

import AutoCompleteInputBlockToAdd from "./autoCompleteInputBlockToAdd/autoCompleteInputBlockToAdd";

import Tooltip from "../tooltip";

import BackgroundColourModes from "./json/backgroundColourModes.json";
import DitherMethods from "./json/ditherMethods.json";
import MapModes from "./json/mapModes.json";
import StaircaseModes from "./json/staircaseModes.json";
import SupportedVersions from "./json/supportedVersions.json";
import WhereSupportBlocksModes from "./json/whereSupportBlocksModes.json";

import "./mapSettings.css";

class MapSettings extends Component {
  render() {
    const {
      getLocaleString,
      optionValue_version,
      onOptionChange_version,
      optionValue_mapSize_x_buffer,
      onOptionChange_mapSize_x_buffer,
      optionValue_mapSize_y_buffer,
      onOptionChange_mapSize_y_buffer,
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
      setOption_SupportBlock,
      optionValue_unobtainable,
      onOptionChange_unobtainable,
      optionValue_transparency,
      onOptionChange_transparency,
      optionValue_transparencyTolerance,
      onOptionChange_transparencyTolerance,
      optionValue_betterColour,
      onOptionChange_BetterColour,
      optionValue_dithering,
      onOptionChange_dithering,
      optionValue_preprocessingEnabled,
      onOptionChange_PreProcessingEnabled,
      preProcessingValue_brightness_buffer,
      onOptionChange_PreProcessingBrightness_buffer,
      preProcessingValue_contrast_buffer,
      onOptionChange_PreProcessingContrast_buffer,
      preProcessingValue_saturation_buffer,
      onOptionChange_PreProcessingSaturation_buffer,
      preProcessingValue_backgroundColourSelect,
      onOptionChange_PreProcessingBackgroundColourSelect,
      preProcessingValue_backgroundColour,
      onOptionChange_PreProcessingBackgroundColour,
    } = this.props;
    const setting_mode = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/MODE-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/MODE")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select onChange={onOptionChange_modeNBTOrMapdat} value={optionValue_modeNBTOrMapdat}>
          {Object.values(MapModes).map((mapMode) => (
            <option key={mapMode.uniqueId} value={mapMode.uniqueId}>
              {mapMode.name}
            </option>
          ))}
        </select>
        <br />
      </React.Fragment>
    );
    const setting_version = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/VERSION-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/VERSION")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select value={optionValue_version.MCVersion} onChange={onOptionChange_version}>
          {Object.values(SupportedVersions).map((supportedVersion) => (
            <option key={supportedVersion.MCVersion} value={supportedVersion.MCVersion}>
              {supportedVersion.MCVersion}
            </option>
          ))}
        </select>
        <br />
      </React.Fragment>
    );
    const setting_mapSize = (
      <React.Fragment>
        <b>
          {getLocaleString("MAP-SETTINGS/MAP-SIZE")}
          {":"}
        </b>{" "}
        <input className="mapSizeInput" type="number" min="1" step="1" value={optionValue_mapSize_x_buffer} onChange={onOptionChange_mapSize_x_buffer} />
        x
        <input className="mapSizeInput" type="number" min="1" step="1" value={optionValue_mapSize_y_buffer} onChange={onOptionChange_mapSize_y_buffer} />
        <br />
      </React.Fragment>
    );
    const setting_crop = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/CROP-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/CROP")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_cropImage} onChange={onOptionChange_cropImage} />
        <br />
      </React.Fragment>
    );
    const setting_grid = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/GRID-OVERLAY-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/GRID-OVERLAY")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_showGridOverlay} onChange={onOptionChange_showGridOverlay} />
        <br />
      </React.Fragment>
    );
    const setting_staircasing = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/3D/TITLE-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/3D/TITLE")}
            {":"}
          </b>
        </Tooltip>{" "}
        <select onChange={onOptionChange_staircasing} value={optionValue_staircasing}>
          {Object.values(StaircaseModes).map((staircaseMode) => (
            <option key={staircaseMode.uniqueId} value={staircaseMode.uniqueId}>
              {getLocaleString(staircaseMode.localeKey)}
            </option>
          ))}
        </select>
        <br />
      </React.Fragment>
    );
    let settings_mapModeConditional;
    if (optionValue_modeNBTOrMapdat === MapModes.SCHEMATIC_NBT.uniqueId) {
      settings_mapModeConditional = (
        <React.Fragment>
          <b>
            {getLocaleString("MAP-SETTINGS/NBT-SPECIFIC/WHERE-SUPPORT-BLOCKS/TITLE")}
            {":"}
          </b>{" "}
          <select value={optionValue_whereSupportBlocks} onChange={onOptionChange_WhereSupportBlocks}>
            {Object.values(WhereSupportBlocksModes).map((whereSupportBlocksMode) => (
              <option key={whereSupportBlocksMode.uniqueId} value={whereSupportBlocksMode.uniqueId}>
                {getLocaleString(whereSupportBlocksMode.localeKey)}
              </option>
            ))}
          </select>
          <br />
          <b>
            {getLocaleString("MAP-SETTINGS/NBT-SPECIFIC/SUPPORT-BLOCK-TO-ADD")}
            {":"}
          </b>{" "}
          <AutoCompleteInputBlockToAdd value={optionValue_supportBlock} setValue={setOption_SupportBlock} optionValue_version={optionValue_version} />
          <br />
        </React.Fragment>
      );
    } else {
      settings_mapModeConditional = (
        <React.Fragment>
          <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/UNOBTAINABLE-COLOURS-TT")}>
            <b>
              {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/UNOBTAINABLE-COLOURS")}
              {":"}
            </b>
          </Tooltip>{" "}
          <input type="checkbox" checked={optionValue_unobtainable} onChange={onOptionChange_unobtainable} />
          <br />
          <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/TRANSPARENCY-TT")}>
            <b>
              {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/TRANSPARENCY")}
              {":"}
            </b>
          </Tooltip>{" "}
          <input type="checkbox" checked={optionValue_transparency} onChange={onOptionChange_transparency} />
          <br />
          <b>
            {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/TRANSPARENCY-TOLERANCE")}
            {":"}
          </b>{" "}
          <input
            type="range"
            min="0"
            max="256"
            value={optionValue_transparencyTolerance}
            onChange={onOptionChange_transparencyTolerance}
            disabled={!optionValue_transparency}
          />
          <input
            className="preProcessingInputBox"
            type="number"
            min="0"
            max="256"
            step="1"
            value={optionValue_transparencyTolerance}
            onChange={onOptionChange_transparencyTolerance}
            disabled={!optionValue_transparency}
          />
          <br />
        </React.Fragment>
      );
    }
    const setting_betterColour = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/BETTER-COLOUR-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/BETTER-COLOUR")}
            {":"}
          </b>
        </Tooltip>{" "}
        <input type="checkbox" checked={optionValue_betterColour} onChange={onOptionChange_BetterColour} />
        <br />
      </React.Fragment>
    );
    const setting_dithering = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/DITHERING/TITLE-TT")}>
          <b>
            {getLocaleString("MAP-SETTINGS/DITHERING/TITLE")}
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
      </React.Fragment>
    );
    const preprocessing = (
      <React.Fragment>
        <details>
          <summary>{getLocaleString("MAP-SETTINGS/PREPROCESSING/TITLE")}</summary>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/ENABLE")}
            {":"}
          </b>{" "}
          <input type="checkbox" checked={optionValue_preprocessingEnabled} onChange={onOptionChange_PreProcessingEnabled} />
          <br />
          <table>
            <tbody>
              <tr>
                <th>
                  <b>
                    {getLocaleString("MAP-SETTINGS/PREPROCESSING/BRIGHTNESS")}
                    {":"}
                  </b>{" "}
                </th>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={preProcessingValue_brightness_buffer}
                    onChange={onOptionChange_PreProcessingBrightness_buffer}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
                <td>
                  <input
                    className="preProcessingInputBox"
                    type="number"
                    min="0"
                    step="1"
                    value={preProcessingValue_brightness_buffer}
                    onChange={onOptionChange_PreProcessingBrightness_buffer}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <b>
                    {getLocaleString("MAP-SETTINGS/PREPROCESSING/CONTRAST")}
                    {":"}
                  </b>{" "}
                </th>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={preProcessingValue_contrast_buffer}
                    onChange={onOptionChange_PreProcessingContrast_buffer}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
                <td>
                  <input
                    className="preProcessingInputBox"
                    type="number"
                    min="0"
                    step="1"
                    value={preProcessingValue_contrast_buffer}
                    onChange={onOptionChange_PreProcessingContrast_buffer}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <b>
                    {getLocaleString("MAP-SETTINGS/PREPROCESSING/SATURATION")}
                    {":"}
                  </b>{" "}
                </th>
                <td>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={preProcessingValue_saturation_buffer}
                    onChange={onOptionChange_PreProcessingSaturation_buffer}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
                <td>
                  <input
                    className="preProcessingInputBox"
                    type="number"
                    min="0"
                    step="1"
                    value={preProcessingValue_saturation_buffer}
                    onChange={onOptionChange_PreProcessingSaturation_buffer}
                    disabled={!optionValue_preprocessingEnabled}
                  />
                </td>
              </tr>
              <tr>
                <th>
                  <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/PREPROCESSING/BACKGROUND/TITLE-TT")}>
                    <b>
                      {getLocaleString("MAP-SETTINGS/PREPROCESSING/BACKGROUND/TITLE")}
                      {":"}
                    </b>
                  </Tooltip>{" "}
                </th>
                <td>
                  <select
                    onChange={onOptionChange_PreProcessingBackgroundColourSelect}
                    value={preProcessingValue_backgroundColourSelect}
                    disabled={!optionValue_preprocessingEnabled}
                  >
                    {Object.values(BackgroundColourModes).map((backgroundColourMode) => (
                      <option key={backgroundColourMode.uniqueId} value={backgroundColourMode.uniqueId}>
                        {getLocaleString(backgroundColourMode.localeKey)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <th>
                  <b>
                    {getLocaleString("MAP-SETTINGS/PREPROCESSING/BACKGROUND-COLOUR")}
                    {":"}
                  </b>{" "}
                </th>
                <td>
                  <input
                    type="color"
                    value={preProcessingValue_backgroundColour}
                    onChange={onOptionChange_PreProcessingBackgroundColour}
                    disabled={!optionValue_preprocessingEnabled || preProcessingValue_backgroundColourSelect === BackgroundColourModes.OFF.uniqueId}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </details>
        <br />
      </React.Fragment>
    );
    const settingsDiv = (
      <div className="section settingsDiv">
        <h2>{getLocaleString("MAP-SETTINGS/TITLE")}</h2>
        {setting_mode}
        {setting_version}
        {setting_mapSize}
        {setting_crop}
        {setting_grid}
        {setting_staircasing}
        {settings_mapModeConditional}
        {setting_betterColour}
        {setting_dithering}
        {preprocessing}
      </div>
    );
    return settingsDiv;
  }
}

export default MapSettings;
