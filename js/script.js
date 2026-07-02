// 1. STATO DELL'APP
let myMoviesDataset = [];
let currentFilter = 'all';
let currentLang = 'it'; // 'it' o 'en'
let currentTheme = 'dark'; // 'dark' o 'light'

// TRADUZIONI INTERFACCIA (Rimosso il testo "Caricamento trama..." perché ora è istantaneo!)
const i18n = {
    it: {
        title: "🎬 Il Mio Cinema Locale", subtitle: "Archivio film personale e indipendente",
        all: "Tutti", watched: "Visti", watchlist: "Da Vedere",
        note: "Nota Personale", noPlot: "Trama non inserita.",
        statusWatched: "Visto", statusWatchlist: "Da Vedere", btnLang: "🌐 ENG"
    },
    en: {
        title: "🎬 My Local Cinema", subtitle: "Personal and independent movie archive",
        all: "All", watched: "Watched", watchlist: "Watchlist",
        note: "Personal Note", noPlot: "Plot not added.",
        statusWatched: "Watched", statusWatchlist: "Watchlist", btnLang: "🌐 ITA"
    }
};

// 2. INIZIALIZZAZIONE (Legge solo il file locale)
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('data/movies.json');
        myMoviesDataset = await response.json();
        updateUI();
        renderGrid();
    } catch (e) {
        console.error("Errore nel caricamento del JSON. Se sei in locale senza server, usa Live Server su VS Code.", e);
        document.getElementById('moviesGrid').innerHTML = "<p style='color:red;'>Errore: Impossibile caricare movies.json.</p>";
    }
});

// 3. CAMBIO LINGUA E TEMA
function toggleLang() {
    currentLang = currentLang === 'it' ? 'en' : 'it';
    updateUI();
    renderGrid();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('theme-btn').innerText = currentTheme === 'dark' ? "☀️ Light" : "🌙 Dark";
}

function updateUI() {
    const t = i18n[currentLang];
    document.getElementById('ui-title').innerText = t.title;
    document.getElementById('ui-subtitle').innerText = t.subtitle;
    document.getElementById('btn-all').innerText = t.all;
    document.getElementById('btn-watched').innerText = t.watched;
    document.getElementById('btn-watchlist').innerText = t.watchlist;
    document.getElementById('ui-note').innerText = t.note;
    document.getElementById('lang-btn').innerText = t.btnLang;
}

// 4. RENDERING GRIGLIA
function filterMovies(status) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${status}`).classList.add('active');
    renderGrid();
}

function getStarsHTML(rating) {
    if (!rating) return '';
    return '⭐'.repeat(rating);
}

function renderGrid() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';
    const t = i18n[currentLang];

    const filtered = myMoviesDataset.filter(m => currentFilter === 'all' || m.status === currentFilter);

    filtered.forEach((movie, index) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => openModal(movie);

        const displayStatus = movie.status === 'watched' ? t.statusWatched : t.statusWatchlist;
        const displayTitle = movie.title[currentLang] || movie.title['it'];

        // Creazione immediata della card con la foto in locale
        let posterHTML = '';
        if (movie.local_poster) {
            posterHTML = `<img src="${movie.local_poster}" class="poster-img" alt="${displayTitle}">`;
        } else {
            // Placeholder se l'immagine non è presente nel JSON
            posterHTML = `<div style="color: var(--text-muted); font-size: 12px; text-align: center; padding-top: 50%;">Nessuna copertina</div>`;
        }

        card.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <span class="status-badge status-${movie.status}">${displayStatus}</span>
            </div>
            <div class="movie-info">
                <div>
                    <div class="movie-title">${displayTitle}</div>
                    <div class="movie-year">${movie.year}</div>
                </div>
                <div class="stars">${getStarsHTML(movie.rating)}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 5. GESTIONE MODALE (Dettagli)
function openModal(movie) {
    const t = i18n[currentLang];
    const displayTitle = movie.title[currentLang] || movie.title['it'];
    
    // Gestione sicura per evitare errori se mancano commenti o trame
    const displayComment = (movie.comment && movie.comment[currentLang]) ? movie.comment[currentLang] : (movie.comment ? movie.comment['it'] : '');
    const displayPlot = (movie.plot && movie.plot[currentLang]) ? movie.plot[currentLang] : (movie.plot ? movie.plot['it'] : t.noPlot);

    document.getElementById('movieModal').style.display = 'flex';
    document.getElementById('modalTitle').innerText = displayTitle;
    document.getElementById('modalYear').innerText = `(${movie.year})`;
    document.getElementById('modalRating').innerText = getStarsHTML(movie.rating);
    
    // Inserimento Immagine Locale nel Modale
    const modalPoster = document.getElementById('modalPoster');
    if (movie.local_poster) {
        modalPoster.src = movie.local_poster;
        modalPoster.style.display = 'block';
    } else {
        modalPoster.src = '';
        modalPoster.style.display = 'none'; // Nasconde lo spazio vuoto se non c'è foto
    }

    document.getElementById('modalPlot').innerText = displayPlot;
    document.getElementById('modalTags').innerHTML = '';
    
    if (displayComment) {
        document.getElementById('modalCommentContainer').style.display = 'block';
        document.getElementById('modalComment').innerText = displayComment;
    } else {
        document.getElementById('modalCommentContainer').style.display = 'none';
    }

    // Inserimento Tags direttamente dal file JSON
    let tagsHTML = '';
    
    // Generi (se aggiunti al json come array)
    if (movie.genres && Array.isArray(movie.genres)) {
        movie.genres.forEach(g => {
            tagsHTML += `<span class="tag">${g}</span>`;
        });
    }

    // Regista
    if (movie.director) {
        tagsHTML += `<span class="tag" style="background-color: var(--accent); color: #fff;">🎬 Regia: ${movie.director}</span>`;
    }
    
    // Cast (se aggiunto al json come array)
    if (movie.cast && Array.isArray(movie.cast)) {
        movie.cast.forEach(actor => {
            tagsHTML += `<span class="tag" style="background-color: #475569; color: #fff;">🎭 ${actor}</span>`;
        });
    }

    document.getElementById('modalTags').innerHTML = tagsHTML;
}

function closeModal(event) {
    if (event.target.id === 'movieModal' || event.target.className === 'close-btn') {
        document.getElementById('movieModal').style.display = 'none';
    }
}
