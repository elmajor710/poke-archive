document.addEventListener('DOMContentLoaded', () => {
    // Firebase 초기화
    if (window.firebase && window.firebaseConfig) {
        try {
            firebase.initializeApp(window.firebaseConfig);
            window.db = firebase.firestore();
        } catch (e) {
            console.error("Firebase 초기화 실패:", e);
            document.body.innerHTML = "<h4>사이트 로딩에 실패했습니다. Firebase 설정에 문제가 있습니다.</h4>";
            return;
        }
    } else {
        console.error("Firebase 라이브러리 또는 설정이 로드되지 않았습니다.");
        document.body.innerHTML = "<h4>사이트 로딩에 실패했습니다. Firebase 라이브러리를 불러올 수 없습니다.</h4>";
        return;
    }

    // --- 전역 변수 ---
    const appContainer = document.getElementById('app-container');
    const homeButton = document.getElementById('home-button');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');
    const initialContent = document.getElementById('initial-content');
    const noticeList = document.getElementById('notice-list');
    const popularList = document.getElementById('popular-list');
    const panels = {
        lev1: sidebar,
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    let activeButtons = {};
    const isMobile = () => window.innerWidth <= 1199;

    // --- 메인 실행 ---
    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            addEventListeners();
            populateInitialContent();
            setupAdObservers();
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "<h4>사이트 초기화 중 오류가 발생했습니다.</h4>";
        }
    }

    // --- 데이터 로딩 및 준비 ---
    async function fetchAllDataFromFirebase() {
        const collectionsToFetch = {
            pokemon: db.collection('pokemon').where("isPublished", "==", true),
            items: db.collection('items').where("isPublished", "==", true),
            runeAndChips: db.collection('runeAndChips').where("isPublished", "==", true),
            tips: db.collection('tips').where("isPublished", "==", true),
            recommendedDecks: db.collection('recommendedDecks').where("isPublished", "==", true),
            events: db.collection('events'),
            announcements: db.collection('announcements').where("isPublished", "==", true)
        };
        const promises = Object.values(collectionsToFetch).map(query => query.get());
        const [pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, decksSnapshot, eventsSnapshot, announcementsSnapshot] = await Promise.all(promises);
        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => { dataMap[doc.id] = { id: doc.id, ...doc.data() }; });
            return dataMap;
        };
        DB.pokemonType.lev4 = snapshotToMap(pokemonSnapshot);
        DB.item.lev4 = snapshotToMap(itemsSnapshot);
        DB.runeAndChip.lev4 = snapshotToMap(runeAndChipsSnapshot);
        DB.tips.lev3 = snapshotToMap(tipsSnapshot);
        DB.deck.lev4 = snapshotToMap(decksSnapshot);
        DB.announcements.lev3 = snapshotToMap(announcementsSnapshot);
        if(DB.calendar && DB.calendar.lev2) {
            DB.calendar.lev2.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    }
    
    function setupSideMenuData() {
        DB.pokemonType.lev2.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        const types = {};
        DB.pokemonType.lev2.forEach(type => { types[type.id] = []; });
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon.types && Array.isArray(pokemon.types)) {
                pokemon.types.forEach(typeId => {
                    if (types[typeId]) types[typeId].push({ id: pokemon.id, name: pokemon.name_ko || pokemon.name });
                });
            }
        });
        Object.values(types).forEach(typeList => typeList.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.pokemonType.lev3 = types;

        const grades = {};
        DB.pokemonGrade.lev2.forEach(grade => { grades[grade.id] = []; });
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon && pokemon.grade) {
                const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                if (gradeId && grades[gradeId]) grades[gradeId].push({ id: pokemon.id, name: pokemon.name_ko || pokemon.name });
            }
        });
        Object.values(grades).forEach(gradeList => gradeList.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.pokemonGrade.lev3 = grades;
        
        const itemGrades = { god: [], legendary: [], epic: [] };
        Object.values(DB.item.lev4).forEach(item => {
            const gradeKey = item.grade?.toLowerCase();
            if (itemGrades[gradeKey]) itemGrades[gradeKey].push({ id: item.id, name: item.name });
        });
        Object.values(itemGrades).forEach(g => g.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.item.lev3 = itemGrades;
        
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(rc.type && runeAndChipTypes[rc.type]) rcTypes[rc.type].push({ id: rc.id, name: rc.name });
        });
        runeAndChipTypes.rune.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        runeAndChipTypes.chip.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        DB.runeAndChip.lev3 = runeAndChipTypes;

        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title }));
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));
        DB.announcements.lev2 = Object.values(DB.announcements.lev3).map(data => ({ id: data.id, name: data.title, timestamp: data.timestamp }));
    }

    // --- 렌더링 함수 ---
    function renderSidebar() {
        const sidebarContent = document.createElement('div');
        sidebarContent.className = 'panel-content';
        DB.sidebarMenu.forEach(item => {
            const button = document.createElement('button');
            button.className = 'menu-item';
            button.textContent = item.name;
            button.dataset.level = 1;
            button.dataset.id = item.id;
            sidebarContent.appendChild(button);
        });
        if(sidebar) {
            sidebar.innerHTML = '';
            sidebar.appendChild(sidebarContent);
        }
    }

    function populateInitialContent() {
        const announcements = Object.values(DB.announcements.lev3 || {}).sort((a,b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)).slice(0, 5);
        noticeList.innerHTML = announcements.length > 0 ? announcements.map(n => `<li data-menu-id="announcements" data-id="${n.id}">${n.title}</li>`).join('') : '<li>등록된 공지사항이 없습니다.</li>';
        popularList.innerHTML = `<li>인기글 데이터 준비중입니다.</li>`;
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        const panelHeader = targetPanel.querySelector('.panel-header');
        if(panelHeader.querySelector('.main-btn')) panelHeader.querySelector('.main-btn').remove();
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;
        
        if (clickedId === 'builder') {
            const mainButton = document.createElement('button');
            mainButton.className = 'main-btn';
            mainButton.textContent = '메인';
            panelHeader.appendChild(mainButton);
            if (isMobile()) {
                contentDiv.innerHTML = `<div class="pc-only-message"><h3>기능 안내</h3><p>배치툴 기능은 화면이 넓은 PC 환경에 최적화되어 있습니다.<br>PC에서 접속하여 이용해주세요.</p></div>`;
            } else {
                renderDeckBuilder(contentDiv);
            }
            return; 
        } else if (!data) {
            contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
        } else {
            const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
            const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));
            if (isFinalView) {
                const mainButton = document.createElement('button');
                mainButton.className = 'main-btn';
                mainButton.textContent = '메인';
                panelHeader.appendChild(mainButton);

                if (menuId === 'deck' && data.composition) renderDeckView(contentDiv, data);
                else if(menuId === 'calendar') renderCalendarView(contentDiv, data);
                else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, data, menuId); 
                else renderSimpleView(contentDiv, data, menuId); 
            } else {
                data.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'list-item';
                    button.textContent = item.name;
                    button.dataset.id = item.id;
                    button.dataset.level = level;
                    button.dataset.menuId = menuId;
                    contentDiv.appendChild(button);
                });
            }
        }
    }

    // --- 이벤트 핸들러 및 상태 관리 ---
    function addEventListeners() {
        homeButton.addEventListener('click', handleMainButtonClick);
        menuToggleBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-visible'));
        sidebarOverlay.addEventListener('click', () => document.body.classList.remove('sidebar-visible'));

        appContainer.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) handleBackClick(button); 
            else if (button.classList.contains('main-btn')) handleMainButtonClick();
            else if (button.dataset.level) handleMenuClick(button); 
        });

        initialContent.addEventListener('click', e => {
            const noticeItem = e.target.closest('#notice-list li');
            if (noticeItem) {
                const sidebarBtn = sidebar.querySelector(`button[data-id="announcements"]`);
                if (sidebarBtn) handleMenuClick(sidebarBtn);
                setTimeout(() => {
                    const noticeBtn = panels.lev2.querySelector(`button[data-id="${noticeItem.dataset.id}"]`);
                    if (noticeBtn) handleMenuClick(noticeBtn);
                }, 50);
            }
            const mobileBtn = e.target.closest('.mobile-notice-btn');
            if (mobileBtn) {
                const sidebarBtn = sidebar.querySelector(`button[data-id="${mobileBtn.dataset.targetMenu}"]`);
                if(sidebarBtn) handleMenuClick(sidebarBtn);
            }
        });
    }

    function handleMenuClick(button) {
        appContainer.classList.add('menu-active');
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId); 
        const currentPanel = panels[`lev${level}`] || sidebar;
        const nextPanel = panels[`lev${nextLevel}`];
        if (!nextPanel) return;
        if (isMobile()) currentPanel.classList.add('is-hidden');
        Object.values(panels).forEach((panel, index) => {
            if(index > 0 && panel !== nextPanel) panel.classList.remove('visible');
        });
        nextPanel.classList.remove('is-hidden');
        nextPanel.classList.add('visible');
        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
        if (isMobile()) document.body.classList.remove('sidebar-visible');
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        if (!parentPanel) return;
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        const currentPanel = panels[`lev${level}`];
        const prevPanel = panels[`lev${level - 1}`] || sidebar;
        currentPanel.classList.remove('visible');
        if (prevPanel) {
            if (isMobile()) prevPanel.classList.remove('is-hidden');
            if(prevPanel !== sidebar) prevPanel.classList.add('visible');
        }
        if(level === 2) {
            appContainer.classList.remove('menu-active');
        }
        setActive(level - 1, null);
    }
    
    function handleMainButtonClick() {
        appContainer.classList.remove('menu-active');
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) panel.classList.remove('visible', 'is-hidden');
        });
        setActive(0, null);
        if (isMobile() && sidebar) sidebar.classList.remove('is-hidden');
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

    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) return DB.pokemonType.lev4?.[id];
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }

    // --- 상세 뷰 렌더링 함수들 ---
    function renderPokemonView(contentDiv, data, menuId) {
        const detailView = document.createElement('div');
        detailView.className = 'pokemon-detail-view';
        const nameKo = data.name_ko || '이름 없음';
        const nameEn = data.name_en || '';
        let commonHTML = `<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${nameEn}</span></h2>`;
        let badgesHTML = '<div class="badge-container">';
        if (data.grade) {
            const gradeClass = `grade-${data.grade.toLowerCase().replace('+', '-plus')}`;
            badgesHTML += `<span class="grade-badge ${gradeClass}">${data.grade}</span>`;
        }
        if (data.types && data.types.length > 0) {
            data.types.forEach(typeId => {
                const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                if (typeInfo) badgesHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
            });
        }
        badgesHTML += '</div>';
        commonHTML += badgesHTML;
        if (data.imageURL) commonHTML += `<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`;
        
        let statsHTML = '';
        if (data.stats) {
            const totalStats = Object.values(data.stats).reduce((a, b) => Number(a) + Number(b), 0);
            statsHTML += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">${Object.entries(data.stats).map(([stat, value]) => `<tr><td>${stat.toUpperCase()}</td><td>${value}</td></tr>`).join('')}</table>`;
        } else {
            statsHTML = '<h4>기본 정보</h4><p>등록된 종족값 정보가 없습니다.</p>';
        }
        
        let skillsHTML = '';
        if (data.skills && data.skills.length > 0 && data.skills.some(s => s.name)) {
            skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
            data.skills.forEach((skill, index) => { 
                if(skill.name) skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; 
            });
            skillsHTML += '</ul>';
        } else {
            skillsHTML = '<h4>스킬</h4><p>등록된 스킬 정보가 없습니다.</p>';
        }

        let buildHTML = '';
        let hasBuildInfo = false;
        if (data.build_concept) {
            buildHTML += `<h4>빌드 콘셉트</h4><p>${data.build_concept}</p>`;
            hasBuildInfo = true;
        }
        if (data.recommendedNatures && data.recommendedNatures.length > 0) {
            const natureNames = data.recommendedNatures.map(natureId => DB.definitions.natures.find(n => n.id === natureId)?.name || '').filter(Boolean);
            if(natureNames.length > 0) {
                buildHTML += `<h4>추천 성격</h4><p>${natureNames.join(', ')}</p>`;
                hasBuildInfo = true;
            }
        }
        const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
        for (const type in recommendTypes) {
            if (data[type] && data[type].length > 0) {
                hasBuildInfo = true;
                buildHTML += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;
                data[type].forEach(id => {
                    const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', '');
                    const dbKey = (itemTypeForDB === 'rune' || itemTypeForDB === 'chip') ? 'runeAndChip' : 'item';
                    const itemData = DB[dbKey]?.lev4?.[id];
                    if (itemData) {
                         buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}</div>`;
                    }
                });
                buildHTML += `</div>`;
            }
        }
        if (!hasBuildInfo) {
            buildHTML = '<h4>추천 빌드</h4><p>등록된 추천 빌드 정보가 없습니다.</p>';
        }

        const useTabs = isMobile() || menuId === 'pokemonType' || menuId === 'pokemonGrade';
        detailView.className = `pokemon-detail-view ${useTabs ? 'use-tabs' : ''}`;
        if (useTabs) {
             detailView.innerHTML = `${commonHTML}<div class="tab-container"><nav class="tab-nav"><button class="tab-button active" data-tab="tab-info">기본 정보</button><button class="tab-button" data-tab="tab-skills">스킬</button><button class="tab-button" data-tab="tab-build">추천 빌드</button></nav><div id="tab-info" class="tab-pane active">${statsHTML}</div><div id="tab-skills" class="tab-pane">${skillsHTML}</div><div id="tab-build" class="tab-pane">${buildHTML}</div></div>`;
        } else {
            detailView.innerHTML = `${commonHTML}<div class="info-sections">${statsHTML}${skillsHTML}${buildHTML}</div>`;
        }
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);

        detailView.querySelectorAll('.skill-name').forEach(el => { 
            el.addEventListener('click', () => { 
                const skillIndex = parseInt(el.dataset.skillIndex);
                const skill = data.skills[skillIndex];
                if (skill) {
                    let skillDetailContent = `<p>${skill.description || ''}</p>`;
                    if (skill.keywords && skill.keywords.length > 0) {
                        skillDetailContent += '<hr><h4>키워드 설명</h4><ul>';
                        skill.keywords.forEach(kw => { skillDetailContent += `<li><strong>${kw.term}:</strong> ${kw.desc}</li>`; });
                        skillDetailContent += '</ul>';
                    }
                    showModal(skill.name, skillDetailContent); 
                }
            }); 
        });
        detailView.querySelectorAll('.recommend-item').forEach(el => {
            el.addEventListener('click', () => {
                const itemId = el.dataset.itemId;
                const itemType = el.dataset.itemType;
                const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                const itemData = DB[dbKey]?.lev4?.[itemId];

                if (itemData) {
                    const tempContentDiv = document.createElement('div');
                    const menuId = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                    renderSimpleView(tempContentDiv, itemData, menuId);
                    showModal(itemData.name, tempContentDiv);
                }
            });
        });

        detailView.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('active')) return;
                detailView.querySelector('.tab-button.active').classList.remove('active');
                detailView.querySelector('.tab-pane.active').classList.remove('active');
                button.classList.add('active');
                detailView.querySelector(`#${button.dataset.tab}`).classList.add('active');
            });
        });
    }

    function renderSimpleView(contentDiv, data, menuId) {
        const detailView = document.createElement('div');
        detailView.className = 'simple-detail-view';

        let html = `<h2>${data.name || data.title}</h2>`;
        if (data.grade) {
            const gradeClass = `grade-${data.grade.toLowerCase()}`;
            html += `<div class="badge-container"><span class="grade-badge ${gradeClass}">${data.grade}</span></div>`;
        }
        if (data.imageURL) {
            html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`;
        }

        const description = data.description || data.htmlContent || '';
        
        let tabNames = [];
        let separator = '';
        if (menuId === 'item') {
            tabNames = ['기본 능력치', '소지 효과'];
            separator = '[소지 효과]';
        } else if (menuId === 'runeAndChip') {
            tabNames = ['세트 효과 1', '세트 효과 2'];
            separator = '[세트 효과]';
        }

        if (tabNames.length > 0 && description.includes(separator)) {
            const parts = description.split(separator);
            const tab1Content = parts[0].trim();
            const tab2Content = parts[1].trim().replace(/\[(.*?)\]/g, '<h4>$1</h4>').replace(/\n/g, '<br>');

            html += `
                <div class="tab-container">
                    <nav class="tab-nav">
                        <button class="tab-button active" data-tab="tab-1">${tabNames[0]}</button>
                        <button class="tab-button" data-tab="tab-2">${tabNames[1]}</button>
                    </nav>
                    <div id="tab-1" class="tab-pane active item-description">${tab1Content.replace(/\n/g, '<br>')}</div>
                    <div id="tab-2" class="tab-pane item-description">${tab2Content}</div>
                </div>`;
            detailView.innerHTML = html;
            
            detailView.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', () => {
                    if (button.classList.contains('active')) return;
                    detailView.querySelector('.tab-button.active').classList.remove('active');
                    detailView.querySelector('.tab-pane.active').classList.remove('active');
                    button.classList.add('active');
                    detailView.querySelector(`#${button.dataset.tab}`).classList.add('active');
                });
            });

        } else {
            html += `<div class="item-description">${description.replace(/\\n/g, '<br>')}</div>`;
            detailView.innerHTML = html;
        }
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);
    }

    function renderDeckView(contentDiv, data) {
        const weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };
        let html = `<div class="deck-detail-view"><h2>${data.name}</h2>`;
        if (data.description) { html += `<p>${data.description}</p>`; }
        const grid = Array(4).fill(null).map(() => Array(4).fill(null));
        const positionMap = {
            'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0], 'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
            'main_4': [1, 2], 'main_5': [2, 2], 'main_6': [3, 2], 'main_1': [1, 3], 'main_2': [2, 3], 'main_3': [3, 3]
        };
        if (data.weather && weatherToEmoji[data.weather]) {
            grid[0][0] = { type: 'header', content: weatherToEmoji[data.weather], label: data.weather, colspan: 2 };
        }
        const mainPokemonIds = data.composition.filter(m => m.role === 'main').map(m => m.pokemonId);
        const synergy = calculateSynergy(mainPokemonIds);
        if (synergy) {
             grid[0][2] = { type: 'header', content: `<img src="${synergy.imageURL}">`, label: synergy.name, colspan: 2 };
        }
        data.composition.forEach(member => { 
            const pkmData = DB.pokemonType.lev4[member.pokemonId]; 
            if (!pkmData) return; 
            const key = `${member.role}_${member.position}`;
            if(positionMap[key]) {
                const [row, col] = positionMap[key];
                grid[row][col] = { type: 'pokemon', role: member.role, ...pkmData };
            }
        });
        html += `<h4>덱 배치</h4><table class="deck-grid-table four-by-four-table"><tbody>`;
        for (let i = 0; i < 4; i++) {
            html += '<tr>'; 
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === undefined) continue;
                const cell = grid[i][j]; 
                if (cell) {
                    if (cell.type === 'pokemon') {
                        html += `<td class="role-${cell.role}"><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"></div></td>`;
                    } else if (cell.type === 'header') {
                        const colspan = cell.colspan ? `colspan="${cell.colspan}"` : '';
                        const contentHTML = cell.content.startsWith('<img') ? cell.content : `<span class="header-emoji">${cell.content}</span>`;
                        html += `<td class="header-cell" ${colspan} title="${cell.label}"><div>${contentHTML}</div></td>`;
                        if (cell.colspan > 1) {
                            for (let k = 1; k < cell.colspan; k++) grid[i][j+k] = undefined;
                        }
                    }
                } else { 
                    html += '<td class="empty-cell"></td>';
                } 
            } 
            html += '</tr>'; 
        }
        html += `</tbody></table></div>`;
        contentDiv.innerHTML = html;
        contentDiv.querySelectorAll('.deck-pokemon-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const pokemonId = cell.dataset.pokemonId;
                const pkmData = DB.pokemonType.lev4[pokemonId];
                if (pkmData) {
                    let typesHTML = (pkmData.types || []).map(typeId => {
                        const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                        return typeInfo ? `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>` : '';
                    }).join(' ');
                    const modalContent = `<div class="badge-container"><span class="grade-badge grade-${pkmData.grade.toLowerCase().replace('+', '-plus')}">${pkmData.grade}</span>${typesHTML}</div>`;
                    showModal(pkmData.name_ko, modalContent);
                }
            });
        });
    }

    function renderCalendarView(contentDiv, data) {
        let currentCalendarDate = new Date();
        function buildCalendar(year, month) {
            const calendarView = document.createElement('div');
            calendarView.className = 'calendar-view';
            const monthEvents = {};
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            (data.events || []).forEach(event => {
                if (!event.startDate) return;
                const eventStartDate = event.startDate.toDate();
                for (let i = 0; i < (event.duration || 1); i++) {
                    const currentEventDate = new Date(eventStartDate);
                    currentEventDate.setDate(currentEventDate.getDate() + i);
                    if (currentEventDate.getFullYear() === year && currentEventDate.getMonth() === month) {
                        const day = currentEventDate.getDate();
                        if (!monthEvents[day]) monthEvents[day] = [];
                        monthEvents[day].push({ ...event, date: currentEventDate });
                    }
                }
            });

            let html = `<div class="calendar-header"><span class="calendar-title">${year}년 ${month + 1}월</span><div class="calendar-nav"><button id="cal-prev-btn">&lt; 이전</button><button id="cal-today-btn">Today</button><button id="cal-next-btn">다음 &gt;</button></div></div><div class="calendar-legend"><div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div><div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div><div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div></div><table class="calendar-grid"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>`;
            let dateCounter = 1;
            const startDay = firstDay.getDay();
            const daysInMonth = lastDay.getDate();
            for (let i = 0; i < 6; i++) {
                html += '<tr>';
                for (let j = 0; j < 7; j++) {
                    if (i === 0 && j < startDay || dateCounter > daysInMonth) {
                        html += '<td class="day-other-month"></td>';
                    } else {
                        const today = new Date();
                        const isToday = (dateCounter === today.getDate() && month === today.getMonth() && year === today.getFullYear());
                        const eventsOnDay = monthEvents[dateCounter];
                        let cellClass = 'day-current-month';
                        if (isToday) cellClass += ' day-today';
                        if (eventsOnDay) cellClass += ' has-events';
                        html += `<td class="${cellClass}" data-day="${dateCounter}"><div class="date-number">${dateCounter}</div>`;
                        if (eventsOnDay) {
                            html += `<div class="event-markers">${eventsOnDay.map(event => `<div class="event-marker event-type-${event.type}">${event.title || event.name}</div>`).join('')}</div>`;
                        }
                        html += '</td>';
                        dateCounter++;
                    }
                }
                html += '</tr>';
                if (dateCounter > daysInMonth) break;
            }
            html += `</tbody></table>`;
            calendarView.innerHTML = html;
            calendarView.addEventListener('click', (e) => {
                const target = e.target;
                if(target.id === 'cal-prev-btn') {
                    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                    updateCalendar();
                } else if (target.id === 'cal-next-btn') {
                    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                    updateCalendar();
                } else if (target.id === 'cal-today-btn') {
                    currentCalendarDate = new Date();
                    updateCalendar();
                } else {
                    const cell = target.closest('.has-events');
                    if (cell) {
                        const day = parseInt(cell.dataset.day);
                        const events = monthEvents[day];
                        if(events && events.length > 0) {
                            const eventContent = events.map(evt => {
                                const startStr = evt.startDate.toDate().toISOString().split('T')[0];
                                const endStr = evt.endDate.toDate().toISOString().split('T')[0];
                                const period = (evt.duration || 1) > 1 ? `${startStr} ~ ${endStr}` : startStr;
                                return `<h4>${evt.title || evt.name}</h4><p><strong>기간:</strong> ${period}</p><p>${evt.description}</p>`;
                            }).join('<hr>');
                            showModal(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 이벤트`, eventContent);
                        }
                    }
                }
            });
            return calendarView;
        }
        function updateCalendar() {
            contentDiv.innerHTML = '';
            contentDiv.appendChild(buildCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()));
        }
        updateCalendar();
    }
    
    function renderDeckBuilder(contentDiv) {
        let html = `<div class="deck-builder-view">
            <div class="placement-container">
                <h4>배치판</h4>
                <div class="synergy-display">시너지 정보</div>
                <div class="placement-grid"></div>
            </div>
            <div class="source-container">
                <h4>포켓몬 목록</h4>
                <div class="source-filter-bar">
                    <select id="grade-filter" class="filter-dropdown"><option value="all">모든 등급</option></select>
                    <select id="type-filter" class="filter-dropdown"><option value="all">모든 타입</option></select>
                </div>
                <div class="source-list"></div>
            </div>
        </div>`;
        contentDiv.innerHTML = html;

        const placementGrid = contentDiv.querySelector('.placement-grid');
        const sourceList = contentDiv.querySelector('.source-list');
        const gradeFilter = contentDiv.querySelector('#grade-filter');
        const typeFilter = contentDiv.querySelector('#type-filter');
        const synergyDisplay = contentDiv.querySelector('.synergy-display');
        
        const placedPokemon = new Map();
        
        const slotsConfig = [
            { role: 'assist', position: 4 }, { role: 'assist', position: 5 }, { role: 'assist', position: 6 },
            { role: 'assist', position: 1 }, { role: 'assist', position: 2 }, { role: 'assist', position: 3 },
            { role: 'main', position: 4, area: 'rearguard' }, { role: 'main', position: 5, area: 'rearguard' }, { role: 'main', position: 6, area: 'rearguard' },
            { role: 'main', position: 1, area: 'vanguard' }, { role: 'main', position: 2, area: 'vanguard' }, { role: 'main', position: 3, area: 'vanguard' },
        ];

        slotsConfig.forEach(cfg => {
            const slot = document.createElement('div');
            slot.className = `placement-slot ${cfg.role} ${cfg.area || ''}`;
            slot.dataset.role = cfg.role;
            slot.dataset.position = cfg.position;
            slot.textContent = `${cfg.role === 'main' ? (cfg.area === 'vanguard' ? '전방' : '후방') : '어시'}_#${cfg.position}`;
            placementGrid.appendChild(slot);
        });

        ['SS', 'S+', 'S'].forEach(g => gradeFilter.innerHTML += `<option value="${g}">${g}</option>`);
        DB.pokemonType.lev2.forEach(t => typeFilter.innerHTML += `<option value="${t.id}">${t.name}</option>`);

        function applyFilters() {
            const selectedGrade = gradeFilter.value;
            const selectedType = typeFilter.value;
            const pokemonArray = Object.values(DB.pokemonType.lev4);
            const filtered = pokemonArray.filter(pkm => 
                (selectedGrade === 'all' || pkm.grade === selectedGrade) &&
                (selectedType === 'all' || pkm.types?.includes(selectedType))
            );
            renderSourceList(filtered);
        }

        function renderSourceList(pokemonList) {
            sourceList.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'source-list-grid';
            pokemonList.sort((a,b) => a.name_ko.localeCompare(b.name_ko, 'ko'));
            grid.innerHTML = pokemonList.map(pkm => `
                <div class="pokemon-source-icon" draggable="true" data-pokemon-id="${pkm.id}">
                    <img src="${pkm.faceImageURL}" alt="${pkm.name_ko}">
                    <span>${pkm.name_ko}</span>
                </div>`).join('');
            sourceList.appendChild(grid);
        }

        let draggedElement = null;
        contentDiv.addEventListener('dragstart', e => {
            draggedElement = e.target.closest('[draggable="true"]');
        });

        placementGrid.addEventListener('dragover', e => e.preventDefault());
        placementGrid.addEventListener('drop', e => {
            e.preventDefault();
            const targetSlot = e.target.closest('.placement-slot');
            if (!targetSlot || !draggedElement) return;

            const droppedPkmId = draggedElement.dataset.pokemonId;
            const isMovingFromSlot = draggedElement.parentElement.classList.contains('placement-slot');
            
            if (!isMovingFromSlot && Array.from(placedPokemon.values()).includes(droppedPkmId)) {
                alert('이미 배치된 포켓몬입니다.');
                return;
            }

            const targetSlotPkmId = placedPokemon.get(targetSlot);
            
            if (isMovingFromSlot) {
                const sourceSlot = draggedElement.parentElement;
                if (targetSlotPkmId) {
                    placePokemonInSlot(sourceSlot, targetSlotPkmId);
                } else {
                    clearSlot(sourceSlot);
                }
            }
            placePokemonInSlot(targetSlot, droppedPkmId);
            updateSynergyDisplay();
        });

        placementGrid.addEventListener('click', e => {
            if (e.target.classList.contains('remove-pkm-btn')) {
                clearSlot(e.target.closest('.placement-slot'));
                updateSynergyDisplay();
            }
        });

        function placePokemonInSlot(slot, pokemonId) {
            const pokemonData = DB.pokemonType.lev4[pokemonId];
            slot.innerHTML = `<div class="deck-pokemon-cell" draggable="true" data-pokemon-id="${pokemonId}"><img src="${pokemonData.faceImageURL}" alt="${pokemonData.name_ko}"><button class="remove-pkm-btn">×</button></div>`;
            placedPokemon.set(slot, pokemonId);
        }

        function clearSlot(slot) {
            const { role, position } = slot.dataset;
            const area = slot.classList.contains('vanguard') ? '전방' : '후방';
            slot.innerHTML = `${role === 'main' ? area : '어시'}_#${position}`;
            placedPokemon.delete(slot);
        }

        function updateSynergyDisplay() {
            const mainPokemonIds = Array.from(placedPokemon.entries())
                .filter(([slot,]) => slot.dataset.role === 'main')
                .map(([, pokemonId]) => pokemonId);
            const synergy = calculateSynergy(mainPokemonIds);
            if (synergy) {
                synergyDisplay.innerHTML = `<img src="${synergy.imageURL}" style="height:24px; margin-right:5px;"> <strong>${synergy.name}</strong>`;
            } else {
                synergyDisplay.textContent = '메인 포켓몬 6마리 배치 시 표시';
            }
        }
        
        applyFilters();
    }

    function calculateSynergy(pokemonIds) {
        if (!DB.synergyEffects || !pokemonIds || pokemonIds.length < 6) return null;
        const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
        if (mainPokemon.some(pkm => !pkm)) return null;
        const typePokemonCount = {};
        mainPokemon.forEach(pkm => {
            if (pkm?.types) pkm.types.forEach(type => { typePokemonCount[type] = (typePokemonCount[type] || 0) + 1; });
        });
        const counts = Object.values(typePokemonCount).sort((a, b) => b - a);
        const totalUniqueTypes = Object.keys(typePokemonCount).length;
        if (counts.length > 0 && counts[0] >= 6) return DB.synergyEffects.find(s => s.id === 'same6');
        if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) return DB.synergyEffects.find(s => s.id === 'same3x2');
        if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) return DB.synergyEffects.find(s => s.id === 'same4_2');
        const totalPairs = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
        if (totalPairs >= 3) return DB.synergyEffects.find(s => s.id === 'same2x3');
        if (counts.length > 0 && counts[0] >= 3) return DB.synergyEffects.find(s => s.id === 'same3');
        if (totalUniqueTypes >= 6 && pokemonIds.length >= 6) return DB.synergyEffects.find(s => s.id === 'diff6');
        return null;
    }
    
    function showModal(title, content) {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>${title}</h2><button class="modal-close-btn">&times;</button></div><div class="modal-body"></div></div>`;
        const modalBody = modalOverlay.querySelector('.modal-body');
        if (typeof content === 'string') {
            modalBody.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            modalBody.appendChild(content);
        }
        document.body.appendChild(modalOverlay);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay, .modal-close-btn')) {
                modalOverlay.remove();
            }
        });
    }

    function setupAdObservers() {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch(e) {
            console.error("Adsense push error", e);
        }
    }

    initialize();
});
