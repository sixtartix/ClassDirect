/**
 * @typedef {Object} ExternalFunctions
 * @property {function} loadNotes
 * @property {function} loadNote
 */

/** @type {ExternalFunctions} */
const externalFunctions = window;

const body = document.body;
const themeSwitch = document.getElementById("theme-switch");
const mobileMenu = document.getElementById("mobile-menu");
const navMenu = document.querySelector(".nav-menu");

function toggleTheme() {
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

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

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

themeSwitch.addEventListener('change', toggleTheme);
mobileMenu.addEventListener('click', toggleMobileMenu);

document.addEventListener('DOMContentLoaded', initTheme);

// Code pour le timer (si applicable)
if (document.querySelector('.timer-container')) {
    const circle = document.querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;

    const timerText = document.getElementById("timer-text");
    const startStopBtn = document.getElementById("start-stop-btn");
    const resetBtn = document.getElementById("reset-btn");
    const soundToggleBtn = document.getElementById("sound-toggle-btn");

    const hoursInput = document.getElementById("hours-input");
    const minutesInput = document.getElementById("minutes-input");
    const secondsInput = document.getElementById("seconds-input");

    let totalTime = 0;
    let remainingTime = 0;
    let interval;
    let isRunning = false;
    let isSoundEnabled = true;

    startStopBtn.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
        } else {
            setTimeFromInputs();
            startTimer();
        }
    });

    resetBtn.addEventListener('click', resetTimer);
    soundToggleBtn.addEventListener('click', toggleSound);

    function setTimeFromInputs() {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        totalTime = (hours * 3600) + (minutes * 60) + seconds;
        remainingTime = totalTime;
        displayTime(remainingTime);
    }

    function startTimer() {
        if (totalTime > 0) {
            isRunning = true;
            startStopBtn.textContent = "Arrêter";
            startStopBtn.classList.add('running');
            interval = setInterval(() => {
                if (remainingTime > 0) {
                    remainingTime--;
                    updateProgress();
                } else {
                    stopTimer();
                    if (isSoundEnabled) {
                        createAlarmSound();
                    }
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
        remainingTime = 0;
        totalTime = 0;
        updateProgress();
        displayTime(0);
        hoursInput.value = '';
        minutesInput.value = '';
        secondsInput.value = '';
        circle.style.stroke = getComputedStyle(document.body).getPropertyValue('--ring-color');
    }

    function updateProgress() {
        const progress = ((totalTime - remainingTime) / totalTime) * circumference;
        circle.style.strokeDashoffset = circumference - progress;

        displayTime(remainingTime);

        const ratio = remainingTime / totalTime;
        if (ratio > 0.66) {
            circle.style.stroke = 'green';
        } else if (ratio > 0.33) {
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

    function toggleSound() {
        isSoundEnabled = !isSoundEnabled;
        soundToggleBtn.textContent = isSoundEnabled ? '🔊' : '🔇';
    }

    function createAlarmSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // La note A4
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);

        oscillator.start();

        setTimeout(() => {
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            setTimeout(() => oscillator.stop(), 500);
        }, 1000);
    }

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

// Gestion des boutons d'import/export et des infobulles d'aide
document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('export-data');
    const importButton = document.getElementById('import-data');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.accept = '.json,.txt,.pdf,.docx';
    document.body.appendChild(fileInput);

    const helpIcon = document.getElementById('help-icon');
    const helpTooltip = document.getElementById('help-tooltip');

    if (exportButton) {
        exportButton.addEventListener('click', exportData);
    }

    if (importButton) {
        importButton.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
    }

    function exportData() {
        const data = {
            sharedStudentNames: localStorage.getItem('sharedStudentNames'),
            savedGroups: localStorage.getItem('savedGroups'),
            notes: JSON.parse(localStorage.getItem('notes') || '[]')
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'classdirect_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.name.split('.').pop().toLowerCase();
            
            switch (fileType) {
                case 'json':
                    importJSONData(file);
                    break;
                case 'txt':
                    importTextData(file);
                    break;
                case 'pdf':
                    importPDFData(file);
                    break;
                case 'docx':
                    importDOCXData(file);
                    break;
                default:
                    alert('Format de fichier non pris en charge. Veuillez utiliser .json, .txt, .pdf ou .docx');
            }
        }
    }

    function importJSONData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.sharedStudentNames) {
                    localStorage.setItem('sharedStudentNames', data.sharedStudentNames);
                }
                if (data.savedGroups) {
                    localStorage.setItem('savedGroups', data.savedGroups);
                }
                if (data.notes) {
                    localStorage.setItem('notes', JSON.stringify(data.notes));
                }
                alert('Données JSON importées avec succès');
                
                // Rechargement des notes si nous sommes sur la page des notes
                if (window.location.pathname.includes('notes.html')) {
                    if (typeof window.loadNotes === 'function') {
                        window.loadNotes();
                    } else {
                        console.warn('La fonction loadNotes n\'est pas disponible');
                    }
                } else {
                    location.reload();
                }
            } catch (error) {
                alert('Erreur lors de l\'importation des données JSON');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    function importTextData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const names = content.split(/[\n,]+/).map(name => name.trim()).filter(name => name !== '');
            
            if (window.location.pathname.includes('random-eleve.html')) {
                localStorage.setItem('randomStudentNames', JSON.stringify(names));
            } else if (window.location.pathname.includes('group-generator.html')) {
                localStorage.setItem('groupGeneratorNames', JSON.stringify(names));
            }
            
            updateStudentList(names);
            alert('Noms d\'élèves importés avec succès depuis le fichier texte.');
        };
        reader.readAsText(file);
    }

    function importPDFData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);

            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                let numPages = pdf.numPages;
                let pagesPromises = [];

                for (let i = 1; i <= numPages; i++) {
                    pagesPromises.push(pdf.getPage(i).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                            return textContent.items.map(item => item.str).join(' ');
                        });
                    }));
                }

                Promise.all(pagesPromises).then(function(pagesText) {
                    const names = pagesText.join(' ').split(/\s+/).filter(name => name.trim() !== '');
                    if (window.location.pathname.includes('random-eleve.html')) {
                        localStorage.setItem('randomStudentNames', JSON.stringify(names));
                    } else if (window.location.pathname.includes('group-generator.html')) {
                        localStorage.setItem('groupGeneratorNames', JSON.stringify(names));
                    }
                    updateStudentList(names);
                    alert('Noms d\'élèves importés avec succès depuis le fichier PDF.');
                });
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function importDOCXData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const zip = new JSZip(arrayBuffer);
            const doc = new Docxtemplater().loadZip(zip);
            const content = doc.getFullText();
            const names = content.split(/\s+/).filter(name => name.trim() !== '');
            if (window.location.pathname.includes('random-eleve.html')) {
                localStorage.setItem('randomStudentNames', JSON.stringify(names));
            } else if (window.location.pathname.includes('group-generator.html')) {
                localStorage.setItem('groupGeneratorNames', JSON.stringify(names));
            }
            updateStudentList(names);
            alert('Noms d\'élèves importés avec succès depuis le fichier DOCX.');
        };
        reader.readAsArrayBuffer(file);
    }

    function updateStudentList(names) {
        const studentList = document.getElementById('student-names');
        if (studentList) {
            studentList.value = names.join('\n');
        }
    }

    // Gestion de l'infobulle d'aide
    let tooltipTimeout;

    if (helpIcon && helpTooltip) {
        helpIcon.addEventListener('mouseenter', () => {
            clearTimeout(tooltipTimeout);
            helpTooltip.style.display = 'block';
        });

        helpIcon.addEventListener('mouseleave', () => {
            tooltipTimeout = setTimeout(() => {
                helpTooltip.style.display = 'none';
            }, 300);
        });

        helpTooltip.addEventListener('mouseenter', () => {
            clearTimeout(tooltipTimeout);
        });

        helpTooltip.addEventListener('mouseleave', () => {
            tooltipTimeout = setTimeout(() => {
                helpTooltip.style.display = 'none';
            }, 300);
        });
    }
});

document.getElementById('swinging-bell').addEventListener('click', function() {
    // Cache la cloche
    this.style.display = 'none';
    
    // Cache la section "Quoi de neuf"
    document.querySelector('.nouveautes').style.display = 'none';
});

function saveMessageToMemory(message) {
    // Supprime le préfixe "SuperEnseignant:" du message
    const cleanedMessage = message.replace(/^SuperEnseignant:\s*/, '');
    
    // Enregistrez le message nettoyé dans la mémoire
    memory.push(cleanedMessage);
}
