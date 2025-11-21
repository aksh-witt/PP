// Cadastro 

async function cadastrar(event) {
    event.preventDefault();  // Previne o comportamento padrão do formulário

    // Coleta os dados do formulário
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    // Verifica se os campos estão preenchidos
    if (!name || !email || !pass) {
        alert("Todos os campos devem ser preenchidos!");
        return;
    }

    // Cria o objeto com os dados a serem enviados para a API
    const data = { name, email, pass };

    try {
        // Realiza a requisição POST para a API
        const response = await fetch('http://localhost:3005/usuario/cadastrar', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        // Converte a resposta em JSON
        const result = await response.json();

        // Lida com a resposta
        if (response.ok) {
            alert(result.message);
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro durante o cadastro:', error);
        alert("Ocorreu um erro ao tentar realizar o cadastro.");
    }
}

// Login

async function logar(event) {
    event.preventDefault();  // Previne o comportamento padrão do formulário

    // Coleta os dados do formulário
    const email = document.getElementById('email_login').value;
    const pass = document.getElementById('password_login').value;

    // Verifica se os campos estão preenchidos
    if (!email || !pass) {
        alert("Todos os campos devem ser preenchidos!");
        return;
    }

    // Cria o objeto com os dados a serem enviados para a API
    const data = { email, pass };

    try {
        const response = await fetch("http://localhost:3005/login", {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(data),
        });

        let results = await response.json();

        if (results.success) {
            alert(results.message);

            // Armazena os dados do usuário no localStorage para persistir o login
            let userData = results.data;
            localStorage.setItem('informacoes', JSON.stringify(userData));

            // Redireciona o usuário para a página index.html
            window.location.href = "../index.html";
            
        } else {
            alert(results.message);
        }
    } catch (error) {
        console.error("Erro ao realizar login:", error);
        alert("Erro ao realizar login. Tente novamente mais tarde.");
    }
}


// verifica se o usuário está logado em outra pag
// window.onload = function() {
//     let userData = localStorage.getItem('informacoes');
    
//     if (!userData) {
//         // Se não há dados de login, redireciona para a página de login
//         window.location.href = "";
//     } else {
//         // Caso o usuário esteja logado, você pode exibir as informações dele
//         userData = JSON.parse(userData);
//         document.getElementById('user-info').innerHTML = `Bem-vindo, ${userData.name} - Perfil: ${userData.perfil}`;
//     }
// }

//log out/ sair
function logout() {
    // Remove os dados do usuário do localStorage
    localStorage.removeItem('Informacoes');

    // Redireciona para a página de login
    window.location.href = "login/login.html";
}






// //recuperar info pra pag

function loadUserInfo() {
    const userInfo = localStorage.getItem('Informacoes');

    if (userInfo) {
        const user = JSON.parse(userInfo);
        document.getElementById('nome').textContent = ` ${user.name}`;
        document.getElementById('email').textContent = `${user.email}`;
    } else {
    
    }
}


// Post Feed


// Função para abrir o modal de post
function openPostModal() {
    document.getElementById('post-modal').style.display = 'flex';
}

// Função para fechar o modal de post
function closePostModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.getElementById('post-form').reset();
}

// Função para criar post
async function addPost(event) {
    event.preventDefault();

    const title = document.getElementById('post-title').value;
    const description = document.getElementById('post-description').value;
    const mediaFile = document.getElementById('post-media').files[0];

    // Validação - apenas título é obrigatório
    if (!title) {
        alert("Por favor, preencha o título do post.");
        return Promise.reject();
    }

    // Criar FormData para enviar (funciona com ou sem arquivo)
    const formData = new FormData();
    formData.append('titulo', title);
    formData.append('descricao', description);
    
    if (mediaFile) {
        formData.append('media', mediaFile);
    }

    console.log('Enviando post:', { titulo: title, descricao: description, temArquivo: !!mediaFile });

    try {
        const response = await fetch('http://localhost:3005/post/cadastrar', {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            closePostModal();
            return Promise.resolve();
        } else {
            alert("Erro: " + result.message);
            return Promise.reject();
        }
    } catch (error) {
        alert("Ocorreu um erro na comunicação com o servidor.");
        console.error('Erro detalhado:', error);
        return Promise.reject();
    }
}

// Função para carregar posts do servidor
async function loadPosts() {
    try {
        console.log('Carregando posts...');
        
        const response = await fetch('http://localhost:3005/posts');
        const result = await response.json();

        if (response.ok && result.success) {
            console.log('Posts carregados:', result.data.length);
            renderPosts(result.data);
        } else {
            console.error('Erro ao carregar posts:', result.message);
            // Não mostra alerta para não incomodar o usuário
        }
    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        // Não mostra alerta para não incomodar o usuário
    }
}

// Função para renderizar posts no feed
function renderPosts(posts) {
    const feedContainer = document.getElementById('feed-container');
    
    if (!feedContainer) {
        console.error('Container de feed não encontrado!');
        return;
    }

    // Limpa o container antes de adicionar novos posts
    feedContainer.innerHTML = '';

    if (posts.length === 0) {
        feedContainer.innerHTML = `
            <div class="no-posts">
                <i class="fa-solid fa-music"></i>
                <h3>Nenhum post ainda</h3>
                <p>Seja o primeiro a compartilhar algo!</p>
            </div>
        `;
        return;
    }

    // Adiciona cada post ao container
    posts.forEach(post => {
        const postElement = createPostElement(post);
        feedContainer.appendChild(postElement);
    });

    console.log('Posts renderizados:', posts.length);
}

// Função para criar elemento de post individual
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    postDiv.setAttribute('data-post-id', post.id);
    
    // Determina o texto do tempo
    const timeText = post.data_formatada || 'Agora';
    
    // DEBUG: Verificar dados do post
    console.log('Criando post:', {
        id: post.id,
        title: post.title,
        hasMedia: !!post.media_path,
        mediaPath: post.media_path,
        typeMedia: post.type_media
    });
    
    // Cria o HTML da mídia se existir
    let mediaHTML = '';
    if (post.media_path && post.type_media) {
        const imageUrl = `http://localhost:3005/uploads/${post.media_path}`;
        console.log('URL da imagem:', imageUrl);
        
        if (post.type_media === 'imagem') {
            mediaHTML = `
                <div class="post-media">
                    <img src="${imageUrl}" 
                         alt="Imagem do post" 
                         class="post-image"
                         onerror="console.error('Erro ao carregar imagem:', this.src)"
                         onload="console.log('Imagem carregada com sucesso:', this.src)">
                </div>
            `;
        } else if (post.type_media === 'audio') {
            mediaHTML = `
                <div class="post-media">
                    <div class="audio-player">
                        <audio controls>
                            <source src="${imageUrl}" type="audio/mpeg">
                            Seu navegador não suporta áudio.
                        </audio>
                    </div>
                </div>
            `;
        }
    } else {
        console.log('Post sem mídia ou tipo de mídia não definido');
    }

    postDiv.innerHTML = `
        <div class="post-header">
            <img src="./img/profile-pic-lorem.jpg" alt="User" class="post-avatar">
            <div class="post-user-info">
                <h3 class="username">@usuario</h3>
                <span class="post-time">${timeText}</span>
            </div>
        </div>
        <div class="post-content">
            <h2 class="post-title">${escapeHtml(post.title)}</h2>
            ${post.description ? `<p class="post-text">${escapeHtml(post.description)}</p>` : ''}
        </div>
        ${mediaHTML}
        <div class="post-actions">
            <button class="action-btn" onclick="likePost(${post.id})">
                <i class="fa-solid fa-heart"></i> <span>0</span>
            </button>
            <button class="action-btn" onclick="commentPost(${post.id})">
                <i class="fa-solid fa-comment"></i> <span>0</span>
            </button>
            <button class="action-btn" onclick="sharePost(${post.id})">
                <i class="fa-solid fa-share"></i>
            </button>
        </div>
    `;
    
    return postDiv;
}

// Função auxiliar para evitar XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Funções para ações dos posts (placeholder)
function likePost(postId) {
    console.log('Curtir post:', postId);
    // Implementar lógica de like
}

function commentPost(postId) {
    console.log('Comentar post:', postId);
    // Implementar lógica de comentário
}

function sharePost(postId) {
    console.log('Compartilhar post:', postId);
    // Implementar lógica de compartilhamento
}

// ========== CONFIGURAÇÃO COMPLETA DO DOM ==========

// Configurar todos os event listeners quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO CONFIGURAÇÃO DO DOM ===');
    
    // === VERIFICAÇÃO DE ELEMENTOS ===
    console.log('Verificando elementos da página...');
    
    const elementsToCheck = [
        'feed-container',
        'post-form', 
        'add_post',
        'close-post-modal-btn',
        'cancel-post-btn',
        'post-modal',
        'playlist-form',
        'add_playlist_btn',
        'close-modal-btn',
        'playlist-modal'
    ];
    
    elementsToCheck.forEach(elementId => {
        const element = document.getElementById(elementId);
        console.log(`${elementId}:`, element ? ' Encontrado' : ' Não encontrado');
    });
    
    // === CARREGAR POSTS AO INICIAR ===
    console.log('Carregando posts iniciais...');
    loadPosts();
    
    // === CONFIGURAÇÃO DO MODAL DE POST ===
    console.log('Configurando modal de post...');
    
    const postForm = document.getElementById('post-form');
    const openPostModalBtn = document.getElementById('add_post');
    const closePostModalBtn = document.getElementById('close-post-modal-btn');
    const cancelPostBtn = document.getElementById('cancel-post-btn');
    const postModal = document.getElementById('post-modal');

    // Abrir modal de post
    if (openPostModalBtn) {
        openPostModalBtn.addEventListener('click', openPostModal);
        console.log(' Botão de abrir post configurado');
    } else {
        console.log(' Botão de abrir post não encontrado');
    }

    // Enviar formulário de post
    if (postForm) {
        postForm.addEventListener('submit', function(event) {
            addPost(event).then(() => {
                // Recarrega os posts após criar um novo
                console.log('Recarregando posts após novo post...');
                loadPosts();
            }).catch(error => {
                console.log('Erro ao criar post, não recarregando feed');
            });
        });
        console.log(' Formulário de post configurado');
    } else {
        console.log(' Formulário de post não encontrado');
    }

    // Fechar modal de post
    if (closePostModalBtn) {
        closePostModalBtn.addEventListener('click', closePostModal);
        console.log(' Botão de fechar post configurado');
    } else {
        console.log(' Botão de fechar post não encontrado');
    }

    if (cancelPostBtn) {
        cancelPostBtn.addEventListener('click', closePostModal);
        console.log(' Botão de cancelar post configurado');
    } else {
        console.log(' Botão de cancelar post não encontrado');
    }

    // Fechar modal clicando fora
    if (postModal) {
        window.addEventListener('click', function(event) {
            if (event.target === postModal) {
                closePostModal();
            }
        });
        console.log(' Fechar modal clicando fora configurado');
    } else {
        console.log(' Modal de post não encontrado');
    }

    // === CONFIGURAÇÃO DO MODAL DE PLAYLIST ===
    console.log('Configurando modal de playlist...');
    
    const playlistForm = document.getElementById('playlist-form');
    const openPlaylistModalBtn = document.getElementById('add_playlist_btn');
    const closePlaylistModalBtn = document.getElementById('close-modal-btn');
    const playlistModal = document.getElementById('playlist-modal');

    // Função para fechar modal de playlist
    function closePlaylistModal() {
        if (playlistModal) {
            playlistModal.style.display = 'none';
            playlistForm.reset();
        }
    }

    // Abrir modal de playlist
    if (openPlaylistModalBtn) {
        openPlaylistModalBtn.addEventListener('click', function() {
            if (playlistModal) {
                playlistModal.style.display = 'flex';
            }
        });
        console.log(' Botão de abrir playlist configurado');
    } else {
        console.log(' Botão de abrir playlist não encontrado');
    }

    // Fechar modal de playlist
    if (closePlaylistModalBtn) {
        closePlaylistModalBtn.addEventListener('click', closePlaylistModal);
        console.log(' Botão de fechar playlist configurado');
    } else {
        console.log(' Botão de fechar playlist não encontrado');
    }

    // Fechar modal de playlist clicando fora
    if (playlistModal) {
        window.addEventListener('click', function(event) {
            if (event.target === playlistModal) {
                closePlaylistModal();
            }
        });
        console.log(' Fechar modal playlist clicando fora configurado');
    } else {
        console.log(' Modal de playlist não encontrado');
    }

    // Enviar formulário de playlist
    if (playlistForm) {
        playlistForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Aqui você pode adicionar a lógica para criar playlist
            alert('Funcionalidade de criar playlist em desenvolvimento!');
            closePlaylistModal();
        });
        console.log(' Formulário de playlist configurado');
    } else {
        console.log(' Formulário de playlist não encontrado');
    }

    // === CONFIGURAÇÃO ADICIONAL ===
    
    // Verificar se usuário está logado
    const userInfo = localStorage.getItem('Informacoes');
    if (userInfo) {
        console.log(' Usuário logado:', JSON.parse(userInfo).name);
    } else {
        console.log('ℹ️ Usuário não logado');
    }
    
    // Configurar outros event listeners se necessário
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log('Pesquisando:', this.value);
            // Implementar busca de posts
        });
        console.log(' Campo de pesquisa configurado');
    }

    console.log('=== CONFIGURAÇÃO DO DOM CONCLUÍDA ===');
});

