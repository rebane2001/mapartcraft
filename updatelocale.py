#!/bin/env python3

# Run from src/

import os
import json


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
        with open(os.path.abspath(filename), "w") as f:
            f.write(
                json.dumps(JSONObject, indent=2, ensure_ascii=False)
            )


def getNewLayout():
    return {
        "TRANSLATION": {
            "NAME": "TRANSLATIONNAME",
            "CREDITS": "TRANSLATIONCREDITS"
        },
        "HEAD-META-TAGS": {
            "DESCRIPTION": "META-DESCRIPTION"
        },
        "FAQ": {
            "FAQ": "FAQ",
            "PLEASE-READ-1": "FAQTEXT1",
            "PLEASE-READ-2": "FAQTEXT2",
            "HAVE-YOU-READ": "HAVEYOUFAQ",
            "HELP-IN-ENGLISH": "HELPNOTE",
            "VIDEO-TUTORIAL": "VIDEO_TUTORIAL"
        },
        "DESCRIPTION": {
            "1": "DESCRIPTION1",
            "2": "DESCRIPTION2",
            "3": "DESCRIPTION3",
            "4": "DESCRIPTION4",
            "5": "DESCRIPTION5",
            "6": "DESCRIPTION6",
            "7": "DESCRIPTION7",
            "8": "DESCRIPTION8",
        },
        "BLOCK-SELECTION": {
            "TITLE": "BLOCKSELECTIONTITLE",
            "PRESETS": {
                "TITLE": "PRESETS",
                "DELETE": "PRESETS-DELETE",
                "DELETE-ERROR-DEFAULT": "PRESETS-DEFAULTERROR",
                "SAVE": "PRESETS-SAVE",
                "SAVE-PROMPT-ENTER-NAME": "PRESETS-ENTERNAME",
                "SHARE": "PRESETS-SHARE",
                "SHARE-TT": "PRESETS-TT-SHARE",
                "SHARE-WARNING-NONE-SELECTED": "SELECTBLOCKSWARNING-SHARE",
                "SHARE-LINK": "PRESETS-SHARELINK",
                "DOWNLOAD": "DOWNLOAD-PDN",
                "DOWNLOAD-TT": "DOWNLOAD-TT-PDN",
                "DOWNLOAD-WARNING-NONE-SELECTED": "SELECTBLOCKSWARNING-PALETTE",
                "DOWNLOAD-WARNING-MAX-COLOURS-1": "PDNWARNING1",
                "DOWNLOAD-WARNING-MAX-COLOURS-2": "PDNWARNING2",
                "IMPORT-ERROR-CORRUPTED": "PRESETS-CORRUPTED",
                "NONE": "PRESETS-PRESET-NONE",
                "EVERYTHING": "PRESETS-PRESET-EVERYTHING",
                "CARPETS": "PRESETS-PRESET-CARPETS",
                "GREYSCALE": "PRESETS-PRESET-GREYSCALE"
            }
        },
        "MAP-PREVIEW": {
            "TITLE": "MAPPREVIEWTITLE",
            "BEST-RESOLUTION-TT": "MAPPREVIEW-TT-BESTRES",
            "ASPECT-RATIO-MISMATCH-TT": "MAPPREVIEW-TT-DOESNTMATCH",
            "SCALE-MINUS-TT": "MAPPREVIEW-TT-PREVMINUS",
            "SCALE-PLUS-TT": "MAPPREVIEW-TT-PREVPLUS"
        },
        "MAP-SETTINGS": {
            "TITLE": "SETTINGSTITLE",
            "MODE": "SETTINGS-MODE",
            "MODE-TT": "SETTINGS-TT-MODE",
            "MODE-VISUAL": "SETTINGS-MODE-VISUAL",
            "MODE-VISUAL-NA": "SETTINGS-MODE-VISUAL-NA",
            "VERSION": "SETTINGS-VERSION",
            "VERSION-TT": "SETTINGS-TT-VERSION",
            "MAP-SIZE": "SETTINGS-MAPSIZE",
            "CROP": "SETTINGS-CROP",
            "CROP-TT": "SETTINGS-TT-CROP",
            "GRID-OVERLAY": "SETTINGS-GRIDOVERLAY",
            "GRID-OVERLAY-TT": "SETTINGS-TT-GRIDOVERLAY",
            "3D": {
                "TITLE": "SETTINGS-3D",
                "TITLE-TT": "SETTINGS-TT-3D",
                "OFF": "SETTINGS-3D-OFF",
                "CLASSIC": "SETTINGS-3D-CLASSIC",
                "VALLEY": None
            },
            "NBT-SPECIFIC": {
                "WHERE-SUPPORT-BLOCKS": {
                    "TITLE": "SETTINGS-UNDERBLOCKS",
                    "NONE": "SETTINGS-UNDERBLOCKS-NOBLOCKS",
                    "IMPORTANT": "SETTINGS-UNDERBLOCKS-IMPBLOCKS",
                    "ALL": "SETTINGS-UNDERBLOCKS-ALLBLOCKS",
                    "ALL-OPTIMIZED": "SETTINGS-UNDERBLOCKS-ALLBLOCKSOPT",
                    "ALL-DOUBLE": "SETTINGS-UNDERBLOCKS-DOUBLEBLOCKS",
                    "ALL-DOUBLE-OPTIMIZED": "SETTINGS-UNDERBLOCKS-DOUBLEBLOCKSOPT"
                },
                "SUPPORT-BLOCK-TO-ADD": "SETTINGS-BLOCKTOADD",
                "SUPPORT-BLOCK-TO-ADD-TT": "SETTINGS-TT-BLOCKTOADD"
            },
            "MAPDAT-SPECIFIC": {
                "UNOBTAINABLE-COLOURS": "SETTINGS-UNOBT",
                "UNOBTAINABLE-COLOURS-TT": "SETTINGS-TT-UNOBT",
                "TRANSPARENCY": "SETTINGS-TRANS",
                "TRANSPARENCY-TT": "SETTINGS-TT-TRANS",
                "TRANSPARENCY-TOLERANCE": "SETTINGS-TRANSTOLERANCE"
            },
            "BETTER-COLOUR": "SETTINGS-BETTERCOL",
            "BETTER-COLOUR-TT": "SETTINGS-TT-BETTERCOL",
            "DITHERING": {
                "TITLE": "SETTINGS-DITHER",
                "TITLE-TT": "SETTINGS-TT-DITHER",
                "NONE": "SETTINGS-DITHER-NONE"
            },
            "PREPROCESSING": {
                "TITLE": "SETTINGS-PREPROCESSING",
                "ENABLE": "SETTINGS-PREPROCESSING-ENABLE",
                "BRIGHTNESS": "SETTINGS-PREPROCESSING-BRIGHTNESS",
                "CONTRAST": "SETTINGS-PREPROCESSING-CONTRAST",
                "SATURATION": "SETTINGS-PREPROCESSING-SATURATION",
                "BACKGROUND": {
                    "TITLE": "SETTINGS-PREPROCESSING-BACKGROUNDCOLOR-SELECT",
                    "OFF": "SETTINGS-PREPROCESSING-BACKGROUNDCOLOR-SELECT-OFF",
                    "DITHERED": "SETTINGS-PREPROCESSING-BACKGROUNDCOLOR-SELECT-ON",
                    "FLAT": "SETTINGS-PREPROCESSING-BACKGROUNDCOLOR-SELECT-ONFLAT"
                },
                "BACKGROUND-COLOUR": "SETTINGS-PREPROCESSING-BACKGROUNDCOLOR",
                "BACKGROUND-COLOUR-TT": "SETTINGS-TT-PREPROCESSING-BACKGROUNDCOLOR"
            }
        },
        "DOWNLOAD": {
            "ERROR-NONE-SELECTED": "SELECTBLOCKSWARNING-DOWNLOAD",
            "NBT-SPECIFIC": {
                "DOWNLOAD": "DOWNLOAD-NBT",
                "DOWNLOAD-TT": "DOWNLOAD-TT-NBT",
                "DOWNLOAD-SPLIT": "DOWNLOAD-NBTSPLIT",
                "DOWNLOAD-SPLIT-TT": "DOWNLOAD-TT-NBTSPLIT"
            },
            "MAPDAT-SPECIFIC": {
                "DOWNLOAD": "DOWNLOAD-MAPDAT",
                "DOWNLOAD-TT": "DOWNLOAD-TT-MAPDAT"
            }
        },
        "MATERIALS": {
            "TITLE": "MATERIALSTITLE",
            "BLOCK": "MATERIALS-BLOCK",
            "AMOUNT": "MATERIALS-AMOUNT",
            "PLACEHOLDER-BLOCK": "MATERIALS-PLACEHOLDERBLOCK",
            "SHOW-PER-SPLIT": "SETTINGS-SPLITMATERIALS",
            "SHOW-PER-SPLIT-TT": "SETTINGS-TT-SPLITMATERIALS",
            "REFRESH-MATERIALS": "REFRESHMATERIALS",
            "REFRESH-MATERIALS-TT": "REFRESHMATERIALS-TT"
        },
        "VIEW-ONLINE": {
            "TITLE": "DOWNLOAD-VIEWONLINE",
            "TITLE-TT": "DOWNLOAD-TT-VIEWONLINE"
        },
        "DONATE": {
            "TITLE": "DONATEBUTTON",
            "TITLE-TT": "DONATEBUTTON-TT"
        },
        "LITEMATICA-WARNING": "LITEMATICAWARNING",
        "EDGE-WARNING": "EDGEWARNING",
        "NONE": "NONE",
        "UNUSED": {
            "SECOND": "TIMEREMAINING-SECOND",
            "SECONDS": "TIMEREMAINING-SECONDS",
            "REMAINING": "TIMEREMAINING",
            "SETTINGS-3D-OPTIMIZED": "SETTINGS-3D-OPTIMIZED",
        }
    }


