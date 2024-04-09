// Copyright 2019 LG Electronics, Inc.
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
 * Contains the declaration for the DialogView component.
 *
 */

import {connect} from 'react-redux';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';

import AuthDialog from '../../components/AuthDialog';

const DialogViewBase = kind({
	name: 'DialogView',
	propTypes: {
		ids: PropTypes.array,
		tabs: PropTypes.object,
		selectedIndex: PropTypes.number
	},
	render: ({selectedIndex, ids, tabs}) => {
		if (ids.length === 0) {
			return null;
		}
		const
			authController = tabs[ids[selectedIndex]].authDialog,
			dialog = authController ?
				<AuthDialog controller={authController} /> :
				null;

		return dialog;
	}
});

const mapStateToProps = ({tabsState}) => {
	const {ids, selectedIndex, tabs} = tabsState;
	return {
		ids,
		tabs,
		selectedIndex
	};
};

const mapDispatchToProps = () => ({

});

const DialogView = connect(mapStateToProps, mapDispatchToProps)(DialogViewBase);

export default DialogView;
