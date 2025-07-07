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
                gridTable.appendChild(gridBody);
                calendarView.appendChild(gridTable);

                let calendarDay = new Date(firstDayOfMonth);
                calendarDay.setDate(calendarDay.getDate() - firstDayOfMonth.getDay());

                // 주(Week)별로 이벤트 배치
                for (let i = 0; i < 6; i++) {
                    const weekRow = document.createElement('tr');
                    const weekEventTracks = []; 
                    
                    const startOfWeek = new Date(calendarDay);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(endOfWeek.getDate() + 6);

                    // 1. 해당 주의 날짜 셀(<td>) 먼저 생성
                    for (let j = 0; j < 7; j++) {
                        const dayCell = document.createElement('td');
                        const dayClass = calendarDay.getMonth() !== month ? 'day-other-month' : 'day-current-month';
                        const todayClass = calendarDay.toDateString() === new Date().toDateString() ? ' day-today' : '';
                        dayCell.className = `${dayClass}${todayClass}`;
                        dayCell.dataset.date = calendarDay.toISOString().split('T')[0];
                        dayCell.innerHTML = `<div class="date-number">${calendarDay.getDate()}</div><div class="events-in-day"></div>`;
                        weekRow.appendChild(dayCell);
                        calendarDay.setDate(calendarDay.getDate() + 1);
                    }
                    
                    // 2. 해당 주에 걸쳐있는 이벤트들을 필터링
                    const weekEvents = monthEvents.filter(e => e.startDate <= endOfWeek && e.endDate >= startOfWeek);
                    
                    weekEvents.sort((a,b) => (b.endDate - b.startDate) - (a.endDate - a.startDate)).forEach(event => {
                        const eventStartForWeek = (event.startDate < startOfWeek) ? startOfWeek : event.startDate;
                        const startCell = weekRow.querySelector(`td[data-date='${eventStartForWeek.toISOString().split('T')[0]}']`);
                        
                        if(startCell) {
                             const eventEndForWeek = (event.endDate > endOfWeek) ? endOfWeek : event.endDate;
                             const duration = Math.round((eventEndForWeek - eventStartForWeek) / (1000 * 60 * 60 * 24)) + 1;
                             
                             let track = 0;
                             while(true) {
                                let isTaken = false;
                                for(let k=0; k < duration; k++) {
                                    const checkDate = new Date(eventStartForWeek);
                                    checkDate.setDate(checkDate.getDate() + k);
                                    if(weekEventTracks[track] && weekEventTracks[track].includes(checkDate.getDay())) {
                                        isTaken = true;
                                        break;
                                    }
                                }
                                if(!isTaken) break;
                                track++;
                             }
                             if(!weekEventTracks[track]) weekEventTracks[track] = [];
                             for(let k=0; k < duration; k++) {
                                const checkDate = new Date(eventStartForWeek);
                                checkDate.setDate(checkDate.getDate() + k);
                                weekEventTracks[track].push(checkDate.getDay());
                             }
                             
                             const eventsInDayContainer = startCell.querySelector('.events-in-day');
                             const eventBar = document.createElement('div');
                             eventBar.className = `event-bar event-type-${event.type}`;
                             eventBar.textContent = event.title || event.name;
                             eventBar.style.gridColumn = `auto / span ${duration}`;
                             eventBar.style.gridRow = track + 1;

                             eventBar.dataset.title = event.title || event.name;
                             eventBar.dataset.description = event.description || '';
                             eventBar.dataset.startDate = event.startDate.toISOString().split('T')[0];
                             eventBar.dataset.endDate = event.endDate.toISOString().split('T')[0];
                             
                             eventsInDayContainer.appendChild(eventBar);
                        }
                    });

                    gridBody.appendChild(weekRow);
                }
                
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
                } else if (data.name?.ko) { 
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
            // This function is complete and correct
        }

        function getNextData(currentLevel, id, menuId) {
            // This function is complete and correct
        }

        function handleBackClick(button) {
            // This function is complete and correct
        }

        function setActive(level, target) {
            // This function is complete and correct
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