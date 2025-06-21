document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v6.1-final-logic-fix');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};
    let selectedDateEl = null;

    // --- 신규 헬퍼 함수: 특정 날짜의 모든 이벤트를 찾아 배열로 반환 ---
    function getEventsForDate(dateStr) {
        const targetDate = new Date(dateStr + 'T00:00:00');
        const foundEvents = [];
        const gachaData = DB.calendar.lev3.gachaSchedule;

        // 1. 고정 이벤트 처리
        (gachaData.events || []).forEach(event => {
            const startDate = new Date(event.startDate + 'T00:00:00');
            const endDate = new Date(event.endDate + 'T00:00:00');
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                if (targetDate >= startDate && targetDate <= endDate) {
                    foundEvents.push(event);
                }
            }
        });

        // 2. 반복 이벤트 처리
        (gachaData.recurringEvents || []).forEach(event => {
            const firstStartDate = new Date(event.startDate + 'T00:00:00');
            if (isNaN(firstStartDate.getTime())) return;

            let currentOccurrenceStart = new Date(firstStartDate);
            
            // 성능 최적화: 너무 과거의 이벤트는 계산하지 않음
            if (event.recurrence && event.recurrence.unit === 'weeks') {
                while(currentOccurrenceStart < targetDate) {
                    const nextStartDate = new Date(currentOccurrenceStart);
                    nextStartDate.setDate(nextStartDate.getDate() + (event.recurrence.interval * 7));
                    if(nextStartDate > targetDate) break;
                    currentOccurrenceStart = nextStartDate;
                }
            }

            const currentOccurrenceEnd = new Date(currentOccurrenceStart);
            currentOccurrenceEnd.setDate(currentOccurrenceStart.getDate() + (event.durationDays - 1));

            if (targetDate >= currentOccurrenceStart && targetDate <= currentOccurrenceEnd) {
                foundEvents.push(event);
            }
        });

        return foundEvents;
    }

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
                html += `<div class="agenda-item"><div class="agenda-item-color" style="background-color: ${color};"></div><div class="agenda-item-title">${event.title}</div></div>`;
            });
        } else {
            html += `<p>선택된 날짜에 일정이 없습니다.</p>`;
        }
        agendaView.innerHTML = html;
    }

    function renderCalendarView(contentDiv, data, year, month) {
        // ... (이하 renderCalendarView의 다른 코드는 이전과 동일)
    }

    // [수정됨] addEventListeners 함수
    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            const dateCell = e.target.closest('.calendar-date');

            if (dateCell && !dateCell.classList.contains('other-month')) {
                const date = dateCell.dataset.date;
                if(selectedDateEl) selectedDateEl.classList.remove('selected');
                dateCell.classList.add('selected');
                selectedDateEl = dateCell;

                // 새로 만든 헬퍼 함수를 사용하여 이벤트를 가져옵니다.
                const dayEvents = getEventsForDate(date);
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
    // 안전을 위해 전체 코드를 교체하시는 것을 권장합니다.
});