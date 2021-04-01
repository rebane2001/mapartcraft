import React, { Component } from "react";

import "./mapPreview.css";
// import Canvas from "./canvas"

class MapPreview extends Component {
  state = {
    mapPreviewSizeScale: 1,
    uploadedImage_width: 0,
    uploadedImage_height: 0,
    imageUploaded: false,
  };

  chooseFile = (e) => {};

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

  componentDidUpdate() {
    if (!this.state.imageUploaded) {
      // check if default upload.png present
    }
  }

  render() {
    const {
      getLocaleString,
      optionValue_mapSize_x, // map size in maps
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_showGridOverlay,
    } = this.props;
    const {
      mapPreviewSizeScale,
      uploadedImage_width,
      uploadedImage_height,
      imageUploaded,
    } = this.state;
    return (
      <div className="section mapImage">
        <h2>{getLocaleString("MAPPREVIEWTITLE")}</h2>
        <input type="file" className="imgUpload" />
        <br />
        <div>
          <span
            className="gridOverlay"
            style={{
              backgroundImage: 'url("./images/gridOverlay.png")',
              display: optionValue_showGridOverlay ? "block" : "none",
              width:
                (mapPreviewSizeScale * 256 * optionValue_mapSize_x).toString() +
                "px",
              height:
                (mapPreviewSizeScale * 256 * optionValue_mapSize_y).toString() +
                "px",
              backgroundSize: (mapPreviewSizeScale * 256).toString() + "px",
            }}
          />
          {/* <Canvas></Canvas> */}
          <canvas
            width="128"
            height="128"
            className="mainCanvas"
            // ref="mainCanvas"
            onClick={this.chooseFile}
            style={{
              width:
                (mapPreviewSizeScale * 256 * optionValue_mapSize_x).toString() +
                "px",
              height:
                (mapPreviewSizeScale * 256 * optionValue_mapSize_y).toString() +
                "px",
            }}
          />
          <br />
        </div>
        <small
          data-tooltip
          data-title={getLocaleString("MAPPREVIEW-TT-BESTRES")}
        >
          {(128 * optionValue_mapSize_x).toString() +
            "x" +
            (128 * optionValue_mapSize_y).toString()}
        </small>{" "}
        <small
          data-tooltip
          data-title={getLocaleString("MAPPREVIEW-TT-DOESNTMATCH")}
          className="mapResWarning"
          style={{
            display:
              !imageUploaded ||
              uploadedImage_height * optionValue_mapSize_x ===
                uploadedImage_width * optionValue_mapSize_y
                ? "none"
                : "inline",
            color: optionValue_cropImage ? "orange" : "red",
          }}
        >
          {uploadedImage_width.toString() +
            "x" +
            uploadedImage_height.toString()}
        </small>
        <img
          alt="+"
          className="sizeButton"
          src="./images/plus.png"
          onClick={this.increasePreviewScale}
          data-tooltip
          data-title={getLocaleString("MAPPREVIEW-TT-PREVPLUS")}
        />
        <img
          alt="-"
          className="sizeButton"
          src="./images/minus.png"
          onClick={this.decreasePreviewScale}
          data-tooltip
          data-title={getLocaleString("MAPPREVIEW-TT-PREVMINUS")}
        />
        <div className="progress">
          <span className="progressText"></span>
          <div className="progressDiv"></div>
        </div>
      </div>
    );
  }
}

export default MapPreview;
