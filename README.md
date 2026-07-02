# 🎬 MyFilm

Un archivio personale, indipendente e completamente offline per gestire e visualizzare la propria collezione di film visti e da vedere.

Questo progetto nasce dall'esigenza di avere un backup sicuro e proprietario dei propri dati di visione (esportati da app di tracciamento di terze parti), creando un'interfaccia web statica, veloce e che non dipende da server esterni o chiavi API pubbliche.

## ✨ Funzionalità

- 100% Offline e Statico: Nessuna chiamata API dal lato client. Le immagini e le trame risiedono localmente, garantendo caricamenti istantanei e nessuna dipendenza da servizi esterni.

- Gestione Lingua e Tema: Toggle istantaneo tra Italiano e Inglese per l'interfaccia e le trame. Supporto nativo per Dark Mode e Light Mode.

- Scheda Dettaglio Completa: Modale interattivo con locandina, trama, regista, cast principale (attore + ruolo), generi, voto in stelle e spazio per un commento personale.

- Filtri e Ricerca Avanzata.

## 📂 Struttura del Progetto
```
/
├── css/
│   ├── style.css               # Stili base, griglia e dark/light mode
│   └── mobile.css              # Regole responsive per smartphone
├── js/
│   └── script.js               # Logica dell'app (filtri, ricerca, modale)
├── data/
│   └── movies.json             # IL DATABASE: contiene tutti i film e i testi  
├── img/                        # Cartella contenente tutte le locandine (.jpg)
└── index.html                  # Struttura principale della web app
```

---

### 📝 Come aggiungere nuovi film

1. Scarica la locandina del nuovo film da Google e salvala nella cartella img/
2. Aprire data/movies.json e aggiungi un nuovo blocco alla lista, in questo formato:
```json
{
  "title": {
      "it": "Titolo Italiano",
      "en": "English Title"
    },
    "year": 2026,
    "status": "watched", 
    "rating": 5,
    "local_poster": "img/nuovofilm_2026.jpg",
    "plot": {
      "it": "Trama in italiano...",
      "en": "Plot in english..."
    },
    "director": "Nome Regista",
    "genres": ["Azione", "Fantascienza"],
    "cast": [
      "Attore Uno (Personaggio Uno)",
      "Attore Due (Personaggio Due)"
    ],
    "comment": {
      "it": "Il mio commento personale sul film.",
      "en": "My personal comment."
      }
}
```

(Scrivere `"status": "watchlist"` se invece lo si vuole aggiungere a quelli ancora da vedere)

---

### 🛠 Tecnologie Utilizzate

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)

*   **HTML5 & CSS3:** Struttura semantica e layout responsivo. Utilizza le *CSS Variables* (variabili native) per la gestione istantanea dei temi Dark e Light senza fogli di stile aggiuntivi.
*   **Vanilla JavaScript:** Logica di filtraggio, ricerca e ordinamento scritta in JS puro. Nessun framework esterno (come React o Vue) per garantire la massima leggerezza, velocità di caricamento e compatibilità a lungo termine.
