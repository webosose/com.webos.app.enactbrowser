// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the NewTabPage component.
 *
 */

import $L from '@enact/i18n/$L';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Spotlight from '@enact/spotlight';

import {Bookmark} from '../../components/BookmarkBar';
import RecentlyClosed from './RecentlyClosed';
import SiteItem from './SiteItem';

import css from './NewTabPage.less';

const
	placeholder =
	'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
	'9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHN0cm9rZT0iIzU1NSIgZmlsbD0iI2FhYSIg' +
	'ZmlsbC1vcGFjaXR5PSIwLjIiIHN0cm9rZS1vcGFjaXR5PSIwLjgiIHN0cm9rZS13aWR0aD0iNiIgLz48L3N2Zz' +
	'4NCg==',
	numOfMostVisited = 10;

class NewTabPageBase extends Component {
	static propTypes = {
		browser: PropTypes.object,
		isSelectedTab: PropTypes.bool,
		mostVisited: PropTypes.array,
		recentlyClosed: PropTypes.array
	}

	constructor (props) {
		super(props);
		props.browser.recentlyClosed.retrieveAll();
		props.browser.mostVisited.retrieveWithThumbnails(numOfMostVisited);
	}

	componentWillReceiveProps (nextProps) {
		if (!this.props.isSelectedTab && nextProps.isSelectedTab) {
			this.retrieveRecentlyClosed();
			this.retrieveMostVisited();
		}
		else if (this.props.isSelectedTab &&
		         this.props.mostVisited.length !== nextProps.mostVisited.length) {
			// user has deleted most visited site
			this.retrieveMostVisited();
		}
	}

	retrieveMostVisited = () => {
		this.props.browser.mostVisited.retrieveWithThumbnails(numOfMostVisited);
	}

	mostVisitedSites = () => {
		const
			{browser, mostVisited} = this.props,
			sites = [];

		for (let i = 0; i < numOfMostVisited; i++) {
			if (i < mostVisited.length) {
				sites.push(
					<SiteItem
						browser={browser}
						data-index={i}
						key={i}
						onClick={this.onClickMostVisited}
						source={mostVisited[i].thumbnail}
						title={mostVisited[i].title}
						url={mostVisited[i].url}
					/>
				);
			} else {
				sites.push(
					<SiteItem data-index={i} key={i} source={placeholder} />
				);
			}
		}

		return sites;
	}

	onClickMostVisited = (ev) => {
		const
			{mostVisited} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			const url = mostVisited[i].url;
			this.pauseAndNavigate(url);
		}
	}

	pauseAndNavigate = (url) => {
		this.props.browser.navigate(url);
		Spotlight.pause();
	}

	retrieveRecentlyClosed = () => {
		this.props.browser.recentlyClosed.retrieveAll();
	}

	recentlyClosedSites = () => {
		const
			{recentlyClosed} = this.props,
			sites = [];

		for (let i = 0; i < recentlyClosed.length; i++) {
			sites.push(
				<Bookmark
					data-index={i}
					key={i}
					onClick={this.onClickRecentlyClosed}
					title={recentlyClosed[i].title}
					url={recentlyClosed[i].url}
				/>
			);
		}

		return sites;
	}

	onClickRecentlyClosed = (ev) => {
		const
			{recentlyClosed} = this.props,
			i = ev.currentTarget.dataset.index;

		if (!isNaN(i)) {
			const url = recentlyClosed[i].url;
			this.pauseAndNavigate(url);
		}
	}

	render () {
		const {style, ...rest} = this.props;

		delete rest.browser;
		delete rest.dispatch;
		delete rest.isSelectedTab;
		delete rest.mostVisited;
		delete rest.recentlyClosed;

		return (
			<div className={css.newTabPage} style={style}>
				<div {...rest}>
					<div className={css.title}>{$L('Most Visited Sites')}</div>
					<div className={css.sites}>
						{this.mostVisitedSites()}
					</div>
					<RecentlyClosed onClick={this.retrieveRecentlyClosed}>
						{this.recentlyClosedSites()}
					</RecentlyClosed>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ({browserState}) => {
	return {
		mostVisited: browserState.mostVisitedSites,
		recentlyClosed: browserState.recentlyClosed
	};
};

const NewTabPage = connect(mapStateToProps, null)(NewTabPageBase);

export default NewTabPage;
export {NewTabPage};
