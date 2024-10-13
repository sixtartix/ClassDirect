document.addEventListener('DOMContentLoaded', () => {
    const studentNamesTextarea = document.getElementById('student-names');
    const groupSizeInput = document.getElementById('group-size');
    const generateButton = document.getElementById('generate-groups');
    const groupsOutput = document.getElementById('groups-output');
    const resetButton = document.getElementById('reset-groups');
    const importButton = document.getElementById('import-names');

    if (!studentNamesTextarea || !groupSizeInput || !generateButton || !groupsOutput || !importButton) {
        console.error('Un ou plusieurs éléments HTML nécessaires sont manquants.');
        return;
    }

    generateButton.addEventListener('click', generateGroups);
    if (resetButton) resetButton.addEventListener('click', resetGroups);
    importButton.addEventListener('click', importNames);

    loadAndSyncStudentNames();
    loadSavedGroups();

    function loadAndSyncStudentNames() {
        const savedStudentNames = localStorage.getItem('sharedStudentNames');
        if (savedStudentNames) {
            studentNamesTextarea.value = savedStudentNames;
        }
        studentNamesTextarea.addEventListener('input', () => {
            localStorage.setItem('sharedStudentNames', studentNamesTextarea.value);
        });
    }

    function loadSavedGroups() {
        const savedGroups = localStorage.getItem('savedGroups');
        if (savedGroups) {
            displayGroups(JSON.parse(savedGroups));
        }
    }

    function generateGroups() {
        const studentNames = studentNamesTextarea.value
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
        const numberOfGroups = Math.max(2, parseInt(groupSizeInput.value) || 2);
    
        if (studentNames.length === 0) {
            alert('Veuillez entrer des noms d\'élèves.');
            return;
        }
    
        console.log(`Générant ${numberOfGroups} groupes pour ${studentNames.length} élèves.`);
    
        localStorage.setItem('sharedStudentNames', studentNames.join('\n'));
    
        const shuffledNames = shuffleArray([...studentNames]);
        const groups = Array.from({ length: numberOfGroups }, () => []);
    
        shuffledNames.forEach((name, index) => {
            groups[index % numberOfGroups].push(name);
        });
    
        console.log(`${groups.length} groupes générés.`);
    
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
        if (resetButton) resetButton.style.display = 'block';
    }

    function resetGroups() {
        localStorage.removeItem('savedGroups');
        groupsOutput.innerHTML = '';
        if (resetButton) resetButton.style.display = 'none';
    }

    let fileInput = null;

    function importNames() {
        if (fileInput) {
            document.body.removeChild(fileInput);
        }
        
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.json';
        fileInput.style.display = 'none';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const content = e.target.result;
                        let names;
                        if (file.name.endsWith('.json')) {
                            const data = JSON.parse(content);
                            names = data.sharedStudentNames || '';
                        } else {
                            names = content;
                        }
                        studentNamesTextarea.value = names;
                        localStorage.setItem('sharedStudentNames', names);
                        alert('Noms d\'élèves importés avec succès.');
                    } catch (error) {
                        console.error('Erreur lors de l\'importation:', error);
                        alert('Erreur lors de l\'importation des noms d\'élèves.');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
    }
});