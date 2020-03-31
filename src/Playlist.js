import React, { Component } from 'react';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import './Playlist.css';

class Playlist extends Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		if (!this.props.isLocked) {
			this.props.addPlaylist(this.props.playlist);
			// this.setState({ isLocked: true });
		}

		// if (!this.state.isLocked) {
		// }

		// this.setState((currSt) => ({ ...currSt, show: !currSt.show }));
	}

	render() {
		return (
			<div className={`Playlist ${this.props.isLocked && 'disabled'}`} onClick={this.handleClick}>
				<div className="Playlist-name">{this.props.playlist.name}</div>

				{!this.props.isLocked && <AddCircleIcon className="Playlist-add" />}
			</div>
		);
	}
}

export default Playlist;
