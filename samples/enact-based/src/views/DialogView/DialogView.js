// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the DialogView component.
 *
 */

import {connect} from 'react-redux';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import React from 'react';
import ri from '@enact/ui/resolution';

import AuthDialog from '../../components/AuthDialog';

const
	hideStyle = {
		display: 'none'
	},
	fullScreenStyle = {
		top: '0',
		height: '100vh'
	}

const DialogViewBase = kind({
	name: 'DialogView',
	propTypes: {
		ids: PropTypes.array,
		tabs: PropTypes.object,
		selectedIndex: PropTypes.number
	},
	render: ({selectedIndex, ids, tabs, ...rest}) => {
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
