document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v8.1-admin-init');

    // 공통으로 사용될 DOM 요소
    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');

    // URL을 확인하여 어떤 모드로 시작할지 결정
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        // =============== 운영자 모드 실행 ===============
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        
        const adminContent = document.getElementById('admin-content');
        const codeOutput = document.getElementById('code-output');

        // script.js 파일에서 이 함수만 찾아서 교체해주세요.
    function renderAdminDashboard() {
    adminContent.innerHTML = `
        <h3>데이터 추가 종류 선택</h3>
        <select id="data-type-selector">
            <option value="">-- 종류를 선택하세요 --</option>
            <option value="pokemon">포켓몬</option>
            <option value="item">아이템</option>
            <option value="rune">룬</option>
            <option value="chip">칩</option>
            <option value="deck">추천덱</option>
            <option value="calendar">캘린더</option>
            <option value="tip">팁&노하우</option>
        </select>
        <div id="admin-form-container" style="margin-top: 20px;"></div>
    `;

    document.getElementById('data-type-selector').addEventListener('change', (e) => {
        const type = e.target.value;
        const formContainer = document.getElementById('admin-form-container');
        
        if (type) {
            // 선택된 메뉴의 한글 이름을 가져옵니다.
            const selectedText = e.target.options[e.target.selectedIndex].text;
            formContainer.innerHTML = `<h4>'${selectedText}' 추가 폼 (개발 예정)</h4>`;
        } else {
            formContainer.innerHTML = '';
        }
        codeOutput.value = '';
    });
    }

        renderAdminDashboard();

    } else {
        // =============== 일반 사용자 모드 실행 ===============
        const sidebar = document.getElementById('sidebar');
        const panels = {
            lev2: document.getElementById('lev2-panel'),
            lev3: document.getElementById('lev3-panel'),
            lev4: document.getElementById('lev4-panel'),
        };
        let activeButtons = {};
        let selectedDateEl = null;
        let monthEventsCache = new Map();

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

        function getEventsForDate(dateStr, gachaData) {
            const targetDate = new Date(dateStr + 'T00:00:00');
            if (isNaN(targetDate.getTime())) return [];
            const foundEvents = [];
            (gachaData.events || []).forEach(event => {
                const startDate = new Date(event.startDate + 'T00:00:00');
                const endDate = new Date(event.endDate + 'T00:00:00');
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    if (targetDate >= startDate && targetDate <= endDate) {
                        foundEvents.push(event);
                    }
                }
            });
            (gachaData.recurringEvents || []).forEach(event => {
                let occurrenceStart = new Date(event.startDate + 'T00:00:00');
                if (isNaN(occurrenceStart.getTime())) return;
                const stopDate = new Date(targetDate);
                stopDate.setFullYear(stopDate.getFullYear() + 1);
                while (occurrenceStart <= stopDate) {
                    const occurrenceEnd = new Date(occurrenceStart);
                    occurrenceEnd.setDate(occurrenceStart.getDate() + (event.durationDays - 1));
                    if (targetDate >= occurrenceStart && targetDate <= occurrenceEnd) {
                        foundEvents.push({ ...event, title: event.title });
                        break;
                    }
                    if (occurrenceStart > targetDate) break;
                    occurrenceStart.setDate(occurrenceStart.getDate() + (event.recurrence.interval * 7));
                }
            });
            return foundEvents;
        }

        function renderCalendarView(contentDiv, data, year, month) {
            const targetDate = new Date();
            if (year !== undefined && month !== undefined) {
                targetDate.setFullYear(year, month, 1);
            } else {
                targetDate.setFullYear(2025, 5, 1);
            }
            const targetYear = targetDate.getFullYear();
            const targetMonth = targetDate.getMonth();
            contentDiv.innerHTML = '';
            monthEventsCache.clear();
            const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
            const calendarContainer = document.createElement('div');
            calendarContainer.className = 'calendar-container';
            calendarContainer.innerHTML = `<div class="calendar-header"><h2>${targetYear}년 ${monthNames[targetMonth]}</h2><div class="calendar-nav"><button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button><button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button></div></div><div class="calendar-legend"><div class="legend-item"><div class="legend-color-box" style="background-color: #FF4500;"></div><span>랭킹뽑기</span></div><div class="legend-item"><div class="legend-color-box" style="background-color: #1E90FF;"></div><span>한정뽑기</span></div><div class="legend-item"><div class="legend-color-box" style="background-color: #32CD32;"></div><span>복냥이</span></div></div><div class="calendar-grid"></div>`;
            const grid = calendarContainer.querySelector('.calendar-grid');
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            weekdays.forEach(day => { const el = grid.appendChild(document.createElement('div')); el.className = 'calendar-day-name'; el.textContent = day; });
            const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                monthEventsCache.set(day, getEventsForDate(dateStr, data));
            }
            const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
            for (let i = 0; i < firstDayOfMonth; i++) { grid.appendChild(document.createElement('div')).className = 'calendar-date other-month'; }
            for (let day = 1; day <= daysInMonth; day++) {
                const dateCell = document.createElement('div');
                dateCell.className = 'calendar-date';
                const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dateCell.dataset.date = dateStr;
                dateCell.innerHTML = `<div class="date-number">${day}</div>`;
                const eventsForDay = monthEventsCache.get(day);
                if (eventsForDay && eventsForDay.length > 0) {
                    const indicatorList = document.createElement('div');
                    indicatorList.className = 'event-indicator-list';
                    const uniqueTypes = [...new Set(eventsForDay.map(e => e.type))];
                    uniqueTypes.forEach(type => {
                        const indicator = document.createElement('div');
                        indicator.className = `event-indicator indicator-${type || 'default'}`;
                        indicatorList.appendChild(indicator);
                    });
                    dateCell.appendChild(indicatorList);
                }
                grid.appendChild(dateCell);
            }
            contentDiv.appendChild(calendarContainer);
            contentDiv.dataset.currentYear = targetYear;
            contentDiv.dataset.currentMonth = targetMonth;
        }
        
        function renderPokemonView(contentDiv, data) {
            let html = `<h2>${data.name} (${data.grade || ''})</h2>`;
            if (data.imageURL && data.imageURL.startsWith('http')) { html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`; }
            html += `<p>포켓몬 상세 화면 개발 예정입니다.</p>`;
            contentDiv.innerHTML = html;
        }

        function renderSimpleView(contentDiv, data) {
            let html = `<h2>${data.name}</h2>`;
            if (data.imageURL && data.imageURL.startsWith('http')) { html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`; }
            if (data.description) { html += `<p>${data.description.replace(/\n/g, '<br>')}</p>`; }
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
                app.className = `final-view-L${finalLevelForCategory}`;
                Object.values(panels).forEach(p => p.classList.remove('visible'));
                if (data.events || data.recurringEvents) {
                    renderCalendarView(contentDiv, data);
                } else if (data.stats && data.skills) {
                    renderPokemonView(contentDiv, data);
                } else if (data.description) {
                    renderSimpleView(contentDiv, data);
                } else {
                    contentDiv.innerHTML = data.content || "콘텐츠를 표시할 수 없습니다.";
                }
            } else {
                app.className = "";
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
                            DB[gradeCategory].lev3[gradeId] = grades[gradeKey].map(p => ({id: p.id, name: p.name}));
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
            app.addEventListener('click', e => {
                const button = e.target.closest('button');
                const dateCell = e.target.closest('.calendar-date');
                if (dateCell && !dateCell.classList.contains('other-month')) {
                    const date = dateCell.dataset.date;
                    const day = new Date(date + 'T00:00:00').getDate();
                    const dayEvents = monthEventsCache.get(day) || [];
                    if (dayEvents.length > 0) {
                        const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
                        const dateObj = new Date(date + 'T00:00:00');
                        let modalHTML = '';
                        dayEvents.forEach(event => {
                            const type = event.type || 'default';
                            const color = type === 'ranking' ? '#FF4500' : type === 'limited' ? '#1E90FF' : (type === 'special' ? '#32CD32' : '#888');
                            modalHTML += `<div class="agenda-item"><div class="agenda-item-color" style="background-color: ${color};"></div><div class="agenda-item-title">${event.title}</div></div>`;
                        });
                        showModal(`${dateObj.getDate()}일 ${weekdayNames[dateObj.getDay()]}`, modalHTML);
                    }
                    return;
                }
                if (button && button.classList.contains('calendar-nav-btn')) {
                    const action = button.dataset.action;
                    const calendarPanel = button.closest('.panel-content');
                    let year = parseInt(calendarPanel.dataset.currentYear);
                    let month = parseInt(calendarPanel.dataset.currentMonth);
                    if (action === 'prev-month') { month--; if (month < 0) { month = 11; year--; } } 
                    else if (action === 'next-month') { month++; if (month > 11) { month = 0; year++; } }
                    const gachaData = DB.calendar.lev3.gachaSchedule;
                    renderCalendarView(calendarPanel, gachaData, year, month);
                    return; 
                }
                if (button && button.classList.contains('back-btn')) handleBackClick(button);
                else if (button && button.dataset.level) handleMenuClick(button);
            });
        }

        function handleMenuClick(button) {
            const level = parseInt(button.dataset.level);
            const id = button.dataset.id;
            const menuId = button.dataset.menuId || id;
            if (level === 1) { app.className = ""; selectedDateEl = null; }
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
            app.className = ""; 
            selectedDateEl = null;
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
    }
});