#!/bin/env python3

"""For adding to the necessary files to add another Minecraft version"""

import argparse

from JSONIO import JSONIO

def addVersion_coloursJSON(MCVersion):
    coloursJSON = JSONIO.loadFromFilename("../src/components/mapart/coloursJSON.json")
    supportedVersions = JSONIO.loadFromFilename("../src/components/mapart/json/supportedVersions.json")
    lastVersion = list(supportedVersions.values())[-1]["MCVersion"]
    for colourSet in coloursJSON.values():
        for block in colourSet["blocks"].values():
            if lastVersion in block["validVersions"]:
                if isinstance(block["validVersions"][lastVersion], str):
                    block["validVersions"][MCVersion] = block["validVersions"][lastVersion]
                else:
                    block["validVersions"][MCVersion] = "&{}".format(lastVersion)
    JSONIO.saveToFilename("../src/components/mapart/coloursJSON.json", coloursJSON, indent = 4)


def addVersion_supportedVersions(MCVersion, DataVersion):
    supportedVersions = JSONIO.loadFromFilename("../src/components/mapart/json/supportedVersions.json")
    supportedVersions[MCVersion.replace(".", "_")] = {"MCVersion": MCVersion, "NBTVersion": DataVersion}
    JSONIO.saveToFilename("../src/components/mapart/json/supportedVersions.json", supportedVersions)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="""Tool for adding a version to coloursJSON.json and supportedVersions.json.
        This assumes that all blocks valid for the current last version are also valid for the version to be added; do check first!""")
    parser.add_argument("MCVersion",
                        action = "store",
                        help = "Minecraft version to add, eg '1.14.4'")
    parser.add_argument("DataVersion",
                        action = "store",
                        help = "Minecraft data version to add, eg '1976' for 1.14.4",
                        type = int)
    args = parser.parse_args()

    addVersion_coloursJSON(args.MCVersion)
    addVersion_supportedVersions(args.MCVersion, args.DataVersion)
