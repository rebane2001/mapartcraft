import os
import json
from convertColoursList import convertMain

class ColoursJSON():
    @staticmethod
    def loadJSON(filename):
        filename = os.path.normpath(filename)
        with open(filename) as f:
            loadedJSON = json.load(f)
        return loadedJSON

    @staticmethod
    def saveJSON(filename, JSONToSave):
        filename = os.path.normpath(filename)
        with open(filename, "w") as f:
            f.write(json.dumps(JSONToSave, indent = 4))

    def __init__(self, dictionary = {}):
        self.dictionary = dictionary

    @classmethod
    def fromFilename(cls, filename):
        return cls(cls.loadJSON(filename))

    def save(self, filename):
        self.saveJSON(filename, self.dictionary)

    @staticmethod
    def newBlock(displayName,
        validVersions,
        supportBlockMandatory,
        flammable,
        NBTWorkerName1_12 = None,
        NBTWorkerArgs1_12 = None,
        NBTWorkerNameFlattening = None,
        NBTWorkerArgsFlattening = None,
        ):
        returnDict = {
            "displayName": displayName,
            "validVersions": validVersions,
            "supportBlockMandatory": supportBlockMandatory,
            "flammable": flammable,
            }
        if NBTWorkerName1_12 is not None:
            returnDict["NBTWorkerName1.12"] = NBTWorkerName1_12
        if NBTWorkerArgs1_12 is not None:
            returnDict["NBTWorkerArgs1.12"] = NBTWorkerArgs1_12
        if NBTWorkerNameFlattening is not None:
            returnDict["NBTWorkerNameFlattening"] = NBTWorkerNameFlattening
        if NBTWorkerArgsFlattening is not None:
            returnDict["NBTWorkerArgsFlattening"] = NBTWorkerArgsFlattening
        return returnDict

    def changeBlock(self,
        colourSetId,
        blockId,
        displayName,
        validVersions,
        supportBlockMandatory,
        flammable,
        NBTWorkerName1_12 = None,
        NBTWorkerArgs1_12 = None,
        NBTWorkerNameFlattening = None,
        NBTWorkerArgsFlattening = None,
        ):
        colourSetBlocks = self.dictionary[str(colourSetId)]["blocks"]
        colourSetBlocks[str(blockId)] = self.newBlock(
            displayName,
            validVersions,
            supportBlockMandatory,
            flammable,
            NBTWorkerName1_12,
            NBTWorkerArgs1_12,
            NBTWorkerNameFlattening,
            NBTWorkerArgsFlattening
        )

    def addNewBlock(self,
        colourSetId,
        displayName,
        validVersions,
        supportBlockMandatory,
        flammable,
        NBTWorkerName1_12 = None,
        NBTWorkerArgs1_12 = None,
        NBTWorkerNameFlattening = None,
        NBTWorkerArgsFlattening = None,
        ):
        colourSetBlocks = self.dictionary[str(colourSetId)]["blocks"]
        newBlockId = str(len(colourSetBlocks.keys()))
        colourSetBlocks[newBlockId] = self.newBlock(
            displayName,
            validVersions,
            supportBlockMandatory,
            flammable,
            NBTWorkerName1_12,
            NBTWorkerArgs1_12,
            NBTWorkerNameFlattening,
            NBTWorkerArgsFlattening
        )

    def rearrangeColourSet(self, colourSetId, newOrder):
        self.dictionary[str(colourSetId)]["blocks"] = {
            str(index): self.dictionary[str(colourSetId)]["blocks"][str(key)] for (index, key) in enumerate(newOrder)
        }

