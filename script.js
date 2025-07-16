document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

    // 전역 변수 및 초기 설정
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

    // --- 유틸리티 함수 ---
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
    
    // --- 렌더링 함수들 ---
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
            
            if (menuId === 'pokemonType' || menuId === 'pokemonGrade') {
                renderPokemonView(contentDiv, data, menuId); 
            } else { 
                renderSimpleView(contentDiv, data); 
            }
        } else {
            if (Array.isArray(data)) {
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
    
    async function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        
        if (nextLevel === (categoryInfo?.levels || 0)) { // 최종 레벨일 경우
            let collectionName = menuId;
            if(menuId === 'pokemonType' || menuId === 'pokemonGrade') collectionName = 'pokemon';
            
            try {
                const docRef = db.collection(collectionName).doc(id);
                const doc = await docRef.get();
                if (doc.exists) {
                    return doc.data();
                }
            } catch (error) {
                console.error(`Firebase ${collectionName} 데이터 로딩 오류:`, error);
            }
            return DB[menuId]?.lev4?.[id] || DB[menuId]?.lev3?.[id] || null;
        }
        
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        
        return null;
    }
    
    async function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        
        const nextLevel = level + 1;
        const nextData = await getNextData(level, id, menuId); 
        
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

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        if (!parentPanel) return;
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        const currentPanel = panels[`lev${level}`];
        const prevPanel = panels[`lev${level - 1}`] || sidebar;
        currentPanel.classList.remove('visible');
        if(isMobile()) {
             if (prevPanel) prevPanel.classList.remove('is-hidden');
        }
        if(prevPanel !== sidebar) { prevPanel.classList.add('visible'); }
        setActive(level - 1, activeButtons[level - 2]);
    }
    
    function handleMainButtonClick() {
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) { 
                panel.classList.remove('visible');
                if(isMobile()) panel.classList.add('is-hidden');
            }
        });
        setActive(0, null);
        sidebar.classList.remove('is-hidden');
    }

    function setActive(level, target) {
        for (let i = level; i < 4; i++) {
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
    
    async function initialize() {
        try {
            // Firebase에서 최신 데이터 목록 가져오기
            const pokemonSnapshot = await db.collection("pokemon").get();
            const firebasePokemonData = {};
            pokemonSnapshot.forEach(doc => {
                firebasePokemonData[doc.id] = doc.data();
            });
            DB.pokemonType.lev4 = firebasePokemonData;

            const tipsSnapshot = await db.collection("tips").get();
            const fbTips = [];
            tipsSnapshot.forEach(doc => {
                fbTips.push({ id: doc.id, name: doc.data().name });
            });
            
            const existingTipIds = new Set(DB.tips.lev2.map(t => t.id));
            fbTips.forEach(tip => {
                if (!existingTipIds.has(tip.id)) {
                    DB.tips.lev2.push(tip);
                }
            });

            // 최종 데이터를 기반으로 메뉴 목록(lev3) 자동 생성
            const types = {};
            DB.pokemonType.lev2.forEach(type => { types[type.id] = []; });
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                const pkmName = pokemon.name_ko || (pokemon.name && pokemon.name.ko);
                if (pokemon.types && Array.isArray(pokemon.types) && pkmName) {
                    pokemon.types.forEach(typeId => {
                        if (types[typeId]) { types[typeId].push({ id: pokemonId, name: pkmName }); }
                    });
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
    
    initialize();
});