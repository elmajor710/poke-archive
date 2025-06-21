document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v5.0-final-calendar');

    const app = document.getElementById('app-container');
    // ... (이전과 동일한 변수 선언)
    let selectedDateEl = null; // 선택된 날짜 요소를 추적하기 위한 변수

    // --- 신규 함수: 클릭된 날짜의 일정을 하단에 표시 ---
    function renderAgenda(date, events) {
        const agendaView = app.querySelector('.calendar-agenda-view');
        if (!agendaView) return;

        const weekdayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        const dateObj = new Date(date);
        
        let html = `<div class="agenda-header">${dateObj.getDate()}일 ${weekdayNames[dateObj.getDay()]}</div>`;

        if (events.length > 0) {
            events.forEach(event => {
                const type = event.type || 'default';
                const color = type === 'ranking' ? '#FF4500' : type === 'limited' ? '#1E90FF' : '#32CD32';
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

    // [수정됨] renderCalendarView 함수 - 최종 UI 구현
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
    
        // ... (헤더, 요일 부분은 이전과 동일)
        // [핵심 수정] 하단 설명 영역(agenda-view) 추가
        calendarContainer.innerHTML = `
            <div class="calendar-header">
                <h2>${targetYear}년 ${monthNames[targetMonth]}</h2>
                <div class="calendar-nav">
                    <button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button>
                    <button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button>
                </div>
            </div>
            <div class="calendar-grid"></div>
            <div class="calendar-agenda-view"><p>날짜를 선택하여 일정을 확인하세요.</p></div>
        `;
        const grid = calendarContainer.querySelector('.calendar-grid');
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'calendar-day-name';
            dayNameEl.textContent = day;
            grid.appendChild(dayNameEl);
        });
    
        const monthEvents = new Map();
        (data.events || []).forEach(event => { /* ... 이전과 동일 ... */ });
        (data.recurringEvents || []).forEach(event => { /* ... 이전과 동일 ... */ });

        const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    
        for (let i = 0; i < firstDayOfMonth; i++) { /* ... 이전과 동일 ... */ }
    
        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-date';
            const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dateCell.dataset.date = dateStr; // 클릭 이벤트를 위해 날짜 정보 저장
    
            dateCell.innerHTML = `<div class="date-number">${day}</div>`;
            
            // [핵심 수정] 텍스트 대신 색상 표시기(밑줄)를 추가
            if (monthEvents.has(day)) {
                const indicatorList = document.createElement('div');
                indicatorList.className = 'event-indicator-list';
                // 중복 타입 제거 (한 종류의 이벤트가 여러 개 있어도 밑줄은 하나만)
                const uniqueTypes = [...new Set(monthEvents.get(day).map(e => e.type))];
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
    
    // [수정됨] addEventListeners 함수 - 날짜 클릭 로직 추가
    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            const dateCell = e.target.closest('.calendar-date');

            if (dateCell && !dateCell.classList.contains('other-month')) {
                const date = dateCell.dataset.date;
                const year = new Date(date).getFullYear();
                const month = new Date(date).getMonth();
                const day = new Date(date).getDate();

                // 선택 효과 처리
                if(selectedDateEl) selectedDateEl.classList.remove('selected');
                dateCell.classList.add('selected');
                selectedDateEl = dateCell;

                // 하단에 일정 표시
                const gachaData = DB.calendar.lev3.gachaSchedule;
                const allEvents = [...(gachaData.events || []), ...(gachaData.recurringEvents || [])];
                
                const dayEvents = [];
                allEvents.forEach(event => {
                    if(event.recurrence) { // 반복 이벤트 처리
                         // ... (반복 이벤트 날짜 계산 로직)
                    } else { // 고정 이벤트 처리
                        const startDate = new Date(event.startDate);
                        const endDate = new Date(event.endDate);
                        if(new Date(date) >= startDate && new Date(date) <= endDate) {
                            dayEvents.push(event);
                        }
                    }
                });
                renderAgenda(date, dayEvents);
                return;
            }

            if (button && button.classList.contains('calendar-nav-btn')) {
                // ... (이전과 동일)
            }
            // ... (나머지 클릭 이벤트 처리)
        });
    }

    // 나머지 모든 함수는 이전 버전과 동일합니다.
    // ... (이전 답변의 전체 script.js 코드에서 renderCalendarView와 addEventListeners 함수만 교체)
});