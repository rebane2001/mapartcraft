import shutil
import json
import os

def generateTranslationHTML():
    translationHTML = ""
    # We are not doing this automatically because we want to decide flag order
    languages = ["en", "et", "lt", "ru", "de", "fr", "it", "pt", "es", "zh", "eo"]
    for language in languages:
        with open(f"languages/{language}.json","r", encoding="UTF8") as f:
            langjson = json.load(f)
            translationHTML += f"<a href=\"%%ROOTPATH%%/{'' if language == 'en' else language}\"><img src=\"%%ROOTPATH%%/img/flag/{language}.svg\" alt=\"{langjson['index.html']['TRANSLATIONNAME']}\" height=\"50\"></a>"
    return translationHTML

with open("untranslated_strings.txt","w") as untranslated_strings:
    with open(f"languages/en.json","r", encoding="UTF8") as f:
        engjson = json.load(f)
        engjson["css/spritesheet.css"] = {}
        engjson["css/app.css"] = {}
    for langjsonfile in os.listdir('languages'):
        langcode = langjsonfile.split(".")[0]
        print(f"Creating HTML for {langcode}")
        with open(f"languages/{langjsonfile}","r", encoding="UTF8") as f:
            langjson = json.load(f)
        untranslated_strings.write(f"Untranslated strings for {langjson['index.html']['TRANSLATIONNAME']}:\n")
        # Hack to edit the css files
        langjson["css/spritesheet.css"] = {}
        langjson["css/app.css"] = {}
        shutil.copytree("template", f"web/{langcode}", dirs_exist_ok=True)
        for path in langjson:
            with open(f"web/{langcode}/{path}", "r", encoding="UTF8") as f:
                target = f.read()
            target = target.replace(f"%%TRANSLATIONHTML%%",generateTranslationHTML())
            target = target.replace(f"%%ROOTPATH%%","." if langcode == "en" else "..")
            target = target.replace(f"%%HTMLLANG%%",langcode)
            for key, value in langjson[path].items():
                target = target.replace(f"%%{key}%%",value)
            for key, value in engjson[path].items():
                if f"%%{key}%%" in target:
                    untranslated_strings.write(f"{key}\n")
                    print(f"{key} missing in {langjson['index.html']['TRANSLATIONNAME']}")
                    target = target.replace(f"%%{key}%%",value)
            with open(f"web/{langcode}/{path}", "w", encoding="UTF8") as f:
                f.write(target)

for f in os.listdir("web/en/"):
    shutil.move(f"web/en/{f}", "web/")
os.rmdir("web/en")
shutil.move(f"img","web/")