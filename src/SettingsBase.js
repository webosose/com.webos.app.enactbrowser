// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

class SettingsBase {
    /**
        storage should implement interface:
        class ISettingsStorage {
            get(k) -> return Promise with single value by key
            getAll() -> return Promise with object with key:value pairs
            set(k, v) -> set single value, return Promise with key
            setValues(valuesObj) -> sets multiple values,
                                    return Promise with array of keys
        }
    */
    constructor(storage) {
        this.storage = storage;
    }

    initialize(defaults) {
        return this.storage.getAll()
            .then((storedValues) => {
                const keys = Object.keys(defaults);
                const valuesToInit = {};
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    if (!storedValues.hasOwnProperty(key)) {
                        valuesToInit[key] = defaults[key];
                    }
                }
                this.storage.setValues(valuesToInit);
                Object.assign(storedValues, valuesToInit);
                return storedValues;
            });
    }
}

export default SettingsBase;
export {SettingsBase};
