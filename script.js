const body = document.body;
const themeSwitch = document.getElementById("theme-switch");
const mobileMenu = document.getElementById("mobile-menu");
const navMenu = document.querySelector(".nav-menu");

// Fonction pour basculer le thème
function toggleTheme() {
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Initialisation du thème
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        themeSwitch.checked = savedTheme === 'dark';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    }
}

// Gestion du menu mobile
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Écouteurs d'événements
themeSwitch.addEventListener('change', toggleTheme);
mobileMenu.addEventListener('click', toggleMobileMenu);

// Initialisation
document.addEventListener('DOMContentLoaded', initTheme);

// Code spécifique au timer (si on est sur la page timer.html)
if (document.querySelector('.timer-container')) {
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference;

    const timerText = document.getElementById("timer-text");
    const startStopBtn = document.getElementById("start-stop-btn");
    const resetBtn = document.getElementById("reset-btn");

    const hoursInput = document.getElementById("hours-input");
    const minutesInput = document.getElementById("minutes-input");
    const secondsInput = document.getElementById("seconds-input");

    let totalTime = 0;
    let elapsedTime = 0;
    let interval;
    let isRunning = false;

// Theme toggle
themeSwitch.addEventListener('change', () => {
    document.body.setAttribute('data-theme', themeSwitch.checked ? 'dark' : 'light');
});

// Start/Stop button event
startStopBtn.addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
    } else {
        setTimeFromInputs();
        startTimer();
    }
});

resetBtn.addEventListener('click', resetTimer);

function setTimeFromInputs() {
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    totalTime = (hours * 3600) + (minutes * 60) + seconds;
    displayTime(totalTime);
}

function startTimer() {
    if (totalTime > 0) {
        isRunning = true;
        startStopBtn.textContent = "Arrêter";
        startStopBtn.classList.add('running');
        interval = setInterval(() => {
            if (elapsedTime < totalTime) {
                elapsedTime++;
                updateProgress();
            } else {
                stopTimer();
                animateCompletion();
            }
        }, 1000);
    }
}

function stopTimer() {
    clearInterval(interval);
    isRunning = false;
    startStopBtn.textContent = "Démarrer";
    startStopBtn.classList.remove('running');
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateProgress();
    displayTime(totalTime);
    hoursInput.value = '';
    minutesInput.value = '';
    secondsInput.value = '';
    circle.style.stroke = getComputedStyle(document.body).getPropertyValue('--ring-color');
}

function updateProgress() {
    const progress = (elapsedTime / totalTime) * circumference;
    circle.style.strokeDashoffset = circumference - progress;

    displayTime(totalTime - elapsedTime);
    
    // Color change logic
    const ratio = elapsedTime / totalTime;
    if (ratio <= 0.33) {
        circle.style.stroke = 'green';
    } else if (ratio <= 0.66) {
        circle.style.stroke = 'yellow';
    } else {
        circle.style.stroke = 'red';
    }
}

function displayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    timerText.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function animateCompletion() {
    circle.style.animation = 'pulse 0.5s ease-in-out 3';
    setTimeout(() => {
        circle.style.animation = '';
    }, 1500);
}

// Add this to your CSS
const style = document.createElement('style');
style.textContent = `
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}
`;
document.head.appendChild(style);
}
