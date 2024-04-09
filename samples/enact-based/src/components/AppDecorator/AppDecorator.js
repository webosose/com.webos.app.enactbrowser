// Copyright 2023 LG Electronics, Inc.
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

import React from 'react';
import hoc from '@enact/core/hoc';

const defaultConfig = {
	accent: '#ff2d55',
	highlight: '#9e00d8',
	skin: 'silicon',
	skinVariants: 'night',
	sync: false,
	i18n: false,
};

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

const AppDecorator = hoc(defaultConfig, (config, Wrapped) => {
	return class extends React.Component {
		static displayName = 'AppDecorator';
		constructor (props) {
			super(props);

			this.state = {
				skinVariants: 'night'
			};
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
		};
	}
});

export default AppDecorator;
