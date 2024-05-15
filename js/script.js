// script.js
import { apiKey } from './apikey.js';

// Your script using apiKey

function fetchRandomMovies() {
const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${Math.floor(Math.random() * 500) + 1}`;

return fetch(url)
.then(response => {
if (!response.ok) {
throw new Error('Network response was not ok ' + response.statusText);
}
return response.json();
})
.then(data => {
return data.results.slice(0, 10); // Get first 10 popular movies from the fetched page
})
.catch(error => {
console.error('There was a problem with the fetch operation:', error);
});
}

document.addEventListener('DOMContentLoaded', function() {
fetchRandomMovies().then(movies => {
const wheel = document.querySelector('.wheel');
movies.forEach(movie => {
const movieItem = document.createElement('div');
movieItem.classList.add('wheel-item');
movieItem.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">`;
wheel.appendChild(movieItem);
});
});
});

document.getElementById('spin-button').addEventListener('click', function() {
fetchRandomMovies().then(movies => {
const wheel = document.querySelector('.wheel');
wheel.innerHTML = ''; // Clear previous items

movies.forEach(movie => {
const movieItem = document.createElement('div');
movieItem.classList.add('wheel-item');
movieItem.innerHTML = `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">`;
wheel.appendChild(movieItem);
});

const wheelItems = document.querySelectorAll('.wheel-item');
const itemWidth = wheelItems[0].offsetWidth;
const numItems = wheelItems.length;

// Generate a random number of spins
const spins = Math.floor(Math.random() * numItems * 2) + numItems;

// Calculate the final position
const finalPosition = spins * itemWidth;

// Set the transform property to spin the wheel
wheel.style.transform = `translateX(-${finalPosition}px)`;

// Optional: Add a reset after spin completes
setTimeout(() => {
wheel.style.transition = 'none';
wheel.style.transform = `translateX(-${finalPosition % (numItems * itemWidth)}px)`;
setTimeout(() => {
wheel.style.transition = 'transform 1s ease-out';
}, 50);
}, 1000);
});
});