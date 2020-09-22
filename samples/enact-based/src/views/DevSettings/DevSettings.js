// Copyright (c) 2019 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the Developer Settings component.
 *
 */

import $L from '@enact/i18n/$L';
import BodyText from '@enact/moonstone/BodyText';
import classNames from 'classnames';
import Group from '@enact/ui/Group';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';
import RadioItem from '@enact/moonstone/RadioItem';
import React, {Component} from 'react';
import Scroller from '@enact/moonstone/Scroller';
import ToggleButton from '@enact/moonstone/ToggleButton';
import RangePicker from '@enact/moonstone/RangePicker';

import css from './DevSettings.module.less';

const OnOffButton = kind({
	name: 'OnOffButton',
	render: (props) => {
		return (
			<ToggleButton
				toggleOffLabel={$L('Off')}
				toggleOnLabel={$L('On')}
				size="small"
				{...props}
			/>
		);
	}
});

const restoreSessionOptions = ['onlyLastTab', 'allTabs'];

class SimplePolicySettings extends Component {
	static propTypes = {
		simplePolicy: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			maxActive: props.simplePolicy.maxActiveTabFamilies,
			maxSuspended: props.simplePolicy.maxSuspendedTabFamilies
		}
	}

	onChangeMaxActiveTabFamilies = (ev) => {
		const {simplePolicy} = this.props;
		simplePolicy.setMaxActiveTabFamilies(ev.value)
		.catch((err) => console.error(`SimplePolicySettings::setMaxActiveTabFamilies error: ${err}`))
		.finally(() => this.setState({
				maxActive: simplePolicy.maxActiveTabFamilies
			}));
	}

	onChangeMaxSuspendedTabFamilies = (ev) => {
		const {simplePolicy} = this.props;
		simplePolicy.setMaxSuspendedTabFamilies(ev.value)
		.catch((err) => console.error(`SimplePolicySettings::setMaxSuspendedTabFamilies error: ${err}`))
		.finally(() => this.setState({
				maxSuspended: simplePolicy.maxSuspendedTabFamilies
			}));
	}

	render () {
		return (
			<React.Fragment>
				<BodyText>Simple policy constraints</BodyText>
				<div className={css.indent}>
					<RangePicker min={1} max={100}
						value={this.state.maxActive}
						onChange={this.onChangeMaxActiveTabFamilies}
					/>
					<BodyText className={css.menu}>Number of active tab families</BodyText>
					<br />
					<RangePicker min={0} max={100}
						value={this.state.maxSuspended}
						onChange={this.onChangeMaxSuspendedTabFamilies}
					/>
					<BodyText className={css.menu}>Number of suspended tab families</BodyText>
				</div>
			</React.Fragment>
		);
	}
}

