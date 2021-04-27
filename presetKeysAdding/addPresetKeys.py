import json

with open("./coloursJSON.json") as f:
    colours = json.load(f)

with open("./rebane.json") as f:
    rebane = json.load(f)

for colourSetIndex, colourSet in enumerate(rebane["base"]):
    for block in colourSet[1]:
        name = block[2]
        found = [
            (foundBlockKey, foundBlockValue)
            for (foundBlockKey, foundBlockValue) in colours[str(colourSetIndex)]["blocks"].items()
            if foundBlockValue["displayName"] == name
        ]
        colours[str(colourSetIndex)]["blocks"][found[0][0]]["presetIndex"] = int(block[5])

for colourSetId in [51, 52, 53, 54, 55, 56, 57]:
    colourSetId = str(colourSetId)
    for blockId, blockValue in colours[colourSetId]["blocks"].items():
        blockValue["presetIndex"] = int(blockId)

for coloursetValue in colours.values():
    for blockValue in coloursetValue["blocks"].values():
        if not "presetIndex" in blockValue:
            blockValue["presetIndex"] = 1 + max(block["presetIndex"] for block in coloursetValue["blocks"].values() if "presetIndex" in block)

with open("./coloursJSONNew.json", "w") as f:
    f.write(json.dumps(colours, indent = 4))

for coloursetValue in colours.values():
    for block in coloursetValue["blocks"].values():
        assert "presetIndex" in block and type(block["presetIndex"]) == int
