// begin variables passed in onmessage
var coloursJSON;
var MapModes;
var WhereSupportBlocksModes;
var optionValue_version;
var optionValue_staircasing;
var optionValue_whereSupportBlocks;
var optionValue_supportBlock;
var pixelsData;
var maps;
var currentSelectedBlocks;
// end onmessage variables

var exactColourCache = new Map(); // for mapping RGB that exactly matches in coloursJSON to colourSetId and tone

var progressReportHead;

/*
  A mapping from type names to NBT type numbers.
  This is NOT just an enum, these values have to stay as they are
  https://minecraft.wiki/w/NBT_format#TAG_definition
*/
const TagTypes = {
  end: 0,
  byte: 1,
  short: 2,
  int: 3,
  long: 4,
  float: 5,
  double: 6,
  byteArray: 7,
  string: 8,
  list: 9,
  compound: 10,
  intArray: 11,
  longArray: 12,
};

class NBTWriter {
  constructor() {
    if (typeof ArrayBuffer === "undefined") {
      throw new Error("Missing required type ArrayBuffer");
    }
    if (typeof DataView === "undefined") {
      throw new Error("Missing required type DataView");
    }
    if (typeof Uint8Array === "undefined") {
      throw new Error("Missing required type Uint8Array");
    }
    /* Will be auto-resized (x2) on write if necessary. */
    this.buffer = new ArrayBuffer(1024);

    /* These are recreated when the buffer is */
    this.dataView = new DataView(this.buffer);
    this.arrayView = new Uint8Array(this.buffer);
    this.offset = 0;
  }

