// current user account info:
// `https://api.spotify.com/v1/me`

// current user playlists:
// `https://api.spotify.com/v1/users/${userResponse.data.id}/playlists`,

// songs in specific playlist:
// `https://api.spotify.com/v1/playlists/${playlistsResponse.data.items[i].id}/tracks`

// async extractPlaylists(playlistsResponse) {
//     let playlists = [];
//     for (let i = 0; i < playlistsResponse.data.items.length; i++) {
//         const tracks = await axios.get(
//             `https://api.spotify.com/v1/playlists/${playlistsResponse.data.items[i].id}/tracks`,
//             {
//                 headers: {
//                     Authorization: 'Bearer ' + this.state.access_token
//                 }
//             }
//         );
//         const newPlaylist = {
//             name: playlistsResponse.data.items[i].name,
//             id: playlistsResponse.data.items[i].id,
//             tracks: tracks.data.items.map((item) => ({
//                 name: item.track.name,
//                 id: item.track.id,
//                 artists: item.track.artists.map((artist) => artist.name)
//             }))
//         };
//         playlists.push(newPlaylist);
//     }
//     return playlists;
// }
