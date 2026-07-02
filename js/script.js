// 1. STATO DELL'APP
let myMoviesDataset = [];
let currentFilter = 'all';
let currentLang = 'it'; // 'it' o 'en'
let currentTheme = 'dark'; // 'dark' o 'light'

// TRADUZIONI INTERFACCIA
const i18n = {
    it: {
        title: "🎬 Il Mio Cinema Locale", subtitle: "Archivio film personale e indipendente",
        all: "Tutti", watched: "Visti", watchlist: "Da Vedere",
        note: "Nota Personale", loadingPlot: "Caricamento trama...", noPlot: "Trama non disponibile.",
        statusWatched: "Visto", statusWatchlist: "Da Vedere"
    },
    en: {
        title: "🎬 My Local Cinema", subtitle: "Personal and independent movie archive",
        all: "All", watched: "Watched", watchlist: "Watchlist",
        note: "Personal Note", loadingPlot: "Loading plot...", noPlot: "Plot not available.",
        statusWatched: "Watched", statusWatchlist: "Watchlist"
    }
};

const TMDB_API_KEY = "INSERISCI_QUI_LA_TUA_API_KEY"; // <-- IMPORTANTE: Sostituisci per avere le copertine

// 2. INIZIALIZZAZIONE
document.addEventListener("DOMContentLoaded", async () => {
    // Carica il JSON usando fetch
    try {
        const response = await fetch('data/movies.json');
        myMoviesDataset = await response.json();
        updateUI();
        renderGrid();
    } catch (e) {
        console.error("Errore nel caricamento del JSON. Se sei in locale senza server, usa Live Server su VS Code.", e);
        document.getElementById('moviesGrid').innerHTML = "<p>Errore caricamento dati.</p>";
    }
});

// 3. CAMBIO LINGUA E TEMA
function toggleLang() {
    currentLang = currentLang === 'it' ? 'en' : 'it';
    document.getElementById('lang-btn').innerText = currentLang === 'it' ? "🇬🇧 ENG" : "🇮🇹 ITA";
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

        // Traduciamo lo stato e il titolo
        const displayStatus = movie.status === 'watched' ? t.statusWatched : t.statusWatchlist;
        const displayTitle = movie.title[currentLang] || movie.title['it']; // Fallback in IT se manca l'EN

        card.innerHTML = `
            <div class="poster-wrapper" id="poster-${index}">
                <div style="color: var(--text-muted); font-size: 12px;">Loading...</div>
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

        // Fetch asincrono TMDB (Cerca usando il titolo originale/italiano per massima precisione)
        fetchTMDBData(movie.title['it'], movie.year).then(data => {
            const wrapper = document.getElementById(`poster-${index}`);
            if (data && data.poster_path) {
                wrapper.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w300${data.poster_path}" class="poster-img" alt="${displayTitle}">
                    <span class="status-badge status-${movie.status}">${displayStatus}</span>
                `;
            } else {
                wrapper.innerHTML = `<span class="status-badge status-${movie.status}">${displayStatus}</span>`;
            }
        });
    });
}

// 5. CHIAMATE API TMDB
async function fetchTMDBData(title, year) {
    // Nota: Passiamo la lingua per ottenere trame e dati localizzati
    const langCode = currentLang === 'it' ? 'it-IT' : 'en-US';
    try {
        const query = encodeURIComponent(title);
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&year=${year}&language=${langCode}`);
        const data = await res.json();
        return (data.results && data.results.length > 0) ? data.results[0] : null;
    } catch (e) { return null; }
}

async function fetchExtendedDetails(movieId) {
    const langCode = currentLang === 'it' ? 'it-IT' : 'en-US';
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=${langCode}`);
        return await res.json();
    } catch (e) { return null; }
}

// 6. GESTIONE MODALE (Dettagli)
async function openModal(movie) {
    const t = i18n[currentLang];
    const displayTitle = movie.title[currentLang] || movie.title['it'];
    const displayComment = movie.comment[currentLang] || movie.comment['it'];

    document.getElementById('movieModal').style.display = 'flex';
    document.getElementById('modalTitle').innerText = displayTitle;
    document.getElementById('modalYear').innerText = `(${movie.year})`;
    document.getElementById('modalRating').innerText = getStarsHTML(movie.rating);
    document.getElementById('modalPlot').innerText = t.loadingPlot;
    document.getElementById('modalTags').innerHTML = '';
    
    if (displayComment) {
        document.getElementById('modalCommentContainer').style.display = 'block';
        document.getElementById('modalComment').innerText = displayComment;
    } else {
        document.getElementById('modalCommentContainer').style.display = 'none';
    }

    // Carica dati da TMDB per la lingua selezionata
    const tmdbData = await fetchTMDBData(movie.title['it'], movie.year);
    if (tmdbData) {
        document.getElementById('modalPoster').src = `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`;
        document.getElementById('modalPlot').innerText = tmdbData.overview || t.noPlot;
        
        const ext = await fetchExtendedDetails(tmdbData.id);
        if (ext) {
            let tags = ext.genres.map(g => `<span class="tag">${g.name}</span>`).join('');
            const dir = ext.credits.crew.find(c => c.job === 'Director');
            if (dir) tags += `<span class="tag" style="background-color: var(--accent); color: #fff;">${dir.name}</span>`;
            document.getElementById('modalTags').innerHTML = tags;
        }
    } else {
        document.getElementById('modalPoster').src = '';
        document.getElementById('modalPlot').innerText = t.noPlot;
    }
}

function closeModal(event) {
    if (event.target.id === 'movieModal' || event.target.className === 'close-btn') {
        document.getElementById('movieModal').style.display = 'none';
    }
}
