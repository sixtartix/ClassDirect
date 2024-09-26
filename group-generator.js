// Fichier group-generator.js
document.addEventListener('DOMContentLoaded', () => {
    const studentNamesTextarea = document.getElementById('student-names');
    const groupSizeInput = document.getElementById('group-size');
    const generateButton = document.getElementById('generate-groups');
    const groupsOutput = document.getElementById('groups-output');

    generateButton.addEventListener('click', generateGroups);

    function generateGroups() {
        const studentNames = studentNamesTextarea.value.split('\n').filter(name => name.trim() !== '');
        const groupSize = parseInt(groupSizeInput.value);

        if (studentNames.length === 0 || isNaN(groupSize) || groupSize < 2) {
            alert('Veuillez entrer des noms d\'élèves et une taille de groupe valide (minimum 2).');
            return;
        }

        const shuffledNames = shuffleArray(studentNames);
        const groups = [];

        for (let i = 0; i < shuffledNames.length; i += groupSize) {
            groups.push(shuffledNames.slice(i, i + groupSize));
        }

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
    }
});