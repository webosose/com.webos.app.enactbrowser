// Copyright 2023 LG Electronics, Inc.
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

/*global document*/
/*global window*/

import Ipc from './Ipc.js';

class UrlSuggestionsBase {
    constructor(uioverlay) {
        this.uioverlay = uioverlay;
        this.messages = new Map();
    }

    show() {
        console.log(`show input suggestion list`);

        const inputElem = document.getElementById("omniboxInput");
        const inputHeight = inputElem.offsetHeight + 20;
        const borderWidth = (document.body.clientWidth / 100) * 10;  // 10% of the document width
        const width = document.body.clientWidth - borderWidth - borderWidth;

        return this.uioverlay.show({
            target: 'input_suggestion_list', bounds: {
                x: borderWidth,
                y: inputHeight,
                w: width
            }
        })
            .then(() => {
                const layer = this.uioverlay.getLayer({ target: 'input_suggestion_list' });
                this.messages.forEach((message, callback) => {
                    layer.channel.on(message, callback);
                });
            }).then(() => this.sendSuggestions());
    }

    provideSuggestions(items) {
        console.log(`[UrlSuggestionsBase] provideSuggestions `, items);
        this.suggestions = items;

        if (this.uioverlay.isLayerExists({ target: 'input_suggestion_list' })) {
            return this.sendSuggestions();
        }
    }

    sendSuggestions() {
        const layer = this.uioverlay.getLayer({ target: 'input_suggestion_list' });
        if (layer) {
            console.log(`[UrlSuggestionsBase] sendSugestionList`, this.suggestions);
            layer.channel.post('suggestionList', this.suggestions);
        }
    }

    on(message, callback) {
        this.messages.set(callback, message);

        if (this.uioverlay.isLayerExists({ target: 'input_suggestion_list' })) {
            const layer = this.uioverlay.getLayer({ target: 'input_suggestion_list' });
            layer.channel.on(message, callback);
        }
    }

    removeEventListener(message, callback) {
        this.messages.delete(callback);

        if (this.uioverlay.isLayerExists({ target: 'input_suggestion_list' })) {
            const layer = this.uioverlay.getLayer({ target: 'input_suggestion_list' });
            layer.channel.removeEventListener(message, callback);
        }

        return Promise.resolve();
    }

    destroy() {}

    hide() {
        console.log(`hide input suggestion list`);

        if (this.uioverlay.isLayerExists({ target: 'input_suggestion_list' })) {
            const layer = this.uioverlay.getLayer({ target: 'input_suggestion_list' });
            this.messages.forEach((message, callback) => {
                layer.channel.removeEventListener(message, callback);
            });
            this.uioverlay.hide({ target: 'input_suggestion_list' });
        }
    }
}

export default UrlSuggestionsBase;
export {UrlSuggestionsBase};
