import React, { Component } from 'react';
import PlaylistSlider from './PlaylistSlider';
import NewPlaylistForm from './NewPlaylistForm';
import './MixingBoard.css';

class MixingBoard extends Component {
	constructor(props) {
		super(props);
		this.getNewTrackCount = this.getNewTrackCount.bind(this);
	}
	getNewTrackCount() {
		if (this.props.chosenPlaylists.length) {
			const allTrackTotals = this.props.chosenPlaylists.map((playlist) =>
				Math.ceil(playlist.level / 100 * playlist.tracks.length)
			);
			const sum = allTrackTotals.reduce((acc, currVal) => acc + currVal);
			return sum;
		}
	}
	render() {
		const { chosenPlaylists, removePlaylist, onLevelChange, createPlaylist } = this.props;

		return (
			<div className="MixingBoard">
				<div className="MixingBoard-container">
					{chosenPlaylists.length > 0 ? (
						<div className="MixingBoard-playlists">
							{chosenPlaylists.map((playlist) => (
								<PlaylistSlider
									removePlaylist={removePlaylist}
									onLevelChange={onLevelChange}
									playlist={playlist}
									key={playlist.id}
								/>
							))}
						</div>
					) : (
						<div className="instructions-banner">Add playlists to begin</div>
					)}
				</div>
				{chosenPlaylists.length > 0 && (
					<NewPlaylistForm newPlaylistTrackCount={this.getNewTrackCount()} createPlaylist={createPlaylist} />
				)}
			</div>
		);
	}
}

export default MixingBoard;
