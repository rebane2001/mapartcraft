import React, { Component, createRef } from "react";

import Tooltip from "../tooltip";
import MapCanvasWorker from "./workers/mapCanvas.jsworker"; // FINALLY got this to work; .js gets imported as code, anything else as URL

import BackgroundColourModes from "./json/backgroundColourModes.json";
import CropModes from "./json/cropModes.json";
import DitherMethods from "./json/ditherMethods.json";
import MapModes from "./json/mapModes.json";
import WhereSupportBlocksModes from "./json/whereSupportBlocksModes.json";

import IMG_Null from "../../images/null.png";
import IMG_Textures from "../../images/textures.png";
import IMG_GridOverlay from "../../images/gridOverlay.png";

import "./mapPreview.css";

class MapPreview extends Component {
  state = {
    mapPreviewSizeScale: 2,
    workerProgress: 0,
  };

  mapCanvasWorker = new Worker(MapCanvasWorker);

  constructor(props) {
    super(props);
    this.canvasRef_source = createRef(); // hidden source canvas that at all times contains the uploaded image
    this.canvasRef_display = createRef(); // display canvas that displays to the user, may be pixels, may be image
    this.fileInputRef = createRef();
  }

  shouldCanvasUpdate_source(prevProps, newProps, prevState, newState) {
    const propChanges = [
      prevProps.coloursJSON === newProps.coloursJSON,
      prevProps.selectedBlocks === newProps.selectedBlocks,
      prevProps.optionValue_mapSize_x === newProps.optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y === newProps.optionValue_mapSize_y,
      prevProps.optionValue_cropImage === newProps.optionValue_cropImage,
      prevProps.optionValue_cropImage_zoom === newProps.optionValue_cropImage_zoom,
      prevProps.optionValue_cropImage_percent_x === newProps.optionValue_cropImage_percent_x,
      prevProps.optionValue_cropImage_percent_y === newProps.optionValue_cropImage_percent_y,
      prevProps.optionValue_staircasing === newProps.optionValue_staircasing,
      prevProps.optionValue_preprocessingEnabled === newProps.optionValue_preprocessingEnabled,
      prevProps.preProcessingValue_brightness === newProps.preProcessingValue_brightness,
      prevProps.preProcessingValue_contrast === newProps.preProcessingValue_contrast,
      prevProps.preProcessingValue_saturation === newProps.preProcessingValue_saturation,
      prevProps.preProcessingValue_backgroundColourSelect === newProps.preProcessingValue_backgroundColourSelect,
      prevProps.preProcessingValue_backgroundColour === newProps.preProcessingValue_backgroundColour,
      prevProps.uploadedImage === newProps.uploadedImage,
    ];
    return (
      newProps.uploadedImage !== null &&
      prevState.workerProgress === newState.workerProgress &&
      !propChanges.every((elt) => {
        return elt === true;
      })
    );
  }

