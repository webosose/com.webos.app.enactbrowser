#!/usr/bin/env node

// Copyright (c) 2018 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

'use strict';

// Verify the correct version of Node is in use.
const minimum = [6, 4, 0];
const active = process.versions.node.split('.').map(val => parseInt(val));
if(active[0] < minimum[0] || (active[0] === minimum[0] && active[1] < minimum[1])) {
    const chalk = require('chalk');
    console.log(chalk.red('You are running Node ' + active.join('.') + '.\nbrowser lib requires Node '
            + minimum.join('.') + ' or higher. \n' + chalk.bold('Please update your version of Node.')));
    process.exit(1);
}

// Handle tasks/arguments
if (process.argv.indexOf('-v') >= 0 || process.argv.indexOf('--version') >= 0) {
    const pkg = require('../package.json');
    console.log(pkg.name);
    console.log('version: ' + pkg.version);
    console.log();
} else {
    const command = process.argv[2];

    switch (command) {
        case 'transpile':{
            const task = require('./transpile.js');
            task(process.argv.slice(3));
            break;
        }
        default: {
            //const create = require('../global-cli/create');
            //create(['--help']);
            console.err("Wrong command");
        }
    }
}
