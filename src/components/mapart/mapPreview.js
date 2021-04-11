import React, { Component, createRef } from "react";

import coloursJSON from "./SAOColoursList.json";
import DitherMethods from "./Const_DitherMethods";

import "./mapPreview.css";

class MapPreview extends Component {
  state = {
    mapPreviewSizeScale: 2.4,
  };

  constructor(props) {
    super(props);
    this.canvasRef = createRef();
    this.fileInputRef = createRef();
  }

  // document.getElementById('displaycanvas').addEventListener('drop', loadImg);
  // document.getElementById('imgupload').addEventListener('change', loadImg);
  // document.addEventListener('paste', loadImg);
  // let files = (e.type == 'change') ? e.target.files : ((e.type == 'drop') ? e.dataTransfer.files : e.clipboardData.files);

  shouldMapPreviewCanvasUpdate(prevProps, newProps) {
    // ugly but useful method to determine whether map canvas contents should be redrawn on component update
    const propChanges = [
      prevProps.selectedBlocks === newProps.selectedBlocks,
      prevProps.optionValue_modeNBTOrMapdat ===
        newProps.optionValue_modeNBTOrMapdat,
      prevProps.optionValue_mapSize_x === newProps.optionValue_mapSize_x,
      prevProps.optionValue_mapSize_y === newProps.optionValue_mapSize_y,
      prevProps.optionValue_cropImage === newProps.optionValue_cropImage,
      prevProps.optionValue_staircasing === newProps.optionValue_staircasing,
      prevProps.optionValue_unobtainable === newProps.optionValue_unobtainable,
      prevProps.optionValue_transparency === newProps.optionValue_transparency,
      prevProps.optionValue_betterColour === newProps.optionValue_betterColour,
      prevProps.optionValue_dithering === newProps.optionValue_dithering,
      prevProps.uploadedImage === newProps.uploadedImage,
    ];
    return !propChanges.every((elt) => {
      return elt === true;
    });
  }

  componentDidUpdate(prevProps) {
    const { uploadedImage } = this.props;
    if (
      uploadedImage !== null &&
      this.shouldMapPreviewCanvasUpdate(prevProps, this.props)
    ) {
      this.drawUploadedImage(); // reset canvas to uploaded image
      this.drawMapPreviewCanvasData(); // now get pixelart of image
    }
  }

