document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v11.0-final-admin-form');

    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        initializeAppAdminMode();
    } else {
        initializeAppUserMode();
    }
    
    function initializeAppAdminMode() {
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        
        const adminContent = document.getElementById('admin-content');
        const codeOutput = document.getElementById('code-output');

        function renderAddPokemonForm() {
            const formContainer = document.getElementById('admin-form-container');
            if (!formContainer) return;

            const gradeOptions = DB.pokemonGrade.lev2.map(g => `<option value="${g.name}">${g.name}</option>`).join('');
            const natureOptions = DB.definitions.natures.map(n => `<div><input type="checkbox" id="nature-${n.id}" name="natures" value="${n.name}"><label for="nature-${n.id}" style="margin-left: 5px; font-weight: normal;">${n.name}</label></div>`).join('');
            const itemOptions = Object.entries(DB.item.lev4).map(([id, item]) => `<option value="${id}">${item.name}</option>`).join('');
            const runeOptions = Object.entries(DB.runeAndChip.lev4).filter(([id, item]) => DB.runeAndChip.lev3.rune.some(r => r.id === id)).map(([id, item]) => `<option value="${id}">${item.name}</option>`).join('');
            const chipOptions = Object.entries(DB.runeAndChip.lev4).filter(([id, item]) => DB.runeAndChip.lev3.chip.some(c => c.id === id)).map(([id, item]) => `<option value="${id}">${item.name}</option>`).join('');

            formContainer.innerHTML = `
                <h4>포켓몬 추가</h4>
                <fieldset><legend>기본 정보</legend>
                    <div class="form-group"><label for="p-name-ko">이름 (한글):</label><input type="text" id="p-name-ko"></div>
                    <div class="form-group"><label for="p-name-en">이름 (영문):</label><input type="text" id="p-name-en"></div>
                    <div class="form-group"><label for="p-grade">등급:</label><select id="p-grade"><option value="">--등급--</option>${gradeOptions}</select></div>
                    <div class="form-group"><label for="p-image-url">이미지 URL:</label><input type="text" id="p-image-url"></div>
                </fieldset>
                <fieldset><legend>종족값</legend>
                    <div class="form-group"><label for="p-total-stats">총합:</label><input type="number" id="p-total-stats" value="0"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label>HP:</label><input type="number" id="p-hp" value="0"></div>
                        <div class="form-group"><label>Speed:</label><input type="number" id="p-speed" value="0"></div>
                        <div class="form-group"><label>P.ATK:</label><input type="number" id="p-atk" value="0"></div>
                        <div class="form-group"><label>P.DEF:</label><input type="number" id="p-def" value="0"></div>
                        <div class="form-group"><label>SP.ATK:</label><input type="number" id="p-sp-atk" value="0"></div>
                        <div class="form-group"><label>SP.DEF:</label><input type="number" id="p-sp-def" value="0"></div>
                    </div>
                </fieldset>
                <fieldset><legend>추천 성격</legend><div id="p-natures-container" style="display: flex; flex-wrap: wrap; gap: 15px;">${natureOptions}</div></fieldset>
                <fieldset><legend>스킬</legend><div id="skills-list"></div><button type="button" class="add-btn" id="add-skill-btn">스킬 추가</button></fieldset>
                <fieldset><legend>추천 아이템</legend><div id="reco-items-list"></div><button type="button" class="add-btn" id="add-reco-item-btn">아이템 추가</button></fieldset>
                <fieldset><legend>추천 룬</legend><div id="reco-runes-list"></div><button type="button" class="add-btn" id="add-reco-rune-btn">룬 추가</button></fieldset>
                <fieldset><legend>추천 칩</legend><div id="reco-chips-list"></div><button type="button" class="add-btn" id="add-reco-chip-btn">칩 추가</button></fieldset>
                <button id="generate-pokemon-code" style="margin-top:20px; padding: 12px 20px; font-size: 16px; background-color: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">코드 생성</button>
            `;
        }

        function addDynamicField(containerId, optionsHTML) {
            const container = document.getElementById(containerId);
            const newItem = document.createElement('div');
            newItem.className = 'dynamic-list-item';
            
            if(containerId === 'skills-list') {
                newItem.innerHTML = `<input type="text" placeholder="스킬명(영문명)" class="skill-name-input" style="flex-grow:1;"><select class="skill-type-select"><option value="Active">Active</option><option value="Ultimate">Ultimate</option><option value="Passive">Passive</option></select><textarea rows="2" placeholder="스킬 설명" class="skill-desc-input" style="flex-grow:2;"></textarea><button type="button" class="remove-btn">삭제</button>`;
            } else {
                newItem.innerHTML = `<select class="reco-select" style="flex-grow:1;">${optionsHTML}</select><button type="button" class="remove-btn">삭제</button>`;
            }
            container.appendChild(newItem);
        }

        function handleGeneratePokemonCode() {
            const nameKo = document.getElementById('p-name-ko').value;
            const nameEn = document.getElementById('p-name-en').value;
            const grade = document.getElementById('p-grade').value;
            const imageURL = document.getElementById('p-image-url').value;
            const totalStats = document.getElementById('p-total-stats').value;
            const stats = { 'HP': document.getElementById('p-hp').value, 'Speed': document.getElementById('p-speed').value, 'P.ATK': document.getElementById('p-atk').value, 'P.DEF': document.getElementById('p-def').value, 'SP.ATK': document.getElementById('p-sp-atk').value, 'SP.DEF': document.getElementById('p-sp-def').value };
            
            const natures = Array.from(document.querySelectorAll('#p-natures-container input:checked')).map(cb => `'${cb.value}'`).join(', ');

            const skills = Array.from(document.querySelectorAll('#skills-list .dynamic-list-item')).map(item => {
                const name = item.querySelector('.skill-name-input').value.replace(/'/g, "\\'");
                const type = item.querySelector('.skill-type-select').value;
                const description = item.querySelector('.skill-desc-input').value.replace(/'/g, "\\'");
                return `{ name: '${name}', type: '${type}', description: '${description}' }`;
            }).join(',\n                    ');

            const recoItems = Array.from(document.querySelectorAll('#reco-items-list .reco-select')).map(select => {
                const selectedOption = select.options[select.selectedIndex];
                return `{ id: '${select.value}', name: '${selectedOption.text}', imageURL: '${selectedOption.dataset.imageUrl || ''}' }`;
            }).join(',\n                    ');
            
            const uniqueId = nameEn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            const lev4Code = `'${uniqueId}': {
    name: { ko: '${nameKo}', en: '${nameEn}' },
    grade: '${grade}',
    imageURL: '${imageURL}',
    stats: { 'HP': ${stats.HP}, 'Speed': ${stats.Speed}, 'P.ATK': ${stats['P.ATK']}, 'P.DEF': ${stats['P.DEF']}, 'SP.ATK': ${stats['SP.ATK']}, 'SP.DEF': ${stats['SP.DEF']} },
    totalStats: ${totalStats},
    natures: [${natures}],
    skills: [
                    ${skills}
                ],
    recommendedItems: [
                    ${recoItems}
                ],
    recommendedRunes: [],
    recommendedChips: []
},`;
            
            const lev3Code = `{ id: '${uniqueId}', name: '${nameKo}' },`;

            codeOutput.value = `/* --- 1. pokemonType.lev4 객체 안에 추가할 코드 --- */\n${lev4Code}\n\n/* --- 2. pokemonType.lev3['타입'] 배열 안에 추가할 코드 --- */\n${lev3Code}`;
            alert('코드가 생성되었습니다!');
        }

        function renderAdminDashboard() {
            adminContent.innerHTML = `<h3>데이터 추가 종류 선택</h3><select id="data-type-selector"><option value="">-- 종류 선택 --</option><option value="pokemon">포켓몬</option></select><div id="admin-form-container" style="margin-top: 20px;"></div>`;
        }
        
        renderAdminDashboard();

        document.getElementById('data-type-selector').addEventListener('change', (e) => {
            if (e.target.value === 'pokemon') { renderAddPokemonForm(); }
            else { document.getElementById('admin-form-container').innerHTML = `<h4>'${e.target.options[e.target.selectedIndex].text}' 추가 폼 (개발 예정)</h4>`; }
        });

        adminPanel.addEventListener('click', (e) => {
            if (e.target.id === 'generate-pokemon-code') handleGeneratePokemonCode();
            else if (e.target.classList.contains('remove-btn')) e.target.parentElement.remove();
            else if (e.target.id === 'add-skill-btn') addDynamicField('skills-list');
            else if (e.target.id === 'add-reco-item-btn') {
                const itemOptions = Object.entries(DB.item.lev4).map(([id, item]) => `<option value="${id}" data-image-url="${item.imageURL || ''}">${item.name}</option>`).join('');
                addDynamicField('reco-items-list', itemOptions);
            }
            else if (e.target.id === 'add-reco-rune-btn') {
                const runeOptions = DB.runeAndChip.lev3.rune.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
                addDynamicField('reco-runes-list', runeOptions);
            }
            else if (e.target.id === 'add-reco-chip-btn') {
                const chipOptions = DB.runeAndChip.lev3.chip.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
                addDynamicField('reco-chips-list', chipOptions);
            }
        });
    }

    function initializeAppUserMode() {
        const sidebar = document.getElementById('sidebar');
        const panels = { lev2: document.getElementById('lev2-panel'), lev3: document.getElementById('lev3-panel'), lev4: document.getElementById('lev4-panel') };
        let activeButtons = {};
        
        function showModal(title, contentHTML) {
            const existingModal = document.querySelector('.modal-overlay');
            if (existingModal) existingModal.remove();
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>${title}</h2><button class="modal-close-btn">&times;</button></div><div class="modal-body">${contentHTML}</div></div>`;
            document.body.appendChild(modalOverlay);
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay || e.target.closest('.modal-close-btn')) {
                    modalOverlay.remove();
                }
            });
        }
        
        function renderPokemonView(contentDiv, data) {
            let html = `<div class="pokemon-detail-view">`;
            html += `<h2>${data.name.ko} <span style="font-size:0.8em; color:#666;">${data.name.en}</span></h2>`;
            html += `<div class="grade">${data.grade} 등급</div>`;
            if (data.imageURL) { html += `<img src="${data.imageURL}" alt="${data.name.ko}" class="main-image">`; }
            if (data.stats) {
                const totalStats = data.totalStats || Object.values(data.stats).reduce((a, b) => a + b, 0);
                html += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">`;
                Object.entries(data.stats).forEach(([stat, value]) => { html += `<tr><td>${stat}</td><td>${value}</td></tr>`; });
                html += '</table>';
            }
            if (data.natures && data.natures.length > 0) { html += `<h4>추천 성격</h4><p>${data.natures.join(', ')}</p>`; }
            if (data.skills && data.skills.length > 0) {
                html += '<h4>스킬</h4><ul class="skill-list">';
                data.skills.forEach((skill, index) => { html += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; });
                html += '</ul>';
            }
            const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
            for(const type in recommendTypes) {
                if (data[type] && data[type].length > 0) {
                    html += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;
                    data[type].forEach(item => {
                        const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', '');
                        html += `<div class="recommend-item" data-item-id="${item.id}" data-item-type="${itemTypeForDB}">
                                    <img src="${item.imageURL}" alt="${item.name}"><span>${item.name}</span>
                                 </div>`;
                    });
                    html += `</div>`;
                }
            }
            html += `</div>`;
            contentDiv.innerHTML = html;
            
            contentDiv.querySelectorAll('.skill-name').forEach(el => {
                el.addEventListener('click', () => {
                    const skillIndex = parseInt(el.dataset.skillIndex);
                    const skill = data.skills[skillIndex];
                    showModal(skill.name, `<p>${skill.description}</p>`);
                });
            });
            contentDiv.querySelectorAll('.recommend-item').forEach(el => {
                el.addEventListener('click', () => {
                    const itemId = el.dataset.itemId;
                    const itemType = el.dataset.itemType;
                    const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : itemType;
                    const itemData = DB[dbKey]?.lev4?.[itemId];
                    if (itemData) {
                        let itemDetailHtml = `<p>${itemData.description || '상세 정보가 없습니다.'}</p>`;
                        if(itemData.baseStats) {
                            itemDetailHtml += '<h4>기초 타입</h4><table class="stats-table">';
                            Object.entries(itemData.baseStats).forEach(([stat, value]) => { if (value !== 0) { itemDetailHtml += `<tr><td>${stat}</td><td>+${value}</td></tr>`; } });
                            itemDetailHtml += '</table>';
                        }
                        showModal(itemData.name, itemDetailHtml);
                    } else {
                        alert('상세 정보를 찾을 수 없습니다.');
                    }
                });
            });
        }
        function renderSimpleView(contentDiv, data) {
            let html = `<h2>${data.name}</h2>`;
            if (data.imageURL && data.imageURL.startsWith('http')) { html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin: 10px 0;">`; }
            if (data.baseStats && Object.values(data.baseStats).some(v => v !== 0)) {
                html += '<h4>기초 타입</h4><table class="stats-table">';
                Object.entries(data.baseStats).forEach(([stat, value]) => { if (value !== 0) { html += `<tr><td>${stat}</td><td>+${value}</td></tr>`; } });
                html += '</table>';
            }
            if (data.description) {
                html += '<h4 style="margin-top: 15px;">휴대 효과</h4>';
                html += `<div class="item-description">${data.description.replace(/\\n/g, '\n')}</div>`;
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
                if (data.name?.ko && data.stats) { renderPokemonView(contentDiv, data); }
                else if (data.description) { renderSimpleView(contentDiv, data); } 
                else { contentDiv.innerHTML = data.content || "콘텐츠를 표시할 수 없습니다."; }
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
                const gradeCategory = 'pokemonGrade';
                if (DB[gradeCategory] && DB.pokemonType?.lev4) {
                    const grades = {};
                    Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                        if (pokemon && pokemon.grade && pokemon.name?.ko) {
                            if (!grades[pokemon.grade]) grades[pokemon.grade] = [];
                            grades[pokemon.grade].push({ ...pokemon, id: pokemonId });
                        }
                    });
                    DB[gradeCategory].lev3 = {};
                    Object.keys(grades).forEach(gradeKey => {
                        const gradeInfo = DB.pokemonGrade.lev2.find(g => g.name === gradeKey);
                        if (gradeInfo) {
                            const gradeId = gradeInfo.id;
                            DB[gradeCategory].lev3[gradeId] = grades[gradeKey].map(p => ({id: p.id, name: p.name.ko}));
                        }
                    });
                }
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
                if (menuId === 'pokemonGrade') { return DB.pokemonType.lev4[id]; }
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