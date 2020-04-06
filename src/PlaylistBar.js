import React, { Component } from 'react';
import Playlist from './Playlist';
import Loader from './Loader';
import SpotifyIconLogo from './spotify-icon-logo.png';
import './PlaylistBar.css';

class PlaylistBar extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		this.props.findMorePlaylists();
	}
	render() {
		const { playlists, addPlaylist, removePlaylist, chosenPlaylistIDs, isMorePlaylists, isLoading } = this.props;
		const isButton = isMorePlaylists && playlists.length > 0;

		return (
			<div className="PlaylistBar-container">
				<div className="sidebar-branding">
					<img src={SpotifyIconLogo} alt="spotify-logo" className="logo" />
				</div>
				<div className="PlaylistBar">
					{isLoading ? (
						<Loader />
					) : (
						<div className="playlists-container">
							{playlists.map((playlist) => (
								<Playlist
									addPlaylist={addPlaylist}
									removePlaylist={removePlaylist}
									key={playlist.id}
									isLocked={chosenPlaylistIDs.indexOf(playlist.id) !== -1}
									playlist={playlist}
								/>
							))}
							{isButton && (
								<div className="more-playlist-button-container">
									<div onClick={this.handleClick} className="more-playlist-button">
										More Playlists
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default PlaylistBar;