// ========== FUNÇÕES GLOBAIS ADICIONAIS ==========

// Função para recarregar o feed manualmente (útil para debugging)
function refreshFeed() {
    console.log('Recarregando feed manualmente...');
    loadPosts();
}

// Função para limpar todos os posts (útil para testing)
function clearPosts() {
    const feedContainer = document.getElementById('feed-container');
    if (feedContainer) {
        feedContainer.innerHTML = '';
        console.log('Posts limpos');
    }
}

// Disponibilizar funções globalmente para debugging
window.refreshFeed = refreshFeed;
window.clearPosts = clearPosts;
window.loadPosts = loadPosts;

// Player

// class MusicPlayer {
//     constructor() {
//         this.currentSong = null;
//         this.isPlaying = false;
//         this.currentTime = 0;
//         this.duration = 0;
//         this.volume = 0.8;
//         this.shuffle = false;
//         this.repeat = false; // false, 'one', 'all'
//         this.queue = [];
//         this.currentIndex = 0;
        
//         this.initializePlayer();
//         this.bindEvents();
//     }

//     initializePlayer() {
//         // Elementos do DOM
//         this.elements = {
//             player: document.getElementById('music-player'),
//             songCover: document.getElementById('song-cover'),
//             songTitle: document.getElementById('song-title'),
//             songArtist: document.getElementById('song-artist'),
//             playPauseBtn: document.getElementById('play-pause-btn'),
//             prevBtn: document.getElementById('prev-btn'),
//             nextBtn: document.getElementById('next-btn'),
//             shuffleBtn: document.getElementById('shuffle-btn'),
//             repeatBtn: document.getElementById('repeat-btn'),
//             likeBtn: document.getElementById('like-btn'),
//             progressBar: document.getElementById('progress-bar'),
//             progress: document.getElementById('progress'),
//             currentTime: document.getElementById('current-time'),
//             duration: document.getElementById('duration'),
//             volumeBtn: document.getElementById('volume-btn'),
//             volumeLevel: document.getElementById('volume-level')
//         };

