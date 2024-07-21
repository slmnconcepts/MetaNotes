document.getElementById('addNoteButton').addEventListener('click', function() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();
    if (noteText) {
        addNoteToCloud(noteText);
        noteInput.value = '';
        saveNotes();
    }
});

document.getElementById('noteInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const noteInput = document.getElementById('noteInput');
        const noteText = noteInput.value.trim();
        if (noteText) {
            addNoteToCloud(noteText);
            noteInput.value = '';
            saveNotes();
        }
    }
});

document.getElementById('colorPicker').addEventListener('change', function(event) {
    const noteInput = document.getElementById('noteInput');
    noteInput.style.borderColor = event.target.value;
});

document.getElementById('exportButton').addEventListener('click', function() {
    const tags = document.getElementsByClassName('tag');
    let exportText = '';
    for (let tag of tags) {
        exportText += `${tag.innerText}\n`;
    }
    const blob = new Blob([exportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'metanotes.txt';
    link.click();
});

function addNoteToCloud(text, color = '#007bff', animation = 'float', position = {x: 0, y: 0}) {
    const tagCloud = document.getElementById('tagCloud');
    const noteElement = document.createElement('div');
    noteElement.className = 'tag';
    noteElement.innerText = text;
    noteElement.style.backgroundColor = color;

    const cloudWidth = tagCloud.offsetWidth;
    const cloudHeight = tagCloud.offsetHeight;
    const x = position.x !== 0 ? position.x : Math.random() * (cloudWidth - 100);
    const y = position.y !== 0 ? position.y : Math.random() * (cloudHeight - 30);
    noteElement.style.left = `${x}px`;
    noteElement.style.top = `${y}px`;

    if (animation === 'float') {
        noteElement.style.animation = `float 10s infinite alternate`;
    } else if (animation === 'flash') {
        noteElement.style.animation = `flash 2s infinite`;
    }

    noteElement.draggable = true;
    noteElement.addEventListener('dragstart', dragStart);
    noteElement.addEventListener('dragend', dragEnd);

    noteElement.addEventListener('click', function() {
        tagCloud.removeChild(noteElement);
        saveNotes();
    });

    tagCloud.appendChild(noteElement);
    moveNoteRandomly(noteElement);
}

let draggedElement = null;
let animationsPaused = false;

function dragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.setData('text/plain', '');
}

function dragEnd(event) {
    const tagCloud = document.getElementById('tagCloud');
    const rect = tagCloud.getBoundingClientRect();
    draggedElement.style.left = `${event.clientX - rect.left - draggedElement.offsetWidth / 2}px`;
    draggedElement.style.top = `${event.clientY - rect.top - draggedElement.offsetHeight / 2}px`;
    saveNotes();
    draggedElement = null;
}

function moveNoteRandomly(noteElement) {
    if (animationsPaused) return;

    const tagCloud = document.getElementById('tagCloud');
    const cloudWidth = tagCloud.offsetWidth;
    const cloudHeight = tagCloud.offsetHeight;
    let dx = (Math.random() - 0.5) * 1.62;
    let dy = (Math.random() - 0.5) * 1.62;

    function updatePosition() {
        if (animationsPaused) return;

        let rect = noteElement.getBoundingClientRect();
        let parentRect = tagCloud.getBoundingClientRect();

        if (rect.left + dx < parentRect.left || rect.right + dx > parentRect.right) {
            dx = -dx;
        }
        if (rect.top + dy < parentRect.top || rect.bottom + dy > parentRect.bottom) {
            dy = -dy;
        }

        noteElement.style.left = `${noteElement.offsetLeft + dx}px`;
        noteElement.style.top = `${noteElement.offsetTop + dy}px`;

        requestAnimationFrame(updatePosition);
    }

    requestAnimationFrame(updatePosition);
}

function toggleAnimations() {
    animationsPaused = !animationsPaused;
    const tags = document.getElementsByClassName('tag');
    for (let tag of tags) {
        if (animationsPaused) {
            tag.style.animationPlayState = 'paused';
        } else {
            tag.style.animationPlayState = 'running';
            moveNoteRandomly(tag);
        }
    }
}

function saveNotes() {
    const notes = [];
    const tags = document.getElementsByClassName('tag');
    for (let tag of tags) {
        const note = {
            text: tag.innerText,
            color: tag.style.backgroundColor,
            animation: tag.style.animationName,
            position: {
                x: tag.style.left.replace('px', ''),
                y: tag.style.top.replace('px', '')
            }
        };
        notes.push(note);
    }
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        for (let note of notes) {
            addNoteToCloud(note.text, note.color, note.animation, note.position);
        }
    }
}

window.onload = loadNotes;

const tagCloud = document.getElementById('tagCloud');
tagCloud.addEventListener('click', function(event) {
    if (event.target === tagCloud) {
        toggleAnimations();
    }
});

