// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

class Ipc {
    constructor (ipcObjectName) {
        this.messages = [];
        this.ipcObject = new ShellIpc(ipcObjectName);
    }

    createHandler(message, handlers) {
        return ((ev) => {
            console.log(`handle ${message} IPC message`);
            handlers.forEach((callback) => {
                try {
                    callback(ev);
                } catch (err) {
                    console.log(`${message} handler cause exception ${err}`);
                }
            });
        })
    }

    subscribe(message, callback) {
        const messages = this.messages;
        if (messages[message] === undefined) {
            messages[message] = [];
            this.ipcObject.on(message, this.createHandler(message, messages[message]));
        }
        messages[message].push(callback);
    }
};

export default Ipc;
export {Ipc};
