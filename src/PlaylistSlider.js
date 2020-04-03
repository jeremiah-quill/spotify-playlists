import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import CloseIcon from '@material-ui/icons/Close';
import './PlaylistSlider.css';

const styles = {
	root: {
		height: '300px'
	}
};

class PlaylistSlider extends Component {
	constructor(props) {
		super(props);
		this.state = { isChanging: false };
		this.handleClick = this.handleClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeCommitted = this.handleChangeCommitted.bind(this);
	}
	handleClick() {
		this.props.removePlaylist(this.props.playlist.id);
	}
	handleChange(e, value) {
		this.props.onLevelChange(this.props.playlist.id, value);
		this.setState({ isChanging: true });
	}
	handleChangeCommitted() {
		this.setState({ isChanging: false });
	}
	render() {
		const { classes, playlist } = this.props;
		const totalTrackCount = playlist.tracks.length;
		const halfTrackCount = Math.floor(playlist.level / 100 * playlist.tracks.length);

		return (
			<div className="PlaylistSlider">
				<CloseIcon className="PlaylistSlider-remove-button" onClick={this.handleClick} />
				<div className={classes.root}>
					<Slider
						className="slider"
						orientation="vertical"
						onChangeCommitted={this.handleChangeCommitted}
						onChange={this.handleChange}
						defaultValue={50}
					/>
				</div>
				<div className="track-count-container">
					<span className={`${this.state.isChanging && 'isChanging'}`}>{halfTrackCount}</span>

					<span className="track-count">{`/ ${totalTrackCount}`}</span>
				</div>
				<h3 className="playlist-name">{playlist.name}</h3>
			</div>
		);
	}
}

export default withStyles(styles)(PlaylistSlider);
