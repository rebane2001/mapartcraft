#!/usr/bin/env python3

"""For adding a version to coloursJSON.json and supportedVersions.json.
This assumes that all blocks valid for the current last version are also valid for the version to be added; do check first!"""

from SAOLogging import getParser, setupRootLogger
from JSONIO import JSONIO

def addVersion_coloursJSON(MCVersion):
    coloursJSON = JSONIO.loadFromFilename("../src/components/mapart/json/coloursJSON.json")
    supportedVersions = JSONIO.loadFromFilename("../src/components/mapart/json/supportedVersions.json")
    lastVersion = list(supportedVersions.values())[-1]["MCVersion"]
    for colourSet in coloursJSON.values():
        for block in colourSet["blocks"].values():
            if lastVersion in block["validVersions"]:
                if isinstance(block["validVersions"][lastVersion], str):
                    block["validVersions"][MCVersion] = block["validVersions"][lastVersion]
                else:
                    block["validVersions"][MCVersion] = "&{}".format(lastVersion)
    JSONIO.saveToFilename("../src/components/mapart/json/coloursJSON.json", coloursJSON, indent = 4)


def addVersion_supportedVersions(MCVersion, DataVersion):
    supportedVersions = JSONIO.loadFromFilename("../src/components/mapart/json/supportedVersions.json")
    supportedVersions[MCVersion.replace(".", "_")] = {"MCVersion": MCVersion, "NBTVersion": DataVersion}
    JSONIO.saveToFilename("../src/components/mapart/json/supportedVersions.json", supportedVersions)


if __name__ == "__main__":
    parser = getParser(__doc__)

    parser.add_argument("MCVersion",
        help = "Minecraft version to add, eg '1.14.4'")
    parser.add_argument("DataVersion",
        help = "Minecraft data version to add, eg '1976' for 1.14.4",
        type = int)

    args = parser.parse_args()

    setupRootLogger(args.verbose, args.quiet)

    addVersion_coloursJSON(args.MCVersion)
    addVersion_supportedVersions(args.MCVersion, args.DataVersion)
