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
import Input from '@enact/moonstone/Input';
import ExpandableList from '@enact/moonstone/ExpandableList';
import {Panel} from '@enact/moonstone/Panels';
import css from './DevSettings.less';

const OnOffButton = kind({
	name: 'OnOffButton',
	render: (props) => {
		return (
			<ToggleButton
				toggleOffLabel={$L('Off')}
				toggleOnLabel={$L('On')}
				small
				{...props}
			/>
		);
	}
});

class UAInput extends Component {
	static propTypes = {
		browser: PropTypes.object
	}

	constructor (props) {
		super(props);

		if (!window.originalUAString) {
			window.originalUAString = this.props.browser.useragentOverride || window.navigator.userAgent;
		}

		window.dev_settings_ua_selected = window.dev_settings_ua_selected || 0;

		this.state = {
			inputValue: this.props.browser.useragentOverride || window.originalUAString,
		}

		let chrome_version_re = /(Chrome\/\d+\.\d+\.\d+\.\d+)/;
		let chrome_version = chrome_version_re.exec(window.navigator.userAgent)[1];

		this.ua_list =
		[
			"Default UA",
			"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.0 Safari/537.36",
			"Mozilla/5.0 (Linux; Android 10; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.0 Mobile Safari/537.36"
		].map(e => {
			return e.replace(chrome_version_re, chrome_version);
		});
	}

	on_select = ({selected, data}) => {
		let newUAString = window.originalUAString;

		if (selected > 0) {
			newUAString = data;
		}

		window.dev_settings_ua_selected = selected;
		this.setState({inputValue: newUAString});
		this.props.browser.useragentOverride = newUAString;
	}

	on_change = (ev) => {
		this.setState({inputValue: ev.value});
		this.props.browser.useragentOverride = ev.value;
	}

	render () {
		return (
			<div>
				<BodyText className={css.menu}>UA string override</BodyText>
				<Input className={css.input}
					dismissOnEnter
					value={this.state.inputValue}
					onChange={this.on_change}
					type="text"
				/>
				<ExpandableList className={css.ua_list}
					title={"Predefined UA strings"}
					noneText={"nothing selected"}
					select={"radio"}
					closeOnSelect
					selected={window.dev_settings_ua_selected}
					onSelect={this.on_select}>
					{this.ua_list}
				</ExpandableList>
			</div>
		);
	}
};

const restoreSessionOptions = ['onlyLastTab', 'allTabs'];

class SimplePolicySettings extends Component {
	static propTypes = {
		settings: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			maxActiveTabFamilies: props.settings.getMaxActiveTabFamilies(),
			maxSuspendedTabFamilies: props.settings.getMaxSuspendedTabFamilies()
		}
	}

	onChangeMaxActiveTabFamilies = (ev) => {
		const {settings} = this.props;
		settings.setMaxActiveTabFamilies(ev.value)
		.catch((err) => console.error(`SimplePolicySettings::setMaxActiveTabFamilies error: ${err}`))
		.finally(() => this.setState({
				maxActiveTabFamilies: settings.getMaxActiveTabFamilies()
			}));
	}

	onChangeMaxSuspendedTabFamilies = (ev) => {
		const {settings} = this.props;
		settings.setMaxSuspendedTabFamilies(ev.value)
		.catch((err) => console.error(`SimplePolicySettings::setMaxSuspendedTabFamilies error: ${err}`))
		.finally(() => this.setState({
				maxSuspendedTabFamilies: settings.getMaxSuspendedTabFamilies()
			}));
	}

	render () {
		return (
			<React.Fragment>
				<BodyText>Simple policy constraints</BodyText>
				<div className={css.indent}>
					<RangePicker min={1} max={100}
						value={this.state.maxActiveTabFamilies}
						onChange={this.onChangeMaxActiveTabFamilies}
					/>
					<BodyText className={css.menu}>Number of active tab families</BodyText>
					<br />
					<RangePicker min={0} max={100}
						value={this.state.maxSuspendedTabFamilies}
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
		settings: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			maxNormal: props.settings.getMaxSuspendedNormal(),
			maxLow: props.settings.getMaxSuspendedLow(),
			maxCritical: props.settings.getMaxSuspendedCritical()
		}
	}

	setSuspendedNumbersState = (normal, low, critical) => {
		const {settings} = this.props;
		settings.setMaxSuspendedNormal(normal)
		.then(() => {
			return settings.setMaxSuspendedLow(low);
		})
		.then(() => {
			return settings.setMaxSuspendedCritical(critical);
		})
		.catch((err) => console.error(`MemoryManagerSettings::setSuspendedNumbersState error: ${err}`))
		.finally(() => this.setState({
			maxNormal: settings.getMaxSuspendedNormal(),
			maxLow: settings.getMaxSuspendedLow(),
			maxCritical: settings.getMaxSuspendedCritical()
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
		settings: PropTypes.object,
		tabPolicy: PropTypes.string,
		browser: PropTypes.object
	}

	constructor (props) {
		super(props);
		this.state = {
			useJSErrorPage: props.browser.settings.getUseJSErrorPage(),
			restorePrevSessionPolicy: props.browser.settings.getRestorePrevSessionPolicy()
		}
	}

	onToggleUseJSErrorPage = () => {
		const {browser} = this.props;
		browser.settings.setUseJSErrorPage(!this.state.useJSErrorPage)
		.catch((err) => console.error(`DevSettingsBase::onToggleUseJSErrorPage ${err}`))
		.finally(() => this.setState({useJSErrorPage: browser.settings.getUseJSErrorPage()}));
	}

	onSelectRestoreSessionPolicy = ({selected}) => {
		const {settings} = this.props.browser;
		settings.setRestorePrevSessionPolicy(restoreSessionOptions[selected])
		.catch((err) => console.error(`DevSettingsBase::onSelectRestoreSessionPolicy ${err}`))
		.finally(() => this.setState({restorePrevSessionPolicy: settings.getRestorePrevSessionPolicy()}));
	}

	render () {
		const
			{
				className,
				settings,
				tabPolicy,
				browser,
				...rest
			} = this.props,
			version = settings.getVersionString(),
			classes = classNames(className, css.settings);

		return (
			<Panel className={css.panel}>
				<Scroller {...rest} className={css.scroller}>
					<div className={classes}>

						<BodyText className={css.menu}>Version string: {version}</BodyText>
						<br />

						<BodyText className={css.menu}>Use JS error pages</BodyText>
						<OnOffButton
							onClick={this.onToggleUseJSErrorPage}
							selected={this.state.useJSErrorPage}
						/>
						<br />

						<UAInput className={css.menu} browser={browser}/>

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
							<SimplePolicySettings settings={browser.settings} />
						}

						{tabPolicy === 'MemoryManagerTabPolicy' &&
							<MemoryManagerSettings settings={browser.settings} />
						}
					</div>
				</Scroller>
			</Panel>
		);
	}
}

export default DevSettingsBase;
