// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
    Is intended to allow urls, that do not match all regex patterns

    this.patterns - should be regex expressions
*/
class BlackList {
    constructor() {
        this.patterns = [];
    }

    isAllowed(url) {
        for (const regex of this.patterns) {
            if (regex.test(url)) {
                return false;
            }
        }
        return true;
    }
}

export default BlackList;
export {BlackList};
