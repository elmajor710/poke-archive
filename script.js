document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v2.3-event-duration');

    const app = document.getElementById('app-container');
    // ... (이전과 동일한 변수 선언)

    // [수정됨] renderCalendarView 함수
    function renderCalendarView(contentDiv, data, year, month) {
        const currentDate = new Date();
        const targetYear = year !== undefined ? year : 2025;
        const targetMonth = month !== undefined ? month : 5; 

        contentDiv.innerHTML = ''; 

        const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
        const calendarContainer = document.createElement('div');
        calendarContainer.className = 'calendar-container';
        // ... (캘린더 헤더, 요일 표시는 이전과 동일)

        // [핵심 수정] 3일 지속 이벤트를 처리하는 로직
        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.className = 'calendar-date';
            
            const cellDate = new Date(targetYear, targetMonth, day);
            cellDate.setHours(0, 0, 0, 0); // 정확한 날짜 비교를 위해 시간 초기화

            dateCell.innerHTML = `<div class="date-number">${day}</div>`;
            
            // 모든 이벤트를 순회하며 현재 날짜가 이벤트 기간(3일)에 포함되는지 확인
            data.events.forEach(event => {
                const startDate = new Date(event.date.replace(/\./g, '-'));
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 2); // 시작일로부터 3일째 되는 날 (시작일 + 2일)

                // 현재 날짜(cellDate)가 이벤트의 시작일과 종료일 사이에 있다면,
                if (cellDate >= startDate && cellDate <= endDate) {
                    const eventType = event.type === 'ranking' ? 'ranking' : 'limited';
                    dateCell.innerHTML += `<div class="date-event event-${eventType}">${event.title}</div>`;
                }
            });
            
            grid.appendChild(dateCell);
        }
        
        calendarContainer.appendChild(grid);
        contentDiv.appendChild(calendarContainer);

        contentDiv.dataset.currentYear = targetYear;
        contentDiv.dataset.currentMonth = targetMonth;
    }
    
    // 나머지 모든 함수(renderPokemonView, renderPanel, initialize 등)는 이전과 동일합니다.
    // 설명을 위해 생략했지만, 안전을 위해 이전 답변의 전체 JS 코드를 사용하고, 
    // 그 코드에서 renderCalendarView 함수만 위 내용으로 교체하시는 것을 권장합니다.
});