if __name__ == "__main__":
    convertMain()
    coloursFilename = "./SAOColoursList.json"

    colours = ColoursJSON.fromFilename(coloursFilename)

    # 1.12.2
    colours.addNewBlock( # TODO rearrange
        27,
        "Bricks Slab",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "stone_slab",
        {"variant": "brick"},
        "brick_slab",
        {}
    )
    colours.addNewBlock(
        34,
        "Red Nether Bricks",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "red_nether_brick",
        {},
        "red_nether_bricks",
        {}
    )
    colours.addNewBlock(
        9,
        "Stone Bricks",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "stonebrick",
        {"variant": "stonebrick"},
        "stone_bricks",
        {}
    )
    colours.addNewBlock(
        9,
        "Stone Brick Slab",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "stone_slab",
        {"variant": "stonebrick"},
        "stone_brick_slab",
        {}
    )
    colours.addNewBlock( # rearrange
        14,
        "Red Sandstone Slab",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "stone_slab2",
        {"variant": "red_sandstone"},
        "red_sandstone_slab",
        {}
    )
    colours.addNewBlock(
        9,
        "Mossy Cobblestone",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "mossy_cobblestone",
        {},
        "mossy_cobblestone",
        {}
    )
    colours.addNewBlock(
        1,
        "End Stone Bricks",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "end_bricks",
        {},
        "end_stone_bricks",
        {}
    )
    colours.addNewBlock(
        1,
        "Bone Block",
        [
            "1.12.2",
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        "bone_block",
        {},
        "bone_block",
        {}
    )

    # 1.13.2
    colours.addNewBlock(
        2,
        "Mushroom Stem",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "mushroom_stem",
        {}
    )
    colours.addNewBlock(
        22,
        "Prismarine Slab",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "prismarine_slab",
        {}
    )
    colours.addNewBlock(
        30,
        "Prismarine Brick Slab",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "prismarine_brick_slab",
        {}
    )
    colours.addNewBlock(
        30,
        "Dark Prismarine Slab",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "dark_prismarine_slab",
        {}
    )
    colours.addNewBlock(
        25,
        "Dried Kelp Block",
        [
            "1.13.2"
        ],
        False,
        False,
        None,
        None,
        "dried_kelp_block",
        {}
    )
    colours.addNewBlock(
        26,
        "Dried Kelp Block",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        True,
        None,
        None,
        "dried_kelp_block",
        {}
    )
    colours.addNewBlock(
        4,
        "Blue Ice",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "blue_ice",
        {}
    )
    colours.addNewBlock(
        20,
        "Dead Tube Coral Block",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "dead_tube_coral_block",
        {}
    )
    colours.addNewBlock(
        20,
        "Dead Brain Coral Block",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "dead_brain_coral_block",
        {}
    )
    colours.addNewBlock(
        20,
        "Dead Bubble Coral Block",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "dead_bubble_coral_block",
        {}
    )
    colours.addNewBlock(
        20,
        "Dead Fire Coral Block",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "dead_fire_coral_block",
        {}
    )
    colours.addNewBlock(
        20,
        "Dead Horn Coral Block",
        [
            "1.13.2",
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "dead_horn_coral_block",
        {}
    )

    # 1.14.4
    colours.addNewBlock(
        1,
        "End Stone Brick Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "end_stone_brick_slab",
        {}
    )
    colours.addNewBlock(
        9,
        "Mossy Cobblestone Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "mossy_cobblestone_slab",
        {}
    )
    colours.addNewBlock(
        8,
        "Granite Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "granite_slab",
        {}
    )
    colours.addNewBlock(
        9,
        "Andesite Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "andesite_slab",
        {}
    )
    colours.addNewBlock(
        12,
        "Diorite Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "diorite_slab",
        {}
    )
    colours.addNewBlock(
        34,
        "Red Nether Brick Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "red_nether_brick_slab",
        {}
    )
    colours.addNewBlock(
        9,
        "Stone Slab",
        [
            "1.14.4",
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "stone_slab",
        {}
    )

    # 1.15
    colours.addNewBlock(
        14,
        "Honey Block",
        [
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "honey_block",
        {}
    )
    colours.addNewBlock(
        14,
        "Honeycomb Block",
        [
            "1.15.2",
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "honeycomb_block",
        {}
    )

    # 1.16
    colours.addNewBlock(
        25,
        "Soul Soil",
        [
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "soul_soil",
        {}
    )
    colours.addNewBlock(
        27,
        "Shroomlight",
        [
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "shroomlight",
        {}
    )
    colours.addNewBlock(
        28,
        "Crying Obsidian",
        [
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "crying_obsidian",
        {}
    )
    colours.addNewBlock(
        28,
        "Blackstone",
        [
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "blackstone",
        {}
    )
    colours.addNewBlock(
        28,
        "Blackstone Slab",
        [
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "blackstone_slab",
        {}
    )
    colours.addNewBlock(
        28,
        "Block Of Netherite",
        [
            "1.16.5"
        ],
        False,
        False,
        None,
        None,
        "netherite_block",
        {}
    )

    colours.rearrangeColourSet(1, [0,1,2,3,4,5,6,7,8,10,9])
    # 9 contains very special case for stone slabs which forces me to rethink the architecture of the JSON
    colours.rearrangeColourSet(12, [0,1,5,2,3,4])
    colours.rearrangeColourSet(14, [0,1,2,3,4,5,6,7,8,9,10,12,11,13,14])
    colours.rearrangeColourSet(25, [0,1,2,3,4,5,6,8,7,9,10,12,11])
    colours.rearrangeColourSet(27, [0,1,2,3,4,5,6,8,7,9])
    colours.rearrangeColourSet(30, [0,1,4,2,5,3])


    colours.save(coloursFilename)
