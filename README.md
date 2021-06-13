# MapartCraft React (WIP)

A React JS refactor fork of Rebane2001's [MapartCraft](https://github.com/rebane2001/mapartcraft)

Current WIP versions hosted [here](https://area51.selfadjointoperator.com/mapartcraft/)

## Changes

### Closes issues

- #165
- #162
- #161
- #159
- #154
- #141
- #136
- #135
- #123
- #116
- #111
- #106
- #60?
- #55
- #39
- #31: maybe no hard limit
- #30

### Building

- Remove the need for `render_html.py`: `npm run build` creates the final product
- Remove the need for `ImageMagick` / `create_img.bat`
- Remove the need for `create_css.py`: all textures are in one png that correspond in x and y with `coloursJSON.json`

### Internal

- Split the monolithic main js file into multiple smaller components
- All locales for the website are managed via React Router instead of building separate pages; a .htaccess template is provided for Apache
- Rearranged locale JSONs

### For Users

- Trim supported versions down: eg drop 1.12, 1.12.1 in favour of just 1.12.2...
- Added 4th colour to colour boxes in block selection pane when mapdat option and unobtainable box selected
- Original map preview had to finish its current rendering before re-rendering if an option changed mid render; now the map rendering worker is immediately terminated and relaunched if an option changes mid render to save time
- Remove 'seconds remaining' from progress bar as it was inaccurate, and unnecessary with percentage shown also
- Materials count now auto-updates
- Support-block single mode is now optimised
- Add tolerance slider for transparency in Mapdats
- Preprocessing background colour options
- Materials 'placeholder block' now dynamically updates its image
- Add nice predictive text to 'block to add' option
- Creation of NBTs and Mapdats is now non-blocking (done on a separate thread)

## Requirements

- Node JS

## Running

Acquire packages with `npm install`. Build using `npm run build`, or run debug version with `npm start`

## Building / Hosting

`build.sh` is a bash script that will build the app, and copy a `.htaccess` file to the build folder if Apache is detected on the system

The default build settings assume the site is being hosted at https://YOUR_SITE_HERE.com/mapartcraft. To change the folder from which the site is hosted modify the following:

- `homepage` in `package.json`
- `basename` in the Router in `src/app.js`
- The `RewriteRule` in `buildSources/apache/.htaccess` if using Apache
