// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {CustomUserAgentsIdbStorage} from "js-browser-lib/CustomUserAgentsIdbStorage";
import {createHash} from "crypto"; //avaiable on the current Node v16.20

const VERSION_KEY = "VERSION",
    SYNC_AT_KEY = "SYNC_AT",
    SYNC_DURATION = 24 * 60 * 60 * 1000,
    RETRY_LIMIT = 5;

const sha256 = (str) => createHash("sha256").update(str).digest("hex");

class CustomUserAgent {
    constructor(storage, navigatorCustomUserAgent) {
        this.userAgentDb = new CustomUserAgentsIdbStorage(storage);
        this.controller = navigatorCustomUserAgent;
        this.userAgents = [];
        this.version = 0;
        this.syncAt = 0;
        this.countRetry = 0;
        storage.didOpen.push(() =>
            this.userAgentDb.getAll().then((result) => {
                if (!result.length) {
                    return;
                }
                const verIndex = result.findIndex((r) => r.hostname === VERSION_KEY);
                if (verIndex > -1) {
                    this.version = result[verIndex].value;
                    result.splice(verIndex, 1);
                }
                const syncIndex = result.findIndex((r) => r.hostname === SYNC_AT_KEY);
                if (syncIndex > -1) {
                    this.syncAt = result[syncIndex].value;
                    result.splice(syncIndex, 1);
                }
                this.userAgents = result;
            })
        );
    }

    fetchUserAgents() {
        // Only fetch data after at least 24 hours.
        if (Date.now() - this.syncAt < SYNC_DURATION || !this.controller) {
            return;
        }
        this.controller.getServerCredentials((value) => {
            const { url, api_auth_key } = this._tryParse(value);
            if (!url || !api_auth_key) {
                return;
            }
            this._fetchWithCancel(url, api_auth_key);
        });
    }

    getUserAgent(hostname) {
        let pattern = hostname.split("."),
            userAgent = null;

        while (pattern.length > 1) {
            const hash = sha256(pattern.join("."));
            const userAgentObj = this.userAgents.find((ua) => ua.hostname === hash);
            if (userAgentObj) {
                userAgent = userAgentObj.value;
                break;
            }
            pattern.shift();
        }
        return userAgent;
    }

    // The value might be null, so ensure that the output is always an Object
    _tryParse(value) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return {};
        }
    }

    _fetchWithCancel(url, apiKey) {
        if (this.countRetry > RETRY_LIMIT) {
            return;
        }
        this.countRetry++;
        const controller = new AbortController();
        const timmer = setTimeout(() => {
            controller.abort();
            this._fetchWithCancel(url, apiKey);
        }, 3000);

        fetch(url, {
            headers: { "x-api-key": apiKey },
            signal: controller.signal,
        })
            .then((res) => res.json())
            .then(this._updateValue)
            .catch((err) => {
                console.error(err);
                this._fetchWithCancel(url, apiKey);
            })
            .finally(() => clearTimeout(timmer));
    }

    _updateValue = (data) => {
        // Only update if the version has changed
        if (data instanceof Object && data.version != this.version) {
            this.version = data.version;
            this.userAgentDb.clear();
            const values = Object.keys(data.payload).map((hostname) => ({
                hostname,
                value: data.payload[hostname],
            }));
            this.userAgents = values;
            this.userAgentDb.setValues([
                ...values,
                { hostname: VERSION_KEY, value: this.version },
                { hostname: SYNC_AT_KEY, value: Date.now() },
            ]);
        }
    }
}

export default CustomUserAgent;
export {CustomUserAgent};
