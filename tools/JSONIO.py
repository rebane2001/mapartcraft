#!/usr/bin/env python3

"""Nice easy JSON loading / saving functions."""

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
    def saveToFilename(cls, filename, JSONObject, indent = 2):
        filename = cls.rectifiedPath(filename)
        with open(filename, "w") as f:
            f.write(
                json.dumps(JSONObject, indent = indent, ensure_ascii = False)
            )
            f.write("\n")
