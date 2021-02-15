// Copyright (c) 2018-2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the SiteItem component.
 *
 */

import ImageItem from '@enact/agate/ImageItem';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Spottable from '@enact/spotlight/Spottable';
import Icon from '@enact/agate/Icon';

import css from './SiteItem.module.less';

const SpottableDiv = Spottable('div');

const
	CloseButton = (props) => (
		<SpottableDiv
			{...props}
			className={css.xbutton}
		>
			<Icon
				size="small"
			>closex</Icon>
		</SpottableDiv>
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
	};

	static defaultProps = {
		source: placeholder
	};

	constructor (props) {
		super(props);
	}

	onClick = () => {
		this.props.browser.mostVisited.remove(this.props.url);
	};

	render () {
		const {title, source, ...rest} = this.props;
		const children = title;

		delete rest.browser;
		delete rest.url;

		return (
			<div className={css.container}>
				<ImageItem
					{...rest}
					className={css.siteItem}
					placeholder={placeholder}
					src={source}
				>
					{children}
				</ImageItem>
				{
					title ? <CloseButton
						onClick={this.onClick}
					/> : null
				}
			</div>
		);
	}
}

export default SiteItem;
export {SiteItem, EmptyItem};
