import React, { Component, createRef } from "react";

import Tooltip from "../../tooltip";

import StaircaseModes from "../json/staircaseModes.json";

import IMG_Textures from "../../../images/textures.png";

import NBTReader from "../nbtReader";
import Waila from "../viewOnlineCommon/waila";

import "./viewOnline2D.css";

class ViewOnline2D extends Component {
  state = {
    viewOnline_NBT_decompressed: null,
    selectedBlock: null,
    zoomFactor: 1,
    canvasOffset_x: 0,
    canvasOffset_y: 0,
  };

  paletteIdToColourSetIdAndBlockId = [];
  mouse = { x: 0, y: 0, down: false, movedSinceDown: null };

  getNBTDecompressed() {
    const { viewOnline_NBT } = this.props;
    let nbtReader = new NBTReader();
    nbtReader.loadBuffer(viewOnline_NBT);
    const viewOnline_NBT_decompressed = nbtReader.getData();
    return viewOnline_NBT_decompressed;
  }

  drawNBT() {
    const { coloursJSON, optionValue_version, optionValue_mapSize_x, optionValue_mapSize_y, optionValue_staircasing } = this.props;
    const { viewOnline_NBT_decompressed } = this.state;
    const { canvasRef_viewOnline } = this;

    this.paletteIdToColourSetIdAndBlockId = [];
    const NBT_palette = viewOnline_NBT_decompressed.value.palette.value.value;
    for (let paletteItem_index = 0; paletteItem_index < NBT_palette.length; paletteItem_index++) {
      const paletteItem = NBT_palette[paletteItem_index];
      let paletteItemFound = false;
      for (const [colourSetId, colourSet] of Object.entries(coloursJSON)) {
        if (paletteItemFound) {
          break;
        }
        for (const [blockId, block] of Object.entries(colourSet.blocks)) {
          if (paletteItemFound) {
            break;
          }
          if (!(optionValue_version.MCVersion in block.validVersions)) {
            continue;
          }
          let blockNBTData = block.validVersions[optionValue_version.MCVersion];
          if (typeof blockNBTData === "string") {
            // this is of the form eg "&1.12.2"
            blockNBTData = block.validVersions[blockNBTData.slice(1)];
          }
          if (
            paletteItem.Name.value === `minecraft:${blockNBTData.NBTName}` &&
            ((!("Properties" in paletteItem) && Object.keys(blockNBTData.NBTArgs).length === 0) ||
              ("Properties" in paletteItem &&
                Object.keys(paletteItem.Properties.value).length === Object.keys(blockNBTData.NBTArgs).length &&
                Object.entries(blockNBTData.NBTArgs).every(([argKey, argValue]) => {
                  return argKey in paletteItem.Properties.value && argValue === paletteItem.Properties.value[argKey].value;
                })))
          ) {
            this.paletteIdToColourSetIdAndBlockId.push([parseInt(colourSetId), parseInt(blockId)]);
            paletteItemFound = true;
          }
        }
      }
      if (!paletteItemFound) {
        console.log(`Didn't find ${paletteItem.Name.value} in coloursJSON; using placeholder texture`);
        this.paletteIdToColourSetIdAndBlockId.push([64, 2]);
      }
    }

    const img_textures = new Image();
    img_textures.onload = () => {
      const canvasRef_viewOnline_ctx = canvasRef_viewOnline.current.getContext("2d");
      canvasRef_viewOnline_ctx.textAlign = "right";
      canvasRef_viewOnline_ctx.textBaseline = "alphabetic";
      canvasRef_viewOnline_ctx.font = "16px kenpixel_mini_square";
      canvasRef_viewOnline_ctx.fillStyle = "rgba(0, 0, 0, 1)";
      canvasRef_viewOnline_ctx.fillRect(0, 0, 33 * 128 * optionValue_mapSize_x, 33 * (128 * optionValue_mapSize_y + 1));
      let currentY = null;
      let processedNoobline = false;
      for (const block of viewOnline_NBT_decompressed.value.blocks.value.value) {
        const block_paletteId = block.state.value;
        const block_coords = block.pos.value.value;
        if (block_coords[2] === 0) {
          if (processedNoobline) {
            continue;
          } else {
            processedNoobline = true;
            // since we ordered blocks by Z and Y in nbt.jsworker, the first block in the column is the highest block of the
            // noobline pillar (the correct height for the map preview)
          }
        } else {
          processedNoobline = false; // ready for next column
          if (block_paletteId === NBT_palette.length - 1) {
            // last palette entry is support / noobline. don't draw this except on the noobline
            continue;
          }
        }
        const [int_colourSetId, int_blockId] = this.paletteIdToColourSetIdAndBlockId[block_paletteId];
        let int_colourSetId_toDraw, int_blockId_toDraw;
        if (!(int_colourSetId === 64 && int_blockId === 2) && coloursJSON[int_colourSetId.toString()].blocks[int_blockId.toString()].presetIndex === "CUSTOM") {
          // if not placeholder, and is a custom block, then draw colour on canvas
          int_colourSetId_toDraw = 64;
          int_blockId_toDraw = 5;
          canvasRef_viewOnline_ctx.fillStyle = `rgb(${coloursJSON[int_colourSetId.toString()].tonesRGB.normal.join(", ")})`;
          canvasRef_viewOnline_ctx.fillRect(33 * block_coords[0], 33 * block_coords[2], 32, 32);
        } else {
          int_colourSetId_toDraw = int_colourSetId;
          int_blockId_toDraw = int_blockId;
        }
        canvasRef_viewOnline_ctx.drawImage(
          img_textures,
          32 * int_blockId_toDraw,
          32 * int_colourSetId_toDraw,
          32,
          32,
          33 * block_coords[0],
          33 * block_coords[2],
          32,
          32
        );
        if (block_coords[2] !== 0) {
          if (block_coords[1] > currentY) {
            canvasRef_viewOnline_ctx.fillStyle = "rgba(0, 0, 32, 0.2)";
            for (let i = 0; i < 4; i++) {
              canvasRef_viewOnline_ctx.fillRect(33 * block_coords[0], 33 * block_coords[2], 33, -2 * (i + 1));
            }
          } else if (block_coords[1] < currentY) {
            canvasRef_viewOnline_ctx.fillStyle = "rgba(0, 0, 32, 0.2)";
            for (let i = 0; i < 4; i++) {
              canvasRef_viewOnline_ctx.fillRect(33 * block_coords[0], 33 * block_coords[2], 33, 2 * (i + 1));
            }
          }
        }
        currentY = block_coords[1];
        canvasRef_viewOnline_ctx.fillStyle = "rgba(255, 255, 255, 1)";
        if (optionValue_staircasing !== StaircaseModes.OFF.uniqueId) {
          canvasRef_viewOnline_ctx.fillText(block_coords[1], 33 * block_coords[0] + 31, 33 * (block_coords[2] + 1) - 2, 31);
        }
      }
      for (let whichChunk_x = 0; whichChunk_x < 8 * optionValue_mapSize_x; whichChunk_x++) {
        for (let whichChunk_y = -1; whichChunk_y < 8 * optionValue_mapSize_y; whichChunk_y++) {
          canvasRef_viewOnline_ctx.fillStyle = "rgba(255, 0, 0, 1)";
          for (let x = 0; x < 16; x++) {
            for (let y = 0; y < 16; y++) {
              canvasRef_viewOnline_ctx.fillRect(33 * (16 * whichChunk_x + x) + 32, 33 * (16 * whichChunk_y + y + 1), 1, 33);
              canvasRef_viewOnline_ctx.fillRect(33 * (16 * whichChunk_x + x), 33 * (16 * whichChunk_y + y + 1) + 32, 33, 1);
            }
          }
          canvasRef_viewOnline_ctx.fillStyle = "rgba(0, 0, 255, 1)";
          canvasRef_viewOnline_ctx.fillRect(33 * 16 * (whichChunk_x + 1) - 1, 33 * (16 * whichChunk_y + 1), 1, 33 * 16);
          canvasRef_viewOnline_ctx.fillRect(33 * 16 * whichChunk_x, 33 * (16 * (whichChunk_y + 1) + 1) - 1, 33 * 16, 1);
        }
      }
    };
    img_textures.src = IMG_Textures;
  }

