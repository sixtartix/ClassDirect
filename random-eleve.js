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

    // Charger et synchroniser les noms d'étudiants
    loadAndSyncStudentNames();

    // Vérifier périodiquement les mises à jour
    setInterval(loadAndSyncStudentNames, 5000); // Vérifie toutes les 5 secondes

    function loadAndSyncStudentNames() {
        const savedStudentNames = localStorage.getItem('sharedStudentNames');
        if (savedStudentNames && savedStudentNames !== studentNamesTextarea.value) {
            studentNamesTextarea.value = savedStudentNames;
        } else if (studentNamesTextarea.value && !savedStudentNames) {
            // Si le textarea a des noms mais le localStorage est vide, on sauvegarde
            localStorage.setItem('sharedStudentNames', studentNamesTextarea.value);
        }
    }

    function selectRandomStudent() {
        const studentNames = studentNamesTextarea.value.split('\n').filter(name => name.trim() !== '');

        if (studentNames.length === 0) {
            alert('Veuillez entrer des noms d\'élèves.');
            return;
        }

        // Sauvegarder les noms d'étudiants
        localStorage.setItem('sharedStudentNames', studentNamesTextarea.value);

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

    // Ajouter un écouteur d'événements pour mettre à jour le stockage local lorsque le contenu change
    studentNamesTextarea.addEventListener('input', () => {
        localStorage.setItem('sharedStudentNames', studentNamesTextarea.value);
    });

    // Ajouter un écouteur d'événements pour le focus
    studentNamesTextarea.addEventListener('focus', loadAndSyncStudentNames);
});

