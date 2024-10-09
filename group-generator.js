// Fichier group-generator.js
document.addEventListener('DOMContentLoaded', () => {
    const studentNamesTextarea = document.getElementById('student-names');
    const groupSizeInput = document.getElementById('group-size');
    const generateButton = document.getElementById('generate-groups');
    const groupsOutput = document.getElementById('groups-output');
    const resetButton = document.getElementById('reset-groups');

    generateButton.addEventListener('click', generateGroups);
    resetButton.addEventListener('click', resetGroups);

    // Charger les noms d'étudiants sauvegardés
    const savedStudentNames = localStorage.getItem('studentNames');
    if (savedStudentNames) {
        studentNamesTextarea.value = savedStudentNames;
    }

    // Charger les groupes sauvegardés
    const savedGroups = localStorage.getItem('savedGroups');
    if (savedGroups) {
        displayGroups(JSON.parse(savedGroups));
    }

    function generateGroups() {
        const studentNames = studentNamesTextarea.value.split('\n').filter(name => name.trim() !== '');
        const groupSize = parseInt(groupSizeInput.value);

        if (studentNames.length === 0 || isNaN(groupSize) || groupSize < 2) {
            alert('Veuillez entrer des noms d\'élèves et une taille de groupe valide (minimum 2).');
            return;
        }

        // Sauvegarder les noms d'étudiants
        localStorage.setItem('studentNames', studentNamesTextarea.value);

        const shuffledNames = shuffleArray(studentNames);
        const groups = [];

        for (let i = 0; i < shuffledNames.length; i += groupSize) {
            groups.push(shuffledNames.slice(i, i + groupSize));
        }

        // Sauvegarder les groupes
        localStorage.setItem('savedGroups', JSON.stringify(groups));

        displayGroups(groups);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayGroups(groups) {
        groupsOutput.innerHTML = '';
        groups.forEach((group, index) => {
            const groupElement = document.createElement('div');
            groupElement.classList.add('group');
            groupElement.innerHTML = `
                <h3>Groupe ${index + 1}</h3>
                <ul>
                    ${group.map(student => `<li>${student}</li>`).join('')}
                </ul>
            `;
            groupsOutput.appendChild(groupElement);
        });
        resetButton.style.display = 'block';
    }

    function resetGroups() {
        localStorage.removeItem('savedGroups');
        groupsOutput.innerHTML = '';
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