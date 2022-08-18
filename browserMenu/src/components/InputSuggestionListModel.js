// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global ShellIpc*/
/*global window*/
/*global CustomEvent*/

import Ipc from '../../../src/Ipc';

class InputSuggectionListModel {
    constructor() {
        if (typeof ShellIpc !== 'undefined') { // it is for prerenderer.
            this.ipc = new Ipc('ipc_uioverlay');
            this.ipc.subscribe('suggestionList', (suggestions) => {
                console.log(`suggestionList arrived ${suggestions}`);
                this.suggestions = suggestions;

                const event = new CustomEvent("suggestionListUpdated", { detail: this.suggestions });
                document.dispatchEvent(event);
            });
            console.log(`subscribed to suggestionList`);
        }

        if (typeof window !== 'undefined') { // it is for prerenderer.
            window.document.addEventListener("clickSuggestedItem", (ev) => {
                this.ipc.post('click_suggested_item', ev.detail);
            })
        }
    }
}

export default InputSuggectionListModel;
