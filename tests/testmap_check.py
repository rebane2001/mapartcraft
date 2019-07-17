#!/usr/bin/python3
#https://github.com/rebane2001/rc-tools
#Goes through every pixel of image
import sys
import json
from PIL import Image
from PIL import ImageFilter

version = "1.13"
blockslist = {}
with open("../js/colorlist.js","r") as f:
    blockslist = json.loads(f.read()[21:-1])

im		= Image.open("testmap.png").convert("RGB")
pix		= im.load()

i = [0,0]
for color in blockslist[version]:
    c = color[0][1]
    for block in color[1]:
        if not pix[(i[0],i[1])] == tuple(c):
        	print("Error found in:",block[2])
        i[0]+=1
        if i[0] == 128:
            i[0] = 0
            i[1] += 1