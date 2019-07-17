#!/usr/bin/python3
#Generates an image with all colors
import json
from PIL import Image
from PIL import ImageFilter

version = "1.13"
blockslist = {}
with open("../js/colorlist.js","r") as f:
    blockslist = json.loads(f.read()[21:-1])

im      = Image.new("RGB", (128, 128), "white")
pix     = im.load()

i = [0,0]
for color in blockslist[version]:
    c = color[0][1]
    for block in color[1]:
        pix[(i[0],i[1])] = tuple(c)
        i[0]+=1
        if i[0] == 128:
            i[0] = 0
            i[1] += 1
im.save("testmap.png","PNG")