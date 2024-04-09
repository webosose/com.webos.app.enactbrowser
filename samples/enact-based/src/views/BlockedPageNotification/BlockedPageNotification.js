// Copyright 2020 LG Electronics, Inc.
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
 * Contains the declaration for the BlockedPageNotification component.
 *
 */

import $L from '@enact/i18n/$L';
import kind from '@enact/core/kind';
import Button from '@enact/agate/Button';
import PropTypes from 'prop-types';

import css from './BlockedPageNotification.module.less';

const BlockedPageNotification = kind({
	name: 'BlockedPageNotification',

	propTypes: {
		onOpenSiteFiltering: PropTypes.func,
	},

	styles: {
		css,
		className: 'blockedPageNotification'
	},

	render: ({onOpenSiteFiltering, ...rest}) => {
		return (
			<div {...rest}>
				<div className={css.notificationIcon} />
				<div className={css.notificationTitle}>{$L('This webpage is blocked by Site Filtering')}</div>
				<br />
				<Button onClick={onOpenSiteFiltering} css={css} size={"large"}>{$L('Settings')}</Button>
			</div>
		)
	}
});

export default BlockedPageNotification;
