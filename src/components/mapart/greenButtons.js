import React, { Component } from "react";
import { gzip } from "pako"; // blocks when zipping

import Tooltip from "../tooltip";
import coloursJSON from "./coloursJSON.json";

import MapModes from "./json/mapModes.json";
import StaircaseModes from "./json/staircaseModes.json";
import WhereSupportBlocksModes from "./json/whereSupportBlocksModes.json";

import NBTWorker from "./workers/nbt.jsworker";

import "./greenButtons.css";

class GreenButtons extends Component {
  // For download buttons and donate link etc
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
      optionValue_version,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      uploadedImage_baseFilename,
      currentMaterialsData,
      mapPreviewWorker_inProgress,
      downloadBlobFile,
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
            workerHeader === "CREATE_NBT_SPLIT" ? `${uploadedImage_baseFilename}_${whichMap_x}_${whichMap_y}.nbt` : `${uploadedImage_baseFilename}.nbt`
          );
          break;
        }
        case "MAPDAT_BYTES": {
          const t1 = performance.now();
          console.log(`Created Mapdat by ${(t1 - t0).toString()}ms`);
          const { Mapdat_Bytes, whichMap_x, whichMap_y } = e.data.body;
          downloadBlobFile(gzip(Mapdat_Bytes), "application/x-minecraft-map", `${uploadedImage_baseFilename}_${whichMap_x}_${whichMap_y}.dat`);
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
        StaircaseModes: StaircaseModes,
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

  onGetNBTClicked = () => {
    this.getNBT_base("CREATE_NBT_JOINED");
  };

  onGetNBTSplitClicked = () => {
    this.getNBT_base("CREATE_NBT_SPLIT");
  };

  onGetMapdatSplitClicked = () => {
    this.getNBT_base("CREATE_MAPDAT_SPLIT");
  };

  componentDidUpdate_shouldNBTWorkerTerminate(prevProps) {
    const {
      selectedBlocks,
      optionValue_version,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      optionValue_unobtainable,
      optionValue_transparency,
      optionValue_transparencyTolerance,
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
      prevProps.optionValue_staircasing !== optionValue_staircasing,
      prevProps.optionValue_whereSupportBlocks !== optionValue_whereSupportBlocks,
      prevProps.optionValue_supportBlock !== optionValue_supportBlock,
      prevProps.optionValue_unobtainable !== optionValue_unobtainable,
      prevProps.optionValue_transparency !== optionValue_transparency,
      prevProps.optionValue_transparencyTolerance !== optionValue_transparencyTolerance,
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
    const { buttonWidth_NBT_Joined, buttonWidth_NBT_Split, buttonWidth_Mapdat_Split } = this.state;
    const { getLocaleString, optionValue_modeNBTOrMapdat, onViewOnlineClicked } = this.props;
    let buttons_mapModeConditional;
    if (optionValue_modeNBTOrMapdat === MapModes.SCHEMATIC_NBT.uniqueId) {
      buttons_mapModeConditional = (
        <React.Fragment>
          {/* <Tooltip tooltipText={getLocaleString("VIEW-ONLINE/TITLE-TT")}>
            <span className="greenButton_old" onClick={onViewOnlineClicked}>
              {getLocaleString("VIEW-ONLINE/TITLE")}
            </span>
          </Tooltip>
          <br /> */}
          <Tooltip tooltipText={getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-TT")}>
            <div className="greenButton greenButton_large" style={{ display: "block" }} onClick={this.onGetNBTClicked}>
              <span className="greenButton_text greenButton_large_text">{getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD")}</span>
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
            <div className="greenButton" style={{ display: "block" }} onClick={this.onGetNBTSplitClicked}>
              <span className="greenButton_text">{getLocaleString("DOWNLOAD/NBT-SPECIFIC/DOWNLOAD-SPLIT")}</span>
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
            <div className="greenButton greenButton_large" style={{ display: "block" }} onClick={this.onGetMapdatSplitClicked}>
              <span className="greenButton_text greenButton_large_text">{getLocaleString("DOWNLOAD/MAPDAT-SPECIFIC/DOWNLOAD")}</span>
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
          <a className="greenButton" style={{ textDecoration: "none", display:"block" }} href="./supporters">
            <span className="greenButton_text" style={{backgroundColor: "#688e6b", color:"#333333"}}>{getLocaleString("DONATE/TITLE")}</span>
          </a>
        </Tooltip>
        <br />
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