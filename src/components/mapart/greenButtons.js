import React, { Component } from "react";
import { gzip } from "pako"; // blocks when zipping
import JSZip from "jszip";

import Tooltip from "../tooltip";

import MapModes from "./json/mapModes.json";
import WhereSupportBlocksModes from "./json/whereSupportBlocksModes.json";

import NBTWorker from "./workers/nbt.jsworker";

import "./greenButtons.css";

class GreenButtons extends Component {
  // For download buttons and donate link etc
  state = {
    buttonWidth_viewOnline: 1,
    buttonWidth_NBT_Joined: 1,
    buttonWidth_NBT_Split: 1,
    buttonWidth_Mapdat_Split: 1,
    mapPreviewWorker_onFinishCallback: null,
  };

  nbtWorker = new Worker(NBTWorker);

  resetButtonWidths() {
    this.setState({
      buttonWidth_viewOnline: 1,
      buttonWidth_NBT_Joined: 1,
      buttonWidth_NBT_Split: 1,
      buttonWidth_Mapdat_Split: 1,
    });
  }

  getNBT_base = (workerHeader) => {
    const {
      getLocaleString,
      coloursJSON,
      optionValue_version,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      optionValue_mapdatFilenameUseId,
      optionValue_mapdatFilenameIdStart,
      uploadedImage_baseFilename,
      currentMaterialsData,
      mapPreviewWorker_inProgress,
      downloadBlobFile,
      onGetViewOnlineNBT,
    } = this.props;
    if (mapPreviewWorker_inProgress) {
      this.setState({ mapPreviewWorker_onFinishCallback: () => this.getNBT_base(workerHeader) });
      return;
    }
    if (Object.entries(currentMaterialsData.currentSelectedBlocks).every((elt) => elt[1] === "-1")) {
      alert(getLocaleString("DOWNLOAD/ERROR-NONE-SELECTED"));
      return;
    }
    this.nbtWorker.terminate();
    this.resetButtonWidths();
    let numberOfSplitsCalculated = 0;
    let zipFile = new JSZip();
    const t0 = performance.now();
    this.nbtWorker = new Worker(NBTWorker);
    this.nbtWorker.onmessage = (e) => {
      switch (e.data.head) {
        case "PROGRESS_REPORT_CREATE_NBT_JOINED_FOR_VIEW_ONLINE": {
          this.setState({ buttonWidth_viewOnline: e.data.body });
          break;
        }
        case "PROGRESS_REPORT_CREATE_NBT_JOINED": {
          this.setState({ buttonWidth_NBT_Joined: e.data.body });
          break;
        }
        case "PROGRESS_REPORT_CREATE_NBT_SPLIT": {
          this.setState({ buttonWidth_NBT_Split: (numberOfSplitsCalculated + e.data.body) / (optionValue_mapSize_x * optionValue_mapSize_y) });
          break;
        }
        case "PROGRESS_REPORT_CREATE_MAPDAT_SPLIT": {
          this.setState({ buttonWidth_Mapdat_Split: (numberOfSplitsCalculated + e.data.body) / (optionValue_mapSize_x * optionValue_mapSize_y) });
          break;
        }
        case "NBT_FOR_VIEW_ONLINE": {
          const t1 = performance.now();
          console.log(`Created NBT for 'view online' by ${(t1 - t0).toString()}ms`);
          const { NBT_Array } = e.data.body;
          onGetViewOnlineNBT(NBT_Array);
          break;
        }
        case "NBT_ARRAY": {
          const t1 = performance.now();
          console.log(`Created NBT by ${(t1 - t0).toString()}ms`);
          numberOfSplitsCalculated++;
          const { NBT_Array, whichMap_x, whichMap_y } = e.data.body;
          const NBT_Array_gzipped = gzip(NBT_Array);
          if (workerHeader === "CREATE_NBT_SPLIT") {
            zipFile.file(`${uploadedImage_baseFilename}_${whichMap_x}_${whichMap_y}.nbt`, NBT_Array_gzipped);
            if (numberOfSplitsCalculated === optionValue_mapSize_x * optionValue_mapSize_y) {
              zipFile.generateAsync({ type: "blob" }).then((content) => {
                downloadBlobFile(content, `${uploadedImage_baseFilename}.zip`);
              });
            }
          } else {
            const downloadBlob = new Blob([NBT_Array_gzipped], { type: "application/x-minecraft-level" });
            downloadBlobFile(downloadBlob, `${uploadedImage_baseFilename}.nbt`);
          }
          break;
        }
        case "MAPDAT_BYTES": {
          const t1 = performance.now();
          console.log(`Created Mapdat by ${(t1 - t0).toString()}ms`);
          numberOfSplitsCalculated++;
          const { Mapdat_Bytes, whichMap_x, whichMap_y } = e.data.body;
          const Mapdat_Bytes_gzipped = gzip(Mapdat_Bytes);
          const downloadBlob = new Blob([Mapdat_Bytes_gzipped], { type: "application/x-minecraft-level" });
          downloadBlobFile(downloadBlob, optionValue_mapdatFilenameUseId
            ? `map_${(optionValue_mapdatFilenameIdStart + whichMap_y * optionValue_mapSize_x + whichMap_x).toString()}.dat`
            : `${uploadedImage_baseFilename}_${whichMap_x.toString()}_${whichMap_y.toString()}.dat`);
          break;
        }
        case "MAPDAT_BYTES_ZIP": {
          const t1 = performance.now();
          console.log(`Created Mapdat by ${(t1 - t0).toString()}ms`);
          numberOfSplitsCalculated++;
          const { Mapdat_Bytes, whichMap_x, whichMap_y } = e.data.body;
          const Mapdat_Bytes_gzipped = gzip(Mapdat_Bytes);
          zipFile.file(
            optionValue_mapdatFilenameUseId
              ? `map_${(optionValue_mapdatFilenameIdStart + whichMap_y * optionValue_mapSize_x + whichMap_x).toString()}.dat`
              : `${uploadedImage_baseFilename}_${whichMap_x.toString()}_${whichMap_y.toString()}.dat`,
            Mapdat_Bytes_gzipped
          );
          if (numberOfSplitsCalculated === optionValue_mapSize_x * optionValue_mapSize_y) {
            zipFile.generateAsync({ type: "blob" }).then((content) => {
              downloadBlobFile(content, `${uploadedImage_baseFilename}.zip`);
            });
          }
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
        MapModes: MapModes,
        WhereSupportBlocksModes: WhereSupportBlocksModes,
        optionValue_version: optionValue_version,
        optionValue_staircasing: optionValue_staircasing,
        optionValue_whereSupportBlocks: optionValue_whereSupportBlocks,
        optionValue_supportBlock: optionValue_supportBlock,
        pixelsData: currentMaterialsData.pixelsData,
        maps: currentMaterialsData.maps,
        currentSelectedBlocks: currentMaterialsData.currentSelectedBlocks,
      },
    });
  };

