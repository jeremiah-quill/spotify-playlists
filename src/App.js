import React, { Component } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import PlaylistBar from './PlaylistBar';
import MixingBoard from './MixingBoard';
import Loader from './Loader';
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
			isMorePlaylists: ''
		};
		this.getHashParams = this.getHashParams.bind(this);
		this.addPlaylist = this.addPlaylist.bind(this);
		this.removePlaylist = this.removePlaylist.bind(this);
		this.createPlaylist = this.createPlaylist.bind(this);
		this.onLevelChange = this.onLevelChange.bind(this);
		this.findMorePlaylists = this.findMorePlaylists.bind(this);
		this.extractPlaylists = this.extractPlaylists.bind(this);
		this.getTracks = this.getTracks.bind(this);
		this.getAllTracks = this.getAllTracks.bind(this);
	}

	async componentDidMount() {
		const authorizeURL = `https://accounts.spotify.com/authorize?client_id=9a9bc27e766d4e48bcd18dad29e5a877&redirect_uri=https://jeremiah-quill.github.io/spotify-playlists&scope=user-read-private playlist-read-private playlist-modify-public playlist-modify-private&show_dialog=true&response_type=token`;
		if (!this.state.access_token) {
			window.location.href = authorizeURL;
		}

		// get user data
		let userData = await this.getCurrentUser(this.state.access_token);

		// get playlists data
		let playlistsData = await this.getPlaylists(
			`https://api.spotify.com/v1/users/${userData.id}/playlists/?limit=20`
		);

		// extract tracks from playlists and build up objects to store in state
		const playlists = await this.extractPlaylists(playlistsData);
		this.setState({
			playlists: playlists,
			userData: userData,
			isLoadingPlaylists: false,
			isMorePlaylists: playlistsData.next
		});
	}

	async getCurrentUser(token) {
		let res = await axios.get(`https://api.spotify.com/v1/me`, {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		let userData = res.data;
		return userData;
	}

	async getPlaylists(url) {
		const res = await axios.get(url, {
			headers: {
				Authorization: 'Bearer ' + this.state.access_token
			}
		});
		let playlistsData = res.data;
		return playlistsData;
	}

	async extractPlaylists(playlistsData) {
		let playlists = [];
		for (let i = 0; i < playlistsData.items.length; i++) {
			let url = `https://api.spotify.com/v1/playlists/${playlistsData.items[i].id}/tracks`;
			const allTracks = await this.getAllTracks(url);
			const newPlaylist = {
				name: playlistsData.items[i].name,
				id: playlistsData.items[i].id,
				tracks: allTracks
			};
			playlists.push(newPlaylist);
		}
		return playlists;
	}

	// getAllTracks uses recursion to call getTracks for as long as it takes until there is no "next" pagination
	async getAllTracks(URL) {
		let allTracks = [];
		let keepGoing = true;
		let newURL = URL;
		while (keepGoing) {
			let response = await this.getTracks(newURL);
			for (let i = 0; i < response.data.items.length; i++) {
				let track = {
					name: response.data.items[i].track.name,
					id: response.data.items[i].track.id,
					artists: response.data.items[i].track.artists.map((artist) => ({
						name: artist.name,
						id: artist.id
					}))
				};
				allTracks.push(track);
			}
			newURL = response.data.next;
			if (!newURL) {
				keepGoing = false;
				return allTracks;
			}
		}
	}

	async getTracks(URL) {
		const tracks = await axios.get(`${URL}`, {
			headers: {
				Authorization: 'Bearer ' + this.state.access_token
			}
		});
		return tracks;
	}

	addPlaylist(playlist) {
		if (this.state.chosenPlaylists.length < this.props.maxPlaylists) {
			const newPlaylist = { ...playlist, level: 50 };
			this.setState((currSt) => ({ chosenPlaylists: [ ...currSt.chosenPlaylists, newPlaylist ] }));
		} else {
			// render breadcrumb saying `you can only add ${this.props.maxPlaylists} playlists` *********
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

	// Curates each chosen playlist, pushes it into newPlaylist, adds a new playlist to spotify, and adds songs to that playlist in spotify
	async createPlaylist(playlistName) {
		this.setState({ isLoadingNewPlaylist: true });
		let newPlaylist = [];
		for (let i = 0; i < this.state.chosenPlaylists.length; i++) {
			let curatedPlaylist = this.curatePlaylist(this.state.chosenPlaylists[i]);
			for (let i = 0; i < curatedPlaylist.length; i++) {
				newPlaylist.push(curatedPlaylist[i]);
			}
		}
		this.shuffle(newPlaylist);
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
		await this.addAllTracks(newPlaylist, playlistID);
		let playlistsData = await this.getPlaylists(
			`https://api.spotify.com/v1/users/${this.state.userData.id}/playlists`
		);
		const playlists = await this.extractPlaylists(playlistsData);

		this.setState({ playlists: playlists, isMorePlaylists: playlistsData.next, isLoadingNewPlaylist: false });
	}

	// Take a playlist and randomly curate it based on # tracks chosen
	curatePlaylist(playlist) {
		const workingPlaylist = { ...playlist, tracks: [ ...playlist.tracks ] };
		let curatedPlaylistNewTotal = Math.floor(workingPlaylist.level / 100 * workingPlaylist.tracks.length);
		const newPlaylist = [];
		for (let i = 0; i < curatedPlaylistNewTotal; i++) {
			let randomIndex = Math.floor(Math.random() * workingPlaylist.tracks.length);
			newPlaylist.push(workingPlaylist.tracks[randomIndex]);
			workingPlaylist.tracks.splice(randomIndex, 1);
		}
		return newPlaylist;
	}

	async addTracks(tracks, playlistID) {
		await axios.post(
			`https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
			{ uris: this.formatURIs(tracks) },
			{ headers: { Authorization: 'Bearer ' + this.state.access_token } }
		);
	}

	async addAllTracks(playlist, playlistID) {
		let tracksLeftToSend = playlist.length;
		let startIndex = 0;
		let endIndex = tracksLeftToSend > 100 ? 100 : tracksLeftToSend;
		let nextSetOfTracks = playlist.slice(startIndex, endIndex);
		while (tracksLeftToSend) {
			// send nextSetOfTracks to playlistID
			await this.addTracks(nextSetOfTracks, playlistID);
			// update tracksLeftToSend to see how many are left
			tracksLeftToSend = tracksLeftToSend - nextSetOfTracks.length;
			// update nextSetOfTracks to be the next set of tracks
			startIndex = startIndex + nextSetOfTracks.length;
			// endIndex = endIndex + tracksLeftToSend;
			endIndex = tracksLeftToSend > 100 ? endIndex + 100 : endIndex + tracksLeftToSend;
			nextSetOfTracks = playlist.slice(startIndex, endIndex);
		}
	}

	// Format URIs for createPlaylist API call
	formatURIs(playlist) {
		const formattedURI = playlist.map((track) => this.formatTrackID(track.id));
		return formattedURI;
	}

	// Format the track ID to be used in formatURIs
	formatTrackID(trackID) {
		return `spotify:track:${trackID}`;
	}

	// Fires API call to get next page of playlists (button is not rendered if there is no next) and add it to state
	async findMorePlaylists() {
		this.setState({ isLoadingNewPlaylist: true });
		const playlistsResponse = await this.getPlaylists(this.state.isMorePlaylists);
		const playlists = await this.extractPlaylists(playlistsResponse);
		this.setState((currSt) => ({
			playlists: [ ...currSt.playlists, ...playlists ],
			isLoadingNewPlaylist: false,
			isMorePlaylists: playlistsResponse.next
		}));
	}

	// Shuffle function taken from stackoverflow (look into this)
	shuffle(array) {
		var currentIndex = array.length,
			temporaryValue,
			randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	// Extract hashParams so we can extract access_token
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
			isMorePlaylists
		} = this.state;
		return isLoadingPlaylists ? (
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
