import React, { Component, createRef } from "react";

import Tooltip from "../../tooltip";

import IMG_Textures from "../../../images/textures.png";

import NBTReader from "../nbtReader";
import Waila from "../viewOnlineCommon/waila";

import * as THREE from "three";
import { PointerLockControls } from "./pointerLockControls";

import "./viewOnline3D.css";

class BlockWorld {
  faces = [
    {
      // left
      uvRow: 0,
      dir: [-1, 0, 0],
      vertices: [
        { pos: [0, 1, 0], uv: [0, 1] },
        { pos: [0, 0, 0], uv: [0, 0] },
        { pos: [0, 1, 1], uv: [1, 1] },
        { pos: [0, 0, 1], uv: [1, 0] },
      ],
    },
    {
      // right
      uvRow: 0,
      dir: [1, 0, 0],
      vertices: [
        { pos: [1, 1, 1], uv: [0, 1] },
        { pos: [1, 0, 1], uv: [0, 0] },
        { pos: [1, 1, 0], uv: [1, 1] },
        { pos: [1, 0, 0], uv: [1, 0] },
      ],
    },
    {
      // bottom
      uvRow: 0,
      dir: [0, -1, 0],
      vertices: [
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 0], uv: [1, 1] },
        { pos: [0, 0, 0], uv: [0, 1] },
      ],
    },
    {
      // top
      uvRow: 0,
      dir: [0, 1, 0],
      vertices: [
        { pos: [0, 1, 1], uv: [1, 1] },
        { pos: [1, 1, 1], uv: [0, 1] },
        { pos: [0, 1, 0], uv: [1, 0] },
        { pos: [1, 1, 0], uv: [0, 0] },
      ],
    },
    {
      // north
      uvRow: 0,
      dir: [0, 0, -1],
      vertices: [
        { pos: [1, 0, 0], uv: [0, 0] },
        { pos: [0, 0, 0], uv: [1, 0] },
        { pos: [1, 1, 0], uv: [0, 1] },
        { pos: [0, 1, 0], uv: [1, 1] },
      ],
    },
    {
      // south
      uvRow: 0,
      dir: [0, 0, 1],
      vertices: [
        { pos: [0, 0, 1], uv: [0, 0] },
        { pos: [1, 0, 1], uv: [1, 0] },
        { pos: [0, 1, 1], uv: [0, 1] },
        { pos: [1, 1, 1], uv: [1, 1] },
      ],
    },
  ];

  chunkSize = 16;
  chunks = {};
  chunks_mesh = {};
  renderRequested = false;
  animationFrameRequestID = null;

  // for click mouse events
  mouse = {
    x: 0,
    y: 0,
    moveX: 0,
    moveY: 0,
  };

  constructor(options) {
    this.canvasRef = options.canvasRef;
    this.coloursJSON = options.coloursJSON;
    this.tileSize = options.tileSize;
    this.tileTextureWidth = options.tileTextureWidth;
    this.tileTextureHeight = options.tileTextureHeight;
    const { camera_x, camera_y, camera_z } = options;
    this.onSelectBlockCallback = options.onSelectBlockCallback;
    // each chunk is a Uint8Array; each block is stored as colourSetId, blockId
    // chunks represent a chunkSize^3 volume

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.current });
    this.renderer.setSize(this.canvasRef.current.clientWidth, this.canvasRef.current.clientHeight, false);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("lightblue");
    this.scene.add(new THREE.AmbientLight(0xdddddd));

    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 250;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(camera_x, camera_y, camera_z);

    this.controls = new PointerLockControls(this.camera, this.canvasRef.current);

    const texture = new THREE.TextureLoader().load(IMG_Textures, this.render);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    this.material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.FrontSide,
      alphaTest: 0,
      transparent: false,
    });
  }

  startAnimationLoop = () => {
    this.renderer.render(this.scene, this.camera);
    this.animationFrameRequestID = window.requestAnimationFrame(this.startAnimationLoop);
  };

  stopAnimationLoop = () => {
    window.cancelAnimationFrame(this.animationFrameRequestID);
  };

  addEventListeners() {
    window.addEventListener("resize", this.handleWindowResize);
    this.canvasRef.current.addEventListener("pointerdown", this.handlePointerDown, { passive: false });
    this.canvasRef.current.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    document.addEventListener("keydown", this.handleKeyDown, { passive: false });
    document.addEventListener("keyup", this.handleKeyUp, { passive: false });
    this.controls.connect();
  }

  handleKeyDown = function (e) {
    e.preventDefault();
    switch (e.key) {
      case "w":
        this.controls.moveForward(1);
        break;
      case "a":
        this.controls.moveRight(-1);
        break;
      case "s":
        this.controls.moveForward(-1);
        break;
      case "d":
        this.controls.moveRight(1);
        break;
      case "e":
        this.controls.moveUp(-1);
        break;
      case " ":
        this.controls.moveUp(1);
        break;
      case "c":
        this.camera.fov = 25;
        this.camera.updateProjectionMatrix();
        break;
      default:
        break;
    }
  }.bind(this);

  handleKeyUp = function (e) {
    e.preventDefault();
    switch (e.key) {
      case "c":
        this.camera.fov = 75;
        this.camera.updateProjectionMatrix();
        break;
      default:
        break;
    }
  }.bind(this);

  handlePointerDown = function (e) {
    e.preventDefault();
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    this.mouse.moveX = 0;
    this.mouse.moveY = 0;
    this.canvasRef.current.addEventListener("pointermove", this.recordMovement);
    this.canvasRef.current.addEventListener("pointerup", this.selectBlockIfNoMovement);
    this.controls.lock();
  }.bind(this);

  recordMovement = function (e) {
    this.mouse.moveX += Math.abs(this.mouse.x - e.clientX);
    this.mouse.moveY += Math.abs(this.mouse.y - e.clientY);
  }.bind(this);

  selectBlockIfNoMovement = function (e) {
    if (this.mouse.moveX < 5 && this.mouse.moveY < 5) {
      this.selectBlock(e);
    }
    this.canvasRef.current.removeEventListener("pointermove", this.recordMovement);
    this.canvasRef.current.removeEventListener("pointerup", this.selectBlockIfNoMovement);
  }.bind(this);

  handleTouchStart = function (e) {
    // TODO test this on mobile
    e.preventDefault(); // prevent scrolling
  };

  handleWindowResize = function () {
    const width = this.canvasRef.current.clientWidth;
    const height = this.canvasRef.current.clientHeight;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }.bind(this);

  removeEventListeners() {
    window.removeEventListener("resize", this.handleWindowResize);
    this.canvasRef.current.removeEventListener("pointerdown", this.handlePointerDown, { passive: false });
    this.canvasRef.current.removeEventListener("touchstart", this.handleTouchStart, { passive: false });
    document.removeEventListener("keydown", this.handleKeyDown, { passive: false });
    document.removeEventListener("keyup", this.handleKeyUp, { passive: false });
    this.controls.unlock();
    this.controls.disconnect();
  }

  computeBlockOffset(x, y, z) {
    const { chunkSize } = this;
    const blockX = THREE.MathUtils.euclideanModulo(x, chunkSize) | 0;
    const blockY = THREE.MathUtils.euclideanModulo(y, chunkSize) | 0;
    const blockZ = THREE.MathUtils.euclideanModulo(z, chunkSize) | 0;
    return 2 * (blockY * chunkSize * chunkSize + blockZ * chunkSize + blockX);
  }

  getChunkKey(x, y, z) {
    const { chunkSize } = this;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    const chunkZ = Math.floor(z / chunkSize);
    return `${chunkX},${chunkY},${chunkZ}`;
  }

  getChunkForBlock(x, y, z) {
    return this.chunks[this.getChunkKey(x, y, z)];
  }

  addChunkForBlock(x, y, z) {
    const chunkKey = this.getChunkKey(x, y, z);
    let chunk = this.chunks[chunkKey];
    if (!chunk) {
      const { chunkSize } = this;
      chunk = new Uint8Array(2 * chunkSize * chunkSize * chunkSize);
      for (let i = 0; i < chunk.length; i++) {
        chunk[i] = 255;
      }
      this.chunks[chunkKey] = chunk;
    }
    return chunk;
  }

  getBlock(x, y, z) {
    const chunk = this.getChunkForBlock(x, y, z);
    if (!chunk) {
      return null;
    }
    const blockOffset = this.computeBlockOffset(x, y, z);
    return chunk.slice(blockOffset, blockOffset + 2);
  }

  setBlock(x, y, z, colourSetId, blockId) {
    let chunk = this.getChunkForBlock(x, y, z);
    if (!chunk) {
      chunk = this.addChunkForBlock(x, y, z);
    }
    const blockOffset = this.computeBlockOffset(x, y, z);
    chunk[blockOffset] = colourSetId;
    chunk[blockOffset + 1] = blockId;
  }

  selectBlock() {
    const canvas = this.canvasRef.current;
    // const rect = canvas.getBoundingClientRect();
    const pos = {
      // x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      // y: ((e.clientY - rect.top) * canvas.height) / rect.height,
      // x: ((rect.right + rect.left) * canvas.width) / (2 * rect.width),
      // y: ((rect.bottom + rect.top) * canvas.height) / (2 * rect.height),
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    const x = (pos.x / canvas.width) * 2 - 1;
    const y = (pos.y / canvas.height) * -2 + 1; // note we flip Y

    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    start.setFromMatrixPosition(this.camera.matrixWorld);
    end.set(x, y, 1).unproject(this.camera);

    const intersection = this.intersectRay(start, end);
    if (intersection) {
      // the intersection point is on the face. That means
      // the math imprecision could put us on either side of the face.
      // so go half a normal into the block if removing (currentBlock = 0)
      // our out of the block if adding (currentBlock  > 0)
      // const pos = intersection.position.map((v, numberOfVertices) => {
      //   return v + intersection.normal[numberOfVertices] * -0.5;
      // });
      this.onSelectBlockCallback({
        x: intersection.block_coords.x,
        y: intersection.block_coords.y,
        z: intersection.block_coords.z,
        colourSetId: intersection.block[0],
        blockId: intersection.block[1],
      });
    }
  }

  intersectRay(start, end) {
    // from
    // http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let dz = end.z - start.z;
    const lenSq = dx * dx + dy * dy + dz * dz;
    const len = Math.sqrt(lenSq);

    dx /= len;
    dy /= len;
    dz /= len;

    let t = 0.0;
    let ix = Math.floor(start.x);
    let iy = Math.floor(start.y);
    let iz = Math.floor(start.z);

    const stepX = dx > 0 ? 1 : -1;
    const stepY = dy > 0 ? 1 : -1;
    const stepZ = dz > 0 ? 1 : -1;

    const txDelta = Math.abs(1 / dx);
    const tyDelta = Math.abs(1 / dy);
    const tzDelta = Math.abs(1 / dz);

    const xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix;
    const yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy;
    const zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz;

    // location of nearest block boundary, in units of t
    let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
    let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
    let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;

    let steppedIndex = -1;

    // main loop along raycast vector
    while (t <= len) {
      const block = this.getBlock(ix, iy, iz);
      if (block !== null && !(block[0] === 255 && block[1] === 255)) {
        return {
          position: [start.x + t * dx, start.y + t * dy, start.z + t * dz],
          normal: [steppedIndex === 0 ? -stepX : 0, steppedIndex === 1 ? -stepY : 0, steppedIndex === 2 ? -stepZ : 0],
          block: block,
          block_coords: { x: ix, y: iy, z: iz },
        };
      }

      // advance t to next nearest block boundary
      if (txMax < tyMax) {
        if (txMax < tzMax) {
          ix += stepX;
          t = txMax;
          txMax += txDelta;
          steppedIndex = 0;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      } else {
        if (tyMax < tzMax) {
          iy += stepY;
          t = tyMax;
          tyMax += tyDelta;
          steppedIndex = 1;
        } else {
          iz += stepZ;
          t = tzMax;
          tzMax += tzDelta;
          steppedIndex = 2;
        }
      }
    }
    return null;
  }

  generateGeometryDataForChunk(chunkX, chunkY, chunkZ) {
    const { coloursJSON, chunkSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
    const verticesComponents = [];
    const normalsComponents = [];
    const uvs = [];
    const indices = [];
    const startX = chunkX * chunkSize;
    const startY = chunkY * chunkSize;
    const startZ = chunkZ * chunkSize;

    const chunk = this.getChunkForBlock(startX, startY, startZ);
    if (chunk) {
      for (let y = 0; y < chunkSize; y++) {
        const blockY = startY + y;
        for (let z = 0; z < chunkSize; z++) {
          const blockZ = startZ + z;
          for (let x = 0; x < chunkSize; x++) {
            const blockX = startX + x;
            const blockOffset = this.computeBlockOffset(x, y, z);
            const block = chunk.slice(blockOffset, blockOffset + 2);
            let [colourSetId, blockId] = block;
            if (!(colourSetId === 255 && blockId === 255)) {
              if (!(colourSetId === 64 && blockId === 2)) {
                // if not placeholder texture then check if custom texture needed
                if (coloursJSON[colourSetId.toString()].blocks[blockId.toString()].presetIndex === "CUSTOM") {
                  colourSetId = 64;
                  blockId = 5;
                }
              }
              // There is a block here but do we need faces for it?
              for (const { dir, vertices, uvRow } of this.faces) {
                const neighbor = this.getBlock(blockX + dir[0], blockY + dir[1], blockZ + dir[2]);
                if (neighbor === null || (neighbor[0] === 255 && neighbor[1] === 255)) {
                  // this block has no neighbor in this direction so we need a face
                  const numberOfVertices = verticesComponents.length / 3;
                  for (const { pos, uv } of vertices) {
                    verticesComponents.push(pos[0] + x, pos[1] + y, pos[2] + z);
                    normalsComponents.push(...dir);
                    uvs.push(((blockId + uv[0]) * tileSize) / tileTextureWidth, 1 - ((uvRow + (1 + colourSetId) - uv[1]) * tileSize) / tileTextureHeight);
                  }
                  indices.push(numberOfVertices, numberOfVertices + 1, numberOfVertices + 2, numberOfVertices + 2, numberOfVertices + 1, numberOfVertices + 3);
                }
              }
            }
          }
        }
      }
    }

    return {
      verticesComponents,
      normalsComponents,
      uvs,
      indices,
    };
  }

  updateChunkGeometry(x, y, z) {
    const { chunkSize } = this;
    const chunkX = Math.floor(x / chunkSize);
    const chunkY = Math.floor(y / chunkSize);
    const chunkZ = Math.floor(z / chunkSize);
    const chunkKey = this.getChunkKey(x, y, z);
    let mesh = this.chunks_mesh[chunkKey];
    const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();

    const { verticesComponents, normalsComponents, uvs, indices } = this.generateGeometryDataForChunk(chunkX, chunkY, chunkZ);
    const positionNumComponents = 3;
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verticesComponents), positionNumComponents));
    const normalNumComponents = 3;
    geometry.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(normalsComponents), normalNumComponents));
    const uvNumComponents = 2;
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
    geometry.setIndex(indices);
    geometry.computeBoundingSphere();

    if (!mesh) {
      mesh = new THREE.Mesh(geometry, this.material);
      mesh.name = chunkKey;
      this.chunks_mesh[chunkKey] = mesh;
      this.scene.add(mesh);
      mesh.position.set(chunkX * chunkSize, chunkY * chunkSize, chunkZ * chunkSize);
    }
  }

  updateBlockGeometry(x, y, z) {
    const updatedChunkKeys = {};
    for (const offset of [
      [0, 0, 0], // self
      [-1, 0, 0], // left
      [1, 0, 0], // right
      [0, -1, 0], // down
      [0, 1, 0], // up
      [0, 0, -1], // back
      [0, 0, 1], // front
    ]) {
      const ox = x + offset[0];
      const oy = y + offset[1];
      const oz = z + offset[2];
      const chunkKey = this.getChunkKey(ox, oy, oz);
      if (!updatedChunkKeys[chunkKey]) {
        updatedChunkKeys[chunkKey] = true;
        this.updateChunkGeometry(ox, oy, oz);
      }
    }
  }
}

