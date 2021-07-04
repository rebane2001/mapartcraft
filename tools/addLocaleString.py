#!/bin/env python3

import os
import json
import argparse

class JSONIO():
    @staticmethod
    def rectifiedPath(path):
        """Norm path to remove double // and ./../dir etc, and expand ~"""
        return os.path.expanduser(
            os.path.normpath(path)
        )

    @classmethod
    def loadFromFilename(cls, filename):
        filename = cls.rectifiedPath(filename)
        with open(filename) as f:
            return json.load(f)

    @classmethod
    def saveToFilename(cls, filename, JSONObject):
        filename = cls.rectifiedPath(filename)
        with open(filename, "w") as f:
            f.write(
                json.dumps(JSONObject, indent = 2, ensure_ascii = False)
            )
            f.write("\n")

languageCodes = ["de", "eo", "es", "et", "fr", "it", "lt", "pt", "ru", "zh-Hans", "zh-Hant"]

def touchLocaleString(languageCode, force, path, enOrNull = None):
    filename = "../src/locale/{}/strings.json".format(languageCode)
    localeJSON = JSONIO.loadFromFilename(filename)
    pathSections = path.split("/")

    localeFolder = localeJSON
    for pathSectionIndex, pathSection in enumerate(pathSections[:-1]):
        if type(localeFolder[pathSection]) == dict:
            localeFolder = localeFolder[pathSection]
        elif force or not pathSection in localeFolder:
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
    parser = argparse.ArgumentParser(description =
        """Tool for adding a string to all locale files""")
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

    touchLocaleString("en", args.f, args.PATH.upper(), args.en)
    for languageCode in languageCodes:
        touchLocaleString(languageCode, args.f, args.PATH.upper())
