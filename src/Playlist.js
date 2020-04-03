import React, { Component } from 'react';
import './Playlist.css';

class Playlist extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		if (!this.props.isLocked) {
			this.props.addPlaylist(this.props.playlist);
		} else {
			this.props.removePlaylist(this.props.playlist.id);
		}
	}
	render() {
		const { isLocked, playlist } = this.props;
		return (
			<div className={`Playlist ${isLocked && 'disabled'}`} onClick={this.handleClick}>
				<div className="Playlist-name">{playlist.name}</div>
			</div>
		);
	}
}

export default Playlist;
