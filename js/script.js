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

    // Add default option for both dropdowns
    const defaultOption = document.createElement('option');
    defaultOption.text = '--';
    defaultOption.value = '';
    yearFromSelect.add(defaultOption);
    yearToSelect.add(defaultOption.cloneNode(true));

    // Populate the options for selecting years
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
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&primary_release_date.gte=${yearFrom}-01-01&primary_release_date.lte=${yearTo}-12-31${genreQuery}`);
    const data = await response.json();
    return data.results;
}

// Display movies in the container
async function displayMovies() {
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const selectedGenres = Array.from(document.querySelectorAll('#genre-filter input:checked')).map(input => input.value);
    const movies = await fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres);

    const movieContainer = document.querySelector('.movie-container');
    movieContainer.innerHTML = ''; // Clear the container

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('movie-item');
        movieItem.innerHTML = `
            <div class="loading-placeholder">Loading...</div>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" style="display: none;">
        `;

        const img = movieItem.querySelector('img');
        img.onload = () => {
            movieItem.querySelector('.loading-placeholder').style.display = 'none';
            img.style.display = 'block';
        };

        movieContainer.appendChild(movieItem);
    });
}

// Show pop-up with movie details
function showPopup(movieItem) {
    const popup = document.querySelector('.popup');
    const movieTitle = movieItem.querySelector('img').alt;
    const moviePoster = movieItem.querySelector('img').src;

    popup.innerHTML = `
        <h2>${movieTitle}</h2>
        <img src="${moviePoster}" alt="${movieTitle}">
        <button id="close-popup">Close</button>
    `;

    popup.style.display = 'flex';

    document.getElementById('close-popup').addEventListener('click', function() {
        popup.style.display = 'none';
    });
}

// Spin the movie posters
document.getElementById('spin-button').addEventListener('click', async function(event) {
    event.preventDefault();

    await displayMovies(); // Fetch new movies on each spin

    const movieContainer = document.querySelector('.movie-container');
    const movieItems = document.querySelectorAll('.movie-item');
    const numItems = movieItems.length;
    let currentIndex = 0;

    // Function to animate the spin
    function animateSpin(duration) {
        const startTime = performance.now();

        function spin(time) {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);

            currentIndex = Math.floor(easedProgress * numItems);

            movieItems.forEach((item, index) => {
                item.style.display = index === currentIndex ? 'block' : 'none';
            });

            if (progress < 1) {
                requestAnimationFrame(spin);
            } else {
                showPopup(movieItems[currentIndex]);
            }
        }

        requestAnimationFrame(spin);
    }

    // Easing function for smooth animation
    function easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    }

    animateSpin(5000); // 5 seconds duration
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');
    document.body.appendChild(popupContainer);

    populateYearDropdowns(); // Populate the year dropdowns
    populateGenreFilter(); // Populate the genre filter
    displayMovies(); // Display movies initially
});

// Toggle genre filter visibility
document.getElementById('toggle-genre-filter').addEventListener('click', function() {
    const genreFilter = document.getElementById('genre-filter');
    genreFilter.style.display = genreFilter.style.display === 'none' ? 'flex' : 'none';
});

// Apply filters
document.getElementById('apply-filters').addEventListener('click', displayMovies);