class ViewOnline3D extends Component {
  state = {
    viewOnline_NBT_decompressed: null,
    selectedBlock: null,
  };

  constructor(props) {
    super(props);
    this.canvasRef_viewOnline = createRef();
  }

  getNBTDecompressed() {
    const { viewOnline_NBT } = this.props;
    let nbtReader = new NBTReader();
    nbtReader.loadBuffer(viewOnline_NBT);
    const viewOnline_NBT_decompressed = nbtReader.getData();
    return viewOnline_NBT_decompressed;
  }

  drawNBT() {
    const { coloursJSON, optionValue_version } = this.props;
    const { viewOnline_NBT_decompressed } = this.state;
    const [schematic_size_x, schematic_size_y, schematic_size_z] = viewOnline_NBT_decompressed.value.size.value.value;

    this.world.chunks = {};
    this.world.chunks_mesh = {};

    let paletteIdToColourSetIdAndBlockId = [];
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
            paletteIdToColourSetIdAndBlockId.push([parseInt(colourSetId), parseInt(blockId)]);
            paletteItemFound = true;
          }
        }
      }
      if (!paletteItemFound) {
        console.log(`Didn't find ${paletteItem.Name.value} in coloursJSON; using placeholder texture`);
        paletteIdToColourSetIdAndBlockId.push([64, 2]);
      }
    }

    viewOnline_NBT_decompressed.value.blocks.value.value.forEach((block) => {
      const block_coords = block.pos.value.value;
      const block_paletteId = block.state.value;
      this.world.setBlock(...block_coords, ...paletteIdToColourSetIdAndBlockId[block_paletteId]);
    });
    for (let x = 0; x < schematic_size_x; x += this.world.chunkSize) {
      for (let y = 0; y < schematic_size_y; y += this.world.chunkSize) {
        for (let z = 0; z < schematic_size_z; z += this.world.chunkSize) {
          this.world.updateChunkGeometry(x, y, z);
        }
      }
    }
  }

  handleEscapeKeyDown = function (e) {
    const { handleViewOnline3DEscape } = this.props;
    e.preventDefault();
    if (e.key === "Escape") {
      handleViewOnline3DEscape();
    }
  }.bind(this);

  componentDidMount() {
    const { coloursJSON } = this.props;
    const canvasRef = this.canvasRef_viewOnline;
    const viewOnline_NBT_decompressed = this.getNBTDecompressed();
    const [, size_y, size_z] = viewOnline_NBT_decompressed.value.size.value.value;

    this.world = new BlockWorld({
      canvasRef: canvasRef,
      coloursJSON: coloursJSON,
      tileSize: 32,
      tileTextureWidth: 608,
      tileTextureHeight: 2080,
      camera_x: 0,
      camera_y: size_y + 1,
      camera_z: size_z,
      onSelectBlockCallback: (selectedBlock) => {
        this.setState({ selectedBlock });
      },
    });

    this.world.startAnimationLoop();

    this.setState({ viewOnline_NBT_decompressed }, () => {
      this.drawNBT();
      document.addEventListener("keydown", this.handleEscapeKeyDown);
      this.world.addEventListeners();
    });
  }

  componentWillUnmount() {
    this.world.stopAnimationLoop();
    this.world.removeEventListeners();
    document.removeEventListener("keydown", this.handleEscapeKeyDown);
  }

  render() {
    const { getLocaleString, coloursJSON } = this.props;
    const { viewOnline_NBT_decompressed, selectedBlock } = this.state;
    let component_size = null;
    if (viewOnline_NBT_decompressed !== null) {
      const [size_x, size_y, size_z] = viewOnline_NBT_decompressed.value.size.value.value;
      component_size = (
        <h2
          style={{
            position: "fixed",
            zIndex: 121,
            left: 0,
            top: 0,
          }}
        >
          {getLocaleString("VIEW-ONLINE/SIZE")}
          {": "}
          {size_x.toString()}
          {"x"}
          {size_y > 256 ? (
            <Tooltip
              tooltipText={getLocaleString("VIEW-ONLINE/TOO-BIG-FOR-SINGLE")}
              textStyleOverrides={{
                whiteSpace: "nowrap",
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
    const component_controls = (
      <div
        style={{
          position: "fixed",
          zIndex: 121,
          left: 0,
          bottom: 0,
        }}
      >
        <h3 style={{ margin: 0 }}>{`${getLocaleString("VIEW-ONLINE/CONTROLS")}: W A S D E SPACE C`}</h3>
        <h3 style={{ margin: 0 }}>{`ESC ESC ${getLocaleString("VIEW-ONLINE/TO-EXIT")}`}</h3>
      </div>
    );
    let component_waila = null;
    if (selectedBlock !== null) {
      component_waila = (
        <Waila
          getLocaleString={getLocaleString}
          coloursJSON={coloursJSON}
          selectedBlock={selectedBlock}
          style={{
            position: "fixed",
            zIndex: 121,
            right: 0,
            top: 0,
          }}
        />
      );
    }

    return (
      <React.Fragment>
        {component_size}
        {component_controls}
        {component_waila}
        <b style={{ position: "fixed", zIndex: 121, top: "50%", left: "50%" }}>{"\\"}</b>
        <canvas
          ref={this.canvasRef_viewOnline}
          style={{
            position: "fixed",
            zIndex: 120,
            width: "100%",
            height: "100%",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      </React.Fragment>
    );
  }
}

export default ViewOnline3D;