  shouldCanvasUpdate_display(prevProps, newProps, prevState, newState) {
    // ugly but useful method to determine whether map canvas contents should be redrawn on component update
    const propChanges = [
      prevProps.coloursJSON === newProps.coloursJSON,
      prevProps.selectedBlocks === newProps.selectedBlocks,
      prevProps.optionValue_modeNBTOrMapdat === newProps.optionValue_modeNBTOrMapdat,
      prevProps.optionValue_mapSize_x === newProps.optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y === newProps.optionValue_mapSize_y,
      prevProps.optionValue_cropImage === newProps.optionValue_cropImage,
      prevProps.optionValue_cropImage_zoom === newProps.optionValue_cropImage_zoom,
      prevProps.optionValue_cropImage_percent_x === newProps.optionValue_cropImage_percent_x,
      prevProps.optionValue_cropImage_percent_y === newProps.optionValue_cropImage_percent_y,
      prevProps.optionValue_staircasing === newProps.optionValue_staircasing,
      prevProps.optionValue_whereSupportBlocks === newProps.optionValue_whereSupportBlocks,
      prevProps.optionValue_transparency === newProps.optionValue_transparency,
      prevProps.optionValue_transparencyTolerance === newProps.optionValue_transparencyTolerance,
      prevProps.optionValue_betterColour === newProps.optionValue_betterColour,
      prevProps.optionValue_dithering === newProps.optionValue_dithering,
      prevProps.optionValue_preprocessingEnabled === newProps.optionValue_preprocessingEnabled,
      prevProps.preProcessingValue_brightness === newProps.preProcessingValue_brightness,
      prevProps.preProcessingValue_contrast === newProps.preProcessingValue_contrast,
      prevProps.preProcessingValue_saturation === newProps.preProcessingValue_saturation,
      prevProps.preProcessingValue_backgroundColourSelect === newProps.preProcessingValue_backgroundColourSelect,
      prevProps.preProcessingValue_backgroundColour === newProps.preProcessingValue_backgroundColour,
      prevProps.uploadedImage === newProps.uploadedImage,
    ];
    return (
      newProps.uploadedImage !== null &&
      prevState.workerProgress === newState.workerProgress &&
      !propChanges.every((elt) => {
        return elt === true;
      })
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.shouldCanvasUpdate_source(prevProps, this.props, prevState, this.state)) {
      this.updateCanvas_source(); // draw uploaded image on source canvas
    }
    if (this.shouldCanvasUpdate_display(prevProps, this.props, prevState, this.state)) {
      this.updateCanvas_display(); // draw pixelart of image on display canvas
    }
  }

