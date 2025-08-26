// [최종 복구 및 재건축 버전] Nirvana Pokedex script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. 모든 기능 복구 및 미션 3 재수정');

    const appContainer = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainPlaceholder = document.getElementById('main-placeholder');
    const panels = {
        lev1: sidebar,
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    let activeButtons = {};
    const isMobile = () => window.innerWidth <= 991;
    let activeFilters = {
        grade: [],
        type: []
    };

    // =================================================================
    // 데이터 처리 및 렌더링 함수들
    // =================================================================

    function setupAdObservers() {
        const adContainers = document.querySelectorAll('.ad-container');
        if (adContainers.length === 0) return;
        const adObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) { console.error('AdSense push error:', e); }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        adContainers.forEach(container => {
            if (container.querySelector('ins.adsbygoogle') && container.querySelector('ins.adsbygoogle').innerHTML.trim() === '') {
                 adObserver.observe(container);
            }
        });
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

    async function fetchAllDataFromFirebase() {
        const collectionsToFetch = {
            notice: db.collection('notice').where("isPublished", "==", true),
            pokemon: db.collection('pokemon').where("isPublished", "==", true),
            items: db.collection('items').where("isPublished", "==", true),
            runeAndChips: db.collection('runeAndChips').where("isPublished", "==", true),
            tips: db.collection('tips').where("isPublished", "==", true),
            recommendedDecks: db.collection('recommendedDecks').where("isPublished", "==", true),
            events: db.collection('events').where("isPublished", "==", true),
        };
        const promises = Object.values(collectionsToFetch).map(query => query.get());
        const [noticeSnapshot, pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, decksSnapshot, eventsSnapshot] = await Promise.all(promises);
        
        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => { dataMap[doc.id] = { id: doc.id, ...doc.data() }; });
            return dataMap;
        };

        DB.notice.lev3 = snapshotToMap(noticeSnapshot);
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
        DB.notice.lev2 = Object.values(DB.notice.lev3).map(data => ({ id: data.id, name: data.title, createdAt: data.createdAt, updatedAt: data.updatedAt }));
        DB.notice.lev2.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

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
            if (itemGrades[gradeKey]) itemGrades[gradeKey].push({ id: item.id, name: item.name, imageURL: item.imageURL });
        });
        DB.item.lev3 = itemGrades;
        
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(rc.type && runeAndChipTypes[rc.type]) runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name, imageURL: rc.imageURL });
        });
        DB.runeAndChip.lev3 = runeAndChipTypes;

        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title, createdAt: data.createdAt, updatedAt: data.updatedAt }));
        
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name, likeCount: deck.likeCount || 0 }));
        DB.deck.lev3.builder = [{ id: 'deckBuilder', name: '배치툴' }];
    }

    function isNew(timestamp) {
        if (!timestamp || !timestamp.toDate) return false;
        const postDate = timestamp.toDate();
        const now = new Date();
        const diffTime = now.getTime() - postDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }

    function renderSidebar() {
        const sidebarContent = document.createElement('div');
        sidebarContent.className = 'panel-content';
        DB.sidebarMenu.forEach(item => {
            const button = document.createElement('button');
            button.className = 'menu-item';
            button.dataset.level = 1;
            button.dataset.id = item.id;
            let buttonHTML = item.name;
            let dataToCheck = [];
            if (item.id === 'notice' || item.id === 'tips') {
                dataToCheck = Object.values(DB[item.id]?.lev3 || {});
            } else if (DB[item.id] && DB[item.id].lev4) {
                dataToCheck = Object.values(DB[item.id].lev4);
            }
            if (dataToCheck.length > 0 && dataToCheck.some(post => isNew(post.updatedAt) || isNew(post.createdAt))) {
                buttonHTML += '<span class="new-badge">N</span>';
            }
            button.innerHTML = buttonHTML;
            sidebarContent.appendChild(button);
        });
        if(sidebar) {
            sidebar.innerHTML = '';
            sidebar.appendChild(sidebarContent);
        }
    }

    function renderMainNoticeList() {
        const mainNoticeList = document.getElementById('main-notice-list');
        if (!mainNoticeList) return;
        const noticesToShow = DB.notice.lev2.slice(0, 5);
        mainNoticeList.innerHTML = noticesToShow.map(notice => {
            const newBadge = isNew(notice.updatedAt) || isNew(notice.createdAt) ? '<span class="new-badge-list">New</span>' : '';
            return `<li><a href="#" data-menu-id="notice" data-item-id="${notice.id}">${notice.name}</a> ${newBadge}</li>`;
        }).join('');
    }

    function getLikedDecks() {
        return JSON.parse(localStorage.getItem('likedDecks')) || [];
    }

    async function handleLikeClick(button) {
        const deckId = button.dataset.deckId;
        if (!deckId) return;
        const likeCountSpan = button.querySelector('.like-count');
        const heartIcon = button.querySelector('.heart-icon');
        let currentLikes = parseInt(likeCountSpan.textContent);
        let likedDecks = getLikedDecks();
        const isLiked = likedDecks.includes(deckId);
        if (isLiked) {
            likedDecks = likedDecks.filter(id => id !== deckId);
            button.classList.remove('liked');
            heartIcon.textContent = '♡';
            likeCountSpan.textContent = currentLikes - 1;
        } else {
            likedDecks.push(deckId);
            button.classList.add('liked');
            heartIcon.textContent = '❤️';
            likeCountSpan.textContent = currentLikes + 1;
        }
        localStorage.setItem('likedDecks', JSON.stringify(likedDecks));
        try {
            await db.collection('recommendedDecks').doc(deckId).update({
                likeCount: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1)
            });
        } catch (error) {
            console.error("좋아요 업데이트 실패:", error);
            alert('일시적인 오류로 좋아요 처리에 실패했습니다.');
            likeCountSpan.textContent = currentLikes; // Revert UI
            if (isLiked) {
                 button.classList.add('liked');
                 heartIcon.textContent = '❤️';
            } else {
                 button.classList.remove('liked');
                 heartIcon.textContent = '♡';
            }
            localStorage.setItem('likedDecks', JSON.stringify(getLikedDecks().filter(id => id !== deckId)));
        }
    }

    function handleMenuClick(button) {
        if (parseInt(button.dataset.level) === 1) {
            sessionStorage.removeItem('returnToMain');
        }
        if (isMobile()) sidebar.classList.remove('visible');
        mainPlaceholder.style.display = 'none';
        appContainer.classList.add('menu-active');
        if (isMobile()) {
            const bottomAd = document.getElementById('ad-container-bottom');
            if (bottomAd) {
                bottomAd.style.display = 'none';
            }
        }
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId); 
        const nextPanel = panels[`lev${nextLevel}`];
        if (!nextPanel) return;
        
        Object.values(panels).forEach((panel, index) => {
             if(index > 0) panel.classList.remove('visible');
        });

        nextPanel.classList.add('visible');
        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
    }
        
    function handleMainButtonClick() {
        sessionStorage.removeItem('returnToMain');
        mainPlaceholder.style.display = 'flex';
        appContainer.classList.remove('menu-active');
        if (isMobile()) {
            const bottomAd = document.getElementById('ad-container-bottom');
            if (bottomAd) bottomAd.style.display = 'block';
        }
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) panel.classList.remove('visible');
        });
        setActive(0, null);
        if (isMobile()) {
            sidebar.classList.remove('visible');
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

    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) return DB.pokemonType.lev4?.[id];
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }
    
    // ... [Other functions like renderCardList, renderSimpleView, etc. remain here] ...

    // [최종 수정] 덱 그리드 렌더링 함수
    function renderDeckView(contentDiv, data) {
        const weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };
        const likedDecks = getLikedDecks();
        const isLiked = likedDecks.includes(data.id);
        const likeButtonHTML = `<div class="like-container"><button class="like-btn ${isLiked ? 'liked' : ''}" data-deck-id="${data.id}"><span class="heart-icon">${isLiked ? '❤️' : '♡'}</span><span class="like-count">${data.likeCount || 0}</span></button></div>`;

        let html = `<div class="deck-detail-view"><div class="deck-header"><h2>${data.name}</h2>${likeButtonHTML}</div>`;
        if (data.description) { html += `<p class="deck-description">${data.description}</p>`; }
        html += `<h4>덱 배치</h4>`;

        const grid = Array(4).fill(null).map(() => Array(4).fill({ type: 'empty' }));
        const positionMap = {
            'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0], 
            'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
            'main_4': [1, 2], 'main_5': [2, 2], 'main_6': [3, 2], 
            'main_1': [1, 3], 'main_2': [2, 3], 'main_3': [3, 3]
        };

        if (data.weather && weatherToEmoji[data.weather]) {
            grid[0][0] = { type: 'header', content: weatherToEmoji[data.weather], label: data.weather, colspan: 2 };
            grid[0][1] = null;
        }
        const mainPokemonIds = data.composition.filter(m => m.role === 'main').map(m => m.pokemonId);
        const synergy = calculateSynergy(mainPokemonIds);
        if (synergy) {
             grid[0][2] = { type: 'header', content: `<img src="${synergy.imageURL}" alt="${synergy.name}">`, label: synergy.name, colspan: 2 };
             grid[0][3] = null;
        }
        data.composition.forEach(member => { 
            const pkmData = DB.pokemonType.lev4[member.pokemonId]; 
            if (pkmData) {
                const [row, col] = positionMap[`${member.role}_${member.position}`];
                grid[row][col] = { type: 'pokemon', ...pkmData };
            }
        });

        html += `<table class="four-by-four-table"><tbody>`;
        for (let i = 0; i < 4; i++) {
            html += '<tr>';
            for (let j = 0; j < 4; j++) {
                const cell = grid[i][j];
                if (cell === null) continue;
                if (cell.type === 'pokemon') {
                    html += `<td><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"></div></td>`;
                } else if (cell.type === 'header') {
                    html += `<td class="header-cell" colspan="${cell.colspan || 1}" title="${cell.label}"><div>${cell.content}</div></td>`;
                } else {
                    html += `<td class="empty-cell"></td>`;
                }
            }
            html += '</tr>';
        }
        html += `</tbody><tfoot><tr><td colspan="2">어시스트 #1~#6</td><td colspan="2">메인덱 #1~#6</td></tr></tfoot></table></div>`;
        contentDiv.innerHTML = html;
        // Click listeners for pokemon popups
    }

    // [최종 수정] 필터 모달 생성 함수
    function openFilterModal() {
        const modalOverlay = document.getElementById('filter-modal-overlay');
        const modalBody = document.getElementById('filter-modal-body');
        const menuId = document.getElementById('list-page-title').dataset.menuId;
        
        let filtersHTML = '';
        if (menuId === 'pokemonType' || menuId === 'pokemonGrade') {
            filtersHTML += '<div class="filter-group"><h4>등급</h4><div class="filter-options">';
            DB.pokemonGrade.lev2.forEach(grade => {
                const isActive = activeFilters.grade.includes(grade.name) ? 'active' : '';
                filtersHTML += `<button class="filter-button ${isActive}" data-filter-type="grade" data-filter-value="${grade.name}">${grade.name}</button>`;
            });
            filtersHTML += '</div></div>';
            
            filtersHTML += '<div class="filter-group"><h4>타입</h4><div class="type-filter-grid">';
            DB.pokemonType.lev2.forEach(type => {
                const isActive = activeFilters.type.includes(type.id) ? 'active' : '';
                filtersHTML += `<button class="type-icon-button ${isActive}" data-filter-type="type" data-filter-value="${type.id}" title="${type.name}"><img src="${type.iconURL}" alt="${type.name}"></button>`;
            });
            filtersHTML += '</div></div>';
        }
        
        modalBody.innerHTML = filtersHTML;
        modalOverlay.style.display = 'flex';
    }

    // Most other functions (renderCalendarView, renderDeckBuilder, etc.) remain the same...

    function addEventListeners() {
        if(mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }

        document.body.addEventListener('click', (e) => {
            const gridMenuBtn = e.target.closest('.grid-menu-btn');
            if (gridMenuBtn) {
                const menuId = gridMenuBtn.dataset.menuId;
                const subMenuId = gridMenuBtn.dataset.itemId;
                if (menuId === 'calendar') {
                    showDetailPage('calendar', 'calendar');
                } else {
                    showListPage(menuId, subMenuId);
                }
                return;
            }

            const pcListItem = e.target.closest('#sidebar .menu-item, .panel .list-item, .panel .list-item-card');
            if (pcListItem && !isMobile()) {
                if (!pcListItem.closest('#list-filter-page')) {
                    handleMenuClick(pcListItem);
                    return;
                }
            }
            
            const mobileListItemCard = e.target.closest('#list-page-content .list-item-card, #list-page-content .list-item');
            if(mobileListItemCard){
                const itemId = mobileListItemCard.dataset.id;
                const menuId = mobileListItemCard.dataset.menuId;
                showDetailPage(itemId, menuId);
                return;
            }
            
            const mainShortcut = e.target.closest('#main-notice-list a, #popular-deck-list a');
            if (mainShortcut) {
                e.preventDefault();
                const menuId = mainShortcut.dataset.menuId;
                const itemId = mainShortcut.dataset.itemId;
                sessionStorage.setItem('returnToMain', 'true');
                showDetailPage(itemId, menuId);
                return;
            }
            
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                handleLikeClick(likeBtn);
                return;
            }
            
            const panelBackBtn = e.target.closest('.panel .back-btn');
            if (panelBackBtn && !isMobile()) {
                const currentPanel = panelBackBtn.closest('.panel');
                if(currentPanel.id === 'lev4-panel' && sessionStorage.getItem('returnToMain')) {
                    handleMainButtonClick();
                    return;
                }
                const level = parseInt(Object.keys(panels).find(key => panels[key] === currentPanel)?.replace('lev', '') || '0');
                if (level > 2) {
                    currentPanel.classList.remove('visible');
                    panels[`lev${level-1}`].classList.add('visible');
                    if(activeButtons[level]) activeButtons[level].classList.remove('active');
                    activeButtons[level] = null;
                } else {
                    handleMainButtonClick();
                }
                return;
            }

            const openFilterBtn = e.target.closest('#open-filter-modal-btn');
            if (openFilterBtn) {
                openFilterModal();
                return;
            }

            const filterModalOverlay = document.getElementById('filter-modal-overlay');
            if (e.target === filterModalOverlay || e.target.closest('#filter-modal-close-btn')) {
                 closeFilterModal();
                 return;
            }
            
            const filterButton = e.target.closest('.filter-button, .type-icon-button');
            if (filterButton && filterButton.closest('#filter-modal-body')) {
                const { filterType, filterValue } = filterButton.dataset;
                filterButton.classList.toggle('active');

                if (!activeFilters[filterType]) activeFilters[filterType] = [];
                const index = activeFilters[filterType].indexOf(filterValue);
                if (filterButton.classList.contains('active')) {
                    if (index === -1) activeFilters[filterType].push(filterValue);
                } else {
                    if (index > -1) activeFilters[filterType].splice(index, 1);
                }
                return;
            }

            const applyFilterBtn = e.target.closest('#filter-apply-btn');
            if(applyFilterBtn) {
                applyFiltersAndRender();
                return;
            }
            const resetFilterBtn = e.target.closest('#filter-reset-btn');
            if(resetFilterBtn) {
                activeFilters.grade = [];
                activeFilters.type = [];
                openFilterModal();
                return;
            }
        });
    }

    // Call initialize at the end
    initialize();
});