  encodeUTF8(str) {
    let array = [],
      i,
      c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c === 0x0) {
        array.push(0xc0);
        array.push(0x80);
      } else if (c < 0x80) {
        array.push(c);
      } else if (c < 0x800) {
        array.push(0xc0 | (c >> 6));
        array.push(0x80 | (c & 0x3f));
      } else if (c < 0x10000) {
        array.push(0xe0 | (c >> 12));
        array.push(0x80 | ((c >> 6) & 0x3f));
        array.push(0x80 | (c & 0x3f));
      } else {
        // unsure if this is accurate, however we never need such exotic unicode characters
        array.push(0xf0 | ((c >> 18) & 0x07));
        array.push(0x80 | ((c >> 12) & 0x3f));
        array.push(0x80 | ((c >> 6) & 0x3f));
        array.push(0x80 | (c & 0x3f));
      }
    }
    return array;
  }

  accommodate(size) {
    // Ensures that the buffer is large enough to write `size` bytes at the current `this.offset`.
    let requiredLength = this.offset + size;
    if (this.buffer.byteLength >= requiredLength) {
      return;
    }

    let newLength = this.buffer.byteLength;
    while (newLength < requiredLength) {
      newLength *= 2;
    }
    let newBuffer = new ArrayBuffer(newLength);
    let newArrayView = new Uint8Array(newBuffer);
    newArrayView.set(this.arrayView);

    // If there's a gap between the end of the old buffer
    // and the start of the new one, we need to zero it out
    if (this.offset > this.buffer.byteLength) {
      newArrayView.fill(0, this.buffer.byteLength, this.offset);
    }

    this.buffer = newBuffer;
    this.dataView = new DataView(newBuffer);
    this.arrayView = newArrayView;
  }

  write(dataType, size, value) {
    this.accommodate(size);
    this.dataView[`set${dataType}`](this.offset, value);
    this.offset += size;
  }

  writeByType(dataType, value) {
    switch (dataType) {
      case TagTypes.end: {
        this.writeByType(TagTypes.byte, 0);
        break;
      }
      case TagTypes.byte: {
        this.write("Int8", 1, value);
        break;
      }
      case TagTypes.short: {
        this.write("Int16", 2, value);
        break;
      }
      case TagTypes.int: {
        this.write("Int32", 4, value);
        break;
      }
      case TagTypes.long: {
        // NB: special: JS doesn't support native 64 bit ints; pass an array of two 32 bit ints to this case
        this.write("Int32", 4, value[0]);
        this.write("Int32", 4, value[1]);
        break;
      }
      case TagTypes.float: {
        this.write("Float32", 4, value);
        break;
      }
      case TagTypes.double: {
        this.write("Float64", 8, value);
        break;
      }
      case TagTypes.byteArray: {
        this.writeByType(TagTypes.int, value.length);
        this.accommodate(value.length);
        this.arrayView.set(value, this.offset);
        this.offset += value.length;
        break;
      }
      case TagTypes.string: {
        let bytes = this.encodeUTF8(value);
        this.writeByType(TagTypes.short, bytes.length);
        this.accommodate(bytes.length);
        this.arrayView.set(bytes, this.offset);
        this.offset += bytes.length;
        break;
      }
      case TagTypes.list: {
        // Pass a dicitonary {"type": TagTypes.blah, "value": [] }
        this.writeByType(TagTypes.byte, value.type);
        this.writeByType(TagTypes.int, value.value.length);
        for (let i = 0; i < value.value.length; i++) {
          this.writeByType(value.type, value.value[i]);
        }
        break;
      }
      case TagTypes.compound: {
        // This is the rich tagtype we will interact with a lot
        // Pass a dictionary {"type": TagTypes.blah, "value": ... }
        // {
        //   author: { type: TagTypes.string, value: "Steve" },
        //   stuff: {
        //       type: TagTypes.compound,
        //       value: {
        //         foo: { type: int, value: 42 },
        //         bar: { type: string, value: 'Hi!' }
        //       }
        //   }
        // }
        Object.keys(value).forEach((key) => {
          this.writeByType(TagTypes.byte, value[key].type);
          this.writeByType(TagTypes.string, key);
          this.writeByType(value[key].type, value[key].value); // this is where the nice recursion happens
        });
        this.writeByType(TagTypes.end, 0);
        break;
      }
      case TagTypes.intArray: {
        this.writeByType(TagTypes.int, value.length);
        for (let i = 0; i < value.length; i++) {
          this.writeByType(TagTypes.int, value[i]);
          // https://lkml.org/lkml/2012/7/6/495
        }
        break;
      }
      case TagTypes.longArray: {
        this.writeByType(TagTypes.int, value.length);
        for (let i = 0; i < value.length; i++) {
          this.writeByType(TagTypes.long, value[i]);
          // NB this is an array of longs given as specified in case:long
        }
        break;
      }
      case "UBYTE": {
        // unsure why this is here, seems unused; nbt raw bytes (TagTypes.byte) are signed
        this.write("Uint8", 1, value);
        break;
      }
      default: {
        throw new Error(`Unknown data type ${dataType} for value ${value}`);
      }
    }
  }

  writeTopLevelCompound(value) {
    // For writing a top level JSON object as a compound tag.
    // This is of the form {"name": "blah", "value": {...}}
    // This is not just this.writeByType(TagTypes.compound, value); we add the appropriate compound prefix etc
    this.writeByType(TagTypes.byte, TagTypes.compound);
    this.writeByType(TagTypes.string, value.name);
    this.writeByType(TagTypes.compound, value.value);
  }

  getData() {
    /*
      Returns the writen data as a slice from the internal buffer, cutting off any padding at the end.
    */
    this.accommodate(0); /* make sure the offset is inside the buffer */
    return this.buffer.slice(0, this.offset);
  }
}

class Map_NBT {
  constructor(map) {
    this.mapColoursLayout = map.coloursLayout;
    this.mapMaterialsCounts = map.materials;
    this.NBT_json = {
      name: "",
      value: {
        blocks: {
          type: TagTypes.list,
          value: {
            type: TagTypes.compound,
            value: [],
          },
        },
        entities: {
          type: TagTypes.list,
          value: {
            type: TagTypes.compound,
            value: [],
          },
        },
        palette: {
          type: TagTypes.list,
          value: {
            type: TagTypes.compound,
            value: [],
          },
        },
        size: {
          type: TagTypes.list,
          value: {
            type: TagTypes.int,
            value: [], // X, Y, Z
          },
        },
        author: {
          type: TagTypes.string,
          value: "rebane2001.com/mapartcraft",
        },
        DataVersion: {
          type: TagTypes.int,
          value: null,
        },
      },
    };
    this.physicalLayout = [];
    this.palette_colourSetId_paletteId = {}; // map coloursJSON colourSetIds to index of corresponding block in palette list
    this.palette_paletteId_colourSetId = []; // map paletteIds (index of an item in this list) to colourSetIds
    this.columnHeightsCache = []; // appended to in getPhysicalLayout_individualColumn, used in setNBT_json_size
  }

