#!/usr/bin/env python3

"""For adding a block to coloursJSON, and optionally a texture image to textures.png"""

import os
import logging

from SAOLogging import getParser, setupRootLogger
from JSONIO import JSONIO

filePath_coloursJSON = os.path.normpath("../src/components/mapart/json/coloursJSON.json")
filePath_textures = os.path.normpath("../src/images/textures.png")

def validateColourSetId(coloursJSON, colourSetId):
    logging.debug("Validating colourSetId")
    if not 0 <= colourSetId < 64 or not str(colourSetId) in coloursJSON:
        logging.error("colourSetId must be in range 0 to 63 and already present in coloursJSON")
        raise SystemExit
    logging.debug("Validated colourSetId")

def processBlockId(coloursJSON, colourSetId, blockId):
    logging.debug("Processing blockId")
    if blockId < -1:
        logging.error("Invalid blockId {}".format(blockId))
        raise SystemExit
    if blockId > len(coloursJSON[str(colourSetId)]["blocks"].keys()):
        logging.error("Invalid blockId {}; too large blockId leaves gaps".format(blockId))
        raise SystemExit
    blockId_processed = blockId
    if blockId == -1:
        blockId_processed = len(coloursJSON[str(colourSetId)]["blocks"].keys())
        logging.info("Defaulted blockId from -1 to {}".format(blockId_processed))
    logging.debug("Processed blockId")
    return blockId_processed

def processVersionsWithArgs(versionsWithArgs, print_usage):
    # first check if bad
    logging.debug("Parsing versions with args")
    logging.debug("Unparsed: {}".format(versionsWithArgs))
    logging.debug("Checking NAME_AND_ARGPAIRS to be NAME and an even number of ARGPAIRS for each version")
    for version in versionsWithArgs:
        if len(version) % 2 != 0:
            logging.debug("Check failed for {}".format(version))
            print_usage()
            logging.error("argument -V: NAME_AND_ARGPAIRS must be the NBTName entry of the version and an even number of NBTArgs arguments in 'key value' form")
            raise SystemExit
    logging.debug("Check passed")

    # we now know at least 2 elts in version
    versionsWithArgs_processed = []
    for version in versionsWithArgs:
        versionNumber = version.pop(0)
        NBTName = version.pop(0)
        processedVersion = [versionNumber, {"NBTName": NBTName, "NBTArgs": {}}]
        while True:
            try:
                NBTArgs_key = version.pop(0)
                NBTArgs_value = version.pop(0)
                processedVersion[1]["NBTArgs"][NBTArgs_key] = NBTArgs_value
            except IndexError:
                break
        versionsWithArgs_processed.append(processedVersion)
    logging.debug("Parsed: {}".format(versionsWithArgs_processed))
    logging.debug("Parsed versions with args")
    return versionsWithArgs_processed

def addBlock(coloursJSON,
    colourSetId,
    blockId,
    displayName,
    versionsWithArgs,
    referenceVersions,
    supportBlockMandatory,
    flammable):
    logging.debug("Adding block")
    newBlockEntry = {
        "displayName": displayName,
        "validVersions": {},
        "supportBlockMandatory": supportBlockMandatory,
        "flammable": flammable,
        "presetIndex": None
    }

    logging.debug("Block without versions or presetIndex: {}".format(newBlockEntry))
    for versionWithArgs in versionsWithArgs:
        versionWithArgs_key, versionWithArgs_value = versionWithArgs
        newBlockEntry["validVersions"][versionWithArgs_key] = versionWithArgs_value
    for referenceVersion in referenceVersions:
        version_key, version_value_core = referenceVersion
        version_value = "&{}".format(version_value_core)
        newBlockEntry["validVersions"][version_key] = version_value
    logging.debug("Block with versions {}".format(newBlockEntry))

    presetIndex = len(coloursJSON[str(colourSetId)]["blocks"].keys())
    logging.debug("Setting preset index to {}".format(presetIndex))
    newBlockEntry["presetIndex"] = presetIndex
    logging.debug("Block to add at colourSetId {} blockId {}: {}".format(colourSetId, blockId, newBlockEntry))

    newColourSetBlocksValue = {}
    for key, value in list(coloursJSON[str(colourSetId)]["blocks"].items())[:blockId]:
        newColourSetBlocksValue[key] = value
    newColourSetBlocksValue[str(blockId)] = newBlockEntry
    for key, value in list(coloursJSON[str(colourSetId)]["blocks"].items())[blockId:]:
        newColourSetBlocksValue[str(int(key) + 1)] = value
    coloursJSON[str(colourSetId)]["blocks"] = newColourSetBlocksValue

    logging.debug("Added block. Returning coloursJSON")
    return coloursJSON

