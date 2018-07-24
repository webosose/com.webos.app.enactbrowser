// Copyright (c) 2018 LG Electronics, Inc.
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
                this.storage.setValues(valuesToInit)
                Object.assign(storedValues, valuesToInit);
                return storedValues;
            });
    }
}

export default SettingsBase;
export {SettingsBase};
