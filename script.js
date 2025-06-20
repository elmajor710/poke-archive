document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v2.0-calendar');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    // [수정됨] renderCalendarView 함수
    function renderCalendarView(contentDiv, data) {
        let currentDate = new Date();
        // 캘린더가 표시될 때마다, 현재 월/년을 기준으로 그리도록 수정
        // 사용자의 데이터가 2025년 6월부터 시작하므로, 초기 뷰를 2025년 6월로 설정합니다.
        currentDate.setFullYear(2025, 5, 1); 

        function drawCalendar(year, month) {
            contentDiv.innerHTML = ''; // 기존 내용 초기화

            const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
            const calendarContainer = document.createElement('div');
            calendarContainer.className = 'calendar-container';

            // 캘린더 헤더 (연도/월, 이전/다음 버튼)
            const header = document.createElement('div');
            header.className = 'calendar-header';
            header.innerHTML = `
                <h2>${year}년 ${monthNames[month]}</h2>
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button>
                    <button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button>
                </div>
            `;
            calendarContainer.appendChild(header);

            // 캘린더 격자
            const grid = document.createElement('div');
            grid.className = 'calendar-grid';
            
            // 요일 표시
            const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
            weekdays.forEach(day => {
                grid.innerHTML += `<div class="calendar-day-name">${day}</div>`;
            });

            // 날짜 계산
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // 이전 달의 빈 날짜 채우기
            for (let i = 0; i < firstDay; i++) {
                grid.innerHTML += `<div class="calendar-date other-month"></div>`;
            }

            // 현재 달의 날짜 채우기
            for (let day = 1; day <= daysInMonth; day++) {
                const dateCell = document.createElement('div');
                dateCell.className = 'calendar-date';
                
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dateCell.innerHTML = `<div class="date-number">${day}</div>`;

                // 해당 날짜의 이벤트 찾아서 추가
                const dayEvents = data.events.filter(e => e.date === dateStr);
                dayEvents.forEach(event => {
                    const eventType = event.type === 'ranking' ? 'ranking' : 'limited';
                    dateCell.innerHTML += `<div class="date-event event-${eventType}">${event.title}</div>`;
                });
                
                grid.appendChild(dateCell);
            }
            
            calendarContainer.appendChild(grid);
            contentDiv.appendChild(calendarContainer);
        }
        
        // 현재 날짜로 초기 캘린더 그리기
        drawCalendar(currentDate.getFullYear(), currentDate.getMonth());

        // 이벤트 리스너에서 달력 버튼을 처리할 수 있도록 현재 날짜 정보를 저장
        contentDiv.dataset.currentYear = currentDate.getFullYear();
        contentDiv.dataset.currentMonth = currentDate.getMonth();
    }

    function renderPokemonView(contentDiv, data) {
        contentDiv.innerHTML = `<h2>${data.name} (${data.grade})</h2><p>포켓몬 상세 화면 개발 예정입니다.</p>`;
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
            if (data.events) {
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
                if (pokemon.grade) {
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

    // [수정됨] addEventListeners 함수
    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;

            // 캘린더 네비게이션 버튼 처리
            if (button.classList.contains('calendar-nav-btn')) {
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
                
                // 캘린더 다시 그리기 (같은 데이터, 다른 날짜)
                const gachaData = DB.calendar.lev3.gachaSchedule;
                renderCalendarView(calendarPanel, gachaData);
                // 새로 그려진 캘린더의 날짜를 업데이트
                const newCalendarPanel = app.querySelector('#lev3-panel .panel-content'); // 다시 선택
                let newDate = new Date(year, month);
                newCalendarPanel.querySelector('.calendar-header h2').textContent = `${newDate.getFullYear()}년 ${newDate.getMonth()+1}월`;
                newCalendarPanel.dataset.currentYear = newDate.getFullYear();
                newCalendarPanel.dataset.currentMonth = newDate.getMonth();

                return; // 다른 클릭 로직 중복 실행 방지
            }

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