document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v5.0-final-calendar');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};
    let selectedDateEl = null;

    function renderAgenda(date, events) {
        const agendaView = app.querySelector('.calendar-agenda-view');
        if (!agendaView) return;

        const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        const dateObj = new Date(date + 'T00:00:00');
        
        let html = `<div class="agenda-header">${dateObj.getDate()}일 ${weekdayNames[dateObj.getDay()]}</div>`;

        if (events && events.length > 0) {
            events.forEach(event => {
                const type = event.type || 'default';
                const color = type === 'ranking' ? '#FF4500' : type === 'limited' ? '#1E90FF' : (type === 'special' ? '#32CD32' : '#888');
                html += `
                    <div class="agenda-item">
                        <div class="agenda-item-color" style="background-color: ${color};"></div>
                        <div class="agenda-item-title">${event.title}</div>
                    </div>
                `;
            });
        } else {
            html += `<p>선택된 날짜에 일정이 없습니다.</p>`;
        }
        agendaView.innerHTML = html;
    }

    // script.js 파일에서 이 함수만 찾아서 교체해주세요.
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

    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';

    // [핵심 수정] 캘린더 헤더와 범례를 함께 생성합니다.
    calendarContainer.innerHTML = `
        <div class="calendar-header">
            <h2>${targetYear}년 ${monthNames[targetMonth]}</h2>
            <div class="calendar-nav">
                <button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button>
                <button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button>
            </div>
        </div>
        <div class="calendar-legend">
            <div class="legend-item">
                <div class="legend-color-box" style="background-color: #FF4500;"></div>
                <span>랭킹뽑기</span>
            </div>
            <div class="legend-item">
                <div class="legend-color-box" style="background-color: #1E90FF;"></div>
                <span>한정뽑기</span>
            </div>
            <div class="legend-item">
                <div class="legend-color-box" style="background-color: #32CD32;"></div>
                <span>복냥이</span>
            </div>
        </div>
        <div class="calendar-grid"></div>
        <div class="calendar-agenda-view"><p>날짜를 선택하여 일정을 확인하세요.</p></div>
    `;
    
    // 이하 로직은 이전 답변과 모두 동일합니다.
    // ... (grid, weekdays, monthEvents 계산 및 날짜 그리는 로직)
    }
    
    function renderPokemonView(contentDiv, data) {
        let html = `<h2>${data.name} (${data.grade || ''})</h2>`;
        if (data.imageURL && data.imageURL.startsWith('http')) {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`;
        }
        html += `<p>포켓몬 상세 화면 개발 예정입니다.</p>`;
        contentDiv.innerHTML = html;
    }

    function renderSimpleView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        if (data.imageURL && data.imageURL.startsWith('http')) {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`;
        }
        if (data.description) {
            html += `<p>${data.description.replace(/\n/g, '<br>')}</p>`;
        }
        contentDiv.innerHTML = html;
    }

    function renderPanel(level, data, menuId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        contentDiv.innerHTML = '';
        setTimeout(() => { contentDiv.scrollTop = 0; }, 0);
        if (!data) {
            contentDiv.innerHTML = "데이터가 없습니다.";
            targetPanel.classList.add('visible');
            return;
        }
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
    }

    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            const dateCell = e.target.closest('.calendar-date');

            if (dateCell && !dateCell.classList.contains('other-month')) {
                const date = dateCell.dataset.date;
                if(selectedDateEl) selectedDateEl.classList.remove('selected');
                dateCell.classList.add('selected');
                selectedDateEl = dateCell;

                const gachaData = DB.calendar.lev3.gachaSchedule;
                const allStaticEvents = gachaData.events || [];
                const allRecurringEvents = gachaData.recurringEvents || [];
                const clickedDate = new Date(date + 'T00:00:00');
                
                const dayEvents = [];

                allStaticEvents.forEach(event => {
                    const startDate = new Date(event.startDate + 'T00:00:00');
                    const endDate = new Date(event.endDate + 'T00:00:00');
                    if(clickedDate >= startDate && clickedDate <= endDate) {
                        dayEvents.push(event);
                    }
                });

                allRecurringEvents.forEach(event => {
                    let currentDate = new Date(event.startDate + 'T00:00:00');
                    const stopDate = new Date(clickedDate);
                    stopDate.setMonth(stopDate.getMonth() + 2);

                    while(currentDate < stopDate) {
                        const startDate = new Date(currentDate);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + (event.durationDays - 1));
                        
                        if(clickedDate >= startDate && clickedDate <= endDate) {
                            dayEvents.push(event);
                            break;
                        }
                        if(startDate > clickedDate) break;

                        currentDate.setDate(currentDate.getDate() + event.recurrence.interval * 7);
                    }
                });

                renderAgenda(date, dayEvents);
                return;
            }

            if (button && button.classList.contains('calendar-nav-btn')) {
                const action = button.dataset.action;
                const calendarPanel = button.closest('.panel-content');
                let year = parseInt(calendarPanel.dataset.currentYear);
                let month = parseInt(calendarPanel.dataset.currentMonth);
                if (action === 'prev-month') {
                    month--;
                    if (month < 0) { month = 11; year--; }
                } else if (action === 'next-month') {
                    month++;
                    if (month > 11) { month = 0; year++; }
                }
                const gachaData = DB.calendar.lev3.gachaSchedule;
                renderCalendarview(calendarPanel, gachaData, year, month);
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
    
    initialize();
});