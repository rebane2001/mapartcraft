import shutil
import json
import os

for langjsonfile in os.listdir('languages'):
    langcode = langjsonfile.split(".")[0]
    print(f"Creating HTML for {langcode}")
    with open(f"languages/{langjsonfile}","r", encoding="UTF8") as f:
        langjson = json.load(f)
    # Hack to edit the css files
    langjson["css/spritesheet.css"] = {}
    langjson["css/app.css"] = {}
    shutil.copytree("template", f"web/{langcode}", dirs_exist_ok=True)
    for path in langjson:
        with open(f"web/{langcode}/{path}", "r", encoding="UTF8") as f:
            target = f.read()
        target = target.replace(f"%%ROOTPATH%%","." if langcode == en else "..")
        target = target.replace(f"%%HTMLLANG%%",langcode)
        for key, value in langjson[path].items():
            target = target.replace(f"%%{key}%%",value)
        with open(f"web/{langcode}/{path}", "w", encoding="UTF8") as f:
            f.write(target)

for f in os.listdir("web/en/"):
    shutil.move(f"web/en/{f}", "web/")
os.rmdir("web/en")
shutil.move(f"img","web/")