  constructPaletteLookups() {
    // filter $materials to colourSetIds with non-zero materials count
    const nonZeroMaterials = Object.fromEntries(Object.entries(this.mapMaterialsCounts).filter(([_, value]) => value !== 0));
    // now construct palette lookups for non-zero colourSetIds
    Object.keys(nonZeroMaterials).forEach((colourSetId) => {
      this.palette_colourSetId_paletteId[colourSetId] = this.palette_paletteId_colourSetId.length;
      this.palette_paletteId_colourSetId.push(colourSetId);
    });
    // finally add noobline/scaffold material at the end, special key
    this.palette_colourSetId_paletteId["NOOBLINE_SCAFFOLD"] = this.palette_paletteId_colourSetId.length;
    this.palette_paletteId_colourSetId.push("NOOBLINE_SCAFFOLD");
  }

  setNBT_json_palette() {
    this.palette_paletteId_colourSetId.forEach((colourSetId) => {
      let paletteItemToPush = {};
      if (colourSetId === "NOOBLINE_SCAFFOLD") {
        paletteItemToPush.Name = {
          type: TagTypes.string,
          value: `minecraft:${optionValue_supportBlock.toLowerCase()}`,
        };
        // we expect the support block to be something non-exotic with no properties eg netherrack
      } else {
        let blockNBTData = coloursJSON[colourSetId].blocks[currentSelectedBlocks[colourSetId]].validVersions[optionValue_version.MCVersion];
        if (typeof blockNBTData === "string") {
          // this is of the form eg "&1.12.2"
          blockNBTData = coloursJSON[colourSetId].blocks[currentSelectedBlocks[colourSetId]].validVersions[blockNBTData.slice(1)];
        }
        paletteItemToPush.Name = {
          type: TagTypes.string,
          value: `minecraft:${blockNBTData.NBTName}`,
        };
        if (Object.keys(blockNBTData.NBTArgs).length !== 0) {
          paletteItemToPush.Properties = { type: TagTypes.compound, value: {} };
          Object.keys(blockNBTData.NBTArgs).forEach((NBTArg_key) => {
            paletteItemToPush.Properties.value[NBTArg_key] = {
              type: TagTypes.string,
              value: blockNBTData.NBTArgs[NBTArg_key],
            };
          });
        }
      }
      this.NBT_json.value.palette.value.value.push(paletteItemToPush);
    });
  }

  setNBT_json_DataVersion() {
    this.NBT_json.value.DataVersion.value = optionValue_version.NBTVersion;
  }

  returnPhysicalBlock(x, y, z, colourSetId) {
    return {
      pos: { type: TagTypes.list, value: { type: TagTypes.int, value: [x, y, z] } },
      state: { type: TagTypes.int, value: this.palette_colourSetId_paletteId[colourSetId] },
    };
  }

  getPhysicalLayout() {
    for (let columnNumber = 0; columnNumber < this.mapColoursLayout.length; columnNumber++) {
      this.getPhysicalLayout_individualColumn(columnNumber);
      postMessage({
        head: progressReportHead,
        body: (columnNumber + 1) / this.mapColoursLayout.length,
      });
    }
  }

