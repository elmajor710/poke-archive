document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v31.2 - 배치툴 UI 복구');

    function initializeAppUserMode() {
        const appContainer = document.getElementById('app-container');
        const sidebar = document.getElementById('sidebar');
        const panels = {
            lev1: sidebar,
            lev2: document.getElementById('lev2-panel'),
            lev3: document.getElementById('lev3-panel'),
            lev4: document.getElementById('lev4-panel')
        };
        let activeButtons = {};
        const isMobile = () => window.innerWidth <= 768;
        let currentCalendarDate = new Date();

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
            const detailView = document.createElement('div');
            detailView.className = 'pokemon-detail-view';
            let badgesHTML = '<div class="badge-container">';
            if(data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase().replace('+', '-plus')}`;
                badgesHTML += `<span class="grade-badge ${gradeClass}">${data.grade}</span>`;
            }
            if (data.types && data.types.length > 0) {
                data.types.forEach(typeId => {
                    const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                    if (typeInfo) {
                        badgesHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
                    }
                });
            }
            badgesHTML += '</div>';
            let commonHTML = `<h2>${data.name.ko} <span style="font-size:0.8em; color:#666;">${data.name.en}</span></h2>`;
            commonHTML += badgesHTML;
            if (data.imageURL) { commonHTML += `<img src="${data.imageURL}" alt="${data.name.ko}" class="main-image">`; }
            let statsHTML = '';
            if (data.stats) {
                const totalStats = data.totalStats || Object.values(data.stats).reduce((a, b) => a + b, 0);
                statsHTML += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">`;
                Object.entries(data.stats).forEach(([stat, value]) => { statsHTML += `<tr><td>${stat}</td><td>${value}</td></tr>`; });
                statsHTML += '</table>';
            }
            let skillsHTML = '';
            if (data.skills && data.skills.length > 0) {
                skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
                data.skills.forEach((skill, index) => { skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; });
                skillsHTML += '</ul>';
            }
            let buildHTML = '';
            if (data.recommendedNatures && data.recommendedNatures.length > 0) {
                const natureNames = data.recommendedNatures.map(natureId => DB.definitions.natures.find(n => n.id === natureId)?.name || '').filter(Boolean);
                buildHTML += `<h4>추천 성격</h4><p>${natureNames.join(', ')}</p>`;
            }
            const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
            for (const type in recommendTypes) {
                if (data[type] && data[type].length > 0) {
                    buildHTML += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;
                    data[type].forEach(item => {
                        const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', '');
                        buildHTML += `<div class="recommend-item" data-item-id="${item.id}" data-item-type="${itemTypeForDB}">
                                    ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}">` : ''}<span>${item.name}</span>
                                 </div>`;
                    });
                    buildHTML += `</div>`;
                }
            }
            if (isMobile()) {
                detailView.innerHTML = `<div class="tab-nav"><button class="tab-button active" data-tab="basic">기본 정보</button><button class="tab-button" data-tab="skills">스킬</button><button class="tab-button" data-tab="build">추천 빌드</button></div><div class="tab-content-container"><div id="tab-basic" class="tab-pane active">${commonHTML}${statsHTML}</div><div id="tab-skills" class="tab-pane">${skillsHTML}</div><div id="tab-build" class="tab-pane">${buildHTML}</div></div>`;
            } else {
                detailView.innerHTML = commonHTML + statsHTML + skillsHTML + buildHTML;
            }
            contentDiv.innerHTML = '';
            contentDiv.appendChild(detailView);
            contentDiv.querySelectorAll('.skill-name').forEach(el => { el.addEventListener('click', () => { const skillIndex = parseInt(el.dataset.skillIndex); const skill = data.skills[skillIndex]; showModal(skill.name, `<p>${skill.description}</p>`); }); });
            contentDiv.querySelectorAll('.recommend-item').forEach(el => { el.addEventListener('click', () => { const itemId = el.dataset.itemId; const itemType = el.dataset.itemType; const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : itemType; const itemData = DB[dbKey]?.lev4?.[itemId]; if (itemData) { showModal(itemData.name, `<p>${itemData.description || '상세 정보가 없습니다.'}</p>`); } else { alert('상세 정보를 찾을 수 없습니다.'); } }); });
            const tabNav = contentDiv.querySelector('.tab-nav');
            if (tabNav) { tabNav.addEventListener('click', e => { if (e.target.matches('.tab-button')) { const tabId = e.target.dataset.tab; contentDiv.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active')); contentDiv.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active')); e.target.classList.add('active'); contentDiv.querySelector(`#tab-${tabId}`).classList.add('active'); } }); }
        }

        function renderSimpleView(contentDiv, data) {
            if (data.htmlContent) {
                let html = `<div class="simple-detail-view"><h2>${data.name}</h2>${data.htmlContent}</div>`;
                contentDiv.innerHTML = html;
                return;
            }
            let html = `<div class="simple-detail-view"><h2>${data.name}</h2>`;
            if (data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase()}`;
                html += `<div class="badge-container"><span class="grade-badge ${gradeClass}">${data.grade}</span></div>`;
            }
            if (data.imageURL) { html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`; }
            if (data.description) { html += `<h4>설명</h4><div class="item-description">${data.description.replace(/\\n/g, '\n')}</div>`; }
            if (data.content) { html += `<p>${data.content}</p>`; }
            html += `</div>`;
            contentDiv.innerHTML = html;
        }
        
        function renderDeckView(contentDiv, data) {
            let html = `<div class="deck-detail-view"><h2>${data.name}</h2>`;
            if (data.description) { html += `<p>${data.description}</p>`; }
            const grid = Array(3).fill(null).map(() => Array(3).fill(null));
            const positionMap = { 'vanguard_1': [0, 2], 'vanguard_2': [1, 2], 'vanguard_3': [2, 2], 'rearguard_4': [0, 1], 'rearguard_5': [1, 1], 'rearguard_6': [2, 1], 'assist_1': [0, 0], 'assist_2': [1, 0], 'assist_3': [2, 0] };
            data.composition.forEach(member => { const pkmData = DB.pokemonType.lev4[member.pokemonId]; if (!pkmData) return; const roleKey = member.role === 'assist' ? 'assist' : (member.position < 4 ? 'vanguard' : 'rearguard'); const key = `${roleKey}_${member.position}`; const [row, col] = positionMap[key]; grid[row][col] = { name: pkmData.name.ko, faceImageURL: pkmData.faceImageURL, role: member.role, position: member.position }; });
            html += `<h4>덱 배치</h4><table class="deck-grid-table"><thead><tr><th>어시스트</th><th>후방</th><th>전방</th></tr></thead><tbody>`;
            for (let i = 0; i < 3; i++) { html += '<tr>'; for (let j = 0; j < 3; j++) { const cell = grid[i][j]; if (cell) { const roleText = cell.role === 'assist' ? '어시스트' : '메인'; html += `<td><div class="deck-pokemon-cell"><img src="${cell.faceImageURL}" alt="${cell.name}"><span class="position-number">${roleText} #${cell.position}</span></div></td>`; } else { html += '<td></td>'; } } html += '</tr>'; }
            html += `</tbody></table><h4>덱 구성원</h4>`;
            const mainMembers = data.composition.filter(m => m.role === 'main').sort((a,b) => a.position - b.position);
            const assistMembers = data.composition.filter(m => m.role === 'assist').sort((a,b) => a.position - b.position);
            if (mainMembers.length > 0) {
                html += `<h5>메인</h5><ul class="deck-composition-list">`;
                mainMembers.forEach(member => { const pkmData = DB.pokemonType.lev4[member.pokemonId]; if(pkmData) html += `<li><b>메인 #${member.position}:</b> ${pkmData.name.ko}</li>`; });
                html += `</ul>`;
            }
            if (assistMembers.length > 0) {
                html += `<h5>어시스트</h5><ul class="deck-composition-list">`;
                assistMembers.forEach(member => { const pkmData = DB.pokemonType.lev4[member.pokemonId]; if(pkmData) html += `<li><b>어시스트 #${member.position}:</b> ${pkmData.name.ko}</li>`; });
                html += `</ul>`;
            }
            html += `</div>`;
            contentDiv.innerHTML = html;
        }

        function renderCalendarView(contentDiv, data) {
            const calendarView = document.createElement('div');
            calendarView.className = 'calendar-view';
            let monthEvents = {};
            let currentCalendarDate = new Date();
            function buildCalendar(year, month) {
                const date = new Date(year, month);
                const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startDay = firstDay.getDay();
                const today = new Date();
                monthEvents = {};
                const addEvent = (event, eventDate) => { const day = eventDate.getDate(); if (!monthEvents[day]) monthEvents[day] = []; const eventIdentifier = event.title || event.name; if (!monthEvents[day].some(e => (e.title || e.name) === eventIdentifier && e.date.startsWith(event.date.substring(0, 10)) )) { monthEvents[day].push({ ...event, displayDate: eventDate.toISOString().split('T')[0]}); } };
                (data.events || []).forEach(event => { for (let i = 0; i < (event.duration || 1); i++) { const eventDate = new Date(event.date + 'T00:00:00'); eventDate.setDate(eventDate.getDate() + i); if (eventDate.getFullYear() === year && eventDate.getMonth() === month) { addEvent(event, eventDate); } } });
                (data.recurringEvents || []).forEach(re => { if (re.id === 'luckycat') { let currentDate = new Date(re.startDate + 'T00:00:00'); while (currentDate.getFullYear() <= year) { if(currentDate.getFullYear() > year || (currentDate.getFullYear() === year && currentDate.getMonth() > month)) break; for (let i = 0; i < (re.duration || 1); i++) { const eventDate = new Date(currentDate.getTime()); eventDate.setDate(eventDate.getDate() + i); if (eventDate.getFullYear() === year && eventDate.getMonth() === month) { addEvent({ ...re, date: eventDate.toISOString().split('T')[0] }, eventDate); } } if (re.interval === '4_weeks') { currentDate.setDate(currentDate.getDate() + 28); } } } });
                let html = `<div class="calendar-header"><span class="calendar-title">${year}년 ${month + 1}월</span><div class="calendar-nav"><button id="cal-prev-btn">&lt; 이전</button><button id="cal-today-btn">Today</button><button id="cal-next-btn">다음 &gt;</button></div></div><div class="calendar-legend"><div class="legend-item"><span class="legend-dot legend-ranking"></span> 랭킹뽑기</div><div class="legend-item"><span class="legend-dot legend-limited"></span> 한정뽑기</div><div class="legend-item"><span class="legend-dot legend-luckycat"></span> 복냥이</div></div><table class="calendar-grid"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>`;
                let dateCounter = 1;
                for (let i = 0; i < 6; i++) { html += '<tr>'; for (let j = 0; j < 7; j++) { if (i === 0 && j < startDay) { html += '<td class="day-other-month"></td>'; } else if (dateCounter > daysInMonth) { html += '<td class="day-other-month"></td>'; } else { const fullDateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(dateCounter).padStart(2,'0')}`; const isToday = (fullDateStr === today.toISOString().split('T')[0]); const eventsOnDay = monthEvents[dateCounter]; let cellClass = 'day-current-month'; if (isToday) cellClass += ' day-today'; if (eventsOnDay) cellClass += ' has-events'; html += `<td class="${cellClass}" data-date="${fullDateStr}"><div class="date-number">${dateCounter}</div>`; if (eventsOnDay) { html += `<div class="event-markers">`; eventsOnDay.forEach(event => { html += `<div class="event-marker" style="background-color: var(--event-${event.type}-color);">${event.title || event.name}</div>`; }); html += `</div>`; } html += '</td>'; dateCounter++; } } html += '</tr>'; if (dateCounter > daysInMonth) break; }
                html += `</tbody></table>`;
                return html;
            }
            function updateCalendar() { calendarView.innerHTML = buildCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()); }
            contentDiv.innerHTML = ''; contentDiv.appendChild(calendarView); updateCalendar();
            calendarView.addEventListener('click', (e) => { const target = e.target; if(target.id === 'cal-prev-btn') { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); updateCalendar(); } else if (target.id === 'cal-next-btn') { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); updateCalendar(); } else if (target.id === 'cal-today-btn') { currentCalendarDate = new Date(); updateCalendar(); } else { const cell = target.closest('.has-events'); if (cell) { const day = parseInt(cell.dataset.date.split('-')[2]); const events = monthEvents[day]; if (events && events.length > 0) { const eventContent = events.map(e => `<strong>${e.title || e.name}</strong><p>${e.description || ''}</p>`).join('<hr>'); showModal(`${cell.dataset.date} 이벤트`, eventContent); } } } });
        }
        
        function renderDeckBuilder(contentDiv) {
            let html = `<div class="deck-builder-view">
                <div class="placement-area">
                    <h4>덱 배치</h4>
                    <div class="placement-grid-container">
                        <div class="placement-grid-header">
                            <div>어시스트</div>
                            <div>후방</div>
                            <div>전방</div>
                        </div>
                        <div class="placement-grid">
                            <div class="placement-slot assist"></div><div class="placement-slot main"></div><div class="placement-slot main"></div>
                            <div class="placement-slot assist"></div><div class="placement-slot main"></div><div class="placement-slot main"></div>
                            <div class="placement-slot assist"></div><div class="placement-slot main"></div><div class="placement-slot main"></div>
                        </div>
                    </div>
                </div>
                <div class="source-area">
                     <h4>포켓몬 목록</h4>
                    <div class="source-filter-bar">
                        <div class="filter-tabs">
                            <button class="filter-tab active" data-filter="name">이름순</button>
                        </div>
                        <select id="grade-filter" class="filter-dropdown">
                            <option value="all">모든 등급</option>
                            <option value="SS">SS</option>
                            <option value="S+">S+</option>
                            <option value="S">S</option>
                        </select>
                        <select id="type-filter" class="filter-dropdown">
                            <option value="all">모든 타입</option>
                        </select>
                    </div>
                    <div class="source-list"></div>
                </div>
            </div>`;
            contentDiv.innerHTML = html;
        }

        function renderPanelContent(level, data, menuId, clickedId) {
            const targetPanel = panels[`lev${level}`];
            if (!targetPanel) return;
            const contentDiv = targetPanel.querySelector('.panel-content');
            if (!contentDiv) return;
            contentDiv.innerHTML = '';
            setTimeout(() => { contentDiv.scrollTop = 0; }, 0);
            if (!data) { contentDiv.innerHTML = "데이터가 없습니다."; return; }
            
            const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
            const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));

            if (isFinalView) {
                if (clickedId === 'deckBuilder') {
                    if (isMobile()) {
                        contentDiv.innerHTML = `<div class="pc-only-message"><h3>기능 안내</h3><p>배치툴 기능은 화면이 넓은 PC 환경에 최적화되어 있습니다.<br>PC에서 접속하여 이용해주세요.</p></div>`;
                    } else {
                        renderDeckBuilder(contentDiv);
                    }
                } else if (menuId === 'deck' && data.composition) {
                    renderDeckView(contentDiv, data);
                } else if(menuId === 'calendar') {
                    renderCalendarView(contentDiv, data);
                } else if (data.name?.ko && data.stats) { 
                    renderPokemonView(contentDiv, data); 
                } else { 
                    renderSimpleView(contentDiv, data); 
                }
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

        function handleMenuClick(button) {
            const level = parseInt(button.dataset.level);
            const id = button.dataset.id;
            const menuId = button.dataset.menuId || id;
            const currentPanel = panels[`lev${level}`];
            const nextPanel = panels[`lev${level + 1}`];
            if (isMobile()) { currentPanel.classList.add('is-hidden'); }
            if(nextPanel) {
                Object.values(panels).forEach((panel, index) => {
                    if(index > 0 && panel !== nextPanel) { panel.classList.remove('visible'); }
                });
                nextPanel.classList.remove('is-hidden');
                nextPanel.classList.add('visible');
            }
            setActive(level, button);
            const nextLevel = level + 1;
            const nextData = getNextData(level, id, menuId);
            renderPanelContent(nextLevel, nextData, menuId, id);
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
            if (!parentPanel) return;
            const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
            const currentPanel = panels[`lev${level}`];
            const prevPanel = panels[`lev${level - 1}`];
            currentPanel.classList.remove('visible');
            if (prevPanel) {
                if (isMobile()) { prevPanel.classList.remove('is-hidden'); }
                if(prevPanel.id !== 'sidebar') { prevPanel.classList.add('visible'); }
            }
            setActive(level - 1, null);
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

        function initialize() {
            try {
                const gradeCategory = 'pokemonGrade';
                if (DB.hasOwnProperty(gradeCategory) && DB.pokemonType?.lev4) {
                    const grades = {};
                    Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                        if (pokemon && pokemon.grade && pokemon.name?.ko) {
                             const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                            if (gradeId) {
                                if (!grades.hasOwnProperty(gradeId)) grades[gradeId] = [];
                                grades[gradeId].push({ id: pokemonId, name: pokemon.name.ko });
                            }
                        }
                    });
                     DB.pokemonGrade.lev3 = grades;
                }
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
                const existingContent = sidebar.querySelector('.panel-content');
                if(existingContent) existingContent.remove();
                sidebar.appendChild(sidebarContent);
                addEventListeners();
            } catch (error) {
                console.error("초기화 중 오류 발생:", error);
                document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. data.js 또는 script.js 파일을 확인해주세요.";
            }
        }

        function addEventListeners() {
            appContainer.addEventListener('click', e => {
                const button = e.target.closest('button');
                if (!button) return;
                if (button.classList.contains('back-btn')) { handleBackClick(button); }
                else if (button.dataset.level) { handleMenuClick(button); }
            });
        }
        
        initialize();
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        initializeAppUserMode();
    }
});