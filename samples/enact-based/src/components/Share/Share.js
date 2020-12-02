// Copyright (c) 2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

import Button from '@enact/agate/Button';
import ContextualPopupDecorator from '@enact/agate/ContextualPopupDecorator';
import Icon from '@enact/agate/Icon';
import TooltipDecorator from '@enact/agate/TooltipDecorator';
import kind from '@enact/core/kind';
import {adaptEvent, forward} from '@enact/core/handle';
import $L from '@enact/i18n/$L';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

// services
import SessionService from '../../services/SessionService';
import IntentService from '../../services/IntentService';

const RecieverButton = kind({
	name: 'RecieverButton',
	propTypes: {
		onClick: PropTypes.func,
		sessionId: PropTypes.string
	},
	handlers: {
		onClick: adaptEvent(
			(ev, {sessionId}) => ({...ev, sessionId}),
			forward('onClick')
		)
	},
	render: ({onClick, ...rest}) => (
		<Button {...rest} onClick={onClick} />
	)
});

const ShareIconButton = kind({
	name: 'ShareIconButton',
	computed: {
		icon: (props) => {
			return (
				<Icon
					{...props}
					size="small"
					skin="silicon"
				/>
			);
		}
	},
	render: ({icon, ...rest}) => (
		<TooltipButton
			{...rest}
			icon="screenshare"
			iconComponent={icon}
			size="small"
		/>
	)
});

const SharePopupButton = ContextualPopupDecorator(ShareIconButton);
const TooltipButton = TooltipDecorator({tooltipDestinationProp: 'decoration'}, Button);

class ShareBase extends Component {
	static propTypes = {
		url: PropTypes.string
	};

	constructor (props) {
		super(props);
		this.state = {
			allSessionIds: [],
			open: false,
			disabled: true
		};
	}

	componentDidMount () {
		/* global chrome */
		if (chrome && chrome.app && chrome.app.launchArgs) {
			const launchArgs = JSON.parse(chrome.app.launchArgs);
			if (launchArgs.displayAffinity >= 0) {
				this.displayAffinity = launchArgs.displayAffinity;
			}
		}

		SessionService.getSessionIds({
			onSuccess: (value) => {
				this.setState({
					allSessionIds: value,
					disabled: false
				});
			},
			onFailure: (err) => {
				console.error('Fail to get session info: ', err.code); // eslint-disable-line no-console
				this.setState({
					disabled: true
				});
			}
		});
	}

	renderPopup = () => {
		if (typeof this.displayAffinity === 'undefined' && !this.state.allSessionIds.length) {
			return null;
		}

		const
			receivers = [...this.state.allSessionIds],
			buttons = [],
			orderDisplay = ['AVN', 'RSE-L', 'RSE-R'];

		for (let i = 0; i < receivers.length; i++) {
			if (receivers[i].deviceSetId === orderDisplay[this.displayAffinity]) {
				receivers.splice(i, 1);
			}
		}
		receivers.forEach(receiver => {
			buttons.push(
				<RecieverButton
					key={receiver.userId}
					sessionId={receiver.sessionId}
					size="small"
					onClick={this.onShareURL}
				>
					{`${receiver.userId} (${receiver.deviceSetId})`}
				</RecieverButton>
			);
		});

		return (
			<div onClick={this.closeShare}>
				{buttons}
			</div>
		);
	};

	toggleShare = () => {
		if (this.validateURL()) {
			const open = !this.state.open;
			setTimeout(() => {
				this.setState({
					open
				});
			}, 100);
		}
	};

	closeShare = () => {
		this.setState({
			open: false
		});
	};

	onShareURL = (ev) => {
		IntentService.shareURL(ev.sessionId, this.props.url);
	};

	validateURL = () => {
		const {url} = this.props;
		let retval;

		try {
			retval = new URL(url); // eslint-disable-line no-undef
		} catch (err) {
			console.warn(err.message); // eslint-disable-line no-console
		}

		return !!retval;
	};

	render () {
		const disabled = !this.validateURL();
		return (
			this.state.disabled ? null :
			<SharePopupButton
				disabled={disabled}
				onClick={this.toggleShare}
				onClose={this.closeShare}
				open={this.state.open}
				popupComponent={this.renderPopup}
				size="small"
				tooltipText={$L('Share')}
			/>
		);
	}
}

const mapStateToProps = ({tabsState}) => {
	const {
		selectedIndex,
		ids,
		tabs
	} = tabsState;
	if (ids.length > 0) {
		const {navState} = tabs[ids[selectedIndex]];
		return {url: navState.url};
	}
};

const Share = connect(mapStateToProps, null)(ShareBase);
export default Share;
