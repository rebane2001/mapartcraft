import React, { Component } from "react";

import AutoCompleteInputBlockToAdd from "./autoCompleteInputBlockToAdd/autoCompleteInputBlockToAdd";

import BufferedNumberInput from "./bufferedNumberInput/bufferedNumberInput";

import Tooltip from "../tooltip";

import BackgroundColourModes from "./json/backgroundColourModes.json";
import CropModes from "./json/cropModes.json";
import DitherMethods from "./json/ditherMethods.json";
import MapModes from "./json/mapModes.json";
import SupportedVersions from "./json/supportedVersions.json";
import WhereSupportBlocksModes from "./json/whereSupportBlocksModes.json";

import "./mapSettings.css";

class MapSettings extends Component {
  render() {
    const {
      getLocaleString,
      coloursJSON,
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
      optionValue_cropImage_zoom,
      onOptionChange_cropImage_zoom,
      optionValue_cropImage_percent_x,
      onOptionChange_cropImage_percent_x,
      optionValue_cropImage_percent_y,
      onOptionChange_cropImage_percent_y,
      optionValue_showGridOverlay,
      onOptionChange_showGridOverlay,
      optionValue_staircasing,
      onOptionChange_staircasing,
      optionValue_whereSupportBlocks,
      onOptionChange_WhereSupportBlocks,
      optionValue_supportBlock,
      setOption_SupportBlock,
      optionValue_transparency,
      onOptionChange_transparency,
      optionValue_transparencyTolerance,
      onOptionChange_transparencyTolerance,
      optionValue_mapdatFilenameUseId,
      onOptionChange_mapdatFilenameUseId,
      optionValue_mapdatFilenameIdStart,
      onOptionChange_mapdatFilenameIdStart,
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
      preProcessingValue_backgroundColourSelect,
      onOptionChange_PreProcessingBackgroundColourSelect,
      preProcessingValue_backgroundColour,
      onOptionChange_PreProcessingBackgroundColour,
      optionValue_extras_moreStaircasingOptions,
      onOptionChange_extras_moreStaircasingOptions,
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
        <BufferedNumberInput
          min="1"
          max={null}
          step="1"
          value={optionValue_mapSize_x}
          validators={[(t) => !isNaN(t), (t) => t > 0]}
          onValidInput={onOptionChange_mapSize_x}
          style={{ width: "2em" }}
        />
        x
        <BufferedNumberInput
          min="1"
          max={null}
          step="1"
          value={optionValue_mapSize_y}
          validators={[(t) => !isNaN(t), (t) => t > 0]}
          onValidInput={onOptionChange_mapSize_y}
          style={{ width: "2em" }}
        />
        <br />
      </React.Fragment>
    );
    let setting_crop = (
      <tr>
        <th>
          <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/CROP/TITLE-TT")}>
            <b>
              {getLocaleString("MAP-SETTINGS/CROP/TITLE")}
              {":"}
            </b>
          </Tooltip>{" "}
        </th>
        <td>
          <select onChange={onOptionChange_cropImage} value={optionValue_cropImage}>
            {Object.values(CropModes).map((cropMode) => (
              <option key={cropMode.uniqueId} value={cropMode.uniqueId}>
                {getLocaleString(cropMode.localeKey)}
              </option>
            ))}
          </select>
        </td>
        <td />
      </tr>
    );
    let setting_crop_zoom = null;
    let setting_crop_percent_x = null;
    let setting_crop_percent_y = null;
    if (optionValue_cropImage === CropModes.MANUAL.uniqueId) {
      setting_crop_zoom = (
        <tr>
          <th>
            <b>
              {getLocaleString("MAP-SETTINGS/CROP/ZOOM")}
              {":"}
            </b>{" "}
          </th>
          <td>
            <input
              type="range"
              min="10"
              max="50"
              value={optionValue_cropImage_zoom}
              onChange={(e) => onOptionChange_cropImage_zoom(parseInt(e.target.value))}
            />
          </td>
          <td />
        </tr>
      );
      setting_crop_percent_x = (
        <tr>
          <th>
            <b>{"X:"}</b>{" "}
          </th>
          <td>
            <input
              type="range"
              min="0"
              max="100"
              value={optionValue_cropImage_percent_x}
              onChange={(e) => onOptionChange_cropImage_percent_x(parseInt(e.target.value))}
            />
          </td>
          <td>
            <BufferedNumberInput
              min="0"
              max="100"
              step="1"
              value={optionValue_cropImage_percent_x}
              validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 100]}
              onValidInput={onOptionChange_cropImage_percent_x}
              style={{ width: "3em" }}
            />
          </td>
        </tr>
      );
      setting_crop_percent_y = (
        <tr>
          <th>
            <b>{"Y:"}</b>{" "}
          </th>
          <td>
            <input
              type="range"
              min="0"
              max="100"
              value={optionValue_cropImage_percent_y}
              onChange={(e) => onOptionChange_cropImage_percent_y(parseInt(e.target.value))}
            />
          </td>
          <td>
            <BufferedNumberInput
              min="0"
              max="100"
              step="1"
              value={optionValue_cropImage_percent_y}
              validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 100]}
              onValidInput={onOptionChange_cropImage_percent_y}
              style={{ width: "3em" }}
            />
          </td>
        </tr>
      );
    }
    let settingGroup_cropping = (
      <div className={optionValue_cropImage === CropModes.MANUAL.uniqueId ? "settingsGroup" : null}>
        <table>
          <tbody>
            {setting_crop}
            {setting_crop_zoom}
            {setting_crop_percent_x}
            {setting_crop_percent_y}
          </tbody>
        </table>
      </div>
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
          {Object.values(
            optionValue_modeNBTOrMapdat === MapModes.SCHEMATIC_NBT.uniqueId ? MapModes.SCHEMATIC_NBT.staircaseModes : MapModes.MAPDAT.staircaseModes
          )
            .filter((staircaseMode) => optionValue_extras_moreStaircasingOptions || !staircaseMode.extra)
            .map((staircaseMode) => (
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
          <AutoCompleteInputBlockToAdd
            coloursJSON={coloursJSON}
            value={optionValue_supportBlock}
            setValue={setOption_SupportBlock}
            optionValue_version={optionValue_version}
          />
          <br />
        </React.Fragment>
      );
    } else {
      let setting_transparency = (
        <tr>
          <th>
            <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/TRANSPARENCY-TT")}>
              <b>
                {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/TRANSPARENCY")}
                {":"}
              </b>
            </Tooltip>{" "}
          </th>
          <td>
            <input type="checkbox" checked={optionValue_transparency} onChange={onOptionChange_transparency} />
          </td>
          <td />
        </tr>
      );
      let setting_transparencyTolerance = null;
      if (optionValue_transparency) {
        setting_transparencyTolerance = (
          <tr>
            <th>
              <b>
                {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/TRANSPARENCY-TOLERANCE")}
                {":"}
              </b>{" "}
            </th>
            <td>
              <input
                type="range"
                min="0"
                max="256"
                value={optionValue_transparencyTolerance}
                onChange={(e) => onOptionChange_transparencyTolerance(parseInt(e.target.value))}
              />
            </td>
            <td>
              <BufferedNumberInput
                min="0"
                max="256"
                step="1"
                value={optionValue_transparencyTolerance}
                validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 256]}
                onValidInput={onOptionChange_transparencyTolerance}
                style={{ width: "3em" }}
              />
            </td>
          </tr>
        );
      }
      let settingGroup_transparency = (
        <div className={optionValue_transparency ? "settingsGroup" : null}>
          <table>
            <tbody>
              {setting_transparency}
              {setting_transparencyTolerance}
            </tbody>
          </table>
        </div>
      );
      let setting_mapdatFilenameUseId = (
        <tr>
          <th>
            <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/MAPDAT-FILENAME-USE-ID-TT")}>
              <b>
                {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/MAPDAT-FILENAME-USE-ID")}
                {":"}
              </b>
            </Tooltip>{" "}
          </th>
          <td>
            <input type="checkbox" checked={optionValue_mapdatFilenameUseId} onChange={onOptionChange_mapdatFilenameUseId} />
          </td>
          <td />
          <td />
        </tr>
      );
      let setting_mapdatFilenameIdStart = null;
      if (optionValue_mapdatFilenameUseId) {
        setting_mapdatFilenameIdStart = (
          <tr>
            <th>
              <b>
                {getLocaleString("MAP-SETTINGS/MAPDAT-SPECIFIC/MAPDAT-FILENAME-ID-RANGE")}
                {":"}
              </b>{" "}
            </th>
            <td>
              <BufferedNumberInput
                min="0"
                step="1"
                value={optionValue_mapdatFilenameIdStart}
                validators={[(t) => !isNaN(t), (t) => t >= 0]}
                onValidInput={onOptionChange_mapdatFilenameIdStart}
                style={{ width: "3em" }}
              />
            </td>
            <td>
              <b>{"-"}</b>
            </td>
            <td>
              <BufferedNumberInput
                value={-1 + optionValue_mapdatFilenameIdStart + optionValue_mapSize_x * optionValue_mapSize_y}
                disabled={true}
                style={{ width: "3em" }}
              />
            </td>
          </tr>
        );
      }
      let settingGroup_mapdatFilename = (
        <div className={optionValue_mapdatFilenameUseId ? "settingsGroup" : null}>
          <table>
            <tbody>
              {setting_mapdatFilenameUseId}
              {setting_mapdatFilenameIdStart}
            </tbody>
          </table>
        </div>
      );
      settings_mapModeConditional = (
        <React.Fragment>
          {settingGroup_transparency}
          {settingGroup_mapdatFilename}
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
    const setting_preprocessing = (
      <tr>
        <th>
          <b>
            {getLocaleString("MAP-SETTINGS/PREPROCESSING/ENABLE")}
            {":"}
          </b>{" "}
          <input type="checkbox" checked={optionValue_preprocessingEnabled} onChange={onOptionChange_PreProcessingEnabled} />
        </th>
        <td />
        <td />
      </tr>
    );
    const setting_preprocessing_brightness = (
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
            value={preProcessingValue_brightness}
            onChange={(e) => onOptionChange_PreProcessingBrightness(parseInt(e.target.value))}
            disabled={!optionValue_preprocessingEnabled}
          />
        </td>
        <td>
          <BufferedNumberInput
            min="0"
            max="200"
            step="1"
            value={preProcessingValue_brightness}
            validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 200]}
            onValidInput={onOptionChange_PreProcessingBrightness}
            disabled={!optionValue_preprocessingEnabled}
            style={{ width: "3em" }}
          />
        </td>
      </tr>
    );
    const setting_preprocessing_contrast = (
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
            value={preProcessingValue_contrast}
            onChange={(e) => onOptionChange_PreProcessingContrast(parseInt(parseInt(e.target.value)))}
            disabled={!optionValue_preprocessingEnabled}
          />
        </td>
        <td>
          <BufferedNumberInput
            min="0"
            max="200"
            step="1"
            value={preProcessingValue_contrast}
            validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 200]}
            onValidInput={onOptionChange_PreProcessingContrast}
            disabled={!optionValue_preprocessingEnabled}
            style={{ width: "3em" }}
          />
        </td>
      </tr>
    );
    const setting_preprocessing_saturation = (
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
            value={preProcessingValue_saturation}
            onChange={(e) => onOptionChange_PreProcessingSaturation(parseInt(e.target.value))}
            disabled={!optionValue_preprocessingEnabled}
          />
        </td>
        <td>
          <BufferedNumberInput
            min="0"
            max="200"
            step="1"
            value={preProcessingValue_saturation}
            validators={[(t) => !isNaN(t), (t) => t >= 0, (t) => t <= 200]}
            onValidInput={onOptionChange_PreProcessingSaturation}
            disabled={!optionValue_preprocessingEnabled}
            style={{ width: "3em" }}
          />
        </td>
      </tr>
    );
    const setting_preprocessing_background = (
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
    );
    const setting_preprocessing_backgroundColour = (
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
    );
    const settingGroup_preprocessing = (
      <React.Fragment>
        <details>
          <summary>{getLocaleString("MAP-SETTINGS/PREPROCESSING/TITLE")}</summary>
          <div className={optionValue_preprocessingEnabled ? "settingsGroup" : null}>
            <table>
              <tbody>
                {setting_preprocessing}
                {setting_preprocessing_brightness}
                {setting_preprocessing_contrast}
                {setting_preprocessing_saturation}
                {setting_preprocessing_background}
                {setting_preprocessing_backgroundColour}
              </tbody>
            </table>
          </div>
        </details>
      </React.Fragment>
    );
    const setting_extras_moreStaircasingOptions = (
      <tr>
        <th>
          <Tooltip tooltipText={getLocaleString("MAP-SETTINGS/EXTRAS/MORE-STAIRCASING-OPTIONS-TT")}>
            <b>
              {getLocaleString("MAP-SETTINGS/EXTRAS/MORE-STAIRCASING-OPTIONS")}
              {":"}
            </b>
          </Tooltip>{" "}
        </th>
        <td>
          <input type="checkbox" checked={optionValue_extras_moreStaircasingOptions} onChange={onOptionChange_extras_moreStaircasingOptions} />
        </td>
      </tr>
    );
    const settingGroup_extras = (
      <React.Fragment>
        <details>
          <summary>{getLocaleString("MAP-SETTINGS/EXTRAS/TITLE")}</summary>
          <table>
            <tbody>{setting_extras_moreStaircasingOptions}</tbody>
          </table>
        </details>
      </React.Fragment>
    );
    const settingsDiv = (
      <div className="section settingsDiv">
        <h2>{getLocaleString("MAP-SETTINGS/TITLE")}</h2>
        {setting_mode}
        {setting_version}
        {setting_mapSize}
        {settingGroup_cropping}
        {setting_grid}
        {setting_staircasing}
        {settings_mapModeConditional}
        {setting_betterColour}
        {setting_dithering}
        {settingGroup_preprocessing}
        {settingGroup_extras}
      </div>
    );
    return settingsDiv;
  }
}

export default MapSettings;
