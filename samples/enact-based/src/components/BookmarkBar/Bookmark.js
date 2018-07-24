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
 * Contains the declaration for the Bookmark component.
 *
 */

import kind from '@enact/core/kind';
import {MarqueeDecorator} from '@enact/moonstone/Marquee';
import PropTypes from 'prop-types';
import React from 'react';
import Spottable from '@enact/spotlight/Spottable';

import css from './Bookmark.less';

const
	SpottableDiv = Spottable('div'),
	TitleDiv = MarqueeDecorator('div');

const Bookmark = kind({
	name: 'Bookmark',

	propTypes: {
		index: PropTypes.number,
		title: PropTypes.string || PropTypes.number,
		url: PropTypes.string
	},

	styles: {
		css,
		className: 'bookmark'
	},

	render: ({title, ...rest}) => {
		delete rest.index;
		delete rest.url;

		return (
			<SpottableDiv {...rest}>
				<div className={css.favicon} />
				<TitleDiv className={css.title} marqueeOn="hover">{title}</TitleDiv>
			</SpottableDiv>
		);
	}
});

export default Bookmark;