//         // Audio element (será substituído pela API do YouTube posteriormente)
//         this.audio = new Audio();
//         this.audio.volume = this.volume;
//     }

//     bindEvents() {
//         // Botões de controle
//         this.elements.playPauseBtn.addEventListener('click', () => this.togglePlay());
//         this.elements.prevBtn.addEventListener('click', () => this.previousSong());
//         this.elements.nextBtn.addEventListener('click', () => this.nextSong());
//         this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
//         this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
//         this.elements.likeBtn.addEventListener('click', () => this.toggleLike());

//         // Barra de progresso
//         this.elements.progressBar.addEventListener('click', (e) => this.seek(e));
        
//         // Controle de volume
//         this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
        
//         // Eventos do áudio
//         this.audio.addEventListener('timeupdate', () => this.updateProgress());
//         this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
//         this.audio.addEventListener('ended', () => this.songEnded());

//         // Modais
//         document.getElementById('queue-btn').addEventListener('click', () => this.showQueue());
//         document.getElementById('lyrics-btn').addEventListener('click', () => this.showLyrics());
//         document.getElementById('close-queue-modal').addEventListener('click', () => this.hideQueue());
//         document.getElementById('close-lyrics-modal').addEventListener('click', () => this.hideLyrics());

//         // Fechar modais ao clicar fora
//         window.addEventListener('click', (e) => {
//             if (e.target.classList.contains('modal')) {
//                 this.hideQueue();
//                 this.hideLyrics();
//             }
//         });
//     }

//     // Métodos do player
//     togglePlay() {
//         if (this.isPlaying) {
//             this.pause();
//         } else {
//             this.play();
//         }
//     }

//     play() {
//         if (!this.currentSong && this.queue.length > 0) {
//             this.loadSong(this.queue[0]);
//         }
        
//         this.isPlaying = true;
//         this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
//         // Aqui você integraria com a API do YouTube
//         console.log('Tocando música:', this.currentSong);
//     }

//     pause() {
//         this.isPlaying = false;
//         this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
//         console.log('Música pausada');
//     }

//     loadSong(song) {
//         this.currentSong = song;
//         this.updateSongInfo();
//     }

//     updateSongInfo() {
//         if (this.currentSong) {
//             this.elements.songTitle.textContent = this.currentSong.title;
//             this.elements.songArtist.textContent = this.currentSong.artist;
//             this.elements.songCover.src = this.currentSong.cover;
//         }
//     }

//     nextSong() {
//         if (this.queue.length > 0) {
//             this.currentIndex = (this.currentIndex + 1) % this.queue.length;
//             this.loadSong(this.queue[this.currentIndex]);
//             if (this.isPlaying) this.play();
//         }
//     }

//     previousSong() {
//         if (this.queue.length > 0) {
//             this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
//             this.loadSong(this.queue[this.currentIndex]);
//             if (this.isPlaying) this.play();
//         }
//     }