  getPhysicalLayout_individualColumn(columnNumber) {
    const mapColoursLayoutColumn = this.mapColoursLayout[columnNumber];
    let physicalColumn = [];
    let currentHeight;
    switch (optionValue_staircasing) {
      case MapModes.SCHEMATIC_NBT.staircaseModes.OFF.uniqueId: {
        // start at y = 2 for flat maps; this covers the cases of support blocks 1 and or 2 blocks below
        currentHeight = 2;
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.CLASSIC.uniqueId:
      case MapModes.SCHEMATIC_NBT.staircaseModes.VALLEY.uniqueId: {
        // this doesn't matter
        // in the classic case each column is later adjusted to have its global minimum at y = 0 so the map has a common base / is as short as possible
        // in the valley case valleys are pulled down to y = 0
        currentHeight = 0;
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_DARK.uniqueId: {
        // staircase descends from noobline southwards
        currentHeight = 1 + mapColoursLayoutColumn.length;
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_LIGHT.uniqueId: {
        // staircase ascends from noobline southwards
        currentHeight = 1;
        break;
      }
      default: {
        throw new Error("Unknown staircase mode");
      }
    }

    // initialize noobline
    physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight, 0, "NOOBLINE_SCAFFOLD"));

    for (let rowNumber = 0; rowNumber < mapColoursLayoutColumn.length; rowNumber++) {
      const coloursLayoutBlock = mapColoursLayoutColumn[rowNumber];

      const previousHeight = currentHeight;
      switch (coloursLayoutBlock.tone) {
        case "dark": {
          currentHeight -= 1;
          break;
        }
        case "normal": {
          break;
        }
        case "light": {
          currentHeight += 1;
          break;
        }
        default: {
          throw new Error("Unknown tone type");
        }
      }

      physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight, rowNumber + 1, coloursLayoutBlock.colourSetId));
      // the + 1 is because the noobline offsets everything South one block

      // read docs/supportBlocks.md to know how this works
      switch (optionValue_whereSupportBlocks) {
        case WhereSupportBlocksModes.NONE.uniqueId: {
          break;
        }
        case WhereSupportBlocksModes.IMPORTANT.uniqueId: {
          if (isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock)) {
            physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight - 1, rowNumber + 1, "NOOBLINE_SCAFFOLD"));
          }
          break;
        }
        case WhereSupportBlocksModes.ALL_OPTIMIZED.uniqueId: {
          switch (rowNumber) {
            case 0: {
              if (
                coloursLayoutBlock.tone === "dark" ||
                (coloursLayoutBlock.tone === "normal" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock))
              ) {
                // first under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 1, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              if (coloursLayoutBlock.tone === "dark" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock)) {
                // second under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 2, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              break;
            }
            case 1: {
              const coloursLayoutBlock_0 = mapColoursLayoutColumn[rowNumber - 1];
              if (
                coloursLayoutBlock_0.tone === "light" ||
                coloursLayoutBlock.tone === "dark" ||
                isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock_0) ||
                (coloursLayoutBlock.tone === "normal" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock))
              ) {
                // first under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 1, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              if (coloursLayoutBlock.tone === "dark" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock)) {
                // second under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 2, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              break;
            }
            case mapColoursLayoutColumn.length - 1: {
              // falls through
              const coloursLayoutBlock_north = mapColoursLayoutColumn[rowNumber - 1];
              if (
                coloursLayoutBlock.tone === "light" ||
                isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock) ||
                (coloursLayoutBlock.tone === "normal" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock_north))
              ) {
                // first under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight - 1, rowNumber + 1, "NOOBLINE_SCAFFOLD"));
              }
              if (coloursLayoutBlock.tone === "light" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock_north)) {
                // second under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight - 2, rowNumber + 1, "NOOBLINE_SCAFFOLD"));
              }
            }
            // eslint-disable-next-line no-fallthrough
            default: {
              const coloursLayoutBlock_north = mapColoursLayoutColumn[rowNumber - 2];
              const coloursLayoutBlock_inQuestion = mapColoursLayoutColumn[rowNumber - 1];
              if (
                coloursLayoutBlock_inQuestion.tone === "light" ||
                coloursLayoutBlock.tone === "dark" ||
                isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock_inQuestion) ||
                (coloursLayoutBlock.tone === "normal" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock)) ||
                (coloursLayoutBlock_inQuestion.tone === "normal" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock_north))
              ) {
                // first under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 1, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              if (
                (coloursLayoutBlock.tone === "dark" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock)) ||
                (coloursLayoutBlock_inQuestion.tone === "light" && isSupportBlockMandatoryForColourSetIdAndTone(coloursLayoutBlock_north))
              ) {
                // second under-support block
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 2, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              break;
            }
          }
          break;
        }
        case WhereSupportBlocksModes.ALL_DOUBLE_OPTIMIZED.uniqueId: {
          switch (rowNumber) {
            case 0: {
              physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 1, rowNumber, "NOOBLINE_SCAFFOLD"));
              if (coloursLayoutBlock.tone === "dark") {
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 2, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              break;
            }
            case mapColoursLayoutColumn.length - 1: {
              physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight - 1, rowNumber + 1, "NOOBLINE_SCAFFOLD"));
              if (coloursLayoutBlock.tone === "light") {
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, currentHeight - 2, rowNumber + 1, "NOOBLINE_SCAFFOLD"));
              }
              // falls through
            }
            // eslint-disable-next-line no-fallthrough
            default: {
              physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 1, rowNumber, "NOOBLINE_SCAFFOLD"));
              const coloursLayoutBlock_inQuestion = mapColoursLayoutColumn[rowNumber - 1];
              if (coloursLayoutBlock_inQuestion.tone === "light" || coloursLayoutBlock.tone === "dark") {
                physicalColumn.push(this.returnPhysicalBlock(columnNumber, previousHeight - 2, rowNumber, "NOOBLINE_SCAFFOLD"));
              }
              break;
            }
          }
          break;
        }
        default: {
          throw new Error("Unknown support-blocks option");
        }
      }
    }

    // sort in terms of z and y, necessary for determining when a plateau has finished in valley mode, and correct noobline heights in map preview
    physicalColumn.sort((elt1, elt2) => {
      if (elt1.pos.value.value[2] < elt2.pos.value.value[2]) {
        return -1;
      } else if (elt1.pos.value.value[2] > elt2.pos.value.value[2]) {
        // smaller Z first
        return 1;
      } else {
        if (elt1.pos.value.value[1] > elt2.pos.value.value[1]) {
          return -1;
        } else {
          // higher Y first
          return 1;
        }
      }
    });

    switch (optionValue_staircasing) {
      case MapModes.SCHEMATIC_NBT.staircaseModes.VALLEY.uniqueId: {
        let plateaus = [{ startIndex: 0, endIndex: 0 }];
        // initial 0 width plateau useful just so we don't have a special case for the first proper plateau later
        let ascending = false; // weakly ascending
        let currentPlateauStartIndex = null;
        let visibleBlocksHeight = physicalColumn[0].pos.value.value[1]; // initialise to noobline height
        // visible blocks are blocks at the top height in a x-z column, the actual map blocks that give the colours

        for (let i = 0; i < physicalColumn.length; i++) {
          const physicalBlock = physicalColumn[i];
          if (this.palette_paletteId_colourSetId[physicalBlock.state.value] === "NOOBLINE_SCAFFOLD") {
            continue;
          }
          if (ascending && physicalBlock.pos.value.value[1] < visibleBlocksHeight) {
            // dark after ascent; plateau found
            ascending = false;
            plateaus.push({
              startIndex: currentPlateauStartIndex,
              endIndex: i,
            });
          } else if (physicalBlock.pos.value.value[1] > visibleBlocksHeight) {
            // light
            ascending = true;
            currentPlateauStartIndex = i;
          }
          visibleBlocksHeight = physicalBlock.pos.value.value[1];
        }

        plateaus.push({ startIndex: physicalColumn.length, endIndex: physicalColumn.length });

        let nonPlateauPulldownHeights = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
        while (plateaus.length !== 1) {
          let pullDownHeight = Number.MAX_SAFE_INTEGER;
          for (let i = plateaus[0].endIndex; i < plateaus[1].startIndex; i++) {
            pullDownHeight = Math.min(physicalColumn[i].pos.value.value[1], pullDownHeight);
          }
          for (let i = plateaus[0].endIndex; i < plateaus[1].startIndex; i++) {
            physicalColumn[i].pos.value.value[1] -= pullDownHeight;
          }
          nonPlateauPulldownHeights[1] = pullDownHeight;
          const plateauPulldownHeight = Math.min(...nonPlateauPulldownHeights);
          // we pull down a plateau by the minimum of the two values the surrounding non-plateaus were pulled down by
          for (let i = plateaus[0].startIndex; i < plateaus[0].endIndex; i++) {
            physicalColumn[i].pos.value.value[1] -= plateauPulldownHeight;
          }
          plateaus.shift();
          nonPlateauPulldownHeights[0] = nonPlateauPulldownHeights[1];
        }
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.CLASSIC.uniqueId: {
        // make sure the column's global minimum is at y = 0; doing this for every column gives the map a common base.
        const columnMinimumY = physicalColumn.reduce((a, b) => (a.pos.value.value[1] < b.pos.value.value[1] ? a : b)).pos.value.value[1];
        physicalColumn.forEach((block) => {
          block.pos.value.value[1] -= columnMinimumY;
        });
        break;
      }
      case MapModes.SCHEMATIC_NBT.staircaseModes.OFF.uniqueId:
      case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_DARK.uniqueId:
      case MapModes.SCHEMATIC_NBT.staircaseModes.FULL_LIGHT.uniqueId: {
        break;
      }
      default: {
        throw new Error("Unknown staircase mode");
      }
    }

    this.NBT_json.value.blocks.value.value = this.NBT_json.value.blocks.value.value.concat(physicalColumn);
    this.columnHeightsCache.push(physicalColumn.reduce((a, b) => (a.pos.value.value[1] > b.pos.value.value[1] ? a : b)).pos.value.value[1]);
  }

  setNBT_json_blocks() {
    this.getPhysicalLayout();
  }

  setNBT_json_size() {
    this.NBT_json.value.size.value.value = [
      this.mapColoursLayout.length,
      this.columnHeightsCache.reduce((a, b) => (a > b ? a : b)) + 1,
      this.mapColoursLayout[0].length + 1,
    ];
  }

  getNBT() {
    this.constructPaletteLookups();
    this.setNBT_json_palette();
    this.setNBT_json_DataVersion();
    this.setNBT_json_blocks();
    this.setNBT_json_size();

    // console.log(NBT_json);

    let nbtWriter = new NBTWriter();
    nbtWriter.writeTopLevelCompound(this.NBT_json);
    return nbtWriter.getData();
  }
}

