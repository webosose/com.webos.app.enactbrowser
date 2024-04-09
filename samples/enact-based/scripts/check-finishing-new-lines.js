// Copyright 2024 LG Electronics, Inc.
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

/**
 * This script checks for final empty line in source files.
 * The process returns 0 if no files needed to be changed
 * or 1 if there are files without final new line at the end.
 * 'echo $?' command can be used to check the process return value.
 */

const { error, log } = require('console')
const fs = require('fs')

// Need debug messages?
const needDebugMessages = false

const debug = needDebugMessages ?
    require('console').debug : () => { }

/**
 * Check whether path is disrectory of file
 * @param { string } path - file system path to check
 * @return { Promise<boolean> } true - directory, false - file
 */
function isPathIsDirectory(path) {
    return new Promise((resolve, reject) => {
        try {
            fs.lstat(path, (err, stats) => {
                if (!err) {
                    resolve(stats.isDirectory())
                } else {
                    reject(`[isPathIsDirectory] error while getting ${path} stats: `, err)
                }
            })
        } catch (e) {
            error(`[isPathIsDirectory] error: `, e)
        }
    })
}


/**
 * Reads directory and returns list of fs entries names
 * @param { string } path - filesystem path to read
 * @return { Promise<Array<string>> } list of file system entries
 */
function readDirectory(path) {
    debug(`[readDirectory] >>> (${path})`)
    return new Promise((resolve, reject) => {
        // read target dir
        fs.readdir(path, async (err, files) => {
            if (!err) {
                const pathes = await Promise.all(files.map(async (fileEntry) => {
                    const fullpath = path + '/' + fileEntry
                    try {
                        const isDir = await isPathIsDirectory(fullpath)
                        if (isDir) {
                            return await readDirectory(fullpath)
                        } else {
                            return fullpath
                        }
                    } catch (e) {
                        error(e)
                        return []
                    }
                }))

                resolve(pathes)
            } else {
                reject("[readDirectory] error occured. Please check path provided.")
            }
        })
    })
}

/**
 * Check whether final new line exists in text file
 * @param { string } path - file system path to the text file
 * @return { boolean } true - there is final new line, false - no final new line
 */
function checkFinalNewLine(path) {
    const readData = fs.readFileSync(path, "utf8");
    return (readData.charAt(readData.length - 1) === '\n')
}

(async () => {
    debug("ARGV: ", process.argv)

    let files = []
    for (let i = 2; i < process.argv.length; i++) {
        try {
            const files_ = await readDirectory(process.argv[i])
            files = files.concat(files_)
        } catch(e) {
            error("error: ", e)
            process.exit(1)
        }
    }

    isTargetFile = (path) => {
        const expressions = [
            /.*\.js$/,
            /.*\.ts$/,
            /.*\.tsx$/,
            /.*\.jsx$/,
            /.*\.css$/,
            /.*\.less$/,
            /.*\.sh$/,
            /.*\.bash$/,
        ]

        return expressions.reduce((acc, exp) => acc || (path.match(exp) !== null), false)
    }

    const isInIgnoreList = (path) => {
        const expressions = [
            /\/dist\//,
            /\/lib\//,
            /\/node_modules\//,
        ]

        return expressions.reduce((acc, exp) => acc || (path.match(exp) !== null), false)
    }

    const result = files
        .flat(Infinity)
        .filter(file => isTargetFile(file))
        .filter(file => !isInIgnoreList(file))
        .filter(file => !checkFinalNewLine(file))

    if (result.length !== 0) {
        log(`Please check finishing new line in following files: `, result)
    } else {
        log(`check-finishing-new-lines.js check success`)
    }

    if (result.length !== 0) {
        process.exit(1)
    } else {
        process.exitCode = 0
    }
})()
