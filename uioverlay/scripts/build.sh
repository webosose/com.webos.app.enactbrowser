#!/bin/sh -e

PATH=$(readlink -f ../../.enact/node_modules/.bin):$PATH

BROWSER_DIST=$(readlink -f ../samples/enact-based/dist)

ENACT_NPM=${ENACT_NPM:-npm}
ENACT_DEV=${ENACT_DEV:-enact}

$ENACT_NPM install

echo build browser uioverlay

ENACT_DEV=$(readlink -f node_modules/@enact/cli/bin/enact.js)
$ENACT_DEV -v
$ENACT_DEV pack $1

mkdir $BROWSER_DIST/uioverlay/
cp -r dist/* $BROWSER_DIST/uioverlay/
