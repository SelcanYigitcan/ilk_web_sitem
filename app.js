/* 
    Selcan's Digital HQ - Main Application Logic 
    Phase 5: Final Visual Polish (Fluid Dots & Deep Shadow)
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. Global Vibrant Hidden Grid (Spotlight Reveal) ---
    function initDotMatrix() {
        console.log("--- initDotMatrix: Vibrant Hidden Grid ---");

        // 1. Cleanup Legacy
        const oldDot = document.getElementById('cursor-dot');
        const oldFollower = document.getElementById('cursor-follower');
        if (oldDot) oldDot.remove();
        if (oldFollower) oldFollower.remove();

        // 2. Cursor
        document.documentElement.style.cursor = 'auto';
        document.body.style.cursor = 'auto';

        // 3. Canvas Setup (Robust)
        let canvas = document.getElementById('bgCanvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'bgCanvas';
            document.body.prepend(canvas);
        }

        // Force Fullscreen Fixed
        Object.assign(canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            zIndex: '-1',
            pointerEvents: 'none',
            background: 'transparent'
        });

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // 4. Config
        const spacing = 50; // Grid spacing
        const revealRadius = 400; // Spotlight size
        const coreRadius = 100; // Dark shadow size
        const dragFactor = 0.15; // Responsive lag

        let particles = [];
        let mouse = { x: width / 2, y: height / 2 };
        let lagMouse = { x: width / 2, y: height / 2 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // First snap
            if (lagMouse.x === width / 2 && lagMouse.y === height / 2 && time < 10) {
                lagMouse.x = mouse.x;
                lagMouse.y = mouse.y;
            }
        });

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });

        class Particle {
            constructor(x, y) {
                this.originX = x;
                this.originY = y;
                this.x = x;
                this.y = y;

                // Shape: Small Circle/Dot (Classic)
                this.size = 2 + Math.random() * 2;

                // Float properties
                this.floatSpeed = 0.01 + Math.random() * 0.02;
                this.floatOffset = Math.random() * 100;

                // Colors: Neon HSL
                // Cyan(180), Magenta(300), Lime(120), Purple(260)
                const hues = [180, 300, 120, 260];
                this.hue = hues[Math.floor(Math.random() * hues.length)];
            }

            draw(time) {
                // 1. Float Motion
                const wobbleX = Math.sin(time * this.floatSpeed + this.floatOffset) * 5;
                const wobbleY = Math.cos(time * this.floatSpeed + this.floatOffset) * 5;

                this.x = this.originX + wobbleX;
                this.y = this.originY + wobbleY;

                // 2. Distance to LagMouse
                const dx = this.x - lagMouse.x;
                const dy = this.y - lagMouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // 3. Visibility Check (Spotlight)
                if (dist > revealRadius) return; // Hidden Grid

                // 4. Color & Alpha Logic
                let alpha = 0;
                let fillStyle = '';
                let scale = 1;

                if (dist < coreRadius) {
                    // --- CORE SHADOW (Dark) ---
                    // Closer to center = Darker/Stronger shadow
                    const t = dist / coreRadius; // 0 to 1
                    alpha = 0.8 + (1 - t) * 0.2; // 0.8 to 1.0
                    fillStyle = `rgba(20, 20, 30, ${alpha})`;
                    scale = 1.5; // Slightly larger in core
                } else {
                    // --- NEON AURA (Vibrant) ---
                    // Fade out as we go from coreRadius to revealRadius
                    // dist goes from 100 to 400
                    // t goes from 0 to 1
                    const t = (dist - coreRadius) / (revealRadius - coreRadius);
                    alpha = 1 - t; // 1 to 0

                    if (alpha < 0.05) return;

                    // Boost saturation
                    fillStyle = `hsla(${this.hue}, 95%, 60%, ${alpha})`;
                }

                ctx.fillStyle = fillStyle;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * scale, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Create Grid
            for (let y = 0; y < height; y += spacing) {
                for (let x = 0; x < width; x += spacing) {
                    particles.push(new Particle(x, y));
                }
            }
            console.log(`Grid Created: ${particles.length} dots`);
        }

        let time = 0;
        function animate() {
            ctx.clearRect(0, 0, width, height);
            time++;

            // Lag Mouse Update
            lagMouse.x += (mouse.x - lagMouse.x) * dragFactor;
            lagMouse.y += (mouse.y - lagMouse.y) * dragFactor;

            if (particles.length === 0) initParticles();

            particles.forEach(p => p.draw(time));

            requestAnimationFrame(animate);
        }

        initParticles();
        animate();
    }

    // --- 1. Global Navbar Injection (DRY Principle) ---
    function renderNavbar() {
        const header = document.getElementById('global-header');
        if (!header) return;

        const activePath = window.location.pathname;
        const navLinks = [
            { name: 'Home', path: 'index.html' },
            { name: 'About', path: 'about.html' },
            { name: 'Projects', path: 'projects.html' },
            { name: 'Contact', path: 'contact.html' }
        ];

        const linksHTML = navLinks.map(link => {
            const isActive = activePath.includes(link.path) || (link.path === 'index.html' && (activePath.endsWith('/') || activePath.endsWith('index.html')));
            return `<a href="${link.path}" class="nav-link ${isActive ? 'active' : ''}">${link.name}</a>`;
        }).join('');

        header.innerHTML = `
        <nav class="navbar">
            <div class="logo">Selcan.dev</div>

            <!-- Navigation Links -->
            <div class="nav-center">
                ${linksHTML}
            </div>

            <!-- Utility Tools -->
            <div class="nav-tools">
                <!-- Date Display -->
                <div id="currentDate" class="date-display">...</div>
                
                <!-- Tool Buttons -->
                <button class="tool-btn" id="btnCalendar" title="Planner">
                    <i class="far fa-calendar-alt"></i>
                </button>
                <button class="tool-btn" id="btnDailyTasks" title="Daily Tasks">
                    <i class="fas fa-check-double"></i>
                </button>
                <button class="tool-btn" id="btnLearningLog" title="Learning Log">
                    <i class="fas fa-book-open"></i>
                </button>
                <button class="tool-btn" id="btnSecret" title="Secure Area">
                    <i class="fas fa-lock"></i>
                </button>
            </div>
        </nav>

        <!-- Tool Panels (Injected Here) -->
        
        <!-- Calendar Widget -->
        <div id="calendarWidget" class="floating-widget">
            <div class="cal-header">
                <button id="prevMonth">&lt;</button>
                <span id="monthYearDisplay">Month Year</span>
                <button id="nextMonth">&gt;</button>
            </div>
            <div class="cal-grid" id="calendarGrid"></div>
        </div>

        <!-- Date-Specific Tasks Panel -->
        <div id="taskPanel" class="side-panel">
            <div class="panel-header">
                <h3 id="taskPanelTitle">Daily Tasks 🎯</h3>
                <button class="close-btn" id="closeTaskPanel">×</button>
            </div>
            <div class="panel-content">
                <p id="selectedDateDisplay" style="margin-bottom:15px; font-weight:600; color:var(--accent-color);"></p>
                <div class="add-task-box">
                    <input type="text" id="newTaskInput" placeholder="Add task for this day..." autocomplete="off">
                    <button id="addTaskBtn" title="Add Task"><i class="fas fa-plus"></i></button>
                </div>
                <ul id="taskList" class="task-list"></ul>
            </div>
        </div>

        <!-- Learning Log Panel -->
        <div id="notePanel" class="side-panel">
            <div class="panel-header">
                <h3>Learning Log 📚</h3>
                <button class="close-btn" id="closeNotePanel">×</button>
            </div>
            <div class="panel-content">
                <div class="log-status-bar">
                    <span id="saveLogStatus">Autosave Ready</span>
                </div>
                <textarea id="learningLogArea" placeholder="What did you learn today? Write your notes here..." spellcheck="false"></textarea>
            </div>
        </div>

        <!-- Security Modal -->
        <div id="securityModal" class="modal-overlay">
            <div class="modal-card">
                <span class="close-modal" id="closeSecurityModal">&times;</span>
                <div id="passwordSection">
                    <h3><i class="fas fa-user-secret"></i> Restricted Access</h3>
                    <p>Enter PIN to view confidential projects.</p>
                    <div class="pass-input-group">
                        <input type="password" id="passInput" placeholder="PIN" maxlength="4">
                        <button id="authBtn">Unlock</button>
                    </div>
                    <p id="authMsg" class="error-msg"></p>
                </div>
                <div id="secretContent" class="hidden">
                    <h3><i class="fas fa-folder-open"></i> Confidential Projects</h3>
                    <div class="project-list">
                        <div class="secret-item"><h4>Render Deployment</h4><p>Static Web App (SPA->MPA Transformation)</p><span class="tag">Infra</span></div>
                        <div class="secret-item"><h4>Domain Management</h4><p>selcan.store (Spaceship DNS Config)</p><span class="tag">Network</span></div>
                        <div class="secret-item"><h4>Academic Research</h4><p>Knowledge Management: OpenAI History</p><span class="tag">Research</span></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    // --- 2. Tool Initialization ---
    function initTools() {
        // --- Shared State ---
        let currentSelectedDateKey = null;

        // Date Display
        const dateEl = document.getElementById('currentDate');
        if (dateEl) {
            const now = new Date();
            dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            currentSelectedDateKey = `tasks_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        }

        // --- Panel Toggles ---
        const taskBtn = document.getElementById('btnDailyTasks');
        const noteBtn = document.getElementById('btnLearningLog');
        const calendarBtn = document.getElementById('btnCalendar');
        const secretBtn = document.getElementById('btnSecret');

        const taskPanel = document.getElementById('taskPanel');
        const notePanel = document.getElementById('notePanel');
        const calendarWidget = document.getElementById('calendarWidget');
        const securityModal = document.getElementById('securityModal');

        const closeTask = document.getElementById('closeTaskPanel');
        const closeNote = document.getElementById('closeNotePanel');
        const closeSecurity = document.getElementById('closeSecurityModal');

        function togglePanel(panel) {
            [taskPanel, notePanel, calendarWidget].forEach(p => {
                if (p && p !== panel) p.classList.remove('active');
            });
            if (panel) panel.classList.toggle('active');
        }

        if (taskBtn) taskBtn.addEventListener('click', () => {
            const now = new Date();
            openTaskPanel(now);
        });
        if (noteBtn) noteBtn.addEventListener('click', () => togglePanel(notePanel));
        if (calendarBtn) calendarBtn.addEventListener('click', () => togglePanel(calendarWidget));
        if (closeTask) closeTask.addEventListener('click', () => taskPanel.classList.remove('active'));
        if (closeNote) closeNote.addEventListener('click', () => notePanel.classList.remove('active'));
        if (closeSecurity) closeSecurity.addEventListener('click', () => securityModal.classList.remove('active'));

        // --- DATE-SPECIFIC TASKS LOGIC ---
        const taskInput = document.getElementById('newTaskInput');
        const taskList = document.getElementById('taskList');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskPanelTitle = document.getElementById('taskPanelTitle');
        const selectedDateDisplay = document.getElementById('selectedDateDisplay');

        function openTaskPanel(date) {
            const key = `tasks_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            currentSelectedDateKey = key;

            if (selectedDateDisplay) {
                selectedDateDisplay.textContent = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            }
            if (!taskPanel.classList.contains('active')) {
                togglePanel(taskPanel);
            }

            renderTasks(key);
        }

        function renderTasks(key) {
            if (!taskList) return;
            taskList.innerHTML = '';
            const tasks = JSON.parse(localStorage.getItem(key)) || [];
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <label class="custom-checkbox">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <span class="task-text">${task.text}</span>
                    <button class="delete-task" style="margin-left:auto; background:none; border:none; color:#ff7675; cursor:pointer; font-size:1.2rem;">&times;</button>
                `;
                li.querySelector('input').addEventListener('change', (e) => {
                    tasks[index].completed = e.target.checked;
                    localStorage.setItem(key, JSON.stringify(tasks));
                    renderTasks(key);
                });
                li.querySelector('.delete-task').addEventListener('click', () => {
                    tasks.splice(index, 1);
                    localStorage.setItem(key, JSON.stringify(tasks));
                    renderTasks(key);
                });
                taskList.appendChild(li);
            });
        }

        function addTask() {
            if (!currentSelectedDateKey) return;
            const text = taskInput.value.trim();
            if (!text) return;
            const tasks = JSON.parse(localStorage.getItem(currentSelectedDateKey)) || [];
            tasks.push({ text, completed: false });
            localStorage.setItem(currentSelectedDateKey, JSON.stringify(tasks));
            taskInput.value = '';
            renderTasks(currentSelectedDateKey);
        }

        if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
        if (taskInput) taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

        // --- FUNCTIONAL CALENDAR LOGIC ---
        const monthYearDisplay = document.getElementById('monthYearDisplay');
        const calendarGrid = document.getElementById('calendarGrid');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        let calDate = new Date();

        function renderCalendar(date) {
            if (!calendarGrid) return;
            calendarGrid.innerHTML = '';
            const year = date.getFullYear();
            const month = date.getMonth();
            if (monthYearDisplay) monthYearDisplay.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

            ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
                const el = document.createElement('div');
                el.className = 'cal-day-name';
                el.textContent = d;
                calendarGrid.appendChild(el);
            });

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();

            for (let i = 0; i < firstDay; i++) calendarGrid.appendChild(document.createElement('div'));

            for (let i = 1; i <= daysInMonth; i++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'cal-day';
                dayEl.textContent = i;

                const thisDateKey = `tasks_${year}-${month + 1}-${i}`;
                const hasTasks = JSON.parse(localStorage.getItem(thisDateKey))?.length > 0;
                if (hasTasks) dayEl.classList.add('has-task');
                if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
                    dayEl.classList.add('today');
                }
                dayEl.addEventListener('click', () => {
                    const selectedDate = new Date(year, month, i);
                    openTaskPanel(selectedDate);
                });
                calendarGrid.appendChild(dayEl);
            }
        }

        if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(calDate); });
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(calDate); });
        renderCalendar(calDate);

        // --- Learning Log Logic ---
        const logArea = document.getElementById('learningLogArea');
        const saveLogStatus = document.getElementById('saveLogStatus');
        if (logArea) {
            logArea.value = localStorage.getItem('learningLog') || '';
            let timeout;
            logArea.addEventListener('input', () => {
                clearTimeout(timeout);
                if (saveLogStatus) saveLogStatus.textContent = 'Typing...';
                timeout = setTimeout(() => {
                    localStorage.setItem('learningLog', logArea.value);
                    if (saveLogStatus) {
                        saveLogStatus.textContent = 'Saved ✓';
                        setTimeout(() => { saveLogStatus.textContent = 'Autosave Ready'; }, 2000);
                    }
                }, 1000);
            });
        }

        // --- Security Vault Logic ---
        if (secretBtn) secretBtn.addEventListener('click', () => {
            togglePanel(null);
            if (securityModal) {
                securityModal.classList.add('active');
                const passInput = document.getElementById('passInput');
                if (passInput) { passInput.value = ''; passInput.focus(); }
            }
        });

        const authBtn1 = document.getElementById('authBtn');
        const passInput1 = document.getElementById('passInput');
        const passwordSection1 = document.getElementById('passwordSection');
        const secretContent1 = document.getElementById('secretContent');
        const authMsg1 = document.getElementById('authMsg');

        function checkPass() {
            if (btoa(passInput1.value) === 'MTIzNA==') {
                passwordSection1.classList.add('hidden');
                secretContent1.classList.remove('hidden');
            } else {
                authMsg1.textContent = 'Incorrect PIN';
                passInput1.value = '';
            }
        }

        if (authBtn1) authBtn1.addEventListener('click', checkPass);
        if (passInput1) passInput1.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPass(); });
    }

    // --- Execution Order ---
    initDotMatrix(); // 0. Start Background
    renderNavbar();  // 1. Inject HTML
    initTools();     // 2. Attach Logic 
});
