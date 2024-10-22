// Copyright 2018 LG Electronics, Inc.
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
import {MarqueeDecorator} from '@enact/ui/Marquee';
import PropTypes from 'prop-types';
import Spinner from '@enact/agate/Spinner';
import Spottable from '@enact/spotlight/Spottable';
import Spotlight from '@enact/spotlight';
import {Draggable} from 'react-beautiful-dnd';
import {connect} from 'react-redux';
import Button from '@enact/agate/Button';
import Skinnable from '@enact/agate/Skinnable';
import $L from '@enact/i18n/$L';

import {TabTypes} from 'js-browser-lib/browser-model';
import redIndicator from '../../../assets/popup/record_icon.svg';
import css from './Tab.module.less';

const
	SpottableDiv = Spottable('div'),
	TitleDiv = MarqueeDecorator('div');

const Tab = kind({
	name: 'Tab',
	propTypes: {
		browser: PropTypes.object,
		closable: PropTypes.bool,
		error: PropTypes.string,
		iconUrl: PropTypes.string,
		index: PropTypes.number,
		isLoading: PropTypes.bool,
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
		isActive: ({browser, index}) => {
			try {
				return browser.getWebviewByTabIndex({tabIndex: index}).activeState === 'activated';
			} catch (e) {
				return false;
			}
		},
		className: ({className, selected, styler}) => selected ? styler.append(css.selected) : className
	},
	handlers: {
		onClose: (ev, {browser, index}) => {
			ev.stopPropagation();
			window.document.dispatchEvent(new Event("click"));
			browser.closeTab(index);
			browser.sendZoomFactorToZoomMenu();
		},
		onSelect: (ev, {browser, index, selected}) => {
			if (!selected) {
				browser.selectTab(index);
				Spotlight.pause();
				ev.stopPropagation();
				window.document.dispatchEvent(new Event("click"));
				browser.sendZoomFactorToZoomMenu();
			}
		}
	},
	render: ({closable, onClose, iconUrl, isLoading, onSelect, title, iconClassName, index, isActive, skinVariants, showRedIndicator, selectedIndex, tabsState, ...rest}) => {
		delete rest.browser;
		delete rest.selected;
		delete rest.index;
		delete rest.type;

		return (
			<Draggable draggableId={`draggable-tab-${index}`} index={index}>
			{provided => (
			<li
				{...rest}
				ref={provided.innerRef}
				{...provided.draggableProps}
				{...provided.dragHandleProps}
			>
				<SpottableDiv onClick={onSelect}>
				{
					(isLoading && isActive) ?
						<Spinner color={skinVariants.night ? 'light' : 'dark'} size="small" className={css.loadingIcon}/> :
						<div
							style={iconUrl ? {
								backgroundImage: 'url(' + iconUrl + ')',
								backgroundSize: 'contain'
							} : {}}
							className={classNames(css.tabFavicon, iconClassName)}
						/>
				}
					<TitleDiv className={css.tabTitle} marqueeOn="hover">{$L(title)}</TitleDiv>
					{showRedIndicator && <img src={redIndicator} width={25} />}
					{
						closable &&
						<Button
							backgroundOpacity="transparent"
							className={css.tabCloseButton}
							onClick={onClose}
							icon="closex"
							size="smallest"
						/>
					}
				</SpottableDiv>
			</li>
			)}
			</Draggable>
		);
	}
});

const TabBase = Skinnable({ variantsProp: 'skinVariants' }, Tab);

const mapStateToProps = ({ tabsState }) => ({
	selectedIndex: tabsState.selectedIndex,
	tabsState: tabsState.tabs
});

export default connect(mapStateToProps, null)(TabBase);
