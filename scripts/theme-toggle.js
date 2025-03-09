const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
let cantoggle = true;

toggleButton.addEventListener('click', () => {
    toggleButton.classList.add('clicked');
    setTimeout(() => {
        toggleButton.classList.remove('clicked');
    }, 100);
    setTimeout(() => {
        toggleButton.classList.remove('hover');
    }, 160);

    cantoggle = false;
});

toggleButton.addEventListener('mouseover', () => {
    toggleButton.classList.add('hover');

    if(cantoggle) {
        body.classList.toggle('dark-mode');
        toggleButton.textContent = body.classList.contains('dark-mode') ? '🌚' : '🌞';
    }
});

toggleButton.addEventListener('mouseout', () => {    
    if(cantoggle) {
        body.classList.toggle('dark-mode');
        toggleButton.textContent = body.classList.contains('dark-mode') ? '🌚' : '🌞';
    }

    setTimeout(() => {
        toggleButton.classList.remove('hover');
    }, 100);

    cantoggle = true;
}); 