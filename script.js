document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v2.1-calendar-fix');

    const app = document.getElementById('app-container');
    // ... (이전과 동일한 변수 선언)

    // [수정됨] renderCalendarView 함수
    // 이제 year와 month를 인자로 받아 해당 달의 달력을 그립니다.
    function renderCalendarView(contentDiv, data, year, month) {
        const currentDate = new Date();
        // year, month 인자가 없으면 초기값(2025년 6월)으로 설정
        const targetYear = year !== undefined ? year : 2025;
        const targetMonth = month !== undefined ? month : 5; // 0 = 1월, 5 = 6월

        contentDiv.innerHTML = ''; // 기존 내용 초기화

        const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';

        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
            <h2>${targetYear}년 ${monthNames[targetMonth]}</h2>
            <div class="calendar-nav">
                <button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button>
                <button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button>
            </div>
        `;
        calendarContainer.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'calendar-grid';
        
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            grid.innerHTML += `<div class="calendar-day-name">${day}</div>`;
        });

        const firstDay = new Date(targetYear, targetMonth, 1).getDay();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            grid.innerHTML += `<div class="calendar-date other-month"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-date';
            
            const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dateCell.innerHTML = `<div class="date-number">${day}</div>`;
            
            // 날짜 형식 yy.mm.dd 와 yyyy-mm-dd 모두 호환되도록 수정
            const dayEvents = data.events.filter(e => {
                const eventDate = new Date(e.date.replace(/\./g, '-'));
                const cellDate = new Date(dateStr);
                return eventDate.getFullYear() === cellDate.getFullYear() &&
                       eventDate.getMonth() === cellDate.getMonth() &&
                       eventDate.getDate() === cellDate.getDate();
            });

            dayEvents.forEach(event => {
                const eventType = event.type === 'ranking' ? 'ranking' : 'limited';
                dateCell.innerHTML += `<div class="date-event event-${eventType}">${event.title}</div>`;
            });
            
            grid.appendChild(dateCell);
        }
        
        calendarContainer.appendChild(grid);
        contentDiv.appendChild(calendarContainer);

        // 현재 표시된 달력의 연도와 월 정보를 저장
        contentDiv.dataset.currentYear = targetYear;
        contentDiv.dataset.currentMonth = targetMonth;
    }
    
    // renderPokemonView, renderSimpleView 함수는 이전과 동일
    function renderPokemonView(contentDiv, data) { /* ... */ }
    function renderSimpleView(contentDiv, data) { /* ... */ }

    // renderPanel 함수는 이전과 동일
    function renderPanel(level, data, menuId) {
        // ... (renderCalendarView 호출 부분만 수정)
        if (isFinal) {
            // ...
            if (data.events) {
                renderCalendarView(contentDiv, data); // 인자 없이 호출하여 초기 뷰 생성
            } else if (data.stats && data.skills) {
                renderPokemonView(contentDiv, data);
            } // ...
        } // ...
    }
    
    // initialize 함수는 이전과 동일
    function initialize() { /* ... */ }

    // [수정됨] addEventListeners 함수
    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;

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
                
                const gachaData = DB.calendar.lev3.gachaSchedule;
                // 수정된 year, month를 인자로 전달하여 캘린더 다시 그리기
                renderCalendarView(calendarPanel, gachaData, year, month);

                return; 
            }

            if (button.classList.contains('back-btn')) handleBackClick(button);
            else if (button.dataset.level) handleMenuClick(button);
        });
    }

    // handleMenuClick, getNextData 등 나머지 함수들은 이전과 동일
    function handleMenuClick(button) { /* ... */ }
    function getNextData(currentLevel, id, menuId) { /* ... */ }
    function handleBackClick(button) { /* ... */ }
    function setActive(level, target) { /* ... */ }
    
    // (이전 답변의 전체 script.js 코드에서 renderCalendarView와 addEventListeners 함수만 위 내용으로 교체하시면 됩니다)
    // 설명을 위해 생략했지만, 전체 코드를 붙여넣는 것이 안전합니다.
    // 여기에 이전 답변의 전체 JS 코드를 붙여넣고, 위 두 함수만 교체
});