# Mapartcraft
A Minecraft mapart schematic and map.dat generator, designed to be feasible for both server admins and survival players on servers like 2b2t, running in your browser  
  
# Requierments
The default building mechanism requires the following requierments, but you can easily modify them to work on different systems (eg Linux)  
- Windows
- ImageMagick
- Python3 (as `python.exe` in %PATH%)
- Pillow for Python

# Building
1. Replace `root_path` variable in `render_html.py` with the root path you will be hosting the site from. You can use `.`, but that will break languages other than English  
2. Run `make.bat`  
3. Your static website will be in the `web` directory, host it however you wish

# Usage
Visit [mapartcraft](https://rebane2001.com/mapartcraft) on [rebane2001.com](https://rebane2001.com) or use a mirror on [web.archive.org](https://web.archive.org/web/*/https://rebane2001.com/mapartcraft)  
Since all the processing occurs client-side, it is possible to host your own built instance with a very simple HTTP server, like python3's http.server  
However, it is recommended to use the [rebane2001.com](https://rebane2001.com/mapartcraft) site as it is always up to date with new features and bugfixes

# Credits/Thanks
Minecraft for the block textures  
[KenPixel Mini Square](https://opengameart.org/content/kenney-fonts) font by [Kenney](https://www.kenney.nl/)  
[Tooltip.js](https://github.com/matthias-schuetz/Tooltip) by [Matthias Schuetz](http://matthiasschuetz.com)  
[pako](https://github.com/matthias-schuetz/Tooltip)  
Translation credits can be seen on the translated pages  
Code contributors can be seen on the [contributions page](https://github.com/rebane2001/mapartcraft/graphs/contributors)