// Copyright 2021 LG Electronics, Inc.
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

/*global window*/

const initLogging = function() {
    const enableConsoleFunction = function(request) {
        const blankFunc = function() {};

        switch(request) {
            case true:
                Object.keys(window.console).forEach((key) => {
                    window.console[key] = consoleBackup[key];
                });
                break;

            case false:
                Object.keys(window.console).forEach((key) => {
                    window.console[key] = blankFunc;
                });
                break;

            default:
                Object.entries(request).forEach(([key, value]) => {
                    window.console[key] = value ? consoleBackup[key] : blankFunc;
                });
                break;
        }
    };

    const QALog = function(...args) {
        consoleBackup.info(...args);
    };

    window.consoleBackup = {};
    Object.keys(window.console).forEach((key) => {
        window.consoleBackup[key] = window.console[key];
    });

    window.enableConsoleFunction = enableConsoleFunction;
    window.QALog = QALog;

    enableConsoleFunction(false);
};

export default initLogging;
export {initLogging};
