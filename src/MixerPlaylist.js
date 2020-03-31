import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import './MixerPlaylist.css';

const styles = {
	root: {
		height: '300px'
	}
};

class MixerPlaylist extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		this.props.removePlaylist(this.props.playlist.id);
	}
	render() {
		const { classes } = this.props;

		return (
			<div className="MixerPlaylist">
				<HighlightOffIcon fontSize="large" className="Mixer-remove-button" onClick={this.handleClick} />

				<div className={classes.root}>
					<Slider orientation="vertical" defaultValue={30} />
				</div>
				<div>{this.props.playlist.name}</div>
			</div>
		);
	}
}

export default withStyles(styles)(MixerPlaylist);
