
"""This file has been used once to generate the SAOColoursList.json file.
It does NOT need to be run each time building the project"""

import json
import os

def loadJSON(filename):
    filename = os.path.normpath(filename)
    with open(filename) as f:
        loadedJSON = json.load(f)
    return loadedJSON

def saveJSON(filename, JSONToSave):
    filename = os.path.normpath(filename)
    with open(filename, "w") as f:
        f.write(json.dumps(JSONToSave, indent = 4))

def SAO_RGBToHex(colorRGB):
    return ("#%02x%02x%02x" % colorRGB).upper()

if __name__ == "__main__":
    colours_old = loadJSON("./RebaneColoursList.json")
    colours_new = {}
    for colourSetNumber, colourSet in enumerate(colours_old):
        colours_new[str(colourSetNumber)] = {}
        colours_new[str(colourSetNumber)]["tones"] = {
            "dark": SAO_RGBToHex((colourSet[0][0][0],colourSet[0][0][1],colourSet[0][0][2])),
            "normal": SAO_RGBToHex((colourSet[0][1][0],colourSet[0][1][1],colourSet[0][1][2])),
            "light": SAO_RGBToHex((colourSet[0][2][0],colourSet[0][2][1],colourSet[0][2][2])),
            "unobtainable": SAO_RGBToHex((colourSet[0][3][0],colourSet[0][3][1],colourSet[0][3][2]))
            }
        colours_new[str(colourSetNumber)]["blocks"] = {}
        for blockNumber, block in enumerate(colourSet[1]):
            colours_new[str(colourSetNumber)]["blocks"][str(blockNumber)] = {
                "displayName": block[2],
                "validVersions": [
                    "1.12.2",
                    "1.13.2",
                    "1.14.4",
                    "1.15.2",
                    "1.16.5"
                ],
                "NBTWorkerName": block[0],
                "NBTWorkerArgs": {} if block[1] == "" else {key: value for (key, value) in [t.replace("'", "").split(":") for t in block[1].split(",")]},
                "supportBlockMandatory": block[3],
                "flammable": block[6]
            }
    patches = loadJSON("./RebanePatches.json")
    for patch in patches["1.13"]["patch"]:
        colourSetNumber = str(patch[0][0])
        blockNo = str(patch[0][1])
        # toAssert = colours_new[colourSetNumber]["blocks"][blockNo]
        # I manually changed colourSets 1 and 5 in ./RebanePatches for blockNos to align
        # assert toAssert["displayName"] == patch[1][2]
        # toAssert["validVersions"][-1]["to"] = "1.12.2"
        colours_new[colourSetNumber]["blocks"][blockNo]["validVersions"] = ["1.12.2"]
        blockNoNew = str(1 + max([int(t) for t in colours_new[colourSetNumber]["blocks"]]))
        block = patch[1]
        colours_new[colourSetNumber]["blocks"][blockNoNew] = {
            "displayName": block[2],
            "validVersions": [
                "1.13.2",
                "1.14.4",
                "1.15.2",
                "1.16.5"
            ],
            "NBTWorkerName": block[0],
            "NBTWorkerArgs": {} if block[1] == "" else {key: value for (key, value) in [t.replace("'", "").split(":") for t in block[1].split(",")]},
            "supportBlockMandatory": block[3],
            "flammable": block[6]
        }
    for remove in patches["1.13"]["remove"]:
        # just iron bars, again in ./RebanePatches changed so remove[0][1] is correct
        colourSetNumber = str(remove[0][0])
        blockNo = str(remove[0][1])
        colours_new[colourSetNumber]["blocks"][blockNo]["validVersions"] = ["1.12.2"]

    for addBlock in patches["1.16"]["add"]:
        colourSetNumber = str(addBlock[0][0])
        blockNo = str(addBlock[0][1])
        blockNoNew = str(1 + max([int(t) for t in colours_new[colourSetNumber]["blocks"]] + [-1]))
        theBlock = addBlock[1]
        colours_new[colourSetNumber]["blocks"][blockNoNew] = {
            "displayName": theBlock[2],
            "validVersions": [
                "1.16.5"
            ],
            "NBTWorkerName": theBlock[0],
            "NBTWorkerArgs": {} if theBlock[1] == "" else {key: value for (key, value) in [t.replace("'", "").split(":") for t in theBlock[1].split(",")]},
            "supportBlockMandatory": theBlock[3],
            "flammable": theBlock[6]
        }

    for addBlock in patches["1.16.2"]["add"]:
        colourSetNumber = str(addBlock[0][0])
        blockNo = str(addBlock[0][1])
        blockNoNew = str(1 + max([int(t) for t in colours_new[colourSetNumber]["blocks"]] + [-1]))
        theBlock = addBlock[1]
        colours_new[colourSetNumber]["blocks"][blockNoNew] = {
            "displayName": theBlock[2],
            "validVersions": [
                "1.16.5"
            ],
            "NBTWorkerName": theBlock[0],
            "NBTWorkerArgs": {} if theBlock[1] == "" else {key: value for (key, value) in [t.replace("'", "").split(":") for t in theBlock[1].split(",")]},
            "supportBlockMandatory": theBlock[3],
            "flammable": theBlock[6]
        }

    saveJSON("./SAOColoursList.json", colours_new)
