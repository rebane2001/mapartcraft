# Rebane Master Branch

- Valley 3D mode
- View online

# Yes

- Look at issues on Rebane repo
- Optimise renders; orange wool -> orange concrete doesn't need another render; just make sure to update `currentSelectedBlocks` in `currentMaterialsData` in controller
- Review locale jsons and `EN:` prefix, also strings such as preprocessing background "Off" etc can be obtained from existing locale strings
- 'Edit' mode for colour replacements etc: issue #124
- CLI

# Maybe
- Add unobtainable colours to PDN palette if mapdat mode and unobtainable selected
- Flammable parameter glass layer
- 2.5D maps (jkascpkmc's Fox for inspo)
- Linear / none interpolation option for small uploads if easy
- Hall of fame

# Code Refactoring

- Object.keys -> Object.entries when appropriate