//     toggleShuffle() {
//         this.shuffle = !this.shuffle;
//         this.elements.shuffleBtn.classList.toggle('active', this.shuffle);
//     }

//     toggleRepeat() {
//         const states = [false, 'one', 'all'];
//         const currentIndex = states.indexOf(this.repeat);
//         this.repeat = states[(currentIndex + 1) % states.length];
        
//         const icons = ['fas fa-redo', 'fas fa-redo', 'fas fa-infinity'];
//         this.elements.repeatBtn.innerHTML = `<i class="${icons[currentIndex]}"></i>`;
//         this.elements.repeatBtn.classList.toggle('active', this.repeat !== false);
//     }

//     toggleLike() {
//         this.elements.likeBtn.classList.toggle('active');
//     }

//     toggleMute() {
//         this.audio.muted = !this.audio.muted;
//         const icon = this.audio.muted ? 'fa-volume-mute' : 'fa-volume-up';
//         this.elements.volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
//     }

//     seek(e) {
//         const rect = this.elements.progressBar.getBoundingClientRect();
//         const percent = (e.clientX - rect.left) / rect.width;
//         this.currentTime = percent * this.duration;
//         this.updateProgress();
//     }

//     updateProgress() {
//         if (this.duration > 0) {
//             const percent = (this.currentTime / this.duration) * 100;
//             this.elements.progress.style.width = percent + '%';
//             this.elements.currentTime.textContent = this.formatTime(this.currentTime);
//         }
//     }

//     updateDuration() {
//         this.duration = this.audio.duration;
//         this.elements.duration.textContent = this.formatTime(this.duration);
//     }

//     songEnded() {
//         if (this.repeat === 'one') {
//             this.currentTime = 0;
//             this.play();
//         } else {
//             this.nextSong();
//         }
//     }

//     formatTime(seconds) {
//         const mins = Math.floor(seconds / 60);
//         const secs = Math.floor(seconds % 60);
//         return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//     }

//     showQueue() {
//         document.getElementById('queue-modal').style.display = 'flex';
//         this.updateQueueDisplay();
//     }

//     hideQueue() {
//         document.getElementById('queue-modal').style.display = 'none';
//     }

//     showLyrics() {
//         document.getElementById('lyrics-modal').style.display = 'flex';
//     }

//     hideLyrics() {
//         document.getElementById('lyrics-modal').style.display = 'none';
//     }

//     updateQueueDisplay() {
//         const queueList = document.getElementById('queue-list');
//         queueList.innerHTML = '';
        
//         this.queue.forEach((song, index) => {
//             const item = document.createElement('div');
//             item.className = `queue-item ${index === this.currentIndex ? 'active' : ''}`;
//             item.innerHTML = `
//                 <img src="${song.cover}" alt="${song.title}">
//                 <div class="queue-item-info">
//                     <div class="queue-item-title">${song.title}</div>
//                     <div class="queue-item-artist">${song.artist}</div>
//                 </div>
//             `;
//             item.addEventListener('click', () => {
//                 this.currentIndex = index;
//                 this.loadSong(song);
//                 if (this.isPlaying) this.play();
//             });
//             queueList.appendChild(item);
//         });
//     }

//     // Método para adicionar músicas à fila (para teste)
//     addToQueue(songs) {
//         this.queue = this.queue.concat(songs);
//         if (!this.currentSong && this.queue.length > 0) {
//             this.loadSong(this.queue[0]);
//         }
//     }
// }

// // Inicializar o player quando a página carregar
// document.addEventListener('DOMContentLoaded', () => {
//     // const player = new MusicPlayer();
    
//     // Dados de exemplo para teste
//     const sampleSongs = [
//         {
//             title: "Bohemian Rhapsody",
//             artist: "Queen",
//             cover: "./img/default-cover.jpg",
//             url: "youtube_video_id_1"
//         },
//         {
//             title: "Imagine",
//             artist: "John Lennon",
//             cover: "./img/default-cover.jpg", 
//             url: "youtube_video_id_2"
//         },
//         {
//             title: "Blinding Lights",
//             artist: "The Weeknd",
//             cover: "./img/default-cover.jpg",
//             url: "youtube_video_id_3"
//         }
//     ];
    
//     player.addToQueue(sampleSongs);
    
//     // Expor o player globalmente para fácil acesso
//     window.musicPlayer = player;
// });

//Youtube API 

class YouTubeMusicPlayer {
    constructor() {
        this.currentSong = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 80;
        this.shuffle = false;
        this.repeat = false;
        this.queue = [];
        this.currentIndex = 0;
        this.youtubePlayer = null;
        this.progressInterval = null;
        
        this.initializePlayer();
        this.loadYouTubeAPI();
        this.setupSearchModal();
    }

