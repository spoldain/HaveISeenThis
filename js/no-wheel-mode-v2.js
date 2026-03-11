window.history.scrollRestoration = 'manual';

import { apiKey } from './apikey.js';

// Fetch genres from the MovieDB API
async function fetchGenres() {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    return data.genres;
}

// Populate the genre filter with modern styling
async function populateGenreFilter() {
    const genres = await fetchGenres();
    const genreFilter = document.getElementById('genre-filter');

    genres.forEach(genre => {
        const genreItem = document.createElement('div');
        genreItem.classList.add('genre-item');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `genre-${genre.id}`;
        checkbox.value = genre.id;

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = genre.name;

        genreItem.appendChild(checkbox);
        genreItem.appendChild(label);
        genreFilter.appendChild(genreItem);
    });
}

function populateYearDropdowns() {
    const yearFromSelect = document.getElementById('year-from');
    const yearToSelect = document.getElementById('year-to');
    const currentYear = new Date().getFullYear();

    const createOption = (val, text) => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.text = text;
        return opt;
    };

    yearFromSelect.add(createOption('', '--'));
    yearToSelect.add(createOption('', '--'));

    for (let year = currentYear; year >= 1900; year--) {
        yearFromSelect.add(createOption(year, year));
        yearToSelect.add(createOption(year, year));
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres, mediaType) {
    const genreQuery = selectedGenres.length ? `&with_genres=${selectedGenres.join(',')}` : '';
    const yearParam = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date';
    const yearQuery = (yearFrom && yearTo) ? `&${yearParam}.gte=${yearFrom}-01-01&${yearParam}.lte=${yearTo}-12-31` : '';
    
    const response = await fetch(`https://api.themoviedb.org/3/discover/${mediaType}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false${yearQuery}${genreQuery}`);
    const data = await response.json();
    return data.results;
}

async function displayMovies() {
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const mediaType = document.getElementById('media-type').value;
    const selectedGenres = Array.from(document.querySelectorAll('#genre-filter input:checked')).map(input => input.value);
    
    const movies = await fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres, mediaType);

    if (movies.length < 5) {
        alert('Please select broader filters. We need at least 5 results to spin!');
        return;
    }

    const posters = {
        current: document.getElementById('current-movie-poster'),
        left: document.getElementById('left-movie-poster'),
        right: document.getElementById('right-movie-poster'),
        leftmost: document.getElementById('leftmost-movie-poster'),
        rightmost: document.getElementById('rightmost-movie-poster')
    };
    const movieTitle = document.getElementById('movie-title');

    let currentIndex = 0;

    function showMovie(index) {
        const getMovie = (offset) => movies[(index + offset + movies.length) % movies.length];
        const getImg = (movie) => movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image';

        posters.current.src = getImg(getMovie(0));
        movieTitle.textContent = getMovie(0).title || getMovie(0).name;

        posters.left.src = getImg(getMovie(-1));
        posters.right.src = getImg(getMovie(1));
        posters.leftmost.src = getImg(getMovie(-2));
        posters.rightmost.src = getImg(getMovie(2));
    }

    let intervalId;
    let speed = 100;

    function runSpin(duration) {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % movies.length;
            showMovie(currentIndex);
        }, speed);

        setTimeout(() => {
            if (speed < 600) {
                speed += 150;
                runSpin(400);
            } else {
                clearInterval(intervalId);
            }
        }, duration);
    }

    document.getElementById('spin-button').onclick = () => {
        speed = 80;
        shuffleArray(movies);
        runSpin(1500);
    };

    showMovie(currentIndex);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    populateYearDropdowns();
    populateGenreFilter();
    displayMovies();
});

// UI Toggles
document.getElementById('toggle-genre-filter').addEventListener('click', function() {
    const filter = document.getElementById('genre-filter');
    filter.style.display = (filter.style.display === 'grid') ? 'none' : 'grid';
});

document.getElementById('apply-filters').addEventListener('click', displayMovies);