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
