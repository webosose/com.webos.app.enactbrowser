// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the SuggestedItem component.
 *
 */

import Item from '@enact/agate/Item';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';

import css from './SuggestedItem.module.less';
import Icon from '@enact/agate/Icon';

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
			<div className={css.container}>
				<Icon
					backgroundOpacity="transparent"
					className={css.icon}
					css={css}
					spotlightDisabled
					size={"large"}
				>
					{icon}
				</Icon>
				<Item
					className={css.Item}
					{...rest}
				>{`${url} - ${title}`}</Item>
			</div>
		);
	}
});

export default SuggestedItem;
export {
	SuggestedItem
};
