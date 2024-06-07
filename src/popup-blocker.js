// Copyright 2024 LG Electronics, Inc.
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
