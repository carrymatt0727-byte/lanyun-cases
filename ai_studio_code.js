// 初始化資料
function getCases() {
    const data = localStorage.getItem('lanyun_cases');
    return data ? JSON.parse(data) : [
        { id: '112偵123', title: '毒品防制條例案件', status: '偵查中', date: '2023-10-01', documents: [] }
    ];
}

function saveCases(cases) {
    localStorage.setItem('lanyun_cases', JSON.stringify(cases));
}

document.addEventListener('DOMContentLoaded', () => {
    const cases = getCases();

    // --- 1. 市民公開查詢邏輯 ---
    const publicSearchForm = document.getElementById('publicSearchForm');
    if (publicSearchForm) {
        publicSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('publicSearchInput').value.trim();
            const resultContainer = document.getElementById('publicTimelineContainer');
            const timeline = resultContainer.querySelector('.timeline');
            
            document.getElementById('publicEmptyState').style.display = 'none';
            resultContainer.style.display = 'block';
            document.getElementById('searchResultId').textContent = query;

            const found = cases.find(c => c.id === query);
            if (found) {
                let docsHtml = found.documents && found.documents.length > 0 ? 
                    found.documents.map(d => `
                        <div class="doc-item">
                            <span>📄 [${d.type}] ${d.name} (${d.date})</span>
                            <button class="btn-orange" onclick="alert('下載中...')">下載 PDF</button>
                        </div>
                    `).join('') : '<p style="color:#888; font-size:0.9rem;">目前尚無公開之裁判文書。</p>';

                timeline.innerHTML = `
                    <div class="timeline-card">
                        <h4>案件案由：${found.title}</h4>
                        <p>目前狀態：<strong style="color:var(--judicial-green)">${found.status}</strong></p>
                        <p>更新日期：${found.date}</p>
                        <div style="margin-top:15px; border-top:1px dashed #ccc; padding-top:10px;">
                            <strong>相關裁判文書下載：</strong>
                            ${docsHtml}
                        </div>
                    </div>
                `;
            } else {
                timeline.innerHTML = `<p style="color:red; padding:20px;">查無案件資料，請確認案號正確（例：112偵123）。</p>`;
            }
        });
    }

    // --- 2. 管理員上傳文件邏輯 ---
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const caseId = document.getElementById('caseId').value.trim();
            const type = document.getElementById('judgmentType').value;
            const fileInput = document.getElementById('documentFile');
            const fileName = fileInput.files[0] ? fileInput.files[0].name : "文件.pdf";

            let allCases = getCases();
            const idx = allCases.findIndex(c => c.id === caseId);

            if (idx !== -1) {
                if (!allCases[idx].documents) allCases[idx].documents = [];
                allCases[idx].documents.push({
                    type: type,
                    name: fileName,
                    date: new Date().toLocaleDateString()
                });
                saveCases(allCases);
                document.getElementById('uploadSuccess').style.display = 'block';
                uploadForm.reset();
            } else {
                alert('系統查無案號：' + caseId + '。請先到「案件管理」建立案件。');
            }
        });
    }

    // --- 3. 管理員登入邏輯 ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        });
    }

    // --- 4. 案件列表渲染 (CRUD 簡化版) ---
    const tableBody = document.getElementById('casesManagementTableBody');
    if (tableBody) {
        function renderTable() {
            const currentCases = getCases();
            tableBody.innerHTML = currentCases.map((c, i) => `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.title}</td>
                    <td>${c.status}</td>
                    <td><button onclick="alert('開發中')">編輯</button></td>
                </tr>
            `).join('');
        }
        renderTable();

        const addCaseBtn = document.getElementById('addCaseBtn');
        const modal = document.getElementById('caseModal');
        const caseForm = document.getElementById('caseForm');

        addCaseBtn.onclick = () => modal.classList.add('active');
        document.querySelector('.modal-close').onclick = () => modal.classList.remove('active');

        caseForm.onsubmit = (e) => {
            e.preventDefault();
            const newCase = {
                id: document.getElementById('modalCaseId').value,
                title: document.getElementById('modalTitleInput').value,
                status: document.getElementById('modalStatus').value,
                date: new Date().toLocaleDateString(),
                documents: []
            };
            const all = getCases();
            all.unshift(newCase);
            saveCases(all);
            location.reload();
        };
    }

    // --- 5. 儀表板數據 ---
    if (document.getElementById('statTotal')) {
        document.getElementById('statTotal').textContent = cases.length;
        document.getElementById('statInvestigating').textContent = cases.filter(c => c.status === '偵查中').length;
    }

    // --- 6. 登出 ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'index.html';
        };
    }
});