  handleScroll_document = function (e) {
    e.preventDefault();
  };

  handleScroll_canvas = function (e) {
    e.preventDefault();
    const zoomMultiplier = 1.1;
    const { offsetX, offsetY } = e;
    const delta = e.wheelDelta ? e.wheelDelta : e.detail ? -e.detail : 0;
    if (delta) {
      this.setState((state) => {
        return {
          zoomFactor: delta > 0 ? state.zoomFactor * zoomMultiplier : state.zoomFactor / zoomMultiplier,
          canvasOffset_x:
            delta > 0 ? state.canvasOffset_x - (zoomMultiplier - 1) * offsetX : state.canvasOffset_x - ((1 - zoomMultiplier) * offsetX) / zoomMultiplier,
          canvasOffset_y:
            delta > 0 ? state.canvasOffset_y - (zoomMultiplier - 1) * offsetY : state.canvasOffset_y - ((1 - zoomMultiplier) * offsetY) / zoomMultiplier,
        };
      });
    }
  }.bind(this);

  handleMouseDown = function (e) {
    e.preventDefault();
    this.mouse.x = parseInt(e.clientX);
    this.mouse.y = parseInt(e.clientY);
    this.mouse.down = true;
    this.mouse.movedSinceDown = false;
    document.addEventListener("mousemove", this.handleMouseMove, { passive: false });
  }.bind(this);

