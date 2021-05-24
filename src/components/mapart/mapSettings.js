import React, { Component } from "react";
import { gzip } from "pako";

import DitherMethods from "./ditherMethods.json";
import Tooltip from "../tooltip";
import coloursJSON from "./coloursJSON.json";

import NBTWorker from "./workers/nbt.jsworker";

import "./mapSettings.css";

class MapSettings extends Component {
  state = {
    buttonWidth_NBT_Joined: 1,
    buttonWidth_NBT_Split: 1,
    buttonWidth_Mapdat_Split: 1,
    mapPreviewWorker_onFinishCallback: null,
  };

  nbtWorker = new Worker(NBTWorker);

  resetButtonWidths() {
    this.setState({ buttonWidth_NBT_Joined: 1, buttonWidth_NBT_Split: 1, buttonWidth_Mapdat_Split: 1 });
  }

  getNBT_base = (workerHeader) => {
    const {
      getLocaleString,
      supportedVersions,
      optionValue_version,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      currentMaterialsData,
      downloadBlobFile,
      mapPreviewWorker_inProgress,
    } = this.props;
    if (mapPreviewWorker_inProgress) {
      this.setState({ mapPreviewWorker_onFinishCallback: () => this.getNBT_base(workerHeader) });
      return;
    }
    if (Object.entries(currentMaterialsData.currentSelectedBlocks).every((elt) => elt[1] === "-1")) {
      alert(getLocaleString("SELECTBLOCKSWARNING-DOWNLOAD"));
      return;
    }
    this.nbtWorker.terminate();
    this.resetButtonWidths();
    const t0 = performance.now();
    this.nbtWorker = new Worker(NBTWorker);
    this.nbtWorker.onmessage = (e) => {
      switch (e.data.head) {
        case "PROGRESS_REPORT_NBT_JOINED": {
          this.setState({ buttonWidth_NBT_Joined: e.data.body });
          break;
        }
        case "PROGRESS_REPORT_NBT_SPLIT": {
          this.setState({ buttonWidth_NBT_Split: e.data.body });
          break;
        }
        case "PROGRESS_REPORT_MAPDAT_SPLIT": {
          this.setState({ buttonWidth_Mapdat_Split: e.data.body });
          break;
        }
        case "NBT_ARRAY": {
          const t1 = performance.now();
          console.log(`Created NBT by ${(t1 - t0).toString()}ms`);
          const { NBT_Array, whichMap_x, whichMap_y } = e.data.body;
          downloadBlobFile(
            gzip(NBT_Array),
            "application/x-minecraft-level",
            workerHeader === "CREATE_NBT_SPLIT" ? `mapart_${whichMap_x}_${whichMap_y}.nbt` : "mapart.nbt"
          );
          break;
        }
        case "MAPDAT_BYTES": {
          const t1 = performance.now();
          console.log(`Created Mapdat by ${(t1 - t0).toString()}ms`);
          const { Mapdat_Bytes, whichMap_x, whichMap_y } = e.data.body;
          downloadBlobFile(gzip(Mapdat_Bytes), "application/x-minecraft-map", `mapdat_${whichMap_x}_${whichMap_y}.dat`);
          break;
        }
        default: {
          throw new Error("Unknown worker response header");
        }
      }
    };
    this.nbtWorker.postMessage({
      head: workerHeader,
      body: {
        coloursJSON: coloursJSON,
        supportedVersions: supportedVersions,
        optionValue_version: optionValue_version,
        optionValue_staircasing: optionValue_staircasing,
        optionValue_whereSupportBlocks: optionValue_whereSupportBlocks,
        optionValue_supportBlock: optionValue_supportBlock,
        maps: currentMaterialsData.maps,
        currentSelectedBlocks: currentMaterialsData.currentSelectedBlocks,
      },
    });
  };

  onGetNBTClicked = () => {
    this.getNBT_base("CREATE_NBT_JOINED");
  };

  onGetNBTSplitClicked = () => {
    this.getNBT_base("CREATE_NBT_SPLIT");
  };

  onGetMapdatSplitClicked = () => {
    this.getNBT_base("CREATE_MAPDAT_SPLIT");
  };

  componentDidUpdate(prevProps) {
    const { optionValue_modeNBTOrMapdat, mapPreviewWorker_inProgress } = this.props;
    if (prevProps.optionValue_modeNBTOrMapdat !== optionValue_modeNBTOrMapdat) {
      // reset callback if changing mode from NBT to mapdat while rendering after download button clicked (very niche but a bug squashed nontheless)
      this.setState({ mapPreviewWorker_onFinishCallback: null });
    }
    if (!mapPreviewWorker_inProgress && this.state.mapPreviewWorker_onFinishCallback !== null) {
      this.state.mapPreviewWorker_onFinishCallback();
      this.setState({ mapPreviewWorker_onFinishCallback: null });
    }
  }

  componentWillUnmount() {
    this.nbtWorker.terminate();
  }

  render() {
    const { buttonWidth_NBT_Joined, buttonWidth_NBT_Split, buttonWidth_Mapdat_Split } = this.state;
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
              <span className="greenButton_old" onClick={onViewOnlineClicked}>
                {getLocaleString("DOWNLOAD-VIEWONLINE")}
              </span>
            </Tooltip>
            <br />
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-NBT")}>
              <div className="greenButton greenButton_large" style={{ display: "block" }} onClick={this.onGetNBTClicked}>
                <span className="greenButton_text greenButton_large_text">{getLocaleString("DOWNLOAD-NBT")}</span>
                <div
                  className="greenButton_progressDiv"
                  style={{
                    width: `${Math.floor(buttonWidth_NBT_Joined * 100)}%`,
                  }}
                />
              </div>
            </Tooltip>
            <br />
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-NBTSPLIT")}>
              <div className="greenButton" style={{ display: "block" }} onClick={this.onGetNBTSplitClicked}>
                <span className="greenButton_text">{getLocaleString("DOWNLOAD-NBTSPLIT")}</span>
                <div
                  className="greenButton_progressDiv"
                  style={{
                    width: `${Math.floor(buttonWidth_NBT_Split * 100)}%`,
                  }}
                />
              </div>
            </Tooltip>
          </span>
        ) : (
          <span>
            <Tooltip tooltipText={getLocaleString("DOWNLOAD-TT-MAPDAT")}>
              <div className="greenButton greenButton_large" style={{ display: "block" }} onClick={this.onGetMapdatSplitClicked}>
                <span className="greenButton_text greenButton_large_text">{getLocaleString("DOWNLOAD-MAPDAT")}</span>
                <div
                  className="greenButton_progressDiv"
                  style={{
                    width: `${Math.floor(buttonWidth_Mapdat_Split * 100)}%`,
                  }}
                />
              </div>
            </Tooltip>
          </span>
        )}
        <br />
        <Tooltip tooltipText={getLocaleString("DONATEBUTTON-TT")}>
          <a className="donateA" href="./supporters">
            <span className="greenButton_old">{getLocaleString("DONATEBUTTON")}</span>
            <br />
          </a>
        </Tooltip>
      </div>
    );
  }
}

export default MapSettings;
