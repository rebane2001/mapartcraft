#!/usr/bin/env python3

"""Tool for adding a new language to the locale folder. Make sure to manually add a flag and edit src/locale/locale.js"""

import os

from SAOLogging import getParser, setupRootLogger
from JSONIO import JSONIO

def nullifyTree(tree):
    if isinstance(tree, dict):
        for key, value in tree.items():
            tree[key] = nullifyTree(value)
        return tree
    else:
        return None

def addLocaleLanguage(languageCode):
    locale = JSONIO.loadFromFilename("../src/locale/en/strings.json")
    os.makedirs(JSONIO.rectifiedPath("../src/locale/{}".format(languageCode)), exist_ok = True)
    locale = nullifyTree(locale)
    JSONIO.saveToFilename("../src/locale/{}/strings.json".format(languageCode), locale)

if __name__ == "__main__":
    parser = getParser(__doc__)

    parser.add_argument("LANG",
        help = "Language code of the locale to create, eg 'en' or 'de'.")

    args = parser.parse_args()

    setupRootLogger(args.verbose, args.quiet)

    addLocaleLanguage(args.LANG)
