/**
 * Contains the declaration for the SiteItem component.
 *
 */

import GridListImageItem from '@enact/moonstone/GridListImageItem';
import IconButton from '@enact/moonstone/IconButton';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import css from './SiteItem.less';

const CloseButton = (props) => (
	<IconButton {...props} className={css.xbutton} small>closex</IconButton>
);

class SiteItem extends Component {
	static propTypes = {
		browser: PropTypes.object,
		title: PropTypes.string,
		url: PropTypes.string
	}

	constructor (props) {
		super(props);

		this.state = {
			showingCloseButton: false
		};
	}

	onMouseEnter = () => {
		this.setState({showingCloseButton: true});
	}

	onMouseLeave = () => {
		this.setState({showingCloseButton: false});
	}

	onClick = () => {
		this.props.browser.mostVisited.remove(this.props.url);
	}

	render () {
		const {title, ...rest} = this.props;

		delete rest.browser;
		delete rest.url;

		return (
			<div className={css.container}>
				<GridListImageItem
					{...rest}
					className={css.siteItem}
					caption={title}
					disabled={!title}
					onMouseEnter={this.onMouseEnter}
					onMouseLeave={this.onMouseLeave}
				/>
				{
					this.state.showingCloseButton && title ?
					<CloseButton
						onClick={this.onClick}
						onMouseEnter={this.onMouseEnter}
						onMouseLeave={this.onMouseLeave}
					/> : null
				}
			</div>
		);
	}
}

export default SiteItem;
export {SiteItem};