  handleMouseUp = function (e) {
    e.preventDefault();
    this.mouse.down = false;
    if (!this.mouse.movedSinceDown) {
      if (e.target === this.canvasRef_viewOnline.current) {
        const { optionValue_mapSize_x, optionValue_mapSize_y } = this.props;
        const { viewOnline_NBT_decompressed } = this.state;
        const { offsetX, offsetY } = e;
        const canvas_width = e.target.clientWidth;
        const canvas_height = e.target.clientHeight;
        const block_x = Math.floor((offsetX * 128 * optionValue_mapSize_x) / canvas_width);
        const block_z = Math.floor((offsetY * (128 * optionValue_mapSize_y + 1)) / canvas_height);
        for (const block of viewOnline_NBT_decompressed.value.blocks.value.value) {
          const block_coords = block.pos.value.value;
          if (block_coords[0] === block_x && block_coords[2] === block_z) {
            const block_paletteId = block.state.value;
            const [selectedBlock_colourSetId, selectedBlock_blockId] = this.paletteIdToColourSetIdAndBlockId[block_paletteId];
            this.setState({
              selectedBlock: {
                x: block_coords[0],
                y: block_coords[1],
                z: block_coords[2],
                colourSetId: selectedBlock_colourSetId,
                blockId: selectedBlock_blockId,
              },
            });
            break;
          }
        }
      }
    }
    document.removeEventListener("mousemove", this.handleMouseMove, { passive: false });
  }.bind(this);

  handleMouseMove = function (e) {
    e.preventDefault();
    if (!this.mouse.down) {
      return;
    }
    const mouseMoved_x = parseInt(e.clientX - this.mouse.x);
    const mouseMoved_y = parseInt(e.clientY - this.mouse.y);

    if (Math.abs(mouseMoved_x) > 1 || Math.abs(mouseMoved_y) > 1) {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.movedSinceDown = true;
    }

    this.setState((state) => {
      return { canvasOffset_x: state.canvasOffset_x + mouseMoved_x, canvasOffset_y: state.canvasOffset_y + mouseMoved_y };
    });
  }.bind(this);