class Map_Mapdat {
  constructor(map) {
    this.coloursLayout = map.coloursLayout;

    const dataVersion = optionValue_version.NBTVersion;

    this.NBT_json = {
      name: "",
      value: {
        data: {
          type: TagTypes.compound,
          value: {
            scale: { type: TagTypes.byte, value: 0 },
            dimension: {
              type: dataVersion >= 2566 ? TagTypes.string : TagTypes.byte,
              value: dataVersion >= 2566 ? "minecraft:overworld" : dataVersion > 1343 ? 0 : -128,
            },
            unlimitedTracking: { type: TagTypes.byte, value: 0 },
            trackingPosition: { type: TagTypes.byte, value: 0 },
            locked: { type: TagTypes.byte, value: 1 },
            height: { type: TagTypes.short, value: 128 },
            width: { type: TagTypes.short, value: 128 },
            xCenter: { type: TagTypes.int, value: 0 },
            zCenter: { type: TagTypes.int, value: 0 },
            colors: { type: TagTypes.byteArray, value: new Uint8Array(16384) },
          },
        },
        DataVersion: { type: TagTypes.int, value: dataVersion },
      },
    };
  }

  setNBT_json_colors() {
    for (let x = 0; x < 128; x++) {
      for (let z = 0; z < 128; z++) {
        const pixel = this.coloursLayout[x][z];
        const arrayOffset = z * 128 + x;
        let mapdatId; // coloursJSON contains the base mapdatId that is multiplied by 4 and added to by one of 0,1,2,3
        if (pixel.colourSetId === "-1") {
          // special colourSetId for transparent maps
          mapdatId = 1;
        } else {
          switch (pixel.tone) {
            case "dark": {
              mapdatId = 4 * coloursJSON[pixel.colourSetId].mapdatId;
              break;
            }
            case "normal": {
              mapdatId = 4 * coloursJSON[pixel.colourSetId].mapdatId + 1;
              break;
            }
            case "light": {
              mapdatId = 4 * coloursJSON[pixel.colourSetId].mapdatId + 2;
              break;
            }
            case "unobtainable": {
              mapdatId = 4 * coloursJSON[pixel.colourSetId].mapdatId + 3;
              break;
            }
            default: {
              throw new Error("Unknown colour tone");
            }
          }
        }
        this.NBT_json.value.data.value.colors.value[arrayOffset] = mapdatId;
      }
      postMessage({
        head: progressReportHead,
        body: (x + 1) / 128,
      });
    }
  }

