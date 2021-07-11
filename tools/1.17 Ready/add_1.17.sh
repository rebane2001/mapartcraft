#!/bin/sh

oneSeventeenVersion="1.17.1"
oneSeventeenDataVersion="2730"
baseFolderName="1.17\ Ready"

cd ..

./addMinecraftVersion.py "$oneSeventeenVersion" "$oneSeventeenDataVersion"

./addColoursJSONColourSet.py --verbose  59  70  70  70  86  86  86 100 100 100  52  52  52
./addColoursJSONColourSet.py --verbose  60 152 123 103 186 150 126 216 175 147 114  92  77
./addColoursJSONColourSet.py --verbose  61  89 117 105 109 144 129 127 167 150  67  88  79

./addColoursJSONBlock.py 58 -1 "Deepslate" -V "$oneSeventeenVersion" "deepslate" -t "$baseFolderName/deepslate.png"
./addColoursJSONBlock.py 58 -1 "Cobbled Deepslate" -V "$oneSeventeenVersion" "cobbled_deepslate" -t "$baseFolderName/cobbled_deepslate.png"
./addColoursJSONBlock.py 58 -1 "Cobbled Deepslate Slab" -V "$oneSeventeenVersion" "cobbled_deepslate_slab" -t "$baseFolderName/cobbled_deepslate_slab.png" -s

./addColoursJSONBlock.py 59 -1 "Block Of Raw Iron" -V "$oneSeventeenVersion" "raw_iron_block" -t "$baseFolderName/raw_iron_block.png"

./addColoursJSONBlock.py 60 -1 "Glow Lichen" -V "$oneSeventeenVersion" "glow_lichen" "down" "true" -t "$baseFolderName/glow_lichen.png" -s -f

./addColoursJSONBlock.py 6 -1 "Leaves (Azalea)" -V "$oneSeventeenVersion" "azalea_leaves" "persistent" "true" -t "$baseFolderName/azalea_leaves.png" -f

./addColoursJSONBlock.py 42 -1 "Tuff" -V "$oneSeventeenVersion" "tuff" -t "$baseFolderName/tuff.png"

./addColoursJSONBlock.py 35 -1 "Calcite" -V "$oneSeventeenVersion" "calcite" -t "$baseFolderName/calcite.png"

./addColoursJSONBlock.py 23 -1 "Amethyst Block" -V "$oneSeventeenVersion" "amethyst_block" -t "$baseFolderName/amethyst_block.png"

./addColoursJSONBlock.py 14 -1 "Block Of Raw Copper" -V "$oneSeventeenVersion" "raw_copper_block" -t "$baseFolderName/raw_copper_block.png"

./addColoursJSONBlock.py 29 -1 "Block Of Raw Gold" -V "$oneSeventeenVersion" "raw_gold_block" -t "$baseFolderName/raw_gold_block.png"

./addColoursJSONBlock.py 8 5 "Rooted Dirt" -V "$oneSeventeenVersion" "rooted_dirt" -t "$baseFolderName/rooted_dirt.png"

./addColoursJSONBlock.py 14 -1 "Waxed Block Of Copper" -V "$oneSeventeenVersion" "waxed_copper_block" -t "$baseFolderName/waxed_copper_block.png"
./addColoursJSONBlock.py 14 -1 "Waxed Cut Copper Slab" -V "$oneSeventeenVersion" "waxed_cut_copper_slab" -t "$baseFolderName/waxed_cut_copper_slab.png" -s

./addColoursJSONBlock.py 43 -1 "Waxed Exposed Copper" -V "$oneSeventeenVersion" "waxed_exposed_copper" -t "$baseFolderName/waxed_exposed_copper.png"
./addColoursJSONBlock.py 43 -1 "Waxed Exposed Cut Copper Slab" -V "$oneSeventeenVersion" "waxed_exposed_cut_copper_slab" -t "$baseFolderName/waxed_exposed_cut_copper_slab.png" -s

./addColoursJSONBlock.py 55 -1 "Waxed Weathered Copper" -V "$oneSeventeenVersion" "waxed_weathered_copper" -t "$baseFolderName/waxed_weathered_copper.png"
./addColoursJSONBlock.py 55 -1 "Waxed Weathered Cut Copper Slab" -V "$oneSeventeenVersion" "waxed_weathered_cut_copper_slab" -t "$baseFolderName/waxed_weathered_cut_copper_slab.png" -s

./addColoursJSONBlock.py 54 -1 "Waxed Oxidized Copper" -V "$oneSeventeenVersion" "waxed_oxidized_copper" -t "$baseFolderName/waxed_oxidized_copper.png"
./addColoursJSONBlock.py 54 -1 "Waxed Oxidized Cut Copper Slab" -V "$oneSeventeenVersion" "waxed_oxidized_cut_copper_slab" -t "$baseFolderName/waxed_oxidized_cut_copper_slab.png" -s

./addColoursJSONBlock.py 20 -1 "Tinted Glass" -V "$oneSeventeenVersion" "tinted_glass" -t "$baseFolderName/tinted_glass.png"

./addColoursJSONBlock.py 47 -1 "Dripstone Block" -V "$oneSeventeenVersion" "dripstone_block" -t "$baseFolderName/dripstone_block.png"
