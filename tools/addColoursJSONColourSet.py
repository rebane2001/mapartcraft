#!/bin/env python3

"""For adding an empty colourSet to coloursJSON"""

import os
import argparse
import logging

from JSONIO import JSONIO

filePath_coloursJSON = os.path.normpath("../src/components/mapart/coloursJSON.json")

def addColourSet(coloursJSON, mapdatId, tonesRGB):
    logging.debug("Adding colourSet")
    newColourSet_key = len(coloursJSON.keys())
    logging.info("New colourSetId: {}".format(str(newColourSet_key)))
    if newColourSet_key >= 64:
        logging.warning("colourSetId {} >= 64; this is unsupported and may break both mapdats and coloursJSON / textures.png".format(str(newColourSet_key)))
    newColourSet_value = {
        "tonesRGB": {
            "dark": [],
            "normal": [],
            "light": [],
            "unobtainable": [],
        },
        "blocks": {},
        "mapdatId": mapdatId
    }
    for toneIndex, toneKey in enumerate(newColourSet_value["tonesRGB"].keys()):
        newColourSet_value["tonesRGB"][toneKey] = tonesRGB[3 * toneIndex: 3 * (toneIndex + 1)]
    logging.debug("colourSet to add: {}".format(newColourSet_value))
    coloursJSON[str(newColourSet_key)] = newColourSet_value
    logging.debug("Added colourSet")
    return coloursJSON

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="""Tool for adding an empty colour set to coloursJSON.json.""")
    parser.add_argument("--verbose",
        help = "Increase logging verbosity: --verbose for info, --verbose --verbose for debug",
        action = "count",
        default = 0)
    # parser.add_argument("colourSetId",
    #     help = "colourSetId of the colour set to add. Recommended to NOT do this manually but instead call this script multiple times in the order desired",
    #     metavar = ("COLOURSETID",),
    #     action = "store",
    #     type = int)
    parser.add_argument("mapdatId",
        help = "Mojang-specified mapdatId (see https://minecraft.fandom.com/wiki/Map_item_format#Color_table)",
        metavar = "MAPDATID",
        action = "store",
        type = int)
    parser.add_argument("tonesRGB",
        help = "Tones specified in RGB form in the order dark normal light unobtainable",
        metavar = "TONESRGB",
        nargs = 12,
        action = "store",
        type = int)

    args = parser.parse_args()

    if args.verbose >= 2:
        loggingLevel = logging.DEBUG
    elif args.verbose == 1:
        loggingLevel = logging.INFO
    else:
        loggingLevel = logging.WARNING
    logging.basicConfig(format = "[%(asctime)s][%(levelname)s] %(message)s (%(filename)s:%(lineno)d)",
        datefmt = "%Y-%m-%d %H:%M:%S",
        level = loggingLevel)

    logging.debug("args: {}".format(args))

    logging.debug("Loading coloursJSON from {}".format(filePath_coloursJSON))
    coloursJSON = JSONIO.loadFromFilename(filePath_coloursJSON)
    logging.debug("Loaded coloursJSON")

    coloursJSON = addColourSet(coloursJSON, args.mapdatId, args.tonesRGB)

    logging.debug("Saving coloursJSON to {}".format(filePath_coloursJSON))
    JSONIO.saveToFilename(filePath_coloursJSON, coloursJSON, indent = 4)
    logging.debug("Saved coloursJSON")
