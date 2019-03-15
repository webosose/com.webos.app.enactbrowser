// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';
import ri from '@enact/ui/resolution';

import BookmarkManager from '../BookmarkManager';
import DevSettings from '../DevSettings';
import ErrorPage from '../ErrorPage';
import History from '../History';
import NewTabPage from '../NewTabPage';
import Settings from '../Settings';
import SiteFiltering from '../SiteFiltering';
import {TabTypes} from '../../NevaLib/BrowserModel';
import WebView from '../WebView';

import css from './ContentView.less';

const
    hideStyle = {
        display: 'none'
    },
    fullScreenStyle = {
        top: '0',
        height: '100vh'
    }

const shouldShowUIErrorPage = (config, error) => {
    return error && (!config.useBuiltInErrorPages || error === 'RENDERER_CRASHED' || error === 'PAGE_UNRESPONSIVE');
}

const ContentItem = kind({
    name: 'ContentItem',
    propTypes: {
        alwaysShowBookmarks: PropTypes.bool,
        browser: PropTypes.object,
        fullScreen: PropTypes.bool,
        id: PropTypes.string,
        isSelectedTab: PropTypes.bool,
        tabs: PropTypes.object
    },
    render: ({alwaysShowBookmarks, browser, fullScreen, isSelectedTab, id, tabs}) => {
        let style = Object.assign({}, hideStyle);
        if (isSelectedTab) {
            style = {};
            if (fullScreen) {
                style = fullScreenStyle;
            }
        }

        switch (tabs[id].type) {
            case TabTypes.WEBVIEW: {
                if (!fullScreen && alwaysShowBookmarks) {
                    style.top = ri.scale(269) + 'px';
                }

                return (
                    <div>
                        <WebView style={style} id={id} webView={browser.webViews[id]} className={css.webView} />
                        {shouldShowUIErrorPage(browser.config, tabs[id].error) ?
                            <ErrorPage style={style} errorMsg={tabs[id].error} /> :
                            null
                        }
                    </div>
                );
            }
            case TabTypes.DEV_SETTINGS:
                return <DevSettings
                    style={style}
                    config={browser.config}
                    tabPolicy={browser.tabPolicy.constructor.name}
                />;
            case TabTypes.NEW_TAB_PAGE:
                return <NewTabPage style={style} browser={browser} isSelectedTab={isSelectedTab} />;
            case TabTypes.SETTINGS:
                return <Settings style={style} browser={browser} />;
            case TabTypes.SITE_FILTERING:
                return <SiteFiltering style={style} browser={browser} />;
            case TabTypes.BOOKMARKS:
                return <BookmarkManager style={style} browser={browser} />;
            case TabTypes.HISTORY:
                return <History style={style} browser={browser} isSelectedTab={isSelectedTab} />;
        }
    }
});

export default ContentItem;
export {ContentItem};