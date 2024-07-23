let mode = 'manual'; // Начальный режим
let tabs = JSON.parse(localStorage.getItem('tabs')) || []; // Загружаем вкладки из Local Storage
let currentTabId = localStorage.getItem('currentTabId') || null;

// Инициализация приложения
window.onload = function() {
    renderTabs();
    if (currentTabId && tabs.length > 0) {
        switchTab(currentTabId);
    } else if (tabs.length > 0) {
        switchTab(tabs[0].id);
    }
};

document.getElementById('addNoteButton').addEventListener('click', function() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();
    const selectedColor = mode === 'manual' ? document.getElementById('colorPicker').value : getRandomColor();
    if (noteText) {
        addNoteToCloud(noteText, selectedColor);
        noteInput.value = '';
        saveNotes();
    }
});

document.getElementById('noteInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const noteInput = document.getElementById('noteInput');
        const noteText = noteInput.value.trim();
        const selectedColor = mode === 'manual' ? document.getElementById('colorPicker').value : getRandomColor();
        if (noteText) {
            addNoteToCloud(noteText, selectedColor);
            noteInput.value = '';
            saveNotes();
        }
    }
});

document.getElementById('modeSwitchButton').addEventListener('click', function() {
    mode = mode === 'manual' ? 'auto' : 'manual';
    document.getElementById('modeSwitchButton').innerText = mode === 'manual' ? 'Switch to Auto Mode' : 'Switch to Manual Mode';
});

document.getElementById('addTabButton').addEventListener('click', function() {
    const newTabName = prompt('Enter name for the new tab');
    if (newTabName) {
        addTab(newTabName);
    }
});

function addTab(name) {
    const tabId = `tab-${Date.now()}`;
    tabs.push({ id: tabId, name: name, notes: [] });
    renderTabs();
    switchTab(tabId);
    saveTabs();
}

function switchTab(tabId) {
    currentTabId = tabId;
    const currentTab = tabs.find(tab => tab.id === tabId);
    document.getElementById('currentTabName').innerText = currentTab.name;
    renderNotes();
    saveCurrentTabId();
}

function closeTab(tabId) {
    tabs = tabs.filter(tab => tab.id !== tabId);
    if (tabs.length > 0) {
        switchTab(tabs[0].id);
    } else {
        currentTabId = null;
        document.getElementById('currentTabName').innerText = '';
        document.getElementById('tagCloud').innerHTML = '';
    }
    renderTabs();
    saveTabs();
}

function renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';
    tabs.forEach(tab => {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.id = tab.id;
        tabElement.innerText = tab.name;
        tabElement.onclick = () => switchTab(tab.id);

        const closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.innerText = 'x';
        closeButton.onclick = (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        };

        tabElement.appendChild(closeButton);
        tabsContainer.appendChild(tabElement);
    });
}

function renderNotes() {
    const currentTab = tabs.find(tab => tab.id === currentTabId);
    const tagCloud = document.getElementById('tagCloud');
    tagCloud.innerHTML = '';
    currentTab.notes.forEach(note => {
        addNoteToCloud(note.text, note.color, note.animation, note.position);
    });
}

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
    const currentTab = tabs.find(tab => tab.id === currentTabId);
    if (!currentTab) return;
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
    currentTab.notes = notes;
    saveTabs();
}

function saveTabs() {
    localStorage.setItem('tabs', JSON.stringify(tabs));
}

function saveCurrentTabId() {
    localStorage.setItem('currentTabId', currentTabId);
}

function getRandomColor() {
    const colors = ['#007bff', '#28a745', '#dc3545', '#6f42c1', '#000000', '#ffc107', '#fd7e14', '#e83e8c'];
    return colors[Math.floor(Math.random() * colors.length)];
}

const tagCloud = document.getElementById('tagCloud');
tagCloud.addEventListener('click', function(event) {
    if (event.target === tagCloud) {
        toggleAnimations();
    }
});




