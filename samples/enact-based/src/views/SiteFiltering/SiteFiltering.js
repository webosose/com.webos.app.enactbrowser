// Copyright 2018 LG Electronics, Inc.
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
 * Contains the declaration for the SiteFiltering component.
 *
 */

import $L from '@enact/i18n/$L';
import BodyText from '@enact/agate/BodyText';
import Button from '@enact/agate/Button';
import {connect} from 'react-redux';
import Group from '@enact/ui/Group';
import Icon from '@enact/agate/Icon';
import Input from '@enact/agate/Input';
import Popup from '@enact/agate/Popup';
import PropTypes from 'prop-types';
import RadioItem from '@enact/agate/RadioItem';
import {useEffect, useState, useReducer} from 'react';
import ri from '@enact/ui/resolution';
import VirtualList from '@enact/agate/VirtualList';

import PinPopup from '../../components/PinPopup';
import OverlapVKB from '../../components/OverlapVKB';
import SiteFilteringItem from './SiteFilteringItem';
import css from './SiteFiltering.module.less';

const filteringOptions = ['off', 'whitelist', 'blacklist'];

function SiteFilteringBase({browser, data, siteFiltering, ...rest}) {
	const [deletePopupOpen, setDeletePopupOpen] = useState(false);
	const [resetPinPopupOpen, setResetPinPopupOpen] = useState(false);
	const [urlToAdd, setUrlToAdd] = useState('');
	const [urlValidation, setUrlValidation] = useState('');
	const [selected, setSelected] = useState([]);
	const optionIndex = filteringOptions.indexOf(siteFiltering);
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	const onSelectSiteFiltering = ({selected}) => {
		const newMode = filteringOptions[selected];
		browser.settings.setSiteFiltering(newMode)
			.then(() => browser.siteFiltering.setMode(newMode));
		setSelected([]);
	}

	const onToggle = (url) => (ev) => {
		setSelected((prev) => ev.selected ? [...prev, url] : prev.filter(u => u !== url));
	}

	const renderItem = ({index, ...rest}) => {
		const url = data[index];
		const isItemSelected = selected.some(u => u === url);
		return (
			<SiteFilteringItem
				{...rest}
				url={url}
				selected={isItemSelected}
				onToggle={onToggle(url)}
			/>
		);
	}

	const onChange = (ev) => {
		setUrlToAdd(ev.value);
		if (urlValidation) {
			setUrlValidation('');
		}
	}

	const onAdd = (ev) => {
		if (validateURL()) {
			browser.siteFiltering.addURL(urlToAdd);
			setUrlToAdd('');
		} else {
			setUrlValidation('Please enter valid URL.');
		}
		//prevent the form submit
		ev.preventDefault();
		ev.stopPropagation();
	}

	const validateURL = () => {
		const regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-zA-Z0-9]-*)*[a-zA-Z0-9]+)(?:\.(?:[a-zA-Z0-9]-*)*[a-zA-Z0-9]+)*(?:\.(?:[a-zA-Z]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
		return regexp.test(urlToAdd);
	}

	const onSelectAll = () => {
		setSelected(data.length === selected.length ? [] : data);
	}

	const onDelete = () => {
		setDeletePopupOpen(true);
	}

	const onDeleteYes = () => {
		setDeletePopupOpen(false);
		browser.siteFiltering.deleteURLs(selected);
		setSelected([]);
	}

	const onDeleteNo = () => {
		setDeletePopupOpen(false);
	}

	const onOpenResetPinPopup = () => {
		setResetPinPopupOpen(true);
	}

	const onCloseResetPinPopup = () => {
		setResetPinPopupOpen(false);
	}

	const onSubmitPinCode = (pinCode) => {
		browser.settings.setPinCode(pinCode)
			.then(() => {
				setResetPinPopupOpen(false);
			});
	}

	const onLocaleChange = () => {
		console.log('[SiteFilterBase]::webOSLocaleChange');
		forceUpdate();
	}

	useEffect(() => {
		document.addEventListener('webOSLocaleChange', onLocaleChange);
		return () => window.removeEventListener('webOSLocaleChange', onLocaleChange);
	}, []);

	return (
		<OverlapVKB {...rest}>
			<div className={css.siteFiltering}>
				<BodyText>{$L('Site Filtering')}</BodyText>
				<Group
					className={css.flex}
					childComponent={RadioItem}
					itemProps={{inline: true}}
					select='radio'
					selectedProp='selected'
					defaultSelected={optionIndex}
					onSelect={onSelectSiteFiltering}
				>
					{[$L('Off'), $L('Approved Sites'), $L('Blocked Sites')]}
				</Group>
				<div>
					{$L('Approved Sites: Anyone can access only the sites on this list.')}
					<br />
					{$L('Blocked Sites: Nobody can access the sites on this list.')}
				</div>
				<br />
				{(optionIndex === 1) && <BodyText>{$L('Approved Sites List')}</BodyText>}
				{(optionIndex === 2) && <BodyText>{$L('Blocked Sites List')}</BodyText>}
				{(optionIndex === 1 || optionIndex === 2) &&
					<div>
						<Popup
							open={deletePopupOpen}
							noAutoDismiss
						>
							<span>{(data && selected && data.length === selected.length) ?
								'Do you want to delete all websites?'
								: 'Do you want to delete the selected website(s)?'}</span>
							<buttons>
								<Button onClick={onDeleteNo}>No</Button>
								<Button onClick={onDeleteYes}>Yes</Button>
							</buttons>
						</Popup>
						<form onSubmit={onAdd}>
							<div className={css.inputContainer}>
								<Input
									className={css.input}
									onChange={onChange}
									value={urlToAdd}
								/>
								<Icon className={css.add} disabled={!validateURL()} onClick={onAdd}>plus</Icon>
							</div>
							<p className={css.error}>{urlValidation}</p>
							<br />
							<Button
								css={css}
								onClick={onSelectAll}
								disabled={!data || !data.length}
								size='small'
							>
								{(data && selected && data.length && data.length === selected.length) ? $L('Deselect All') : $L('Select All')}
							</Button>
							<Button
								css={css}
								onClick={onDelete}
								size='small'
								disabled={!data || !data.length || !selected.length}
							>
								{$L('Delete')}
							</Button>
						</form>
						{(data && data.length > 0) && (
							<VirtualList
								data={data}
								dataSize={data.length}
								itemRenderer={renderItem}
								className={css.list}
								itemSize={ri.scale(70)}
							/>
						)}
					</div>
				}
				<Button
					css={css}
					onClick={onOpenResetPinPopup}
					size='small'
				>
					{$L('Reset pin')}
				</Button>
				<PinPopup
					open={resetPinPopupOpen}
					onClose={onCloseResetPinPopup}
					onSubmit={onSubmitPinCode}
					matched
				/>
			</div>
		</OverlapVKB>
	);
}

SiteFilteringBase.propTypes = {
	browser: PropTypes.any,
	data: PropTypes.array,
	siteFiltering: PropTypes.string,
}

const mapStateToProps = ({settingsState, siteFilterState}) => {
	const {siteFiltering} = settingsState;
	return {
		siteFiltering,
		data: siteFilterState.urlList,
	};
};

const SiteFiltering = connect(mapStateToProps)(SiteFilteringBase);

export default SiteFiltering;
