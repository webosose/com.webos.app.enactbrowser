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

const
    path = require('path'),
    glob = require('glob'),
    babel = require('babel-core'),
    fs = require('fs-extra'),
    minimist = require('minimist');

function displayHelp() {
    console.log('  Usage');
    console.log('    npm run transpile [options]');
    console.log();
    console.log('  Options');
    console.log('    -h, --help        Display help information');
    console.log();
    process.exit(0);
}

module.exports = function(args) {
    const opts = minimist(args, {
        boolean: ['h', 'help'],
        alias: {h:'help'}
    });
    opts.help && displayHelp();

    const sourceRoot = './src';
    const buildRoot = './lib';

    console.log('Transpiling via Babel from ' + path.resolve(sourceRoot) + ' to ' + path.resolve(buildRoot));
    fs.copy(sourceRoot, buildRoot, {stopOnErr:true}, cpErr => {
        if(cpErr) {
            console.error(cpErr);
        } else {
            glob(buildRoot + '/**/*.js', {nodir:true}, (globErr, files) => {
                if(globErr) {
                    console.error(globErr);
                } else {
                    const babelrc = path.join(__dirname, '..', 'config', '.babelrc');
                    files.forEach(js => {
                        babel.transformFile(
                                js, {
                                    extends:babelrc,
                                    presets:[require.resolve('babel-preset-env')],
                                    plugins:[require.resolve('babel-plugin-transform-class-properties')]
                                },
                                (babelErr, result) => {
                            if(babelErr) {
                                console.error(babelErr);
                            } else {
                                console.log('Transpiling ' + js);
                                fs.writeFile(js, result.code, {encoding:'utf8'}, fsErr => {
                                    if(fsErr) {
                                        console.error(fsErr);
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    });
};
