/**
 * Contains the declaration for the SuggestedItem component.
 *
 */

import Item from '@enact/moonstone/Item';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import {BrowserIconButton as IconButton} from '../BrowserIconButton';

import css from './SuggestedItem.less';

const SuggestedItem = kind({
	name: 'SuggestedItem',
	propTypes: {
		title: PropTypes.string,
		url: PropTypes.string,
		icon: PropTypes.string
	},
	style: {
		css,
		className: 'suggestedItem'
	},
	render: ({url, title, icon, ...rest}) => {
		return (
			<div>
				<IconButton
					backgroundOpacity="transparent"
					className={css.icon}
					spotlightDisabled
					type={icon}
				/>
				<Item className={css.item} {...rest}>{`${url} - ${title}`}</Item>
			</div>
		);
	}
});

export default SuggestedItem;
export {
	SuggestedItem
};
