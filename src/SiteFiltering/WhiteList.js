// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
    Is intended to allow urls, that match one of the regex pattern

    this.patterns - should be regex expressions
*/
class WhiteList {
    constructor() {
        this.patterns = [];
    }

    isAllowed(url) {
        for (const regex of this.patterns) {
            if (regex.test(url)) {
                return true;
            }
        }
        return false;
    }
}

export default WhiteList;
export {WhiteList};
