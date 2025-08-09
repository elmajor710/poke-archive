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

    // --- 페이지 전역 변수 ---
    const appContainer = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev1: sidebar,
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    let activeButtons = {};
    const isMobile = () => window.innerWidth <= 1199;

    // --- 함수 정의 영역 ---

    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            addEventListeners();
            populateMainOverlay();   // <-- 이 줄을 새로 추가!
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. Firebase 연결 또는 데이터 구조를 확인해주세요.";
        }
    }
    
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
    
    function setupSideMenuData() {
        DB.pokemonType.lev2.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        const types = {};
        DB.pokemonType.lev2.forEach(type => { types[type.id] = []; });
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon.types && Array.isArray(pokemon.types)) {
                pokemon.types.forEach(typeId => {
                    if (types[typeId]) types[typeId].push({ id: pokemon.id, name: pokemon.name_ko || pokemon.name });
                });
            }
        });
        Object.values(types).forEach(typeList => typeList.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.pokemonType.lev3 = types;

        const grades = {};
        DB.pokemonGrade.lev2.forEach(grade => { grades[grade.id] = []; });
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon && pokemon.grade) {
                const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                if (gradeId && grades[gradeId]) grades[gradeId].push({ id: pokemon.id, name: pokemon.name_ko || pokemon.name });
            }
        });
        Object.values(grades).forEach(gradeList => gradeList.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.pokemonGrade.lev3 = grades;
        
        const itemGrades = { god: [], legendary: [], epic: [] };
        Object.values(DB.item.lev4).forEach(item => {
            const gradeKey = item.grade?.toLowerCase();
            if (itemGrades[gradeKey]) itemGrades[gradeKey].push({ id: item.id, name: item.name });
        });
        Object.values(itemGrades).forEach(g => g.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.item.lev3 = itemGrades;
        
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(runeAndChipTypes[rc.type]) runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name });
        });
        runeAndChipTypes.rune.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        runeAndChipTypes.chip.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        DB.runeAndChip.lev3 = runeAndChipTypes;

        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title }));
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));
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
        if(sidebar) {
            sidebar.innerHTML = '';
            sidebar.appendChild(sidebarContent);
        }
    }

    function addEventListeners() {
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.ad-container')) adBlockManager.recordClick();
        });
        if(appContainer) {
            appContainer.addEventListener('click', e => {
                const button = e.target.closest('button');
                if (!button) return;
                if (button.classList.contains('back-btn')) handleBackClick(button); 
                else if (button.classList.contains('main-btn')) handleMainButtonClick();
                else if (button.dataset.level) handleMenuClick(button); 
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
        if (isMobile()) currentPanel.classList.add('is-hidden');
        Object.values(panels).forEach((panel, index) => {
            if(index > 0 && panel !== nextPanel) panel.classList.remove('visible');
        });
        nextPanel.classList.remove('is-hidden');
        nextPanel.classList.add('visible');
        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        if (!parentPanel) return;
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        const currentPanel = panels[`lev${level}`];
        const prevPanel = panels[`lev${level - 1}`] || sidebar;
        currentPanel.classList.remove('visible');
        if (prevPanel) {
            if (isMobile()) prevPanel.classList.remove('is-hidden');
            if(prevPanel !== sidebar) prevPanel.classList.add('visible');
        }
        setActive(level - 1, null);
    }
    
    function handleMainButtonClick() {
        appContainer.classList.remove('menu-active');
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) panel.classList.remove('visible', 'is-hidden');
        });
        setActive(0, null);
        if (isMobile() && sidebar) sidebar.classList.remove('is-hidden');
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

    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) return DB.pokemonType.lev4?.[id];
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        const panelHeader = targetPanel.querySelector('.panel-header');
        if(panelHeader.querySelector('.main-btn')) panelHeader.querySelector('.main-btn').remove();
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
        } else if (!data) {
            contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
        } else {
            const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
            const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));
            if (isFinalView) {
                const mainButton = document.createElement('button');
                mainButton.className = 'main-btn';
                mainButton.textContent = '메인';
                panelHeader.appendChild(mainButton);

                if (menuId === 'deck' && data.composition) renderDeckView(contentDiv, data);
                else if(menuId === 'calendar') renderCalendarView(contentDiv, data);
                else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, data, menuId); 
                else renderSimpleView(contentDiv, data, menuId); 
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
    }

    function showModal(title, content, isWeatherPopup = false, callback) {
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    let modalClass = 'modal-content';
    if (isWeatherPopup) modalClass += ' weather-popup';

    modalOverlay.innerHTML = `
        <div class="${modalClass}">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body"></div>
        </div>`;

    const modalBody = modalOverlay.querySelector('.modal-body');

    // [핵심 수정] content가 HTML 문자열인지, 살아있는 Element인지 확인하고 처리
    if (typeof content === 'string') {
        modalBody.innerHTML = content; // 문자열이면 그대로 넣기
    } else if (content instanceof HTMLElement) {
        modalBody.appendChild(content); // Element이면 자식으로 추가
    }

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
        const nameKo = data.name_ko || '이름 없음';
        const nameEn = data.name_en || '';
        let commonHTML = `<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${nameEn}</span></h2>`;
        let badgesHTML = '<div class="badge-container">';
        if (data.grade) {
            const gradeClass = `grade-${data.grade.toLowerCase().replace('+', '-plus')}`;
            badgesHTML += `<span class="grade-badge ${gradeClass}">${data.grade}</span>`;
        }
        if (data.types && data.types.length > 0) {
            data.types.forEach(typeId => {
                const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                if (typeInfo) badgesHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
            });
        }
        badgesHTML += '</div>';
        commonHTML += badgesHTML;
        if (data.imageURL) commonHTML += `<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`;
        
        let statsHTML = '';
        if (data.stats) {
            const totalStats = Object.values(data.stats).reduce((a, b) => Number(a) + Number(b), 0);
            statsHTML += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">${Object.entries(data.stats).map(([stat, value]) => `<tr><td>${stat.toUpperCase()}</td><td>${value}</td></tr>`).join('')}</table>`;
        } else {
            statsHTML = '<h4>기본 정보</h4><p>등록된 종족값 정보가 없습니다.</p>';
        }
        
        let skillsHTML = '';
        if (data.skills && data.skills.length > 0 && data.skills.some(s => s.name)) {
            skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
            data.skills.forEach((skill, index) => { 
                if(skill.name) skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; 
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
                         buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}</div>`;
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
        if (useTabs) {
             detailView.innerHTML = `${commonHTML}<div class="tab-container"><nav class="tab-nav"><button class="tab-button active" data-tab="tab-info">기본 정보</button><button class="tab-button" data-tab="tab-skills">스킬</button><button class="tab-button" data-tab="tab-build">추천 빌드</button></nav><div id="tab-info" class="tab-pane active">${statsHTML}</div><div id="tab-skills" class="tab-pane">${skillsHTML}</div><div id="tab-build" class="tab-pane">${buildHTML}</div></div>`;
        } else {
            detailView.innerHTML = `${commonHTML}<div class="info-sections">${statsHTML}${skillsHTML}${buildHTML}</div>`;
        }
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);

        detailView.querySelectorAll('.skill-name').forEach(el => { 
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
        detailView.querySelectorAll('.recommend-item').forEach(el => {
            el.addEventListener('click', () => {
                const itemId = el.dataset.itemId;
                const itemType = el.dataset.itemType;
                const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                const itemData = DB[dbKey]?.lev4?.[itemId];

                if (itemData) {
                    // 1. 임시 div(살아있는 Element)를 메모리에 만듭니다.
                    const tempContentDiv = document.createElement('div');
                    
                    // 2. renderSimpleView를 호출하여 임시 div에 아이템의 상세 내용을 그립니다.
                    //    이제 tempContentDiv 안에는 탭 기능이 살아있는 버튼들이 들어있습니다.
                    const menuId = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                    renderSimpleView(tempContentDiv, itemData, menuId);

                    // 3. 업그레이드된 showModal 함수에 '살아있는' tempContentDiv를 통째로 전달합니다.
                    showModal(itemData.name, tempContentDiv);
                }
            });
        });

        detailView.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('active')) return;
                detailView.querySelector('.tab-button.active').classList.remove('active');
                detailView.querySelector('.tab-pane.active').classList.remove('active');
                button.classList.add('active');
                detailView.querySelector(`#${button.dataset.tab}`).classList.add('active');
            });
        });
    }

    function renderSimpleView(contentDiv, data, menuId) {
    const detailView = document.createElement('div');
    detailView.className = 'simple-detail-view';

    let html = `<h2>${data.name || data.title}</h2>`;
    if (data.grade) {
        const gradeClass = `grade-${data.grade.toLowerCase()}`;
        html += `<div class="badge-container"><span class="grade-badge ${gradeClass}">${data.grade}</span></div>`;
    }
    if (data.imageURL) {
        html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`;
    }

    const description = data.description || data.htmlContent || '';
    
    // 탭 이름과 구분자 설정
    let tabNames = [];
    let separator = '';
    if (menuId === 'item') {
        tabNames = ['기본 능력치', '소지 효과'];
        separator = '[소지 효과]';
    } else if (menuId === 'runeAndChip') {
        tabNames = ['세트 효과 1', '세트 효과 2'];
        separator = '[세트 효과]'; // 룬&칩의 구분자는 '[세트 효과]'로 지정
    }

    // 구분자가 있고, 설명 내용이 있을 경우 탭으로 분리
    if (tabNames.length > 0 && description.includes(separator)) {
        const parts = description.split(separator);
        const tab1Content = parts[0].trim();
        const tab2Content = parts[1].trim().replace(/\[(.*?)\]/g, '<h4>$1</h4>').replace(/\n/g, '<br>');

        html += `
            <div class="tab-container">
                <nav class="tab-nav">
                    <button class="tab-button active" data-tab="tab-1">${tabNames[0]}</button>
                    <button class="tab-button" data-tab="tab-2">${tabNames[1]}</button>
                </nav>
                <div id="tab-1" class="tab-pane active item-description">${tab1Content.replace(/\n/g, '<br>')}</div>
                <div id="tab-2" class="tab-pane item-description">${tab2Content}</div>
            </div>`;
        detailView.innerHTML = html;
        
        // 탭 전환 이벤트 리스너 추가
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
        // 구분자가 없을 경우 기존 방식대로 전체 내용을 표시
        html += `<div class="item-description">${description.replace(/\\n/g, '<br>')}</div>`;
        detailView.innerHTML = html;
    }
    
    contentDiv.innerHTML = '';
    contentDiv.appendChild(detailView);
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
            'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0], 'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
            'main_4': [1, 2], 'main_5': [2, 2], 'main_6': [3, 2], 'main_1': [1, 3], 'main_2': [2, 3], 'main_3': [3, 3]
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
                            for (let k = 1; k < cell.colspan; k++) grid[i][j+k] = undefined;
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
        let currentCalendarDate = new Date();
        function buildCalendar(year, month) {
            const calendarView = document.createElement('div');
            calendarView.className = 'calendar-view';
            const monthEvents = {};
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
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
                    if (currentDate.getFullYear() > year || (currentDate.getFullYear() === year && currentDate.getMonth() > month)) break;
                    for (let i = 0; i < (re.duration || 1); i++) {
                        const eventDate = new Date(currentDate);
                        eventDate.setDate(eventDate.getDate() + i);
                         if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                            addEvent({ ...re, date: currentDate.toISOString().split('T')[0] }, eventDate);
                        }
                    }
                    if (re.interval === '4_weeks') currentDate.setDate(currentDate.getDate() + 28);
                    else break;
                }
            });
            let html = `<div class="calendar-header"><span class="calendar-title">${year}년 ${month + 1}월</span><div class="calendar-nav"><button id="cal-prev-btn">&lt; 이전</button><button id="cal-today-btn">Today</button><button id="cal-next-btn">다음 &gt;</button></div></div><div class="calendar-legend"><div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div><div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div><div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div></div><table class="calendar-grid"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>`;
            let dateCounter = 1;
            const startDay = firstDay.getDay();
            const daysInMonth = lastDay.getDate();
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
                            html += `<div class="event-markers">${eventsOnDay.map(event => `<div class="event-marker event-type-${event.type}">${event.title || event.name}</div>`).join('')}</div>`;
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
            grid.innerHTML = pokemonList.map(([id, pkm]) => `<div class="pokemon-source-icon" draggable="true" data-pokemon-id="${id}"><img src="${pkm.faceImageURL}" alt="${pkm.name_ko || pkm.name}"><span>${pkm.name_ko || pkm.name}</span></div>`).join('');
            sourceList.appendChild(grid);
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
        placementGrid.addEventListener('dragover', e => e.preventDefault());
        placementGrid.addEventListener('drop', e => {
            e.preventDefault();
            const targetSlot = e.target.closest('.placement-slot');
            if (!targetSlot || !draggedItem) return;
            const sourcePokemonId = draggedItem.classList.contains('placement-slot') ? placedPokemon.get(draggedItem) : draggedItem.dataset.pokemonId;
            if (!sourcePokemonId) return;
            const pokemonData = DB.pokemonType.lev4[sourcePokemonId];
            if (draggedItem.classList.contains('placement-slot')) {
                const sourceSlot = draggedItem;
                if (targetSlot === sourceSlot) return; 
                const targetPokemonId = placedPokemon.get(targetSlot);
                if (targetPokemonId) { 
                    const targetPokemonData = DB.pokemonType.lev4[targetPokemonId];
                    placePokemonInSlot(sourceSlot, targetPokemonId, targetPokemonData);
                    placePokemonInSlot(targetSlot, sourcePokemonId, pokemonData);
                } else { 
                    placePokemonInSlot(targetSlot, sourcePokemonId, pokemonData);
                    clearSlot(sourceSlot);
                }
            } else if (draggedItem.classList.contains('pokemon-source-icon')) {
                if (placedPokemon.has(targetSlot)) {
                    alert('슬롯이 비어있지 않습니다.');
                    return;
                }
                placePokemonInSlot(targetSlot, sourcePokemonId, pokemonData);
            }
            draggedItem = null;
            updateTeamEffects();
        });
        placementGrid.addEventListener('click', e => {
            const removeButton = e.target.closest('.remove-pkm-btn');
            if(removeButton) {
                const parentSlot = removeButton.closest('.placement-slot');
                if (parentSlot) {
                    clearSlot(parentSlot);
                    updateTeamEffects();
                }
            }
        });
        function placePokemonInSlot(slot, pokemonId, pokemonData) {
            slot.innerHTML = `<div class="deck-pokemon-cell" draggable="true"><img src="${pokemonData.faceImageURL}" alt="${pokemonData.name_ko}"/><button class="remove-pkm-btn">×</button></div>`;
            placedPokemon.set(slot, pokemonId);
        }
        function clearSlot(slot) {
            const { role, position } = slot.dataset;
            let placeholder = role === 'assist' ? `어시스트_#${position}` : `${slot.classList.contains('vanguard') ? '전방' : '후방'}_#${position}`;
            slot.innerHTML = placeholder;
            placedPokemon.delete(slot);
        }
        function updateTeamEffects() {
            const mainPokemonIds = Array.from(placedPokemon.entries()).filter(([,slot]) => slot.dataset.role === 'main').map(([pokemonId]) => pokemonId);
            const synergy = calculateSynergy(mainPokemonIds);
            if (synergy) {
                synergyIconContainer.querySelector('img').src = synergy.imageURL;
                synergyIconContainer.style.visibility = 'visible';
            } else {
                synergyIconContainer.style.visibility = 'hidden';
            }
        }
        applyFilters();
    }


    // --- 페이지 실행 ---
    adBlockManager.checkAndApplyBlock();
    initialize();
    setupAdObservers();

    // 모바일 화면 높이 문제 해결을 위한 코드
    function setScreenHeight() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);
});

