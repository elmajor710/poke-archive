document.addEventListener('DOMContentLoaded', () => {
    // Firebase 객체 확인
    if (!window.db) {
        console.error("Firebase 'db' 객체를 찾을 수 없습니다.");
        alert("사이트 로딩에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    // --- DOM 요소 ---
    const homeButton = document.getElementById('home-button');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainContainer = document.getElementById('main-container');
    const sidebar = document.getElementById('sidebar');
    const noticeList = document.getElementById('notice-list');
    const popularList = document.getElementById('popular-list');
    const mobileNoticeButtons = document.querySelector('.mobile-notice-buttons');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };

    // --- 상태 변수 ---
    let state = {
        activeLevel: 0, // 0: initial, 2: lev2, 3: lev3, 4: lev4
        history: [], // { level, menuId, clickedId }
        activeButtons: {}
    };
    const isMobile = () => window.innerWidth <= 1199;

    // --- 초기화 ---
    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            await populateInitialContent();
            addEventListeners();
            updateView();
    // 애드센스 코드가 실패하더라도 사이트 전체가 멈추지 않도록 수정
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
        console.error("AdSense 로딩에 실패했거나 애드블록에 의해 차단되었습니다.", e);
    }
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "<h4>사이트 초기화 중 오류가 발생했습니다.</h4>";
        }
    }

    // --- 데이터 로딩 및 가공 ---
    async function fetchAllDataFromFirebase() {
        console.log("Firestore에서 데이터 로딩 시작...");
        const collections = ['pokemon', 'items', 'runeAndChips', 'tips', 'events', 'recommendedDecks', 'announcements'];
        const promises = collections.map(col => db.collection(col).where("isPublished", "==", true).get());
        const [
            pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot,
            eventsSnapshot, decksSnapshot, announcementsSnapshot
        ] = await Promise.all(promises);

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
        DB.calendar.lev2.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Firestore 데이터 로딩 완료.");
    }

    function setupSideMenuData() {
        // 포켓몬 등급별 그룹화
        const grades = { ss: [], sPlus: [], s: [] };
        Object.values(DB.pokemonType.lev4).forEach(pkm => {
            if (pkm.grade === 'SS') grades.ss.push({ id: pkm.id, name: pkm.name_ko });
            else if (pkm.grade === 'S+') grades.sPlus.push({ id: pkm.id, name: pkm.name_ko });
            else if (pkm.grade === 'S') grades.s.push({ id: pkm.id, name: pkm.name_ko });
        });
        DB.pokemonGrade.lev3 = grades;

        // 아이템 등급별 그룹화
        const itemGrades = { god: [], legendary: [], epic: [] };
        Object.values(DB.item.lev4).forEach(item => {
            const gradeKey = item.grade?.toLowerCase();
            if (itemGrades[gradeKey]) itemGrades[gradeKey].push({ id: item.id, name: item.name });
        });
        DB.item.lev3 = itemGrades;

        // 룬/칩 타입별 그룹화
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(rc.type && runeAndChipTypes[rc.type]) runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name });
        });
        DB.runeAndChip.lev3 = runeAndChipTypes;

        // 팁, 추천덱, 공지사항 목록 생성
        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title }));
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));
        DB.announcements.lev2 = Object.values(DB.announcements.lev3).map(data => ({ id: data.id, name: data.title }));
    }

    // --- 렌더링 함수 ---
    function renderSidebar() {
        sidebar.innerHTML = '';
        DB.sidebarMenu.forEach(item => {
            const button = document.createElement('button');
            button.className = 'menu-item';
            button.textContent = item.name;
            button.dataset.level = 1;
            button.dataset.id = item.id;
            sidebar.appendChild(button);
        });
    }

    async function populateInitialContent() {
        // 공지사항 로딩
        const announcements = Object.values(DB.announcements.lev3 || {})
            .sort((a,b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))
            .slice(0, 5);

        if (announcements.length > 0) {
            noticeList.innerHTML = announcements.map(notice => `<li data-menu-id="announcements" data-id="${notice.id}">${notice.title}</li>`).join('');
        } else {
            noticeList.innerHTML = '<li>등록된 공지사항이 없습니다.</li>';
        }

        // 인기글 (임시)
        popularList.innerHTML = `<li>인기글 데이터 준비중입니다.</li>`;
    }

    function renderPanelContent(level, menuId, clickedId) {
        const nextData = getNextData(level - 1, menuId, clickedId);
        const targetPanel = panels[`lev${level}`];
        const contentDiv = targetPanel.querySelector('.panel-content');
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;

        const maxLevel = DB.sidebarMenu.find(m => m.id === menuId)?.levels || 4;
        const isFinalView = level >= maxLevel;

        if (isFinalView) {
            const finalData = DB[menuId]?.lev4?.[clickedId] || DB[menuId]?.lev3?.[clickedId] || nextData;
            if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, finalData);
            else if (menuId === 'deck') renderDeckView(contentDiv, finalData);
            else if (menuId === 'calendar') renderCalendarView(contentDiv, DB.calendar.lev2);
            else renderSimpleView(contentDiv, finalData, menuId);
        } else {
            const items = Array.isArray(nextData) ? nextData : (nextData ? Object.values(nextData) : []);
            items.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
            items.forEach(item => {
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

    function updateView() {
        mainContainer.dataset.activeLevel = state.activeLevel;

        // 활성 버튼 스타일 업데이트
        document.querySelectorAll('.menu-item.active, .list-item.active').forEach(b => b.classList.remove('active'));
        if (state.activeLevel > 0 && state.history.length > 0) {
            const lastState = state.history[state.history.length - 1];
            const btn = findButton(lastState.level, lastState.clickedId);
            if (btn) btn.classList.add('active');
        }
    }

    // --- 이벤트 핸들러 ---
    function addEventListeners() {
        // 헤더 로고 클릭 (홈으로)
        homeButton.addEventListener('click', () => {
            state.activeLevel = 0;
            state.history = [];
            updateView();
        });

        // 모바일 메뉴 토글
        menuToggleBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-visible'));
        sidebarOverlay.addEventListener('click', () => document.body.classList.remove('sidebar-visible'));

        // 컨텐츠 영역 클릭 위임
        mainContainer.addEventListener('click', e => {
            const button = e.target.closest('button[data-level], button.back-btn');
            const noticeItem = e.target.closest('#notice-list li');

            if (button) {
                if (button.classList.contains('back-btn')) handleBackClick();
                else if (button.dataset.level) handleMenuClick(button);
            } else if (noticeItem) {
                handleNoticeClick(noticeItem);
            }
        });

        // 모바일 공지/인기글 버튼
        mobileNoticeButtons.addEventListener('click', (e) => {
            const btn = e.target.closest('.mobile-notice-btn');
            if (!btn) return;
            const targetMenu = btn.dataset.targetMenu;
            if (targetMenu === 'announcements') {
                const sidebarBtn = sidebar.querySelector(`button[data-id="announcements"]`);
                if (sidebarBtn) handleMenuClick(sidebarBtn);
            }
        });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        const nextLevel = level + 1;

        state.history.push({ level, menuId, clickedId: id });
        state.activeLevel = nextLevel;

        renderPanelContent(nextLevel, menuId, id);
        updateView();

        if (isMobile()) {
            document.body.classList.remove('sidebar-visible');
        }
    }

    function handleNoticeClick(listItem) {
        const menuId = listItem.dataset.menuId;
        const noticeId = listItem.dataset.id;

        const sidebarBtn = sidebar.querySelector(`button[data-id="${menuId}"]`);
        if (sidebarBtn) {
            // 1단계 메뉴 클릭
            handleMenuClick(sidebarBtn);
            // 2단계(공지사항 목록) 렌더링 후 특정 공지사항 클릭
            setTimeout(() => {
                const noticeBtn = panels.lev2.querySelector(`button[data-id="${noticeId}"]`);
                if (noticeBtn) handleMenuClick(noticeBtn);
            }, 50); // DOM 렌더링 시간 확보
        }
    }

    function handleBackClick() {
        if (state.history.length === 0) return;
        state.history.pop();
        const prevState = state.history[state.history.length - 1];
        state.activeLevel = prevState ? prevState.level + 1 : 0;
        updateView();
    }

    // --- 헬퍼 함수 ---
    function getNextData(currentLevel, menuId, clickedId) {
        if (currentLevel === 1) return DB[menuId]?.lev2;
        if (currentLevel === 2) return DB[menuId]?.lev3?.[clickedId];
        if (currentLevel === 3) return DB[menuId]?.lev4?.[clickedId];
        return null;
    }

    function findButton(level, id) {
        if (level === 1) return sidebar.querySelector(`button[data-id="${id}"]`);
        const panel = panels[`lev${level}`];
        return panel ? panel.querySelector(`button[data-id="${id}"]`) : null;
    }

    // --- 상세 뷰 렌더링 (기존 함수 재사용 및 일부 수정) ---
    function renderPokemonView(contentDiv, data) {
        if (!data) {
            contentDiv.innerHTML = "<h4>데이터를 찾을 수 없습니다.</h4>";
            return;
        }
        // ... (기존 renderPokemonView 함수 내용은 여기에 붙여넣기)
        // ... 단, showModal 호출 부분은 그대로 사용
        const detailView = document.createElement('div');
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

        const useTabs = isMobile();
        detailView.className = `pokemon-detail-view ${useTabs ? 'use-tabs' : ''}`;
        if (useTabs) {
             detailView.innerHTML = `${commonHTML}<div class="tab-container"><nav class="tab-nav"><button class="tab-button active" data-tab="tab-info">기본 정보</button><button class="tab-button" data-tab="tab-skills">스킬</button><button class="tab-button" data-tab="tab-build">추천 빌드</button></nav><div id="tab-info" class="tab-pane active">${statsHTML}</div><div id="tab-skills" class="tab-pane">${skillsHTML}</div><div id="tab-build" class="tab-pane">${buildHTML}</div></div>`;
        } else {
            detailView.innerHTML = `${commonHTML}<div class="info-sections">${statsHTML}${skillsHTML}${buildHTML}</div>`;
        }
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);

        detailView.addEventListener('click', e => {
            const skillNameEl = e.target.closest('.skill-name');
            const recommendItemEl = e.target.closest('.recommend-item');
            const tabButtonEl = e.target.closest('.tab-button');

            if (skillNameEl) {
                const skillIndex = parseInt(skillNameEl.dataset.skillIndex);
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
            } else if (recommendItemEl) {
                const itemId = recommendItemEl.dataset.itemId;
                const itemType = recommendItemEl.dataset.itemType;
                const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                const itemData = DB[dbKey]?.lev4?.[itemId];

                if (itemData) {
                    const tempContentDiv = document.createElement('div');
                    renderSimpleView(tempContentDiv, itemData, dbKey);
                    showModal(itemData.name, tempContentDiv);
                }
            } else if (tabButtonEl) {
                if (tabButtonEl.classList.contains('active')) return;
                detailView.querySelector('.tab-button.active').classList.remove('active');
                detailView.querySelector('.tab-pane.active').classList.remove('active');
                tabButtonEl.classList.add('active');
                detailView.querySelector(`#${tabButtonEl.dataset.tab}`).classList.add('active');
            }
        });
    }

    function renderSimpleView(contentDiv, data, menuId) {
        if (!data) {
            contentDiv.innerHTML = "<h4>데이터를 찾을 수 없습니다.</h4>";
            return;
        }
        // ... (기존 renderSimpleView 함수 내용과 동일)
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
            const tab1Content = parts[0].trim().replace(/\n/g, '<br>');
            const tab2Content = parts.slice(1).join(separator).trim().replace(/\[(.*?)\]/g, '<h4>$1</h4>').replace(/\n/g, '<br>');

            html += `
                <div class="tab-container">
                    <nav class="tab-nav">
                        <button class="tab-button active" data-tab="tab-1">${tabNames[0]}</button>
                        <button class="tab-button" data-tab="tab-2">${tabNames[1]}</button>
                    </nav>
                    <div id="tab-1" class="tab-pane active item-description">${tab1Content}</div>
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
        if (!data) {
            contentDiv.innerHTML = "<h4>데이터를 찾을 수 없습니다.</h4>";
            return;
        }
        // ... (기존 renderDeckView 함수 내용과 동일)
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
         if (!data) {
            contentDiv.innerHTML = "<h4>데이터를 찾을 수 없습니다.</h4>";
            return;
        }
        // ... (기존 renderCalendarView 함수 내용과 동일)
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

    function calculateSynergy(pokemonIds) {
        if (!DB.synergyEffects || !pokemonIds || pokemonIds.length < 6) return null;
        const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
        if (mainPokemon.some(pkm => !pkm)) return null;
        const typePokemonCount = {};
        mainPokemon.forEach(pkm => {
            if (pkm?.types) {
                pkm.types.forEach(type => {
                    typePokemonCount[type] = (typePokemonCount[type] || 0) + 1;
                });
            }
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
        
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>`;

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

    // --- 페이지 실행 ---
    initialize();
});
