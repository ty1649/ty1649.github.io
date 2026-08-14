const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
let cantoggle = true;

// Initialize theme from localStorage on page load, falling back to the
// visitor's OS-level preference when no saved choice exists yet.
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const useDark = savedTheme ? savedTheme === 'dark' : prefersDark;

if (useDark) {
    body.classList.add('dark-mode');
    toggleButton.textContent = '🌚';
} else {
    toggleButton.textContent = '🌞';
}

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
        // Save theme preference
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    }
});

toggleButton.addEventListener('mouseout', () => {    
    if(cantoggle) {
        body.classList.toggle('dark-mode');
        toggleButton.textContent = body.classList.contains('dark-mode') ? '🌚' : '🌞';
        // Save theme preference
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    }

    setTimeout(() => {
        toggleButton.classList.remove('hover');
    }, 100);

    cantoggle = true;
}); 