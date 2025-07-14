document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

    function initializeAppUserMode() {
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
        
        function renderPokemonView(contentDiv, data) {
            const detailView = document.createElement('div');
            detailView.className = 'pokemon-detail-view';

            // Firebase 데이터(data.name_ko)와 기존 data.js(data.name.ko)를 모두 처리
            const nameKo = data.name_ko || data.name.ko;
            const nameEn = data.name_en || data.name.en;

            let badgesHTML = '<div class="badge-container">';
            if(data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase().replace('+', '-plus')}`;
                badgesHTML += `<span class="grade-badge ${gradeClass}">${data.grade}</span>`;
            }
            if (data.types && data.types.length > 0) {
                data.types.forEach(typeId => {
                    const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                    if (typeInfo) {
                        badgesHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
                    }
                });
            }
            badgesHTML += '</div>';
            
            // alt와 h2 태그에 새로운 변수(nameKo, nameEn) 사용
            let commonHTML = `<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${nameEn}</span></h2>`;
            commonHTML += badgesHTML;
            if (data.imageURL) { commonHTML += `<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`; }
            
            let statsHTML = '';
            if (data.stats) {
                const totalStats = data.totalStats || Object.values(data.stats).reduce((a, b) => a + b, 0);
                statsHTML += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">`;
                Object.entries(data.stats).forEach(([stat, value]) => { statsHTML += `<tr><td>${stat}</td><td>${value}</td></tr>`; });
                statsHTML += '</table>';
            }
            let skillsHTML = '';
            if (data.skills && data.skills.length > 0) {
                skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
                data.skills.forEach((skill, index) => { 
                    skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; 
                });
                skillsHTML += '</ul>';
            }
            let buildHTML = '';
            if (data.recommendedNatures && data.recommendedNatures.length > 0) {
                const natureNames = data.recommendedNatures.map(natureId => DB.definitions.natures.find(n => n.id === natureId)?.name || '').filter(Boolean);
                buildHTML += `<h4>추천 성격</h4><p>${natureNames.join(', ')}</p>`;
            }
            const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
            for (const type in recommendTypes) {
                if (data[type] && data[type].length > 0) {
                    buildHTML += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;
                    data[type].forEach(id => {
                        const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', '');
                        const dbKey = (itemTypeForDB === 'rune' || itemTypeForDB === 'chip') ? 'runeAndChip' : 'item';
                        const itemData = DB[dbKey]?.lev4?.[id];
                        if (itemData) {
                             buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">
                                        ${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}<span>${itemData.name}</span>
                                     </div>`;
                        }
                    });
                    buildHTML += `</div>`;
                }
            }
            
            detailView.innerHTML = commonHTML + statsHTML + skillsHTML + buildHTML;
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
                            skill.keywords.forEach(kw => {
                                skillDetailContent += `<li><strong>${kw.term}:</strong> ${kw.desc}</li>`;
                            });
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
        }

        function renderSimpleView(contentDiv, data) {
            if (data.htmlContent) {
                let html = `<div class="simple-detail-view"><h2>${data.name}</h2>${data.htmlContent}</div>`;
                contentDiv.innerHTML = html;
                return;
            }
            let html = `<div class="simple-detail-view"><h2>${data.name}</h2>`;
            if (data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase()}`;
                html += `<div class="badge-container"><span class="grade-badge ${gradeClass}">${data.grade}</span></div>`;
            }
            if (data.imageURL) { html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`; }
            if (data.description) { html += `<div class="item-description">${data.description.replace(/\\n/g, '<br>')}</div>`; }
            if (data.content) { html += `<p>${data.content}</p>`; }
            html += `</div>`;
            contentDiv.innerHTML = html;
        }
        
        function renderDeckView(contentDiv, data) {
            let html = `<div class="deck-detail-view"><h2>${data.name}</h2>`;
            if (data.description) { html += `<p>${data.description}</p>`; }
            const grid = Array(3).fill(null).map(() => Array(3).fill(null));
            const positionMap = { 'vanguard_1': [0, 2], 'vanguard_2': [1, 2], 'vanguard_3': [2, 2], 'rearguard_4': [0, 1], 'rearguard_5': [1, 1], 'rearguard_6': [2, 1], 'assist_1': [0, 0], 'assist_2': [1, 0], 'assist_3': [2, 0] };
            data.composition.forEach(member => { const pkmData = DB.pokemonType.lev4[member.pokemonId]; if (!pkmData) return; const roleKey = member.role === 'assist' ? 'assist' : (member.position < 4 ? 'vanguard' : 'rearguard'); const key = `${roleKey}_${member.position}`; const [row, col] = positionMap[key]; grid[row][col] = { name: pkmData.name.ko, faceImageURL: pkmData.faceImageURL, role: member.role, position: member.position }; });
            html += `<h4>덱 배치</h4><table class="deck-grid-table"><thead><tr><th>어시스트</th><th>후방</th><th>전방</th></tr></thead><tbody>`;
            for (let i = 0; i < 3; i++) { html += '<tr>'; for (let j = 0; j < 3; j++) { const cell = grid[i][j]; if (cell) { const roleText = cell.role === 'assist' ? '어시스트' : '메인'; html += `<td><div class="deck-pokemon-cell"><img src="${cell.faceImageURL}" alt="${cell.name}"><span class="position-number">${roleText} #${cell.position}</span></div></td>`; } else { html += '<td></td>'; } } html += '</tr>'; }
            html += `</tbody></table><h4>덱 구성원</h4>`;
            const mainMembers = data.composition.filter(m => m.role === 'main').sort((a,b) => a.position - b.position);
            const assistMembers = data.composition.filter(m => m.role === 'assist').sort((a,b) => a.position - b.position);
            if (mainMembers.length > 0) {
                html += `<h5>메인</h5><ul class="deck-composition-list">`;
                mainMembers.forEach(member => { const pkmData = DB.pokemonType.lev4[member.pokemonId]; if(pkmData) html += `<li><b>메인 #${member.position}:</b> ${pkmData.name.ko}</li>`; });
                html += `</ul>`;
            }
            if (assistMembers.length > 0) {
                html += `<h5>어시스트</h5><ul class="deck-composition-list">`;
                assistMembers.forEach(member => { const pkmData = DB.pokemonType.lev4[member.pokemonId]; if(pkmData) html += `<li><b>어시스트 #${member.position}:</b> ${pkmData.name.ko}</li>`; });
                html += `</ul>`;
            }
            html += `</div>`;
            contentDiv.innerHTML = html;
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
                    
                    const fullEventInfo = {
                        ...event,
                        startDate: new Date(event.date + 'T00:00:00'),
                        endDate: new Date(new Date(event.date + 'T00:00:00').setDate(new Date(event.date + 'T00:00:00').getDate() + (event.duration - 1)))
                    };
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
                
                let html = `
                    <div class="calendar-header">
                        <span class="calendar-title">${year}년 ${month + 1}월</span>
                        <div class="calendar-nav">
                            <button id="cal-prev-btn">&lt; 이전</button>
                            <button id="cal-today-btn">Today</button>
                            <button id="cal-next-btn">다음 &gt;</button>
                        </div>
                    </div>
                    <div class="calendar-legend">
                         <div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div>
                        <div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div>
                        <div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div>
                    </div>
                    <table class="calendar-grid">
                        <thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead>
                        <tbody>`;

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
                            
                            html += `<td class="${cellClass}" data-day="${dateCounter}">
                                        <div class="date-number">${dateCounter}</div>`;
                            if (eventsOnDay) {
                                html += `<div class="event-markers">`;
                                eventsOnDay.forEach(event => {
                                    html += `<div class="event-marker event-type-${event.type}">${event.title || event.name}</div>`;
                                });
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
            let html = `
            <div class="deck-builder-view">
                <div class="placement-container">
                    <div class="placement-grid">
                        <div class="placement-slot-header" id="weather-icon-container">☀️</div>
                        <div class="placement-slot-header" id="synergy-icon-container">
                            <img src="https://i.imgur.com/g0t51J7.png" alt="타입 시너지">
                        </div>
                        <div class="placement-slot-header"></div>
                        <div class="placement-slot assist" data-role="assist" data-position="1">어시스트_#1</div>
                        <div class="placement-slot main rearguard" data-role="main" data-position="4">후방_#4</div>
                        <div class="placement-slot main vanguard" data-role="main" data-position="1">전방_#1</div>
                        <div class="placement-slot assist" data-role="assist" data-position="2">어시스트_#2</div>
                        <div class="placement-slot main rearguard" data-role="main" data-position="5">후방_#5</div>
                        <div class="placement-slot main vanguard" data-role="main" data-position="2">전방_#2</div>
                        <div class="placement-slot assist" data-role="assist" data-position="3">어시스트_#3</div>
                        <div class="placement-slot main rearguard" data-role="main" data-position="6">후방_#6</div>
                        <div class="placement-slot main vanguard" data-role="main" data-position="3">전방_#3</div>
                    </div>
                </div>
                <div class="source-container">
                    <h4>포켓몬 목록</h4>
                    <div class="source-filter-bar">
                        <select id="grade-filter" class="filter-dropdown">
                            <option value="all">모든 등급</option>
                            <option value="SS">SS</option>
                            <option value="S+">S+</option>
                            <option value="S">S</option>
                        </select>
                        <select id="type-filter" class="filter-dropdown">
                            <option value="all">모든 타입</option>
                        </select>
                    </div>
                    <div class="source-list"></div>
                </div>
            </div>`;
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

                filteredPokemon.sort(([, a], [, b]) => a.name.ko.localeCompare(b.name.ko));
                
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
                return `<div class="pokemon-source-icon" draggable="true" data-pokemon-id="${id}">
                            <img src="${pkm.faceImageURL}" alt="${pkm.name.ko}">
                            <span>${pkm.name.ko}</span>
                        </div>`;
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

                const sourcePokemonId = draggedItem.classList.contains('placement-slot') 
                    ? placedPokemon.get(draggedItem)
                    : draggedItem.dataset.pokemonId;
                
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
                slot.innerHTML = `<div class="deck-pokemon-cell" draggable="true">
                                    <img src="${pokemonData.faceImageURL}" alt="${pokemonData.name.ko}"/>
                                    <button class="remove-pkm-btn">×</button>
                                  </div>`;
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
                        let modalTitle = pokemonData.name.ko;
                        let modalContentHTML = '';

                        const typesHTML = pokemonData.types.map(typeId => {
                            const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                            return typeInfo ? `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>` : '';
                        }).join(' ');

                        if (parentSlot.dataset.role === 'assist' && pokemonData.contractInfo) {
                            modalTitle = `${pokemonData.name.ko} - 계약장 정보`;
                            const contract = pokemonData.contractInfo;
                            
                            modalContentHTML = `
                                <div class="badge-container">${typesHTML}</div>
                                <h4>기본 능력치</h4>
                                <table class="stats-table">
                                    ${Object.entries(contract.stats).map(([stat, value]) => `<tr><td>${stat}</td><td>${value}</td></tr>`).join('')}
                                </table>
                                <h4>효과: ${contract.skill.name} <span class="skill-type">${contract.skill.type}</span></h4>
                                <div class="item-description">${contract.skill.description.replace(/\n/g, '<br>')}</div>
                            `;
                        } 
                        else {
                            modalTitle = pokemonData.name.ko;
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
                if (pokemonIds.length < 6) return null;
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

            synergyIconContainer.addEventListener('click', () => {
                const synergyId = synergyIconContainer.dataset.synergyId;
                let contentHTML = `
                    <table class="synergy-table">
                        <thead><tr><th>타입 시너지 효과</th><th>설명</th></tr></thead>
                        <tbody>`;
                DB.synergyEffects.forEach(effect => {
                    const isCurrent = (synergyId && effect.id === synergyId) ? 'current-synergy' : '';
                    contentHTML += `
                        <tr class="${isCurrent}">
                            <td><img src="${effect.imageURL}" alt="${effect.name}"></td>
                            <td>${effect.description}</td>
                        </tr>`;
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
        
        function renderPanelContent(contentDiv, level, data, menuId, clickedId) {
            // [핵심 수정] 더 이상 직접 패널을 찾지 않고, 전달받은 contentDiv를 바로 사용
            if (!contentDiv) return;

            contentDiv.innerHTML = '';
            setTimeout(() => { contentDiv.scrollTop = 0; }, 0);
            if (!data) {
                contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
                return;
            }
            
            const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
            const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));

            if (isFinalView) {
                if (clickedId === 'deckBuilder') {
                    if (isMobile()) {
                        contentDiv.innerHTML = `<div class="pc-only-message"><h3>기능 안내</h3><p>배치툴 기능은 화면이 넓은 PC 환경에 최적화되어 있습니다.<br>PC에서 접속하여 이용해주세요.</p></div>`;
                    } else {
                        renderDeckBuilder(contentDiv);
                    }
                } else if (menuId === 'deck' && data.composition) {
                    renderDeckView(contentDiv, data);
                } else if(menuId === 'calendar') {
                    renderCalendarView(contentDiv, data);
                } else if (data.name_ko || data.name?.ko) { // Firebase와 로컬 데이터 모두 호환
                    renderPokemonView(contentDiv, data); 
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

        async function handleMenuClick(button) {
            const level = parseInt(button.dataset.level);
            const id = button.dataset.id;
            const menuId = button.dataset.menuId || id;
            const nextLevel = level + 1;

            // 데이터를 먼저 불러옵니다.
            const nextData = await getNextData(level, id, menuId);
            
            const currentPanel = panels[`lev${level}`];
            const nextPanel = panels[`lev${nextLevel}`];

            if (!nextPanel) return;

            if (isMobile()) {
                currentPanel.classList.add('is-hidden');
            }

            Object.values(panels).forEach((panel, index) => {
                if (index > 0 && panel !== nextPanel) {
                    panel.classList.remove('visible');
                }
            });
            nextPanel.classList.remove('is-hidden');
            nextPanel.classList.add('visible');
            
            setActive(level, button);

            const contentDiv = nextPanel.querySelector('.panel-content');
            if (contentDiv) {
                renderPanelContent(contentDiv, nextLevel, nextData, menuId, id);
            }
        }

        async function getNextData(currentLevel, id, menuId) {
            const nextLevel = currentLevel + 1;
            
            if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) {
                try {
                    const docRef = db.collection("pokemon").doc(id);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        console.log("Firebase에서 데이터를 성공적으로 가져왔습니다:", doc.data());
                        return doc.data();
                    } else {
                        console.log("해당 문서를 찾을 수 없습니다.");
                        return null;
                    }
                } catch (error) {
                    console.log("데이터를 가져오는 중 오류 발생:", error);
                    return null;
                }
            }
            
            // 다른 메뉴들은 기존 방식을 유지합니다.
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
            const prevPanel = panels[`lev${level - 1}`];
            currentPanel.classList.remove('visible');
            if (prevPanel) {
                if (isMobile()) { prevPanel.classList.remove('is-hidden'); }
                if(prevPanel.id !== 'sidebar') { prevPanel.classList.add('visible'); }
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

        function initialize() {
            try {
                // 타입별 lev3 목록 자동 생성
                const types = {};
                DB.pokemonType.lev2.forEach(type => {
                    types[type.id] = [];
                });
                Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                    if (pokemon.types) {
                        pokemon.types.forEach(typeId => {
                            if (types[typeId]) {
                                types[typeId].push({ id: pokemonId, name: pokemon.name_ko });
                            }
                        });
                    }
                });
                DB.pokemonType.lev3 = types;

                // 등급별 lev3 목록 자동 생성
                const gradeCategory = 'pokemonGrade';
                if (DB.hasOwnProperty(gradeCategory) && DB.pokemonType?.lev4) {
                    const grades = {};
                    Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                        if (pokemon && pokemon.grade && pokemon.name_ko) {
                             const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                            if (gradeId) {
                                if (!grades.hasOwnProperty(gradeId)) grades[gradeId] = [];
                                grades[gradeId].push({ id: pokemonId, name: pokemon.name_ko });
                            }
                        }
                    });
                     DB.pokemonGrade.lev3 = grades;
                }

                // 사이드바 메뉴 생성
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
                const existingContent = sidebar.querySelector('.panel-content');
                if(existingContent) existingContent.remove();
                sidebar.appendChild(sidebarContent);
                addEventListeners();
            } catch (error) {
                console.error("초기화 중 오류 발생:", error);
                document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. data.js 또는 script.js 파일을 확인해주세요.";
            }
        }

        function addEventListeners() {
            appContainer.addEventListener('click', e => {
                const button = e.target.closest('button');
                if (!button) return;
                if (button.classList.contains('back-btn')) { handleBackClick(button); }
                else if (button.dataset.level) { handleMenuClick(button); }
            });
        }
        
        initialize();
    }
    
    initializeAppUserMode();
});