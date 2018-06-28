/**
 * Contains the declaration for the Tab component.
 *
 */

import classNames from 'classnames';
import kind from '@enact/core/kind';
import {MarqueeDecorator} from '@enact/moonstone/Marquee';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from '@enact/moonstone/Spinner';
import Spottable from '@enact/spotlight/Spottable';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';
import {TabTypes} from '../../NevaLib/BrowserModel';

import css from './Tab.less';

const
	SpottableLi = Spottable('li'),
	TitleDiv = MarqueeDecorator('div');

const Tab = kind({
	name: 'Tab',
	propTypes: {
		closable: PropTypes.bool,
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
		iconClassName: ({type}) => {
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
		onSelect: (ev, {browser, index}) => {
			browser.selectTab(index);
		}
	},
	render: ({closable, onClose, isLoading, onSelect, title, iconClassName, ...rest}) => {
		delete rest.browser;
		delete rest.selected;
		delete rest.index;
		delete rest.type;

		return (
			<SpottableLi {...rest} onClick={onSelect}>
				{
					(isLoading) ?
					<Spinner className={css.spinner} transparent />
					:
					<div
						className={classNames(css.tabFavicon, iconClassName)}
					/>
				}
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