  closestSmoothColourTo(colourHex) {
    const { coloursJSON, selectedBlocks, optionValue_staircasing } = this.props;
    const rgbGroups_input = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colourHex);
    const colourRGB_input = [parseInt(rgbGroups_input[1], 16), parseInt(rgbGroups_input[2], 16), parseInt(rgbGroups_input[3], 16)];
    let smallestDistance = 9999999;
    let colourRGB_return = null;
    for (const [colourSetId, colourSet] of Object.entries(coloursJSON)) {
      if (selectedBlocks[colourSetId] === "-1") {
        continue;
      }
      let coloursRGB_colourSet;
      switch (optionValue_staircasing) {
        case MapModes.SCHEMATIC_NBT.staircaseModes.OFF.uniqueId:
        case MapModes.SCHEMATIC_NBT.staircaseModes.CLASSIC.uniqueId:
        case MapModes.SCHEMATIC_NBT.staircaseModes.VALLEY.uniqueId:
        case MapModes.MAPDAT.staircaseModes.OFF.uniqueId: {
          coloursRGB_colourSet = [colourSet.tonesRGB.normal];
          break;
        }
        case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_DARK.uniqueId:
        case MapModes.MAPDAT.staircaseModes.FULL_DARK.uniqueId: {
          coloursRGB_colourSet = [colourSet.tonesRGB.dark];
          break;
        }
        case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_LIGHT.uniqueId:
        case MapModes.MAPDAT.staircaseModes.FULL_LIGHT.uniqueId: {
          coloursRGB_colourSet = [colourSet.tonesRGB.light];
          break;
        }
        case MapModes.MAPDAT.staircaseModes.FULL_UNOBTAINABLE.uniqueId: {
          coloursRGB_colourSet = [colourSet.tonesRGB.unobtainable];
          break;
        }
        case MapModes.MAPDAT.staircaseModes.ON.uniqueId: {
          coloursRGB_colourSet = [colourSet.tonesRGB.dark, colourSet.tonesRGB.normal, colourSet.tonesRGB.light];
          break;
        }
        case MapModes.MAPDAT.staircaseModes.ON_UNOBTAINABLE.uniqueId: {
          coloursRGB_colourSet = [colourSet.tonesRGB.dark, colourSet.tonesRGB.normal, colourSet.tonesRGB.light, colourSet.tonesRGB.unobtainable];
          break;
        }
        default: {
          throw new Error("Unknown staircasing mode");
        }
      }
      for (const colourRGB_colourSet of coloursRGB_colourSet) {
        const colourDistance =
          Math.pow(colourRGB_input[0] - colourRGB_colourSet[0], 2) +
          Math.pow(colourRGB_input[1] - colourRGB_colourSet[1], 2) +
          Math.pow(colourRGB_input[2] - colourRGB_colourSet[2], 2);
        if (colourDistance < smallestDistance) {
          smallestDistance = colourDistance;
          colourRGB_return = colourRGB_colourSet;
        }
      }
    }
    const colourHex_return = `#${colourRGB_return[0].toString(16).padStart(2, "0")}${colourRGB_return[1].toString(16).padStart(2, "0")}${colourRGB_return[2]
      .toString(16)
      .padStart(2, "0")}`;
    return colourHex_return;
  }

  updateCanvas_source() {
    const {
      selectedBlocks,
      optionValue_preprocessingEnabled,
      preProcessingValue_brightness,
      preProcessingValue_contrast,
      preProcessingValue_saturation,
      preProcessingValue_backgroundColourSelect,
      preProcessingValue_backgroundColour,
      uploadedImage,
    } = this.props;
    const {
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_cropImage_zoom,
      optionValue_cropImage_percent_x,
      optionValue_cropImage_percent_y,
    } = this.props;
    const { canvasRef_source } = this;
    const ctx_source = canvasRef_source.current.getContext("2d");
    ctx_source.imageSmoothingEnabled = true;   // These two options keep the map preview consistent on Chrome(ium). Otherwise the first render after changing
    ctx_source.imageSmoothingQuality = "high"; // map x or z size is pixelated to a noticeably lower quality. This is not a solution to the cause but a
                                               // workaround the effect (I do not know exactly why this happens: maybe it is to do with
                                               // anti-fingerprinting). Firefox is unaffected by any of this.
    ctx_source.clearRect(0, 0, ctx_source.canvas.width, ctx_source.canvas.height);

    if (optionValue_preprocessingEnabled) {
      if (preProcessingValue_backgroundColourSelect !== BackgroundColourModes.OFF.uniqueId && /^#?[a-f\d]{6}$/i.test(preProcessingValue_backgroundColour)) {
        let backgroundColour;
        if (
          preProcessingValue_backgroundColourSelect === BackgroundColourModes.SMOOTH.uniqueId &&
          !Object.values(selectedBlocks).every((selectedBlockId) => selectedBlockId === "-1")
        ) {
          backgroundColour = this.closestSmoothColourTo(preProcessingValue_backgroundColour);
        } else {
          backgroundColour = preProcessingValue_backgroundColour;
        }
        ctx_source.filter = "none"; // this needs to be present to stop filters affecting background colour
        ctx_source.rect(0, 0, ctx_source.canvas.width, ctx_source.canvas.height);
        ctx_source.fillStyle = backgroundColour;
        ctx_source.fill();
      }
      ctx_source.filter = `brightness(${preProcessingValue_brightness}%) contrast(${preProcessingValue_contrast}%) saturate(${preProcessingValue_saturation}%)`;
    } else {
      ctx_source.filter = "none";
    }

    switch (optionValue_cropImage) {
      case CropModes.OFF.uniqueId: {
        ctx_source.drawImage(uploadedImage, 0, 0, ctx_source.canvas.width, ctx_source.canvas.height);
        break;
      }
      case CropModes.CENTER.uniqueId:
      case CropModes.MANUAL.uniqueId: {
        const img_width = uploadedImage.width;
        const img_height = uploadedImage.height;
        let samplingWidth;
        let samplingHeight;
        let samplingOffset_x;
        let samplingOffset_y;
        if (img_width * optionValue_mapSize_y > img_height * optionValue_mapSize_x) {
          // image w/h greater than canvas w/h
          samplingWidth = Math.floor((10 * img_height * optionValue_mapSize_x) / (optionValue_mapSize_y * optionValue_cropImage_zoom));
          // the 10 is because the input is from 10 to 50 in steps of 1; scale down by 10
          samplingHeight = Math.floor((10 * img_height) / optionValue_cropImage_zoom);
          samplingOffset_x = Math.floor((optionValue_cropImage_percent_x * (img_width - samplingWidth)) / 100);
          samplingOffset_y = Math.floor((optionValue_cropImage_percent_y * (img_height - samplingHeight)) / 100);
        } else {
          // image w/h leq canvas w/h
          samplingWidth = Math.floor((10 * img_width) / optionValue_cropImage_zoom);
          samplingHeight = Math.floor((10 * img_width * optionValue_mapSize_y) / (optionValue_mapSize_x * optionValue_cropImage_zoom));
          samplingOffset_x = Math.floor((optionValue_cropImage_percent_x * (img_width - samplingWidth)) / 100);
          samplingOffset_y = Math.floor((optionValue_cropImage_percent_y * (img_height - samplingHeight)) / 100);
        }
        ctx_source.drawImage(
          uploadedImage,
          samplingOffset_x,
          samplingOffset_y,
          samplingWidth,
          samplingHeight,
          0,
          0,
          ctx_source.canvas.width,
          ctx_source.canvas.height
        );
        break;
      }
      default: {
        throw new Error("Unknown optionValue_cropImage");
      }
    }
  }

  updateCanvas_display() {
    this.mapCanvasWorker.terminate();
    const { canvasRef_source, canvasRef_display } = this;
    const {
      coloursJSON,
      selectedBlocks,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_transparency,
      optionValue_transparencyTolerance,
      optionValue_betterColour,
      optionValue_dithering,
      onGetMapMaterials,
      onMapPreviewWorker_begin,
    } = this.props;
    const ctx_source = canvasRef_source.current.getContext("2d");
    const canvasImageData = ctx_source.getImageData(0, 0, ctx_source.canvas.width, ctx_source.canvas.height);
    const t0 = performance.now();
    this.mapCanvasWorker = new Worker(MapCanvasWorker);
    this.mapCanvasWorker.onmessage = (e) => {
      if (e.data.head === "PIXELS_MATERIALS_CURRENTSELECTEDBLOCKS") {
        const t1 = performance.now();
        console.log(`Calculated map preview data in ${(t1 - t0).toString()}ms`);
        const ctx_display = canvasRef_display.current.getContext("2d");
        ctx_display.putImageData(e.data.body.pixels, 0, 0);
        this.setState({ workerProgress: 1 });
        onGetMapMaterials({
          pixelsData: e.data.body.pixels.data,
          maps: e.data.body.maps,
          currentSelectedBlocks: e.data.body.currentSelectedBlocks,
        });
      } else if (e.data.head === "PROGRESS_REPORT") {
        this.setState({ workerProgress: e.data.body });
      }
    };
    onMapPreviewWorker_begin();
    this.mapCanvasWorker.postMessage({
      head: "PIXELS",
      body: {
        coloursJSON: coloursJSON,
        MapModes: MapModes,
        WhereSupportBlocksModes: WhereSupportBlocksModes,
        DitherMethods: DitherMethods,
        canvasImageData: canvasImageData,
        selectedBlocks: selectedBlocks,
        optionValue_modeNBTOrMapdat: optionValue_modeNBTOrMapdat,
        optionValue_mapSize_x: optionValue_mapSize_x,
        optionValue_mapSize_y: optionValue_mapSize_y,
        optionValue_staircasing: optionValue_staircasing,
        optionValue_whereSupportBlocks: optionValue_whereSupportBlocks,
        optionValue_transparency: optionValue_transparency,
        optionValue_transparencyTolerance: optionValue_transparencyTolerance,
        optionValue_betterColour: optionValue_betterColour,
        optionValue_dithering: optionValue_dithering,
      },
    });
  }

  increasePreviewScale = () => {
    this.setState({
      mapPreviewSizeScale: this.state.mapPreviewSizeScale * 1.2,
    });
  };

  decreasePreviewScale = () => {
    this.setState({
      mapPreviewSizeScale: this.state.mapPreviewSizeScale / 1.2,
    });
  };

  componentWillUnmount() {
    this.mapCanvasWorker.terminate();
  }

  render() {
    const {
      getLocaleString,
      optionValue_mapSize_x, // map size in maps
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_showGridOverlay,
      onFileDialogEvent,
      uploadedImage,
    } = this.props;
    const { mapPreviewSizeScale, workerProgress } = this.state;
    return (
      <div className="section mapPreviewDiv">
        <h2>{getLocaleString("MAP-PREVIEW/TITLE")}</h2>
        <input type="file" className="imgUpload" ref={this.fileInputRef} onChange={onFileDialogEvent} />
        <div>
          <span
            className="gridOverlay"
            style={{
              backgroundImage: `url(${IMG_GridOverlay})`,
              display: optionValue_showGridOverlay ? "block" : "none",
              width: `${(mapPreviewSizeScale * 128 * optionValue_mapSize_x).toString()}px`,
              height: `${(mapPreviewSizeScale * 128 * optionValue_mapSize_y).toString()}px`,
              backgroundSize: `${(mapPreviewSizeScale * 128).toString()}px`,
            }}
          />
          <canvas
            className="mapCanvas"
            width={128 * optionValue_mapSize_x}
            height={128 * optionValue_mapSize_y}
            ref={this.canvasRef_display}
            style={{
              width: `${(mapPreviewSizeScale * 128 * optionValue_mapSize_x).toString()}px`,
              height: `${(mapPreviewSizeScale * 128 * optionValue_mapSize_y).toString()}px`,
            }}
            onClick={() => this.fileInputRef.current.click()}
          />
          <canvas className="displayNone" width={128 * optionValue_mapSize_x} height={128 * optionValue_mapSize_y} ref={this.canvasRef_source}></canvas>
        </div>
        <div className="mapResolutionAndZoom">
          <div>
            <Tooltip tooltipText={getLocaleString("MAP-PREVIEW/BEST-RESOLUTION-TT")}>
              <small>{`${(128 * optionValue_mapSize_x).toString()}x${(128 * optionValue_mapSize_y).toString()}`}</small>
            </Tooltip>{" "}
            <Tooltip tooltipText={getLocaleString("MAP-PREVIEW/ASPECT-RATIO-MISMATCH-TT")}>
              <small
                className="mapResWarning"
                style={{
                  display:
                    uploadedImage === null || uploadedImage.height * optionValue_mapSize_x === uploadedImage.width * optionValue_mapSize_y ? "none" : "inline",
                  color: optionValue_cropImage === CropModes.OFF.uniqueId ? "red" : "orange",
                }}
              >
                {uploadedImage === null ? null : `${uploadedImage.width.toString()}x${uploadedImage.height.toString()}`}
              </small>
            </Tooltip>
          </div>
          <div>
            <Tooltip tooltipText={getLocaleString("MAP-PREVIEW/SCALE-PLUS-TT")}>
              <img
                alt="+"
                className="sizeButton"
                src={IMG_Null}
                style={{
                  backgroundImage: `url(${IMG_Textures})`,
                  backgroundPositionX: "-96px",
                  backgroundPositionY: "-2048px",
                }}
                onClick={this.increasePreviewScale}
              />
            </Tooltip>
            <Tooltip tooltipText={getLocaleString("MAP-PREVIEW/SCALE-MINUS-TT")}>
              <img
                alt="-"
                className="sizeButton"
                src={IMG_Null}
                style={{
                  backgroundImage: `url(${IMG_Textures})`,
                  backgroundPositionX: "-128px",
                  backgroundPositionY: "-2048px",
                }}
                onClick={this.decreasePreviewScale}
              />
            </Tooltip>
          </div>
        </div>
        <div
          className="progress"
          style={
            [0, 1].includes(workerProgress)
              ? {
                  display: "unset",
                  visibility: "hidden",
                }
              : { display: "block" }
          }
        >
          <span className="progressText">{`${Math.floor(workerProgress * 100)}%`}</span>
          <div
            className="progressDiv"
            style={{
              width: `${Math.floor(workerProgress * 100)}%`,
            }}
          />
        </div>
      </div>
    );
  }
}

export default MapPreview;
