// Copyright (c) 2021 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

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
