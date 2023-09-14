#!/bin/sh -e

BROWSER_DIST=$(readlink -f ../samples/enact-based/dist)

ENACT_NPM=${ENACT_NPM:-npm}

$ENACT_NPM install
ENACT_DEV=$(readlink -f node_modules/@enact/cli/bin/enact.js)
echo build browser uioverlay
$ENACT_DEV -v
$ENACT_DEV pack --isomorphic $1

mkdir $BROWSER_DIST/uioverlay/
cp -r dist/* $BROWSER_DIST/uioverlay/
