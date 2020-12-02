// Copyright (c) 2018-2020 LG Electronics, Inc.
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

import Button from '@enact/agate/Button';
import Item from '@enact/agate/Item';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';

import css from './SuggestedItem.module.less';

const SuggestedItem = kind({
	name: 'SuggestedItem',
	propTypes: {
		icon: PropTypes.string,
		title: PropTypes.string,
		url: PropTypes.string
	},
	style: {
		css,
		className: 'suggestedItem'
	},
	render: ({url, title, icon, ...rest}) => {
		return (
			<div>
				<Button
					backgroundOpacity="transparent"
					className={css.icon}
					css={css}
					icon={icon}
					skinVariants={{'night': false}}
					spotlightDisabled
				/>
				<Item
					className={css.item}
					skinVariants={{'night': false}}
					{...rest}
				>
					{`${url} - ${title}`}
				</Item>
			</div>
		);
	}
});

export default SuggestedItem;
export {
	SuggestedItem
};
