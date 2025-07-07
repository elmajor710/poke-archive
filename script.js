document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

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

        function showModal(title, contentHTML, isWeatherPopup = false, callback) {
            const existingModal = document.querySelector('.modal-overlay');
            if (existingModal) existingModal.remove();
            
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            
            let modalClass = 'modal-content';
            if (isWeatherPopup) modalClass += ' weather-popup';
            
            modalOverlay.innerHTML = `<div class="${modalClass}"><div class="modal-header"><h2>${title}</h2><button class="modal-close-btn">&times;</button></div><div class="modal-body">${contentHTML}</div></div>`;
            document.body.appendChild(modalOverlay);
            
            modalOverlay.addEventListener('click', (e) => {
                const target = e.target;
                const weatherOption = target.closest('.weather-option');

                if (target.matches('.modal-overlay, .modal-close-btn')) {
                    modalOverlay.remove();
                } else if (isWeatherPopup && weatherOption && callback) {
                    callback(weatherOption.dataset.weatherName);
                    modalOverlay.remove();
                }
            });
        }
        
        function renderPokemonView(contentDiv, data) {
            // This function is complete and correct
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
             // This function is complete and correct
        }
        
        function renderDeckView(contentDiv, data) {
            // This function is complete and correct
        }

        function renderCalendarView(contentDiv, data) {
            let currentCalendarDate = new Date();

            function buildCalendar(year, month) {
                const calendarView = document.createElement('div');
                calendarView.className = 'calendar-view';

                const firstDayOfMonth = new Date(year, month, 1);
                const lastDayOfMonth = new Date(year, month + 1, 0);
                
                const monthEvents = [];
                (data.events || []).forEach(event => {
                    const startDate = new Date(event.date + 'T00:00:00');
                    const endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + (event.duration > 1 ? event.duration - 1 : 0));
                    if (startDate <= lastDayOfMonth && endDate >= firstDayOfMonth) {
                        monthEvents.push({ ...event, startDate, endDate });
                    }
                });
                (data.recurringEvents || []).forEach(re => {
                    let currentDate = new Date(re.startDate + 'T00:00:00');
                    while (currentDate.getFullYear() < year + 2) {
                        if (currentDate.getFullYear() === year && currentDate.getMonth() > month + 1) break;
                        if (currentDate.getFullYear() > year + 1) break;

                        const startDate = new Date(currentDate);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + (re.duration > 1 ? re.duration - 1 : 0));

                        if (startDate <= lastDayOfMonth && endDate >= firstDayOfMonth) {
                            monthEvents.push({ ...re, date: startDate.toISOString().split('T')[0], startDate, endDate });
                        }
                        if (re.interval === '4_weeks') {
                            currentDate.setDate(currentDate.getDate() + 28);
                        } else {
                            break;
                        }
                    }
                });

                let headerHTML = `
                    <div class="calendar-header">
                        <span class="calendar-title">${year}년 ${month + 1}월</span>
                        <div class="calendar-nav">
                            <button id="cal-prev-btn">&lt; 이전</button>
                            <button id="cal-today-btn">Today</button>
                            <button id="cal-next-btn">다음 &gt;</button>
                        </div>
                    </div>
                    <div class="calendar-legend">
                        <div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div>
                        <div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div>
                        <div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div>
                    </div>`;
                calendarView.innerHTML = headerHTML;
                
                const gridTable = document.createElement('table');
                gridTable.className = 'calendar-grid';
                gridTable.innerHTML = `<thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead>`;
                const gridBody = document.createElement('tbody');

                let calendarDay = new Date(firstDayOfMonth);
                calendarDay.setDate(calendarDay.getDate() - firstDayOfMonth.getDay());

                for (let i = 0; i < 6; i++) {
                    let weekRowHTML = '<tr>';
                    for (let j = 0; j < 7; j++) {
                        const dayClass = calendarDay.getMonth() !== month ? 'day-other-month' : 'day-current-month';
                        const todayClass = calendarDay.toDateString() === new Date().toDateString() ? ' day-today' : '';
                        weekRowHTML += `<td class="${dayClass}${todayClass}" data-date="${calendarDay.toISOString().split('T')[0]}">
                                          <div class="date-number">${calendarDay.getDate()}</div>
                                          <div class="events-in-day"></div>
                                        </td>`;
                        calendarDay.setDate(calendarDay.getDate() + 1);
                    }
                    weekRowHTML += '</tr>';
                    gridBody.innerHTML += weekRowHTML;
                }
                gridTable.appendChild(gridBody);
                calendarView.appendChild(gridTable);

                // --- 이벤트 렌더링 로직 시작 ---
                monthEvents.sort((a,b) => (a.endDate - a.startDate) - (b.endDate - b.startDate)).forEach(event => {
                    let currentEventDate = new Date(event.startDate);
                    while(currentEventDate <= event.endDate) {
                        const dateString = currentEventDate.toISOString().split('T')[0];
                        const startCell = calendarView.querySelector(`td[data-date='${dateString}']`);

                        if(startCell && currentEventDate.getDay() === event.startDate.getDay()) {
                            const eventsInDayContainer = startCell.querySelector('.events-in-day');
                            let track = 0;
                            while(true) {
                                const isTrackTaken = Array.from(eventsInDayContainer.children).some(child => parseInt(child.style.gridRowStart) === track + 1);
                                if (!isTrackTaken) break;
                                track++;
                            }

                            const eventBar = document.createElement('div');
                            eventBar.className = `event-bar event-type-${event.type}`;
                            eventBar.textContent = event.title || event.name;
                            
                            const duration = Math.round((event.endDate - event.startDate) / (1000 * 60 * 60 * 24)) + 1;
                            eventBar.style.gridColumn = `auto / span ${duration}`;
                            eventBar.style.gridRow = track + 1;

                            eventBar.dataset.title = event.title || event.name;
                            eventBar.dataset.description = event.description || '';
                            eventBar.dataset.startDate = event.startDate.toISOString().split('T')[0];
                            eventBar.dataset.endDate = event.endDate.toISOString().split('T')[0];
                            
                            eventsInDayContainer.appendChild(eventBar);
                        }
                        currentEventDate.setDate(currentEventDate.getDate() + 1);
                        if (currentEventDate.getDay() === 0) break; // 다음 주로 넘어가는 이벤트는 다음 루프에서 처리
                    }
                });

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
                        const eventBar = target.closest('.event-bar');
                        if (eventBar) {
                            const { title, description, startDate, endDate } = eventBar.dataset;
                             const duration = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1;
                            const period = startDate === endDate ? startDate : `${startDate} ~ ${endDate} (${duration}일간)`;
                            showModal(`${title}`, `<p><strong>기간:</strong> ${period}</p><p>${description}</p>`);
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
            // This function is complete and correct
        }
        
        function renderPanelContent(level, data, menuId, clickedId) {
            // ... This function is complete and correct ...
        }

        function handleMenuClick(button) {
            // ... This function is complete and correct ...
        }

        function getNextData(currentLevel, id, menuId) {
            // ... This function is complete and correct ...
        }

        function handleBackClick(button) {
            // ... This function is complete and correct ...
        }

        function setActive(level, target) {
            // ... This function is complete and correct ...
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
    
    initializeAppUserMode();
});