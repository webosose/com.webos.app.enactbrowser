// Copyright 2022 LG Electronics, Inc.
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

/*global ShellIpc*/

class Ipc {
    constructor (ipcObjectName) {
        this.messages = [];
        if (typeof ShellIpc !== 'undefined') {
            this.ipcObject = new ShellIpc(ipcObjectName);
        }
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
        });
    }

    subscribe(message, callback) {
        const messages = this.messages;
        if (messages[message] === undefined) {
            messages[message] = [];
            this.ipcObject.on(message, this.createHandler(message, messages[message]));
        }
        messages[message].push(callback);
    }

    post(message, payload) {
        this.ipcObject.post(message, payload || {});
    }
}

export default Ipc;
export {Ipc};
