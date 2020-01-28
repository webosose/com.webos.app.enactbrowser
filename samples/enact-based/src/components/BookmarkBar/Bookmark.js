// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Bookmark component.
 *
 */

import kind from '@enact/core/kind';
import {MarqueeDecorator} from '@enact/moonstone/Marquee';
import PropTypes from 'prop-types';
import React from 'react';
import Spottable from '@enact/spotlight/Spottable';
import {Draggable} from 'react-beautiful-dnd';

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

	render: ({title, index, ...rest}) => {
		delete rest.index;
		delete rest.url;

		return (
			<Draggable draggableId={`draggable-bookmark-on-bar-${index}`} index={index}>
			{provided => (
				<div
					{...rest}
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					<SpottableDiv>
						<div className={css.favicon} />
						<TitleDiv className={css.title} marqueeOn="hover">{title}</TitleDiv>
					</SpottableDiv>
				</div>
			)}
			</Draggable>
		);
	}
});

export default Bookmark;
