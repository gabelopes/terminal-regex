#!/usr/bin/env bash

INSTALL_SCRIPT_DIRECTORY="$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null 2>&1 && pwd)"
REGEX_JAVASCRIPT_FILE="$INSTALL_SCRIPT_DIRECTORY/RegEx.js"
OUT_EXECUTABLE_PATH="$INSTALL_SCRIPT_DIRECTORY/out/re"
BIN_EXECUTABLE_PATH="/usr/local/bin/re"

exist() {
  command -v "$1" > /dev/null 2>&1
}

installPkg() {
  if ! exist pkg
  then
    npm i -g pkg
  fi
}

generateBinary() {
  pkg -t node12-macos-x64 -o "$OUT_EXECUTABLE_PATH" "$REGEX_JAVASCRIPT_FILE"
}

copyBinary() {
  if [[ ! -f "$BIN_EXECUTABLE_PATH" || "$1" == "-f" ]]
  then
    cp "$OUT_EXECUTABLE_PATH" "$BIN_EXECUTABLE_PATH"
  else
    echo "Another installation already exists. Execute again with -f flag to force reinstallation."
  fi
}

installPkg && generateBinary && copyBinary "$1"
