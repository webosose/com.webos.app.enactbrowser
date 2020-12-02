// Copyright (c) 2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import React from 'react';
import hoc from '@enact/core/hoc';

import PreferenceService from './preference';

const DummyDiv = () => (
	<div
		style={{
			position: 'absolute',
			left: '0',
			top: '0',
			right: '0',
			bottom: '0',
			background: 'black'
		}}
	/>
);

const defaultConfig = {
	accent: '#ff2d55',
	highlight: '#9e00d8',
	skin: 'silicon',
	skinVariants: 'night'
};

const AppDecorator = hoc(defaultConfig, (config, Wrapped) => {
	return class extends React.Component {
		static displayName = 'AppDecorator';

		constructor (props) {
			super(props);

			this.state = {
				skinVariants: null
			};
		}

		componentDidMount () {
			PreferenceService.getSkinPref({
				onSuccess: (response) => {
					if (response.returnValue && response.settings && typeof response.settings.modeDayNight === 'string') {
						this.setState(() => {
							return {
								skinVariants: response.settings.modeDayNight
							};
						});
					}
				},
				onFailure: () => {
					this.setState(() => {
						return {
							skinVariants: config.skinVariants
						};
					});
				}
			});
		}

		render () {
			const {accent, highlight, skin} = config;

			return (
				(this.state.skinVariants === null) ?
					<DummyDiv /> :
					<Wrapped
						accent={accent}
						highlight={highlight}
						skin={skin}
						skinVariants={this.state.skinVariants}
						{...this.props}
					/>
			);
		}
	};
});

export default AppDecorator;
export {AppDecorator};
