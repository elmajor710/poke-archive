// [최종 수정 완료] Nirvana Pokedex script.js - index.html 구조에 완벽히 맞춤
document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 좋아요 기능 추가');

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

    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            renderMainNoticeList();
            fetchAndRenderPopularDecks(); 
            setupMobileAds();
            addEventListeners();
            setupAdObservers();
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다.";
        }
    }

    function setupMobileAds() {
        if (!isMobile()) return;

        const topAdContainer = document.getElementById('mobile-ad-top');
        if (topAdContainer) {
            topAdContainer.innerHTML = `
                <ins class="adsbygoogle"
                     style="display:block; text-align:center;"
                     data-ad-layout="in-article"
                     data-ad-format="fluid"
                     data-ad-client="ca-pub-2125965839205311"
                     data-ad-slot="6920735136"></ins>
            `;
        }

        const bottomAdContainer = document.getElementById('ad-container-bottom');
        if (bottomAdContainer) {
            bottomAdContainer.innerHTML = `
                <div class="blog-ad-box">
                    <a href="https://index001.elmajor710.com" target="_blank" class="custom-ad-banner">
                        <div class="ad-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3c0 .35.07.69.18 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM8 4h8a1 1 0 0 1 1 1c0 .34-.07.66-.18 1H7.18C7.07 5.66 7 5.34 7 5a1 1 0 0 1 1-1zm12 15H4V8h16v11z"/><path d="M12 17a4 4 0 0 0 4-4h-2a2 2 0 0 1-2 2 2 2 0 0 1-2-2H8a4 4 0 0 0 4 4zm0-6a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z"/></svg>
                        </div>
                        <div class="ad-text">
                            <strong>나라지원금 Info.</strong>
                            <span>놓치면 손해! 혜택 확인하기</span>
                        </div>
                    </a>
                </div>
            `;
        }
    }

    async function fetchAndRenderPopularDecks() {
        const popularDeckList = document.getElementById('popular-deck-list');
        if (!popularDeckList) return;
        try {
            popularDeckList.innerHTML = '<li>데이터를 불러오는 중...</li>';
            const snapshot = await db.collection('recommendedDecks')
                .where("isPublished", "==", true)
                .orderBy('likeCount', 'desc')
                .limit(5)
                .get();
            if (snapshot.empty) {
                popularDeckList.innerHTML = '<li>아직 인기글이 없습니다.</li>';
                return;
            }
            const decksHTML = snapshot.docs.map(doc => {
                const deck = { id: doc.id, ...doc.data() };
                return `<li><a href="#" data-menu-id="deck" data-item-id="${deck.id}">${deck.name}</a> ❤️ ${deck.likeCount || 0}</li>`;
            }).join('');
            popularDeckList.innerHTML = decksHTML;
        } catch (error) {
            console.error("인기글 데이터를 불러오는 중 오류 발생:", error);
            popularDeckList.innerHTML = '<li>오류가 발생했습니다.</li>';
        }
    }

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
        DB.notice.lev2 = Object.values(DB.notice.lev3).map(data => ({ 
            id: data.id, 
            name: data.title,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        }));
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
        
        const gradeOrder = { 'god': 1, 'legendary': 2, 'epic': 3 };
        if (DB.item && DB.item.lev2 && Array.isArray(DB.item.lev2)) {
            DB.item.lev2.sort((a, b) => (gradeOrder[a.id] || 99) - (gradeOrder[b.id] || 99));
        }
        
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(rc.type && runeAndChipTypes[rc.type]) runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name, imageURL: rc.imageURL });
        });
        DB.runeAndChip.lev3 = runeAndChipTypes;

        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ 
            id: data.id, 
            name: data.name || data.title,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        }));
        
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
            if (dataToCheck.length > 0) {
                const hasNewPost = dataToCheck.some(post => isNew(post.updatedAt) || isNew(post.createdAt));
                if (hasNewPost) {
                    buttonHTML += '<span class="new-badge">N</span>';
                }
            }
            button.innerHTML = buttonHTML;
            sidebarContent.appendChild(button);
        });
        const adContainer = document.createElement('div');
        adContainer.id = 'sidebar-ad-container';
        adContainer.innerHTML = `
            <div class="blog-ad-box">
                <a href="https://index001.elmajor710.com" target="_blank" class="custom-ad-banner">
                    <div class="ad-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3c0 .35.07.69.18 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM8 4h8a1 1 0 0 1 1 1c0 .34-.07.66-.18 1H7.18C7.07 5.66 7 5.34 7 5a1 1 0 0 1 1-1zm12 15H4V8h16v11z"/><path d="M12 17a4 4 0 0 0 4-4h-2a2 2 0 0 1-2 2 2 2 0 0 1-2-2H8a4 4 0 0 0 4 4zm0-6a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z"/></svg>
                    </div>
                    <div class="ad-text">
                        <strong>나라지원금 Info.</strong>
                        <span>놓치면 손해! 혜택 확인하기</span>
                    </div>
                </a>
            </div>
        `;
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
            likeCountSpan.textContent = currentLikes;
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
        // ▼▼▼ [수정] 스마트 뒤로가기 상태를 초기화하는 로직 ▼▼▼
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
        
    function handleMainButtonClick() {
        sessionStorage.removeItem('returnToMain');
        mainPlaceholder.style.display = 'flex';
        appContainer.classList.remove('menu-active');
        if (isMobile()) {
            const bottomAd = document.getElementById('ad-container-bottom');
            if (bottomAd) bottomAd.style.display = 'block';
        }
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) panel.classList.remove('visible', 'is-hidden');
        });
        setActive(0, null);
        if (isMobile()) {
            sidebar.classList.remove('visible', 'is-hidden');
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
        if (nextLevel === 3) {
            if (menuId === 'notice' || menuId === 'tips') return DB[menuId]?.lev3?.[id];
            return DB[menuId]?.lev3?.[id];
        }
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }

    function renderCardList(data, menuId, container) {
        const dataArray = Array.isArray(data) ? data : Object.values(data);

        dataArray.sort((a, b) => {
            const nameA = a.name_ko || a.name || a.title || '';
            const nameB = b.name_ko || b.name || b.title || '';
            return nameA.localeCompare(nameB, 'ko');
        });

        const listHTML = dataArray.map(item => {
            const name = item.name_ko || item.name || item.title;
            const imageURL = item.faceImageURL || item.imageURL || 'https://via.placeholder.com/64';
            
            let infoHTML = '';
            if (item.grade) {
                const gradeClass = `grade-${item.grade.toLowerCase().replace('+', '-plus')}`;
                infoHTML += `<span class="grade-badge ${gradeClass}">${item.grade}</span>`;
            }
            if (item.types && item.types.length > 0) {
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
                <div class="list-item-card" data-id="${item.id}" data-menu-id="${menuId}" data-level="3">
                    <div class="item-card-image">
                        <img src="${imageURL}" alt="${name}" loading="lazy">
                    </div>
                    <div class="item-card-info">
                        <strong class="item-card-name">${name}</strong>
                        <div class="item-card-details">${infoHTML}</div>
                    </div>
                </div>
            `;
        }).join('');
        container.innerHTML = listHTML;
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        
        const panelHeader = targetPanel.querySelector('.panel-header');
        panelHeader.innerHTML = '<button class="back-btn">&lt; 뒤로</button>';

        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;

        if (clickedId === 'deckBuilder') {
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
                if (menuId === 'deck' && data.composition) renderDeckView(contentDiv, data);
                else if(menuId === 'calendar') renderCalendarView(contentDiv, DB.calendar.lev2);
                else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, data, menuId); 
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
                        const newBadge = isNew(item.updatedAt) || isNew(item.createdAt) ? '<span class="new-badge-list">New</span>' : '';
                        button.innerHTML = itemHTML + newBadge;
                        contentDiv.appendChild(button);
                    });
                }
            }
        }
    }

    function showModal(title, contentElement) {
        const existingModal = document.querySelector('.modal-overlay.custom-modal');
        if (existingModal) {
            existingModal.remove();
        }
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay custom-modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = `<h2>${title}</h2><button class="modal-close-btn">&times;</button>`;
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.appendChild(contentElement);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        const closeModal = () => modalOverlay.remove();
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        modalContent.querySelector('.modal-close-btn').addEventListener('click', closeModal);
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
        const recommendTypes = { 
            recommendedItems: '추천 아이템', 
            recommendedRunes: '추천 룬', 
            recommendedChips: '추천 칩' 
        };

        for (const type in recommendTypes) {
            if (data[type] && data[type].length > 0) {
                hasBuildInfo = true;
                buildHTML += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;

                data[type].forEach(item => {
                    const isObject = typeof item === 'object' && item !== null;
                    const id = isObject ? item.id : item;
                    const count = isObject ? item.count : null;

                    const dbKey = (type === 'recommendedRunes' || type === 'recommendedChips') ? 'runeAndChip' : 'item';
                    const itemData = DB[dbKey]?.lev4?.[id];

                    if (itemData) {
                        const countHTML = count ? `<span class="recommend-item-count">x${count}</span>` : '';
                        buildHTML += `
                            <div class="recommend-item" data-item-id="${id}" data-item-type="${dbKey}">
                                ${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}
                                <div class="recommend-item-info">
                                    <span class="recommend-item-name">${itemData.name}</span>
                                    ${countHTML}
                                </div>
                            </div>`;
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
                    const skillDetailElement = document.createElement('div');
                    let contentHTML = `<p>${skill.description || ''}</p>`;
                    if (skill.keywords && skill.keywords.length > 0 && skill.keywords.some(kw => kw.term)) {
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
                const dbKey = el.dataset.itemType;
                const itemData = DB[dbKey]?.lev4?.[itemId];
                if (itemData) {
                    const tempContentDiv = document.createElement('div');
                    renderSimpleView(tempContentDiv, itemData, dbKey);
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
        let description = data.description || data.htmlContent || '';
        if (menuId === 'tips' || menuId === 'notice') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const paragraphs = tempDiv.querySelectorAll('p');
            paragraphs.forEach(p => {
                const text = p.textContent || p.innerText;
                if (text.includes('[TIP]')) {
                    p.innerHTML = p.innerHTML.replace('[TIP]', '');
                    const wrapper = document.createElement('div');
                    wrapper.className = 'tip-box';
                    p.parentNode.insertBefore(wrapper, p);
                    wrapper.appendChild(p);
                } else if (text.includes('[주의]')) {
                    p.innerHTML = p.innerHTML.replace('[주의]', '');
                    const wrapper = document.createElement('div');
                    wrapper.className = 'warning-box';
                    p.parentNode.insertBefore(wrapper, p);
                    wrapper.appendChild(p);
                }
            });
            description = tempDiv.innerHTML;
        }
        let tabNames = [];
        let separator = '';
        if (menuId === 'item') {
            tabNames = ['기본 능력치', '소지 효과'];
            separator = '[소지 효과]';
        } else if (menuId === 'runeAndChip') {
            tabNames = ['세트효과', '타입별 조합'];
            separator = '[타입별 조합]';
        }
        const createStructuredContent = (text) => {
            const lines = text.trim().split('\n');
            let structuredHtml = '<div class="structured-content">';
            let currentDescription = '';
            const flushDescription = () => {
                if (currentDescription) {
                    structuredHtml += `<div class="description-text">${currentDescription.trim().replace(/\n/g, '<br>')}</div>`;
                    currentDescription = '';
                }
            };
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                    flushDescription();
                    const subtitle = trimmedLine.substring(1, trimmedLine.length - 1);
                    structuredHtml += `<h4 class="content-subtitle">${subtitle}</h4>`;
                } else {
                    currentDescription += line + '\n';
                }
            });
            flushDescription();
            structuredHtml += '</div>';
            return structuredHtml;
        };
        if (tabNames.length > 0 && description.includes(separator)) {
            const parts = description.split(separator);
            const tab1Content = createStructuredContent(parts[0]); 
            const tab2RawContent = parts.slice(1).join(separator).trim();
            const tab2Content = createStructuredContent(tab2RawContent);
            html += `
                <div class="tab-container">
                    <nav class="tab-nav">
                        <button class="tab-button active" data-tab="tab-1">${tabNames[0]}</button>
                        <button class="tab-button" data-tab="tab-2">${tabNames[1]}</button>
                    </nav>
                    <div id="tab-1" class="tab-pane active item-description">${tab1Content}</div>
                    <div id="tab-2" class="tab-pane item-description">${tab2Content}</div>
                </div>`;
            detailView.innerHTML = html;
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
        const likedDecks = getLikedDecks();
        const isLiked = likedDecks.includes(data.id);
        const likeButtonHTML = `
            <div class="like-container">
                <button class="like-btn ${isLiked ? 'liked' : ''}" data-deck-id="${data.id}">
                    <span class="heart-icon">${isLiked ? '❤️' : '♡'}</span>
                    <span class="like-count">${data.likeCount || 0}</span>
                </button>
            </div>
        `;

        let html = `<div class="deck-detail-view"><div class="deck-header"><h2>${data.name}</h2>${likeButtonHTML}</div>`;
        if (data.description) { html += `<p class="deck-description">${data.description}</p>`; }
        html += `<h4>덱 배치</h4>`;

        // 1. 그리드 배열을 항상 4x4 빈 칸으로 먼저 생성
        const grid = Array(4).fill(null).map(() => Array(4).fill({ type: 'empty' }));

        const positionMap = {
            'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0], 
            'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
            'main_4': [1, 2], 'main_5': [2, 2], 'main_6': [3, 2], 
            'main_1': [1, 3], 'main_2': [2, 3], 'main_3': [3, 3]
        };

        // 2. 데이터가 있을 경우에만 해당 칸의 정보를 덮어쓰기
        if (data.weather && weatherToEmoji[data.weather]) {
            grid[0][0] = { type: 'header', content: weatherToEmoji[data.weather], label: data.weather, colspan: 2 };
            grid[0][1] = null; // colspan으로 합쳐질 셀은 null로 표시
        }
        const mainPokemonIds = data.composition.filter(m => m.role === 'main').map(m => m.pokemonId);
        const synergy = calculateSynergy(mainPokemonIds);
        if (synergy) {
             grid[0][2] = { type: 'header', content: `<img src="${synergy.imageURL}" alt="${synergy.name}">`, label: synergy.name, colspan: 2 };
             grid[0][3] = null; // colspan으로 합쳐질 셀은 null로 표시
        }
        
        data.composition.forEach(member => { 
            const pkmData = DB.pokemonType.lev4[member.pokemonId]; 
            if (pkmData) {
                const [row, col] = positionMap[`${member.role}_${member.position}`];
                grid[row][col] = { type: 'pokemon', ...pkmData };
            }
        });

        // 3. 완성된 grid 배열을 기반으로 HTML 테이블 생성
        html += `<table class="four-by-four-table"><tbody>`;
        for (let i = 0; i < 4; i++) {
            html += '<tr>';
            for (let j = 0; j < 4; j++) {
                const cell = grid[i][j];
                if (cell === null) continue; // null인 칸은 건너뛰어 colspan 구현

                if (cell.type === 'pokemon') {
                    html += `<td><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"></div></td>`;
                } else if (cell.type === 'header') {
                    html += `<td class="header-cell" colspan="${cell.colspan || 1}" title="${cell.label}"><div>${cell.content}</div></td>`;
                } else { // 'empty' 타입
                    html += `<td class="empty-cell"></td>`;
                }
            }
            html += '</tr>';
        }
        html += `</tbody><tfoot><tr><td colspan="2">어시스트 #1~#6</td><td colspan="2">메인덱 #1~#6</td></tr></tfoot></table></div>`;
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
            const addEvent = (event, eventDate) => {
                const day = eventDate.getDate();
                if (!monthEvents[day]) monthEvents[day] = [];
                const startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + (event.duration - 1));
                monthEvents[day].push({ ...event, startDate, endDate });
            };
            (data.events || []).forEach(event => {
                if (!event.startDate) return;
                const startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
                for (let i = 0; i < (event.duration || 1); i++) {
                    const eventDate = new Date(startDate);
                    eventDate.setDate(eventDate.getDate() + i);
                    if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                        addEvent({...event, date: startDate.toISOString().split('T')[0]}, eventDate);
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
                            addEvent({ ...re, date: currentDate.toISOString().split('T')[0], startDate: currentDate }, eventDate);
                        }
                    }
                    if (re.interval === '4_weeks') currentDate.setDate(currentDate.getDate() + 28);
                    else break;
                }
            });
            let html = `<div class="calendar-header"><span class="calendar-title">${year}년 ${month + 1}월</span><div class="calendar-nav"><button id="cal-prev-btn">&lt; 이전</button><button id="cal-today-btn">Today</button><button id="cal-next-btn">다음 &gt;</button></div></div>
        <div class="calendar-legend">
            <div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div>
            <div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div>
            <div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div>
            <div class="legend-item"><span class="legend-dot event-type-carnival"></span> 카니발</div>
            <div class="legend-item"><span class="legend-dot event-type-season"></span> 시즌</div>
            <div class="legend-item"><span class="legend-dot event-type-etc"></span> 기타</div>
        </div>
        <table class="calendar-grid"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>`;
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
                            const popupContent = document.createElement('div');
                            popupContent.innerHTML = eventContent;
                            showModal(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 이벤트`, popupContent);
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
                    <div class="placement-grid-4x4">
                        <div class="placement-slot-header" id="weather-slot">날씨 효과</div>
                        <div class="placement-slot-header" id="synergy-slot">타입 시너지 효과</div>
                        <div class="placement-slot assist" data-role="assist" data-position="4">어시스트_#4</div>
                        <div class="placement-slot assist" data-role="assist" data-position="1">어시스트_#1</div>
                        <div class="placement-slot main rearguard" data-role="main" data-position="4">메인_#4</div>
                        <div class="placement-slot main vanguard" data-role="main" data-position="1">메인_#1</div>
                        <div class="placement-slot assist" data-role="assist" data-position="5">어시스트_#5</div>
                        <div class="placement-slot assist" data-role="assist" data-position="2">어시스트_#2</div>
                        <div class="placement-slot main rearguard" data-role="main" data-position="5">메인_#5</div>
                        <div class="placement-slot main vanguard" data-role="main" data-position="2">메인_#2</div>
                        <div class="placement-slot assist" data-role="assist" data-position="6">어시스트_#6</div>
                        <div class="placement-slot assist" data-role="assist" data-position="3">어시스트_#3</div>
                        <div class="placement-slot main rearguard" data-role="main" data-position="6">메인_#6</div>
                        <div class="placement-slot main vanguard" data-role="main" data-position="3">메인_#3</div>
                    </div>
                </div>
                <div class="source-container">
                    <h4>포켓몬 목록</h4>
                    <div class="source-filter-bar">
                        <select id="grade-filter" class="filter-dropdown"><option value="all">모든 등급</option><option value="SS">SS</option><option value="S+">S+</option><option value="S">S</option></select>
                        <select id="type-filter" class="filter-dropdown"><option value="all">모든 타입</option></select>
                    </div>
                    <div class="source-list"></div>
                </div>
            </div>`;
        contentDiv.innerHTML = html;
        const sourceList = contentDiv.querySelector('.source-list');
        const placementGrid = contentDiv.querySelector('.placement-grid-4x4');
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
            const placedIds = new Set(Array.from(placedPokemon.values()));
            let filteredPokemon = Object.entries(DB.pokemonType.lev4).filter(([id, pkm]) => {
                if (placedIds.has(id)) return false;
                const gradeMatch = selectedGrade === 'all' || !pkm.grade || pkm.grade === selectedGrade;
                const typeMatch = selectedType === 'all' || (pkm.types && pkm.types.includes(selectedType));
                return gradeMatch && typeMatch;
            });
            filteredPokemon.sort(([, a], [, b]) => (a.name_ko || a.name).localeCompare(b.name_ko || b.name, 'ko'));
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
        placementGrid.addEventListener('dragstart', e => {
            const target = e.target.closest('.placement-slot');
             if(target && placedPokemon.has(target)) {
                 draggedItem = target;
                 e.dataTransfer.setData('text/plain', placedPokemon.get(target));
             }
        });
        placementGrid.addEventListener('dragover', e => e.preventDefault());
        placementGrid.addEventListener('drop', e => {
            e.preventDefault();
            const targetSlot = e.target.closest('.placement-slot');
            if (!targetSlot || !draggedItem) return;
            const sourcePokemonId = e.dataTransfer.getData('text/plain');
            const pokemonData = DB.pokemonType.lev4[sourcePokemonId];
            if (!pokemonData) return;
            if (draggedItem.classList.contains('placement-slot')) {
                const sourceSlot = draggedItem;
                if (targetSlot === sourceSlot) return; 
                const targetPokemonId = placedPokemon.get(targetSlot);
                if (targetPokemonId) {
                    const targetPokemonData = DB.pokemonType.lev4[targetPokemonId];
                    placePokemonInSlot(sourceSlot, targetPokemonId, targetPokemonData);
                } else {
                    clearSlot(sourceSlot);
                }
                placePokemonInSlot(targetSlot, sourcePokemonId, pokemonData);
            } else {
                const isAlreadyPlaced = new Set(Array.from(placedPokemon.values())).has(sourcePokemonId);
                if (isAlreadyPlaced) {
                    alert("이미 배치된 포켓몬입니다.");
                    return;
                }
                if (placedPokemon.has(targetSlot)) {
                     const existingPokemonId = placedPokemon.get(targetSlot);
                     const sourceSlotOfExisting = [...placedPokemon.entries()].find(([,pkmId]) => pkmId === sourcePokemonId)?.[0];
                     if(sourceSlotOfExisting) clearSlot(sourceSlotOfExisting);
                     clearSlot(targetSlot);
                     applyFilters();
                }
                placePokemonInSlot(targetSlot, sourcePokemonId, pokemonData);
            }
            draggedItem = null;
            updateTeamEffects();
            applyFilters();
        });
        placementGrid.addEventListener('click', e => {
            const removeButton = e.target.closest('.remove-pkm-btn');
            if(removeButton) {
                const parentSlot = removeButton.closest('.placement-slot');
                if (parentSlot) {
                    clearSlot(parentSlot);
                    updateTeamEffects();
                    applyFilters();
                }
            }
        });
        function placePokemonInSlot(slot, pokemonId, pokemonData) {
            slot.innerHTML = `<div class="deck-pokemon-cell" draggable="true"><img src="${pokemonData.faceImageURL}" alt="${pokemonData.name_ko}"/><button class="remove-pkm-btn">×</button><span>${pokemonData.name_ko}</span></div>`;
            slot.classList.add('placed');
            placedPokemon.set(slot, pokemonId);
        }
        function clearSlot(slot) {
            const { role, position } = slot.dataset;
            let placeholder = role === 'assist' ? `어시스트_#${position}` : `메인_#${position}`;
            slot.innerHTML = placeholder;
            slot.classList.remove('placed');
            placedPokemon.delete(slot);
        }
        function updateTeamEffects() {
            const synergySlot = placementGrid.querySelector('#synergy-slot');
            const mainPokemonIds = Array.from(placedPokemon.entries())
                .filter(([slot,]) => slot.dataset.role === 'main')
                .map(([, pokemonId]) => pokemonId);
            const synergy = calculateSynergy(mainPokemonIds);
            if (synergy) {
                synergySlot.innerHTML = `<img src="${synergy.imageURL}" alt="${synergy.name}" title="${synergy.name}" style="height: 50%; object-fit: contain;">`;
                synergySlot.title = synergy.name;
            } else {
                synergySlot.innerHTML = '타입 시너지 효과';
                synergySlot.title = '';
            }
        }
        applyFilters();
    }

    function showListPage(menuId, subMenuId = null) {
        const mainPlaceholder = document.getElementById('main-placeholder');
        const listPage = document.getElementById('list-filter-page');
        const listPageTitle = document.getElementById('list-page-title');
        const backToGridBtn = listPage.querySelector('.back-to-grid-btn');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const filtersContainer = document.getElementById('list-page-filters');
        const menusWithFilters = ['pokemonType', 'pokemonGrade', 'item'];
        
        if (menusWithFilters.includes(menuId)) {
            filtersContainer.style.display = 'block';
            renderFilters(menuId);
        } else {
            filtersContainer.style.display = 'none';
            filtersContainer.innerHTML = '';
        }

        mainPlaceholder.style.display = 'none';
        if(mobileMenuBtn) mobileMenuBtn.style.display = 'none';
        listPage.style.display = 'flex';
        setTimeout(() => listPage.classList.add('visible'), 10);

        let dataList = [];
        let title = '';
        const menuInfo = DB.sidebarMenu.find(item => item.id === menuId);
        if(menuInfo) title = menuInfo.name;

        switch (menuId) {
            case 'pokemonType': case 'pokemonGrade':
                dataList = Object.values(DB.pokemonType.lev4);
                title = '포켓몬';
                break;
            case 'item':
                dataList = Object.values(DB.item.lev4);
                break;
            case 'runeAndChip':
                if (subMenuId === 'rune') {
                    dataList = Object.values(DB.runeAndChip.lev4).filter(d => d.type === 'rune');
                    title = '룬';
                } else if (subMenuId === 'chip') {
                    dataList = Object.values(DB.runeAndChip.lev4).filter(d => d.type === 'chip');
                    title = '칩';
                }
                break;
            case 'deck':
                 dataList = Object.values(DB.deck.lev4);
                 title = '추천 덱';
                break;
            case 'tips': case 'notice':
                dataList = Object.values(DB[menuId].lev3);
                break;
        }

        if (listPageTitle) {
            listPageTitle.textContent = title;
            listPageTitle.dataset.menuId = menuId;
        }
        
        if (backToGridBtn) {
            const newBtn = backToGridBtn.cloneNode(true);
            backToGridBtn.parentNode.replaceChild(newBtn, backToGridBtn);
            newBtn.addEventListener('click', hideListPage);
        }

        const cardLayoutMenus = ['pokemonType', 'pokemonGrade', 'item', 'runeAndChip'];
        if (cardLayoutMenus.includes(menuId)) {
            renderListPage(dataList, menuId);
        } else {
            renderSimpleListPage(dataList, menuId);
        }
    }

    function hideListPage() {
        const mainPlaceholder = document.getElementById('main-placeholder');
        const listPage = document.getElementById('list-filter-page');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const detailPanel = document.getElementById('lev4-panel');

        listPage.classList.remove('visible');
        detailPanel.classList.remove('visible');
        
        setTimeout(() => {
            listPage.style.display = 'none';
            if(mobileMenuBtn) mobileMenuBtn.style.display = 'block';
            mainPlaceholder.style.display = 'flex';
        }, 350);
    }

    function renderListPage(data, menuId) {
        const listContent = document.getElementById('list-page-content');
        if (!data || data.length === 0) {
            listContent.innerHTML = '<p class="list-empty-message">표시할 데이터가 없습니다.</p>';
            return;
        }
        renderCardList(data, menuId, listContent);
    }

    function renderSimpleListPage(data, menuId) {
        const listContent = document.getElementById('list-page-content');
        if (!data || data.length === 0) {
            listContent.innerHTML = '<p class="list-empty-message">표시할 데이터가 없습니다.</p>';
            return;
        }
        data.sort((a, b) => {
            const nameA = a.name || a.title || '';
            const nameB = b.name || b.title || '';
            return nameA.localeCompare(nameB, 'ko');
        });
        const listHTML = data.map(item => {
            const name = item.name || item.title;
            const newBadge = isNew(item.updatedAt) || isNew(item.createdAt) ? '<span class="new-badge-list">New</span>' : '';
            return `<button class="list-item" data-id="${item.id}" data-menu-id="${menuId}">${name} ${newBadge}</button>`;
        }).join('');
        listContent.innerHTML = listHTML;
    }

    let activeFilters = {
        grade: [],
        type: []
    };

    function renderFilters(menuId) {
        const filtersContainer = document.getElementById('list-page-filters');
        filtersContainer.innerHTML = `
            <button id="open-filter-modal-btn" class="filter-trigger-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.74.439L7 12.439V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                </svg>
                필터
            </button>
        `;
    }

    // ▼▼▼ [수정] 모바일 필터 UI를 아이콘으로 표시하도록 변경 ▼▼▼
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
                filtersHTML += `
                    <button class="type-icon-button ${isActive}" data-filter-type="type" data-filter-value="${type.id}" title="${type.name}">
                        <img src="${type.iconURL}" alt="${type.name}">
                    </button>
                `;
            });
            filtersHTML += '</div></div>';

        } else if (menuId === 'item') {
            filtersHTML += '<div class="filter-group"><h4>등급</h4><div class="filter-options">';
            const gradeOrder = { "God": 1, "Legendary": 2, "Epic": 3 };
            const sortedGrades = [...DB.item.lev2].sort((a, b) => {
                const gradeA = a.name.match(/\((.*?)\)/)[1];
                const gradeB = b.name.match(/\((.*?)\)/)[1];
                return (gradeOrder[gradeA] || 99) - (gradeOrder[gradeB] || 99);
            });
            sortedGrades.forEach(grade => {
                const gradeValue = grade.name.match(/\((.*?)\)/)[1];
                const isActive = activeFilters.grade.includes(gradeValue) ? 'active' : '';
                filtersHTML += `<button class="filter-button ${isActive}" data-filter-type="grade" data-filter-value="${gradeValue}">${gradeValue}</button>`;
            });
            filtersHTML += '</div></div>';
        }
        
        modalBody.innerHTML = filtersHTML;
        modalOverlay.style.display = 'flex';
    }

    function applyFiltersAndRender() {
        const menuId = document.getElementById('list-page-title').dataset.menuId;
        let dataList = [];
        if (menuId === 'pokemonType' || menuId === 'pokemonGrade') {
            dataList = Object.values(DB.pokemonType.lev4);
        } else if (menuId === 'item') {
            dataList = Object.values(DB.item.lev4);
        }

        const filteredData = dataList.filter(item => {
            const gradeMatch = activeFilters.grade.length === 0 || (item.grade && activeFilters.grade.includes(item.grade));
            const typeMatch = activeFilters.type.length === 0 || activeFilters.type.every(type => item.types?.includes(type));
            return gradeMatch && typeMatch;
        });

        renderListPage(filteredData, menuId);
        closeFilterModal();
    }

    function closeFilterModal() {
        document.getElementById('filter-modal-overlay').style.display = 'none';
    }

    function showDetailPage(itemId, menuId) {
        const listPage = document.getElementById('list-filter-page');
        const detailPanel = document.getElementById('lev4-panel');
        const contentDiv = detailPanel.querySelector('.panel-content');
        const itemData = DB[menuId]?.lev4?.[itemId] || DB[menuId]?.lev3?.[itemId];

        contentDiv.innerHTML = '';
        if (menuId === 'calendar' && itemId === 'calendar') {
             renderCalendarView(contentDiv, DB.calendar.lev2);
        } else if (itemData) {
            if (menuId === 'deck' && itemData.composition) renderDeckView(contentDiv, itemData);
            else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, itemData, menuId);
            else renderSimpleView(contentDiv, itemData, menuId);
        } else {
            contentDiv.innerHTML = '<p>데이터를 불러오는 데 실패했습니다.</p>';
            return;
        }

        const panelHeader = detailPanel.querySelector('.panel-header');
        panelHeader.innerHTML = ''; 

        const backButton = document.createElement('button');
        backButton.className = 'back-btn';
        backButton.innerHTML = '&lt; 뒤로';
        panelHeader.appendChild(backButton);

        backButton.addEventListener('click', () => {
            if (sessionStorage.getItem('returnToMain')) {
                handleMainButtonClick();
            } else {
                detailPanel.classList.remove('visible');
                if (menuId === 'calendar') {
                    hideListPage(); 
                } else {
                    if(listPage) listPage.classList.add('visible');
                }
            }
        }, { once: true });

        if (listPage) listPage.classList.remove('visible');
        detailPanel.classList.add('visible');
    }

    function addEventListeners() {
        if(mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }

        document.body.addEventListener('click', (e) => {
            const adLink = e.target.closest('a[href*="ads"]');
            if (adLink) {
                adBlockManager.recordClick();
            }

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
            }
            
            const mainShortcut = e.target.closest('#main-notice-list a, #popular-deck-list a');
            if (mainShortcut) {
                e.preventDefault();
                const menuId = mainShortcut.dataset.menuId;
                const itemId = mainShortcut.dataset.itemId;
                sessionStorage.setItem('returnToMain', 'true'); // 스마트 뒤로가기 상태 저장
                if (isMobile()) {
                    showDetailPage(itemId, menuId);
                } else {
                    mainPlaceholder.style.display = 'none';
                    appContainer.classList.add('menu-active');
                    const detailPanel = panels.lev4;
                    const contentDiv = detailPanel.querySelector('.panel-content');
                    const panelHeader = detailPanel.querySelector('.panel-header');
                    let data;
                    if (menuId === 'deck') data = DB.deck.lev4[itemId];
                    else if (menuId === 'notice') data = DB.notice.lev3[itemId];
                    if (data) {
                        if (menuId === 'deck') renderDeckView(contentDiv, data);
                        else renderSimpleView(contentDiv, data, menuId);
                    }
                    panelHeader.innerHTML = '';
                    const backButton = document.createElement('button');
                    backButton.className = 'back-btn';
                    backButton.innerHTML = '&lt; 뒤로';
                    // 수정할 코드
backButton.addEventListener('click', (e) => {
    e.stopPropagation(); // 이벤트 중복 실행 방지
    handleMainButtonClick();
}, { once: true });
                    panelHeader.appendChild(backButton);
                    Object.values(panels).forEach(p => p.classList.remove('visible'));
                    detailPanel.classList.add('visible');
                }
            }
            
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                handleLikeClick(likeBtn);
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
                    const prevPanel = panels[`lev${level-1}`];
                    if (prevPanel) {
                        prevPanel.classList.remove('is-hidden');
                        prevPanel.classList.add('visible');
                    }
                    if(activeButtons[level]) activeButtons[level].classList.remove('active');
                    activeButtons[level] = null;
                } else {
                    handleMainButtonClick();
                }
            }

            const openFilterBtn = e.target.closest('#open-filter-modal-btn');
            if (openFilterBtn) {
                openFilterModal();
            }

            const filterModalOverlay = e.target.closest('#filter-modal-overlay');
            const closeFilterBtn = e.target.closest('#filter-modal-close-btn');
            if ((filterModalOverlay && e.target === filterModalOverlay) || closeFilterBtn) {
                 closeFilterModal();
            }

            const filterButton = e.target.closest('.filter-button, .type-icon-button');
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
            }

            const applyFilterBtn = e.target.closest('#filter-apply-btn');
            if(applyFilterBtn) {
                applyFiltersAndRender();
            }
            const resetFilterBtn = e.target.closest('#filter-reset-btn');
            if(resetFilterBtn) {
                activeFilters.grade = [];
                activeFilters.type = [];
                openFilterModal();
            }
        });
    }

    adBlockManager.checkAndApplyBlock();
    initialize();
    function setScreenHeight() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);
});