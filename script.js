document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

    // --- 광고 설정 및 무효 트래픽 방지 로직 ---
    function setupAdObservers() {
        const adContainers = document.querySelectorAll('.ad-container');
        if (adContainers.length === 0) return;
        const adObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    const targetContainer = entry.target;
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        const styleWatcher = new MutationObserver((mutations) => {
                            for (const mutation of mutations) {
                                if (mutation.attributeName === 'style') {
                                    if (window.innerWidth <= 768) {
                                        const currentHeight = targetContainer.style.height;
                                        if (currentHeight !== '50px') {
                                            targetContainer.style.setProperty('height', '50px', 'important');
                                            targetContainer.style.setProperty('min-height', '50px', 'important');
                                        }
                                    }
                                    styleWatcher.disconnect();
                                }
                            }
                        });
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

    // --- [핵심 수정 영역 시작] ---

    // 최종 사이트 초기화 함수
    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            addEventListeners();
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. Firebase 연결 또는 데이터 구조를 확인해주세요.";
        }
    }
    
    // 공개된 데이터만 필터링해서 가져오는 함수
    async function fetchAllDataFromFirebase() {
        const collectionsToFetch = {
            pokemon: db.collection('pokemon').where("isPublished", "==", true),
            items: db.collection('items').where("isPublished", "==", true),
            runeAndChips: db.collection('runeAndChips').where("isPublished", "==", true),
            tips: db.collection('tips').where("isPublished", "==", true),
            recommendedDecks: db.collection('recommendedDecks').where("isPublished", "==", true),
            events: db.collection('events')
        };

        const promises = Object.values(collectionsToFetch).map(query => query.get());
        const [pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, decksSnapshot, eventsSnapshot] = await Promise.all(promises);

        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => { dataMap[doc.id] = { id: doc.id, ...doc.data() }; });
            return dataMap;
        };

        DB.pokemonType.lev4 = snapshotToMap(pokemonSnapshot);
        DB.item.lev4 = snapshotToMap(itemsSnapshot);
        DB.runeAndChip.lev4 = snapshotToMap(runeAndChipsSnapshot);
        DB.tips.lev3 = snapshotToMap(tipsSnapshot);
        DB.deck.lev4 = snapshotToMap(decksSnapshot);
        if(DB.calendar && DB.calendar.lev2) {
            DB.calendar.lev2.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    }
    
    // 가져온 데이터를 기반으로 메뉴 목록을 재구성하고 정렬하는 함수
    function setupSideMenuData() {
        // 포켓몬 타입별
        DB.pokemonType.lev2.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        const types = {};
        DB.pokemonType.lev2.forEach(type => { types[type.id] = []; });
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon.types && Array.isArray(pokemon.types)) {
                pokemon.types.forEach(typeId => {
                    if (types[typeId]) {
                        types[typeId].push({ id: pokemon.id, name: pokemon.name_ko || pokemon.name });
                    }
                });
            }
        });
        for (const typeId in types) {
            types[typeId].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        }
        DB.pokemonType.lev3 = types;

        // 포켓몬 등급별
        const grades = {};
        DB.pokemonGrade.lev2.forEach(grade => { grades[grade.id] = []; });
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon && pokemon.grade) {
                const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                if (gradeId && grades[gradeId]) {
                    grades[gradeId].push({ id: pokemon.id, name: pokemon.name_ko || pokemon.name });
                }
            }
        });
        for (const gradeId in grades) {
            grades[gradeId].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        }
        DB.pokemonGrade.lev3 = grades;
        
        // 아이템 등급별
        const itemGrades = { god: [], legendary: [], epic: [] };
        Object.values(DB.item.lev4).forEach(item => {
            const gradeKey = item.grade?.toLowerCase();
            if (itemGrades[gradeKey]) {
                itemGrades[gradeKey].push({ id: item.id, name: item.name });
            }
        });
        for (const grade in itemGrades) {
            itemGrades[grade].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        }
        DB.item.lev3 = itemGrades;
        
        // 룬 & 칩 타입별
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(runeAndChipTypes[rc.type]) {
                runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name });
            }
        });
        runeAndChipTypes.rune.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        runeAndChipTypes.chip.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        DB.runeAndChip.lev3 = runeAndChipTypes;

        // 팁 & 덱
        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title }));
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));
    }

    // --- [핵심 수정 영역 끝] ---


    // --- 이하 제이티님의 기존 UI 렌더링 및 이벤트 핸들러 (생략 없음) ---

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
        
        if (data.build_concept) {
            buildHTML += `<h4>빌드 콘셉트</h4><p>${data.build_concept}</p>`;
            hasBuildInfo = true;
        }

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

    function renderSimpleView(contentDiv, data, menuId) {
        const isTabTarget = (menuId === 'item' || menuId === 'runeAndChip') && data.description && data.description.includes('content-card-list');
        if (isTabTarget) {
            const detailView = document.createElement('div');
            detailView.className = 'simple-detail-view use-tabs';
            let html = `<h2>${data.name}</h2>`;
            if (data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase()}`;
                html += `<div class="badge-container"><span class="grade-badge ${gradeClass}">${data.grade}</span></div>`;
            }
            if (data.imageURL) { html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`; }
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = data.description;
            const basicAttributesCard = tempContainer.querySelector('.content-card:first-child .card-content');
            const carryEffectCard = tempContainer.querySelector('.content-card:last-child .card-content');
            const basicAttributesHTML = basicAttributesCard ? basicAttributesCard.innerHTML : '<p>기본 능력치 정보가 없습니다.</p>';
            const carryEffectHTML = carryEffectCard ? carryEffectCard.innerHTML : '<p>소지 효과 정보가 없습니다.</p>';
            html += `
                <div class="tab-container">
                    <nav class="tab-nav">
                        <button class="tab-button active" data-tab="tab-attributes">기본 능력치</button>
                        <button class="tab-button" data-tab="tab-effects">소지 효과</button>
                    </nav>
                    <div id="tab-attributes" class="tab-pane active">${basicAttributesHTML}</div>
                    <div id="tab-effects" class="tab-pane">${carryEffectHTML}</div>
                </div>`;
            detailView.innerHTML = html;
            contentDiv.innerHTML = '';
            contentDiv.appendChild(detailView);
            detailView.querySelectorAll('.tab-button').forEach(button => {
                button.addEventListener('click', () => {
                    if (button.classList.contains('active')) return;
                    detailView.querySelector('.tab-button.active').classList.remove('active');
                    detailView.querySelector('.tab-pane.active').classList.remove('active');
                    button.classList.add('active');
                    detailView.querySelector(`#${button.dataset.tab}`).classList.add('active');
                });
            });
        } else {
            let html = `<div class="simple-detail-view"><h2>${data.name || data.title}</h2>`;
            if (data.htmlContent) {
                html += data.htmlContent;
            } else {
                if (data.imageURL) { html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`; }
                if (data.description) { html += `<div class="item-description">${data.description.replace(/\\n/g, '<br>')}</div>`; }
            }
            html += `</div>`;
            contentDiv.innerHTML = html;
        }
    }

    function calculateSynergy(pokemonIds) {
        if (!DB.synergyEffects || !pokemonIds || pokemonIds.length < 6) return null;
        const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
        if (mainPokemon.some(pkm => !pkm)) return null;
        const typePokemonCount = {};
        mainPokemon.forEach(pkm => {
            if (pkm && pkm.types) {
                pkm.types.forEach(type => {
                    typePokemonCount[type] = (typePokemonCount[type] || 0) + 1;
                });
            }
        });
        const counts = Object.values(typePokemonCount).sort((a, b) => b - a);
        const totalUniqueTypes = Object.keys(typePokemonCount).length;
        if (counts.length > 0 && counts[0] >= 6) return DB.synergyEffects.find(s => s.id === 'same6');
        if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) return DB.synergyEffects.find(s => s.id === 'same3x2');
        if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) return DB.synergyEffects.find(s => s.id === 'same4_2');
        const totalPairs = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
        if (totalPairs >= 3) return DB.synergyEffects.find(s => s.id === 'same2x3');
        if (counts.length > 0 && counts[0] >= 3) return DB.synergyEffects.find(s => s.id === 'same3');
        if (totalUniqueTypes >= 6 && pokemonIds.length >= 6) return DB.synergyEffects.find(s => s.id === 'diff6');
        return null;
    }

    function renderDeckView(contentDiv, data) {
        const weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };
        let html = `<div class="deck-detail-view"><h2>${data.name}</h2>`;
        if (data.description) { html += `<p>${data.description}</p>`; }
        const grid = Array(4).fill(null).map(() => Array(4).fill(null));
        const positionMap = {
            'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0],
            'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
            'main_4':   [1, 2], 'main_5':   [2, 2], 'main_6':   [3, 2],
            'main_1':   [1, 3], 'main_2':   [2, 3], 'main_3':   [3, 3]
        };
        if (data.weather && weatherToEmoji[data.weather]) {
            grid[0][0] = { type: 'header', content: weatherToEmoji[data.weather], label: data.weather, colspan: 2 };
        }
        const mainPokemonIds = data.composition.filter(m => m.role === 'main').map(m => m.pokemonId);
        const synergy = calculateSynergy(mainPokemonIds);
        if (synergy) {
             grid[0][2] = { type: 'header', content: `<img src="${synergy.imageURL}">`, label: synergy.name, colspan: 2 };
        }
        data.composition.forEach(member => { 
            const pkmData = DB.pokemonType.lev4[member.pokemonId]; 
            if (!pkmData) return; 
            const key = `${member.role}_${member.position}`;
            if(positionMap[key]) {
                const [row, col] = positionMap[key];
                grid[row][col] = { type: 'pokemon', role: member.role, ...pkmData };
            }
        });
        html += `<h4>덱 배치</h4><table class="deck-grid-table four-by-four-table"><tbody>`;
        for (let i = 0; i < 4; i++) {
            html += '<tr>'; 
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === undefined) continue;
                const cell = grid[i][j]; 
                if (cell) {
                    if (cell.type === 'pokemon') {
                        html += `<td class="role-${cell.role}"><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"></div></td>`;
                    } else if (cell.type === 'header') {
                        const colspan = cell.colspan ? `colspan="${cell.colspan}"` : '';
                        const contentHTML = cell.content.startsWith('<img') ? cell.content : `<span class="header-emoji">${cell.content}</span>`;
                        html += `<td class="header-cell" ${colspan} title="${cell.label}"><div>${contentHTML}</div></td>`;
                        if (cell.colspan > 1) {
                            for (let k = 1; k < cell.colspan; k++) {
                                grid[i][j+k] = undefined;
                            }
                        }
                    }
                } else { 
                    html += '<td class="empty-cell"></td>';
                } 
            } 
            html += '</tr>'; 
        }
        html += `</tbody></table></div>`;
        contentDiv.innerHTML = html;
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
        // ...
    }

    function renderDeckBuilder(contentDiv) {
        // ...
    }
    
    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        const panelHeader = targetPanel.querySelector('.panel-header');
        const existingMainBtn = panelHeader.querySelector('.main-btn');
        if (existingMainBtn) existingMainBtn.remove();
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;
        if (clickedId === 'deckBuilder') {
            const mainButton = document.createElement('button');
            mainButton.className = 'main-btn';
            mainButton.textContent = '메인';
            panelHeader.appendChild(mainButton);
            if (isMobile()) {
                contentDiv.innerHTML = `<div class="pc-only-message"><h3>기능 안내</h3><p>배치툴 기능은 PC 환경에 최적화되어 있습니다.</p></div>`;
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
                renderSimpleView(contentDiv, data, menuId); 
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

    function handleMainButtonClick() {
        appContainer.classList.remove('menu-active');
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) { 
                panel.classList.remove('visible', 'is-hidden');
            }
        });
        setActive(0, null);
        if (isMobile()) {
            if(sidebar) sidebar.classList.remove('is-hidden');
        }
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

    // --- 페이지 실행 ---
    initialize();
    adBlockManager.checkAndApplyBlock();
    setupAdObservers();

    // 모바일 화면 높이 문제 해결을 위한 코드
    function setScreenHeight() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);
});