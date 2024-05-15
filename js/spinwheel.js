 document.getElementById('spin-button').addEventListener('click', function() {
    const wheel = document.querySelector('.wheel');
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
