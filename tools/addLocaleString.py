#!/bin/env python3

"""Tool for adding a string to all locale files"""

import os
import argparse

from JSONIO import JSONIO

def touchLocaleString(languageCode, force, path, enOrNull = None):
    filename = "../src/locale/{}/strings.json".format(languageCode)
    localeJSON = JSONIO.loadFromFilename(filename)
    pathSections = path.split("/")

    localeFolder = localeJSON
    for pathSectionIndex, pathSection in enumerate(pathSections[:-1]):
        if not pathSection in localeFolder:
            localeFolder[pathSection] = {}
            localeFolder = localeFolder[pathSection]
        elif type(localeFolder[pathSection]) == dict:
            localeFolder = localeFolder[pathSection]
        elif force:
            localeFolder[pathSection] = {}
            localeFolder = localeFolder[pathSection]
        elif localeFolder[pathSection] is None:
            print("{}: Refusing to override None entry {} with subfolder".format(languageCode, "/".join(pathSections[:pathSectionIndex + 1])))
            return
        elif type(localeFolder[pathSection]) == str:
            print("{}: Refusing to override string {} with subfolder".format(languageCode, "/".join(pathSections[:pathSectionIndex + 1])))
            return

    finalPathSection = pathSections[-1]
    if force or not finalPathSection in localeFolder:
        localeFolder[finalPathSection] = enOrNull
    elif type(localeFolder[finalPathSection]) == dict:
        print("{}: Refusing to override folder {} with '{}'".format(languageCode, path, enOrNull))
    elif localeFolder[finalPathSection] is None:
        print("{}: Refusing to override None entry {} with '{}'".format(languageCode, path, enOrNull))
    elif type(localeFolder[finalPathSection]) == str:
        print("{}: Refusing to override string {} with '{}'".format(languageCode, path, enOrNull))

    JSONIO.saveToFilename(filename, localeJSON)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description = __doc__)
    parser.add_argument("-f",
        action = "store_true",
        help = "Overwrite pre-existing string or subsection",
        default = False)
    parser.add_argument("PATH",
        action = "store",
        help = "String path within locale JSON, eg 'BLOCK-SELECTION/TITLE'; '/' separates subsections")
    parser.add_argument("--en",
        action = "store",
        help = "Optionally set the English version of the string now",
        default = None)
    args = parser.parse_args()

    languageCodes = [d for d in
        os.listdir(JSONIO.rectifiedPath("../src/locale")) if
        os.path.isdir(os.path.join(JSONIO.rectifiedPath("../src/locale"), d))
    ]
    for languageCode in languageCodes:
        touchLocaleString(languageCode, args.f, args.PATH.upper(), args.en if languageCode == "en" else None)
