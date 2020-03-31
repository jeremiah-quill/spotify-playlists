import React, { Component } from 'react';
import Playlist from './Playlist';
import Loader from './Loader';
import './PlaylistBar.css';

class PlaylistBar extends Component {
	render() {
		return (
			<div className="PlaylistBar">
				{this.props.isLoading ? (
					<Loader />
				) : (
					this.props.playlists.map((playlist) => (
						<Playlist
							addPlaylist={this.props.addPlaylist}
							key={playlist.id}
							chosenPlaylists={this.props.chosenPlaylists}
							isLocked={this.props.chosenPlaylists.indexOf(playlist) !== -1}
							playlist={playlist}
						/>
					))
				)}
			</div>
		);
	}
}

export default PlaylistBar;
