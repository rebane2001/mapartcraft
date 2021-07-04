#!/bin/env python3

import os
import json
import argparse


class JSONIO():
    @staticmethod
    def rectifiedPath(path):
        """Norm path to remove double // and ./../dir etc, and expand ~"""
        return os.path.expanduser(
            os.path.normpath(path)
        )

    @classmethod
    def loadFromFilename(cls, filename):
        filename = cls.rectifiedPath(filename)
        with open(filename) as f:
            return json.load(f)

    @classmethod
    def saveToFilename(cls, filename, JSONObject, indent=4):
        filename = cls.rectifiedPath(filename)
        with open(filename, "w") as f:
            f.write(
                json.dumps(JSONObject, indent=indent, ensure_ascii=False)
            )
            f.write("\n")


def addVersion_coloursJSON(MCVersion):
    coloursJSON = JSONIO.loadFromFilename("../src/components/mapart/coloursJSON.json")
    supportedVersions = JSONIO.loadFromFilename("../src/components/mapart/json/supportedVersions.json")
    lastVersion = list(supportedVersions.values())[-1]["MCVersion"]
    for colourSet in coloursJSON.values():
        for block in colourSet["blocks"].values():
            if lastVersion in block["validVersions"]:
                block["validVersions"][MCVersion] = "&{}".format(lastVersion)
    JSONIO.saveToFilename("../src/components/mapart/coloursJSON.json", coloursJSON)


def addVersion_supportedVersions(MCVersion, DataVersion):
    supportedVersions = JSONIO.loadFromFilename("../src/components/mapart/json/supportedVersions.json")
    supportedVersions[MCVersion.replace(".", "_")] = {"MCVersion": MCVersion, "NBTVersion": int(DataVersion)}
    JSONIO.saveToFilename("../src/components/mapart/json/supportedVersions.json", supportedVersions, indent=2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="""Tool for adding a version to coloursJSON.json and supportedVersions.json. This assumes that all blocks valid for the current last version are also valid for the version to be added; do check first!""")
    parser.add_argument("MCVersion",
                        action="store",
                        help="Minecraft version to add, eg '1.14.4'")
    parser.add_argument("DataVersion",
                        action="store",
                        help="Minecraft data version to add, eg '1976' for 1.14.4")
    args = parser.parse_args()

    addVersion_coloursJSON(args.MCVersion)
    addVersion_supportedVersions(args.MCVersion, args.DataVersion)
