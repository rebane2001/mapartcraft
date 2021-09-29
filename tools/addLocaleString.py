#!/usr/bin/env python3

"""Tool for adding a string to all locale files"""

import os

from SAOLogging import getParser, setupRootLogger, criticalLogExit
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
        elif isinstance(localeFolder[pathSection], dict):
            localeFolder = localeFolder[pathSection]
        elif force:
            localeFolder[pathSection] = {}
            localeFolder = localeFolder[pathSection]
        elif localeFolder[pathSection] is None:
            criticalLogExit("{}: Refusing to override None entry {} with subfolder".format(languageCode, "/".join(pathSections[:pathSectionIndex + 1])))
        elif isinstance(localeFolder[pathSection], str):
            criticalLogExit("{}: Refusing to override string {} with subfolder".format(languageCode, "/".join(pathSections[:pathSectionIndex + 1])))

    finalPathSection = pathSections[-1]
    if force or not finalPathSection in localeFolder:
        localeFolder[finalPathSection] = enOrNull
    elif isinstance(localeFolder[finalPathSection], dict):
        criticalLogExit("{}: Refusing to override folder {} with '{}'".format(languageCode, path, enOrNull))
    elif localeFolder[finalPathSection] is None:
        criticalLogExit("{}: Refusing to override None entry {} with '{}'".format(languageCode, path, enOrNull))
    elif isinstance(localeFolder[finalPathSection], str):
        criticalLogExit("{}: Refusing to override string {} with '{}'".format(languageCode, path, enOrNull))

    JSONIO.saveToFilename(filename, localeJSON)

if __name__ == "__main__":
    parser = getParser(__doc__)

    parser.add_argument("-f", "--force",
        help = "Overwrite pre-existing string or subsection",
        action = "store_true",
        default = False)
    parser.add_argument("PATH",
        help = "String path within locale JSON, eg 'BLOCK-SELECTION/TITLE'; '/' separates subsections")
    parser.add_argument("--en",
        help = "Optionally set the English version of the string now",
        default = None)

    args = parser.parse_args()

    setupRootLogger(args.verbose, args.quiet)

    languageCodes = [d for d in
        os.listdir(JSONIO.rectifiedPath("../src/locale")) if
        os.path.isdir(os.path.join(JSONIO.rectifiedPath("../src/locale"), d))
    ]
    for languageCode in languageCodes:
        touchLocaleString(languageCode, args.force, args.PATH.upper(), args.en if languageCode == "en" else None)