    initializePlayer() {
        // Elementos do DOM
        this.elements = {
            player: document.getElementById('music-player'),
            songCover: document.getElementById('song-cover'),
            songTitle: document.getElementById('song-title'),
            songArtist: document.getElementById('song-artist'),
            playPauseBtn: document.getElementById('play-pause-btn'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            shuffleBtn: document.getElementById('shuffle-btn'),
            repeatBtn: document.getElementById('repeat-btn'),
            likeBtn: document.getElementById('like-btn'),
            progressBar: document.getElementById('progress-bar'),
            progress: document.getElementById('progress'),
            currentTime: document.getElementById('current-time'),
            duration: document.getElementById('duration'),
            volumeBtn: document.getElementById('volume-btn'),
            volumeLevel: document.getElementById('volume-level'),
            youtubeContainer: document.getElementById('youtube-player'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeSliderContainer: document.getElementById('volume-slider-container')
        };

        this.bindEvents();
        this.setVolume(this.volume);
    }

    setupSearchModal() {
        // Configurar modal de busca
        const searchMusicBtn = document.getElementById('search-music-btn');
        const closeSearchModal = document.getElementById('close-search-modal');
        const searchModal = document.getElementById('search-modal');
        const searchBtn = document.getElementById('search-btn');
        const searchQuery = document.getElementById('search-query');

        if (searchMusicBtn) {
            searchMusicBtn.addEventListener('click', () => {
                searchModal.style.display = 'flex';
                searchQuery.focus();
            });
        }

        if (closeSearchModal) {
            closeSearchModal.addEventListener('click', () => {
                searchModal.style.display = 'none';
                searchQuery.value = '';
                document.getElementById('search-results').innerHTML = '';
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchQuery.value);
            });
        }

        if (searchQuery) {
            searchQuery.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchQuery.value);
                }
            });
        }

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.style.display = 'none';
                searchQuery.value = '';
                document.getElementById('search-results').innerHTML = '';
            }
        });
    }

    async performSearch(query) {
        if (!query.trim()) {
            alert('Por favor, digite algo para buscar.');
            return;
        }

        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Buscando músicas...</p>';

        try {
            // Simulação de busca - substitua pela API real do YouTube
            const results = await this.mockSearch(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Erro na busca:', error);
            searchResults.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 20px;">Erro ao buscar músicas. Tente novamente.</p>';
        }
    }

    async mockSearch(query) {
        // Simulação de busca - substitua pela API real do YouTube
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay de rede
        
        // IDs de streams ao vivo e músicas que permitem embedding
        const availableSongs = [
            {
                id: "jfKfPfyJRdk",
                title: "lofi hip hop radio - beats to relax/study to",
                artist: "Lofi Girl",
                type: "live"
            },
            {
                id: "5qap5aO4i9A",
                title: "24/7 lofi hip hop radio - beats to study/relax to", 
                artist: "Chillhop Music",
                type: "live"
            },
            {
                id: "fEvM-OUbaKs",
                title: "Jazz Relaxing Music",
                artist: "Cafe Music BGM",
                type: "music"
            },
            {
                id: "VBlFHuCzPgY",
                title: "Chill Summer Lofi Jazz",
                artist: "Lofi Jazz",
                type: "music"
            },
            {
                id: "kgx4WGK0oNU",
                title: "Lofi Sleep Music",
                artist: "Lofi Records",
                type: "music"
            }
        ];
        
        return availableSongs.map(song => ({
            title: song.title,
            artist: song.artist,
            youtubeId: song.id,
            thumbnail: `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`,
            duration: song.type === "live" ? "Ao Vivo" : "3:45"
        }));
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Nenhum resultado encontrado.</p>';
            return;
        }

        searchResults.innerHTML = results.map(song => `
            <div class="search-result-item" data-youtube-id="${song.youtubeId}">
                <img src="${song.thumbnail}" alt="${song.title}" 
                     onerror="this.src='https://via.placeholder.com/60x60/7D6DAD/FFFFFF?text=🎵'"
                     style="width: 60px; height: 60px; border-radius: 6px; object-fit: cover;">
                <div class="search-result-info" style="flex: 1;">
                    <div class="search-result-title" style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 4px;">${song.title}</div>
                    <div class="search-result-artist" style="color: #888; font-size: 12px; margin-bottom: 2px;">${song.artist}</div>
                    <div class="search-result-duration" style="color: #7D6DAD; font-size: 11px;">${song.duration}</div>
                </div>
                <button class="add-to-queue-btn" title="Adicionar à fila" 
                        style="background: #7D6DAD; border: none; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');

        // Adicionar event listeners aos resultados
        document.querySelectorAll('.search-result-item').forEach(item => {
            const youtubeId = item.getAttribute('data-youtube-id');
            const song = results.find(s => s.youtubeId === youtubeId);
            
            // Clicar na música para tocar imediatamente
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-queue-btn')) {
                    this.playSongImmediately(song);
                }
            });

            // Botão para adicionar à fila
            const addButton = item.querySelector('.add-to-queue-btn');
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addToQueue([song]);
                this.showNotification(`"${song.title}" adicionada à fila!`);
            });
        });
    }

    playSongImmediately(song) {
        // Limpa a fila atual e toca a música selecionada
        this.clearQueue();
        this.addToQueue([song]);
        this.currentIndex = 0;
        this.loadSong(song);
        this.play();
        
        // Fecha o modal de busca
        document.getElementById('search-modal').style.display = 'none';
        document.getElementById('search-query').value = '';
        document.getElementById('search-results').innerHTML = '';
        
        this.showNotification(`Tocando: ${song.title}`);
    }

    showNotification(message) {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #7D6DAD;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            font-family: Arial, sans-serif;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    loadYouTubeAPI() {
        // Verificar se a API já foi carregada
        if (window.YT && window.YT.Player) {
            this.createYouTubePlayer();
            return;
        }

        // Carrega a API do YouTube
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Função global necessária para a API
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API carregada');
            this.createYouTubePlayer();
        };
    }

    createYouTubePlayer() {
        try {
            this.youtubePlayer = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                videoId: '',
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'disablekb': 1,
                    'enablejsapi': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'iv_load_policy': 3
                },
                events: {
                    'onReady': (event) => this.onPlayerReady(event),
                    'onStateChange': (event) => this.onPlayerStateChange(event),
                    'onError': (event) => this.onPlayerError(event)
                }
            });
        } catch (error) {
            console.error('Erro ao criar player do YouTube:', error);
            // Tentar novamente após 1 segundo
            setTimeout(() => this.createYouTubePlayer(), 1000);
        }
    }

    onPlayerReady(event) {
        console.log('✅ YouTube Player pronto!');
        // Define o volume inicial
        this.setVolume(this.volume);
        
        // Atualiza a interface para mostrar que o player está pronto
        this.elements.songTitle.textContent = 'Pronto para tocar';
        this.elements.songArtist.textContent = 'Busque uma música para começar';
    }

    onPlayerStateChange(event) {
        const states = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'video cued'
        };

        console.log('Estado do player:', states[event.data]);

        switch (event.data) {
            case YT.PlayerState.PLAYING:
                this.isPlaying = true;
                this.elements.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.updateDuration();
                this.startProgressUpdate();
                break;
            
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.stopProgressUpdate();
                break;
            
            case YT.PlayerState.ENDED:
                this.songEnded();
                break;
            
            case YT.PlayerState.BUFFERING:
                console.log('Buffering...');
                break;
            
            case YT.PlayerState.CUED:
                console.log('Vídeo carregado e pronto');
                break;
        }
    }

    onPlayerError(event) {
        console.error('❌ Erro no YouTube Player:', event.data);
        const errorMessages = {
            '2': 'ID do vídeo inválido',
            '5': 'Erro de HTML5',
            '100': 'Vídeo não encontrado',
            '101': 'Incorporação não permitida',
            '150': 'Incorporação não permitida'
        };
        
        const errorMessage = errorMessages[event.data] || `Erro desconhecido: ${event.data}`;
        console.error('Detalhes do erro:', errorMessage);
        
        // Mostrar mensagem de erro para o usuário
        this.elements.songTitle.textContent = 'Erro ao carregar música';
        this.elements.songArtist.textContent = errorMessage;
        
        // Pular para próxima música em caso de erro (se houver)
        if (this.queue.length > 1) {
            setTimeout(() => {
                this.nextSong();
            }, 2000);
        }
    }

    bindEvents() {
        // Botões de controle
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.previousSong());
        this.elements.nextBtn.addEventListener('click', () => this.nextSong());
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.elements.likeBtn.addEventListener('click', () => this.toggleLike());

        // Barra de progresso
        this.elements.progressBar.addEventListener('click', (e) => this.seek(e));
        
        // Controle de volume
        this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
        
        // Controle de volume por slider
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('click', (e) => {
                const rect = this.elements.volumeSlider.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                this.setVolume(Math.max(0, Math.min(100, Math.round(percent * 100))));
            });
        }

        // Modais
        document.getElementById('queue-btn').addEventListener('click', () => this.showQueue());
        document.getElementById('lyrics-btn').addEventListener('click', () => this.showLyrics());
        document.getElementById('close-queue-modal').addEventListener('click', () => this.hideQueue());
        document.getElementById('close-lyrics-modal').addEventListener('click', () => this.hideLyrics());

        // Botão de tela cheia
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    // Métodos do player
    togglePlay() {
        if (!this.youtubePlayer) {
            console.log('Player do YouTube não está pronto');
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (!this.currentSong && this.queue.length > 0) {
            this.loadSong(this.queue[this.currentIndex]);
        }
        
        if (this.currentSong && this.youtubePlayer) {
            this.youtubePlayer.playVideo();
        } else {
            console.log('Nenhuma música para tocar');
            this.showNotification('Busque uma música para começar a tocar');
        }
    }

    pause() {
        if (this.youtubePlayer) {
            this.youtubePlayer.pauseVideo();
        }
    }

    loadSong(song) {
        if (!song || !song.youtubeId) {
            console.error('Música inválida:', song);
            return;
        }

        this.currentSong = song;
        this.updateSongInfo();
        
        if (this.youtubePlayer) {
            console.log('🎵 Carregando música:', song.title, 'ID:', song.youtubeId);
            this.youtubePlayer.loadVideoById(song.youtubeId);
            
            // Reset do progresso
            this.currentTime = 0;
            this.elements.progress.style.width = '0%';
            this.elements.currentTime.textContent = '0:00';
        }
    }

    updateSongInfo() {
        if (this.currentSong) {
            this.elements.songTitle.textContent = this.currentSong.title;
            this.elements.songArtist.textContent = this.currentSong.artist;
            this.elements.songCover.src = this.currentSong.thumbnail;
            
            // Atualizar título da página
            document.title = `${this.currentSong.title} - ${this.currentSong.artist} | MusicLab`;
        }
    }

    nextSong() {
        if (this.queue.length === 0) {
            this.showNotification('Fila vazia. Busque mais músicas!');
            return;
        }

        if (this.shuffle) {
            this.currentIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.queue.length;
        }
        
        this.loadSong(this.queue[this.currentIndex]);
        if (this.isPlaying) this.play();
    }

    previousSong() {
        if (this.queue.length === 0) {
            this.showNotification('Fila vazia. Busque mais músicas!');
            return;
        }

        if (this.shuffle) {
            this.currentIndex = Math.floor(Math.random() * this.queue.length);
        } else {
            this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
        }
        
        this.loadSong(this.queue[this.currentIndex]);
        if (this.isPlaying) this.play();
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.elements.shuffleBtn.classList.toggle('active', this.shuffle);
        console.log('Shuffle:', this.shuffle ? 'Ligado' : 'Desligado');
    }

    toggleRepeat() {
        const states = [false, 'one', 'all'];
        const currentIndex = states.indexOf(this.repeat);
        this.repeat = states[(currentIndex + 1) % states.length];
        
        const icons = ['fas fa-redo', 'fas fa-redo active', 'fas fa-infinity active'];
        const titles = ['Sem repetição', 'Repetir uma música', 'Repetir todas'];
        
        this.elements.repeatBtn.innerHTML = `<i class="${icons[currentIndex]}"></i>`;
        this.elements.repeatBtn.title = titles[currentIndex];
        this.elements.repeatBtn.classList.toggle('active', this.repeat !== false);
        
        console.log('Modo de repetição:', this.repeat);
    }

    toggleLike() {
        this.elements.likeBtn.classList.toggle('active');
        if (this.currentSong) {
            const action = this.elements.likeBtn.classList.contains('active') ? 'curtida' : 'descurtida';
            this.showNotification(`Música ${action}: ${this.currentSong.title}`);
        }
    }

    toggleMute() {
        if (this.youtubePlayer) {
            const isMuted = this.youtubePlayer.isMuted();
            if (isMuted) {
                this.youtubePlayer.unMute();
                this.elements.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                this.elements.volumeBtn.title = 'Mudo';
            } else {
                this.youtubePlayer.mute();
                this.elements.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                this.elements.volumeBtn.title = 'Som';
            }
        }
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.youtubePlayer) {
            this.youtubePlayer.setVolume(volume);
            this.elements.volumeLevel.style.width = volume + '%';
            
            // Atualizar ícone do volume baseado no nível
            let volumeIcon = 'fa-volume-up';
            if (volume === 0) volumeIcon = 'fa-volume-mute';
            else if (volume < 50) volumeIcon = 'fa-volume-down';
            
            this.elements.volumeBtn.innerHTML = `<i class="fas ${volumeIcon}"></i>`;
        }
    }

    seek(e) {
        if (!this.youtubePlayer || !this.duration) return;

        const rect = this.elements.progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = percent * this.duration;
        
        this.youtubePlayer.seekTo(newTime, true);
        this.currentTime = newTime;
        this.updateProgress();
    }

    startProgressUpdate() {
        this.stopProgressUpdate(); // Para qualquer intervalo existente
        this.progressInterval = setInterval(() => {
            if (this.youtubePlayer && this.isPlaying) {
                this.currentTime = this.youtubePlayer.getCurrentTime();
                this.updateProgress();
            }
        }, 1000);
    }

    stopProgressUpdate() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    updateProgress() {
        if (this.duration > 0) {
            const percent = (this.currentTime / this.duration) * 100;
            this.elements.progress.style.width = percent + '%';
            this.elements.currentTime.textContent = this.formatTime(this.currentTime);
        }
    }

    updateDuration() {
        if (this.youtubePlayer) {
            // O YouTube pode demorar um pouco para carregar a duração
            setTimeout(() => {
                this.duration = this.youtubePlayer.getDuration();
                this.elements.duration.textContent = this.formatTime(this.duration);
            }, 500);
        }
    }

    songEnded() {
        this.stopProgressUpdate();
        this.isPlaying = false;
        this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        if (this.repeat === 'one') {
            this.youtubePlayer.seekTo(0, true);
            this.play();
        } else {
            this.nextSong();
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    showQueue() {
        document.getElementById('queue-modal').style.display = 'flex';
        this.updateQueueDisplay();
    }

    hideQueue() {
        document.getElementById('queue-modal').style.display = 'none';
    }

    showLyrics() {
        document.getElementById('lyrics-modal').style.display = 'flex';
        // Aqui você pode integrar com uma API de letras
        document.getElementById('lyrics-content').innerHTML = `
            <p style="text-align: center; color: #888; font-style: italic;">
                ${this.currentSong ? `Letras para "${this.currentSong.title}" em desenvolvimento...` : 'Selecione uma música para ver a letra.'}
            </p>
        `;
    }

    hideLyrics() {
        document.getElementById('lyrics-modal').style.display = 'none';
    }

    toggleFullscreen() {
        if (!this.currentSong) {
            this.showNotification('Selecione uma música primeiro');
            return;
        }
        
        // Implementação básica de tela cheia
        const videoUrl = `https://www.youtube.com/watch?v=${this.currentSong.youtubeId}`;
        window.open(videoUrl, '_blank');
    }

    updateQueueDisplay() {
        const queueList = document.getElementById('queue-list');
        if (!queueList) return;
        
        queueList.innerHTML = '';
        
        if (this.queue.length === 0) {
            queueList.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">Fila vazia<br><small>Busque músicas para adicionar à fila</small></p>';
            return;
        }
        
        this.queue.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = `queue-item ${index === this.currentIndex ? 'active' : ''}`;
            item.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 8px;
                border: 1px solid #444;
                background: ${index === this.currentIndex ? '#363636' : 'transparent'};
            `;
            item.innerHTML = `
                <img src="${song.thumbnail}" alt="${song.title}" 
                     onerror="this.src='https://via.placeholder.com/50x50/7D6DAD/FFFFFF?text=🎵'"
                     style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;">
                <div style="flex: 1;">
                    <div style="color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 4px;">${song.title}</div>
                    <div style="color: #888; font-size: 12px;">${song.artist}</div>
                </div>
                <button class="remove-from-queue-btn" title="Remover da fila"
                        style="background: transparent; border: 1px solid #ff6b6b; color: #ff6b6b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease;">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-from-queue-btn')) {
                    this.currentIndex = index;
                    this.loadSong(song);
                    if (this.isPlaying) this.play();
                    this.hideQueue();
                }
            });

            const removeButton = item.querySelector('.remove-from-queue-btn');
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromQueue(index);
            });
            
            queueList.appendChild(item);
        });
    }

    addToQueue(songs) {
        this.queue = this.queue.concat(songs);
        if (!this.currentSong && this.queue.length > 0) {
            this.currentIndex = 0;
            this.loadSong(this.queue[0]);
        }
        this.updateQueueDisplay();
    }

    removeFromQueue(index) {
        if (index < 0 || index >= this.queue.length) return;
        
        const removedSong = this.queue[index];
        this.queue.splice(index, 1);
        
        // Ajustar currentIndex se necessário
        if (this.currentIndex >= index && this.currentIndex > 0) {
            this.currentIndex--;
        }
        
        // Se a música atual foi removida, carregar a próxima
        if (index === this.currentIndex) {
            if (this.queue.length > 0) {
                this.currentIndex = Math.min(this.currentIndex, this.queue.length - 1);
                this.loadSong(this.queue[this.currentIndex]);
                if (this.isPlaying) this.play();
            } else {
                this.currentSong = null;
                this.stopProgressUpdate();
                this.isPlaying = false;
                this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.elements.songTitle.textContent = 'Nenhuma música tocando';
                this.elements.songArtist.textContent = 'Busque uma música para começar';
                this.elements.progress.style.width = '0%';
                this.elements.currentTime.textContent = '0:00';
                this.elements.duration.textContent = '0:00';
                document.title = 'MusicLab';
            }
        }
        
        this.showNotification(`"${removedSong.title}" removida da fila`);
        this.updateQueueDisplay();
    }

    clearQueue() {
        this.queue = [];
        this.currentIndex = 0;
        this.currentSong = null;
        if (this.youtubePlayer) {
            this.youtubePlayer.stopVideo();
        }
        this.stopProgressUpdate();
        this.isPlaying = false;
        this.elements.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.elements.songTitle.textContent = 'Nenhuma música tocando';
        this.elements.songArtist.textContent = 'Busque uma música para começar';
        this.elements.progress.style.width = '0%';
        this.elements.currentTime.textContent = '0:00';
        this.elements.duration.textContent = '0:00';
        document.title = 'MusicLab';
        this.updateQueueDisplay();
    }

    // Método para debug
    getPlayerStatus() {
        return {
            currentSong: this.currentSong,
            isPlaying: this.isPlaying,
            currentTime: this.currentTime,
            duration: this.duration,
            volume: this.volume,
            shuffle: this.shuffle,
            repeat: this.repeat,
            queueLength: this.queue.length,
            currentIndex: this.currentIndex,
            youtubePlayerReady: !!this.youtubePlayer
        };
    }
}

