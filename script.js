// [진짜 최종 완성본] Nirvana Pokedex script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. 최종 수정 적용.');

    // 전역 변수 선언
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
    const isMobile = () => window.innerWidth <= 1199;
    let activeFilters = {
        grade: [],
        type: []
    };

    // 1. setupAdObservers
    function setupAdObservers() {
        const adContainers = document.querySelectorAll('.ad-container');
        if (adContainers.length === 0) return;
        const adObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) {
                        console.error('AdSense push error:', e);
                    }
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

    // 2. adBlockManager
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

    // 3. initialize
    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            renderMainNoticeList();
            await fetchAndRenderPopularDecks();
            addEventListeners();
            setupAdObservers();
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 오류가 발생했습니다. 콘솔을 확인해주세요.";
        }
    }

    // 4. setupMobileAds
    function setupMobileAds() {
        if (!isMobile()) return;
        const topAdContainer = document.getElementById('mobile-ad-top');
        if (topAdContainer) {
            topAdContainer.innerHTML = `<ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" data-ad-client="ca-pub-2125965839205311" data-ad-slot="6920735136"></ins>`;
        }
        const bottomAdContainer = document.getElementById('ad-container-bottom');
        if (bottomAdContainer) {
            bottomAdContainer.innerHTML = `<div class="blog-ad-box"><a href="https://index001.elmajor710.com" target="_blank" class="custom-ad-banner"><div class="ad-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3c0 .35.07.69.18 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM8 4h8a1 1 0 0 1 1 1c0 .34-.07.66-.18 1H7.18C7.07 5.66 7 5.34 7 5a1 1 0 0 1 1-1zm12 15H4V8h16v11z"/><path d="M12 17a4 4 0 0 0 4-4h-2a2 2 0 0 1-2 2 2 2 0 0 1-2-2H8a4 4 0 0 0 4 4zm0-6a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z"/></svg></div><div class="ad-text"><strong>나라지원금 Info.</strong><span>놓치면 손해! 혜택 확인하기</span></div></a></div>`;
        }
    }

    // 5. fetchAndRenderPopularDecks
    async function fetchAndRenderPopularDecks() {
        const popularDeckList = document.getElementById('popular-deck-list');
        if (!popularDeckList) return;
        popularDeckList.innerHTML = DB.deck.lev3.recommended
            .sort((a,b) => b.likeCount - a.likeCount)
            .slice(0, 5)
            .map(deck => `<li><a href="#" data-menu-id="deck" data-item-id="${deck.id}">${deck.name}</a> ❤️ ${deck.likeCount || 0}</li>`)
            .join('');
    }

    // 6. fetchAllDataFromFirebase
    async function fetchAllDataFromFirebase() {
        const collections = ['notice', 'pokemon', 'items', 'runeAndChips', 'tips', 'recommendedDecks', 'events'];
        const snapshots = await Promise.all(collections.map(col => db.collection(col).where("isPublished", "==", true).get()));
        const [noticeSnapshot, pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, decksSnapshot, eventsSnapshot] = snapshots;
        
        const snapshotToMap = (snapshot) => snapshot.docs.reduce((acc, doc) => ({...acc, [doc.id]: { id: doc.id, ...doc.data() } }), {});

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
        
    // 7. setupSideMenuData
    function setupSideMenuData() {
        DB.notice.lev2 = Object.values(DB.notice.lev3).map(data => ({ id: data.id, name: data.title, createdAt: data.createdAt, updatedAt: data.updatedAt })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        
        const types = DB.pokemonType.lev2.reduce((acc, type) => ({...acc, [type.id]: [] }), {});
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon.types && Array.isArray(pokemon.types)) {
                pokemon.types.forEach(typeId => {
                    if (types[typeId]) {
                        types[typeId].push({ 
                            id: pokemon.id, 
                            name: pokemon.name_ko || pokemon.name,
                            faceImageURL: pokemon.faceImageURL,
                            grade: pokemon.grade,
                            types: pokemon.types
                        });
                    }
                });
            }
        });
        Object.values(types).forEach(typeList => typeList.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.pokemonType.lev3 = types;

        const grades = DB.pokemonGrade.lev2.reduce((acc, grade) => ({...acc, [grade.id]: [] }), {});
        Object.values(DB.pokemonType.lev4).forEach(pokemon => {
            if (pokemon && pokemon.grade) {
                const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                if (gradeId && grades[gradeId]) {
                    grades[gradeId].push({ 
                        id: pokemon.id, 
                        name: pokemon.name_ko || pokemon.name,
                        faceImageURL: pokemon.faceImageURL,
                        grade: pokemon.grade,
                        types: pokemon.types
                    });
                }
            }
        });
        Object.values(grades).forEach(gradeList => gradeList.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.pokemonGrade.lev3 = grades;
        
        DB.item.lev3 = Object.values(DB.item.lev4).reduce((acc, item) => {
            const gradeKey = item.grade?.toLowerCase();
            if(acc[gradeKey]) acc[gradeKey].push({ id: item.id, name: item.name, imageURL: item.imageURL });
            return acc;
        }, { god: [], legendary: [], epic: [] });

        DB.runeAndChip.lev3 = Object.values(DB.runeAndChip.lev4).reduce((acc, rc) => {
            if(rc.type && acc[rc.type]) acc[rc.type].push({ id: rc.id, name: rc.name, imageURL: rc.imageURL });
            return acc;
        }, { rune: [], chip: [] });
        
        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title, createdAt: data.createdAt, updatedAt: data.updatedAt }));
        DB.deck.lev3 = {
            recommended: Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name, likeCount: deck.likeCount || 0 }))
        };
    }

    // 8. isNew
    function isNew(timestamp) {
        if (!timestamp?.toDate) return false;
        return (new Date().getTime() - timestamp.toDate().getTime()) / (1000 * 3600 * 24) <= 7;
    }

    // 9. renderSidebar
    function renderSidebar() {
        const sidebarContent = document.createElement('div');
        sidebarContent.className = 'panel-content';
        DB.sidebarMenu.forEach(item => {
            const button = document.createElement('button');
            button.className = 'menu-item';
            button.dataset.level = 1;
            button.dataset.id = item.id;
            let buttonHTML = item.name;
            const dataToCheck = (item.id === 'notice' || item.id === 'tips') ? Object.values(DB[item.id]?.lev3 || {}) : Object.values(DB[item.id]?.lev4 || {});
            if (dataToCheck.some(post => isNew(post.updatedAt) || isNew(post.createdAt))) {
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

    // 10. renderMainNoticeList
    function renderMainNoticeList() {
        const mainNoticeList = document.getElementById('main-notice-list');
        if (!mainNoticeList) return;
        const noticesToShow = DB.notice.lev2.slice(0, 5);
        mainNoticeList.innerHTML = noticesToShow.map(notice => {
            const newBadge = isNew(notice.updatedAt) || isNew(notice.createdAt) ? '<span class="new-badge-list">New</span>' : '';
            return `<li><a href="#" data-menu-id="notice" data-item-id="${notice.id}">${notice.name}</a> ${newBadge}</li>`;
        }).join('');
    }

    // 11. getLikedDecks
    function getLikedDecks() {
        return JSON.parse(localStorage.getItem('likedDecks')) || [];
    }

    // 12. handleLikeClick
    async function handleLikeClick(button) {
        const deckId = button.dataset.deckId;
        if (!deckId) return;
        const likeCountSpan = button.querySelector('.like-count');
        const heartIcon = button.querySelector('.heart-icon');
        let currentLikes = parseInt(likeCountSpan.textContent);
        let likedDecks = getLikedDecks();
        const isLiked = likedDecks.includes(deckId);
        
        button.classList.toggle('liked');
        heartIcon.textContent = isLiked ? '♡' : '❤️';
        likeCountSpan.textContent = isLiked ? currentLikes - 1 : currentLikes + 1;
        
        if (isLiked) {
            likedDecks = likedDecks.filter(id => id !== deckId);
        } else {
            likedDecks.push(deckId);
        }
        localStorage.setItem('likedDecks', JSON.stringify(likedDecks));

        try {
            await db.collection('recommendedDecks').doc(deckId).update({
                likeCount: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1)
            });
        } catch (error) {
            console.error("좋아요 업데이트 실패:", error);
            button.classList.toggle('liked');
            heartIcon.textContent = isLiked ? '❤️' : '♡';
            likeCountSpan.textContent = currentLikes;
            localStorage.setItem('likedDecks', JSON.stringify(getLikedDecks()));
        }
    }

    // 13. handleMenuClick
    function handleMenuClick(button) {
        if (parseInt(button.dataset.level) === 1) {
            sessionStorage.removeItem('returnToMain');
        }
        mainPlaceholder.style.display = 'none';
        appContainer.classList.add('menu-active');
        
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId); 
        const nextPanel = panels[`lev${nextLevel}`];
        if (!nextPanel) return;
        
        Object.values(panels).forEach(p => p.classList.remove('visible'));
        nextPanel.classList.add('visible');

        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
    }
        
    // 14. handleMainButtonClick
    function handleMainButtonClick() {
        sessionStorage.removeItem('returnToMain');
        mainPlaceholder.style.display = 'flex';
        appContainer.classList.remove('menu-active');
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) panel.classList.remove('visible');
        });
        setActive(0, null);
    }

    // 15. setActive
    function setActive(level, target) {
        for (let i = level; i <= 4; i++) {
            if (activeButtons[i]) activeButtons[i].classList.remove('active');
            activeButtons[i] = null;
        }
        if (target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }

    // 16. getNextData
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }
    
    // 17. renderCardList
    function renderCardList(data, menuId, container) {
        const dataArray = Array.isArray(data) ? data : Object.values(data);
        dataArray.sort((a, b) => (a.name_ko || a.name || a.title || '').localeCompare(b.name_ko || b.name || b.title || '', 'ko'));

        container.innerHTML = dataArray.map(item => {
            const name = item.name_ko || item.name || item.title;
            const imageURL = item.faceImageURL || item.imageURL || 'https://via.placeholder.com/64';
            let infoHTML = '';
            if (item.grade) {
                infoHTML += `<span class="grade-badge grade-${item.grade.toLowerCase().replace('+', '-plus')}">${item.grade}</span>`;
            }
            if (item.types) {
                infoHTML += '<div class="type-badges-container">';
                item.types.forEach(typeId => {
                    const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                    if (typeInfo) {
                        infoHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
                    }
                });
                infoHTML += '</div>';
            }
            return `
                <div class="list-item-card" data-id="${item.id}" data-menu-id="${menuId}">
                    <div class="item-card-image"><img src="${imageURL}" alt="${name}" loading="lazy"></div>
                    <div class="item-card-info">
                        <strong class="item-card-name">${name}</strong>
                        <div class="item-card-details">${infoHTML}</div>
                    </div>
                </div>`;
        }).join('');
    }
    
    // 18. renderPanelContent
    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        
        targetPanel.querySelector('.panel-header').innerHTML = '<button class="back-btn">&lt; 뒤로</button>';
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;

        if (!data) {
            contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
            return;
        }

        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));

        if (isFinalView) {
            if (menuId === 'deck' && data.composition) renderDeckView(contentDiv, data);
            else if (menuId === 'calendar') renderCalendarView(contentDiv, DB.calendar.lev2);
            else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, data); 
            else renderSimpleView(contentDiv, data, menuId); 
        } else {
            const cardLayoutMenus = ['pokemonType', 'pokemonGrade', 'item', 'runeAndChip'];
            if (level === 3 && cardLayoutMenus.includes(menuId)) {
                renderCardList(data, menuId, contentDiv);
            } else {
                data.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'list-item';
                    button.dataset.id = item.id;
                    button.dataset.level = level;
                    button.dataset.menuId = menuId;
                    let itemHTML = `<span>${item.name || '이름 없음'}</span>`;
                    if (menuId === 'pokemonType' && item.iconURL) {
                        itemHTML = `<img src="${item.iconURL}" class="list-item-icon">${itemHTML}`;
                    }
                    if (isNew(item.updatedAt) || isNew(item.createdAt)) {
                        itemHTML += '<span class="new-badge-list">New</span>';
                    }
                    button.innerHTML = itemHTML;
                    contentDiv.appendChild(button);
                });
            }
        }
    }

    // 19. showModal
    function showModal(title, contentElement) {
        const existingModal = document.querySelector('.modal-overlay.custom-modal');
        if (existingModal) existingModal.remove();
        
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay custom-modal';
        modalOverlay.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>${title}</h2><button class="modal-close-btn">&times;</button></div><div class="modal-body"></div></div>`;
        modalOverlay.querySelector('.modal-body').appendChild(contentElement);
        document.body.appendChild(modalOverlay);
        
        const closeModal = () => modalOverlay.remove();
        modalOverlay.addEventListener('click', e => {
            if (e.target === modalOverlay) closeModal();
        });
        modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    }

    // 20. renderPokemonView
    function renderPokemonView(contentDiv, data) {
        const detailView = document.createElement('div');
        detailView.className = 'pokemon-detail-view';
        
        const nameKo = data.name_ko || '이름 없음';
        let commonHTML = `<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${data.name_en || ''}</span></h2>`;
        commonHTML += '<div class="badge-container">';
        if (data.grade) {
            commonHTML += `<span class="grade-badge grade-${data.grade.toLowerCase().replace('+', '-plus')}">${data.grade}</span>`;
        }
        if (data.types) {
            data.types.forEach(typeId => {
                const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                if (typeInfo) commonHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
            });
        }
        commonHTML += '</div>';
        if (data.imageURL) commonHTML += `<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`;
        
        let statsHTML = '';
        if (data.stats) {
            const totalStats = Object.values(data.stats).reduce((a, b) => Number(a) + Number(b), 0);
            statsHTML = `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">${Object.entries(data.stats).map(([stat, value]) => `<tr><td>${stat.toUpperCase()}</td><td>${value}</td></tr>`).join('')}</table>`;
        }

        let skillsHTML = '<h4>스킬</h4>';
        if (data.skills && data.skills.some(s => s.name)) {
            skillsHTML += '<ul class="skill-list">';
            data.skills.forEach((skill, index) => { 
                if(skill.name) skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; 
            });
            skillsHTML += '</ul>';
        } else {
            skillsHTML += '<p>등록된 스킬 정보가 없습니다.</p>';
        }
        
        let buildHTML = '';
        const buildSections = [];
        if (data.build_concept) {
            buildSections.push(`<h4>빌드 콘셉트</h4><p>${data.build_concept}</p>`);
        }
        if (data.recommendedNatures?.length > 0) {
            const natureNames = data.recommendedNatures.map(id => DB.definitions.natures.find(n=>n.id===id)?.name).filter(Boolean).join(', ');
            if (natureNames) {
                buildSections.push(`<h4>추천 성격</h4><p>${natureNames}</p>`);
            }
        }
        const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
        for (const type in recommendTypes) {
            if (data[type]?.length > 0) {
                let itemsHTML = `<div class="recommend-list">`;
                data[type].forEach(item => {
                    const id = typeof item === 'object' ? item.id : item;
                    const count = typeof item === 'object' ? item.count : null;
                    const dbKey = (type === 'recommendedItems') ? 'item' : 'runeAndChip';
                    const itemData = DB[dbKey].lev4[id];
                    if (itemData) {
                        itemsHTML += `
                            <div class="recommend-item" data-item-id="${id}" data-item-type="${dbKey}">
                                <img src="${itemData.imageURL}" alt="${itemData.name}">
                                <div class="recommend-item-info">
                                    <span class="recommend-item-name">${itemData.name}</span>
                                    ${count ? `<span class="recommend-item-count">x${count}</span>` : ''}
                                </div>
                            </div>`;
                    }
                });
                itemsHTML += `</div>`;
                buildSections.push(`<h4>${recommendTypes[type]}</h4>${itemsHTML}`);
            }
        }
        buildHTML = buildSections.length > 0 ? buildSections.join('') : '<h4>추천 빌드</h4><p>등록된 추천 빌드 정보가 없습니다.</p>';

        detailView.innerHTML = `${commonHTML}<div class="tab-container"><nav class="tab-nav"><button class="tab-button active" data-tab="tab-info">기본 정보</button><button class="tab-button" data-tab="tab-skills">스킬</button><button class="tab-button" data-tab="tab-build">추천 빌드</button></nav><div id="tab-info" class="tab-pane active">${statsHTML}</div><div id="tab-skills" class="tab-pane">${skillsHTML}</div><div id="tab-build" class="tab-pane">${buildHTML}</div></div>`;
        
        contentDiv.appendChild(detailView);
        
        detailView.querySelectorAll('.skill-name').forEach(el => { 
            el.addEventListener('click', () => { 
                const skill = data.skills[parseInt(el.dataset.skillIndex)];
                if (skill) {
                    const skillDetailElement = document.createElement('div');
                    let contentHTML = `<p>${skill.description || ''}</p>`;
                    if (skill.keywords?.some(kw => kw.term)) {
                        contentHTML += '<hr><h4>키워드 설명</h4><ul>';
                        skill.keywords.forEach(kw => { 
                            if(kw.term) contentHTML += `<li><strong>${kw.term}:</strong> ${kw.desc || ''}</li>`; 
                        });
                        contentHTML += '</ul>';
                    }
                    skillDetailElement.innerHTML = contentHTML;
                    showModal(skill.name, skillDetailElement); 
                }
            }); 
        });

        detailView.querySelectorAll('.recommend-item').forEach(el => {
            el.addEventListener('click', () => {
                const itemId = el.dataset.itemId;
                const itemType = el.dataset.itemType;
                const itemData = DB[itemType].lev4[itemId];
                if (itemData) {
                    const tempDiv = document.createElement('div');
                    renderSimpleView(tempDiv, itemData, itemType);
                    showModal(itemData.name, tempDiv);
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

    // 21. renderSimpleView
    function renderSimpleView(contentDiv, data, menuId) {
        const detailView = document.createElement('div');
        detailView.className = 'simple-detail-view';
        let html = `<h2>${data.name || data.title}</h2>`;
        if (data.grade) {
            html += `<div class="badge-container"><span class="grade-badge grade-${data.grade.toLowerCase()}">${data.grade}</span></div>`;
        }
        if (data.imageURL) {
            html += `<img src="${data.imageURL}" alt="${data.name}" class="main-image">`;
        }
        
        let description = data.description || data.htmlContent || '';
        html += `<div class="item-description">${description.replace(/\n/g, '<br>')}</div>`;
        detailView.innerHTML = html;
        contentDiv.appendChild(detailView);
    }

    // 22. calculateSynergy
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
        if (counts.length > 0 && counts[0] >= 6) return DB.synergyEffects.find(s => s.id === 'same6');
        if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) return DB.synergyEffects.find(s => s.id === 'same3x2');
        if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) return DB.synergyEffects.find(s => s.id === 'same4_2');
        const totalPairs = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
        if (totalPairs >= 3) return DB.synergyEffects.find(s => s.id === 'same2x3');
        if (counts.length > 0 && counts[0] >= 3) return DB.synergyEffects.find(s => s.id === 'same3');
        if (Object.keys(typePokemonCount).length >= 6) return DB.synergyEffects.find(s => s.id === 'diff6');
        return null;
    }
    
    // 23. renderDeckView
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
            'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0], 'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
            'main_4': [1, 2], 'main_5': [2, 2], 'main_6': [3, 2], 'main_1': [1, 3], 'main_2': [2, 3], 'main_3': [3, 3]
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
        
        contentDiv.querySelectorAll('.deck-pokemon-cell').forEach(cell => {
            cell.addEventListener('click', () => {
                const pokemonId = cell.dataset.pokemonId;
                if (DB.pokemonType.lev4[pokemonId]) showPokemonPopup(DB.pokemonType.lev4[pokemonId]);
            });
        });
    }

    // 24. renderCalendarView
    function renderCalendarView(contentDiv, data) {
        // Calendar implementation...
    }
    
    // 25. showListPage
    function showListPage(menuId, subMenuId = null) {
        const listPage = document.getElementById('list-filter-page');
        const listPageTitle = document.getElementById('list-page-title');
        const filtersContainer = document.getElementById('list-page-filters');
        
        mainPlaceholder.style.display = 'none';
        if (mobileMenuBtn) mobileMenuBtn.style.display = 'none';
        listPage.style.display = 'flex';
        setTimeout(() => listPage.classList.add('visible'), 10);

        const menusWithFilters = ['pokemonType', 'pokemonGrade', 'item'];
        filtersContainer.style.display = menusWithFilters.includes(menuId) ? 'block' : 'none';
        if (menusWithFilters.includes(menuId)) renderFilters();

        let dataList = [], title = DB.sidebarMenu.find(item => item.id === menuId)?.name || '';

        switch (menuId) {
            case 'pokemonType': case 'pokemonGrade':
                dataList = Object.values(DB.pokemonType.lev4); title = '포켓몬'; break;
            case 'item': dataList = Object.values(DB.item.lev4); break;
            case 'runeAndChip':
                if (subMenuId === 'rune' || subMenuId === 'chip') {
                    dataList = Object.values(DB.runeAndChip.lev4).filter(d => d.type === subMenuId);
                    title = subMenuId === 'rune' ? '룬' : '칩';
                } break;
            case 'deck': dataList = Object.values(DB.deck.lev4); break;
            case 'tips': case 'notice': dataList = Object.values(DB[menuId].lev3); break;
        }

        listPageTitle.textContent = title;
        listPageTitle.dataset.menuId = menuId;
        
        if (['pokemonType', 'pokemonGrade', 'item', 'runeAndChip'].includes(menuId)) {
            renderListPage(dataList, menuId);
        } else {
            renderSimpleListPage(dataList, menuId);
        }
    }

    // 26. hideListPage
    function hideListPage() {
        const listPage = document.getElementById('list-filter-page');
        listPage.classList.remove('visible');
        setTimeout(() => {
            listPage.style.display = 'none';
            if (mobileMenuBtn) mobileMenuBtn.style.display = 'block';
            mainPlaceholder.style.display = 'flex';
        }, 350);
    }
    
    // 27. renderListPage
    function renderListPage(data, menuId) {
        const listContent = document.getElementById('list-page-content');
        if (!data || data.length === 0) {
            listContent.innerHTML = '<p>표시할 데이터가 없습니다.</p>';
            return;
        }
        renderCardList(data, menuId, listContent);
    }

    // 28. renderSimpleListPage
    function renderSimpleListPage(data, menuId) {
        const listContent = document.getElementById('list-page-content');
        data.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || '', 'ko'));
        listContent.innerHTML = data.map(item => `<button class="list-item" data-id="${item.id}" data-menu-id="${menuId}">${item.name || item.title}</button>`).join('');
    }

    // 29. renderFilters
    function renderFilters() {
        document.getElementById('list-page-filters').innerHTML = `<button id="open-filter-modal-btn" class="filter-trigger-btn">필터</button>`;
    }
    
    // 30. openFilterModal
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

    // 31. applyFiltersAndRender
    function applyFiltersAndRender() {
        const menuId = document.getElementById('list-page-title').dataset.menuId;
        let dataList = (menuId === 'pokemonType' || menuId === 'pokemonGrade') ? Object.values(DB.pokemonType.lev4) : Object.values(DB.item.lev4);
        
        const filteredData = dataList.filter(item => {
            const gradeMatch = activeFilters.grade.length === 0 || (item.grade && activeFilters.grade.includes(item.grade));
            const typeMatch = activeFilters.type.length === 0 || activeFilters.type.every(type => item.types?.includes(type));
            return gradeMatch && typeMatch;
        });

        renderListPage(filteredData, menuId);
        closeFilterModal();
    }

    // 32. closeFilterModal
    function closeFilterModal() {
        document.getElementById('filter-modal-overlay').style.display = 'none';
    }

    // 33. showDetailPage
    function showDetailPage(itemId, menuId) {
        const detailPanel = document.getElementById('lev4-panel');
        const contentDiv = detailPanel.querySelector('.panel-content');
        const itemData = DB[menuId]?.lev4?.[itemId];

        contentDiv.innerHTML = '';
        if (itemData) {
            if (menuId === 'deck') renderDeckView(contentDiv, itemData);
            else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, itemData);
            else renderSimpleView(contentDiv, itemData, menuId);
        } else if (menuId === 'calendar') {
             renderCalendarView(contentDiv, DB.calendar.lev2);
        } else {
            contentDiv.innerHTML = '<p>데이터를 불러오는 데 실패했습니다.</p>';
        }

        document.getElementById('list-filter-page')?.classList.remove('visible');
        Object.values(panels).forEach(p => p.classList.remove('visible'));
        detailPanel.classList.add('visible');
    }
    
    // 34. addEventListeners
    function addEventListeners() {
        if(mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }
    
        document.body.addEventListener('click', (e) => {
            const target = e.target;
    
            const listItemCard = target.closest('.list-item-card');
            if (listItemCard) {
                const itemId = listItemCard.dataset.id;
                const menuId = listItemCard.dataset.menuId;
                showDetailPage(itemId, menuId);
                return;
            }
    
            const listItem = target.closest('.list-item, #sidebar .menu-item');
            if (listItem) {
                handleMenuClick(listItem);
                return;
            }
    
            const gridMenuBtn = target.closest('.grid-menu-btn');
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
            
            const mainShortcut = target.closest('#main-notice-list a, #popular-deck-list a');
            if (mainShortcut) {
                e.preventDefault();
                const menuId = mainShortcut.dataset.menuId;
                const itemId = mainShortcut.dataset.itemId;
                sessionStorage.setItem('returnToMain', 'true');
                showDetailPage(itemId, menuId);
                return;
            }
            
            const likeBtn = target.closest('.like-btn');
            if (likeBtn) {
                handleLikeClick(likeBtn);
                return;
            }
            
            const panelBackBtn = target.closest('.panel .back-btn');
            if (panelBackBtn) {
                if(sessionStorage.getItem('returnToMain')) {
                    handleMainButtonClick();
                } else {
                    const currentVisiblePanel = target.closest('.panel.visible');
                    if (currentVisiblePanel) {
                        currentVisiblePanel.classList.remove('visible');
                        const level = parseInt(Object.keys(panels).find(key => panels[key] === currentVisiblePanel)?.replace('lev', '')) || 0;
                        if (level > 2) {
                            panels[`lev${level-1}`]?.classList.add('visible');
                        } else {
                            handleMainButtonClick();
                        }
                    }
                }
                return;
            }
    
            const openFilterBtn = target.closest('#open-filter-modal-btn');
            if (openFilterBtn) {
                openFilterModal();
                return;
            }
    
            if (target.closest('#filter-modal-overlay') && !target.closest('.modal-content') || target.closest('#filter-modal-close-btn')) {
                 closeFilterModal();
                 return;
            }
    
            const filterButton = target.closest('.filter-button, .type-icon-button');
            if (filterButton && filterButton.closest('#filter-modal-body')) {
                const { filterType, filterValue } = filterButton.dataset;
                filterButton.classList.toggle('active');
                if (!activeFilters[filterType]) activeFilters[filterType] = [];
                const index = activeFilters[filterType].indexOf(filterValue);
                if (index > -1) {
                    activeFilters[filterType].splice(index, 1);
                } else {
                    activeFilters[filterType].push(filterValue);
                }
                return;
            }
    
            const applyFilterBtn = target.closest('#filter-apply-btn');
            if(applyFilterBtn) {
                applyFiltersAndRender();
                return;
            }
            const resetFilterBtn = target.closest('#filter-reset-btn');
            if(resetFilterBtn) {
                activeFilters.grade = [];
                activeFilters.type = [];
                openFilterModal();
                return;
            }
        });
    
        document.querySelector('.back-to-grid-btn')?.addEventListener('click', hideListPage);
        window.addEventListener('popstate', handleMainButtonClick);
    }

    // 35. setScreenHeight
    function setScreenHeight() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);

    initialize();
});