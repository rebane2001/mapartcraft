#!/bin/sh

npm run build
[ -n "$(command -v apache2)" ] && cp ./buildSources/apache/.htaccess ./build/.htaccess
chmod o+rX-w -R ./build
