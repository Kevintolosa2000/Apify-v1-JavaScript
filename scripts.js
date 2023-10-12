
//CLAVES CLIENTE
const clientId = 'aa0ed50cb18443eb9522832da0582ce8';
const clientSecretId = 'fb995fa08fe94325bb73f1fce219b33c';

// HTML
const audioPlayer = document.getElementById('audioPlayer');
const option1Button = document.getElementById('option1');
const option2Button = document.getElementById('option2');
const option3Button = document.getElementById('option3');
const option4Button = document.getElementById('option4');
const hintButton = document.getElementById('skipButton');
const info = document.getElementById('info');
const albumCover = document.getElementById('albumCover');

const playlistUrlInput = document.getElementById('playlistUrlInput');
const getPlaylistButton = document.getElementById('getPlaylistButton');

// Obtener el token de acceso
const getToken = async () => {
    try {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials&client_id=' + clientId + '&client_secret=' + clientSecretId
        });

        const tokenData = await result.json();
        const token = tokenData.access_token;
        return token;
    } catch (error) {
        console.error('Error obteniendo el token:', error);
    }
}

// Obtener la informacion del artista
const getArtistData = async (token) => {
    try {
        if (!token) {
            console.error('Error: Token no disponible. Debes obtener el token primero.');
            return null;
        }

        const artistResult = await fetch(artistUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const dataArtist = await artistResult.json();
        return dataArtist;
    } catch (error) {
        console.error('Error obteniendo los datos del artista:', error);
        return null;
    }
}

// Obtener la informacion de una sola cancion
const getTrack = async (token, trackUrl) => {
    try {
        if (!token) {
            console.error('Error: Token no disponible. Debes obtener el token primero.');
            return null;
        }

        const trackResult = await fetch(trackUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const trackData = await trackResult.json();

        return trackData;

    } catch (error) {
        console.error('Error obteniendo la cancion:', error);
        return null;
    }
}

// Obtener toda una playlist de canciones
const getPlaylist = async (token, playlistUrl) => {
    try {
        if (!token) {
            console.error('Error: Token no disponible. Debes obtener el token primero.');
            return null;
        }

        const playlistResult = await fetch(playlistUrl, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const playlistData = await playlistResult.json();

        return playlistData;

    } catch (error) {
        console.error('Error obteniendo la playlist:', error);
        return null;
    }
}

// Obtener la informacion de la playlist y llama al juego
function getPlaylistAndPlay() {

    getToken()
        .then(token => {

            console.log('Access Token:', token);

            getUrlPlaylist()
                .then(playlistUrl => {
                    console.log(playlistUrl);
                    //const PlaylistUrl = 'https://api.spotify.com/v1/playlists/1YT9psh8iyZTM9tnYDvk8a?si=5e5b1874b9374401';
                    getPlaylist(token, playlistUrl)
                        .then(playlistData => {
                            if (playlistData) {

                                playTheGame(playlistData);
                                console.log('Playlist Data:', playlistData);
                            }
                        })
                })
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Adivina la cancion con opciones
function playTheGame(playlistData) {
    const randomTracks = getRandomTracks(playlistData, 4);
    const winningTrackIndex = Math.floor(Math.random() * 4);
    const winningTrack = randomTracks[winningTrackIndex];

    let limitTime = 15;
    let turn = 0;

    option1Button.textContent = randomTracks[0].track.name;
    option2Button.textContent = randomTracks[1].track.name;
    option3Button.textContent = randomTracks[2].track.name;
    option4Button.textContent = randomTracks[3].track.name;

    option1Button.addEventListener('click', () => {
        handleOptionClick(randomTracks[0].track.name === winningTrack.track.name);
    });

    option2Button.addEventListener('click', () => {
        handleOptionClick(randomTracks[1].track.name === winningTrack.track.name);
    });

    option3Button.addEventListener('click', () => {
        handleOptionClick(randomTracks[2].track.name === winningTrack.track.name);
    });
    option4Button.addEventListener('click', () => {
        handleOptionClick(randomTracks[3].track.name === winningTrack.track.name);
    });

    hintButton.addEventListener('click', () => {
        limitTime += 5;
        turn = showHint(winningTrack, turn);

    });

    audioPlayer.src = winningTrack.track.preview_url;

    audioPlayer.addEventListener('timeupdate', () => {

        if (audioPlayer.currentTime >= limitTime || turn === 4) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
    });
}


// Toma la playlist y te devuelve la cant de canciones que quieras aleatoriamente
function getRandomTracks(playlistData, numberOfTracks) {
    if (!playlistData.tracks || !playlistData.tracks.items || playlistData.tracks.items.length === 0) {
        console.error('La playlist no contiene canciones.');
        return [];
    }

    const allTracks = playlistData.tracks.items;

    const randomTracks = [];

    while (randomTracks.length < numberOfTracks) {
        const randomIndex = Math.floor(Math.random() * allTracks.length);
        const selectedTrack = allTracks[randomIndex];

        // Verificar si la pista ya está en randomTracks/ que boludo era con un push y con un some
        //el.some te devuelve un true o false dependiendo si se cumple la condicion que le des re loco 
        if (!randomTracks.some(track => track.track.id === selectedTrack.track.id) && selectedTrack.track.preview_url) {
            randomTracks.push(selectedTrack);
        }
    }
    console.log(randomTracks);


    return randomTracks;
}

// Deshabilita los botones
function disableButtons() {
    option1Button.disabled = true;
    option2Button.disabled = true;
    option3Button.disabled = true;
    option4Button.disabled = true;
    hintButton.disabled = true;
}

//Verifica la opcion
function handleOptionClick(correct) {
    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');

    if (correct === true) {
        info.textContent = "¡Ganaste!";
        winSound.play();
    } else {
        info.textContent = "¡Perdiste!";
        loseSound.play();
    }
    disableButtons();
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

// Te da maximo 3 pistas y se deshabilita
function showHint(winningTrack, turn) {

    if (turn === 0) {
        info.textContent = `Año: ${winningTrack.track.album.release_date}`;
    } else if (turn === 1) {
        info.textContent = `Año: ${winningTrack.track.album.release_date} / Artista: ${winningTrack.track.artists[0].name}`;
    } else if (turn === 2) {
        albumCover.src = winningTrack.track.album.images[0].url;
        info.textContent = `Año: ${winningTrack.track.album.release_date} / Artista: ${winningTrack.track.artists[0].name}`;
        hintButton.disabled = true;
    }

    return turn + 1;
}

//Obtiene la url que le des y te trae solo la porcion que pide spotify (ChatGPT)
function getUrlPlaylist() {
    return new Promise((resolve, reject) => {
        let completePlaylistUrl;

        const clickHandler = () => {

            const fullUrl = playlistUrlInput.value;

            if (!fullUrl) {
                completePlaylistUrl = 'https://api.spotify.com/v1/playlists/1YT9psh8iyZTM9tnYDvk8a?si=5e5b1874b9374401';
            } else {

                // Utiliza una expresión regular para extraer la parte deseada de la URL
                const match = fullUrl.match(/playlist\/([^?]+)/);

                if (!match || match.length < 2) {
                    console.error('Error: La URL de lista de reproducción no es válida.');
                    reject('La URL de lista de reproducción no es válida.');
                    return; // Debes retornar aquí para evitar continuar con la ejecución
                }

                const playlistUrl = match[1]; // La parte deseada de la URL
                completePlaylistUrl = 'https://api.spotify.com/v1/playlists/' + playlistUrl;
            }
            // Desvincula el controlador de eventos para evitar acumulación

            resolve(completePlaylistUrl);

        };

        getPlaylistButton.addEventListener('click', clickHandler);

    });
}

getPlaylistAndPlay();

/*
//Segunda version del adivina la cancion con opciones pero sin playlist
function getTrackAndChoice() {

    const trackUrl = 'https://api.spotify.com/v1/tracks/2NYrhsqTuHWZCKCh5lXujW?si=b2cd30bba3ac41db';

    getToken()
        .then(token => {
            console.log('Access Token:', token);
            return getTrack(token, trackUrl);
        })

        .then(trackData => {
            if (trackData) {

                const audioPlayer = document.getElementById('audioPlayer');
                const option1Button = document.getElementById('option1');
                const option2Button = document.getElementById('option2');
                const option3Button = document.getElementById('option3');
                const hintButton = document.getElementById('skipButton');
                const info = document.getElementById('info');
                const albumCover = document.getElementById('albumCover');

                audioPlayer.src = trackData.preview_url;

                let limitTime = 5;
                let turn = 0;
                let gameEnded = false;

                option1Button.textContent = `${trackData.name}`;
                option2Button.textContent = "Con Calma";
                option3Button.textContent = "Provenza";

                function handleOptionClick(correct) {
                    if (correct === true) {
                        info.textContent = "¡Ganaste!";
                    } else {
                        info.textContent = "¡Perdiste!";
                    }

                    gameEnded = true; 
                    disableButtons();
                }

                function disableButtons() {
                    option1Button.disabled = true;
                    option2Button.disabled = true;
                    option3Button.disabled = true;
                    hintButton.disabled = true;
                }

                option1Button.addEventListener('click', () => {
                    handleOptionClick(true);
                });

                option2Button.addEventListener('click', () => {
                    handleOptionClick(false);
                });

                option3Button.addEventListener('click', () => {
                    handleOptionClick(false);
                });


                hintButton.addEventListener('click', () => {

                    limitTime += 5;

                    turn += 1;

                    if (turn === 1) {
                        info.textContent = `Año: ${trackData.album.release_date}`;
                    } else if (turn === 2) {
                        info.textContent = `Año: ${trackData.album.release_date} - ` + `Artista: ${trackData.artists[0].name}`;
                    } else if (turn === 3) {
                        albumCover.src = trackData.album.images[0].url;
                        info.textContent = `Año: ${trackData.album.release_date} - ` + `Artista: ${trackData.artists[0].name}`;
                        skipButton.disabled = true;
                    }
 
                }); 

                audioPlayer.addEventListener('timeupdate', () => {

                    if (audioPlayer.currentTime >= limitTime || turn === 4) {
                        audioPlayer.pause();
                        audioPlayer.currentTime = 0;
                    }
                });

                console.log('Track Data:', trackData);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

getTrackAndChoice();
*/

/*
//Primera version del adivina la cancion solo aumentando el tiempo y sin playlist
function getTrackAndPlayForTurn() {

    ///URL DE LA CANCION
    const trackUrl = 'https://api.spotify.com/v1/tracks/2NYrhsqTuHWZCKCh5lXujW?si=b2cd30bba3ac41db';

    ///OBTENGO EL TOKEN DE ACCESO PRIMERO Y RETORNO LA DATA DE LA CANCION
    getToken()
        .then(token => {
            console.log('Access Token:', token);
            return getTrack(token, trackUrl);
        })
        .then(trackData => {
            if (trackData) {
                ///LLAMO AL AUDIO PLAYER DEL HTML Y AL PARRAFO DE LOS TURNOS
                const audioPlayer = document.getElementById('audioPlayer');
                const turnText = document.getElementById('turn');
                ///LE DOY LA PREVIEW DE LA CANCION QUE HAY EN LA DATA
                audioPlayer.src = trackData.preview_url;
                ///MARCO EL LIMITE DE TIEMPO PARA CADA TURNO Y EL TURNO
                let limitTime = 5;

                let turn = 1;

                turnText.textContent = `Turno: ${turn}`;
                ///CADA VEZ QUE SE PRESIONA SKIP SE AÑADE AL TIEMPO LIMITE 5 SEG Y SE CAMBIA AL SIGUIENTE TURNO
                skipButton.addEventListener('click', () => {

                    limitTime += 5;

                    turn += 1;

                    turnText.textContent = `Turno: ${turn}`;

                });
                ///VERIFICA QUE EL TIEMPO DEL REPRODUCTOR ESTE DENTRO DEL LIMITE Y QUE NO SE HAYA PASADO DE LOS TURNOS
                audioPlayer.addEventListener('timeupdate', () => {

                    if (audioPlayer.currentTime >= limitTime || turn === 7) {
                        audioPlayer.pause();
                        audioPlayer.currentTime = 0;
                    }
                });

                console.log('Track Data:', trackData);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

getTrackAndPlayForTurn();
*/

/*
//Obtiene el token de acceso y muestra los datos del artista
getToken()
    .then(token => {
        console.log('Access Token:', token);

        return getArtistData(token);
    })
    .then(artistData => {
        if (artistData) {
            console.log('Artist Data:', artistData);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */


/*
//Obtiene el token y lo muestra
getToken()
    .then(token => {
        console.log('Access Token:', token);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */