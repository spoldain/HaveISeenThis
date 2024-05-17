window.history.scrollRestoration = 'manual';

import { apiKey } from './apikey.js';

// Fetch genres from the MovieDB API
async function fetchGenres() {
    const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const data = await response.json();
    return data.genres;
}

// Populate the genre filter with options
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

// Populate the year dropdowns with options
function populateYearDropdowns() {
    const yearFromSelect = document.getElementById('year-from');
    const yearToSelect = document.getElementById('year-to');
    const currentYear = new Date().getFullYear();

    const defaultOption = document.createElement('option');
    defaultOption.text = '--';
    defaultOption.value = '';
    yearFromSelect.add(defaultOption);
    yearToSelect.add(defaultOption.cloneNode(true));

    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.text = year;
        option.value = year;
        yearFromSelect.add(option);
        yearToSelect.add(option.cloneNode(true));
    }
}

// Fetch movies based on filters
async function fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres) {
    const genreQuery = selectedGenres.length ? `&with_genres=${selectedGenres.join(',')}` : '';
    const yearQuery = (yearFrom && yearTo) ? `&primary_release_date.gte=${yearFrom}-01-01&primary_release_date.lte=${yearTo}-12-31` : '';
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false${yearQuery}${genreQuery}`);
    const data = await response.json();
    return data.results;
}

// Display movie posters and title
async function displayMovies() {
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const selectedGenres = Array.from(document.querySelectorAll('#genre-filter input:checked')).map(input => input.value);
    const movies = await fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres);

    if (movies.length === 0) {
        alert('No movies found with the selected filters.');
        return;
    }

    const currentPoster = document.getElementById('current-movie-poster');
    const leftPoster = document.getElementById('left-movie-poster');
    const rightPoster = document.getElementById('right-movie-poster');
    const leftmostPoster = document.getElementById('leftmost-movie-poster');
    const rightmostPoster = document.getElementById('rightmost-movie-poster');
    const movieTitle = document.getElementById('movie-title');

    let currentIndex = 0;

    function showMovie(index) {
        currentPoster.src = `https://image.tmdb.org/t/p/w500${movies[index].poster_path}`;
        currentPoster.alt = movies[index].title;
        movieTitle.textContent = movies[index].title;

        leftPoster.src = `https://image.tmdb.org/t/p/w500${movies[(index - 1 + movies.length) % movies.length].poster_path}`;
        leftPoster.alt = movies[(index - 1 + movies.length) % movies.length].title;

        rightPoster.src = `https://image.tmdb.org/t/p/w500${movies[(index + 1) % movies.length].poster_path}`;
        rightPoster.alt = movies[(index + 1) % movies.length].title;

        leftmostPoster.src = `https://image.tmdb.org/t/p/w500${movies[(index - 2 + movies.length) % movies.length].poster_path}`;
        leftmostPoster.alt = movies[(index - 2 + movies.length) % movies.length].title;

        rightmostPoster.src = `https://image.tmdb.org/t/p/w500${movies[(index + 2) % movies.length].poster_path}`;
        rightmostPoster.alt = movies[(index + 2) % movies.length].title;
    }

    let intervalId;
    let interval = 100;

    function spinMovies() {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % movies.length;
            showMovie(currentIndex);
        }, interval);
    }

    document.getElementById('spin-button').addEventListener('click', function () {
        currentIndex = 0;
        interval = 100;
        spinMovies();

        setTimeout(() => {
            clearInterval(intervalId);
            let slowdownIntervalId = setInterval(() => {
                if (interval < 1000) {
                    interval += 100;
                    spinMovies();
                } else {
                    clearInterval(slowdownIntervalId);
                }
            }, 500);
        }, 2000);
    });

    showMovie(currentIndex);
}

// Show pop-up with movie details
function showPopup(movie) {
    const popup = document.querySelector('.popup');
    const movieTitle = movie.title;
    const moviePoster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    popup.innerHTML = `
        <h2>${movieTitle}</h2>
        <img src="${moviePoster}" alt="${movieTitle}">
        <button id="close-popup">Close</button>
    `;

    popup.style.display = 'flex';

    document.getElementById('close-popup').addEventListener('click', function () {
        popup.style.display = 'none';
    });
}

// Initial setup
document.addEventListener('DOMContentLoaded', function () {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');
    document.body.appendChild(popupContainer);

    populateYearDropdowns();
    populateGenreFilter();
    displayMovies();
});

// Toggle genre filter visibility
document.getElementById('toggle-genre-filter').addEventListener('click', function () {
    const genreFilter = document.getElementById('genre-filter');
    genreFilter.style.display = genreFilter.style.display === 'none' ? 'flex' : 'none';
});

// Apply filters
document.getElementById('apply-filters').addEventListener('click', displayMovies);
