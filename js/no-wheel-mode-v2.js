window.history.scrollRestoration = 'manual';
import { apiKey } from './apikey.js';

async function fetchGenres() {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    return data.genres;
}

async function populateGenreFilter() {
    const genres = await fetchGenres();
    const genreFilter = document.getElementById('genre-filter');
    genreFilter.innerHTML = ''; 

    genres.forEach(genre => {
        const genreItem = document.createElement('div');
        genreItem.classList.add('genre-item');
        genreItem.innerHTML = `
            <input type="checkbox" id="genre-${genre.id}" value="${genre.id}">
            <label for="genre-${genre.id}">${genre.name}</label>
        `;
        genreFilter.appendChild(genreItem);
    });
}

function populateYearDropdowns() {
    const yearFrom = document.getElementById('year-from');
    const yearTo = document.getElementById('year-to');
    const currentYear = new Date().getFullYear();
    const createOpt = (v, t) => { let o = document.createElement('option'); o.value = v; o.text = t; return o; };
    yearFrom.add(createOpt('', '--'));
    yearTo.add(createOpt('', '--'));
    for (let i = currentYear; i >= 1900; i--) {
        yearFrom.add(createOpt(i, i));
        yearTo.add(createOpt(i, i));
    }
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
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

async function initShowcase() {
    let movies = await getMovies();
    if (movies.length < 5) {
        alert("Found too few results. Try broadening your filters!");
        return;
    }

    const p = {
        c: document.getElementById('current-movie-poster'),
        l: document.getElementById('left-movie-poster'),
        r: document.getElementById('right-movie-poster'),
        lm: document.getElementById('leftmost-movie-poster'),
        rm: document.getElementById('rightmost-movie-poster')
    };
    const titleContainer = document.getElementById('movie-title');
    let idx = 0;

    const render = (i) => {
        const movieAt = (off) => movies[(i + off + movies.length) % movies.length];
        const path = (m) => m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        const current = movieAt(0);
        const name = current.title || current.name;
        const dateStr = current.release_date || current.first_air_date || "";
        const year = dateStr ? `(${dateStr.split('-')[0]})` : "";

        // Applying the bold/not-bold formatting
        titleContainer.innerHTML = `${name} <span class="year-text">${year}</span>`;

        p.c.src = path(current);
        p.l.src = path(movieAt(-1));
        p.r.src = path(movieAt(1));
        p.lm.src = path(movieAt(-2));
        p.rm.src = path(movieAt(2));
    };

    let timer;
    let speed = 80;

    const spin = (duration) => {
        clearInterval(timer);
        timer = setInterval(() => {
            idx = (idx + 1) % movies.length;
            render(idx);
        }, speed);

        setTimeout(() => {
            if (speed < 600) {
                speed += 130;
                spin(400);
            } else {
                clearInterval(timer);
            }
        }, duration);
    };

    document.getElementById('spin-button').onclick = () => {
        speed = 80;
        shuffle(movies);
        spin(2000);
    };

    render(idx);
}

document.addEventListener('DOMContentLoaded', () => {
    populateYearDropdowns();
    populateGenreFilter();
    initShowcase();
});

document.getElementById('apply-filters').onclick = initShowcase;