  getNBT() {
    this.setNBT_json_colors();

    let nbtWriter = new NBTWriter();
    nbtWriter.writeTopLevelCompound(this.NBT_json);
    return nbtWriter.getData();
  }
}

function setupExactColourCache() {
  // we do not care what staircasing option is selected etc as this does not matter
  // this is for exactly matching colours, whose values are never repeated in coloursJSON
  // also RGB could be easily changed to RGBA if Mojang ever added absolute black #000000 and we need to distinguish it from transparent
  // setupExactColourCache also exists in mapCanvas.jsworker but without the "-1" colourSet for transparent
  for (const [colourSetId, colourSet] of Object.entries(coloursJSON)) {
    for (const [toneKey, toneRGB] of Object.entries(colourSet.tonesRGB)) {
      const RGBBinary = (toneRGB[0] << 16) + (toneRGB[1] << 8) + toneRGB[2];
      exactColourCache.set(RGBBinary, {
        colourSetId: colourSetId,
        tone: toneKey,
      });
    }
  }
  exactColourCache.set(0, {
    // special transparent for mapdat
    colourSetId: "-1",
    tone: "normal",
  });
}

function exactRGBToColourSetIdAndTone(pixelRGB) {
  const RGBBinary = (pixelRGB[0] << 16) + (pixelRGB[1] << 8) + pixelRGB[2];
  return exactColourCache.get(RGBBinary);
}

