document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v4.0-final-fix');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    // 캘린더, 포켓몬, 단순 뷰 렌더링 함수 (Phase 1에서는 캘린더는 텍스트 목록으로만 표시)
    // script.js 파일에서 이 함수만 찾아서 교체해주세요.
    function renderCalendarView(contentDiv, data, year, month) {
    const targetDate = new Date();
    // year, month 인자가 있으면 해당 날짜로, 없으면 2025년 6월을 기본으로 설정합니다.
    if (year !== undefined && month !== undefined) {
        targetDate.setFullYear(year, month, 1);
    } else {
        targetDate.setFullYear(2025, 5, 1); // 초기값: 2025년 6월
    }

    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();

    contentDiv.innerHTML = ''; // 기존 내용 초기화

    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';

    // 캘린더 헤더 생성 (이전과 동일)
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `<h2>${targetYear}년 ${monthNames[targetMonth]}</h2><div class="calendar-nav"><button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button><button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button></div>`;
    calendarContainer.appendChild(header);

    // 캘린더 격자 및 요일 생성 (이전과 동일)
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
        const dayNameEl = document.createElement('div');
        dayNameEl.className = 'calendar-day-name';
        dayNameEl.textContent = day;
        grid.appendChild(dayNameEl);
    });

    // --- [핵심 로직] 현재 월에 표시될 모든 이벤트를 미리 계산 ---
    const monthEvents = new Map(); // key: 날짜(dd), value: 이벤트 객체 배열

    // 1. 고정 이벤트 처리 (3일 기간)
    (data.events || []).forEach(event => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            if (currentDate.getFullYear() === targetYear && currentDate.getMonth() === targetMonth) {
                const day = currentDate.getDate();
                if (!monthEvents.has(day)) monthEvents.set(day, []);
                monthEvents.get(day).push(event);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    // 2. 반복 이벤트(복냥이) 처리
    (data.recurringEvents || []).forEach(event => {
        let currentDate = new Date(event.startDate);
        // 성능을 위해 현재 달의 이전과 다음 달까지만 계산
        const viewStartDate = new Date(targetYear, targetMonth - 1, 1);
        const viewEndDate = new Date(targetYear, targetMonth + 2, 0);

        while (currentDate < viewEndDate) {
            if (currentDate >= viewStartDate) {
                for (let i = 0; i < event.durationDays; i++) {
                    const eventDay = new Date(currentDate);
                    eventDay.setDate(eventDay.getDate() + i);
                    if (eventDay.getFullYear() === targetYear && eventDay.getMonth() === targetMonth) {
                        const day = eventDay.getDate();
                        if (!monthEvents.has(day)) monthEvents.set(day, []);
                        monthEvents.get(day).push(event);
                    }
                }
            }
            // 4주(28일) 뒤로 날짜 이동
            currentDate.setDate(currentDate.getDate() + event.recurrence.interval * 7);
        }
    });
    
    // --- 날짜 격자 그리기 ---
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-date other-month';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateCell = document.createElement('div');
        dateCell.className = 'calendar-date';

        const dateNumberEl = document.createElement('div');
        dateNumberEl.className = 'date-number';
        dateNumberEl.textContent = day;
        dateCell.appendChild(dateNumberEl);
        
        // 미리 계산된 이벤트 목록에서 오늘 날짜의 이벤트를 가져와 표시
        if (monthEvents.has(day)) {
            monthEvents.get(day).forEach(event => {
                const eventEl = document.createElement('div');
                const eventType = event.type || 'default';
                eventEl.className = `date-event event-${eventType}`;
                eventEl.textContent = event.title;
                dateCell.appendChild(eventEl);
            });
        }
        grid.appendChild(dateCell);
    }
    
    calendarContainer.appendChild(grid);
    contentDiv.appendChild(calendarContainer);

    contentDiv.dataset.currentYear = targetYear;
    contentDiv.dataset.currentMonth = targetMonth;
    }   

    function renderPokemonView(contentDiv, data) {
        let html = `<h2>${data.name} (${data.grade})</h2>`;
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

    // 메인 패널 렌더링 함수
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
    
    // 초기화 및 이벤트 리스너 함수들
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
            if (!button) return;
            if (button.classList.contains('back-btn')) handleBackClick(button);
            else if (button.dataset.level) handleMenuClick(button);
        });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        if (level === 1) { app.className = ""; }
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