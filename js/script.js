// 1. STATO DELL'APP
let myMoviesDataset = [];
let currentFilter = 'all';
let currentLang = 'it';
let currentTheme = 'dark';
let searchQuery = ''; 
let currentSort = 'default'; // Ordinamenti possibili: 'default', 'alpha', 'alpha-desc', 'date-desc', 'date-asc'

// TRADUZIONI INTERFACCIA
const i18n = {
    it: {
        title: "🎬 My Movies", subtitle: "Archivio film personale",
        all: "Tutti", watched: "Visti", watchlist: "Da Vedere",
        note: "Nota Personale", noPlot: "Trama non inserita.",
        statusWatched: "Visto", statusWatchlist: "Da Vedere", btnLang: "🌐 ENG",
        searchPlaceholder: "Cerca film per titolo...", 
        sortDefault: "Ordine di Aggiunta", 
        sortAlpha: "Alfabetico (A-Z)",
        sortAlphaDesc: "Alfabetico (Z-A)",
        sortDateDesc: "Più recenti (Anno)",
        sortDateAsc: "Più datati (Anno)"
    },
    en: {
        title: "🎬 My Films", subtitle: "Personal movie archive",
        all: "All", watched: "Watched", watchlist: "Watchlist",
        note: "Personal Note", noPlot: "Plot not added.",
        statusWatched: "Watched", statusWatchlist: "Watchlist", btnLang: "🌐 ITA",
        searchPlaceholder: "Search movies by title...", 
        sortDefault: "Date Added", 
        sortAlpha: "Alphabetical (A-Z)",
        sortAlphaDesc: "Alphabetical (Z-A)",
        sortDateDesc: "Newest First (Year)",
        sortDateAsc: "Oldest First (Year)"
    }
};

// 2. INIZIALIZZAZIONE
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('data/movies.json');
        myMoviesDataset = await response.json();
        updateUI();
        renderGrid();
    } catch (e) {
        console.error("Errore nel caricamento del JSON.", e);
        document.getElementById('moviesGrid').innerHTML = "<p style='color:red;'>Errore: Impossibile caricare movies.json.</p>";
    }
});

// 3. CAMBIO LINGUA, TEMA, RICERCA E ORDINAMENTO
function toggleLang() {
    currentLang = currentLang === 'it' ? 'en' : 'it';
    updateUI();
    renderGrid();
}

// Nota: se in futuro userai un json estratto con un ordine differente, 
// questo array mantiene in memoria l'ordine originale di caricamento.
let originalOrder = [];

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('theme-btn').innerText = currentTheme === 'dark' ? "☀️" : "🌙";
}

function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    renderGrid();
}

function handleSort(event) {
    currentSort = event.target.value;
    renderGrid();
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
    
    document.getElementById('search-input').placeholder = t.searchPlaceholder;
    document.getElementById('opt-default').innerText = t.sortDefault;
    document.getElementById('opt-alpha').innerText = t.sortAlpha;
    document.getElementById('opt-alpha-desc').innerText = t.sortAlphaDesc;
    document.getElementById('opt-date-desc').innerText = t.sortDateDesc;
    document.getElementById('opt-date-asc').innerText = t.sortDateAsc;
}