function isSupportBlockMandatoryForColourSetIdAndTone(colourSetIdAndTone) {
  return coloursJSON[colourSetIdAndTone.colourSetId].blocks[currentSelectedBlocks[colourSetIdAndTone.colourSetId]].supportBlockMandatory;
}

function mergeMaps() {
  // for when we want one big NBT instead of split 1x1s
  maps.forEach((rowOfMaps) => {
    for (let whichMap_x = 1; whichMap_x < rowOfMaps.length; whichMap_x++) {
      rowOfMaps[0].coloursLayout = rowOfMaps[0].coloursLayout.concat(rowOfMaps[whichMap_x].coloursLayout); // merge along x-axis
    }
  });
  for (let i = 0; i < maps[0][0].coloursLayout.length; i++) {
    // for each column in resulting map
    for (let j = 1; j < maps.length; j++) {
      // for each column needing to be merged into resulting map
      maps[0][0].coloursLayout[i] = maps[0][0].coloursLayout[i].concat(maps[j][0].coloursLayout[i]);
    }
  }
  // Merge materials counts for lookup
  let materials_new = {};
  Object.keys(coloursJSON).forEach((colourSetId) => {
    materials_new[colourSetId] = 0;
  });
  maps.forEach((rowOfMaps) => {
    rowOfMaps.forEach((map) => {
      Object.keys(map.materials).forEach((colourSetId) => {
        materials_new[colourSetId] += map.materials[colourSetId];
      });
    });
  });
  maps[0][0].materials = materials_new;
  maps = [[maps[0][0]]];
}

