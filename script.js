document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v3.1-core-calendar-logic');

    // ... (app, sidebar 등 변수 선언은 이전과 동일)

    // [수정됨] renderCalendarView 함수 - 모든 이벤트 로직 구현
    function renderCalendarView(contentDiv, data, year, month) {
        const targetDate = new Date();
        if (year !== undefined && month !== undefined) {
            targetDate.setFullYear(year, month, 1);
        } else {
            targetDate.setFullYear(2025, 5, 1); // 초기값: 2025년 6월
        }
    
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
    
        contentDiv.innerHTML = '';
    
        const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
    
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `<h2>${targetYear}년 ${monthNames[targetMonth]}</h2><div class="calendar-nav"><button class="calendar-nav-btn" data-action="prev-month">&lt; 이전</button><button class="calendar-nav-btn" data-action="next-month">다음 &gt;</button></div>`;
        calendarContainer.appendChild(header);
    
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

        // 1. 고정 이벤트 처리
        (data.events || []).forEach(event => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);
            let currentDate = new Date(startDate);

            while(currentDate <= endDate) {
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
            const stopDate = new Date(targetYear, targetMonth + 2, 0); // 성능을 위해 2달 뒤까지만 계산

            while(currentDate < stopDate) {
                if(currentDate.getFullYear() > targetYear || (currentDate.getFullYear() === targetYear && currentDate.getMonth() > targetMonth)) {
                    break; 
                }
                if (currentDate.getFullYear() === targetYear && currentDate.getMonth() === targetMonth) {
                    for(let i=0; i < event.durationDays; i++) {
                        const eventDay = new Date(currentDate);
                        eventDay.setDate(eventDay.getDate() + i);
                        if(eventDay.getMonth() === targetMonth) {
                             const day = eventDay.getDate();
                             if (!monthEvents.has(day)) monthEvents.set(day, []);
                             monthEvents.get(day).push(event);
                        }
                    }
                }
                currentDate.setDate(currentDate.getDate() + event.recurrence.interval * 7);
            }
        });
        
        const firstDayOfMonth = new Date(targetYear, targetMonth, 1).getDay();
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.appendChild(document.createElement('div')).className = 'calendar-date other-month';
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

    // 나머지 모든 함수는 이전 버전과 동일합니다.
    // ... (이전 답변의 전체 script.js 코드에서 renderCalendarView 함수만 교체)
});