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

// Fetch and display movies in the wheel
async function displayMoviesInWheel() {
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const selectedGenres = Array.from(document.querySelectorAll('#genre-filter input:checked')).map(input => input.value);
    const movies = await fetchMoviesWithFilters(yearFrom, yearTo, selectedGenres);

    const wheel = document.querySelector('.wheel');
    wheel.innerHTML = ''; // Clear the wheel

    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.classList.add('wheel-item');
        movieItem.innerHTML = `
            <div class="loading-placeholder">Loading...</div>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" style="display: none;">
        `;

        const img = movieItem.querySelector('img');
        img.onload = () => {
            movieItem.querySelector('.loading-placeholder').style.display = 'none';
            img.style.display = 'block';
        };

        wheel.appendChild(movieItem);
        console.log("added movie:", movie.title);
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
        <div id="expanded-info" style="display: none;">
          <h3>${movieTitle} (from showPopup)</h3> <p id="movie-description"></p>
          <a id="trailer-link" href="#">Trailer</a>
        </div>
      `;

    popup.style.display = 'flex';

    document.getElementById('close-popup').addEventListener('click', function() {
        popup.style.display = 'none';
    });

    const moreInfoBtn = document.createElement('button');
    moreInfoBtn.id = 'more-info-btn';
    moreInfoBtn.textContent = 'More Info';
    popup.appendChild(moreInfoBtn);

     moreInfoBtn.addEventListener('click', () => {
    // Code to handle "More Info" button click (explained later)
  });

  moreInfoBtn.addEventListener('click', () => {
  const expandedInfo = document.getElementById('expanded-info');
  expandedInfo.style.display = expandedInfo.style.display === 'none' ? 'flex' : 'none';
  moreInfoBtn.textContent = expandedInfo.style.display === 'none' ? 'More Info' : 'Less Info';
  fetchMovieDetails(movieTitle); // Call function to fetch details on button click
});
}

async function fetchMovieDetails(movieTitle) {
  const response = await fetch(`https://api.example.com/movies/${movieTitle}`);
  const data = await response.json();

  // Extract movie description and trailer link from data
  const description = data.description;
  const trailerLink = data.trailer_url || '#'; // Handle missing trailer links

  // Update elements in the expanded info section (explained later)
    document.getElementById('expanded-info').querySelector('h3').textContent = movieTitle;
    document.getElementById('movie-description').textContent = description;
    document.getElementById('trailer-link').href = trailerLink;
}

// Spin the wheel and show pop-up
document.getElementById('spin-button').addEventListener('click', async function(event) {

    event.preventDefault(); // Add this line to prevent the default action

    await displayMoviesInWheel(); // Fetch new movies on each spin

    const wheel = document.querySelector('.wheel');
    const wheelItems = document.querySelectorAll('.wheel-item');
    const itemWidth = wheelItems[0].offsetWidth;
    const numItems = wheelItems.length;

    // Generate a random number of spins
    const spins = Math.floor(Math.random() * numItems * 2) + numItems;

    // Calculate the final position
    const finalPosition = spins * itemWidth;

    // Set the transform property to spin the wheel
    wheel.style.transition = 'transform 4s ease-out';
    wheel.style.transform = `translateX(-${finalPosition}px)`;

    // Detect when spinning stops
    setTimeout(() => {
        // Calculate the movie under the indicator
        const finalIndex = (spins % numItems);
        const selectedMovie = wheelItems[finalIndex];

        // Show the pop-up with movie details
        showPopup(selectedMovie);
    }, 4000); // Match this time with the transition duration

    // Reset the position after spin
    setTimeout(() => {
        wheel.style.transition = 'none';
        wheel.style.transform = `translateX(-${(finalPosition % (numItems * itemWidth))}px)`;
        setTimeout(() => {
            wheel.style.transition = 'transform 4s ease-out';
        }, 50);
    }, 4500); // Slightly more than the spinning duration
});

document.addEventListener('DOMContentLoaded', function() {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');
    document.body.appendChild(popupContainer);

    populateYearDropdowns(); // Populate the year dropdowns
    populateGenreFilter(); // Populate the genre filter
    displayMoviesInWheel(); // Populate the wheel container
});

// Toggle genre filter visibility
document.getElementById('toggle-genre-filter').addEventListener('click', function() {
    const genreFilter = document.getElementById('genre-filter');
    genreFilter.style.display = genreFilter.style.display === 'none' ? 'flex' : 'none';
});

// Apply filters
document.getElementById('apply-filters').addEventListener('click', displayMoviesInWheel);
