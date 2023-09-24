#!/bin/sh -e

. ../../.nvm/nvm.sh
PATH=$(readlink -f ../../.enact/node_modules/.bin):$PATH

BROWSER_DIST=$(readlink -f ../samples/enact-based/dist)

ENACT_NPM=${ENACT_NPM:-npm}
ENACT_DEV=${ENACT_DEV:-enact}

$ENACT_NPM install

$ENACT_DEV pack --isomorphic $1

mkdir $BROWSER_DIST/uioverlay/
cp -r dist/* $BROWSER_DIST/uioverlay/
