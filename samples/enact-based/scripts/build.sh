#!/bin/sh -e

ENACT_NPM=${ENACT_NPM:-npm}

(
    cd ../..

    $ENACT_NPM install
    $ENACT_NPM run transpile
)

echo build main browser

export ILIB_BASE_PATH="./resources"
$ENACT_NPM run check-finishing-lines
$ENACT_NPM install
ENACT_DEV=$(readlink -f node_modules/@enact/cli/bin/enact.js)
$ENACT_DEV -v
$ENACT_DEV pack --isomorphic --production $1

cp webos-locale.js dist
./scripts/install-manifest.js --from=manifest.json --to=dist/manifest.json --version_suffix=`git rev-parse HEAD`

(
    cd ../../uioverlay
    scripts/build.sh $1
)