  drawUploadedImage() {
    const { uploadedImage } = this.props;
    const {
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
    } = this.props;
    const { canvasRef } = this;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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
      ctx.drawImage(
        uploadedImage,
        xOffset,
        yOffset,
        samplingWidth,
        samplingHeight,
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      );
    } else {
      ctx.drawImage(uploadedImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  drawMapPreviewCanvasData() {
    const { canvasRef } = this;
    const {
      selectedBlocks,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_staircasing,
      optionValue_unobtainable,
      optionValue_transparency,
      optionValue_betterColour,
      optionValue_dithering,
    } = this.props;
    const ctx = canvasRef.current.getContext("2d");
    const canvasImageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
    let t0 = performance.now();
    let data;
    // for (let i = 0; i < 100; i++) {
    data = this.getMapPreviewCanvasData(
      canvasImageData,
      selectedBlocks,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_staircasing,
      optionValue_unobtainable,
      optionValue_transparency,
      optionValue_betterColour,
      optionValue_dithering
    );
    // }
    let t1 = performance.now();
    console.log(
      "Calculated map preview data in " + (t1 - t0).toString() + "ms"
    );
    ctx.putImageData(data, 0, 0);
  }

  getMapPreviewCanvasData(
    canvasImageData,
    selectedBlocks,
    optionValue_modeNBTOrMapdat,
    optionValue_mapSize_x,
    optionValue_mapSize_y,
    optionValue_staircasing,
    optionValue_unobtainable,
    optionValue_transparency,
    optionValue_betterColour,
    optionValue_dithering
  ) {
    let colourSetsToUse = []; // colourSetIds and shades to use in map
    let colorCache = new Map(); // cache for reusing colours in identical pixels
    let labCache = new Map();
    let returnCanvasImageDataArray = new Uint8ClampedArray(
      128 * 128 * 4 * optionValue_mapSize_x * optionValue_mapSize_y
    );

    // rgb2lab conversion based on the one from redstonehelper's program
    function rgb2lab(rgb) {
      let val = (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
      if (labCache.has(val)) return labCache.get(val);

      let r1 = rgb[0] / 255.0;
      let g1 = rgb[1] / 255.0;
      let b1 = rgb[2] / 255.0;

      r1 = 0.04045 >= r1 ? (r1 /= 12.0) : Math.pow((r1 + 0.055) / 1.055, 2.4);
      g1 = 0.04045 >= g1 ? (g1 /= 12.0) : Math.pow((g1 + 0.055) / 1.055, 2.4);
      b1 = 0.04045 >= b1 ? (b1 /= 12.0) : Math.pow((b1 + 0.055) / 1.055, 2.4);
      let f = (0.43605202 * r1 + 0.3850816 * g1 + 0.14308742 * b1) / 0.964221,
        h = 0.22249159 * r1 + 0.71688604 * g1 + 0.060621485 * b1,
        k = (0.013929122 * r1 + 0.097097 * g1 + 0.7141855 * b1) / 0.825211,
        l =
          0.008856452 < h ? Math.pow(h, 1 / 3) : (903.2963 * h + 16.0) / 116.0,
        m =
          500.0 *
          ((0.008856452 < f
            ? Math.pow(f, 1 / 3)
            : (903.2963 * f + 16.0) / 116.0) -
            l),
        n =
          200.0 *
          (l -
            (0.008856452 < k
              ? Math.pow(k, 1 / 3)
              : (903.2963 * k + 16.0) / 116.0));

      rgb = [2.55 * (116.0 * l - 16.0) + 0.5, m + 0.5, n + 0.5];
      labCache.set(val, rgb);
      return rgb;
    }

    function squaredEuclideanMetricColours(pixel1, pixel2) {
      if (optionValue_betterColour) {
        //return deltaE(rgb2lab(pixel1),rgb2lab(pixel2))
        pixel1 = rgb2lab(pixel1);
        pixel2 = rgb2lab(pixel2);
      }
      const r = pixel1[0] - pixel2[0];
      const g = pixel1[1] - pixel2[1];
      const b = pixel1[2] - pixel2[2];
      return r * r + g * g + b * b; // actually L*a*b* if optionValue_betterColour but metric is calculated the same
    }

    function findClosestColourSetsRGBTo(pixel) {
      let RGBBinary = (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]; // injective mapping RGB to concatenated binaries
      if (colorCache.has(RGBBinary)) {
        return colorCache.get(RGBBinary);
      } else {
        let shortestDistance = 9999999;
        let newPixel = pixel;

        colourSetsToUse.forEach((colourSet) => {
          Object.keys(colourSet.tonesRGB).forEach((toneKey) => {
            const toneRGB = colourSet.tonesRGB[toneKey];
            let squareDistance = squaredEuclideanMetricColours(toneRGB, pixel);
            if (squareDistance < shortestDistance) {
              shortestDistance = squareDistance;
              newPixel = toneRGB;
            }
          });
        });
        colorCache.set(RGBBinary, newPixel);
        return newPixel;
      }
    }

    function findClosest2ColourSetsRGBTo(pixel) {
      let RGBBinary = (pixel[0] << 16) + (pixel[1] << 8) + pixel[2];
      if (colorCache.has(RGBBinary)) {
        return colorCache.get(RGBBinary);
      } else {
        let shortestDistance1 = 9999999;
        let shortestDistance2 = 9999999;
        let newPixel1 = pixel; // best colour
        let newPixel2 = pixel; // second best colour

        colourSetsToUse.forEach((colourSet) => {
          Object.keys(colourSet.tonesRGB).forEach((toneKey) => {
            const toneRGB = colourSet.tonesRGB[toneKey];
            let squareDistance = squaredEuclideanMetricColours(toneRGB, pixel);
            if (squareDistance < shortestDistance1) {
              shortestDistance1 = squareDistance;
              newPixel1 = toneRGB;
            }
            if (squareDistance < shortestDistance2 && newPixel1 !== toneRGB) {
              shortestDistance2 = squareDistance;
              newPixel2 = toneRGB;
            }
          });
        });
        if (
          squaredEuclideanMetricColours(newPixel1, newPixel2) <=
          shortestDistance2
        ) {
          newPixel2 = newPixel1; // if newPixel1 is a better fit to newPixel2 than newPixel2 is to the actual pixel
        }
        let newPixels = [
          shortestDistance1,
          shortestDistance2,
          newPixel1,
          newPixel2,
        ];
        colorCache.set(RGBBinary, newPixels);
        return newPixels;
      }
    }

    function getColourSetsToUse() {
      let colourSetIdsToUse = []; // get selected colour sets
      Object.keys(selectedBlocks).forEach((key) => {
        if (selectedBlocks[key] !== "-1") {
          colourSetIdsToUse.push(key);
        }
      });

      // now get appropriate shades
      if (optionValue_staircasing === "off") {
        colourSetIdsToUse.forEach((colourSetId) => {
          colourSetsToUse.push({
            colourSetId: colourSetId,
            tonesRGB: {
              normal: coloursJSON[colourSetId]["tonesRGB"]["normal"],
            },
          });
        });
      } else if (
        optionValue_modeNBTOrMapdat === "NBT" ||
        !optionValue_unobtainable
      ) {
        colourSetIdsToUse.forEach((colourSetId) => {
          colourSetsToUse.push({
            colourSetId: colourSetId,
            tonesRGB: {
              dark: coloursJSON[colourSetId]["tonesRGB"]["dark"],
              normal: coloursJSON[colourSetId]["tonesRGB"]["normal"],
              light: coloursJSON[colourSetId]["tonesRGB"]["light"],
            },
          });
        });
      } else {
        colourSetIdsToUse.forEach((colourSetId) => {
          colourSetsToUse.push({
            colourSetId: colourSetId,
            tonesRGB: {
              ...coloursJSON[colourSetId]["tonesRGB"],
            },
          });
        });
      }
    }

    function getMapartImageData() {
      const multimapWidth = optionValue_mapSize_x * 128;
      let ditherMatrix;
      let divisor;
      const chosenDitherMethod =
        DitherMethods[
          Object.keys(DitherMethods).find(
            (ditherMethodKey) =>
              DitherMethods[ditherMethodKey].uniqueId === optionValue_dithering
          )
        ];
      if (chosenDitherMethod.uniqueId !== DitherMethods.None.uniqueId) {
        ditherMatrix = chosenDitherMethod.ditherMatrix;
      }
      if (
        [
          DitherMethods.FloydSteinberg.uniqueId,
          DitherMethods.MinAvgErr.uniqueId,
          DitherMethods.Burkes.uniqueId,
          DitherMethods.SierraLite.uniqueId,
          DitherMethods.Stucki.uniqueId,
          DitherMethods.Atkinson.uniqueId,
        ].includes(chosenDitherMethod.uniqueId)
      ) {
        divisor = chosenDitherMethod.ditherDivisor;
      }
      for (let i = 0; i < canvasImageData.data.length; i += 4) {
        const indexR = i;
        const indexG = i + 1;
        const indexB = i + 2;
        const indexA = i + 3;
        if (
          optionValue_modeNBTOrMapdat === "Mapdat" &&
          optionValue_transparency &&
          canvasImageData.data[indexA] < 128
        ) {
          returnCanvasImageDataArray[indexR] = 0;
          returnCanvasImageDataArray[indexG] = 0;
          returnCanvasImageDataArray[indexB] = 0;
          returnCanvasImageDataArray[indexA] = 0;
          continue;
        } else {
          returnCanvasImageDataArray[indexA] = 255; // full opacity
        }

        const multimap_x = (i / 4) % multimapWidth;
        const multimap_y = (i / 4 - multimap_x) / multimapWidth;
        if (multimap_x === 0) {
          // postMessage({
          //   messageType: "progressReport",
          //   messageData: multimap_y / (optionValue_mapSize_y * 128),
          // });
        }
        const oldPixel = [
          canvasImageData.data[indexR],
          canvasImageData.data[indexG],
          canvasImageData.data[indexB],
        ];
        let newPixel;
        switch (chosenDitherMethod.uniqueId) {
          // Switch statement that checks the dither method every pixel;
          // I have tested a refactor that only checks once however the time difference is negligible and code quality deteriorates
          case DitherMethods.None.uniqueId:
            let closestPixel = findClosestColourSetsRGBTo(oldPixel);
            returnCanvasImageDataArray[indexR] = closestPixel[0];
            returnCanvasImageDataArray[indexG] = closestPixel[1];
            returnCanvasImageDataArray[indexB] = closestPixel[2];
            break;
          case DitherMethods.Bayer44.uniqueId:
          case DitherMethods.Bayer22.uniqueId:
          case DitherMethods.Ordered33.uniqueId:
            const newPixels = findClosest2ColourSetsRGBTo(oldPixel);
            // newPixels = [shortestDistance1, shortestDistance2, newPixel1, newPixel2]
            if (
              (newPixels[0] *
                (ditherMatrix[0].length * ditherMatrix.length + 1)) /
                newPixels[1] >
              ditherMatrix[multimap_x % ditherMatrix[0].length][
                multimap_y % ditherMatrix.length
              ]
            ) {
              newPixel = newPixels[3];
            } else {
              newPixel = newPixels[2];
            }
            returnCanvasImageDataArray[indexR] = newPixel[0];
            returnCanvasImageDataArray[indexG] = newPixel[1];
            returnCanvasImageDataArray[indexB] = newPixel[2];
            break;
          //Error diffusion algorithms
          case DitherMethods.FloydSteinberg.uniqueId:
          case DitherMethods.MinAvgErr.uniqueId:
          case DitherMethods.Burkes.uniqueId:
          case DitherMethods.SierraLite.uniqueId:
          case DitherMethods.Stucki.uniqueId:
          case DitherMethods.Atkinson.uniqueId:
            returnCanvasImageDataArray = canvasImageData.data;
            newPixel = findClosestColourSetsRGBTo(oldPixel);
            const quant_error = [
              oldPixel[0] - newPixel[0],
              oldPixel[1] - newPixel[1],
              oldPixel[2] - newPixel[2],
            ];
            returnCanvasImageDataArray[indexR] = newPixel[0];
            returnCanvasImageDataArray[indexG] = newPixel[1];
            returnCanvasImageDataArray[indexB] = newPixel[2];

            try {
              // ditherMatrix [0][0...2] should always be zero, and can thus be skipped
              if (multimap_x + 1 < multimapWidth) {
                // Make sure to not carry over error from one side to the other
                const weight = ditherMatrix[0][3] / divisor; // 1 right
                returnCanvasImageDataArray[i + 4] += quant_error[0] * weight;
                returnCanvasImageDataArray[i + 5] += quant_error[1] * weight;
                returnCanvasImageDataArray[i + 6] += quant_error[2] * weight;
                if (multimap_x + 2 < multimapWidth) {
                  const weight = ditherMatrix[0][4] / divisor; // 2 right
                  returnCanvasImageDataArray[i + 8] += quant_error[0] * weight;
                  returnCanvasImageDataArray[i + 9] += quant_error[1] * weight;
                  returnCanvasImageDataArray[i + 10] += quant_error[2] * weight;
                }
              }

              // First row below
              if (multimap_x > 0) {
                // Order reversed, to allow nesting of 'if' blocks
                const weight = ditherMatrix[1][1] / divisor; // 1 down, 1 left
                returnCanvasImageDataArray[i + multimapWidth * 4 - 4] +=
                  quant_error[0] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 4 - 3] +=
                  quant_error[1] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 4 - 2] +=
                  quant_error[2] * weight;
                if (multimap_x > 1) {
                  const weight = ditherMatrix[1][0] / divisor; // 1 down, 2 left
                  returnCanvasImageDataArray[i + multimapWidth * 4 - 8] +=
                    quant_error[0] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 4 - 7] +=
                    quant_error[1] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 4 - 6] +=
                    quant_error[2] * weight;
                }
              }
              let weight = ditherMatrix[1][2] / divisor; // 1 down
              returnCanvasImageDataArray[i + multimapWidth * 4 + 0] +=
                quant_error[0] * weight;
              returnCanvasImageDataArray[i + multimapWidth * 4 + 1] +=
                quant_error[1] * weight;
              returnCanvasImageDataArray[i + multimapWidth * 4 + 2] +=
                quant_error[2] * weight;
              if (multimap_x + 1 < multimapWidth) {
                const weight = ditherMatrix[1][3] / divisor; // 1 down, 1 right
                returnCanvasImageDataArray[i + multimapWidth * 4 + 4] +=
                  quant_error[0] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 4 + 5] +=
                  quant_error[1] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 4 + 6] +=
                  quant_error[2] * weight;
                if (multimap_x + 2 < multimapWidth) {
                  const weight = ditherMatrix[1][4] / divisor; // 1 down, 2 right
                  returnCanvasImageDataArray[i + multimapWidth * 4 + 8] +=
                    quant_error[0] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 4 + 9] +=
                    quant_error[1] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 4 + 10] +=
                    quant_error[2] * weight;
                }
              }