function setupColoursLayoutsFromPixelsData() {
  const mapSize_x = maps[0].length;
  const mapSize_z = maps.length;
  for (let whichMap_z = 0; whichMap_z < mapSize_z; whichMap_z++) {
    for (let whichMap_x = 0; whichMap_x < mapSize_x; whichMap_x++) {
      let coloursLayout = [];
      for (let columnNumber = 0; columnNumber < 128; columnNumber++) {
        let coloursLayout_columnToPush = [];
        for (let rowNumber = 0; rowNumber < 128; rowNumber++) {
          const pixelsData_offset = 4 * (128 * mapSize_x * (128 * whichMap_z + rowNumber) + 128 * whichMap_x + columnNumber);
          const colourSetIdAndTone = exactRGBToColourSetIdAndTone([
            pixelsData[pixelsData_offset],
            pixelsData[pixelsData_offset + 1],
            pixelsData[pixelsData_offset + 2],
          ]);
          coloursLayout_columnToPush.push(colourSetIdAndTone);
        }
        coloursLayout.push(coloursLayout_columnToPush);
      }
      maps[whichMap_z][whichMap_x].coloursLayout = coloursLayout;
    }
  }
}

onmessage = (e) => {
  coloursJSON = e.data.body.coloursJSON;
  MapModes = e.data.body.MapModes;
  WhereSupportBlocksModes = e.data.body.WhereSupportBlocksModes;
  optionValue_version = e.data.body.optionValue_version;
  optionValue_staircasing = e.data.body.optionValue_staircasing;
  optionValue_whereSupportBlocks = e.data.body.optionValue_whereSupportBlocks;
  optionValue_supportBlock = e.data.body.optionValue_supportBlock;
  pixelsData = e.data.body.pixelsData;
  maps = e.data.body.maps;
  currentSelectedBlocks = e.data.body.currentSelectedBlocks;

  const headerMessage = e.data.head;

  setupExactColourCache();
  setupColoursLayoutsFromPixelsData();

  if (["CREATE_NBT_JOINED_FOR_VIEW_ONLINE", "CREATE_NBT_JOINED"].includes(headerMessage)) {
    mergeMaps();
  }

  progressReportHead = `PROGRESS_REPORT_${headerMessage}`;

  switch (headerMessage) {
    case "CREATE_NBT_JOINED_FOR_VIEW_ONLINE":
    case "CREATE_NBT_JOINED":
    case "CREATE_NBT_SPLIT": {
      for (let whichMap_y = 0; whichMap_y < maps.length; whichMap_y++) {
        for (let whichMap_x = 0; whichMap_x < maps[0].length; whichMap_x++) {
          const map_NBT = new Map_NBT(maps[whichMap_y][whichMap_x]);
          const NBT_Array = map_NBT.getNBT();
          postMessage({
            head: headerMessage === "CREATE_NBT_JOINED_FOR_VIEW_ONLINE" ? "NBT_FOR_VIEW_ONLINE" : "NBT_ARRAY",
            body: {
              whichMap_x: whichMap_x,
              whichMap_y: whichMap_y,
              NBT_Array: NBT_Array,
            },
          });
        }
      }
      break;
    }
    case "CREATE_MAPDAT_SPLIT":
    case "CREATE_MAPDAT_SPLIT_ZIP": {
      for (let whichMap_y = 0; whichMap_y < maps.length; whichMap_y++) {
        for (let whichMap_x = 0; whichMap_x < maps[0].length; whichMap_x++) {
          const map_Mapdat = new Map_Mapdat(maps[whichMap_y][whichMap_x]);
          const Mapdat_Bytes = map_Mapdat.getNBT();
          postMessage({
            head: headerMessage === "CREATE_MAPDAT_SPLIT_ZIP" ? "MAPDAT_BYTES_ZIP" : "MAPDAT_BYTES",
            body: {
              whichMap_x: whichMap_x,
              whichMap_y: whichMap_y,
              Mapdat_Bytes: Mapdat_Bytes,
            },
          });
        }
      }
      break;
    }
    default: {
      throw new Error("Unknown header message");
    }
  }
};
