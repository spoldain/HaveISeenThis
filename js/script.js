import { apiKey } from './apikey.js';

let spinning = false;

// Function to generate a range of years dynamically
function generateYears() {
    const startYear = 1900;
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
    }

    return years;
}

// Fetch genres from TMDB API
async function fetchGenres() {
    const genreResponse = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
    const genreData = await genreResponse.json();
    return genreData.genres;
}

function populateFilterOptions(genres, years) {
    const yearFilter = document.getElementById('year-filter');
    const genreFilter = document.getElementById('genre-filter');

    years.forEach(year => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = year;
        checkbox.id = `year-${year}`;
        const label = document.createElement('label');
        label.htmlFor = `year-${year}`;
        label.textContent = year;
        yearFilter.appendChild(checkbox);
        yearFilter.appendChild(label);
    });

    genres.forEach(genre => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = genre.id;
        checkbox.id = `genre-${genre.id}`;
        const label = document.createElement('label');
        label.htmlFor = `genre-${genre.id}`;
        label.textContent = genre.name;
        genreFilter.appendChild(checkbox);
        genreFilter.appendChild(label);
    });
}

function getSelectedFilters() {
    const selectedYears = Array.from(document.querySelectorAll('#year-filter input:checked')).map(input => input.value);
    const selectedGenres = Array.from(document.querySelectorAll('#genre-filter input:checked')).map(input => input.value);
    return { selectedYears, selectedGenres };
}

function fetchFilteredMovies(selectedYears, selectedGenres) {
    const yearQuery = selectedYears.length ? `&primary_release_year=${selectedYears.join('|')}` : '';
    const genreQuery = selectedGenres.length ? `&with_genres=${selectedGenres.join(',')}` : '';
    const randomPage = Math.floor(Math.random() * 500) + 1; // Random page number between 1 and 500

    return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&page=${randomPage}${yearQuery}${genreQuery}`)
        .then(response => response.json())
        .then(data => data.results.slice(0, 100));
}

function displayMoviesInWheel(movies) {
    const wheel = document.querySelector('.wheel');
    wheel.innerHTML = ''; // Clear previous movies

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('wheel-item');

        const image = new Image();
        image.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        image.alt = movie.title;
        image.classList.add('movie-poster');
        image.onload = () => {
            movieItem.removeChild(loadingPlaceholder); // Remove loading placeholder when image loads
        };

        const loadingPlaceholder = document.createElement('div');
        loadingPlaceholder.classList.add('loading-placeholder');
        loadingPlaceholder.textContent = 'Loading...';

        movieItem.appendChild(image);
        movieItem.appendChild(loadingPlaceholder);
        wheel.appendChild(movieItem);
    });
}

function spinWheel() {
    const wheel = document.querySelector('.wheel');
    const wheelItems = document.querySelectorAll('.wheel-item');
    const itemWidth = wheelItems[0].offsetWidth;
    const numItems = wheelItems.length;

    // Generate a random number of spins
    const spins = Math.floor(Math.random() * numItems * 2) + numItems;

    // Calculate the final position
    const finalPosition = spins * itemWidth;

    wheel.style.transition = 'transform 5s ease-out';
    wheel.style.transform = `translateX(-${finalPosition}px)`;

    // Reset after the spin completes
    setTimeout(() => {
        wheel.style.transition = 'none';
        wheel.style.transform = 'translateX(0)';

        // Move items that are out of view back to the end
        for (let i = 0; i < spins; i++) {
            wheel.appendChild(wheel.firstElementChild);
        }

        // Allow new spins
        spinning = false;
    }, 5000); // Match the duration with the transition
}

document.addEventListener('DOMContentLoaded', async function () {
    const genres = await fetchGenres();
    const years = generateYears();
    populateFilterOptions(genres, years);

    document.getElementById('spin-button').addEventListener('click', function () {
        if (spinning) {
            return; // Prevent further spins while already spinning
        }

        spinning = true; // Set spinning to true to indicate that the wheel is spinning

        const { selectedYears, selectedGenres } = getSelectedFilters();

        fetchFilteredMovies(selectedYears, selectedGenres).then(movies => {
            displayMoviesInWheel(movies);
            spinWheel();
        });
    });

    document.getElementById('apply-filters').addEventListener('click', function () {
        if (spinning) {
            return; // Prevent applying filters while already spinning
        }

        const { selectedYears, selectedGenres } = getSelectedFilters();

        fetchFilteredMovies(selectedYears, selectedGenres).then(movies => {
            displayMoviesInWheel(movies);
        });
    });

    // Initial fetch and display movies
    fetchFilteredMovies([], []).then(movies => {
        displayMoviesInWheel(movies);
    });
});
