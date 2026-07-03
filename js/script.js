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
        sortDateAsc: "Più datati (Anno)",
        genresLabel: "Generi:",
        directorLabel: "Regia:",
        directorsLabel: "Registi:",
        castLabel: "Cast:"
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
        sortDateAsc: "Oldest First (Year)",
        genresLabel: "Genres:",
        directorLabel: "Director:",
        directorsLabel: "Directors:",
        castLabel: "Cast:"
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
    
    // PUNTIAMO A txt- INVECE DI btn- PER SALVARE I COUNTER DEI FILM
    if (document.getElementById('txt-all')) document.getElementById('txt-all').innerText = t.all;
    if (document.getElementById('txt-watched')) document.getElementById('txt-watched').innerText = t.watched;
    if (document.getElementById('txt-watchlist')) document.getElementById('txt-watchlist').innerText = t.watchlist;
    
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

function updateCounters(searchQuery, currentLang) {
    let baseDataset = myMoviesDataset; // Per i film

    if (searchQuery.trim() !== '') {
        baseDataset = baseDataset.filter(m => {
            const displayTitle = m.title[currentLang] || m.title['it'];
            return displayTitle.toLowerCase().includes(searchQuery);
        });
    }

    const all = baseDataset.length;
    const watchlist = baseDataset.filter(m => m.status === 'watchlist' || m.status === 'da-vedere').length;
    const watched = baseDataset.filter(m => m.status === 'watched' || m.status === 'visto').length;

    const elAll = document.getElementById('count-all');
    if (elAll) elAll.innerText = all ? `(${all})` : '(0)';

    const elWatchlist = document.getElementById('count-watchlist');
    if (elWatchlist) elWatchlist.innerText = watchlist ? `(${watchlist})` : '(0)';

    const elWatched = document.getElementById('count-watched');
    if (elWatched) elWatched.innerText = watched ? `(${watched})` : '(0)';
}

function renderGrid() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';
    const t = i18n[currentLang];


    updateCounters(searchQuery, currentLang);

    let filtered = myMoviesDataset.map((m, i) => ({ ...m, originalIndex: i }));

    if (currentFilter !== 'all') {
        filtered = filtered.filter(m => m.status === currentFilter);
    }

    if (searchQuery.trim() !== '') {
        filtered = filtered.filter(m => {
            const displayTitle = m.title[currentLang] || m.title['it'];
            return displayTitle.toLowerCase().includes(searchQuery);
        });
    }

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
            return titleB.localeCompare(titleA);
        });
    } else if (currentSort === 'date-desc') {
        filtered.sort((a, b) => b.year - a.year);
    } else if (currentSort === 'date-asc') {
        filtered.sort((a, b) => a.year - b.year);
    } else if (currentSort === 'default') {
        filtered.sort((a, b) => a.originalIndex - b.originalIndex);
    }

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
    
    // Fix definitivo Nota Personale (se "" o null o undefined nasconde il box)
    if (displayComment && displayComment.trim() !== "") {
        document.getElementById('modalCommentContainer').style.display = 'block';
        document.getElementById('modalComment').innerText = displayComment;
    } else {
        document.getElementById('modalCommentContainer').style.display = 'none';
    }

    // Gestione sezioni dinamiche per evitare bug visivi
    const rowGenres = document.getElementById('row-genres');
    const rowDirector = document.getElementById('row-director');
    const rowCast = document.getElementById('row-cast');

    if (rowGenres) {
        rowGenres.innerHTML = '';
        if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
            rowGenres.style.display = 'flex';
            rowGenres.innerHTML = `<strong style="color: var(--accent); min-width: 80px;">${t.genresLabel}</strong>`;
            movie.genres.forEach(g => {
                rowGenres.innerHTML += `<span class="tag">${g}</span>`;
            });
        } else {
            rowGenres.style.display = 'none';
        }
    }

    if (rowDirector) {
        rowDirector.innerHTML = '';
        if (movie.director && movie.director.trim() !== "") {
            rowDirector.style.display = 'flex';
            const isMultiple = movie.director.includes(',');
            const labelText = isMultiple ? t.directorsLabel : t.directorLabel;
            rowDirector.innerHTML = `<strong style="color: var(--accent); min-width: 80px;">${labelText}</strong>`;
            rowDirector.innerHTML += `<span class="tag" style="background-color: var(--accent); color: #fff;">🎬 ${movie.director}</span>`;
        } else {
            rowDirector.style.display = 'none';
        }
    }
    
    if (rowCast) {
        rowCast.innerHTML = '';
        if (movie.cast && Array.isArray(movie.cast) && movie.cast.length > 0) {
            rowCast.style.display = 'flex';
            rowCast.innerHTML = `<strong style="color: var(--accent); min-width: 80px;">${t.castLabel}</strong>`;
            movie.cast.forEach(actor => {
                rowCast.innerHTML += `<span class="tag" style="background-color: #475569; color: #fff;">🎭 ${actor}</span>`;
            });
        } else {
            rowCast.style.display = 'none';
        }
    }
}

function closeModal(event) {
    if (event.target.id === 'movieModal' || event.target.className === 'close-btn') {
        document.getElementById('movieModal').style.display = 'none';
    }
}