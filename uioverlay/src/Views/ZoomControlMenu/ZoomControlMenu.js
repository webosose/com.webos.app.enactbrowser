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

import { useState, useEffect, useCallback } from 'react';
import {Picker} from '@enact/agate/Picker'

import css from './ZoomControlMenu.module.less';

const
    zoomLabels = [
        '300%',
        '250%',
        '200%',
        '150%',
        '125%',
        '100%',
        '75%'
    ],
    zoomFactors = [
        3,
        2.5,
        2,
        1.5,
        1.25,
        1,
        0.75
    ];

function ZoomControlMenu({model, onUpdate, ...rest}) {
    const [zoomValueIndex, setZoomValueIndex] = useState(zoomFactors.indexOf(model.zoomFactor));

    useEffect(onUpdate, [model, onUpdate, zoomValueIndex]);

    useEffect(() => {
        model.ipc.post('zoom_value');
        const onZoomValue = (e) => {
            console.log(`zoom factor changed from browser side ${e.detail}`);
            setZoomValueIndex(zoomFactors.indexOf(e.detail));
        };
        document.addEventListener('zoomFactorChangedFromBrowserSide', onZoomValue);
        return () => document.removeEventListener('zoomFactorChangedFromBrowserSide', onZoomValue);
    }, [model.ipc]);

    const onChange = useCallback(({value}) => {
        console.log(`Zoom changed (${value})`);
        setZoomValueIndex(value);
        model.zoomIndex = value;
        model.ipc.post('change', {zoomFactor: zoomFactors[value]});
    }, [setZoomValueIndex, model]);

    return (
        <div className={css.zoomMenu} {...rest}>
            <Picker
                className={css.picker}
                orientation="vertical"
                onChange={onChange}
                value={zoomValueIndex}
                skinVariants={{'night': false}}
                css={css}
            >
                {zoomLabels}
            </Picker>
        </div>
    );
}

export default ZoomControlMenu;
