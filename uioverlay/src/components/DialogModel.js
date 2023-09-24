// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

function createIpcChannel() {
    return new ShellIpc("ipc_dialog");
}

let context = {};

function createDialogModel() {
    if (typeof ShellIpc !== 'undefined') {
        context.ipc = createIpcChannel();
    }
    context.alertsCount = 0;
    return context;
}

export default createDialogModel;
