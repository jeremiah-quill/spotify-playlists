import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import './NewPlaylistForm.css';

const styles = {
	modal: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	paper: {
		// backgroundColor: theme.palette.background.paper,
		border: '2px solid #000'
		// boxShadow: theme.shadows[5],
		// padding: theme.spacing(2, 4, 3)
	}
};

class NewPlaylistForm extends Component {
	constructor(props) {
		super(props);
		this.state = { name: '', open: false, modalOpen: false, isInvalidName: false };
		this.handleClick = this.handleClick.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.closeSnackbar = this.closeSnackbar.bind(this);
		this.handleModalOpen = this.handleModalOpen.bind(this);
		this.handleModalClose = this.handleModalClose.bind(this);
	}
	handleModalOpen() {
		this.setState({ modalOpen: true });
	}
	handleModalClose() {
		this.setState({ modalOpen: false });
	}

	closeSnackbar() {
		this.setState({ open: false });
	}
	handleClick(e) {
		if (!this.state.name) {
			this.setState({ isInvalidName: true });
			setTimeout(() => {
				this.setState({ isInvalidName: false });
			}, 3000);
		} else {
			this.props.createPlaylist(this.state.name);
			this.setState({ name: '', open: true, modalOpen: false });
			e.preventDefault();
		}
	}
	handleChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}
	render() {
		const { classes } = this.props;
		const isInvalidName = this.state.isInvalidName;

		return (
			<div className="NewPlaylistForm">
				<div className="NewPlaylistForm-form">
					<button onClick={this.handleModalOpen} className="create-playlist-button">
						{`Create Playlist (${this.props.newPlaylistTrackCount} songs)`}
					</button>

					<Modal
						aria-labelledby="transition-modal-title"
						aria-describedby="transition-modal-description"
						className={classes.modal}
						open={this.state.modalOpen}
						onClose={this.handleClose}
						closeAfterTransition
						BackdropComponent={Backdrop}
						BackdropProps={{
							timeout: 500
						}}
					>
						<Fade in={this.state.modalOpen}>
							<div className={`${classes.paper} modal-content`}>
								<CloseIcon className="close-icon" onClick={this.handleModalClose} />
								<h3>Create Playlist</h3>
								<div className="input-container">
									<label htmlFor="name">Name</label>
									<input
										id="name"
										onChange={this.handleChange}
										value={this.state.name}
										name="name"
										type="text"
										className={`name-input ${isInvalidName && `red-outline`}`}
									/>
									<div className={`invalid-name-text ${isInvalidName && `show-invalid`}`}>
										Please name your playlist
									</div>
									<button className="create-playlist-button" onClick={this.handleClick}>
										Submit
									</button>
								</div>
							</div>
						</Fade>
					</Modal>
				</div>
				<Snackbar
					anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
					open={this.state.open}
					autoHideDuration={3000}
					message={<span id="message-id">Playlist added</span>}
					contentprops={{ 'aria-describedby': 'message-id' }}
					onClose={this.closeSnackbar}
					action={[
						<IconButton onClick={this.closeSnackbar}>
							<CloseIcon />
						</IconButton>
					]}
				/>
			</div>
		);
	}
}

export default withStyles(styles)(NewPlaylistForm);
