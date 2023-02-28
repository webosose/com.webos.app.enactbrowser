// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/*global document*/
/*global window*/

import Ipc from './Ipc.js';

class UrlSuggestionsBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
    }

    show() {
        console.log(`show input suggestion list`);

        const inputElem = document.getElementById("omniboxInput");
        const inputHeight = inputElem.offsetHeight + 20;
        const borderWidth = (document.body.clientWidth / 100) * 10;  // 10% of the document width
        const width = document.body.clientWidth - borderWidth - borderWidth;

        return this.uioverlay.switchContent('input_suggestion_list')
            .then(() => this.uioverlay.setBounds({
                x: borderWidth,
                y: inputHeight,
                w: width
            }, "input_suggestion_list"))
            .then(() => this.uioverlay.setVisible(true, "input_suggestion_list"));
    }

    sendSuggestion(items) {
        this.uioverlay.getCallChain()
            .then(() => this.uioverlay.ipc.post('suggestionList', items));
    }

    on(...evArguments) {
        return this.uioverlay.getCallChain()
            .then(() => this.uioverlay.ipc.on(...evArguments));
    }

    removeEventListener(...evArguments) {
        return this.uioverlay.getCallChain()
            .then(() => this.uioverlay.ipc.removeEventListener(...evArguments));
    }

    destroy() {}

    hide() {
        console.log(`hide input suggestion list`);
        this.uioverlay.setVisible(false, 'input_suggestion_list');
    }
};

export default UrlSuggestionsBase;
export {UrlSuggestionsBase};
