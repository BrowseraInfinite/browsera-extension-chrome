const spotlight = document.getElementById('spotlight');
const input = document.getElementById('spotlight-input');
const modal = document.getElementById('modal');
const commandMenu = document.getElementById('command-menu');
const menuItems = document.getElementById('menu-items');

let customCommands = JSON.parse(localStorage.getItem('myCommands')) || {};
let selectedIndex = -1;

const searchEngines = {
    'g': 'https://www.google.com/search?q=',
    'y': 'https://www.youtube.com/results?search_query=',
    'r': 'https://www.reddit.com/search?q=',
    'gh': 'https://github.com/search?q='
};

function closeSpotlight() {
    spotlight.classList.add('hidden');
    commandMenu.classList.add('hidden');
    input.value = '';
    selectedIndex = -1;
}

function updateSelection(suggestions) {
    suggestions.forEach((el, idx) => {
        el.style.background = (idx === selectedIndex) ? '#333' : 'transparent';
    });
}

function saveCommand() {
    const key = document.getElementById('cmd-key').value.trim();
    const action = document.getElementById('cmd-action').value.trim();
    if (!key || !action) return;
    if (customCommands.hasOwnProperty(key) && !confirm(`Command "${key}" exists. Overwrite?`)) return;
    customCommands[key] = action;
    localStorage.setItem('myCommands', JSON.stringify(customCommands));
    closeModal();
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        spotlight.classList.toggle('hidden');
        if (!spotlight.classList.contains('hidden')) setTimeout(() => input.focus(), 50);
        else closeSpotlight();
    }
    if (e.key === 'Escape') { closeSpotlight(); modal.classList.add('hidden'); }
});

// Search & Suggestion Logic
input.addEventListener('input', () => {
    selectedIndex = -1;
    const query = input.value.trim().toLowerCase();
    if (!query) { commandMenu.classList.add('hidden'); return; }

    const all = { ...customCommands, "/list": "Show commands", "/delete": "Delete cmd", "/help": "Get help", "/add": "Add new" };
    const matches = Object.entries(all).filter(([key]) => key.toLowerCase().includes(query));

    if (matches.length > 0) {
        menuItems.innerHTML = `<strong>Suggestions</strong><br>`;
        matches.forEach(([key, val]) => {
            menuItems.innerHTML += `<div class="menu-item">${key} <span style="opacity:0.5">→ ${val}</span></div>`;
        });
        commandMenu.classList.remove('hidden');
    } else {
        commandMenu.classList.add('hidden');
    }
});

input.addEventListener('keydown', (e) => {
    const suggestions = document.querySelectorAll('.menu-item');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (suggestions.length === 0) return;
        selectedIndex = e.key === 'ArrowDown' ? Math.min(selectedIndex + 1, suggestions.length - 1) : Math.max(selectedIndex - 1, 0);
        updateSelection(suggestions);
        return;
    }

    if (e.key === 'Enter') {
        let query = input.value.trim();
        if (selectedIndex > -1) query = suggestions[selectedIndex].innerText.split(' → ')[0];
        if (!query) return;

        // 1. SYSTEM COMMANDS
        if (query === '/add') { openAddModal(); closeSpotlight(); return; }
        if (query === '/list') { displayCommands(); closeSpotlight(); return; }
        if (query === '/help') { displayHelp(); closeSpotlight(); return; }
        if (query.startsWith('/delete ')) {
            const key = query.substring(8).trim();
            if (customCommands[key]) { delete customCommands[key]; localStorage.setItem('myCommands', JSON.stringify(customCommands)); }
            closeSpotlight(); return;
        }

        // 2. NAVIGATION (w command)
        if (query.startsWith('w ')) {
            let url = query.substring(2).trim();
            window.location.href = url.startsWith('http') ? url : `https://${url}`;
            closeSpotlight(); return;
        }

        // 3. SEARCH ENGINE PREFIXES
        const parts = query.split(' ');
        const prefix = parts[0].toLowerCase();
        const searchTerm = parts.slice(1).join(' ');
        if (searchEngines[prefix] && searchTerm) {
            window.location.href = searchEngines[prefix] + encodeURIComponent(searchTerm);
            closeSpotlight(); return;
        }

        // 4. CUSTOM COMMANDS
        if (customCommands[query]) {
            let action = customCommands[query];
            window.location.href = action.startsWith('w ') ? (action.substring(2).startsWith('http') ? action.substring(2) : `https://${action.substring(2)}`) : action;
            closeSpotlight(); return;
        }

        // 5. DEFAULT SEARCH
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        closeSpotlight();
    }
});

// MODAL MANAGEMENT
function openAddModal() {
    modal.querySelector('.modal-content').innerHTML = `
        <h3>Add Custom Command</h3>
        <input type="text" id="cmd-key" placeholder="Key (e.g. .d)">
        <input type="text" id="cmd-action" placeholder="Action (e.g. w discord.com)">
        <button id="save-cmd">Save</button>
        <p style="font-size: 0.7rem; opacity: 0.5; margin-top: 15px;">Press Esc to close</p>
    `;
    document.getElementById('save-cmd').addEventListener('click', saveCommand);
    modal.classList.remove('hidden');
}

function displayCommands() {
    const modalContent = modal.querySelector('.modal-content');
    let listHTML = "<h3>All Commands</h3><ul style='text-align:left;'>";
    const all = { ...customCommands, "g/y/r/gh [q]": "Search", "w [url]": "Open site", "/list": "List", "/delete [k]": "Delete", "/help": "Discord" };
    for (const [k, v] of Object.entries(all)) listHTML += `<li><strong>${k}</strong>: ${v}</li>`;
    modalContent.innerHTML = listHTML + `<p style="font-size: 0.7rem; opacity: 0.5; margin-top: 15px;">Press Esc to close</p>`;
    modal.classList.remove('hidden');
}

function displayHelp() {
    const modalContent = modal.querySelector('.modal-content');
    modalContent.innerHTML = `
        <h3>Need Help?</h3>
        <a href="https://discord.gg/D63tpvF2FP" target="_blank">Join Discord</a>
        <p style="font-size: 0.7rem; opacity: 0.5; margin-top: 15px;">Press Esc to close</p>
    `;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}r