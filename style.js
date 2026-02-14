document.addEventListener('DOMContentLoaded', () => {

    // --- Cursor Trail (Subtle) ---
    const trailContainer = document.getElementById('cursor-trail');
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.5) return; // Reduce particles for subtler effect
        const dot = document.createElement('div');
        dot.className = 'cursor-dot';
        dot.style.left = `${e.clientX}px`;
        dot.style.top = `${e.clientY}px`;
        trailContainer.appendChild(dot);
        setTimeout(() => dot.remove(), 500);
    });

    // --- Data Management ---
    class StorageManager {
        static getData(key) { return JSON.parse(localStorage.getItem(key)) || {}; }
        static saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
        static getProjects() { return JSON.parse(localStorage.getItem('projects')) || []; }
        static saveProjects(data) { localStorage.setItem('projects', JSON.stringify(data)); }
    }

    // --- Calendar & Lists ---
    let currentDate = new Date();
    let selectedDate = new Date();
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYear = document.getElementById('monthYear');
    const selectedDateTitle = document.getElementById('selectedDateTitle');

    function formatDateKey(date) { return date.toISOString().split('T')[0]; }

    function renderCalendar(date) {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();
        monthYear.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
            const h = document.createElement('div');
            h.className = 'calendar-day-header';
            h.textContent = d;
            calendarGrid.appendChild(h);
        });

        for (let i = 0; i < firstDay; i++) calendarGrid.appendChild(document.createElement('div'));

        const tasks = StorageManager.getData('dailyTasks');
        const shop = StorageManager.getData('shoppingList');
        const today = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const key = formatDateKey(d);
            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.textContent = i;

            if (key === formatDateKey(today)) el.classList.add('today');
            if (key === formatDateKey(selectedDate)) el.classList.add('selected');
            if ((tasks[key] && tasks[key].length) || (shop[key] && shop[key].length)) el.classList.add('has-task');

            el.addEventListener('click', () => {
                selectedDate = d;
                renderCalendar(currentDate);
                renderAllLists();
            });
            calendarGrid.appendChild(el);
        }
    }

    function renderList(containerId, storageKey) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const key = formatDateKey(selectedDate);
        selectedDateTitle.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        const data = StorageManager.getData(storageKey);
        const items = data[key] || [];

        items.forEach((item, idx) => {
            const el = document.createElement('label');
            el.className = 'task-item';
            el.innerHTML = `
                <input type="checkbox" ${item.completed ? 'checked' : ''}>
                <span class="task-text">${item.text}</span>
                <span class="delete-btn" style="color:#ff4d4d; font-size:0.8rem;">✕</span>
            `;
            el.querySelector('input').addEventListener('change', (e) => {
                data[key][idx].completed = e.target.checked;
                StorageManager.saveData(storageKey, data);
                if (e.target.checked) {
                    el.classList.add('completed');
                    // Confetti Trigger
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#2ecc71', '#3498db', '#9b59b6'],
                            disableForReducedMotion: true
                        });
                    }
                } else {
                    el.classList.remove('completed');
                }
            });
            el.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.preventDefault();
                data[key].splice(idx, 1);
                StorageManager.saveData(storageKey, data);
                renderAllLists();
                renderCalendar(currentDate);
            });
            container.appendChild(el);
        });
    }

    function renderAllLists() {
        renderList('taskList', 'dailyTasks');
        renderList('shoppingList', 'shoppingList');
    }

    function addItem(inputId, storageKey) {
        const input = document.getElementById(inputId);
        const val = input.value.trim();
        if (!val) return;
        const key = formatDateKey(selectedDate);
        const data = StorageManager.getData(storageKey);
        if (!data[key]) data[key] = [];
        data[key].push({ text: val, completed: false });
        StorageManager.saveData(storageKey, data);
        input.value = '';
        renderAllLists();
        renderCalendar(currentDate);
    }

    document.getElementById('prevMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(currentDate); };
    document.getElementById('nextMonth').onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(currentDate); };

    document.getElementById('addTaskBtn').onclick = () => addItem('newTaskInput', 'dailyTasks');
    document.getElementById('newTaskInput').onkeypress = (e) => e.key === 'Enter' && addItem('newTaskInput', 'dailyTasks');
    document.getElementById('addShoppingBtn').onclick = () => addItem('newShoppingInput', 'shoppingList');
    document.getElementById('newShoppingInput').onkeypress = (e) => e.key === 'Enter' && addItem('newShoppingInput', 'shoppingList');

    // --- Toggles ---
    const tTasks = document.getElementById('showTasksBtn');
    const tShop = document.getElementById('showShoppingBtn');
    const vTasks = document.getElementById('taskListView');
    const vShop = document.getElementById('shoppingListView');

    tTasks.onclick = () => { tTasks.classList.add('active'); tShop.classList.remove('active'); vTasks.classList.add('active'); vShop.classList.remove('active'); };
    tShop.onclick = () => { tShop.classList.add('active'); tTasks.classList.remove('active'); vShop.classList.add('active'); vTasks.classList.remove('active'); };

    // --- Projects ---
    const projGrid = document.getElementById('projectGrid');
    const modal = document.getElementById('projectModal');

    function renderProjects() {
        projGrid.innerHTML = '';
        const projects = StorageManager.getProjects();
        projects.forEach(p => {
            const el = document.createElement('div');
            el.className = 'project-card';
            el.innerHTML = `<h3>${p.icon} ${p.title}</h3><p>${p.desc}</p><a href="${p.link}" target="_blank" class="card-link">Open</a>`;
            // Simplified delete for bento layout? maybe on long press or right click. 
            // For now, let's just make them view only to keep it clean, or add a remove button
            const del = document.createElement('span');
            del.innerHTML = '✕';
            del.style.cssText = 'position:absolute; top:5px; right:10px; cursor:pointer; color:#ff4d4d;';
            del.onclick = (e) => {
                e.preventDefault();
                if (confirm('Delete?')) {
                    StorageManager.saveProjects(projects.filter(x => x.id !== p.id));
                    renderProjects();
                }
            };
            el.appendChild(del);
            projGrid.appendChild(el);
        });
    }

    document.getElementById('triggerAddProject').onclick = () => { modal.style.display = 'grid'; };
    document.querySelector('.close-modal').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('projectForm').onsubmit = (e) => {
        e.preventDefault();
        const arr = StorageManager.getProjects();
        arr.push({
            id: Date.now(),
            title: document.getElementById('projTitle').value,
            desc: document.getElementById('projDesc').value,
            link: document.getElementById('projLink').value,
            icon: document.getElementById('projIcon').value
        });
        StorageManager.saveProjects(arr);
        modal.style.display = 'none';
        renderProjects();
        document.getElementById('projectForm').reset();
    };

    // --- Notes ---
    const noteMenu = document.getElementById('noteMenu');
    document.getElementById('hamburgerBtn').onclick = () => noteMenu.classList.add('open');
    document.querySelector('.close-note').onclick = () => noteMenu.classList.remove('open');
    const noteArea = document.getElementById('quickNoteArea');
    noteArea.value = localStorage.getItem('quickNote') || '';
    noteArea.oninput = () => localStorage.setItem('quickNote', noteArea.value);

    // --- Backup / Export Data ---
    document.getElementById('backupBtn').addEventListener('click', () => {
        const data = {
            dailyTasks: StorageManager.getData('dailyTasks'),
            shoppingList: StorageManager.getData('shoppingList'),
            projects: StorageManager.getProjects(),
            quickNote: localStorage.getItem('quickNote')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selcan_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Init
    renderCalendar(currentDate);
    renderAllLists();
    renderProjects();
});
