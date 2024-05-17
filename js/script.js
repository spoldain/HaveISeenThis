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
        label.for = checkbox.id;
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
    const numVisibleMovies = 5;
    const numMoviesToFetch = numVisibleMovies * 5;
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&primary_release_date.gte=${yearFrom}-01-01&primary_release_date.lte=${yearTo}-12-31${genreQuery}`);
    const data = await response.json();
    return data.results;
}

// Fetch and display movies in the box
async function displayMovies() {
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const selectedGenres = Array.from(document.querySelectorAll('#genre-filter input:checked')).map(input => input.value);
    const movies = await fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres);

    const movieDisplay = document.querySelector('.movie-display');
    movieDisplay.innerHTML = ''; // Clear the display

    movies.forEach(movie => {
        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        img.alt = movie.title;
        img.classList.add('movie-poster');
        movieDisplay.appendChild(img);
    });
}

// Show pop-up with movie details
function showPopup(moviePoster) {
    const popup = document.querySelector('.popup');
    const movieTitle = moviePoster.alt;
    const moviePosterSrc = moviePoster.src;

    popup.innerHTML = `
        <h2>${movieTitle}</h2>
        <img src="${moviePosterSrc}" alt="${movieTitle}">
        <button id="close-popup">Close</button>
    `;

    popup.style.display = 'flex';

    document.getElementById('close-popup').addEventListener('click', function() {
        popup.style.display = 'none';
    });
}

// Spin the posters and gradually slow down
document.getElementById('spin-button').addEventListener('click', async function(event) {
    event.preventDefault(); // Prevent the default action

    await displayMovies(); // Fetch new movies on each spin

    const moviePosters = document.querySelectorAll('.movie-poster');
    const numPosters = moviePosters.length;
    let startTime;
    let duration = 5000; // Total duration of the spin in milliseconds
    let lastPosterIndex = 0;

    function animateSpin(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // Calculate the progress (from 0 to 1)
        const progress = Math.min(elapsed / duration, 1);

        // Calculate the current index of the movie poster
        const currentIndex = Math.floor((progress * numPosters) % numPosters);

        // If the index has changed, update the displayed poster
        if (currentIndex !== lastPosterIndex) {
            lastPosterIndex = currentIndex;
            moviePosters.forEach((poster, index) => {
                poster.style.display = index === currentIndex ? 'block' : 'none';
            });
        }

        // If not reached the end of the duration, continue spinning
        if (elapsed < duration) {
            requestAnimationFrame(animateSpin);
        } else {
            // Animation finished, show the selected movie
            const selectedPoster = moviePosters[lastPosterIndex];
            showPopup(selectedPoster);
        }
    }

    // Start the animation
    requestAnimationFrame(animateSpin);
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
