// Copyright 2022 LG Electronics, Inc.
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

import { useCallback, useEffect } from 'react';
import Button from '@enact/agate/Button';
import $L from '@enact/i18n/$L';

import css from './ExitFullscreenButton.module.less';

function ExitFullscreenButton(props) {
    const escKeyHandler = useCallback(({key}) => {
        if (key === 'Escape') {
            props.model.onClick()();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.model, props.model.onClick]);

    useEffect(() => {
        document.addEventListener('keydown', escKeyHandler);
        return () => {
            document.removeEventListener('keydown', escKeyHandler);
        }
    }, [props.model.onClick, escKeyHandler]);

    return (
        <div {...props} className={css.topArea}>
            <Button
                minWidth={false}
                className={css.exitButton}
                onClick={props.model.onClick()}
                size={"large"}
            >
                {$L('Exit Full Screen')}
            </Button>
        </div>
    );
}

export default ExitFullscreenButton;
