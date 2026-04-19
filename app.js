// app.js - Logic for Lanyun District Prosecutors Office Case Management System

// Default Mock Data
const DEFAULT_CASES = [];

function getCases() {
    const cases = localStorage.getItem('lanyun_cases');
    return cases ? JSON.parse(cases) : DEFAULT_CASES;
}

function saveCases(cases) {
    localStorage.setItem('lanyun_cases', JSON.stringify(cases));
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dark Mode Logic ---
    const savedTheme = localStorage.getItem('lanyun_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    const darkModeToggle = document.getElementById('darkMode');
    if (darkModeToggle) {
        if (savedTheme === 'dark') {
            darkModeToggle.checked = true;
        }
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('lanyun_theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('lanyun_theme', 'light');
            }
        });
    }
    // --- Routing/Page Detection ---
    const isLoginPage = document.getElementById('loginForm') !== null;
    const isDashboardPage = document.getElementById('casesTableBody') !== null;
    const isCasesManagementPage = document.getElementById('casesManagementTableBody') !== null;

    // Initialize cases on first load
    if (!localStorage.getItem('lanyun_cases')) {
        saveCases(DEFAULT_CASES);
    }

    // --- Login Logic ---
    if (isLoginPage) {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                window.location.href = 'dashboard.html';
            } else {
                errorMessage.style.display = 'block';
            }
        });
    }

    // --- Dashboard & Global User Logic ---
    const usernameDisplay = document.getElementById('userNameDisplay');
    const storedUsername = localStorage.getItem('username');
    if (storedUsername && usernameDisplay) {
        usernameDisplay.textContent = storedUsername;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            window.location.href = 'index.html';
        });
    }

    // --- Dashboard Specific Logic ---
    if (isDashboardPage && !isCasesManagementPage) {
        const cases = getCases();
        const tableBody = document.getElementById('casesTableBody');
        
        // Render stats
        document.getElementById('statTotal').textContent = cases.length;
        document.getElementById('statInvestigating').textContent = cases.filter(c => c.status === '偵查中').length;
        document.getElementById('statPending').textContent = cases.filter(c => c.status === '待結案').length;
        document.getElementById('statClosed').textContent = cases.filter(c => c.status === '已結案' || c.status === '已起訴').length;

        if (tableBody) {
            tableBody.innerHTML = '';
            // Show only top 5 recent cases
            cases.slice(0, 5).forEach(caseItem => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${caseItem.id}</strong></td>
                    <td>${caseItem.title}</td>
                    <td>${caseItem.prosecutor}</td>
                    <td><span class="badge badge-${caseItem.statusClass}">${caseItem.status}</span></td>
                    <td>${caseItem.date}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // --- Cases Management Page Logic ---
    if (isCasesManagementPage) {
        let cases = getCases();
        const tableBody = document.getElementById('casesManagementTableBody');
        const caseModal = document.getElementById('caseModal');
        const caseForm = document.getElementById('caseForm');
        let currentEditId = null;

        function renderCases(data) {
            tableBody.innerHTML = '';
            data.forEach((caseItem, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${caseItem.id}</strong></td>
                    <td>${caseItem.title}</td>
                    <td>${caseItem.prosecutor}</td>
                    <td><span class="badge badge-${caseItem.statusClass}">${caseItem.status}</span></td>
                    <td>${caseItem.date}</td>
                    <td>
                        <button class="btn btn-outline view-btn" data-index="${index}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;">檢視/編輯</button>
                        <button class="btn btn-outline delete-btn" data-index="${index}" style="padding: 0.2rem 0.5rem; font-size: 0.8rem; margin-left: 0.5rem; color: var(--danger); border-color: var(--danger);">刪除</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            // Bind events
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', (e) => openModal(e.target.dataset.index));
            });
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm('確定要刪除此案件嗎？')) {
                        cases.splice(e.target.dataset.index, 1);
                        saveCases(cases);
                        renderCases(cases);
                    }
                });
            });
        }

        renderCases(cases);

        // Search filtering
        document.getElementById('caseSearchInput').addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = cases.filter(c => c.id.toLowerCase().includes(query) || c.title.includes(query));
            renderCases(filtered);
        });

        // Modal Logic
        document.getElementById('addCaseBtn').addEventListener('click', () => {
            currentEditId = null;
            caseForm.reset();
            document.getElementById('modalTitle').textContent = '新增案件';
            caseModal.classList.add('active');
        });

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                caseModal.classList.remove('active');
            });
        });

        function openModal(index) {
            currentEditId = index;
            const caseItem = cases[index];
            document.getElementById('modalTitle').textContent = '檢視 / 編輯案件';
            document.getElementById('modalCaseId').value = caseItem.id;
            document.getElementById('modalTitleInput').value = caseItem.title;
            document.getElementById('modalProsecutor').value = caseItem.prosecutor;
            document.getElementById('modalStatus').value = caseItem.status;
            document.getElementById('modalDate').value = caseItem.date;
            document.getElementById('modalCourtDate').value = caseItem.courtDate || '';
            document.getElementById('modalCourtTime').value = caseItem.courtTime || '';
            document.getElementById('modalNotes').value = caseItem.notes || '';
            caseModal.classList.add('active');
        }

        caseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newCase = {
                id: document.getElementById('modalCaseId').value,
                title: document.getElementById('modalTitleInput').value,
                prosecutor: document.getElementById('modalProsecutor').value,
                status: document.getElementById('modalStatus').value,
                date: document.getElementById('modalDate').value,
                courtDate: document.getElementById('modalCourtDate').value,
                courtTime: document.getElementById('modalCourtTime').value,
                notes: document.getElementById('modalNotes').value,
            };

            // Determine status class
            if (newCase.status === '已結案' || newCase.status === '已起訴') newCase.statusClass = 'success';
            else if (newCase.status === '待結案') newCase.statusClass = 'danger';
            else newCase.statusClass = 'warning';

            if (currentEditId !== null) {
                cases[currentEditId] = newCase;
            } else {
                cases.unshift(newCase); // Add to top
            }

            saveCases(cases);
            renderCases(cases);
            caseModal.classList.remove('active');
        });
    }

    // --- Public Search Logic ---
    const publicSearchForm = document.getElementById('publicSearchForm');
    if (publicSearchForm) {
        publicSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('publicSearchInput').value.trim();
            if (searchInput) {
                document.getElementById('publicEmptyState').style.display = 'none';
                const timelineContainer = document.getElementById('publicTimelineContainer');
                timelineContainer.style.display = 'block';
                
                document.getElementById('searchResultId').textContent = searchInput;
                
                const allCases = getCases();
                const foundCase = allCases.find(c => c.id.toLowerCase() === searchInput.toLowerCase());
                
                const timelineDiv = timelineContainer.querySelector('.timeline');
                timelineDiv.innerHTML = ''; // Clear existing
                
                if (foundCase) {
                    // Show case found
                    timelineDiv.innerHTML = `
                        <div class="timeline-item">
                            <div class="timeline-content">
                                <span class="timeline-date">最後更新：${foundCase.date}</span>
                                <h4 class="timeline-title">${foundCase.title}</h4>
                                <p class="timeline-desc">目前狀態：<strong style="color: var(--primary-color);">${foundCase.status}</strong></p>
                                ${foundCase.courtDate ? `<p class="timeline-desc" style="margin-top: 0.5rem; color: var(--danger);">📅 庭期：${foundCase.courtDate} ${foundCase.courtTime || ''}</p>` : ''}
                            </div>
                        </div>
                    `;
                } else {
                    // Not found
                    timelineDiv.innerHTML = `
                        <div class="timeline-item">
                            <div class="timeline-content">
                                <span class="timeline-date">查無資料</span>
                                <h4 class="timeline-title" style="color: var(--danger);">查無此案件紀錄</h4>
                                <p class="timeline-desc">系統尚未匯入該案件之相關歷程，請確認您輸入的案號是否正確。</p>
                            </div>
                        </div>
                    `;
                }
            }
        });
    }

    // --- Upload Logic ---
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            setTimeout(() => {
                document.getElementById('uploadSuccess').style.display = 'block';
                uploadForm.reset();
                setTimeout(() => {
                    document.getElementById('uploadSuccess').style.display = 'none';
                }, 3000);
            }, 500);
        });
    }

    // --- Calendar Logic ---
    const calendarGrid = document.getElementById('calendarGrid');
    if (calendarGrid) {
        const monthYearDisplay = document.getElementById('currentMonthYear');
        const prevBtn = document.getElementById('prevMonthBtn');
        const nextBtn = document.getElementById('nextMonthBtn');
        
        let currentDate = new Date(); // Start with today

        function renderCalendar() {
            calendarGrid.innerHTML = ''; // Clear grid
            
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth(); // 0-11
            
            // Set Title
            monthYearDisplay.textContent = `${year} 年 ${month + 1} 月`;
            
            // Add Day Headers
            const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
            daysOfWeek.forEach(day => {
                const header = document.createElement('div');
                header.className = 'calendar-header';
                header.textContent = day;
                calendarGrid.appendChild(header);
            });
            
            // Calculate padding and days
            const firstDayIndex = new Date(year, month, 1).getDay(); // 0-6
            const daysInMonth = new Date(year, month + 1, 0).getDate(); // 28-31
            
            // Empty slots before 1st
            for (let i = 0; i < firstDayIndex; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'calendar-day';
                emptySlot.style.backgroundColor = '#f1f5f9';
                calendarGrid.appendChild(emptySlot);
            }
            
            // Actual days
            for (let i = 1; i <= daysInMonth; i++) {
                const daySlot = document.createElement('div');
                daySlot.className = 'calendar-day';
                
                // Highlight today
                const isToday = new Date().toDateString() === new Date(year, month, i).toDateString();
                const todayStyle = isToday ? 'background-color: var(--primary-color); color: white; padding: 2px 6px; border-radius: 4px;' : '';
                
                daySlot.innerHTML = `<span class="calendar-date" style="${todayStyle}">${i}</span>`;
                
                // Add events for this day
                const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const allCases = getCases();
                allCases.forEach(c => {
                    if (c.courtDate === currentDayStr) {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event danger';
                        eventDiv.style.marginTop = '0.5rem';
                        eventDiv.textContent = `${c.courtTime || ''} ${c.id}`;
                        daySlot.appendChild(eventDiv);
                    }
                });

                calendarGrid.appendChild(daySlot);
            }
        }
        
        renderCalendar();
        
        prevBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        nextBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
});
