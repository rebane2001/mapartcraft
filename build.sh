#!/bin/bash
npm run build
[[ -n "$(command -v apache2)" ]] && cp ./buildSources/apache/.htaccess ./build/.htaccess
chmod o+rX -R ./build
