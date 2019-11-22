#!/bin/bash

# disable iLib for loading XHR asnycrhonously
git apply enact-fix.patch || git apply enact-fix.patch -R --check
