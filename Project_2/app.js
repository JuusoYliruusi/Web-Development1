document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('fetchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const input = document.getElementById('userInput');
    const display = document.getElementById('display');
    const status = document.getElementById('status');
    const historyPanel = document.getElementById('historyPanel');
    const showFavsBtn = document.getElementById('showFavsBtn');

    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let favorites = JSON.parse(localStorage.getItem('favShows')) || [];
    let currentResults = [];
    let isShowingFavs = false;

    if (localStorage.getItem('dark-mode') === 'enabled')
        document.body.classList.add('dark');

    renderHistory();

    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('dark-mode',
            document.body.classList.contains('dark') ? 'enabled' : 'disabled');
    });

    clearBtn.addEventListener('click', () => {
        display.innerHTML = "";
        input.value = "";
        status.textContent = "Ready.";
        currentResults = [];
        isShowingFavs = false;
    });

    const performSearch = async (query) => {
        if (!query) return;

        isShowingFavs = false;
        status.textContent = "Loading...";

        try {
            const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
            const data = await res.json();

            currentResults = data;

            if (data.length > 0) {
                updateHistory(query);
                renderResults(data);
            } else {
                status.textContent = "No results.";
                display.innerHTML = "";
            }
        } catch {
            status.textContent = "Error fetching data.";
        }
    };

    btn.addEventListener('click', () => performSearch(input.value.trim()));

    function updateHistory(term) {
        history = [term, ...history.filter(h => h !== term)].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyPanel.innerHTML = history.map(t => {
            const color = `hsl(${Math.random() * 360}, 70%, 80%)`;
            return `<button class="hist-pill" 
                style="background:${color}" 
                onclick="historyClick('${t}')">${t}</button>`;
        }).join('');
    }

    window.historyClick = (t) => {
        input.value = t;
        performSearch(t);
    };

    showFavsBtn.addEventListener('click', () => {
        isShowingFavs = !isShowingFavs;

        if (isShowingFavs) {
            renderResults(favorites.map(f => ({ show: f })));
        } else {
            renderResults(currentResults);
        }
    });

    function renderResults(data) {
        status.textContent = isShowingFavs
            ? `Favorites (${data.length})`
            : `Results (${data.length})`;

        display.innerHTML = data.map(item => {
            const s = item.show;
            const isFav = favorites.some(f => f.id === s.id);

            return `
                <div class="card">
                    <img src="${s.image ? s.image.medium : 'https://via.placeholder.com/210x295'}">
                    <div class="card-body">
                        <h3>${s.name}</h3>
                        <p>⭐ ${s.rating?.average ?? 'N/A'}</p>

                        <button onclick="showAlert('${s.url}')">🔗 Alert</button>

                        <button onclick="toggleFav(${s.id})">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.toggleFav = (id) => {
        const index = favorites.findIndex(f => f.id === id);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            const found = currentResults.find(r => r.show.id === id);
            if (found) favorites.push(found.show);
        }

        localStorage.setItem('favShows', JSON.stringify(favorites));

        isShowingFavs
            ? renderResults(favorites.map(f => ({ show: f })))
            : renderResults(currentResults);
    };

    window.showAlert = (url) => {
        alert("Official Page:\n" + url);
    };

});