class MemoryManagerSettings extends Component {
	static propTypes = {
		memoryManager: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			maxNormal: props.memoryManager.maxSuspendedNormal,
			maxLow: props.memoryManager.maxSuspendedLow,
			maxCritical: props.memoryManager.maxSuspendedCritical
		}
	}

	setSuspendedNumbersState = (normal, low, critical) => {
		const {memoryManager} = this.props;
		memoryManager.setSuspendedNumbers(normal, low, critical)
		.catch((err) => console.error(`MemoryManagerSettings::setSuspendedNumbersState error: ${err}`))
		.finally(() => this.setState({
				maxNormal: memoryManager.maxSuspendedNormal,
				maxLow: memoryManager.maxSuspendedLow,
				maxCritical: memoryManager.maxSuspendedCritical
			}));
	}

	onChangeMaxSuspendedTabsNormal = (ev) => {
		let {maxLow, maxCritical} = this.state;
		if (ev.value < maxLow) {
			maxLow = ev.value;
		}
		if (ev.value < maxCritical) {
			maxCritical = ev.value;
		}
		this.setSuspendedNumbersState(ev.value, maxLow, maxCritical);
	}

	onChangeMaxSuspendedTabsLow = (ev) => {
		let {maxNormal, maxCritical} = this.state;
		if (ev.value > maxNormal) {
			maxNormal = ev.value;
		}
		if (ev.value < maxCritical) {
			maxCritical = ev.value;
		}
		this.setSuspendedNumbersState(maxNormal, ev.value, maxCritical);
	}

	onChangeMaxSuspendedTabsCritical = (ev) => {
		let {maxNormal, maxLow} = this.state;
		if (ev.value > maxNormal) {
			maxNormal = ev.value;
		}
		if (ev.value > maxLow) {
			maxLow = ev.value;
		}
		this.setSuspendedNumbersState(maxNormal, maxLow, ev.value);
	}

	render () {
		return (
			<React.Fragment>
				<BodyText>Memory manager policy constraints</BodyText>
				<div className={css.indent}>
					<RangePicker min={0} max={100}
						value={this.state.maxNormal}
						onChange={this.onChangeMaxSuspendedTabsNormal}
					/>
					<BodyText className={css.menu}>Max suspended tab when memory level is normal</BodyText>
					<br />
					<RangePicker min={0} max={100}
						value={this.state.maxLow}
						onChange={this.onChangeMaxSuspendedTabsLow}
					/>
					<BodyText className={css.menu}>Max suspended tab when memory level is low</BodyText>
					<br />
					<RangePicker min={0} max={100}
						value={this.state.maxCritical}
						onChange={this.onChangeMaxSuspendedTabsCritical}
					/>
					<BodyText className={css.menu}>Max suspended tab when memory level is critical</BodyText>
				</div>
			</React.Fragment>
		);
	}
}

class DevSettingsBase extends Component {
	static propTypes = {
		config: PropTypes.object,
		tabPolicy: PropTypes.string
	}

	constructor (props) {
		super(props);
		this.state = {
			useBuiltInErrorPages: props.config.useBuiltInErrorPages,
			restorePrevSessionPolicy: props.config.restorePrevSessionPolicy
		}
	}

	onToggleUseBuiltInErrorPages = () => {
		const {config} = this.props;
		config.setUseBuiltInErrorPages(!this.state.useBuiltInErrorPages)
		.catch((err) => console.error(`DevSettingsBase::onToggleUseBuiltInErrorPages ${err}`))
		.finally(() => this.setState({useBuiltInErrorPages: config.useBuiltInErrorPages}));
	}

	onSelectRestoreSessionPolicy = ({selected}) => {
		const {config} = this.props;
		config.setRestorePrevSessionPolicy(restoreSessionOptions[selected])
		.catch((err) => console.error(`DevSettingsBase::onSelectRestoreSessionPolicy ${err}`))
		.finally(() => this.setState({restorePrevSessionPolicy: config.restorePrevSessionPolicy}));
	}

	render () {
		const
			{
				className,
				config,
				tabPolicy,
				...rest
			} = this.props,
			version = config.versionString,
			classes = classNames(className, css.settings);

		return (
			<Scroller {...rest} className={css.scroller}>
				<div className={classes}>

					<BodyText className={css.menu}>Version string: {version}</BodyText>
					<br />

					<BodyText className={css.menu}>Use built in error pages</BodyText>
					<OnOffButton
						onClick={this.onToggleUseBuiltInErrorPages}
						selected={this.state.useBuiltInErrorPages}
					/>
					<br />

					<BodyText>Restore previous session policy</BodyText>
					<div className={css.indent}>
						<Group
							childComponent={RadioItem}
							itemProps={{inline: true}}
							select="radio"
							selectedProp="selected"
							defaultSelected={restoreSessionOptions.indexOf(this.state.restorePrevSessionPolicy)}
							onSelect={this.onSelectRestoreSessionPolicy}
						>
							{[
								'Last tab',
								'All tabs'
							]}
						</Group>
					</div>

					{tabPolicy === 'RendererPerTabPolicy' &&
						<SimplePolicySettings simplePolicy={config.simplePolicy} />
					}

					{tabPolicy === 'MemoryManagerTabPolicy' &&
						<MemoryManagerSettings memoryManager={config.memoryManager} />
					}
				</div>
			</Scroller>
		);
	}
}

export default DevSettingsBase;
