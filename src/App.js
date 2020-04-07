import React, { Component } from 'react';
import axios from 'axios';
import { getCurrentUser, getPlaylists, extractPlaylists, curatePlaylist, shuffle, addAllTracks } from './Helpers.js';
import Navbar from './Navbar';
import PlaylistBar from './PlaylistBar';
import MixingBoard from './MixingBoard';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import './App.css';

class App extends Component {
	static defaultProps = {
		clientID: '9a9bc27e766d4e48bcd18dad29e5a877',
		// redirectURI: 'http://localhost:3000',
		redirectURI: 'https://jeremiah-quill.github.io/spotify-playlists',
		scope: 'user-read-private playlist-read-private playlist-modify-public playlist-modify-private',
		maxPlaylists: 4
	};
	constructor(props) {
		super(props);
		this.state = {
			access_token: this.getHashParams().access_token,
			isAuthenticated: false,
			userData: {},
			playlists: [],
			isLoadingPlaylists: true,
			isLoadingNewPlaylist: false,
			chosenPlaylists: [],
			isMorePlaylists: '',
			isError: ''
		};
		this.getHashParams = this.getHashParams.bind(this);
		this.addPlaylist = this.addPlaylist.bind(this);
		this.removePlaylist = this.removePlaylist.bind(this);
		this.createPlaylist = this.createPlaylist.bind(this);
		this.onLevelChange = this.onLevelChange.bind(this);
		this.findMorePlaylists = this.findMorePlaylists.bind(this);
	}

	async componentDidMount() {
		const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${this.props
			.clientID}&redirect_uri=${this.props.redirectURI}&scope=${this.props
			.scope}&show_dialog=true&response_type=token`;
		if (!this.state.access_token) {
			window.location.href = authorizeURL;
		}

		// get user data
		let userResponse = await getCurrentUser(this.state.access_token);
		if (!userResponse.data) {
			this.setState({
				isError: `Error: ${userResponse.response.status}`
			});
		} else {
			// get playlists data
			let playlistsResponse = await getPlaylists(
				`https://api.spotify.com/v1/users/${userResponse.data.id}/playlists/?limit=20`,
				this.state.access_token
			);
			if (!playlistsResponse.data) {
				this.setState({
					isError: `Error: ${playlistsResponse.response.status}`
				});
			} else {
				// extract tracks from playlists and build up objects to store in state
				const playlists = await extractPlaylists(playlistsResponse.data, this.state.access_token);
				this.setState({
					playlists: playlists,
					userData: userResponse.data,
					isLoadingPlaylists: false,
					isMorePlaylists: playlistsResponse.data.next
				});
			}
		}
	}

	addPlaylist(playlist) {
		if (this.state.chosenPlaylists.length < this.props.maxPlaylists) {
			const newPlaylist = { ...playlist, level: 50 };
			this.setState((currSt) => ({ chosenPlaylists: [ ...currSt.chosenPlaylists, newPlaylist ] }));
		}
	}

	removePlaylist(playlistID) {
		this.setState((currSt) => ({
			chosenPlaylists: this.state.chosenPlaylists.filter((playlist) => playlist.id !== playlistID)
		}));
	}

	onLevelChange(id, newLevel) {
		const updatedPlaylists = this.state.chosenPlaylists.map((playlist) => {
			if (playlist.id === id) {
				return { ...playlist, level: newLevel };
			}
			return playlist;
		});
		this.setState({ chosenPlaylists: updatedPlaylists });
	}

	async createPlaylist(playlistName) {
		this.setState({ isLoadingNewPlaylist: true });
		let newPlaylist = [];
		for (let i = 0; i < this.state.chosenPlaylists.length; i++) {
			let curatedPlaylist = curatePlaylist(this.state.chosenPlaylists[i]);
			for (let i = 0; i < curatedPlaylist.length; i++) {
				newPlaylist.push(curatedPlaylist[i]);
			}
		}
		shuffle(newPlaylist);
		const response = await axios.post(
			`https://api.spotify.com/v1/users/${this.state.userData.id}/playlists`,
			{ name: playlistName },
			{
				headers: {
					Authorization: 'Bearer ' + this.state.access_token
				}
			}
		);
		const playlistID = await response.data.id;
		await addAllTracks(newPlaylist, playlistID, this.state.access_token);
		let playlistsData = await getPlaylists(
			`https://api.spotify.com/v1/users/${this.state.userData.id}/playlists`,
			this.state.access_token
		);
		const playlists = await extractPlaylists(playlistsData.data, this.state.access_token);
		this.setState({ playlists: playlists, isMorePlaylists: playlistsData.data.next, isLoadingNewPlaylist: false });
	}

	async findMorePlaylists() {
		this.setState({ isLoadingNewPlaylist: true });
		const playlistsResponse = await getPlaylists(this.state.isMorePlaylists, this.state.access_token);
		const playlists = await extractPlaylists(playlistsResponse.data, this.state.access_token);
		this.setState((currSt) => ({
			playlists: [ ...currSt.playlists, ...playlists ],
			isLoadingNewPlaylist: false,
			isMorePlaylists: playlistsResponse.data.next
		}));
	}

	getHashParams() {
		var hashParams = {};
		var e,
			r = /([^&;=]+)=?([^&;]*)/g,
			q = window.location.hash.substring(1);
		while ((e = r.exec(q))) {
			hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
	}

	render() {
		const authorizeURL = `https://accounts.spotify.com/authorize?client_id=${this.props
			.clientID}&redirect_uri=${this.props.redirectURI}&scope=${this.props
			.scope}&show_dialog=true&response_type=token`;
		const {
			access_token,
			chosenPlaylists,
			isLoadingPlaylists,
			isLoadingNewPlaylist,
			playlists,
			isMorePlaylists,
			isError
		} = this.state;
		return isError ? (
			<ErrorMessage message={isError} />
		) : isLoadingPlaylists ? (
			<Loader />
		) : (
			<div className="App">
				<Navbar authorizeURL={authorizeURL} accessToken={access_token} username={this.state.userData.id} />
				<div className="App-content-container">
					<PlaylistBar
						chosenPlaylistIDs={chosenPlaylists.map((playlist) => playlist.id)}
						addPlaylist={this.addPlaylist}
						removePlaylist={this.removePlaylist}
						isLoading={isLoadingNewPlaylist}
						playlists={playlists}
						isMorePlaylists={isMorePlaylists}
						findMorePlaylists={this.findMorePlaylists}
					/>
					<MixingBoard
						chosenPlaylists={chosenPlaylists}
						createPlaylist={this.createPlaylist}
						removePlaylist={this.removePlaylist}
						onLevelChange={this.onLevelChange}
					/>
				</div>
			</div>
		);
	}
}

export default App;
