document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v8.5-final');

    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');
    
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        // =============== 운영자 모드 실행 ===============
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        
        const adminContent = document.getElementById('admin-content');
        const codeOutput = document.getElementById('code-output');

        function renderAddItemForm() {
            const formContainer = document.getElementById('admin-form-container');
            if (!formContainer) return;
            formContainer.innerHTML = `
                <h4>아이템 추가</h4>
                <div class="form-group"><label for="item-name">아이템 이름:</label><input type="text" id="item-name" placeholder="예: 먹다남은음식"></div>
                <div class="form-group"><label for="item-image-url">이미지 URL:</label><input type="text" id="item-image-url" placeholder="https://..."></div>
                <fieldset style="margin-top:10px; border: 1px solid #ccc; padding: 10px;"><legend>기초 타입 (능력치)</legend><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group"><label for="item-hp">HP:</label><input type="number" id="item-hp" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-speed">스피드:</label><input type="number" id="item-speed" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-attack">공격:</label><input type="number" id="item-attack" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-defense">방어:</label><input type="number" id="item-defense" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-sp-attack">특수공격:</label><input type="number" id="item-sp-attack" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-sp-defense">특수방어:</label><input type="number" id="item-sp-defense" value="0" style="width: 80%;"></div>
                </div></fieldset>
                <div class="form-group"><label for="item-description">설명 (휴대 효과):</label><textarea id="item-description" rows="10" style="width: 95%;" placeholder="아이템에 대한 설명을 입력하세요."></textarea></div>
                <button id="generate-item-code" class="admin-button" style="margin-top:10px;">코드 생성</button>
            `;
        }
        
        function handleGenerateItemCode() {
            const name = document.getElementById('item-name').value;
            const imageUrl = document.getElementById('item-image-url').value;
            const description = document.getElementById('item-description').value;
            const stats = { 'HP': parseInt(document.getElementById('item-hp').value) || 0, '스피드': parseInt(document.getElementById('item-speed').value) || 0, '공격': parseInt(document.getElementById('item-attack').value) || 0, '방어': parseInt(document.getElementById('item-defense').value) || 0, '특수공격': parseInt(document.getElementById('item-sp-attack').value) || 0, '특수방어': parseInt(document.getElementById('item-sp-defense').value) || 0 };
            if (!name || !description) { alert('아이템 이름과 설명은 필수 항목입니다.'); return; }
            const id = name.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
            const formattedDescription = description.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
            const generatedCode =`'${id}': {\n    name: '${name}',\n    imageURL: '${imageUrl}',\n    baseStats: {\n        'HP': ${stats.HP}, '스피드': ${stats.스피드}, '공격': ${stats.공격},\n        '방어': ${stats.방어}, '특수공격': ${stats.특수공격}, '특수방어': ${stats.특수방어}\n    },\n    description: '${formattedDescription}'\n},`;
            codeOutput.value = generatedCode.trim();
            alert('코드가 생성되었습니다! 아래 텍스트 영역에서 복사하여 data.js의 item.lev4 객체 안에 추가하세요.');
        }

        function renderAdminDashboard() {
            adminContent.innerHTML = `<h3>데이터 추가 종류 선택</h3><select id="data-type-selector"><option value="">-- 종류를 선택하세요 --</option><option value="pokemon">포켓몬</option><option value="item">아이템</option><option value="rune">룬</option><option value="chip">칩</option><option value="deck">추천덱</option><option value="calendar">캘린더</option><option value="tip">팁&노하우</option></select><div id="admin-form-container" style="margin-top: 20px;"></div>`;
        }
        renderAdminDashboard();
        document.getElementById('data-type-selector').addEventListener('change', (e) => {
            const type = e.target.value;
            const formContainer = document.getElementById('admin-form-container');
            codeOutput.value = '';
            if (type === 'item') { renderAddItemForm(); } 
            else if (type) { const selectedText = e.target.options[e.target.selectedIndex].text; formContainer.innerHTML = `<h4>'${selectedText}' 추가 폼 (개발 예정)</h4>`; } 
            else { formContainer.innerHTML = ''; }
        });
        adminPanel.addEventListener('click', (e) => { if (e.target.id === 'generate-item-code') { handleGenerateItemCode(); } });

    } else {
        // =============== 일반 사용자 모드 실행 ===============
        const sidebar = document.getElementById('sidebar');
        const panels = { lev2: document.getElementById('lev2-panel'), lev3: document.getElementById('lev3-panel'), lev4: document.getElementById('lev4-panel') };
        let activeButtons = {};
        
        function renderSimpleView(contentDiv, data) {
            let html = `<h2>${data.name}</h2>`;
            if (data.imageURL && data.imageURL.startsWith('http')) {
                html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin: 10px 0;">`;
            }
            if (data.baseStats && Object.values(data.baseStats).some(v => v !== 0)) {
                html += '<h4>기초 타입</h4><table class="stats-table">';
                Object.entries(data.baseStats).forEach(([stat, value]) => {
                    if (value !== 0) {
                        html += `<tr><td>${stat}</td><td>+${value}</td></tr>`;
                    }
                });
                html += '</table>';
            }
            if (data.description) {
                html += '<h4 style="margin-top: 15px;">휴대 효과</h4>';
                const descriptionLines = data.description.split('\\n');
                let processedDescription = '';
                descriptionLines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
                        if (trimmedLine.includes(':')) {
                            const parts = trimmedLine.split(':');
                            processedDescription += `<p><strong>${parts[0]}:</strong> ${parts.slice(1).join(':')}</p>`;
                        } else {
                            processedDescription += `<p>${trimmedLine}</p>`;
                        }
                    }
                });
                html += `<div class="item-description">${processedDescription}</div>`;
            }
            contentDiv.innerHTML = html;
        }

        function renderPanel(level, data, menuId) {
            const targetPanel = panels[`lev${level}`];
            if (!targetPanel) return;
            const contentDiv = targetPanel.querySelector('.panel-content');
            contentDiv.innerHTML = '';
            setTimeout(() => { contentDiv.scrollTop = 0; }, 0);
            if (!data) { contentDiv.innerHTML = "데이터가 없습니다."; targetPanel.classList.add('visible'); return; }
            const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
            const finalLevelForCategory = categoryInfo ? categoryInfo.levels : 0;
            const isFinal = !Array.isArray(data);
            if (isFinal) {
                appContainer.className = `final-view-L${finalLevelForCategory}`;
                Object.values(panels).forEach(p => p.classList.remove('visible'));
                if (data.description) {
                    renderSimpleView(contentDiv, data);
                } else {
                    contentDiv.innerHTML = data.content || "콘텐츠를 표시할 수 없습니다.";
                }
            } else {
                appContainer.className = "";
                data.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'list-item';
                    button.textContent = item.name;
                    button.dataset.id = item.id;
                    button.dataset.level = level;
                    button.dataset.menuId = menuId;
                    if (item.color) { button.classList.add(`type-${item.color}`); }
                    contentDiv.appendChild(button);
                });
            }
            targetPanel.classList.add('visible');
        }
        
        function initialize() {
            try {
                sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
                addEventListeners();
            } catch (error) {
                console.error("초기화 중 오류 발생:", error);
                document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. data.js 또는 script.js 파일을 확인해주세요.";
            }
        }

        function addEventListeners() {
            appContainer.addEventListener('click', e => {
                const button = e.target.closest('button');
                if (button && button.classList.contains('back-btn')) handleBackClick(button);
                else if (button && button.dataset.level) handleMenuClick(button);
            });
        }

        function handleMenuClick(button) {
            const level = parseInt(button.dataset.level);
            const id = button.dataset.id;
            const menuId = button.dataset.menuId || id;
            if (level === 1) { appContainer.className = ""; }
            setActive(level, button);
            for (let i = level + 1; i <= 4; i++) {
                if (panels[`lev${i}`]) { panels[`lev${i}`].classList.remove('visible'); }
            }
            const nextLevel = level + 1;
            const nextData = getNextData(level, id, menuId);
            renderPanel(nextLevel, nextData, menuId);
        }
        
        function getNextData(currentLevel, id, menuId) {
            const nextLevel = currentLevel + 1;
            if (nextLevel === 2) return DB[menuId]?.lev2;
            if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
            if (nextLevel === 4) {
                return DB[menuId]?.lev4?.[id];
            }
            return null;
        }

        function handleBackClick(button) {
            const parentPanel = button.closest('.panel');
            const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
            parentPanel.classList.remove('visible');
            setActive(level - 1, null);
            appContainer.className = ""; 
        }

        function setActive(level, target) {
            for (let i = level; i <= 4; i++) {
                if (activeButtons[i]) {
                    activeButtons[i].classList.remove('active');
                    activeButtons[i] = null;
                }
            }
            if (target) {
                target.classList.add('active');
                activeButtons[level] = target;
            }
        }
        
        initializeApp();
    }
});