  constructor(props) {
    super(props);
    this.canvasRef_viewOnline = createRef();
  }

  componentDidMount() {
    const viewOnline_NBT_decompressed = this.getNBTDecompressed();

    this.setState({ viewOnline_NBT_decompressed }, () => {
      this.drawNBT();
      document.addEventListener("DOMMouseScroll", this.handleScroll_canvas, { passive: false });
      this.canvasRef_viewOnline.current.addEventListener("mousewheel", this.handleScroll_canvas, { passive: false });
      document.addEventListener("mousewheel", this.handleScroll_document, { passive: false });
      document.addEventListener("mousedown", this.handleMouseDown, { passive: false });
      document.addEventListener("mouseup", this.handleMouseUp, { passive: false });
    });
  }

  componentWillUnmount() {
    document.removeEventListener("DOMMouseScroll", this.handleScroll_canvas, { passive: false });
    this.canvasRef_viewOnline.current.removeEventListener("mousewheel", this.handleScroll_canvas, { passive: false });
    document.removeEventListener("mousewheel", this.handleScroll_document, { passive: false });
    document.removeEventListener("mousedown", this.handleMouseDown, { passive: false });
    document.removeEventListener("mouseup", this.handleMouseUp, { passive: false });
  }

  render() {
    const { getLocaleString, coloursJSON, optionValue_mapSize_x, optionValue_mapSize_y, onGetViewOnlineNBT, onChooseViewOnline3D } = this.props;
    const { viewOnline_NBT_decompressed, selectedBlock, zoomFactor } = this.state;
    const { canvasOffset_x, canvasOffset_y } = this.state;

    const component_controls = (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <h1 style={{ cursor: "pointer" }} onClick={() => onGetViewOnlineNBT(null)}>
          ❌
        </h1>
        <h1 style={{ cursor: "pointer" }} onClick={onChooseViewOnline3D}>
          3D
        </h1>
      </div>
    );

    let component_waila = null;
    if (selectedBlock !== null) {
      component_waila = <Waila coloursJSON={coloursJSON} getLocaleString={getLocaleString} selectedBlock={selectedBlock} />;
    }

    let component_size = null;
    if (viewOnline_NBT_decompressed !== null) {
      const [size_x, size_y, size_z] = viewOnline_NBT_decompressed.value.size.value.value;
      component_size = (
        <h2 style={{ marginRight: "0.1em" }}>
          {getLocaleString("VIEW-ONLINE/SIZE")}
          {": "}
          {size_x.toString()}
          {"x"}
          {size_y > 256 ? (
            <Tooltip
              tooltipText={getLocaleString("VIEW-ONLINE/TOO-BIG-FOR-SINGLE")}
              textStyleOverrides={{
                right: 0,
                backgroundColor: "orange",
              }}
            >
              <b style={{ color: "orange" }}>{size_y.toString()}</b>
            </Tooltip>
          ) : (
            size_y.toString()
          )}
          {"x"}
          {size_z.toString()}
        </h2>
      );
    }

    const component_topBar = (
      <div className="topBar">
        {component_controls}
        {component_waila}
        {component_size}
      </div>
    );

    return (
      <div className={"viewOnline2DContainer"}>
        {component_topBar}
        <canvas
          width={33 * 128 * optionValue_mapSize_x}
          height={33 * (128 * optionValue_mapSize_y + 1)}
          ref={this.canvasRef_viewOnline}
          style={{
            width: `${33 * 128 * optionValue_mapSize_x * zoomFactor}px`,
            height: `${33 * (128 * optionValue_mapSize_y + 1) * zoomFactor}px`,
            position: "relative",
            left: canvasOffset_x,
            top: canvasOffset_y,
          }}
        />
      </div>
    );
  }
}

export default ViewOnline2D;
