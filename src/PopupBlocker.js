// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

class PopupBlocker {

    addURL(url) {
        if (window.navigator && window.navigator.popupblocker) {
            try {
                const hostname = (new URL(url)).hostname;
                return window.navigator.popupblocker.addURL(hostname);
            } catch (error) {
                console.error('PopupBlocker: url invalid');
            }
        } else {
            console.error('PopupBlocker interface is not implemented!');
        }
    }
}

export default PopupBlocker;
export {PopupBlocker};
