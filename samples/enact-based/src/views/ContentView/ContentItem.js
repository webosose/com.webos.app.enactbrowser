// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import ri from '@enact/ui/resolution';
import classNames from 'classnames';

import BookmarkManager from '../BookmarkManager';
import DevSettings from '../DevSettings';
import History from '../History';
import NewTabPage from '../NewTabPage';
import Settings from '../Settings';
import SiteFiltering from '../SiteFiltering';
import {TabTypes} from '../../NevaLib/BrowserModel';
import WebView from '../WebView';

import css from './ContentView.module.less';

const
    hideStyle = {
        display: 'none'
    },
    fullScreenStyle = {
        top: '0',
        height: '100vh'
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
        const tab = tabs[id];
        const historyIndex = tab.navState.history.index;
        const viewId = tab.navState.history.views[historyIndex];
        if (isSelectedTab) {
            style = {};
            if (fullScreen) {
                style = fullScreenStyle;
            }
        }

        switch (tab.navState.history.entries[historyIndex]) {
            case TabTypes.WEBVIEW: {
                const webviewClass = classNames(css.webView, {[css.shrinkHeight]: !fullScreen && alwaysShowBookmarks});

                if (!fullScreen && alwaysShowBookmarks) {
                    style.top = ri.scale(269) + 'px';
                }

                return (
                    <WebView style={style} id={viewId} webView={browser.webViews[viewId]} className={webviewClass}
                        tabs={tabs} browser={browser} />
                );
            }
            case TabTypes.DEV_SETTINGS:
                return <DevSettings
                    style={style}
                    settings={browser.settings}
                    tabPolicy={browser.tabPolicy.constructor.name}
                    browser={browser}
                />;
            case TabTypes.NEW_TAB_PAGE:
                return <NewTabPage style={style} browser={browser} isSelectedTab={isSelectedTab} fullScreen={fullScreen}/>;
            case TabTypes.SETTINGS:
                return <Settings style={style} browser={browser} />;
            case TabTypes.SITE_FILTERING:
                return <SiteFiltering style={style} alwaysShowBookmarks={alwaysShowBookmarks} browser={browser} />;
            case TabTypes.BOOKMARKS:
                return <BookmarkManager style={style} alwaysShowBookmarks={alwaysShowBookmarks} browser={browser} />;
            case TabTypes.HISTORY:
                return <History style={style} alwaysShowBookmarks={alwaysShowBookmarks} browser={browser} isSelectedTab={isSelectedTab} />;
        }
    }
});

export default ContentItem;
export {ContentItem};
