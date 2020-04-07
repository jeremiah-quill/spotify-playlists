import axios from 'axios';

async function getCurrentUser(token) {
	try {
		let res = await axios.get(`https://api.spotify.com/v1/me`, {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		return res;
	} catch (err) {
		return err;
	}
}

async function getPlaylists(url, token) {
	try {
		const res = await axios.get(url, {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		return res;
	} catch (err) {
		return err;
	}
}

async function extractPlaylists(playlistsData, token) {
	let playlists = [];
	for (let i = 0; i < playlistsData.items.length; i++) {
		let url = `https://api.spotify.com/v1/playlists/${playlistsData.items[i].id}/tracks`;
		const allTracks = await getAllTracks(url, token);
		const newPlaylist = {
			name: playlistsData.items[i].name,
			id: playlistsData.items[i].id,
			tracks: allTracks
		};
		playlists.push(newPlaylist);
	}
	return playlists;
}

async function getAllTracks(URL, token) {
	let allTracks = [];
	let keepGoing = true;
	let newURL = URL;
	while (keepGoing) {
		let res = await getTracks(newURL, token);
		if (!res.data) {
			return;
		} else {
			for (let i = 0; i < res.data.items.length; i++) {
				let track = {
					name: res.data.items[i].track.name,
					id: res.data.items[i].track.id,
					artists: res.data.items[i].track.artists.map((artist) => ({
						name: artist.name,
						id: artist.id
					}))
				};
				allTracks.push(track);
			}
			newURL = res.data.next;
			if (!newURL) {
				keepGoing = false;
				return allTracks;
			}
		}
	}
}

async function getTracks(URL, token) {
	try {
		const res = await axios.get(`${URL}`, {
			headers: {
				Authorization: 'Bearer ' + token
			}
		});
		return res;
	} catch (err) {
		return err;
	}
}

// Take a playlist and randomly curate it based on # tracks chosen
function curatePlaylist(playlist) {
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

// Format the track ID to be used in formatURIs
function formatTrackID(trackID) {
	return `spotify:track:${trackID}`;
}

// Format URIs for createPlaylist API call
function formatURIs(playlist) {
	const formattedURI = playlist.map((track) => formatTrackID(track.id));
	return formattedURI;
}

async function addTracks(tracks, playlistID, token) {
	await axios.post(
		`https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
		{ uris: formatURIs(tracks) },
		{ headers: { Authorization: 'Bearer ' + token } }
	);
}

async function addAllTracks(playlist, playlistID, token) {
	let tracksLeftToSend = playlist.length;
	let startIndex = 0;
	let endIndex = tracksLeftToSend > 100 ? 100 : tracksLeftToSend;
	let nextSetOfTracks = playlist.slice(startIndex, endIndex);
	while (tracksLeftToSend) {
		// send nextSetOfTracks to playlistID
		await addTracks(nextSetOfTracks, playlistID, token);
		// update tracksLeftToSend to see how many are left
		tracksLeftToSend = tracksLeftToSend - nextSetOfTracks.length;
		// update start index
		startIndex = startIndex + nextSetOfTracks.length;
		// update end index
		endIndex = tracksLeftToSend > 100 ? endIndex + 100 : endIndex + tracksLeftToSend;
		// create nextSetOfTracks
		nextSetOfTracks = playlist.slice(startIndex, endIndex);
	}
}

// Shuffle function taken from stackoverflow
function shuffle(array) {
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

export { getCurrentUser, getPlaylists, extractPlaylists, curatePlaylist, addAllTracks, shuffle };