def setLayoutKeys(base, dictionary, source, untranslatedStrings):
    for saoKey, rebaneKeyOrDict in dictionary.items():
        if type(rebaneKeyOrDict) == dict:
            rebaneKeyOrDict, source, untranslatedStrings = setLayoutKeys("{}{}/".format(base, saoKey), rebaneKeyOrDict, source, untranslatedStrings)
        else:
            if rebaneKeyOrDict in source:
                dictionary[saoKey] = source[rebaneKeyOrDict]
                del source[rebaneKeyOrDict]
            else:
                dictionary[saoKey] = None
                untranslatedStrings.append("{}{}".format(base, saoKey))
    return dictionary, source, untranslatedStrings


languages = ["de", "en", "eo", "es", "et", "fr", "it", "lt", "pt", "ru", "zh-Hans", "zh-Hant"]

for language in languages:
    locale_lang = JSONIO.loadFromFilename("./locale/{}/strings.json".format(language))
    locale_lang_new, unusedOldStrings, untranslatedStrings = setLayoutKeys("/", getNewLayout(), locale_lang, [])
    print("Not included in new locale for {}:".format(language))
    print(unusedOldStrings)
    print()
    JSONIO.saveToFilename("./locale/{}/strings.json".format(language), locale_lang_new)
    with open("./locale/{}/untranslatedStrings.txt".format(language), "w") as f:
        f.write("Untranslated strings for {}\n".format(language))
        f.write("---\n")
        for untranslatedString in untranslatedStrings:
            f.write("{}\n".format(untranslatedString))
        f.write("---\n")

# Now make sure en has everything non-null since it is the fallback
