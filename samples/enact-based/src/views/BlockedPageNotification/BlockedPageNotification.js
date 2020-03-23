// Copyright (c) 2020 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the BlockedPageNotification component.
 *
 */

import $L from '@enact/i18n/$L';
import kind from '@enact/core/kind';
import React from 'react';
import Button from '@enact/moonstone/Button';
import PropTypes from 'prop-types';

import css from './BlockedPageNotification.less';

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
				<Button onClick={onOpenSiteFiltering} css={css} small>{$L('Settings')}</Button>
			</div>
		)
	}
});

export default BlockedPageNotification;
