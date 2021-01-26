// Copyright (c) 2019-2020 LG Electronics, Inc.
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
import classNames from 'classnames';
import BodyText from '@enact/agate/BodyText';
import RadioItem from '@enact/agate/RadioItem';
import RangePicker from '@enact/agate/RangePicker';
import Scroller from '@enact/agate/Scroller';
import ToggleButton from '@enact/agate/ToggleButton';
import kind from '@enact/core/kind';
import Group from '@enact/ui/Group';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './DevSettings.module.less';

const OnOffButton = kind({
	name: 'OnOffButton',
	render: (props) => {
		return (
			<ToggleButton
				toggleOffLabel={$L('Off')}
				toggleOnLabel={$L('On')}
				size="small"
				underline
				{...props}
			/>
		);
	}
});

const restoreSessionOptions = ['onlyLastTab', 'allTabs'];

class SimplePolicySettings extends Component {
	static propTypes = {
		simplePolicy: PropTypes.object
	};

	constructor (props) {
		super(props);
		this.state = {
			maxActive: props.simplePolicy.maxActiveTabFamilies,
			maxSuspended: props.simplePolicy.maxSuspendedTabFamilies
		};
	}

	onChangeMaxActiveTabFamilies = (ev) => {
		const {simplePolicy} = this.props;
		simplePolicy.setMaxActiveTabFamilies(ev.value)
			.catch((err) => console.error(`SimplePolicySettings::setMaxActiveTabFamilies error: ${err}`)) // eslint-disable-line no-console
			.finally(() => this.setState({
				maxActive: simplePolicy.maxActiveTabFamilies
			}));
	};

	onChangeMaxSuspendedTabFamilies = (ev) => {
		const {simplePolicy} = this.props;
		simplePolicy.setMaxSuspendedTabFamilies(ev.value)
			.catch((err) => console.error(`SimplePolicySettings::setMaxSuspendedTabFamilies error: ${err}`)) // eslint-disable-line no-console
			.finally(() => this.setState({
				maxSuspended: simplePolicy.maxSuspendedTabFamilies
			}));
	};

	render () {
		return (
			<React.Fragment>
				<BodyText>Simple policy constraints</BodyText>
				<div className={css.indent}>
					<div className={css.pickerParent}>
						<RangePicker
							min={1} max={100}
							value={this.state.maxActive}
							onChange={this.onChangeMaxActiveTabFamilies}
							orientation="horizontal"
						/>
						<BodyText className={css.menu}>Number of active tab families</BodyText>
					</div>
					<div className={css.pickerParent}>
						<RangePicker
							min={0} max={100}
							value={this.state.maxSuspended}
							onChange={this.onChangeMaxSuspendedTabFamilies}
							orientation="horizontal"
						/>
						<BodyText className={css.menu}>Number of suspended tab families</BodyText>
					</div>
				</div>
			</React.Fragment>
		);
	}
}

class MemoryManagerSettings extends Component {
	static propTypes = {
		memoryManager: PropTypes.object
	};

	constructor (props) {
		super(props);
		this.state = {
			maxNormal: props.memoryManager.maxSuspendedNormal,
			maxLow: props.memoryManager.maxSuspendedLow,
			maxCritical: props.memoryManager.maxSuspendedCritical
		};
	}

	setSuspendedNumbersState = (normal, low, critical) => {
		const {memoryManager} = this.props;
		memoryManager.setSuspendedNumbers(normal, low, critical)
			.catch((err) => console.error(`MemoryManagerSettings::setSuspendedNumbersState error: ${err}`)) // eslint-disable-line no-console
			.finally(() => this.setState({
				maxNormal: memoryManager.maxSuspendedNormal,
				maxLow: memoryManager.maxSuspendedLow,
				maxCritical: memoryManager.maxSuspendedCritical
			}));
	};

	onChangeMaxSuspendedTabsNormal = (ev) => {
		let {maxLow, maxCritical} = this.state;
		if (ev.value < maxLow) {
			maxLow = ev.value;
		}
		if (ev.value < maxCritical) {
			maxCritical = ev.value;
		}
		this.setSuspendedNumbersState(ev.value, maxLow, maxCritical);
	};

	onChangeMaxSuspendedTabsLow = (ev) => {
		let {maxNormal, maxCritical} = this.state;
		if (ev.value > maxNormal) {
			maxNormal = ev.value;
		}
		if (ev.value < maxCritical) {
			maxCritical = ev.value;
		}
		this.setSuspendedNumbersState(maxNormal, ev.value, maxCritical);
	};

	onChangeMaxSuspendedTabsCritical = (ev) => {
		let {maxNormal, maxLow} = this.state;
		if (ev.value > maxNormal) {
			maxNormal = ev.value;
		}
		if (ev.value > maxLow) {
			maxLow = ev.value;
		}
		this.setSuspendedNumbersState(maxNormal, maxLow, ev.value);
	};

	render () {
		return (
			<React.Fragment>
				<BodyText>Memory manager policy constraints</BodyText>
				<div className={css.indent}>
					<RangePicker
						min={0} max={100}
						value={this.state.maxNormal}
						onChange={this.onChangeMaxSuspendedTabsNormal}
						orientation="horizontal"
					/>
					<BodyText className={css.menu}>Max suspended tab when memory level is normal</BodyText>
					<br />
					<RangePicker
						min={0} max={100}
						value={this.state.maxLow}
						onChange={this.onChangeMaxSuspendedTabsLow}
						orientation="horizontal"
					/>
					<BodyText className={css.menu}>Max suspended tab when memory level is low</BodyText>
					<br />
					<RangePicker
						min={0} max={100}
						value={this.state.maxCritical}
						onChange={this.onChangeMaxSuspendedTabsCritical}
						orientation="horizontal"
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
	};

	constructor (props) {
		super(props);
		this.state = {
			useBuiltInErrorPages: props.config.useBuiltInErrorPages,
			restorePrevSessionPolicy: props.config.restorePrevSessionPolicy
		};
	}

	onToggleUseBuiltInErrorPages = () => {
		const {config} = this.props;
		config.setUseBuiltInErrorPages(!this.state.useBuiltInErrorPages)
			.catch((err) => console.error(`DevSettingsBase::onToggleUseBuiltInErrorPages ${err}`)) // eslint-disable-line no-console
			.finally(() => this.setState({useBuiltInErrorPages: config.useBuiltInErrorPages}));
	};

	onSelectRestoreSessionPolicy = ({selected}) => {
		const {config} = this.props;
		config.setRestorePrevSessionPolicy(restoreSessionOptions[selected])
			.catch((err) => console.error(`DevSettingsBase::onSelectRestoreSessionPolicy ${err}`)) // eslint-disable-line no-console
			.finally(() => this.setState({restorePrevSessionPolicy: config.restorePrevSessionPolicy}));
	};

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
							itemProps={{inline: true, className: css.inlineGroupItem}}
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
