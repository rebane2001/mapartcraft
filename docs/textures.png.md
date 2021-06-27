# Textures.png

The image `src/images/textures.png` contains all the textures of blocks for the block selection component, and a few other textures. The textures are arranged into a grid of 32x32px entries, y-position corresponding to colourSetId, x-position corresponding to blockId within a colourSet. There are 65 rows to `textures.png`: the first 64 correspond to the (soft limit) of 64 colours that Mojang use in maps so far.

The 65th row at the bottom contains extra textures, currently:

- Reserved blank / transparent
- Barrier
- Placeholder block (for unknown support block)
- Plus for preview size
- Minus for preview size
