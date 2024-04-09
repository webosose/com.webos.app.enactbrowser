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
 * Contains the declaration for the SiteItem component.
 *
 */

import GridListImageItem from '@enact/agate/ImageItem';
import Button from '@enact/agate/Button';
import PropTypes from 'prop-types';
import {Component} from 'react';

import css from './SiteItem.module.less';

const
	CloseButton = (props) => (
		<Button
			{...props}
			className={css.xbutton}
			size={"small"}
			icon="closex"
		/>
	),
	EmptyItem = (props) => (
		<div className={css.emptyContainer} {...props} />
	),
	placeholder =
	'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
	'9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHN0cm9rZT0iIzU1NSIgZmlsbD0iI2FhYSIg' +
	'ZmlsbC1vcGFjaXR5PSIwLjIiIHN0cm9rZS1vcGFjaXR5PSIwLjgiIHN0cm9rZS13aWR0aD0iNiIgLz48L3N2Zz' +
	'4NCg==';


class SiteItem extends Component {
	static propTypes = {
		browser: PropTypes.object,
		source: PropTypes.string,
		title: PropTypes.string,
		url: PropTypes.string
	}

	static defaultProps = {
		source: placeholder
	}

	constructor (props) {
		super(props);
	}

	onClick = () => {
		this.props.browser.mostVisited.remove(this.props.url);
	}

	render () {
		const {title, source, ...rest} = this.props;

		delete rest.browser;
		delete rest.url;

		return (
			<div className={css.container}>
				<GridListImageItem
					{...rest}
					className={css.siteItem}
					caption={title}
					disabled={!title}
					placeholder={placeholder}
					src={source}
				/>
				{
					title ?
					<CloseButton
						onClick={this.onClick}
					/> : null
				}
			</div>
		);
	}
}

export default SiteItem;
export {SiteItem, EmptyItem};