// Inicialização SIMPLES - sem músicas automáticas
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 MusicLab Player - Pronto para buscas');
    window.musicPlayer = new YouTubeMusicPlayer();
});

// Adicionar estilos CSS para animações
const playerStyle = document.createElement('style');
playerStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .search-result-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 8px;
        border: 1px solid #444;
    }
    
    .search-result-item:hover {
        background-color: #363636;
        border-color: #7D6DAD;
    }
    
    .add-to-queue-btn:hover {
        background: #5d5085 !important;
        transform: scale(1.1);
    }
    
    .remove-from-queue-btn:hover {
        background: #ff6b6b !important;
        color: white !important;
    }
    
    .active {
        color: #7D6DAD !important;
    }
`;
document.head.appendChild(playerStyle);

// APENAS UMA INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando Music Player...');
    window.musicPlayer = new YouTubeMusicPlayer();
});

// Delete

async function deleteAccount() {
    // Confirmação de segurança
    const confirmed = confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos permanentemente.');
    
    if (!confirmed) {
        return;
    }

    // Confirmação adicional por segurança
    const doubleConfirmed = confirm('ATENÇÃO: Esta ação não pode ser desfeita. Todos os seus posts, playlists e dados serão excluídos permanentemente. Digite "EXCLUIR" para confirmar:');
    
    if (!doubleConfirmed) {
        return;
    }

    const userInput = prompt('Digite "EXCLUIR" para confirmar a exclusão permanente da sua conta:');
    
    if (userInput !== 'EXCLUIR') {
        alert('Exclusão cancelada. A conta não foi excluída.');
        return;
    }

    try {
        // Obter dados do usuário logado
        const userInfo = localStorage.getItem('Informacoes');
        
        if (!userInfo) {
            alert('Erro: Usuário não está logado.');
            return;
        }

        const user = JSON.parse(userInfo);
        const userId = user.id;

        // Mostrar loading
        showLoading('Excluindo conta...');

        // Fazer requisição para excluir a conta
        const response = await fetch(`http://localhost:3005/usuario/excluir/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Remover loading
        hideLoading();

        const result = await response.json();

        if (response.ok && result.success) {
            // Sucesso - limpar localStorage e redirecionar
            alert('Conta excluída com sucesso. Sentiremos sua falta!');
            
            // Limpar todos os dados locais
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirecionar para página inicial
            window.location.href = '../index.html';
            
        } else {
            // Erro na exclusão
            alert(`Erro ao excluir conta: ${result.message || 'Erro desconhecido'}`);
        }

    } catch (error) {
        // Remover loading em caso de erro
        hideLoading();
        
        console.error('Erro ao excluir conta:', error);
        alert('Erro de conexão. Verifique sua internet e tente novamente.');
    }
}