              // Second row below
              if (multimap_x > 0) {
                const weight = ditherMatrix[2][1] / divisor; // 2 down, 1 left
                returnCanvasImageDataArray[i + multimapWidth * 8 - 4] +=
                  quant_error[0] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 8 - 3] +=
                  quant_error[1] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 8 - 2] +=
                  quant_error[2] * weight;
                if (multimap_x > 1) {
                  const weight = ditherMatrix[2][0] / divisor; // 2 down, 2 left
                  returnCanvasImageDataArray[i + multimapWidth * 8 - 8] +=
                    quant_error[0] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 8 - 7] +=
                    quant_error[1] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 8 - 6] +=
                    quant_error[2] * weight;
                }
              }
              weight = ditherMatrix[2][2] / divisor; // 2 down
              returnCanvasImageDataArray[i + multimapWidth * 8 + 0] +=
                quant_error[0] * weight;
              returnCanvasImageDataArray[i + multimapWidth * 8 + 1] +=
                quant_error[1] * weight;
              returnCanvasImageDataArray[i + multimapWidth * 8 + 2] +=
                quant_error[2] * weight;
              if (multimap_x + 1 < multimapWidth) {
                const weight = ditherMatrix[2][3] / divisor; // 2 down, 1 right
                returnCanvasImageDataArray[i + multimapWidth * 8 + 4] +=
                  quant_error[0] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 8 + 5] +=
                  quant_error[1] * weight;
                returnCanvasImageDataArray[i + multimapWidth * 8 + 6] +=
                  quant_error[2] * weight;
                if (multimap_x + 2 < multimapWidth) {
                  const weight = ditherMatrix[2][4] / divisor; // 2 down, 2 right
                  returnCanvasImageDataArray[i + multimapWidth * 8 + 8] +=
                    quant_error[0] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 8 + 9] +=
                    quant_error[1] * weight;
                  returnCanvasImageDataArray[i + multimapWidth * 8 + 10] +=
                    quant_error[2] * weight;
                }
              }
            } catch (e) {
              console.log(e);
              // Chrome doesn't seem to mind assigning values to undefined pixels via +=, catch is here 1) for other browsers, and 2) something to do with clamped arrays or debugging???
            }
            break;
          default:
            break;
        }
      }
      return new ImageData(returnCanvasImageDataArray, multimapWidth);
    }

    getColourSetsToUse();
    if (colourSetsToUse.length !== 0) {
      return getMapartImageData();
    } else {
      return canvasImageData;
    }
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
    const { mapPreviewSizeScale } = this.state;
    return (
      <div className="section mapImage">
        <h2>{getLocaleString("MAPPREVIEWTITLE")}</h2>
        <input
          type="file"
          className="imgUpload"
          ref={this.fileInputRef}
          onChange={onFileDialogEvent}
        />
        <br />
        <div>
          <span
            className="gridOverlay"
            style={{
              backgroundImage: 'url("./images/gridOverlay.png")',
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
            ref={this.canvasRef}
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
