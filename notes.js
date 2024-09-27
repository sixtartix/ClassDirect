// Fichier notes.js
let currentNote = null;
const noteContent = document.getElementById('note-content');
const noteList = document.getElementById('note-list');
const newNoteBtn = document.getElementById('new-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');

// Ajouter du CSS pour l'effet de balancement et l'icône de poubelle
const style = document.createElement('style');
style.textContent = `
    @keyframes swing {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(5deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-5deg); }
        100% { transform: rotate(0deg); }
    }
    .trash-icon {
        width: 20px;
        height: 20px;
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    .trash-icon:hover {
        animation: swing 0.5s ease-in-out infinite;
    }
`;
document.head.appendChild(style);

// Fonction pour créer l'icône SVG de la poubelle
function createTrashIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "red");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.classList.add("trash-icon");

    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M3 6h18");
    svg.appendChild(path1);

    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2");
    svg.appendChild(path2);

    return svg;
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    noteList.innerHTML = '';
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note-item');
        noteElement.style.display = 'flex';
        noteElement.style.justifyContent = 'space-between';
        noteElement.style.alignItems = 'center';
        noteElement.style.marginBottom = '10px';
        
        const noteText = document.createElement('span');
        noteText.textContent = note.content.substring(0, 10) + '...';
        noteText.style.cursor = 'pointer';
        noteText.addEventListener('click', () => loadNote(index));
        
        const trashIcon = createTrashIcon();
        trashIcon.style.marginLeft = '10px';
        trashIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(index);
        });
        
        noteElement.appendChild(noteText);
        noteElement.appendChild(trashIcon);
        noteList.appendChild(noteElement);
    });
}

function loadNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    currentNote = index;
    noteContent.value = notes[index].content;
}

function saveNote() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const content = noteContent.value.trim();
    
    if (content) {
        if (currentNote === null) {
            notes.push({ content });
        } else {
            notes[currentNote].content = content;
        }
        
        localStorage.setItem('notes', JSON.stringify(notes));
        loadNotes();
        noteContent.value = '';
        currentNote = null;
    }
}

function newNote() {
    currentNote = null;
    noteContent.value = '';
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
    if (currentNote === index) {
        currentNote = null;
        noteContent.value = '';
    }
}

// Chargement initial des notes
loadNotes();

// Ajout des écouteurs d'événements
newNoteBtn.addEventListener('click', newNote);
saveNoteBtn.addEventListener('click', saveNote);