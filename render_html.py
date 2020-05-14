import shutil
import json
import os

# Path to mapartcraft once it is on the web
root_path = "/web"

for langjsonfile in os.listdir('languages'):
    langcode = langjsonfile.split(".")[0]
    print(f"Creating HTML for {langcode}")
    with open(f"languages/{langjsonfile}","r") as f:
        langjson = json.load(f)
    # Hack to edit the css files
    langjson["css/spritesheet.css"] = {}
    langjson["css/app.css"] = {}
    shutil.copytree("template", f"web/{langcode}", dirs_exist_ok=True)
    for path in langjson:
        with open(f"web/{langcode}/{path}", "r") as f:
            target = f.read()
        target = target.replace(f"%%ROOTPATH%%",root_path)
        target = target.replace(f"%%HTMLLANG%%",langcode)
        for key, value in langjson[path].items():
            target = target.replace(f"%%{key}%%",value)
        with open(f"web/{langcode}/{path}", "w") as f:
            f.write(target)

for f in os.listdir("web/en/"):
    shutil.move(f"web/en/{f}", "web/")
os.rmdir("web/en")
shutil.move(f"img","web/")