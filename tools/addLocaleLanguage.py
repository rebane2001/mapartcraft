#!/bin/env python3

"""Tool for adding a new language to the locale folder. Make sure to manually add a flag and edit src/locale/locale.js"""

import os
import argparse

from JSONIO import JSONIO

def nullifyDictionary(dictionary):
    for key in dictionary:
        if isinstance(dictionary[key], dict):
            dictionary[key] = nullifyDictionary(dictionary[key])
        else:
            dictionary[key] = None
    return dictionary

def addLocaleLanguage(languageCode):
    locale = JSONIO.loadFromFilename("../src/locale/en/strings.json")
    os.makedirs(JSONIO.rectifiedPath("../src/locale/{}".format(languageCode)), exist_ok = True)
    locale = nullifyDictionary(locale)
    JSONIO.saveToFilename("../src/locale/{}/strings.json".format(languageCode), locale)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description = __doc__)
    parser.add_argument("LANG",
        action = "store",
        help = "Language code of the locale to create, eg 'en' or 'de'.")
    args = parser.parse_args()

    addLocaleLanguage(args.LANG)
