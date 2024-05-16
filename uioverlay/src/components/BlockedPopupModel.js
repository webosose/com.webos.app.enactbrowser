// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/

class BlockedPopup {
    constructor() {
        if (typeof ShellIpc !== 'undefined') {
            this.ipc = new ShellIpc('ipc_blocked_popup');
            this.ipc.on('updateBlockedPopup', (data) => {
                const event = new CustomEvent('updateBlockedPopupEvent', {detail: data});
                document.dispatchEvent(event);
            });
        }
    }

    submit(data) {
        return () => {
            this.ipc.post('submit', data);
        };
    }
}

export default BlockedPopup;
