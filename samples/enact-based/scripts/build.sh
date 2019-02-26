#!/bin/sh -e

ENACT_NPM=${ENACT_NPM:-npm}
ENACT_DEV=${ENACT_DEV:-enact}

(
    cd ../..

    $ENACT_NPM install
    $ENACT_NPM run transpile
)

$ENACT_NPM install
git apply enact-fix.patch || git apply enact-fix.patch -R --check

$ENACT_DEV pack $1
cp label.js background.js webos-locale.js defaults.js dist
./scripts/install-manifest.js --from=manifest.json --to=dist/manifest.json --version_suffix=`git rev-parse HEAD`
