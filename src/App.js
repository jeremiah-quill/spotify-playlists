import React, { Component } from 'react';
import axios from 'axios';
import Playlist from './Playlist';
import Navbar from './Navbar';
import PlaylistBar from './PlaylistBar';
import MixerPlaylist from './MixerPlaylist';
import './App.css';

class App extends Component {
	static defaultProps = {
		clientID: '9a9bc27e766d4e48bcd18dad29e5a877',
		redirectURI: 'http://localhost:3000',
		scope: 'user-read-private&playlist-read-private',
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
			chosenPlaylists: []
		};
		this.getHashParams = this.getHashParams.bind(this);
		this.addPlaylist = this.addPlaylist.bind(this);
		this.removePlaylist = this.removePlaylist.bind(this);
	}
	async componentDidMount() {
		// make api call to get the user's account data
		const userResponse = await axios.get(`https://api.spotify.com/v1/me`, {
			headers: {
				Authorization: 'Bearer ' + this.state.access_token
			}
		});

		// make api call to get user's playlists
		const playlistsResponse = await axios.get(
			`https://api.spotify.com/v1/users/${userResponse.data.id}/playlists`,
			{
				headers: {
					Authorization: 'Bearer ' + this.state.access_token
				}
			}
		);

		// loop over playlists, and for each one make an api call to fetch the tracks
		// once tracks are fetched, create a newPlaylist object that is pushed onto playlists and set in state
		let playlists = [];
		for (let i = 0; i < playlistsResponse.data.items.length; i++) {
			const tracks = await axios.get(
				`https://api.spotify.com/v1/playlists/${playlistsResponse.data.items[i].id}/tracks`,
				{
					headers: {
						Authorization: 'Bearer ' + this.state.access_token
					}
				}
			);
			const newPlaylist = {
				name: playlistsResponse.data.items[i].name,
				id: playlistsResponse.data.items[i].id,
				tracks: tracks.data.items.map((item) => ({
					name: item.track.name,
					id: item.track.id,
					artists: item.track.artists.map((artist) => artist.name)
				}))
			};
			playlists.push(newPlaylist);
		}
		// set state
		this.setState({
			playlists: playlists,
			userData: userResponse.data,
			isLoadingPlaylists: false
		});
	}
	addPlaylist(newPlaylist) {
		if (this.state.chosenPlaylists.length < this.props.maxPlaylists) {
			this.setState((currSt) => ({ chosenPlaylists: [ ...currSt.chosenPlaylists, newPlaylist ] }));
		} else {
			// render breadcrumb saying `you can only add ${this.props.maxPlaylists} playlists`
		}
	}
	removePlaylist(playlistID) {
		this.setState((currSt) => ({
			chosenPlaylists: this.state.chosenPlaylists.filter((playlist) => playlist.id !== playlistID)
		}));
	}

	// grabs our access_token out of the URL
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

		return (
			<div className="App">
				<Navbar authorizeURL={authorizeURL} accessToken={this.state.access_token} />
				<div className="App-content-container">
					<PlaylistBar
						chosenPlaylists={this.state.chosenPlaylists}
						addPlaylist={this.addPlaylist}
						isLoading={this.state.isLoadingPlaylists}
						playlists={this.state.playlists}
					/>

					<div className="App-chosen-container">
						{this.state.chosenPlaylists.length > 0 ? (
							this.state.chosenPlaylists.map((playlist) => (
								<MixerPlaylist removePlaylist={this.removePlaylist} playlist={playlist} />
							))
						) : (
							<div>Add Playlists to begin</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default App;
