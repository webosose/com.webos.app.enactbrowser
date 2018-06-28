#!/bin/sh

ENACT_NPM=${ENACT_NPM:-npm}
ENACT_DEV=${ENACT_DEV:-enact}

(
    cd ../..

    $ENACT_NPM install
    $ENACT_NPM run transpile
)

$ENACT_NPM install
git apply enact-fix.patch
$ENACT_DEV pack $1
cp manifest.json background.js dist