document.getElementById('addNoteButton').addEventListener('click', function() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();
    if (noteText) {
        addNoteToCloud(noteText);
        noteInput.value = '';
    }
});

document.getElementById('noteInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const noteInput = document.getElementById('noteInput');
        const noteText = noteInput.value.trim();
        if (noteText) {
            addNoteToCloud(noteText);
            noteInput.value = '';
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

function addNoteToCloud(text) {
    const tagCloud = document.getElementById('tagCloud');
    const noteElement = document.createElement('div');
    noteElement.className = 'tag';
    noteElement.innerText = text;

    // Set color from picker
    const colorPicker = document.getElementById('colorPicker');
    noteElement.style.backgroundColor = colorPicker.value;

    // Set random position within the tag cloud
    const cloudWidth = tagCloud.offsetWidth;
    const cloudHeight = tagCloud.offsetHeight;
    const x = Math.random() * (cloudWidth - 100);
    const y = Math.random() * (cloudHeight - 30);
    noteElement.style.left = `${x}px`;
    noteElement.style.top = `${y}px`;

    // Apply animation
    const animationPicker = document.getElementById('animationPicker');
    if (animationPicker.value === 'float') {
        noteElement.style.animation = `float 10s infinite alternate`; // Reduced speed further
    } else if (animationPicker.value === 'flash') {
        noteElement.style.animation = `flash 2s infinite`; // Reduced speed further
    }

    // Enable dragging
    noteElement.draggable = true;
    noteElement.addEventListener('dragstart', dragStart);
    noteElement.addEventListener('dragend', dragEnd);

    // Remove note on click
    noteElement.addEventListener('click', function() {
        tagCloud.removeChild(noteElement);
    });

    tagCloud.appendChild(noteElement);

    // Initialize movement
    moveNoteRandomly(noteElement);
}

let draggedElement = null;

function dragStart(event) {
    draggedElement = event.target;
    event.dataTransfer.setData('text/plain', '');
}

function dragEnd(event) {
    const tagCloud = document.getElementById('tagCloud');
    const rect = tagCloud.getBoundingClientRect();
    draggedElement.style.left = `${event.clientX - rect.left - draggedElement.offsetWidth / 2}px`;
    draggedElement.style.top = `${event.clientY - rect.top - draggedElement.offsetHeight / 2}px`;
    draggedElement = null;
}

function moveNoteRandomly(noteElement) {
    const tagCloud = document.getElementById('tagCloud');
    const cloudWidth = tagCloud.offsetWidth;
    const cloudHeight = tagCloud.offsetHeight;
    let dx = (Math.random() - 0.5) * 1.62; // Reduced speed further
    let dy = (Math.random() - 0.5) * 1.62; // Reduced speed further

    function updatePosition() {
        let rect = noteElement.getBoundingClientRect();
        let parentRect = tagCloud.getBoundingClientRect();

        // Check for collision with the edges
        if (rect.left + dx < parentRect.left || rect.right + dx > parentRect.right) {
            dx = -dx; // Reverse direction on x-axis
        }
        if (rect.top + dy < parentRect.top || rect.bottom + dy > parentRect.bottom) {
            dy = -dy; // Reverse direction on y-axis
        }

        // Update position
        noteElement.style.left = `${noteElement.offsetLeft + dx}px`;
        noteElement.style.top = `${noteElement.offsetTop + dy}px`;

        requestAnimationFrame(updatePosition);
    }

    requestAnimationFrame(updatePosition);
}