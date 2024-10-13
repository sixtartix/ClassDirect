let students = [];
let currentStudentIndex = -1;

function loadStudent() {
    currentStudentIndex = document.getElementById("student-select").value;
    const studentForm = document.getElementById("student-form");
    if (currentStudentIndex == -1) {
        studentForm.style.display = "none";
    } else {
        const student = students[currentStudentIndex];
        document.getElementById("barème-type").value = student.barèmeType || 'poésie';
        const criteriaRadios = document.getElementsByName("criteria");
        criteriaRadios.forEach(radio => {
            radio.checked = (radio.value === student.criteria);
        });
        studentForm.style.display = "block";
    }
}

function saveStudent() {
    const barèmeType = document.getElementById("barème-type").value;
    const criteria = document.querySelector('input[name="criteria"]:checked').value;

    if (currentStudentIndex == -1) {
        // Si l'élève n'est pas encore dans la liste, on l'ajoute
        students.push({ name: document.getElementById("student-select").options[currentStudentIndex + 1].text, barèmeType, criteria });
        const option = document.createElement("option");
        option.value = students.length - 1;
        option.textContent = `Élève ${students.length}`;
        document.getElementById("student-select").appendChild(option);
    } else {
        // Si l'élève existe déjà, on met à jour ses informations
        students[currentStudentIndex] = { ...students[currentStudentIndex], barèmeType, criteria };
    }
    updateChart();
}

function removeStudent() {
    if (currentStudentIndex != -1) {
        students.splice(currentStudentIndex, 1);
        document.getElementById("student-select").remove(currentStudentIndex + 1);
        currentStudentIndex = -1;
        loadStudent();
        updateChart();
    }
}

function updateChart() {
    const labels = [];
    const data = [];

    students.forEach((student, index) => {
        labels.push(student.name);
        const score = student.criteria === 'excellent' ? 100 : student.criteria === 'moyen' ? 50 : 0;
        data.push(score);
    });

    const ctx = document.getElementById('resultChart').getContext('2d');
    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Scores des Élèves',
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    if (window.barChart) {
        window.barChart.destroy();
    }

    window.barChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Pourcentage de Réussite (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

function importStudents() {
    const fileInput = document.getElementById("file-input");
    const file = fileInput.files[0];

    if (!file) {
        alert("Veuillez sélectionner un fichier à importer.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const lines = text.split('\n');
        students = []; // Réinitialiser la liste des élèves
        document.getElementById("student-select").innerHTML = '<option value="-1">Sélectionner un élève</option>'; // Réinitialiser les options

        lines.forEach((line, index) => {
            const studentName = line.trim();
            if (studentName) {
                students.push({ name: studentName, barèmeType: '', criteria: '' });

                const option = document.createElement("option");
                option.value = index;
                option.textContent = studentName; // Afficher le nom de l'élève
                document.getElementById("student-select").appendChild(option);
            }
        });

        alert("Importation terminée !");
        updateChart(); // Met à jour le graphique si nécessaire
    };

    reader.onerror = function() {
        alert("Erreur lors de la lecture du fichier.");
    };

    reader.readAsText(file);
}