// Funções auxiliares para loading
function showLoading(message = 'Processando...') {
    // Criar ou reutilizar elemento de loading
    let loadingEl = document.getElementById('loading-overlay');
    
    if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'loading-overlay';
        loadingEl.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            border: 4px solid #f3f3f3;
            border-top: 4px solid #7D6DAD;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        `;
        
        const text = document.createElement('div');
        text.id = 'loading-text';
        text.style.cssText = `
            font-size: 16px;
            text-align: center;
        `;
        
        loadingEl.appendChild(spinner);
        loadingEl.appendChild(text);
        
        // Adicionar estilos de animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(loadingEl);
    }
    
    document.getElementById('loading-text').textContent = message;
    loadingEl.style.display = 'flex';
}

function hideLoading() {
    const loadingEl = document.getElementById('loading-overlay');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// Atualizar a função do dropdown menu para usar a nova função de exclusão
document.addEventListener('DOMContentLoaded', function() {
    const configButton = document.getElementById('btn-config');
    const dropdownMenu = document.createElement('div');
    
    // Criar o menu dropdown
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.innerHTML = `
        <button class="dropdown-item logout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
        </button>
        <button class="dropdown-item delete">
            <i class="fa-solid fa-trash"></i>
            <span>Excluir conta</span>
        </button>
    `;
    
    // Adicionar o menu ao DOM
    document.getElementById('config').appendChild(dropdownMenu);
    
    // Alternar o menu dropdown
    configButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Fechar o menu ao clicar fora
    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
    });
    
    // Prevenir que cliques no menu fechem ele
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Funções dos itens do menu
    const logoutButton = dropdownMenu.querySelector('.logout');
    const deleteButton = dropdownMenu.querySelector('.delete');
    
    logoutButton.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        logout(); // Usa a função logout existente
    });
    
    deleteButton.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        deleteAccount(); // Chama a nova função de excluir conta
    });
});


// menu drop

// Dropdown Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const configButton = document.getElementById('btn-config');
    const dropdownMenu = document.createElement('div');
    
    // Criar o menu dropdown
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.innerHTML = `
        <button class="dropdown-item logout">
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
        </button>
        <button class="dropdown-item delete">
            <i class="fa-solid fa-trash"></i>
            <span>Excluir conta</span>
        </button>
    `;
    
    // Adicionar o menu ao DOM
    document.getElementById('config').appendChild(dropdownMenu);
    
    // Alternar o menu dropdown
    configButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Fechar o menu ao clicar fora
    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
    });
    
    // Prevenir que cliques no menu fechem ele
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Funções dos itens do menu
    const logoutButton = dropdownMenu.querySelector('.logout');
    const deleteButton = dropdownMenu.querySelector('.delete');
    
    logoutButton.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        // Aqui você pode adicionar a função de logout
        console.log('Logout clicked');
         logout(); // Descomente se quiser usar a função logout existente
    });
    
    deleteButton.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        // Aqui você pode adicionar a função para excluir conta
        console.log('Excluir conta clicked');
        if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
            // Adicione aqui a lógica para excluir a conta
        }
    });
});