// script.js 파일 맨 아래, }); 앞에 추가하세요

    async function loadLatestAnnouncement() {
        const banner = document.getElementById('announcement-banner');
        if (!banner) return;

        try {
            const querySnapshot = await db.collection("announcements")
                .where("isPublished", "==", true)
                .orderBy("timestamp", "desc")
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const latestAnn = querySnapshot.docs[0].data();
                banner.innerHTML = `
                    <div class="announcement-content">
                        <span class="announcement-title">📢 [공지]</span>
                        <span class="announcement-text">${latestAnn.title}</span>
                    </div>
                `;
                banner.style.display = 'block'; // 공지사항이 있을 때만 보이도록 처리
            }
        } catch (error) {
            console.error("최신 공지사항 로딩 오류:", error);
        }
    }

    // script.js 파일 맨 아래, }); 앞에 이 함수 전체를 추가하세요

// 기존 populateMainOverlay 함수를 찾아 아래 코드로 교체하세요

async function populateMainOverlay() {
    const noticeList = document.getElementById('notice-list');
    const popularList = document.getElementById('popular-list');

    if (!noticeList || !popularList) return;

    // 1. 공지사항 불러오기
    try {
        const snapshot = await db.collection("announcements")
            .where("isPublished", "==", true)
            .orderBy("timestamp", "desc")
            .limit(5)
            .get();

        if (!snapshot.empty) {
            let listHtml = '';
            // [수정] 클릭 시 상세보기를 위해 전체 데이터를 메모리에 저장
            const notices = {};
            snapshot.forEach(doc => {
                const notice = doc.data();
                notices[doc.id] = notice; // ID를 키로 하여 공지 데이터 저장
                listHtml += `<li data-id="${doc.id}" style="cursor: pointer;">${notice.title}</li>`;
            });
            noticeList.innerHTML = listHtml;

            // [핵심 추가] 공지사항 목록에 클릭 이벤트 추가
            noticeList.addEventListener('click', (e) => {
                const targetLi = e.target.closest('li');
                if (targetLi && targetLi.dataset.id) {
                    const noticeId = targetLi.dataset.id;
                    const noticeData = notices[noticeId];
                    if (noticeData) {
                        // 기존에 만들어둔 팝업창(모달) 함수를 재사용
                        showModal(noticeData.title, noticeData.content);
                    }
                }
            });

        } else {
            noticeList.innerHTML = '<li>등록된 공지사항이 없습니다.</li>';
        }
    } catch (error) {
        console.error("공지사항 목록 로딩 오류:", error);
        noticeList.innerHTML = '<li>목록을 불러올 수 없습니다.</li>';
    }

    // 2. 인기글 불러오기 (지금은 임시 텍스트만 채워넣습니다)
    popularList.innerHTML = `
        <li>인기글 1위 (개발 예정)</li>
        <li>인기글 2위 (개발 예정)</li>
        <li>인기글 3위 (개발 예정)</li>
        <li>인기글 4위 (개발 예정)</li>
        <li>인기글 5위 (개발 예정)</li>
    `;
}