  onViewOnlineClicked = () => {
    this.getNBT_base("CREATE_NBT_JOINED_FOR_VIEW_ONLINE");
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

  onGetMapdatSplitZipClicked = () => {
    this.getNBT_base("CREATE_MAPDAT_SPLIT_ZIP");
  };

  componentDidUpdate_shouldNBTWorkerTerminate(prevProps) {
    const {
      selectedBlocks,
      optionValue_version,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_cropImage_zoom,
      optionValue_cropImage_percent_x,
      optionValue_cropImage_percent_y,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      optionValue_transparency,
      optionValue_transparencyTolerance,
      optionValue_mapdatFilenameUseId,
      optionValue_mapdatFilenameIdStart,
      optionValue_betterColour,
      optionValue_dithering,
      optionValue_preprocessingEnabled,
      preProcessingValue_brightness,
      preProcessingValue_contrast,
      preProcessingValue_saturation,
      preProcessingValue_backgroundColourSelect,
      preProcessingValue_backgroundColour,
      uploadedImage,
    } = this.props;
    return [
      prevProps.selectedBlocks !== selectedBlocks,
      prevProps.optionValue_version !== optionValue_version,
      prevProps.optionValue_modeNBTOrMapdat !== optionValue_modeNBTOrMapdat,
      prevProps.optionValue_mapSize_x !== optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y !== optionValue_mapSize_y,
      prevProps.optionValue_cropImage !== optionValue_cropImage,
      prevProps.optionValue_cropImage_zoom !== optionValue_cropImage_zoom,
      prevProps.optionValue_cropImage_percent_x !== optionValue_cropImage_percent_x,
      prevProps.optionValue_cropImage_percent_y !== optionValue_cropImage_percent_y,
      prevProps.optionValue_staircasing !== optionValue_staircasing,
      prevProps.optionValue_whereSupportBlocks !== optionValue_whereSupportBlocks,
      prevProps.optionValue_supportBlock !== optionValue_supportBlock,
      prevProps.optionValue_transparency !== optionValue_transparency,
      prevProps.optionValue_transparencyTolerance !== optionValue_transparencyTolerance,
      prevProps.optionValue_mapdatFilenameUseId !== optionValue_mapdatFilenameUseId,
      prevProps.optionValue_mapdatFilenameIdStart !== optionValue_mapdatFilenameIdStart,
      prevProps.optionValue_betterColour !== optionValue_betterColour,
      prevProps.optionValue_dithering !== optionValue_dithering,
      prevProps.optionValue_preprocessingEnabled !== optionValue_preprocessingEnabled,
      prevProps.preProcessingValue_brightness !== preProcessingValue_brightness,
      prevProps.preProcessingValue_contrast !== preProcessingValue_contrast,
      prevProps.preProcessingValue_saturation !== preProcessingValue_saturation,
      prevProps.preProcessingValue_backgroundColourSelect !== preProcessingValue_backgroundColourSelect,
      prevProps.preProcessingValue_backgroundColour !== preProcessingValue_backgroundColour,
      prevProps.uploadedImage !== uploadedImage,
    ].some((elt) => elt);
  }

  componentDidUpdate(prevProps) {
    const { mapPreviewWorker_inProgress } = this.props;
    if (this.componentDidUpdate_shouldNBTWorkerTerminate(prevProps)) {
      // reset callback if setting changed
      this.nbtWorker.terminate();
      this.resetButtonWidths();
      this.setState({ mapPreviewWorker_onFinishCallback: null });
    } else if (!mapPreviewWorker_inProgress && this.state.mapPreviewWorker_onFinishCallback !== null) {
      this.state.mapPreviewWorker_onFinishCallback();
      this.setState({ mapPreviewWorker_onFinishCallback: null });
    }
  }

  componentWillUnmount() {
    this.nbtWorker.terminate();
  }

  render() {
    const { buttonWidth_viewOnline, buttonWidth_NBT_Joined, buttonWidth_NBT_Split, buttonWidth_Mapdat_Split } = this.state;
    const { getLocaleString, optionValue_modeNBTOrMapdat } = this.props;
    let buttons_mapModeConditional;
    // dummy text used in divs with absolutely positioned children to create correct container height
    if (optionValue_modeNBTOrMapdat === MapModes.SCHEMATIC_NBT.uniqueId) {
      buttons_mapModeConditional = (
        <React.Fragment>
          <Tooltip tooltipText={getLocaleString("VIEW-ONLINE/TITLE-TT")}>
            <div className="greenButton" onClick={this.onViewOnlineClicked}>
              <span className="greenButton_text_dummy">{getLocaleString("VIEW-ONLINE/TITLE")}</span>
              <span className="greenButton_text">{getLocaleString("VIEW-ONLINE/TITLE")}</span>
              <div
                className="greenButton_progressDiv"
                style={{
                  width: `${Math.floor(buttonWidth_viewOnline * 100)}%`,
                }}
              />
            </div>
          </Tooltip>
          <br />
          <Tooltip tooltipText={getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-TT")}>
            <div className="greenButton" onClick={this.onGetNBTClicked}>
              <span className="greenButton_large_text_dummy">{getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD")}</span>
              <span className="greenButton_large_text">{getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD")}</span>
              <div
                className="greenButton_progressDiv"
                style={{
                  width: `${Math.floor(buttonWidth_NBT_Joined * 100)}%`,
                }}
              />
            </div>
          </Tooltip>
          <br />
          <Tooltip tooltipText={getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-SPLIT-TT")}>
            <div className="greenButton" onClick={this.onGetNBTSplitClicked}>
              <span className="greenButton_text_dummy">{`${getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-SPLIT")} .ZIP`}</span>
              <span className="greenButton_text">{`${getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-SPLIT")} .ZIP`}</span>
              <div
                className="greenButton_progressDiv"
                style={{
                  width: `${Math.floor(buttonWidth_NBT_Split * 100)}%`,
                }}
              />
            </div>
          </Tooltip>
          <br />
        </React.Fragment>
      );
    } else {
      buttons_mapModeConditional = (
        <React.Fragment>
          <Tooltip tooltipText={getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD-TT")}>
            <div className="greenButton" onClick={this.onGetMapdatSplitClicked}>
              <span className="greenButton_large_text_dummy">{`${getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD")}`}</span>
              <span className="greenButton_large_text">{`${getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD")}`}</span>
              <div
                className="greenButton_progressDiv"
                style={{
                  width: `${Math.floor(buttonWidth_Mapdat_Split * 100)}%`,
                }}
              />
            </div>
          </Tooltip>
          <br />
          <Tooltip tooltipText={getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD-TT")}>
            <div className="greenButton" onClick={this.onGetMapdatSplitZipClicked}>
              <span className="greenButton_large_text_dummy">{`${getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD")} .ZIP`}</span>
              <span className="greenButton_large_text">{`${getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD")} .ZIP`}</span>
              <div
                className="greenButton_progressDiv"
                style={{
                  width: `${Math.floor(buttonWidth_Mapdat_Split * 100)}%`,
                }}
              />
            </div>
          </Tooltip>
          <br />
        </React.Fragment>
      );
    }
    const button_donate = (
      <React.Fragment>
        <Tooltip tooltipText={getLocaleString("DONATE/TITLE-TT")}>
          <div className="greenButton">
            <a style={{ textDecoration: "none" }} href="./supporters">
              <span className="greenButton_text_dummy" style={{ backgroundColor: "#688e6b", color: "#333333" }}>
                {getLocaleString("DONATE/TITLE")}
              </span>
              <span className="greenButton_text" style={{ backgroundColor: "#688e6b", color: "#333333" }}>
                {getLocaleString("DONATE/TITLE")}
              </span>
            </a>
          </div>
        </Tooltip>
      </React.Fragment>
    );
    const buttonsDiv = (
      <div>
        {buttons_mapModeConditional}
        {button_donate}
      </div>
    );
    return buttonsDiv;
  }
}

export default GreenButtons;
