document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v10.0-final');

    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        // 운영자 모드 로직 (나중에 개발)
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        adminPanel.innerHTML = '<h2>운영자 모드 (개발 예정)</h2>';
    } else {
        // 일반 사용자 모드 초기화
        initializeApp();
    }
    
    function initializeApp() {
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
                html += `<h4>종족값 (총합: ${data.totalStats || 'N/A'})</h4><table class="stats-table">`;
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
                        const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', ''); // e.g. 'items' -> 'item'
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
                if (data.events || data.recurringEvents) {
                    renderCalendarView(contentDiv, data); // 캘린더 뷰어는 아직 미구현
                } else if (data.name?.ko && data.stats) {
                    renderPokemonView(contentDiv, data);
                } else if (data.description) {
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
                const gradeCategory = 'pokemonGrade';
                if (DB[gradeCategory] && DB.pokemonType?.lev4) {
                    const grades = {};
                    Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                        if (pokemon && pokemon.grade) {
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