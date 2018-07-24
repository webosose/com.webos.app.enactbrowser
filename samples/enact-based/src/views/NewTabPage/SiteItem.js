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
 * Contains the declaration for the SiteItem component.
 *
 */

import GridListImageItem from '@enact/moonstone/GridListImageItem';
import IconButton from '@enact/moonstone/IconButton';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './SiteItem.less';

const CloseButton = (props) => (
	<IconButton {...props} className={css.xbutton} small>closex</IconButton>
);

class SiteItem extends Component {
	static propTypes = {
		browser: PropTypes.object,
		title: PropTypes.string,
		url: PropTypes.string
	}

	constructor (props) {
		super(props);

		this.state = {
			showingCloseButton: false
		};
	}

	onMouseEnter = () => {
		this.setState({showingCloseButton: true});
	}

	onMouseLeave = () => {
		this.setState({showingCloseButton: false});
	}

	onClick = () => {
		this.props.browser.mostVisited.remove(this.props.url);
	}

	render () {
		const {title, ...rest} = this.props;

		delete rest.browser;
		delete rest.url;

		return (
			<div className={css.container}>
				<GridListImageItem
					{...rest}
					className={css.siteItem}
					caption={title}
					disabled={!title}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				/>
				{
					this.state.showingCloseButton && title ?
					<CloseButton
						onClick={this.onClick}
						onMouseEnter={this.onMouseEnter}
						onMouseLeave={this.onMouseLeave}
					/> : null
				}
			</div>
		);
	}
}

export default SiteItem;
export {SiteItem};
