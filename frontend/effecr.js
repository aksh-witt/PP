// document.getElementById('open-btn').addEventListener('click', function() {
//     document.getElementById('side-bar').classList.toggle('open-sidebar');
// });

// // Modal

// const modal = document.getElementById('playlist-modal');
// const openModalBtn = document.getElementById('add_playlist_btn');
// const closeModalBtn = document.getElementById('close-modal-btn');
// const playlistForm = document.getElementById('playlist-form');
// const playlistContainer = document.getElementById('side_items');

// function openModal() {
//     modal.style.display = 'flex';
// }

// function closeModal() {
//     modal.style.display = 'none';
// }


// openModalBtn.addEventListener('click', openModal);
// closeModalBtn.addEventListener('click', closeModal);

// // Fecha o modal 
// window.addEventListener('click', function(event) {
//     if (event.target == modal) {
//         closeModal();
//     }
// });


// playlistForm.addEventListener('submit', function(event) {
//     // Impede que a página recarregue ao enviar o formulário
//     event.preventDefault();

//     const playlistName = document.getElementById('playlist-name').value;
//     const coverFileInput = document.getElementById('playlist-cover');
//     const coverFile = coverFileInput.files[0];

//     // Verifica se um nome e um arquivo foram inseridos
//     if (playlistName && coverFile) {

//         const coverUrl = URL.createObjectURL(coverFile);

//         // Cria o novo item no HTML
//         const newPlaylistItem = document.createElement('li');
//         newPlaylistItem.classList.add('side-item');
        
//         newPlaylistItem.innerHTML = `
//             <a href="#">
//                 <img src="${coverUrl}" alt="Capa da playlist ${playlistName}" class="playlist-cover">
//                 <span class="item-description">${playlistName}</span>
//             </a>
//         `;

//         // Adiciona a nova playlist na lista da barra lateral
//         playlistContainer.appendChild(newPlaylistItem);

//         // Limpa o modal
//         playlistForm.reset();
//         closeModal();
//     }
// });

// // Modal Post

// // document.addEventListener('DOMContentLoaded', () => {

// //     // --- CONTROLE DO MODAL DE POST ---
    
// //     // PASSO 1: Encontramos o modal de post e o botão do HEADER pelos seus IDs
// //     const postModal = document.getElementById('post-modal');
// //     const openPostModalBtn = document.getElementById('add_post'); // <-- AQUI! Procuramos pelo ID "add_post"

// //     // PASSO 2: Dizemos ao JavaScript o que fazer quando ESSE botão for clicado
// //     openPostModalBtn.addEventListener('click', () => {
// //         // AÇÃO: Mostra o modal de post
// //         postModal.style.display = 'flex';
// //     });

// //     // O resto do código (para fechar o modal, enviar o formulário, etc.) continua...
// // });

// // Feed e post

// // Fechar modal de post
// const postModal = document.getElementById('post-modal');
// const closePostModalBtn = document.getElementById('close-post-modal-btn');

// closePostModalBtn.addEventListener('click', () => {
//     postModal.style.display = 'none';
// });

// // Fecha o modal de post clicando fora
// window.addEventListener('click', function(event) {
//     if (event.target == postModal) {
//         postModal.style.display = 'none';
//     }
// });

// // Função para adicionar post (exemplo básico)
// function addPost(event) {
//     event.preventDefault();
    
//     const title = document.getElementById('post-title').value;
//     const description = document.getElementById('post-description').value;
    
//     if (title && description) {
//         // Aqui você adicionaria a lógica para criar o post
//         console.log('Novo post:', { title, description });
        
//         // Fecha o modal
//         postModal.style.display = 'none';
        
//         // Limpa o formulário
//         document.getElementById('post-form').reset();
        
//         // Aqui você adicionaria o novo post ao feed
//         // (implementação depende do seu backend)
//     }
// }

// // Ajuste da side bar 

// function adjustLayout() {
//     const sidebar = document.getElementById('side-bar');
//     const header = document.querySelector('header');
//     const main = document.querySelector('main');
    
//     if (sidebar.classList.contains('open-sidebar')) {
//         header.style.marginLeft = '250px';
//         main.style.marginLeft = '250px';
//         main.style.width = 'calc(100vw - 250px)';
//     } else {
//         header.style.marginLeft = '8vh';
//         main.style.marginLeft = '8vh';
//         main.style.width = 'calc(100vw - 8vh)';
//     }
// }

// // Chama a função quando a sidebar é toggle
// document.getElementById('open-btn').addEventListener('click', function() {
//     setTimeout(adjustLayout, 50); // Pequeno delay para garantir que a transição CSS aconteça
// });

// // Ajusta o layout quando a página carrega
// window.addEventListener('load', adjustLayout);

// Apenas controles da sidebar - remova tudo relacionado aos modais
document.getElementById('open-btn').addEventListener('click', function() {
    document.getElementById('side-bar').classList.toggle('open-sidebar');
});

// Modal de playlist (opcional - se quiser remover também)
const modal = document.getElementById('playlist-modal');
const openModalBtn = document.getElementById('add_playlist_btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const playlistForm = document.getElementById('playlist-form');
const playlistContainer = document.getElementById('side_items');

function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Fecha o modal clicando fora
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        closeModal();
    }
});

if (playlistForm) {
    playlistForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const playlistName = document.getElementById('playlist-name').value;
        const coverFileInput = document.getElementById('playlist-cover');
        const coverFile = coverFileInput.files[0];

        if (playlistName && coverFile) {
            const coverUrl = URL.createObjectURL(coverFile);

            const newPlaylistItem = document.createElement('li');
            newPlaylistItem.classList.add('side-item');
            
            newPlaylistItem.innerHTML = `
                <a href="#">
                    <img src="${coverUrl}" alt="Capa da playlist ${playlistName}" class="playlist-cover">
                    <span class="item-description">${playlistName}</span>
                </a>
            `;

            playlistContainer.appendChild(newPlaylistItem);
            playlistForm.reset();
            closeModal();
        }
    });
}