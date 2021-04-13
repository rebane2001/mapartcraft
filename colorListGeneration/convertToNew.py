import os
import json

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

    def convertToNew(self):
        for _, colourSet in self.dictionary.items():
            for _, block in colourSet["blocks"].items():
                block["validVersions"] = {version: None for version in block["validVersions"]}
                if "1.12.2" in block["validVersions"]:
                    block["validVersions"]["1.12.2"] = {
                        "NBTName": block["NBTWorkerName1.12"],
                        "NBTArgs": block["NBTWorkerArgs1.12"]
                    }
                    del block["NBTWorkerName1.12"]
                    del block["NBTWorkerArgs1.12"]
                non112Versions = [key for key in block["validVersions"].keys() if key != "1.12.2"]
                if non112Versions:
                    block["validVersions"][non112Versions[0]] = {
                        "NBTName": block["NBTWorkerNameFlattening"],
                        "NBTArgs": block["NBTWorkerArgsFlattening"]
                    }
                    for otherNon112 in non112Versions[1:]:
                        block["validVersions"][otherNon112] = "&{}".format(non112Versions[0])
                    del block["NBTWorkerNameFlattening"]
                    del block["NBTWorkerArgsFlattening"]

        # now correct for duplicates eg obsidian
        for _, colourSet in self.dictionary.items():
            for _, block in colourSet["blocks"].items():
                actualOptsKeys = [key for key, value in block["validVersions"].items() if type(value) != str]
                assert len (actualOptsKeys) <= 2
                if len (actualOptsKeys) == 2: # non above 2 currently
                    assert actualOptsKeys[0] == "1.12.2" # all at least have 1.12.2
                    if block["validVersions"][actualOptsKeys[0]] == block["validVersions"][actualOptsKeys[1]]: # then set everything else to &1.12.2
                        print(block["displayName"])
                        for key in block["validVersions"]:
                            if key != "1.12.2":
                                block["validVersions"][key] = "&1.12.2"

        # TODO special case for #9

    # def rearrangeColourSet(self, colourSetId, newOrder):
    #     self.dictionary[str(colourSetId)]["blocks"] = {
    #         str(index): self.dictionary[str(colourSetId)]["blocks"][str(key)] for (index, key) in enumerate(newOrder)
    #     }

if __name__ == "__main__":
    filename_in = "./SAOColoursListOld.json"
    filename_out = "./SAOColoursList.json"

    colours = ColoursJSON.fromFilename(filename_in)
    colours.convertToNew()

    colours.save(filename_out)
