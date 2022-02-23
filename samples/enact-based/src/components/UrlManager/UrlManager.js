import { Component } from 'react';
import URLListUI from './URLListUI';
import css from './UrlManager.module.less';
import { connect } from 'react-redux';
import BodyText from '@enact/agate/BodyText';
import Icon from '@enact/agate/Icon';
import AddURL from './AddURL';
import EditURL from './EditURL';
import Popup from '@enact/agate/Popup';

class UrlManager extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
			value: '',
			openPopup: false
		};
		this.deleteArray = [];
	}
	onClose = () => {
		this.setState({
			openPopup: false
		})
	};
	openAddURLPopup = () => {
		this.setState({
			title: 'Add a Site:',
			value: '',
			openPopup: true
		})
	};
	openUpdateURLPopup = (name) => {
		this.setState({
			title: 'Update a Site:',
			value: name,
			openPopup: true
		})
	};
	deleteUrl = () => {
		if (this.deleteArray.length > 0) {
			this.props.browser.siteFiltering.deletURLs(this.deleteArray);
			this.deleteArray = [];
		}
	}
	onSelectHandler = (listValue) => {
		if (listValue.selected) {
			this.deleteArray.push(listValue.name);
		} else {
			this.deleteArray = this.deleteArray.filter(v => listValue.name !== v)
		}
		// console.log("deleteArray111: ", this.deleteArray);
	}
	componentDidUpdate(prevProps){
		console.log(prevProps.selectOption +"     !==   "+ this.props.selectOption)
		if(prevProps.selectOption !== this.props.selectOption){
			this.deleteArray = [];
		}
	}
	render() {
		const { selectOption, urlList, browser } = this.props;
		const { openPopup, title, value } = this.state;
		return (
			<div className={css.UrlManager}>
				<div className={css.header}>
					<div className={css.headerName}>
						<BodyText >{selectOption === 1 ? 'Approved Sites List' : 'Blocked Sites List'}</BodyText>
					</div>
					<Icon onClick={this.openAddURLPopup}>add</Icon>
					<Icon onClick={this.deleteUrl}>trash</Icon>
				</div>
				<URLListUI onEdit={this.openUpdateURLPopup} urlList={urlList} onSelect={this.onSelectHandler} />
				<Popup open={openPopup} title={title} closeButton onClose={this.onClose}>
					{value ? <EditURL
						onClose={this.onClose}
						browser={browser}
						value={value} /> : <AddURL
						onClose={this.onClose}
						browser={browser}
					/>}
				</Popup>
			</div>
		);
	}
}

const mapStateToProps = ({ siteFilterState }) => {
	const { urlList, success } =siteFilterState

	return {
		urlList,
		success
	};
};


export default connect(mapStateToProps)(UrlManager);
