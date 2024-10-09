// Fichier random-student-selector.js
document.addEventListener('DOMContentLoaded', () => {
    const studentNamesTextarea = document.getElementById('student-names');
    const selectButton = document.getElementById('select-student');
    const selectedStudentOutput = document.getElementById('selected-student');
    const resetButton = document.getElementById('reset-selection');
    const noDuplicatesCheckbox = document.getElementById('no-duplicates');

    let selectedStudents = [];

    selectButton.addEventListener('click', selectRandomStudent);
    resetButton.addEventListener('click', resetSelection);

    // Charger les noms d'étudiants sauvegardés
    const savedStudentNames = localStorage.getItem('studentNames');
    if (savedStudentNames) {
        studentNamesTextarea.value = savedStudentNames;
    }

    function selectRandomStudent() {
        const studentNames = studentNamesTextarea.value.split('\n').filter(name => name.trim() !== '');

        if (studentNames.length === 0) {
            alert('Veuillez entrer des noms d\'élèves.');
            return;
        }

        // Sauvegarder les noms d'étudiants
        localStorage.setItem('studentNames', studentNamesTextarea.value);

        let availableStudents = noDuplicatesCheckbox.checked
            ? studentNames.filter(name => !selectedStudents.includes(name))
            : studentNames;

        if (availableStudents.length === 0) {
            alert('Tous les élèves ont été sélectionnés. Réinitialisation de la liste.');
            selectedStudents = [];
            availableStudents = studentNames;
        }

        const randomIndex = Math.floor(Math.random() * availableStudents.length);
        const selectedStudent = availableStudents[randomIndex];

        selectedStudents.push(selectedStudent);
        displaySelectedStudent(selectedStudent);
    }

    function displaySelectedStudent(student) {
        selectedStudentOutput.textContent = student;
        resetButton.style.display = 'inline-block';
    }

    function resetSelection() {
        selectedStudents = [];
        selectedStudentOutput.textContent = '';
        resetButton.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const helpIcon = document.getElementById('help-icon');
    const helpTooltip = document.getElementById('help-tooltip');

    if (helpIcon && helpTooltip) {
        let tooltipTimeout;

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

        // Animation initiale
        setTimeout(() => {
            helpIcon.style.animation = 'none';
        }, 5000);
    }
});
