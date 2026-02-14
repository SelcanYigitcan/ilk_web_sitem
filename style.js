document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
        });
    });

    // --- Data Management (LocalStorage) ---
    class StorageManager {
        static getTasks() {
            return JSON.parse(localStorage.getItem('dailyTasks')) || {};
        }

        static saveTasks(tasks) {
            localStorage.setItem('dailyTasks', JSON.stringify(tasks));
        }

        static getProjects() {
            return JSON.parse(localStorage.getItem('projects')) || [
                { id: 1, title: 'selcan.store', desc: 'Expiry: Feb 2027', link: '#', icon: '🌐' },
                { id: 2, title: 'Render & GitHub Pages', desc: 'Hosting Platforms', link: '#', icon: '☁️' },
                { id: 3, title: 'GitHub Repos', desc: 'Source Code', link: '#', icon: '🐙' }
            ];
        }

        static saveProjects(projects) {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }

    // --- Calendar & Daily Tasks ---
    let currentDate = new Date();
    let selectedDate = new Date();

    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearDisplay = document.getElementById('monthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    const taskList = document.getElementById('taskList');
    const selectedDateTitle = document.getElementById('selectedDateTitle');
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');

    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    function renderCalendar(date) {
        calendarGrid.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        monthYearDisplay.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Day Headers
        const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        days.forEach(day => {
            const el = document.createElement('div');
            el.className = 'calendar-day-header';
            el.textContent = day;
            calendarGrid.appendChild(el);
        });

        // Empty slots
        for (let i = 0; i < firstDay; i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        // Days
        const allTasks = StorageManager.getTasks();
        const today = new Date();

        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const dateKey = formatDateKey(d);

            const el = document.createElement('div');
            el.className = 'calendar-day';
            el.textContent = i;

            if (dateKey === formatDateKey(today)) el.classList.add('today');
            if (dateKey === formatDateKey(selectedDate)) el.classList.add('selected');
            if (allTasks[dateKey] && allTasks[dateKey].length > 0) el.classList.add('has-task');

            el.addEventListener('click', () => {
                selectedDate = d;
                renderCalendar(currentDate); // Re-render to update selection
                renderTasks();
            });

            calendarGrid.appendChild(el);
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const dateKey = formatDateKey(selectedDate);
        selectedDateTitle.textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        const allTasks = StorageManager.getTasks();
        const tasks = allTasks[dateKey] || [];

        tasks.forEach((task, index) => {
            const taskEl = document.createElement('label');
            taskEl.className = 'task-item';

            taskEl.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
                <span class="task-text">${task.text}</span>
                <button class="delete-btn" title="Delete Task">🗑️</button>
            `;

            // Toggle Check
            const checkbox = taskEl.querySelector('input');
            checkbox.addEventListener('change', () => {
                allTasks[dateKey][index].completed = checkbox.checked;
                StorageManager.saveTasks(allTasks);
            });

            // Delete Task
            const deleteBtn = taskEl.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent label click
                allTasks[dateKey].splice(index, 1);
                // Clean up empty date keys
                if (allTasks[dateKey].length === 0) delete allTasks[dateKey];
                StorageManager.saveTasks(allTasks);
                renderCalendar(currentDate); // Update dots
                renderTasks();
            });

            taskList.appendChild(taskEl);
        });
    }

    function addTask() {
        const text = newTaskInput.value.trim();
        if (!text) return;

        const dateKey = formatDateKey(selectedDate);
        const allTasks = StorageManager.getTasks();

        if (!allTasks[dateKey]) allTasks[dateKey] = [];
        allTasks[dateKey].push({ text, completed: false });

        StorageManager.saveTasks(allTasks);
        newTaskInput.value = '';
        renderTasks();
        renderCalendar(currentDate); // Update dots
    }

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    // --- Dynamic Project Manager ---
    const projectGrid = document.getElementById('projectGrid');
    const modal = document.getElementById('projectModal');
    const addProjectBtn = document.getElementById('addProjectBtn'); // This is the card button
    const closeModal = document.querySelector('.close-modal');
    const projectForm = document.getElementById('projectForm');

    function renderProjects() {
        const projects = StorageManager.getProjects();
        // Clear existing projects but keep the "Add Project" button (which is last)
        // Actually simpler to clear all and re-append "Add Project" button or filter

        // Save the add button
        const addBtn = document.getElementById('addProjectBtn');
        projectGrid.innerHTML = '';

        projects.forEach(proj => {
            const el = document.createElement('div');
            el.className = 'project-card';
            el.innerHTML = `
                <div class="card-icon">${proj.icon}</div>
                <h3>${proj.title}</h3>
                <p>${proj.desc}</p>
                <a href="${proj.link}" class="card-link" target="_blank">Open Link</a>
                <button class="delete-btn" style="position: absolute; top: 10px; right: 10px;">🗑️</button>
            `;

            // Delete Project
            el.querySelector('.delete-btn').addEventListener('click', () => {
                if (confirm('Delete this project?')) {
                    const newProjects = projects.filter(p => p.id !== proj.id);
                    StorageManager.saveProjects(newProjects);
                    renderProjects();
                }
            });

            projectGrid.appendChild(el);
        });

        projectGrid.appendChild(addBtn); // Append the button back
    }

    addProjectBtn.addEventListener('click', () => modal.style.display = "block");
    closeModal.addEventListener('click', () => modal.style.display = "none");
    window.addEventListener('click', (e) => {
        if (e.target == modal) modal.style.display = "none";
    });

    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const projects = StorageManager.getProjects();
        const newProject = {
            id: Date.now(),
            title: document.getElementById('projTitle').value,
            desc: document.getElementById('projDesc').value,
            link: document.getElementById('projLink').value,
            icon: document.getElementById('projIcon').value || '🚀'
        };
        projects.push(newProject);
        StorageManager.saveProjects(projects);

        projectForm.reset();
        modal.style.display = "none";
        renderProjects();
    });

    // --- Initialization ---
    renderCalendar(currentDate);
    renderTasks();
    renderProjects();
});
