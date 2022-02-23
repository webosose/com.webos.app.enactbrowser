import $L from '@enact/i18n/$L';
import { Component } from 'react';
import VirtualList from '@enact/agate/VirtualList';
import URLListItem from "./URLListItem";
import ri from '@enact/ui/resolution';

class URLListUI extends Component {
	constructor(props) {
		super(props);
		this.state = {

		};
	}
	onSelectHandler = (value) => {
		this.props.onSelect(value)

	}
	onEditHandler = ({ name }) => {
		this.props.onEdit(name);
	}
	renderItem = ({ index, }) => {
		const { urlList } = this.props;
		return (
			<URLListItem name={urlList[index]} key={urlList[index]} onSelect={this.onSelectHandler} onEdit={this.onEditHandler} />
		);
	};
	render() {
		const { urlList } = this.props
		return (
			<div>
				{
					(urlList && urlList.length > 0) ?
						<VirtualList
							dataSize={urlList.length}
							focusableScrollbar
							itemRenderer={this.renderItem}
							itemSize={ri.scale(70)}
						/> :
						<div>{$L('There is no URL List.')}</div>
				}

			</div>
		)
	}
}

export default URLListUI