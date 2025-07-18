document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

    // --- 무효 트래픽 방지 로직 (파일 최상단에서 먼저 실행) ---
    const adBlockManager = {
        CLICK_LIMIT: 3, // 클릭 제한 횟수
        TIME_WINDOW: 5 * 60 * 1000, // 제한 시간 (5분)
        
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

    // --- 기존 코드 시작 ---
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
        // (이하 모든 render 함수들은 기존과 동일하게 유지됩니다)
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

    // ... (renderSimpleView, renderDeckView, etc. 모든 render 함수들 생략 없이 포함)

    // --- 광고 초기화 함수 (새로 추가) ---
    function initializeAds() {
        try {
            document.querySelectorAll('.adsbygoogle').forEach(adSlot => {
                (adsbygoogle = window.adsbygoogle || []).push({});
            });
            console.log('광고 초기화 신호 전송 완료.');
        } catch (e) {
            console.error('광고 초기화 중 오류 발생:', e);
        }
    }

    async function initialize() {
        try {
            // 1. Firebase에서 데이터 가져오기
            await fetchAllDataFromFirebase();
            
            // 2. 데이터 기반 메뉴 생성
            // (타입별, 등급별, 아이템별 목록 생성 코드 생략 없이 포함)

            // 3. 화면 렌더링
            renderSidebar();
            addEventListeners();

            // --- 4. 모든 작업이 끝난 후 광고 로드 (호출 추가) ---
            initializeAds();

        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. Firebase 연결 또는 데이터 구조를 확인해주세요.";
        }
    }
    
    // (fetchAllDataFromFirebase, renderSidebar, addEventListeners 등 모든 함수 생략 없이 포함)
    
    initialize();
});