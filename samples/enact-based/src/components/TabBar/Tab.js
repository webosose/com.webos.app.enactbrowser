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

/**
 * Contains the declaration for the Tab component.
 *
 */

import classNames from 'classnames';
import kind from '@enact/core/kind';
import {MarqueeDecorator} from '@enact/moonstone/Marquee';
import PropTypes from 'prop-types';
import React from 'react';
import Spottable from '@enact/spotlight/Spottable';
import Spotlight from '@enact/spotlight';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import {TabTypes} from '../../NevaLib/BrowserModel';

import css from './Tab.less';

const
	SpottableLi = Spottable('li'),
	TitleDiv = MarqueeDecorator('div');

const Tab = kind({
	name: 'Tab',
	propTypes: {
		browser: PropTypes.object,
		closable: PropTypes.bool,
		error: PropTypes.string,
		iconUrl: PropTypes.string,
		index: PropTypes.number,
		selected: PropTypes.bool,
		title: PropTypes.string || PropTypes.number,
		type: PropTypes.string // or icon
	},
	defaultProps: {
		closable: true,
		type: TabTypes.NEW_TAB_PAGE
	},
	styles: {
		css,
		className: 'tab'
	},
	computed: {
		iconClassName: ({error, type}) => {
			if (type === TabTypes.NEW_TAB_PAGE) {
				return css.newtabFavicon;
			} else if (type === TabTypes.HISTORY) {
				return css.historyFavicon;
			} else if (type === TabTypes.BOOKMARKS) {
				return css.bookmarksFavicon;
			} else if (type === TabTypes.SETTINGS) {
				return css.settingsFavicon;
			} else if (type === TabTypes.SITE_FILTERING) {
				return css.parentalFavicon;
			} else if (error) {
				return css.errorFavicon;
			} else {
				return css.defaultFavicon;
			}
		},
		className: ({className, selected, styler}) => selected ? styler.append(css.selected) : className
	},
	handlers: {
		onClose: (ev, {browser, index}) => {
			ev.stopPropagation();
			browser.closeTab(index);
		},
		onSelect: (ev, {browser, index, selected}) => {
			if (!selected) {
				browser.selectTab(index);
				Spotlight.pause();
				ev.stopPropagation();
			}
		}
	},
	render: ({closable, onClose, iconUrl, onSelect, title, iconClassName, ...rest}) => {
		delete rest.browser;
		delete rest.selected;
		delete rest.index;
		delete rest.type;

		return (
			<SpottableLi {...rest} onClick={onSelect}>
				<div
					style={iconUrl ? {
						backgroundImage: 'url(' + iconUrl + ')',
						backgroundSize: 'contain'
					} : {}}
					className={classNames(css.tabFavicon, iconClassName)}
				/>
				<TitleDiv className={css.tabTitle} marqueeOn="hover">{title}</TitleDiv>
				{
					closable &&
					<IconButton
						backgroundOpacity="transparent"
						className={css.tabCloseButton}
						onClick={onClose}
						type="tabCloseButton"
						small
					/>
				}
			</SpottableLi>
		);
	}
});

export default Tab;
