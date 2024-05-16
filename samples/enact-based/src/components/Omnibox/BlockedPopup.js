// Copyright (c) 2024 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import Button from '@enact/agate/Button';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './Omnibox.module.less';

function BlockedPopupBase(props) {
    const [isOpened, setIsOpened] = useState(false);
    const {blockedPopup, url} = props;

    useEffect(() => {
        const onSubmit = (data) => {
            blockedPopup.hide();
            if (url && data === true) {
                props.browser.allowPopup(props.tabId, url);
            }
        };
        blockedPopup.ipc.ipcObject.on('submit', onSubmit);
        return () => {
            blockedPopup.hide();
            blockedPopup.ipc.ipcObject.removeEventListener('submit', onSubmit);
        };
    }, []);

    useEffect(() => {
        if (isOpened) {
            blockedPopup.show({targetUrl: props.targetUrl});
            ['click', 'tab-select'].forEach(ev => {
                window.document.addEventListener(ev, () => {
                    console.log(`BlockedPopup::on document ${ev} event`);
                    if (isOpened) {
                        setIsOpened(false);
                    }
                }, {once: true});
            });
        }
        else {
            blockedPopup.hide();
        }
    });

    const onShowDialog = () => setTimeout(() => setIsOpened(prev => !prev), 100);

    return (
        <Button
            css={css}
            backgroundOpacity='transparent'
            className={classNames(css.iconButton, css, css.small, css.blockedButton)}
            onClick={onShowDialog}
            icon='error'
            size='large'
        />
    );
}

BlockedPopupBase.propTypes = {
    browser: PropTypes.object,
    blockedPopup: PropTypes.object,
    tabId: PropTypes.number,
    url: PropTypes.string,
    targetUrl: PropTypes.string,
};

const mapStateToProps = ({tabsState}) => {
    const {selectedIndex, ids, tabs} = tabsState;
    let tabId, url, targetUrl;
    if (ids.length > 0) {
        tabId = ids[selectedIndex];
        const {navState, popupState} = tabs[tabId];
        if (navState) {
            url = navState.url;
        }
        if (popupState) {
            targetUrl = popupState.targetUrl;
        }
    }
    return {tabId, url, targetUrl};
};

const BlockedPopup = connect(mapStateToProps)(BlockedPopupBase);
export default BlockedPopup;
