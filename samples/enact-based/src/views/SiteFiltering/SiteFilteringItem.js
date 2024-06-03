// Copyright (c) 2018 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

/**
 * Contains the declaration for the SiteFilteringItem component.
 *
 */

import PropTypes from 'prop-types';
import CheckboxItem from '@enact/agate/CheckboxItem';

import css from './SiteFilteringItem.module.less';

function SiteFilteringItem({url, ...rest}) {
	return (
		<CheckboxItem className={css.item} {...rest}>
			{url}
		</CheckboxItem>
	);
}

SiteFilteringItem.propTypes = {
	onToggle: PropTypes.func,
	selected: PropTypes.bool,
	url: PropTypes.string
}

export default SiteFilteringItem;
export {SiteFilteringItem};
