import 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

document.addEventListener('DOMContentLoaded', function() {
    let students = [];
    let currentStudentIndex = 0;
    let themes = {
        quantitative: [],
        qualitative: []
    };
    let currentTheme = 'quantitative';
    let evaluationComplete = false;
    let chart = null;
    let isFileDialogOpen = false;

    // Configuration de Gemini
    const API_KEY = "AIzaSyB6C8TuFyQ2kRZMPIwewI3KpDHeYKixuPI";
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    function init() {
        loadDataFromLocalStorage();
        setupEventListeners();
        renderTheme();
        updateStudentDisplay();
        renderStudentList();
        setupAppreciationButton();
        setupFinishButton(); // Ajoutez cet appel
    }

    function loadDataFromLocalStorage() {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            students = JSON.parse(savedStudents);
        } else {
            loadStudents();
        }

        const savedThemes = localStorage.getItem('themes');
        if (savedThemes) {
            themes = JSON.parse(savedThemes);
        }

        const savedCurrentTheme = localStorage.getItem('currentTheme');
        if (savedCurrentTheme) {
            currentTheme = savedCurrentTheme;
        } else {
            currentTheme = 'quantitative'; // Valeur par défaut si non trouvé
        }

        // Mettre à jour la sélection du <select> pour refléter le currentTheme
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = currentTheme;
        }

        const savedCurrentStudentIndex = localStorage.getItem('currentStudentIndex');
        if (savedCurrentStudentIndex !== null) {
            currentStudentIndex = parseInt(savedCurrentStudentIndex, 10);
        }

        updateThemeDisplay(); // Mettez à jour l'affichage du type de barème
        renderTheme(); // Assurez-vous que le tableau est mis à jour après le chargement
    }

    function saveDataToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('themes', JSON.stringify(themes));
        localStorage.setItem('currentTheme', currentTheme); // Sauvegardez le type de barème
        localStorage.setItem('currentStudentIndex', currentStudentIndex.toString());
    }

    function loadStudents() {
        const savedStudents = localStorage.getItem('sharedStudentNames');
        if (savedStudents) {
            try {
                students = JSON.parse(savedStudents);
            } catch (error) {
                students = savedStudents.split('\n')
                    .filter(name => name.trim() !== '')
                    .map(name => ({ name: name.trim(), evaluations: {}, appreciation: "" }));
            }
        } else {
            students = [];
        }

        if (students.length === 0) {
            console.log("Aucun élève n'a été importé. Veuillez importer des noms d'élèves.");
        }
    }

    function setupEventListeners() {
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.addEventListener('change', handleThemeChange);
        }

        const prevStudentBtn = document.getElementById('prev-student');
        if (prevStudentBtn) {
            prevStudentBtn.addEventListener('click', previousStudent);
        }

        const nextStudentBtn = document.getElementById('next-student');
        if (nextStudentBtn) {
            nextStudentBtn.addEventListener('click', nextStudent);
        }

        const markAbsentBtn = document.getElementById('mark-absent');
        if (markAbsentBtn) {
            markAbsentBtn.addEventListener('click', markAbsentOrPresent); // Utiliser la nouvelle fonction
        }

        const addColumnBtn = document.getElementById('add-column');
        if (addColumnBtn) {
            addColumnBtn.addEventListener('click', addCustomColumn);
        }

        const showStatsBtn = document.getElementById('show-stats');
        if (showStatsBtn) {
            showStatsBtn.addEventListener('click', showStats);
        }

        const importButton = document.getElementById('import-data');
        const fileInput = document.getElementById('file-input');
        
        if (importButton && fileInput) {
            importButton.removeEventListener('click', openFileSelector);
            importButton.addEventListener('click', openFileSelector);
            
            fileInput.removeEventListener('change', handleFileSelect);
            fileInput.addEventListener('change', handleFileSelect);
        }
    }

    function handleThemeChange(event) {
        currentTheme = event.target.value;
        renderTheme();
        saveDataToLocalStorage(); // Assurez-vous que le type de barème est sauvegardé
        updateThemeDisplay(); // Mettez à jour l'affichage après le changement
    }

    function renderTheme() {
        const criteriaList = document.getElementById('criteria-list');
        const evaluationTableHead = document.querySelector('#evaluation-table thead tr');
        
        // Ajuster l'en-tête du tableau
        evaluationTableHead.innerHTML = `
            <th>Caractéristique</th>
            <th>Notes</th>
            ${currentTheme === 'quantitative' ? '<th>Base</th>' : ''} <!-- Afficher "Base" uniquement pour quantitative -->
            <th>Action</th>
        `;

        criteriaList.innerHTML = '';
        themes[currentTheme].forEach((criterion, index) => {
            const baseColumn = currentTheme === 'quantitative' 
                ? `<td>/ <input type="number" name="base-${criterion.id}" value="20" min="1" step="1" style="width: 50px;"></td>`
                : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${criterion.name}</td>
                <td>
                    ${currentTheme === 'quantitative' 
                        ? `<input type="number" name="criterion-${criterion.id}" min="0" max="20" step="0.5">` 
                        : `
                            <div class="criterion-options">
                                <label class="criterion-option"><input type="radio" name="criterion-${criterion.id}" value="0"> Non réussi</label>
                                <label class="criterion-option"><input type="radio" name="criterion-${criterion.id}" value="1"> Moyennement réussi</label>
                                <label class="criterion-option"><input type="radio" name="criterion-${criterion.id}" value="2"> Réussi</label>
                            </div>
                        `
                    }
                </td>
                ${baseColumn} <!-- Afficher la colonne "Base" uniquement pour quantitative -->
                <td><button class="remove-criterion" data-index="${index}">Suppr ligne</button></td>
            `;
            criteriaList.appendChild(row);
        });
        
        document.querySelectorAll('.remove-criterion').forEach(button => {
            button.addEventListener('click', removeCriterion);
        });
    }

    function updateStudentDisplay() {
        const studentSelect = document.getElementById('student-select');
        if (!studentSelect) return;

        studentSelect.innerHTML = '';

        students.forEach((student, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = student.name;
            if (index === currentStudentIndex) {
                option.selected = true;
            }
            studentSelect.appendChild(option);
        });

        if (students.length === 0) {
            document.getElementById('student-name').textContent = "Aucun élève";
            return;
        }

        const currentStudent = students[currentStudentIndex];
        document.getElementById('student-name').textContent = currentStudent.name;
        document.getElementById('student-name').style.color = 'var(--primary-color)';

        // Mettre à jour le texte du bouton "Élève Absent/Présent"
        const markAbsentBtn = document.getElementById('mark-absent');
        if (markAbsentBtn) {
            markAbsentBtn.textContent = currentStudent.absent ? "Élève Présent" : "Élève Absent";
        }

        themes[currentTheme].forEach(criterion => {
            const input = document.querySelector(`[name="criterion-${criterion.id}"]`);
            if (input) {
                const evaluations = currentStudent.evaluations[currentTheme] || {};
                if (currentTheme === 'quantitative') {
                    input.value = evaluations[criterion.id] || '';
                } else {
                    const value = evaluations[criterion.id] || '0';
                    document.querySelector(`[name="criterion-${criterion.id}"][value="${value}"]`).checked = true;
                }
            }
        });
        document.getElementById('appreciation-text').value = currentStudent.appreciation || '';
        
        const appreciationLabel = document.querySelector('#appreciation h3');
        if (!document.getElementById('generate-appreciation')) {
            const generateButton = document.createElement('span');
            generateButton.id = 'generate-appreciation';
            generateButton.innerHTML = '&#9733;';
            generateButton.title = 'Générer une appréciation';
            generateButton.style.fontSize = '24px';
            generateButton.style.color = 'var(--primary-color)';
            generateButton.style.cursor = 'pointer';
            generateButton.style.marginLeft = '10px';
            generateButton.classList.add('shining-star');
            generateButton.addEventListener('click', function() {
                saveCurrentEvaluation();
                generateAppreciation();
                updateAppreciationDisplay();
            });
            appreciationLabel.appendChild(generateButton);
        }
    }

    function saveCurrentEvaluation() {
        const currentStudent = students[currentStudentIndex];
        if (!currentStudent.evaluations[currentTheme]) {
            currentStudent.evaluations[currentTheme] = {};
        }
        themes[currentTheme].forEach(criterion => {
            const input = document.querySelector(`[name="criterion-${criterion.id}"]`);
            if (input) {
                if (currentTheme === 'quantitative') {
                    currentStudent.evaluations[currentTheme][criterion.id] = parseFloat(input.value) || 0;
                } else {
                    const checkedRadio = document.querySelector(`[name="criterion-${criterion.id}"]:checked`);
                    currentStudent.evaluations[currentTheme][criterion.id] = checkedRadio ? parseInt(checkedRadio.value) : 0;
                }
            }
        });
        currentStudent.appreciation = document.getElementById('appreciation-text').value;
        saveDataToLocalStorage();
        updateChart(); // Mettre à jour le graphique après avoir enregistré l'évaluation
    }
    
    function previousStudent() {
        if (students.length === 0) return;
        saveCurrentEvaluation();
        currentStudentIndex = (currentStudentIndex - 1 + students.length) % students.length;
        updateStudentDisplay();
        updateChart(); // Mettre à jour le graphique après avoir changé d'élève
        saveDataToLocalStorage();
    }
    
    function nextStudent() {
        if (students.length === 0) return;
        saveCurrentEvaluation();
        currentStudentIndex = (currentStudentIndex + 1) % students.length;
        updateStudentDisplay();
        updateChart(); // Mettre à jour le graphique après avoir changé d'élève
        saveDataToLocalStorage();
    }
    
    function markAbsentOrPresent() {
        if (students.length === 0) return;
        const currentStudent = students[currentStudentIndex];
        
        // Basculer l'état de présence de l'élève
        currentStudent.absent = !currentStudent.absent;
        
        // Mettre à jour le texte du bouton
        const markAbsentBtn = document.getElementById('mark-absent');
        if (markAbsentBtn) {
            markAbsentBtn.textContent = currentStudent.absent ? "Élève Présent" : "Élève Absent";
        }
        
        alert(`${currentStudent.name} est maintenant ${currentStudent.absent ? "absent" : "présent"}`);
        
        updateChart(); // Mettre à jour le graphique après avoir changé l'état de présence
        saveDataToLocalStorage();
    }
    
    function updateChart() {
        const presentStudents = students.filter(student => !student.absent);
        const scores = presentStudents.map(student => ({
            name: student.name,
            score: calculateFinalScore(student) // Utiliser la fonction qui calcule la moyenne sur 20
        }));
    
        scores.sort((a, b) => b.score - a.score);
    
        if (chart) {
            chart.data.labels = scores.map(s => s.name);
            chart.data.datasets[0].data = scores.map(s => s.score);
            chart.update();
        }
    }
    
    function addCustomColumn() {
        const name = prompt("Entrez le nom de la nouvelle caractéristique :");
        if (name) {
            const newId = themes[currentTheme].length + 1;
            themes[currentTheme].push({ id: newId, name: name });
            renderTheme();
            saveDataToLocalStorage();
        }
    }

    function removeCriterion(event) {
        const index = event.target.dataset.index;
        themes[currentTheme].splice(index, 1);
        renderTheme();
        saveDataToLocalStorage();
    }

    function checkEvaluationComplete() {
        evaluationComplete = students.every(student => 
            student.absent || 
            themes[currentTheme].every(criterion => 
                student.evaluations.hasOwnProperty(criterion.id)
            )
        );
    
        console.log("Évaluation complète :", evaluationComplete);
    
        const finishButton = document.getElementById('finish-evaluation');
        const downloadPdfButton = document.getElementById('download-pdf');

        if (finishButton) {
            finishButton.style.display = evaluationComplete ? 'block' : 'none';
        }

        if (downloadPdfButton) {
            downloadPdfButton.style.display = 'none'; // Cacher le bouton PDF initialement
        }
    }
    
    function calculateFinalScore(student) {
        const criteriaCount = themes[currentTheme].length;
        if (criteriaCount === 0) return 0;
    
        const totalScore = themes[currentTheme].reduce((acc, criterion) => {
            const score = student.evaluations[criterion.id] || 0;
            let normalizedScore;

            if (currentTheme === 'quantitative') {
                const base = parseFloat(document.querySelector(`[name="base-${criterion.id}"]`).value) || 20;
                normalizedScore = (score / base) * 20; // Normaliser le score sur 20
            } else {
                // Pour qualitative, convertir le score en une échelle de 0 à 20
                normalizedScore = (score / 2) * 20; // Puisque le score qualitatif est entre 0 et 2
            }

            return acc + normalizedScore;
        }, 0);
    
        const finalScore = totalScore / criteriaCount;
        return isNaN(finalScore) ? 0 : Math.max(0, Math.min(20, finalScore));
    }
    
    function showStats() {
        saveCurrentEvaluation(); // Assurez-vous que les données sont enregistrées avant de mettre à jour le graphique

        const presentStudents = students.filter(student => !student.absent);
        if (presentStudents.length === 0) {
            alert("Aucun élève présent pour afficher les statistiques.");
            return;
        }
    
        const scores = presentStudents.map(student => ({
            name: student.name,
            score: calculateFinalScore(student) // Utiliser la fonction qui calcule la moyenne sur 20
        }));
    
        scores.sort((a, b) => b.score - a.score);
    
        const ctx = document.getElementById('class-chart').getContext('2d');
        
        if (chart) {
            chart.destroy(); // Détruire le graphique existant pour le recreer
        }
    
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scores.map(s => s.name),
                datasets: [{
                    label: 'Score moyen',
                    data: scores.map(s => s.score),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'x',
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Élèves'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        max: 20, // Assurez-vous que l'axe Y est configuré pour un maximum de 20
                        title: {
                            display: true,
                            text: 'Score moyen'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Scores moyens des élèves'
                    }
                }
            }
        });
    
        document.getElementById('class-stats').style.display = 'block';
    }
    
    function openFileSelector(event) {
        event.preventDefault();
        if (!isFileDialogOpen) {
            isFileDialogOpen = true;
            document.getElementById('file-input').click();
        }
    }
    
    function handleFileSelect(event) {
        isFileDialogOpen = false; // Réinitialiser ici après la sélection du fichier
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
                case 'docx':
                    alert('Importation de PDF et DOCX non implémentée dans cet exemple');
                    break;
                default:
                    alert('Format de fichier non pris en charge. Veuillez utiliser .json, .txt, .pdf ou .docx');
            }
        }
        event.target.value = ''; // Réinitialiser la valeur du champ de fichier
    }
    
    function importJSONData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    students = data.map(name => ({ name, evaluations: {}, appreciation: "" }));
                } else if (data.sharedStudentNames && Array.isArray(data.sharedStudentNames)) {
                    students = data.sharedStudentNames.map(name => ({ name, evaluations: {}, appreciation: "" }));
                } else {
                    throw new Error("Format de données JSON invalide");
                }
                currentStudentIndex = 0;
                updateStudentDisplay();
                renderStudentList();
                saveDataToLocalStorage();
                alert('Noms d\'élèves importés avec succès depuis le fichier JSON.');
            } catch (error) {
                alert('Erreur lors de l\'importation des données JSON: ' + error.message);
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
    
    function importTextData(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const names = e.target.result.split('\n').filter(name => name.trim() !== '');
                students = names.map(name => ({ name: name.trim(), evaluations: {}, appreciation: "" }));
                currentStudentIndex = 0;
                updateStudentDisplay();
                renderStudentList();
                saveDataToLocalStorage();
                alert('Noms d\'élèves importés avec succès depuis le fichier texte.');
            } catch (error) {
                alert('Erreur lors de l\'importation des données texte: ' + error.message);
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
    
    function renderStudentList() {
        const studentSelect = document.getElementById('student-select');
        if (studentSelect) {
            studentSelect.innerHTML = '';
            students.forEach((student, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = student.name;
                studentSelect.appendChild(option);
            });
        }
    }

    function downloadPDF() {
        console.log("Génération du PDF...");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const marginTop = 20; // Définir une marge supérieure uniforme

        doc.setFontSize(20);
        doc.text("Rapport de Notes des Élèves", 10, marginTop);
        
        const tableColumn = ["Nom", "Notes"];
        const tableRows = [];
        
        students.forEach(student => {
            const absentNote = student.absent ? "Absent" : calculateFinalScore(student).toFixed(2);
            tableRows.push([student.name, absentNote]);
        });
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: marginTop + 10 // Utiliser la marge supérieure définie
        });
        
        doc.text("Résumé des scores de la classe", 10, doc.autoTable.previous.finalY + 10);
        
        const scores = students.filter(s => !s.absent).map(s => calculateFinalScore(s));
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);
        
        doc.setFontSize(12);
        doc.text(`Score moyen : ${avgScore.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 20);
        doc.text(`Score minimum : ${minScore.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 30);
        doc.text(`Score maximum : ${maxScore.toFixed(2)}`, 10, doc.autoTable.previous.finalY + 40);
        
        // Ajout du graphique
        const canvas = document.getElementById('class-chart');
        if (canvas) {
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 10, doc.autoTable.previous.finalY + 50, 180, 90);
        }
        
        // Nouvelle page pour le tableau détaillé
        students.forEach(student => {
            doc.addPage();
            doc.setFontSize(16);
            doc.text(`Nom de l'élève: ${student.name}`, 10, marginTop);

            const tableRows = themes[currentTheme].map(criterion => {
                const score = student.evaluations[criterion.id] || 0;
                if (currentTheme === 'quantitative') {
                    const base = parseFloat(document.querySelector(`[name="base-${criterion.id}"]`).value) || 20;
                    return [criterion.name, `${score} / ${base}`];
                } else {
                    const options = ["Non réussi", "Moyennement réussi", "Réussi"];
                    return [criterion.name, options[score] || "Inconnu"];
                }
            });

            doc.autoTable({
                head: [['Caractéristique', currentTheme === 'quantitative' ? 'Note/Base' : 'Note']],
                body: tableRows,
                startY: marginTop + 10
            });

            // Calculer la position Y pour l'appréciation
            const appreciationY = doc.autoTable.previous.finalY + 10;
            const appreciationText = student.appreciation ? `Appréciation: ${student.appreciation}` : "Appréciation : Pas d'appréciation";

            // Gérer le retour à la ligne pour l'appréciation
            const splitText = doc.splitTextToSize(appreciationText, 180); // 180 est la largeur de la page moins les marges
            doc.text(splitText, 10, appreciationY);
        });

        doc.save("rapport_notes_eleves.pdf");
    }
    
    const downloadPdfButton = document.getElementById('download-pdf');
    if (downloadPdfButton) {
        downloadPdfButton.addEventListener('click', function() {
            console.log("Bouton de téléchargement cliqué");
            downloadPDF();
        });
    }

    async function generateAppreciation() {
        const currentStudent = students[currentStudentIndex];
        if (!currentStudent) return;

        // Calculer la note moyenne
        const averageScore = calculateFinalScore(currentStudent);

        // Construire la chaîne des caractéristiques avec des descriptions textuelles ou des notes
        const characteristicsString = themes[currentTheme].map(criterion => {
            const score = currentStudent.evaluations[criterion.id] || 0;
            let description;
            if (currentTheme === 'quantitative') {
                description = `${score}/20`; // Assurez-vous que le score est affiché sur 20
            } else {
                // Utiliser les descriptions textuelles pour qualitatif
                switch (score) {
                    case 0:
                        description = "Non réussi";
                        break;
                    case 1:
                        description = "Moyennement réussi";
                        break;
                    case 2:
                        description = "Réussi";
                        break;
                    default:
                        description = "Inconnu";
                }
            }
            return `${criterion.name} = ${description}`;
        }).join('\n');

        // Construire le prompt personnalisé
        const prompt = `Génère une appréciation pour l'élève ${currentStudent.name} avec une note moyenne de ${averageScore.toFixed(2)} sur cette évaluation ->\n${characteristicsString}\n. Limite de 150 caractères.`;

        let intervalId;
        const appreciationText = document.getElementById('appreciation-text');
        const originalText = appreciationText.value;

        // Fonction pour animer le texte
        function animateText() {
            let dots = '';
            intervalId = setInterval(() => {
                dots = dots.length < 3 ? dots + '.' : '';
                appreciationText.value = `Génération${dots}`;
            }, 500);
        }

        // Fonction pour garantir un délai minimum
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        try {
            animateText(); // Commencez l'animation

            // Attendez à la fois la génération de l'appréciation et un délai minimum de 3 secondes
            const [result] = await Promise.all([
                model.generateContent(prompt),
            ]);

            const appreciation = result.response.text();
            
            // Mettre à jour l'appréciation
            currentStudent.appreciation = appreciation;
            appreciationText.value = appreciation;
            saveCurrentEvaluation();
        } catch (error) {
            console.error("Erreur lors de la génération de l'appréciation:", error);
            alert("Erreur lors de la génération de l'appréciation. Veuillez réessayer.");
            appreciationText.value = originalText; // Restaurer le texte original en cas d'erreur
        } finally {
            clearInterval(intervalId); // Arrêtez l'animation
        }
    }

    function updateAppreciationDisplay() {
        const currentStudent = students[currentStudentIndex];
        if (currentStudent) {
            document.getElementById('appreciation-text').value = currentStudent.appreciation || '';
        }
    }

    function setupAppreciationButton() {
        const appreciationLabel = document.querySelector('#appreciation h3');
        if (!document.getElementById('generate-appreciation')) {
            const generateButton = document.createElement('span');
            generateButton.id = 'generate-appreciation';
            generateButton.innerHTML = '&#9733;';
            generateButton.title = 'Générer une appréciation';
            generateButton.style.fontSize = '24px';
            generateButton.style.color = 'var(--primary-color)';
            generateButton.style.cursor = 'pointer';
            generateButton.style.marginLeft = '10px';
            generateButton.classList.add('shining-star');
            
            generateButton.addEventListener('click', async function() {
                generateButton.style.opacity = '0.5';
                generateButton.style.cursor = 'wait';
                generateButton.classList.add('rotating');
                
                saveCurrentEvaluation();
                await generateAppreciation();
                updateAppreciationDisplay();
                
                generateButton.style.opacity = '1';
                generateButton.style.cursor = 'pointer';
                generateButton.classList.remove('rotating');
            });
            
            appreciationLabel.appendChild(generateButton);
        }
    }

    // Ajoutez cette fonction pour gérer le clic sur le bouton "Terminer"
    function setupFinishButton() {
        const finishButton = document.getElementById('finish-evaluation');
        const downloadPdfButton = document.getElementById('download-pdf');

        if (finishButton) {
            finishButton.style.display = 'block'; // Assurez-vous que le bouton "Terminer" est toujours visible
            finishButton.addEventListener('click', function() {
                finishButton.style.display = 'none'; // Cache le bouton "Terminer"
                if (downloadPdfButton) {
                    downloadPdfButton.style.display = 'block'; // Affiche le bouton "Télécharger le PDF"
                }
            });
        }
    }

    function updateThemeDisplay() {
        const themeDisplay = document.getElementById('theme-display');
        if (themeDisplay) {
            themeDisplay.textContent = `Type de barème: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`;
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .rotating {
            animation: rotate 1s linear infinite;
        }
        .shining-star {
            transition: all 0.3s ease;
        }
        .shining-star:hover {
            transform: scale(1.2);
            text-shadow: 0 0 10px var(--primary-color);
        }
    `;
    document.head.appendChild(style);

    init();
});
