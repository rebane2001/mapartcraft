#!/usr/bin/python3
#https://github.com/rebane2001/mapartcraft
#Create stylesheet for block images
from PIL import Image
from os import listdir

im = Image.open("img/blocks.png")
w, h = im.size
blocks = listdir("temp")
offsets_x = [[] for i in range(int(w/32))]
offsets_y = [[] for i in range(int(h/32))]
css = """
.block{
    width: 32px;
    height: 32px;
    background-image: url(../img/blocks.png);
}

"""

blocks.sort() #sorts the same way as imagemagick hopefully

i = 0
for y in range(int(h/32)):
    for x in range(int(w/32)):
        if i == len(blocks):
            break
        block = blocks[i][:-4]
        print(x,y,block)
        offsets_x[x].append(block)
        offsets_y[y].append(block)
        i+=1

for i,offset in enumerate(offsets_x):
    for block in offset:
        css += ".block-" + block + ",\n"
    css = css[:-2] + "{\n\tbackground-position-x: -" + str(i) + "00%\n}\n\n"
for i,offset in enumerate(offsets_y):
    for block in offset:
        css += ".block-" + block + ",\n"
    css = css[:-2] + "{\n\tbackground-position-y: -" + str(i) + "00%\n}\n\n"

with open("css/spritesheet.css","w") as f:
    f.write(css)