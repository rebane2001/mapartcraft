import React, { Component, createRef } from "react";

import coloursJSON from "./coloursJSON.json";
import DitherMethods from "./ditherMethods.json";
import Tooltip from "../tooltip";
import MapCanvasWorker from "./mapCanvasWorker.jsworker"; // FINALLY got this to work; .js gets imported as code, anything else as URL

import IMG_Plus from "../../images/plus.png";
import IMG_Minus from "../../images/minus.png";
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
      prevProps.optionValue_mapSize_x === newProps.optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y === newProps.optionValue_mapSize_y,
      prevProps.optionValue_cropImage === newProps.optionValue_cropImage,
      prevProps.optionValue_preprocessingEnabled ===
        newProps.optionValue_preprocessingEnabled,
      prevProps.preProcessingValue_brightness ===
        newProps.preProcessingValue_brightness,
      prevProps.preProcessingValue_contrast ===
        newProps.preProcessingValue_contrast,
      prevProps.preProcessingValue_saturation ===
        newProps.preProcessingValue_saturation,
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
      prevProps.selectedBlocks === newProps.selectedBlocks,
      prevProps.optionValue_modeNBTOrMapdat ===
        newProps.optionValue_modeNBTOrMapdat,
      prevProps.optionValue_mapSize_x === newProps.optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y === newProps.optionValue_mapSize_y,
      prevProps.optionValue_cropImage === newProps.optionValue_cropImage,
      prevProps.optionValue_staircasing === newProps.optionValue_staircasing,
      prevProps.optionValue_whereSupportBlocks ===
        newProps.optionValue_whereSupportBlocks,
      prevProps.optionValue_unobtainable === newProps.optionValue_unobtainable,
      prevProps.optionValue_transparency === newProps.optionValue_transparency,
      prevProps.optionValue_betterColour === newProps.optionValue_betterColour,
      prevProps.optionValue_dithering === newProps.optionValue_dithering,
      prevProps.optionValue_preprocessingEnabled ===
        newProps.optionValue_preprocessingEnabled,
      prevProps.preProcessingValue_brightness ===
        newProps.preProcessingValue_brightness,
      prevProps.preProcessingValue_contrast ===
        newProps.preProcessingValue_contrast,
      prevProps.preProcessingValue_saturation ===
        newProps.preProcessingValue_saturation,
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
    if (
      this.shouldCanvasUpdate_source(
        prevProps,
        this.props,
        prevState,
        this.state
      )
    ) {
      this.updateCanvas_source(); // draw uploaded image on source canvas
    }
    if (
      this.shouldCanvasUpdate_display(
        prevProps,
        this.props,
        prevState,
        this.state
      )
    ) {
      this.updateCanvas_display(); // draw pixelart of image on display canvas
    }
  }

  updateCanvas_source() {
    const {
      optionValue_preprocessingEnabled,
      preProcessingValue_brightness,
      preProcessingValue_contrast,
      preProcessingValue_saturation,
      uploadedImage,
    } = this.props;
    const {
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
    } = this.props;
    const { canvasRef_source } = this;
    const ctx_source = canvasRef_source.current.getContext("2d");
    ctx_source.clearRect(
      0,
      0,
      ctx_source.canvas.width,
      ctx_source.canvas.height
    );
    if (optionValue_preprocessingEnabled) {
      ctx_source.filter = `brightness(${preProcessingValue_brightness}%) contrast(${preProcessingValue_contrast}%) saturate(${preProcessingValue_saturation}%)`;
    } else {
      ctx_source.filter = "none";
    }
    if (optionValue_cropImage) {
      const img_width = uploadedImage.width;
      const img_height = uploadedImage.height;
      let samplingWidth;
      let samplingHeight;
      let xOffset;
      let yOffset;
      if (
        img_width * optionValue_mapSize_y >
        img_height * optionValue_mapSize_x
      ) {
        samplingWidth = Math.floor(
          (img_height * optionValue_mapSize_x) / optionValue_mapSize_y
        );
        samplingHeight = img_height;
        xOffset = Math.floor((img_width - samplingWidth) / 2);
        yOffset = 0;
      } else {
        samplingWidth = img_width;
        samplingHeight = Math.floor(
          (img_width * optionValue_mapSize_y) / optionValue_mapSize_x
        );
        xOffset = 0;
        yOffset = Math.floor((img_height - samplingHeight) / 2);
      }
      ctx_source.drawImage(
        uploadedImage,
        xOffset,
        yOffset,
        samplingWidth,
        samplingHeight,
        0,
        0,
        ctx_source.canvas.width,
        ctx_source.canvas.height
      );
    } else {
      ctx_source.drawImage(
        uploadedImage,
        0,
        0,
        ctx_source.canvas.width,
        ctx_source.canvas.height
      );
    }
  }

  updateCanvas_display() {
    this.mapCanvasWorker.terminate();
    const { canvasRef_source, canvasRef_display } = this;
    const {
      selectedBlocks,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_unobtainable,
      optionValue_transparency,
      optionValue_betterColour,
      optionValue_dithering,
      onGetMapMaterials,
    } = this.props;
    const ctx_source = canvasRef_source.current.getContext("2d");
    const canvasImageData = ctx_source.getImageData(
      0,
      0,
      ctx_source.canvas.width,
      ctx_source.canvas.height
    );
    const t0 = performance.now();
    this.mapCanvasWorker = new Worker(MapCanvasWorker);
    this.mapCanvasWorker.onmessage = (e) => {
      if (e.data.head === "PIXELS_MATERIALS_CURRENTSELECTEDBLOCKS") {
        const t1 = performance.now();
        console.log(
          `Calculated map preview data in ${(t1 - t0).toString()}ms`
        );
        const ctx_display = canvasRef_display.current.getContext("2d");
        ctx_display.putImageData(e.data.body.pixels, 0, 0);
        this.setState({ workerProgress: 1 });
        onGetMapMaterials({
          materials: e.data.body.materials,
          supportBlockCount: e.data.body.supportBlockCount,
          currentSelectedBlocks: e.data.body.currentSelectedBlocks,
        });
      } else if (e.data.head === "PROGRESS_REPORT") {
        this.setState({ workerProgress: e.data.body });
      }
    };
    this.mapCanvasWorker.postMessage({
      head: "PIXELS",
      body: {
        coloursJSON: coloursJSON,
        DitherMethods: DitherMethods,
        canvasImageData: canvasImageData,
        selectedBlocks: selectedBlocks,
        optionValue_modeNBTOrMapdat: optionValue_modeNBTOrMapdat,
        optionValue_mapSize_x: optionValue_mapSize_x,
        optionValue_mapSize_y: optionValue_mapSize_y,
        optionValue_staircasing: optionValue_staircasing,
        optionValue_whereSupportBlocks: optionValue_whereSupportBlocks,
        optionValue_unobtainable: optionValue_unobtainable,
        optionValue_transparency: optionValue_transparency,
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
        <h2>{getLocaleString("MAPPREVIEWTITLE")}</h2>
        <input
          type="file"
          className="imgUpload"
          ref={this.fileInputRef}
          onChange={onFileDialogEvent}
        />
        <div>
          <span
            className="gridOverlay"
            style={{
              backgroundImage: `url(${IMG_GridOverlay})`,
              display: optionValue_showGridOverlay ? "block" : "none",
              width:
                (mapPreviewSizeScale * 128 * optionValue_mapSize_x).toString() +
                "px",
              height:
                (mapPreviewSizeScale * 128 * optionValue_mapSize_y).toString() +
                "px",
              backgroundSize: (mapPreviewSizeScale * 128).toString() + "px",
            }}
          />
          <canvas
            className="mapCanvas"
            width={128 * optionValue_mapSize_x}
            height={128 * optionValue_mapSize_y}
            ref={this.canvasRef_display}
            style={{
              width:
                (mapPreviewSizeScale * 128 * optionValue_mapSize_x).toString() +
                "px",
              height:
                (mapPreviewSizeScale * 128 * optionValue_mapSize_y).toString() +
                "px",
            }}
            onClick={() => this.fileInputRef.current.click()}
          />
          <canvas
            className="displayNone"
            width={128 * optionValue_mapSize_x}
            height={128 * optionValue_mapSize_y}
            ref={this.canvasRef_source}
          ></canvas>
        </div>
        <div className="mapResolutionAndZoom">
          <div>
            <Tooltip tooltipText={getLocaleString("MAPPREVIEW-TT-BESTRES")}>
              <small>
                {(128 * optionValue_mapSize_x).toString() +
                  "x" +
                  (128 * optionValue_mapSize_y).toString()}
              </small>
            </Tooltip>{" "}
            <Tooltip tooltipText={getLocaleString("MAPPREVIEW-TT-DOESNTMATCH")}>
              <small
                className="mapResWarning"
                style={{
                  display:
                    uploadedImage === null ||
                    uploadedImage.height * optionValue_mapSize_x ===
                      uploadedImage.width * optionValue_mapSize_y
                      ? "none"
                      : "inline",
                  color: optionValue_cropImage ? "orange" : "red",
                }}
              >
                {uploadedImage === null
                  ? null
                  : uploadedImage.width.toString() +
                    "x" +
                    uploadedImage.height.toString()}
              </small>
            </Tooltip>
          </div>
          <div>
            <Tooltip tooltipText={getLocaleString("MAPPREVIEW-TT-PREVPLUS")}>
              <img
                alt="+"
                className="sizeButton"
                src={IMG_Plus}
                onClick={this.increasePreviewScale}
              />
            </Tooltip>
            <Tooltip tooltipText={getLocaleString("MAPPREVIEW-TT-PREVMINUS")}>
              <img
                alt="-"
                className="sizeButton"
                src={IMG_Minus}
                onClick={this.decreasePreviewScale}
              />
            </Tooltip>
          </div>
        </div>
        <div
          className="progress"
          style={{
            display: [0, 1].includes(workerProgress) ? "none" : "block",
          }}
        >
          <span className="progressText">
            {`${Math.floor(workerProgress * 100)}%`}
          </span>
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
