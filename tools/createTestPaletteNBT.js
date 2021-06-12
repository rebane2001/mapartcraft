// Add these to `nbt.jsworker` to create a schematic containing all valid blocks for a MC version.
// This is mainly to test if blocks have changed between MC versions.
// Watch out for redstone blocks and TNT being placed next to each other!

// set options:
//    size 1x1
//    staircasing CLASSIC
//    addblocksunder ALLDOUBLE



class Map_NBT_SpecialTest extends Map_NBT {
  constructor(map) {
    super(map);
    this.NBT_json.value.author.value = "TESTING_PALETTE";
    this.colourSetCycles = {}; // set in constructPaletteLookups
  }

  constructPaletteLookups() {
    for (const [colourSetId, colourSet] of Object.entries(coloursJSON)) {
      this.colourSetCycles[colourSetId] = { index: 0, modulo: 0 };
      for (const [blockId, block] of Object.entries(colourSet.blocks)) {
        if (optionValue_version.MCVersion in block.validVersions) {
          this.palette_colourSetId_paletteId[`${colourSetId}_${blockId}`] = this.palette_paletteId_colourSetId.length;
          this.palette_paletteId_colourSetId.push(`${colourSetId}_${blockId}`);
          this.colourSetCycles[colourSetId].modulo++;
        }
      }
    }
    this.palette_colourSetId_paletteId["NOOBLINE_SCAFFOLD"] = this.palette_paletteId_colourSetId.length;
    this.palette_paletteId_colourSetId.push("NOOBLINE_SCAFFOLD");
  }

  setNBT_json_palette() {
    this.palette_paletteId_colourSetId.forEach((colourSetIdBlockIdCombo) => {
      let paletteItemToPush = {};
      if (colourSetIdBlockIdCombo === "NOOBLINE_SCAFFOLD") {
        paletteItemToPush.Name = {
          type: TagTypes.string,
          value: `minecraft:${optionValue_supportBlock.toLowerCase()}`,
        };
      } else {
        const [, colourSetId, blockId] = colourSetIdBlockIdCombo.match(/(.*)_(.*)/);
        let blockNBTData = coloursJSON[colourSetId].blocks[blockId].validVersions[optionValue_version.MCVersion];
        if (typeof blockNBTData === "string") {
          // this is of the form eg "&1.12.2"
          blockNBTData = coloursJSON[colourSetId].blocks[blockId].validVersions[blockNBTData.slice(1)];
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

  setMapColoursLayout() {
    const colourSetIdRows = [
      [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28], // concrete
      [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50], // terracotta
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 29, 30, 31],
      [32, 33, 34, 51, 52, 53, 54, 55, 56, 57],
    ];
    this.mapColoursLayout = [];
    for (let i = 0; i < 128; i++) {
      this.mapColoursLayout.push([]);
    }
    for (let rowNumber = 0; rowNumber < colourSetIdRows.length; rowNumber++) {
      const colourSetIdRow = colourSetIdRows[rowNumber];
      for (let columnNumber = 0; columnNumber < colourSetIdRow.length; columnNumber++) {
        const colourSetId = colourSetIdRow[columnNumber].toString();
        for (const tone of ["dark", "normal", "light"]) {
          // create an 8x8 square
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              this.mapColoursLayout[8 * columnNumber + i].push({
                colourSetId: colourSetId,
                tone: tone,
              });
            }
          }
        }
      }
    }
    for (let i = 0; i < 128; i++) {
      for (let j = this.mapColoursLayout[i].length; j < 128; j++) {
        this.mapColoursLayout[i].push({
          colourSetId: "NOOBLINE_SCAFFOLD",
          tone: "normal",
        });
      }
    }
  }

  returnPhysicalBlock(x, y, z, colourSetId) {
    if (colourSetId === "NOOBLINE_SCAFFOLD") {
      return super.returnPhysicalBlock(x, y, z, colourSetId);
    } else {
      const blockToReturn = {
        pos: { type: TagTypes.list, value: { type: TagTypes.int, value: [x, y, z] } },
        state: { type: TagTypes.int, value: this.palette_colourSetId_paletteId[`${colourSetId}_0`] + this.colourSetCycles[colourSetId].index }, // assumes 0 always exists; on 1.12 gives undefined; grass shows
      };
      this.colourSetCycles[colourSetId].index++;
      this.colourSetCycles[colourSetId].index %= this.colourSetCycles[colourSetId].modulo;
      return blockToReturn;
    }
  }

  getNBT() {
    this.setMapColoursLayout();

    return super.getNBT();
  }
}



// Add to onmessage

  progressReportHead = "PROGRESS_REPORT_NBT_JOINED";
  let X = new Map_NBT_SpecialTest({ materials: {}, supportBlockCount: 0, coloursLayout: null });
  postMessage({
    head: "NBT_ARRAY",
    body: {
      whichMap_x: 0,
      whichMap_y: 0,
      NBT_Array: X.getNBT(),
    },
  });
  return;


