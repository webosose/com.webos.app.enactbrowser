// Copyright (c) 2022 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React, { useState, useEffect, useCallback } from 'react';
import Picker from '@enact/moonstone/Picker'

import css from './ZoomControlMenu.less';

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

function ZoomControlMenu({model, onUpdate}) {
    const [zoomValueIndex, setZoomValueIndex] = useState(zoomFactors.indexOf(model.zoomFactor));

    useEffect(onUpdate, [model, onUpdate, zoomValueIndex]);

    useEffect(() => {
        document.addEventListener('zoomFactorChangedFromBrowserSide', (ev) => {
            console.log(`zoom factor changed from browser side ${ev.detail}`);
            setZoomValueIndex(zoomFactors.indexOf(ev.detail));
        });
    },[]);

    const onChange = useCallback(({value}) => {
        console.log(`Zoom changed (${value})`);
            setZoomValueIndex(value);
            model.zoomIndex = value;
            model.ipc.post('change', { zoomFactor: zoomFactors[value] });
    }, [setZoomValueIndex, model]);

    return (
        <div className={css.zoomMenu}>
            <Picker
                incrementIcon="plus"
                decrementIcon="minus"
                orientation="vertical"
                onChange={onChange}
                joined // use arrow keys to change value
                value={zoomValueIndex}
                width="medium"
            >
                {zoomLabels}
            </Picker>
        </div>
    );
}

export default ZoomControlMenu;
