document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

    // --- ResizeObserver와 MutationObserver를 사용한 최종 광고 설정 함수 ---
    function setupAdObservers() {
        const adContainers = document.querySelectorAll('.ad-container');
        if (adContainers.length === 0) return;

        console.log('광고 컨테이너 관찰을 시작합니다.');

        const adObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    const targetContainer = entry.target;
                    console.log(`'${targetContainer.id}' 컨테이너가 준비되었습니다. 광고를 요청합니다.`);
                    
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});

                        // MutationObserver로 구글의 스타일 변경을 감시
                        const styleWatcher = new MutationObserver((mutations) => {
                            for (const mutation of mutations) {
                                if (mutation.attributeName === 'style') {
                                    // --- [핵심 수정] 현재 화면 너비가 모바일일 경우에만 높이를 강제하도록 조건 추가 ---
                                    if (window.innerWidth <= 768) {
                                        const currentHeight = targetContainer.style.height;
                                        if (currentHeight !== '50px') {
                                            console.log(`모바일 화면에서 '${targetContainer.id}'의 높이를 ${currentHeight}로 변경 시도 -> 50px로 재정의합니다!`);
                                            targetContainer.style.setProperty('height', '50px', 'important');
                                            targetContainer.style.setProperty('min-height', '50px', 'important');
                                        }
                                    }
                                    // 임무 완수 후, 감시를 중단하여 불필요한 반복을 막습니다.
                                    styleWatcher.disconnect();
                                }
                            }
                        });

                        // style 속성 변경을 감시 시작
                        styleWatcher.observe(targetContainer, { attributes: true });

                    } catch (e) {
                        console.error(`'${targetContainer.id}' 광고 요청 중 오류 발생:`, e);
                    }

                    adObserver.unobserve(targetContainer);
                }
            }
        });

        adContainers.forEach(container => adObserver.observe(container));
    }

    // --- 무효 트래픽 방지 로직 ---
    const adBlockManager = {
        CLICK_LIMIT: 3,
        TIME_WINDOW: 5 * 60 * 1000,
        checkAndApplyBlock: function() {
            const expiresAt = localStorage.getItem('adBlockExpiresAt');
            if (!expiresAt) return;
            const now = new Date().getTime();
            if (now < parseInt(expiresAt)) {
                console.warn('광고가 비정상적인 클릭으로 인해 일시적으로 차단되었습니다.');
                this.hideAds();
            } else {
                localStorage.removeItem('adBlockExpiresAt');
                localStorage.removeItem('adClickTimestamps');
            }
        },
        recordClick: function() {
            let timestamps = JSON.parse(localStorage.getItem('adClickTimestamps')) || [];
            const now = new Date().getTime();
            timestamps = timestamps.filter(ts => (now - ts) < this.TIME_WINDOW);
            timestamps.push(now);
            localStorage.setItem('adClickTimestamps', JSON.stringify(timestamps));
            if (timestamps.length >= this.CLICK_LIMIT) {
                console.error('제한 횟수를 초과하는 클릭이 감지되었습니다. 24시간 동안 광고를 차단합니다.');
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                localStorage.setItem('adBlockExpiresAt', tomorrow.getTime());
                this.hideAds();
            }
        },
        hideAds: function() {
            document.querySelectorAll('.ad-container').forEach(container => {
                container.classList.add('hidden');
            });
        }
    };

    adBlockManager.checkAndApplyBlock();

    // --- 페이지 로직 ---
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

    function renderPokemonView(contentDiv, data, menuId) {
        const detailView = document.createElement('div');
        const nameKo = data.name_ko || (data.name && data.name.ko) || '이름 없음';
        const nameEn = data.name_en || (data.name && data.name.en) || '';
        let commonHTML = `<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${nameEn}</span></h2>`;
        let badgesHTML = '<div class="badge-container">';
        if (data.grade) {
            const gradeClass = `grade-${data.grade.toLowerCase().replace('+', '-plus')}`;
            badgesHTML += `<span class="grade-badge ${gradeClass}">${data.grade}</span>`;
        }
        if (data.types && Array.isArray(data.types) && data.types.length > 0) {
            data.types.forEach(typeId => {
                const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                if (typeInfo) {
                    badgesHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
                }
            });
        }
        badgesHTML += '</div>';
        commonHTML += badgesHTML;
        if (data.imageURL) { commonHTML += `<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`; }
        let statsHTML = '';
        if (data.stats) {
            const totalStats = Object.values(data.stats).reduce((a, b) => Number(a) + Number(b), 0);
            statsHTML += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">`;
            Object.entries(data.stats).forEach(([stat, value]) => { statsHTML += `<tr><td>${stat}</td><td>${value}</td></tr>`; });
            statsHTML += '</table>';
        } else {
            statsHTML = '<h4>기본 정보</h4><p>등록된 종족값 정보가 없습니다.</p>';
        }
        let skillsHTML = '';
        if (data.skills && data.skills.length > 0 && data.skills.some(s => s.name)) {
            skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
            data.skills.forEach((skill, index) => { 
                if(skill.name) {
                    skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; 
                }
            });
            skillsHTML += '</ul>';
        } else {
            skillsHTML = '<h4>스킬</h4><p>등록된 스킬 정보가 없습니다.</p>';
        }
        let buildHTML = '';
        let hasBuildInfo = false;
        if (data.recommendedNatures && data.recommendedNatures.length > 0) {
            const natureNames = data.recommendedNatures.map(natureId => DB.definitions.natures.find(n => n.id === natureId)?.name || '').filter(Boolean);
            if(natureNames.length > 0) {
                buildHTML += `<h4>추천 성격</h4><p>${natureNames.join(', ')}</p>`;
                hasBuildInfo = true;
            }
        }
        const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
        for (const type in recommendTypes) {
            if (data[type] && data[type].length > 0) {
                hasBuildInfo = true;
                buildHTML += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;
                data[type].forEach(id => {
                    const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', '');
                    const dbKey = (itemTypeForDB === 'rune' || itemTypeForDB === 'chip') ? 'runeAndChip' : 'item';
                    const itemData = DB[dbKey]?.lev4?.[id];
                    if (itemData) {
                         buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">
                                    ${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}
                                 </div>`;
                    } else {
                        buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}"><span>${id}(정보 없음)</span></div>`;
                    }
                });
                buildHTML += `</div>`;
            }
        }
        if (!hasBuildInfo) {
            buildHTML = '<h4>추천 빌드</h4><p>등록된 추천 빌드 정보가 없습니다.</p>';
        }
        const useTabs = isMobile() || menuId === 'pokemonType' || menuId === 'pokemonGrade';
        detailView.className = `pokemon-detail-view ${useTabs ? 'use-tabs' : ''}`;
        let finalHTML = commonHTML;
        if (useTabs) {
             finalHTML += `
                <div class="tab-container">
                    <nav class="tab-nav">
                        <button class="tab-button active" data-tab="tab-info">기본 정보</button>
                        <button class="tab-button" data-tab="tab-skills">스킬</button>
                        <button class="tab-button" data-tab="tab-build">추천 빌드</button>
                    </nav>
                    <div id="tab-info" class="tab-pane active">${statsHTML}</div>
                    <div id="tab-skills" class="tab-pane">${skillsHTML}</div>
                    <div id="tab-build" class="tab-pane">${buildHTML}</div>
                </div>
            `;
        } else {
            finalHTML += `<div class="info-sections">${statsHTML}${skillsHTML}${buildHTML}</div>`;
        }
        detailView.innerHTML = finalHTML;
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);
        contentDiv.querySelectorAll('.skill-name').forEach(el => { 
            el.addEventListener('click', () => { 
                const skillIndex = parseInt(el.dataset.skillIndex);
                const skill = data.skills[skillIndex];
                if (skill) {
                    let skillDetailContent = `<p>${skill.description || ''}</p>`;
                    if (skill.keywords && skill.keywords.length > 0) {
                        skillDetailContent += '<hr><h4>키워드 설명</h4><ul>';
                        skill.keywords.forEach(kw => { skillDetailContent += `<li><strong>${kw.term}:</strong> ${kw.desc}</li>`; });
                        skillDetailContent += '</ul>';
                    }
                    showModal(skill.name, skillDetailContent); 
                }
            }); 
        });
        contentDiv.querySelectorAll('.recommend-item').forEach(el => { 
            el.addEventListener('click', () => { 
                const itemId = el.dataset.itemId;
                const itemType = el.dataset.itemType;
                const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                const itemData = DB[dbKey]?.lev4?.[itemId];
                if (itemData) { 
                    showModal(itemData.name, `<p>${itemData.description || '상세 정보가 없습니다.'}</p>`); 
                }
            }); 
        });
        contentDiv.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('active')) return;
                contentDiv.querySelector('.tab-button.active').classList.remove('active');
                contentDiv.querySelector('.tab-pane.active').classList.remove('active');
                button.classList.add('active');
                contentDiv.querySelector(`#${button.dataset.tab}`).classList.add('active');
            });
        });
    }

    function renderSimpleView(contentDiv, data) {
        let html = `<div class="simple-detail-view"><h2>${data.name}</h2>`;
        if (data.htmlContent) {
            html += data.htmlContent;
        } else {
            if (data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase()}`;
                html += `<div class="badge-container"><span class="grade-badge ${gradeClass}">${data.grade}</span></div>`;
            }
            if (data.imageURL) { html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`; }
            if (data.description) { html += `<div class="item-description">${data.description.replace(/\\n/g, '<br>')}</div>`; }
            if (data.content) { html += `<p>${data.content}</p>`; }
        }
        html += `</div>`;
        contentDiv.innerHTML = html;
    }

    // --- 시너지 계산 로직 (공통 사용) ---
    function calculateSynergy(pokemonIds) {
        if (!DB.synergyEffects || pokemonIds.length < 6) return null;
        const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
        const typePokemonCount = {};
        mainPokemon.forEach(pkm => {
            if (pkm && pkm.types) {
                pkm.types.forEach(type => {
                    typePokemonCount[type] = (typePokemonCount[type] || 0) + 1;
                });
            }
        });
        const counts = Object.values(typePokemonCount);
        const totalPairs = counts.map(c => Math.floor(c / 2)).reduce((a, b) => a + b, 0);
        const totalUniqueTypes = Object.keys(typePokemonCount).length;
        if (counts.some(c => c >= 6)) return DB.synergyEffects.find(s => s.id === 'same6');
        if (counts.filter(c => c >= 3).length >= 2) return DB.synergyEffects.find(s => s.id === 'same3x2');
        if (counts.some(c => c >= 3)) return DB.synergyEffects.find(s => s.id === 'same3');
        if (totalPairs >= 4) return DB.synergyEffects.find(s => s.id === 'same2x4');
        if (totalPairs >= 3) return DB.synergyEffects.find(s => s.id === 'same2x3');
        if (totalUniqueTypes >= 6) return DB.synergyEffects.find(s => s.id === 'diff6');
        return null;
    }

    // --- ▼▼▼ 4x4 그리드 보기 기능 수정 ▼▼▼ ---
    function renderDeckView(contentDiv, data) {
    const weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };

    let html = `<div class="deck-detail-view"><h2>${data.name}</h2>`;
    if (data.description) { html += `<p>${data.description}</p>`; }

    // 4x4 그리드 데이터 구조 생성
    const grid = Array(4).fill(null).map(() => Array(4).fill(null));

    // 포켓몬 위치 매핑 (어시스트: 1~3행 1열, 1~3행 2열 / 메인: 1~3행 3열, 1~3행 4열)
    const positionMap = {
        'assist_1': [0, 0], 'assist_2': [1, 0], 'assist_3': [2, 0],
        'assist_4': [0, 1], 'assist_5': [1, 1], 'assist_6': [2, 1],
        'main_4': [0, 2], 'main_5': [1, 2], 'main_6': [2, 2],
        'main_1': [0, 3], 'main_2': [1, 3], 'main_3': [2, 3]
    };

    // 1. 날씨 효과 배치 (3행 0열)
    if (data.weather && weatherToEmoji[data.weather]) {
        grid[3][0] = { type: 'header', content: weatherToEmoji[data.weather], label: data.weather };
    }

    // 2. 타입 시너지 효과 배치 (3행 1열)
    const mainPokemonIds = data.composition.filter(m => m.role === 'main').map(m => m.pokemonId);
    const synergy = calculateSynergy(mainPokemonIds); // calculateSynergy 함수는 이미 script.js에 존재합니다.
    if (synergy) {
         grid[3][1] = { type: 'header', content: `<img src="${synergy.imageURL}">`, label: synergy.name };
    }
    
    // 3. 포켓몬 배치
    data.composition.forEach(member => { 
        const pkmData = DB.pokemonType.lev4[member.pokemonId]; 
        if (!pkmData) return; 

        const key = `${member.role}_${member.position}`;
        if(positionMap[key]) {
            const [row, col] = positionMap[key]; 
            grid[row][col] = { type: 'pokemon', ...pkmData };
        }
    });

    // 4. HTML 테이블 생성
    html += `<h4>덱 배치</h4><table class="deck-grid-table four-by-four-table"><tbody>`;
    for (let i = 0; i < 4; i++) {
        html += '<tr>'; 
        for (let j = 0; j < 4; j++) { 
            const cell = grid[i][j]; 
            if (cell) {
                if (cell.type === 'pokemon') {
                    html += `<td><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"><span class="pkm-name">${cell.name_ko}</span></div></td>`;
                } else if (cell.type === 'header') {
                    // 이미지일 경우와 텍스트(이모지)일 경우를 분리
                    const contentHTML = cell.content.startsWith('<img') ? cell.content : `<span class="header-emoji">${cell.content}</span>`;
                    html += `<td class="header-cell" title="${cell.label}">${contentHTML}</td>`;
                }
            } else { 
                html += '<td class="empty-cell"></td>'; // 빈 칸
            } 
        } 
        html += '</tr>'; 
    }
    html += `</tbody></table>`;
    html += `</div>`; // .deck-detail-view 닫기
    contentDiv.innerHTML = html;

    // 포켓몬 셀 클릭 시 팝업 이벤트 (기존과 동일)
    contentDiv.querySelectorAll('.deck-pokemon-cell').forEach(cell => {
        cell.addEventListener('click', () => {
            const pokemonId = cell.dataset.pokemonId;
            const pkmData = DB.pokemonType.lev4[pokemonId];
            if (pkmData) {
                let typesHTML = (pkmData.types || []).map(typeId => {
                    const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                    return typeInfo ? `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>` : '';
                }).join(' ');
                const modalContent = `<div class="badge-container"><span class="grade-badge grade-${pkmData.grade.toLowerCase().replace('+', '-plus')}">${pkmData.grade}</span>${typesHTML}</div>`;
                showModal(pkmData.name_ko, modalContent);
            }
        });
    });
}
    
    function renderCalendarView(contentDiv, data) {
        let currentCalendarDate = new Date();
        function buildCalendar(year, month) {
            const calendarView = document.createElement('div');
            calendarView.className = 'calendar-view';
            const monthEvents = {};
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startDay = firstDay.getDay();
            const addEvent = (event, eventDate) => {
                const day = eventDate.getDate();
                if (!monthEvents[day]) monthEvents[day] = [];
                const fullEventInfo = { ...event, startDate: new Date(event.date + 'T00:00:00'), endDate: new Date(new Date(event.date + 'T00:00:00').setDate(new Date(event.date + 'T00:00:00').getDate() + (event.duration - 1))) };
                monthEvents[day].push(fullEventInfo);
            };
            (data.events || []).forEach(event => {
                for (let i = 0; i < (event.duration || 1); i++) {
                    const eventDate = new Date(event.date + 'T00:00:00');
                    eventDate.setDate(eventDate.getDate() + i);
                    if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                        addEvent(event, eventDate);
                    }
                }
            });
            (data.recurringEvents || []).forEach(re => {
                 let currentDate = new Date(re.startDate + 'T00:00:00');
                 while (currentDate.getFullYear() < year + 2) {
                    if (currentDate.getFullYear() === year && currentDate.getMonth() > month) break;
                    if (currentDate.getFullYear() > year) break;
                    for (let i = 0; i < (re.duration || 1); i++) {
                        const eventDate = new Date(currentDate);
                        eventDate.setDate(eventDate.getDate() + i);
                         if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                            addEvent({ ...re, date: currentDate.toISOString().split('T')[0] }, eventDate);
                        }
                    }
                    if (re.interval === '4_weeks') {
                        currentDate.setDate(currentDate.getDate() + 28);
                    } else {
                        break;
                    }
                }
            });
            let html = `<div class="calendar-header"><span class="calendar-title">${year}년 ${month + 1}월</span><div class="calendar-nav"><button id="cal-prev-btn">&lt; 이전</button><button id="cal-today-btn">Today</button><button id="cal-next-btn">다음 &gt;</button></div></div><div class="calendar-legend"><div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div><div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div><div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div></div><table class="calendar-grid"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>`;
            let dateCounter = 1;
            for (let i = 0; i < 6; i++) {
                html += '<tr>';
                for (let j = 0; j < 7; j++) {
                    if (i === 0 && j < startDay || dateCounter > daysInMonth) {
                        html += '<td class="day-other-month"></td>';
                    } else {
                        const today = new Date();
                        const isToday = (dateCounter === today.getDate() && month === today.getMonth() && year === today.getFullYear());
                        const eventsOnDay = monthEvents[dateCounter];
                        let cellClass = 'day-current-month';
                        if (isToday) cellClass += ' day-today';
                        if (eventsOnDay) cellClass += ' has-events';
                        html += `<td class="${cellClass}" data-day="${dateCounter}"><div class="date-number">${dateCounter}</div>`;
                        if (eventsOnDay) {
                            html += `<div class="event-markers">`;
                            eventsOnDay.forEach(event => { html += `<div class="event-marker event-type-${event.type}">${event.title || event.name}</div>`; });
                            html += `</div>`;
                        }
                        html += '</td>';
                        dateCounter++;
                    }
                }
                html += '</tr>';
                if (dateCounter > daysInMonth) break;
            }
            html += `</tbody></table>`;
            calendarView.innerHTML = html;
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
                    const cell = target.closest('.has-events');
                    if (cell) {
                        const day = parseInt(cell.dataset.day);
                        const events = monthEvents[day];
                        if(events && events.length > 0) {
                            const eventContent = events.map(evt => {
                                const duration = evt.duration || 1;
                                const startStr = evt.startDate.toISOString().split('T')[0];
                                const endStr = evt.endDate.toISOString().split('T')[0];
                                const period = duration > 1 ? `${startStr} ~ ${endStr} (${duration}일간)` : startStr;
                                return `<h4>${evt.title || evt.name}</h4><p><strong>기간:</strong> ${period}</p><p>${evt.description}</p>`;
                            }).join('<hr>');
                            showModal(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 이벤트`, eventContent);
                        }
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
        let html = `<div class="deck-builder-view"><div class="placement-container"><div class="placement-grid"><div class="placement-slot-header" id="weather-icon-container" style="visibility: hidden;">☀️</div><div class="placement-slot-header" id="synergy-icon-container" style="visibility: hidden;"><img src="https://i.imgur.com/g0t51J7.png" alt="타입 시너지"></div><div class="placement-slot-header"></div><div class="placement-slot assist" data-role="assist" data-position="1">어시스트_#1</div><div class="placement-slot main rearguard" data-role="main" data-position="4">후방_#4</div><div class="placement-slot main vanguard" data-role="main" data-position="1">전방_#1</div><div class="placement-slot assist" data-role="assist" data-position="2">어시스트_#2</div><div class="placement-slot main rearguard" data-role="main" data-position="5">후방_#5</div><div class="placement-slot main vanguard" data-role="main" data-position="2">전방_#2</div><div class="placement-slot assist" data-role="assist" data-position="3">어시스트_#3</div><div class="placement-slot main rearguard" data-role="main" data-position="6">후방_#6</div><div class="placement-slot main vanguard" data-role="main" data-position="3">전방_#3</div></div></div><div class="source-container"><h4>포켓몬 목록</h4><div class="source-filter-bar"><select id="grade-filter" class="filter-dropdown"><option value="all">모든 등급</option><option value="SS">SS</option><option value="S+">S+</option><option value="S">S</option></select><select id="type-filter" class="filter-dropdown"><option value="all">모든 타입</option></select></div><div class="source-list"></div></div></div>`;
        contentDiv.innerHTML = html;
        const sourceList = contentDiv.querySelector('.source-list');
        const placementGrid = contentDiv.querySelector('.placement-grid');
        const weatherIconContainer = contentDiv.querySelector('#weather-icon-container');
        const synergyIconContainer = contentDiv.querySelector('#synergy-icon-container');
        const gradeFilter = contentDiv.querySelector('#grade-filter');
        const typeFilter = contentDiv.querySelector('#type-filter');
        let placedPokemon = new Map();
        DB.pokemonType.lev2.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.name;
            typeFilter.appendChild(option);
        });
        function applyFilters() {
            const selectedGrade = gradeFilter.value;
            const selectedType = typeFilter.value;
            let filteredPokemon = Object.entries(DB.pokemonType.lev4).filter(([id, pkm]) => {
                const gradeMatch = selectedGrade === 'all' || !pkm.grade || pkm.grade === selectedGrade;
                const typeMatch = selectedType === 'all' || (pkm.types && pkm.types.includes(selectedType));
                return gradeMatch && typeMatch;
            });
            filteredPokemon.sort(([, a], [, b]) => (a.name_ko || a.name).localeCompare(b.name_ko || b.name));
            renderSourceList(filteredPokemon);
        }
        function renderSourceList(pokemonList) {
            sourceList.innerHTML = '';
            const grid = document.createElement('div');
            grid.className = 'source-list-grid';
            grid.innerHTML = pokemonList.map(([id, pkm]) => createPokemonIconHTML(id, pkm)).join('');
            sourceList.appendChild(grid);
        }
        function createPokemonIconHTML(id, pkm) {
            return `<div class="pokemon-source-icon" draggable="true" data-pokemon-id="${id}"><img src="${pkm.faceImageURL}" alt="${pkm.name_ko || pkm.name}"><span>${pkm.name_ko || pkm.name}</span></div>`;
        }
        gradeFilter.addEventListener('change', applyFilters);
        typeFilter.addEventListener('change', applyFilters);
        let draggedItem = null; 
        sourceList.addEventListener('dragstart', e => {
            const target = e.target.closest('.pokemon-source-icon');
            if (target) {
                draggedItem = target;
                e.dataTransfer.setData('text/plain', target.dataset.pokemonId);
            }
        });
        placementGrid.addEventListener('dragstart', e => {
            const target = e.target.closest('.placement-slot');
            if (target && target.querySelector('.deck-pokemon-cell')) {
                draggedItem = target;
            }
        });
        placementGrid.addEventListener('dragover', e => e.preventDefault());
        placementGrid.addEventListener('drop', e => {
            e.preventDefault();
            const targetSlot = e.target.closest('.placement-slot');
            if (!targetSlot || !draggedItem) return;
            const sourcePokemonId = draggedItem.classList.contains('placement-slot') ? placedPokemon.get(draggedItem) : draggedItem.dataset.pokemonId;
            if (!sourcePokemonId) return;
            if (draggedItem.classList.contains('placement-slot')) {
                const sourceSlot = draggedItem;
                if (targetSlot === sourceSlot) return; 
                const targetPokemonId = placedPokemon.get(targetSlot);
                if (targetPokemonId) { 
                    const sourcePokemonData = DB.pokemonType.lev4[sourcePokemonId];
                    const targetPokemonData = DB.pokemonType.lev4[targetPokemonId];
                    placePokemonInSlot(sourceSlot, targetPokemonId, targetPokemonData);
                    placePokemonInSlot(targetSlot, sourcePokemonId, sourcePokemonData);
                } else { 
                    const sourcePokemonData = DB.pokemonType.lev4[sourcePokemonId];
                    placePokemonInSlot(targetSlot, sourcePokemonId, sourcePokemonData);
                    clearSlot(sourceSlot);
                }
            }
            else if (draggedItem.classList.contains('pokemon-source-icon')) {
                if (placedPokemon.has(targetSlot)) {
                    alert('슬롯이 비어있지 않습니다. 포켓몬을 제거하거나 다른 빈 슬롯으로 옮겨주세요.');
                    return;
                }
                const pokemonData = DB.pokemonType.lev4[sourcePokemonId];
                placePokemonInSlot(targetSlot, sourcePokemonId, pokemonData);
            }
            draggedItem = null;
            updateTeamEffects();
        });
        function placePokemonInSlot(slot, pokemonId, pokemonData) {
            slot.innerHTML = `<div class="deck-pokemon-cell" draggable="true"><img src="${pokemonData.faceImageURL}" alt="${pokemonData.name_ko}"/><button class="remove-pkm-btn">×</button></div>`;
            placedPokemon.set(slot, pokemonId);
        }
        function clearSlot(slot) {
            const role = slot.dataset.role;
            const position = slot.dataset.position;
            let placeholderText = '';
            if(role === 'assist') placeholderText = `어시스트_#${position}`;
            else if (role === 'main') {
                const area = slot.classList.contains('vanguard') ? '전방' : '후방';
                placeholderText = `${area}_#${position}`;
            }
            slot.innerHTML = placeholderText;
            placedPokemon.delete(slot);
        }
        placementGrid.addEventListener('click', e => {
            const removeButton = e.target.closest('.remove-pkm-btn');
            if(removeButton) {
                const parentSlot = removeButton.closest('.placement-slot');
                if (parentSlot) {
                    clearSlot(parentSlot);
                    updateTeamEffects();
                }
                return; 
            }
            const pkmCell = e.target.closest('.deck-pokemon-cell');
            if(pkmCell) {
                const parentSlot = pkmCell.closest('.placement-slot');
                if (!parentSlot) return;
                const pokemonId = placedPokemon.get(parentSlot);
                if (!pokemonId) return;
                const pokemonData = DB.pokemonType.lev4[pokemonId];
                if(pokemonData) {
                    let modalTitle = pokemonData.name_ko;
                    let modalContentHTML = '';
                    const typesHTML = pokemonData.types.map(typeId => {
                        const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                        return typeInfo ? `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>` : '';
                    }).join(' ');
                    if (parentSlot.dataset.role === 'assist' && pokemonData.contractInfo) {
                        modalTitle = `${pokemonData.name_ko} - 계약장 정보`;
                        const contract = pokemonData.contractInfo;
                        modalContentHTML = `<div class="badge-container">${typesHTML}</div><h4>기본 능력치</h4><table class="stats-table">${Object.entries(contract.stats).map(([stat, value]) => `<tr><td>${stat}</td><td>${value}</td></tr>`).join('')}</table><h4>효과: ${contract.skill.name} <span class="skill-type">${contract.skill.type}</span></h4><div class="item-description">${contract.skill.description.replace(/\n/g, '<br>')}</div>`;
                    } 
                    else {
                        modalTitle = pokemonData.name_ko;
                        modalContentHTML = `<div class="badge-container">${typesHTML}</div>`;
                    }
                    showModal(modalTitle, modalContentHTML);
                }
            }
        });
        function updateTeamEffects() {
            updateWeatherIcon();
            updateSynergyIcon();
        }
        const weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };
        function updateWeatherIcon() {
            const pokemonWithWeather = Array.from(placedPokemon.values()).some(id => DB.pokemonType.lev4[id]?.weatherEffects);
            weatherIconContainer.style.visibility = pokemonWithWeather ? 'visible' : 'hidden';
        }
        function updateSynergyIcon() {
            const mainPokemonIds = [];
            placedPokemon.forEach((pokemonId, slot) => {
                if(slot.dataset.role === 'main') {
                    mainPokemonIds.push(pokemonId);
                }
            });
            const synergy = calculateSynergy(mainPokemonIds);
            const icon = synergyIconContainer.querySelector('img');
            if (synergy) {
                icon.src = synergy.imageURL;
                icon.alt = synergy.name;
                synergyIconContainer.dataset.synergyId = synergy.id;
                synergyIconContainer.style.visibility = 'visible';
            } else {
                synergyIconContainer.style.visibility = 'hidden';
                synergyIconContainer.removeAttribute('data-synergy-id');
            }
        }
        function calculateSynergy(pokemonIds) {
    // DB 데이터나 포켓몬 ID가 없으면 계산하지 않음
    if (!DB.synergyEffects || !pokemonIds || pokemonIds.length === 0) return null;

    const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
    // 포켓몬 데이터가 하나라도 없으면 계산 중지
    if (mainPokemon.some(pkm => !pkm)) {
        return null;
    }

    // 1. 모든 포켓몬의 모든 타입을 카운트
    const typePokemonCount = {};
    mainPokemon.forEach(pkm => {
        if (pkm && pkm.types) {
            pkm.types.forEach(type => {
                typePokemonCount[type] = (typePokemonCount[type] || 0) + 1;
            });
        }
    });

    // 2. 계산에 필요한 변수들 준비
    // 각 타입별 포켓몬 수를 내림차순으로 정렬 (예: [4, 2, 1, 1, 1])
    const counts = Object.values(typePokemonCount).sort((a, b) => b - a);
    const totalUniqueTypes = Object.keys(typePokemonCount).length;
    
    // 같은 타입 2마리 '쌍'의 총 개수 계산
    const totalPairs = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);

    // 3. 시너지 우선순위에 따라 최종 효과 결정 (가장 강력한 효과부터 체크)
    if (counts.length > 0 && counts[0] >= 6) {
        return DB.synergyEffects.find(s => s.id === 'same6');
    }
    if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) {
        return DB.synergyEffects.find(s => s.id === 'same3x2');
    }
    // ▼▼▼ '4+2 조합'을 확인하는 새로운 로직 ▼▼▼
    if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) {
        return DB.synergyEffects.find(s => s.id === 'same4_2');
    }
    if (totalPairs >= 3) {
        return DB.synergyEffects.find(s => s.id === 'same2x3');
    }
    if (counts.length > 0 && counts[0] >= 3) {
        return DB.synergyEffects.find(s => s.id === 'same3');
    }
    if (totalUniqueTypes >= 6 && pokemonIds.length >= 6) {
        return DB.synergyEffects.find(s => s.id === 'diff6');
    }

    // 어떤 조건도 만족하지 못하면 효과 없음
    return null;
}
        synergyIconContainer.addEventListener('click', () => {
            const synergyId = synergyIconContainer.dataset.synergyId;
            let contentHTML = `<table class="synergy-table"><thead><tr><th>타입 시너지 효과</th><th>설명</th></tr></thead><tbody>`;
            DB.synergyEffects.forEach(effect => {
                const isCurrent = (synergyId && effect.id === synergyId) ? 'current-synergy' : '';
                contentHTML += `<tr class="${isCurrent}"><td><img src="${effect.imageURL}" alt="${effect.name}"></td><td>${effect.description}</td></tr>`;
            });
            contentHTML += `</tbody></table>`;
            showModal('타입 시너지 효과', contentHTML);
        });
        weatherIconContainer.addEventListener('click', () => {
            let weatherOptionsHTML = '';
            const uniqueWeatherEffects = new Map();
            Array.from(placedPokemon.values()).forEach(id => {
                const pkm = DB.pokemonType.lev4[id];
                if (pkm?.weatherEffects) {
                    pkm.weatherEffects.forEach(effect => {
                        if (!uniqueWeatherEffects.has(effect.name)) {
                            uniqueWeatherEffects.set(effect.name, effect.description);
                        }
                    });
                }
            });
            if (uniqueWeatherEffects.size > 0) {
                uniqueWeatherEffects.forEach((desc, name) => {
                    weatherOptionsHTML += `<div class="weather-option" data-weather-name="${name}"><strong>${name}</strong><div class="weather-desc">${desc}</div></div>`;
                });
                showModal('날씨 효과 선택', weatherOptionsHTML, true, (selectedWeather) => {
                     weatherIconContainer.textContent = weatherToEmoji[selectedWeather] || '☀️';
                });
            }
        });
        applyFilters();
        updateTeamEffects();
    }
    
    function handleMainButtonClick() {
        appContainer.classList.remove('menu-active');
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) { 
                panel.classList.remove('visible', 'is-hidden');
            }
        });
        setActive(0, null);
        if (isMobile()) {
            sidebar.classList.remove('is-hidden');
        }
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        const panelHeader = targetPanel.querySelector('.panel-header');
        const existingMainBtn = panelHeader.querySelector('.main-btn');
        if (existingMainBtn) {
            existingMainBtn.remove();
        }
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;
        if (clickedId === 'deckBuilder') {
            const mainButton = document.createElement('button');
            mainButton.className = 'main-btn';
            mainButton.textContent = '메인';
            panelHeader.appendChild(mainButton);
            if (isMobile()) {
                contentDiv.innerHTML = `<div class="pc-only-message"><h3>기능 안내</h3><p>배치툴 기능은 화면이 넓은 PC 환경에 최적화되어 있습니다.<br>PC에서 접속하여 이용해주세요.</p></div>`;
            } else {
                renderDeckBuilder(contentDiv);
            }
            return; 
        }
        if (!data) {
            contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
            return;
        }
        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));
        if (isFinalView) {
            const mainButton = document.createElement('button');
            mainButton.className = 'main-btn';
            mainButton.textContent = '메인';
            panelHeader.appendChild(mainButton);
            if (menuId === 'deck' && data.composition) {
                renderDeckView(contentDiv, data);
            } else if(menuId === 'calendar') {
                renderCalendarView(contentDiv, data);
            } else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') {
                renderPokemonView(contentDiv, data, menuId); 
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
        appContainer.classList.add('menu-active');
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId); 
        const currentPanel = panels[`lev${level}`] || sidebar;
        const nextPanel = panels[`lev${nextLevel}`];
        if (!nextPanel) return;
        if (isMobile()) {
            currentPanel.classList.add('is-hidden');
        }
        Object.values(panels).forEach((panel, index) => {
            if(index > 0 && panel !== nextPanel) { panel.classList.remove('visible'); }
        });
        nextPanel.classList.remove('is-hidden');
        nextPanel.classList.add('visible');
        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
    }
    
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) {
            return DB.pokemonType.lev4?.[id];
        }
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }
    
    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        if (!parentPanel) return;
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        const currentPanel = panels[`lev${level}`];
        const prevPanel = panels[`lev${level - 1}`] || sidebar;
        currentPanel.classList.remove('visible');
        if (prevPanel) {
            if (isMobile()) { prevPanel.classList.remove('is-hidden'); }
            if(prevPanel !== sidebar) { prevPanel.classList.add('visible'); }
        }
        setActive(level - 1, null);
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
    
    async function fetchAllDataFromFirebase() {
        const collections = ['pokemon', 'items', 'runeAndChips', 'tips', 'events', 'recommendedDecks'];
        const promises = collections.map(col => db.collection(col).get());
        const [pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, eventsSnapshot, decksSnapshot] = await Promise.all(promises);
        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => { dataMap[doc.id] = { id: doc.id, ...doc.data() }; });
            return dataMap;
        };
        const eventsToArray = (snapshot) => {
            const dataArray = [];
            snapshot.forEach(doc => { dataArray.push({ id: doc.id, ...doc.data() }); });
            return dataArray;
        }
        DB.pokemonType.lev4 = snapshotToMap(pokemonSnapshot);
        DB.item.lev4 = snapshotToMap(itemsSnapshot);
        DB.runeAndChip.lev4 = snapshotToMap(runeAndChipsSnapshot);
        DB.tips.lev3 = snapshotToMap(tipsSnapshot);
        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name }));
        DB.calendar.lev2.events = eventsToArray(eventsSnapshot);
        DB.deck.lev4 = snapshotToMap(decksSnapshot);
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));
    }

    async function initialize() {
        try {
            await fetchAllDataFromFirebase();

            const types = {};
            DB.pokemonType.lev2.forEach(type => { types[type.id] = []; });
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                const pkmName = pokemon.name_ko || (pokemon.name && pokemon.name.ko);
                if (pokemon.types && Array.isArray(pokemon.types) && pkmName) {
                    pokemon.types.forEach(typeId => { if (types[typeId]) { types[typeId].push({ id: pokemonId, name: pkmName }); } });
                }
            });
            DB.pokemonType.lev3 = types;

            const grades = {};
            DB.pokemonGrade.lev2.forEach(grade => { grades[grade.id] = []; });
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                const pkmName = pokemon.name_ko || (pokemon.name && pokemon.name.ko);
                if (pokemon && pokemon.grade && pkmName) {
                     const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                    if (gradeId && grades[gradeId]) { grades[gradeId].push({ id: pokemonId, name: pkmName }); }
                }
            });
            DB.pokemonGrade.lev3 = grades;
            
            const itemGrades = { god: [], legendary: [], epic: [] };
            Object.entries(DB.item.lev4).forEach(([itemId, item]) => {
                const gradeKey = item.grade?.toLowerCase();
                if (itemGrades[gradeKey]) {
                    itemGrades[gradeKey].push({ id: itemId, name: item.name });
                }
            });
            DB.item.lev3 = itemGrades;
            
            const runeAndChipTypes = { rune: [], chip: [] };
            Object.entries(DB.runeAndChip.lev4).forEach(([rcId, rc]) => {
                if(runeAndChipTypes[rc.type]) {
                    runeAndChipTypes[rc.type].push({ id: rcId, name: rc.name });
                }
            });
            DB.runeAndChip.lev3 = runeAndChipTypes;

            renderSidebar();
            addEventListeners();
            
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. Firebase 연결 또는 데이터 구조를 확인해주세요.";
        }
    }
    
    function renderSidebar() {
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
        sidebar.innerHTML = '';
        sidebar.appendChild(sidebarContent);
    }

    function addEventListeners() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.ad-container')) {
                adBlockManager.recordClick();
            }
        });
        appContainer.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) { 
                handleBackClick(button); 
            } else if (button.classList.contains('main-btn')) {
                handleMainButtonClick();
            }
            else if (button.dataset.level) { 
                handleMenuClick(button); 
            }
        });
    }
    
    // 페이지의 모든 로직을 실행
    initialize();
    
    // 페이지의 기본 로직과 별개로 광고 관찰자 설정
    setupAdObservers();
});