// 4. RENDERING GRIGLIA CON FILTRI AVANZATI
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

    // Creiamo una copia profonda del dataset per evitare che l'ordinamento distrugga l'ordine originario del JSON
    // Aggiungiamo anche un indice 'originalIndex' per poter tornare all'ordine di aggiunta in qualsiasi momento
    let filtered = myMoviesDataset.map((m, i) => ({ ...m, originalIndex: i }));

    // 1. Filtro per stato (Tutti / Visti / Da vedere)
    filtered = filtered.filter(m => currentFilter === 'all' || m.status === currentFilter);

    // 2. Filtro per testo (Barra di ricerca)
    if (searchQuery.trim() !== '') {
        filtered = filtered.filter(m => {
            const displayTitle = m.title[currentLang] || m.title['it'];
            return displayTitle.toLowerCase().includes(searchQuery);
        });
    }

    // 3. Logica di Ordinamento Multipla
    if (currentSort === 'alpha') {
        filtered.sort((a, b) => {
            const titleA = a.title[currentLang] || a.title['it'];
            const titleB = b.title[currentLang] || b.title['it'];
            return titleA.localeCompare(titleB);
        });
    } else if (currentSort === 'alpha-desc') {
        filtered.sort((a, b) => {
            const titleA = a.title[currentLang] || a.title['it'];
            const titleB = b.title[currentLang] || b.title['it'];
            return titleB.localeCompare(titleA); // Invertito rispetto ad alpha
        });
    } else if (currentSort === 'date-desc') {
        filtered.sort((a, b) => b.year - a.year); // Dal più recente al più vecchio
    } else if (currentSort === 'date-asc') {
        filtered.sort((a, b) => a.year - b.year); // Dal più vecchio al più recente
    } else if (currentSort === 'default') {
        filtered.sort((a, b) => a.originalIndex - b.originalIndex); // Ritorna all'ordine del file JSON
    }

    // Generazione delle card
    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 50px;">Nessun film trovato.</div>`;
        return;
    }

    filtered.forEach((movie) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => openModal(movie);

        const displayStatus = movie.status === 'watched' ? t.statusWatched : t.statusWatchlist;
        const displayTitle = movie.title[currentLang] || movie.title['it'];

        let posterHTML = '';
        if (movie.local_poster) {
            posterHTML = `<img src="${movie.local_poster}" class="poster-img" alt="${displayTitle}" loading="lazy">`;
        } else {
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
    
    const displayComment = (movie.comment && movie.comment[currentLang]) ? movie.comment[currentLang] : (movie.comment ? movie.comment['it'] : '');
    const displayPlot = (movie.plot && movie.plot[currentLang]) ? movie.plot[currentLang] : (movie.plot ? movie.plot['it'] : t.noPlot);

    document.getElementById('movieModal').style.display = 'flex';
    document.getElementById('modalTitle').innerText = displayTitle;
    document.getElementById('modalYear').innerText = `(${movie.year})`;
    document.getElementById('modalRating').innerText = getStarsHTML(movie.rating);
    
    const modalPoster = document.getElementById('modalPoster');
    if (movie.local_poster) {
        modalPoster.src = movie.local_poster;
        modalPoster.style.display = 'block';
    } else {
        modalPoster.src = '';
        modalPoster.style.display = 'none';
    }

    document.getElementById('modalPlot').innerText = displayPlot;
    document.getElementById('modalTags').innerHTML = '';
    
    if (displayComment) {
        document.getElementById('modalCommentContainer').style.display = 'block';
        document.getElementById('modalComment').innerText = displayComment;
    } else {
        document.getElementById('modalCommentContainer').style.display = 'none';
    }

    // Svuota le righe precedenti
    document.getElementById('row-genres').innerHTML = '';
    document.getElementById('row-director').innerHTML = '';
    document.getElementById('row-cast').innerHTML = '';

    // 1. Generi
    if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
        document.getElementById('row-genres').style.display = 'flex';
        movie.genres.forEach(g => {
            document.getElementById('row-genres').innerHTML += `<span class="tag">${g}</span>`;
        });
    } else {
        document.getElementById('row-genres').style.display = 'none';
    }

    // 2. Regista / Registi
    if (movie.director && movie.director.trim() !== "") {
        document.getElementById('row-director').style.display = 'flex';
        // Gestisce sia un singolo regista che più registi separati da virgola
        const directorLabel = movie.director.includes(',') ? "🎬" : "🎬";
        document.getElementById('row-director').innerHTML = `<span class="tag" style="background-color: var(--accent); color: #fff;">${directorLabel} ${movie.director}</span>`;
    } else {
        document.getElementById('row-director').style.display = 'none';
    }
    
    // 3. Cast Principale
    if (movie.cast && Array.isArray(movie.cast) && movie.cast.length > 0) {
        document.getElementById('row-cast').style.display = 'flex';
        movie.cast.forEach(actor => {
            document.getElementById('row-cast').innerHTML += `<span class="tag" style="background-color: #475569; color: #fff;">🎭 ${actor}</span>`;
        });
    } else {
        document.getElementById('row-cast').style.display = 'none';
    }
}

function closeModal(event) {
    if (event.target.id === 'movieModal' || event.target.className === 'close-btn') {
        document.getElementById('movieModal').style.display = 'none';
    }
}
