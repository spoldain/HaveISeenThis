window.history.scrollRestoration = 'manual';

let currentMoviesList = [];
let displayItems = []; 
let currentRotation = 0;
let lastWidth = window.innerWidth; // ADDED: To track real resizes

function getDynamicRadius() {
    return window.innerWidth < 768 ? 420 : 950; 
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function getMovies() {
    const yf = document.getElementById('year-from').value;
    const yt = document.getElementById('year-to').value;
    const type = document.getElementById('media-type').value;
    const genres = Array.from(document.querySelectorAll('.genre-item input:checked')).map(i => i.value);
    
    const yearParam = type === 'tv' ? 'first_air_date' : 'primary_release_date';
    const yearQuery = (yf && yt) ? `&${yearParam}.gte=${yf}-01-01&${yearParam}.lte=${yt}-12-31` : '';
    const genreQuery = genres.length ? `&with_genres=${genres.join(',')}` : '';

    const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}${yearQuery}${genreQuery}&sort_by=popularity.desc&include_adult=false`);
    const data = await res.json();
    return data.results;
}

function setupWheel() {
    const track = document.getElementById('wheel-track');
    track.innerHTML = '';
    
    const maxItems = window.innerWidth < 768 ? 10 : 15;
    
    displayItems = [...currentMoviesList].slice(0, maxItems);
    while(displayItems.length < maxItems && currentMoviesList.length > 0) {
        displayItems = [...displayItems, ...currentMoviesList].slice(0, maxItems);
    }

    const totalItems = displayItems.length;
    const theta = 360 / totalItems; 
    const radius = getDynamicRadius();

    displayItems.forEach((movie, i) => {
        const item = document.createElement('div');
        item.classList.add('poster-item');
        item.style.transform = `rotateY(${theta * i}deg) translateZ(${radius}px)`;
        
        const path = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` 
            : 'https://via.placeholder.com/342x513?text=No+Poster';
            
        item.innerHTML = `<img src="${path}" loading="lazy">`;
        track.appendChild(item);
    });

    track.style.transition = 'none';
    // Use translateZ(0) here to keep GPU active
    track.style.transform = `rotateY(${-currentRotation}deg) translateZ(0)`;
}

async function initShowcase() {
    const results = await getMovies();
    if (results.length > 0) {
        currentRotation = 0; // RESET: Only when movies actually change
        currentMoviesList = shuffleArray(results);
        setupWheel();
        updateTitle(displayItems[0]); 
    }
}

function updateTitle(movie) {
    if(!movie) return;
    const name = movie.title || movie.name;
    const date = (movie.release_date || movie.first_air_date || "").split('-')[0];
    document.getElementById('movie-title').innerHTML = `${name} <span style="opacity:0.5; font-weight:300;">(${date})</span>`;
}

function spinWheel() {
    if (displayItems.length < 2) return;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const track = document.getElementById('wheel-track');
    const btn = document.getElementById('spin-button');
    btn.disabled = true;

    const totalItems = displayItems.length;
    const theta = 360 / totalItems;
    const winnerIndex = Math.floor(Math.random() * totalItems);
    
    const currentActualAngle = currentRotation % 360;
    const targetAngle = winnerIndex * theta;
    const relativeRotation = targetAngle - currentActualAngle;
    
    const spins = 360 * 5; 
    currentRotation += (spins + relativeRotation);
    
    track.style.transition = 'transform 6s cubic-bezier(0.15, 0, 0.15, 1)';
    track.style.transform = `rotateY(${-currentRotation}deg) translateZ(0)`;

    setTimeout(() => {
        btn.disabled = false;
        updateTitle(displayItems[winnerIndex]);
    }, 6000);
}

// FIXED: This now prevents the "reset on scroll" bug
window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        if (currentMoviesList.length > 0) setupWheel();
    }
});

function populateYears() {
    const f = document.getElementById('year-from');
    const t = document.getElementById('year-to');
    const cur = new Date().getFullYear();
    for(let i=cur; i>=1900; i--) { 
        f.add(new Option(i, i)); 
        t.add(new Option(i, i)); 
    }
}

async function populateGenreFilter() {
    const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await res.json();
    const container = document.getElementById('genre-filter');
    data.genres.forEach(g => {
        const div = document.createElement('div');
        div.classList.add('genre-item');
        div.innerHTML = `<input type="checkbox" id="g-${g.id}" value="${g.id}" class="auto-filter"><label for="g-${g.id}">${g.name}</label>`;
        container.appendChild(div);
    });
    document.querySelectorAll('.auto-filter').forEach(el => el.addEventListener('change', initShowcase));
}

document.addEventListener('DOMContentLoaded', async () => {
    populateYears();
    await populateGenreFilter();
    document.getElementById('media-type').addEventListener('change', initShowcase);
    document.getElementById('year-from').addEventListener('change', initShowcase);
    document.getElementById('year-to').addEventListener('change', initShowcase);
    document.getElementById('spin-button').onclick = spinWheel;
    initShowcase();
});