def addTexture(coloursJSON,
        texturesSheetPath,
        textureImagePath,
        colourSetId,
        blockId):
    # NB by this point the new block has been added to coloursJSON
    logging.debug("Adding texture")
    logging.debug("Checking if texture image exists")
    if not os.path.exists(texturesSheetPath):
        logging.error("Texture image {} does not exist".format(textureImagePath))
        raise SystemExit
    logging.debug("Check passed")

    logging.debug("Expanding textures sheet if necessary")
    os.system("magick {texturesSheetPath} -background transparent -extent \"%[fx:max(w,{newWidth})]x%[h]\" {texturesSheetPath}".format(
        newWidth = str(32 * len(coloursJSON[str(colourSetId)]["blocks"].keys())),
        texturesSheetPath = texturesSheetPath))

    logging.debug("Moving existing blocks if necessary")
    numberOfBlocksToMove = len(list(coloursJSON[str(colourSetId)]["blocks"].keys())[blockId + 1:])
    os.system(
        "convert {texturesSheetPath} \
        \\( -clone 0 -crop {widthToMove}x32+{moveFrom_x}+{moveFrom_y} \\) \
        \\( -clone 0-1 -compose subtract -geometry +{moveFrom_x}+{moveFrom_y} -composite \\) -delete 0 +swap \
        -geometry +{moveTo_x}+{moveTo_y} -compose Over -composite \
        {texturesSheetPath}".format(
        texturesSheetPath = texturesSheetPath,
        widthToMove = str(32 * numberOfBlocksToMove),
        moveFrom_x = str(32 * blockId),
        moveFrom_y = str(32 * colourSetId),
        moveTo_x = str(32 * (blockId + 1)),
        moveTo_y = str(32 * colourSetId)
        )
    )

    logging.debug("Adding new image onto textures sheet")
    os.system("convert {texturesSheetPath} \\( {textureImagePath} -filter point -resize 32x32 \\) \
        -geometry +{placeAt_x}+{placeAt_y} -composite \
        {texturesSheetPath}".format(
        texturesSheetPath = texturesSheetPath,
        textureImagePath = textureImagePath,
        placeAt_x = str(32 * blockId),
        placeAt_y = str(32 * colourSetId)
    ))
    logging.debug("Added texture")

if __name__ == "__main__":
    parser = getParser(__doc__)

    parser.add_argument("colourSetId",
        help = "colourSetId of the colour set to add the block to",
        metavar = ("COLOURSETID",),
        type = int)
    parser.add_argument("blockId",
        help = "blockId within the colour set to add the block with. Set to -1 to default to the next available",
        metavar = ("BLOCKID",),
        type = int)
    parser.add_argument("displayName",
        help = "Block name to show to the user",
        metavar = ("DISPLAYNAME",))
    parser.add_argument("-s",
        help = "Flag for if the block requires support eg because of gravity or if it is a slab, default false",
        action = "store_true",
        dest = "supportBlockMandatory",
        default = False)
    parser.add_argument("-f",
        help = "Flag for if the block is flammable, default false",
        action = "store_true",
        dest = "flammable",
        default = False)
    # parser.add_argument("-p",
    #     help = "Manually set the preset-index of the block. Recommended to NOT do this",
    #     metavar = ("PRESETINDEX",),
    #     action = "store",
    #     type = int,
    #     dest = "presetIndex",
    #     default = None)
    parser.add_argument("-t",
        help = "Set texture in textures.png for block using image at TEXTUREPATH. Requires Imagemagick. Supply 16x16 image",
        metavar = ("TEXTUREPATH",),
        dest = "texturePath",
        default = None)
    parser.add_argument("--Version",
        help = "Add a version to this block that has full details (ie is not a reference to a different version). NAME_AND_ARGPAIRS must be the NBTName entry of the version and an even number of NBTArgs arguments in 'key value' form. Can be used multiple times.",
        metavar = ("NEWVERSION", "NAME_AND_ARGPAIRS"),
        nargs = "+",
        action = "append",
        dest = "versionsWithArgs",
        default = [])
    parser.add_argument("--version",
        help = "Add a version that is a reference to a different version. Can be used multiple times.",
        metavar = ("NEWVERSION", "REFERENCEVERSION"),
        nargs = 2,
        action = "append",
        dest = "referenceVersions",
        default = [])

    args = parser.parse_args()

    setupRootLogger(args.verbose, args.quiet)

    logging.debug("args: {}".format(args))

    logging.debug("Loading coloursJSON from {}".format(filePath_coloursJSON))
    coloursJSON = JSONIO.loadFromFilename(filePath_coloursJSON)
    logging.debug("Loaded coloursJSON")

    validateColourSetId(coloursJSON, args.colourSetId)

    blockId_processed = processBlockId(coloursJSON, args.colourSetId, args.blockId)

    versionsWithArgs_processed = processVersionsWithArgs(args.versionsWithArgs, parser.print_usage)

    coloursJSON = addBlock(coloursJSON,
        args.colourSetId,
        blockId_processed,
        args.displayName,
        versionsWithArgs_processed,
        args.referenceVersions,
        args.supportBlockMandatory,
        args.flammable)

    logging.debug("Saving coloursJSON to {}".format(filePath_coloursJSON))
    JSONIO.saveToFilename(filePath_coloursJSON, coloursJSON, indent = 4)
    logging.debug("Saved coloursJSON")

    if args.texturePath is not None:
        logging.info("Texture path specified; will try to add")
        addTexture(coloursJSON, filePath_textures, args.texturePath, args.colourSetId, blockId_processed)
