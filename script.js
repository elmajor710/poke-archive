document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 좋아요 기능 추가');

    // [수정] 복구 코드의 광고 처리 로직을 그대로 적용
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
                                    if (window.innerWidth <= 1199) {
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
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainPlaceholder = document.getElementById('main-placeholder');
    const mainNoticeList = document.getElementById('main-notice-list');
    const mainPopularList = document.getElementById('main-popular-list'); // [추가] 인기글 목록
    const panels = {
        lev1: sidebar,
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    let activeButtons = {};
    const isMobile = () => window.innerWidth <= 1199;
    
    
    async function initialize() {
    try {
        await fetchAllDataFromFirebase();
        setupSideMenuData();
        renderSidebar();
        renderMainNoticeList();
        // ▼▼▼ [추가] 인기글 로딩 함수 호출 ▼▼▼
        fetchAndRenderPopularDecks(); 
        // ▲▲▲ [추가] 인기글 로딩 함수 호출 ▲▲▲
        addEventListeners();
        setupAdObservers();
    } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. Firebase 연결 또는 데이터 구조를 확인해주세요.";
        }
    }
    
    // ▼▼▼ [추가] 인기글 목록 렌더링 함수 ▼▼▼
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
            // 공지사항 링크와 동일한 방식으로 data-* 속성을 사용하여 클릭 시 해당 덱으로 이동하도록 함
            return `<li><a href="#" data-menu-id="deck" data-item-id="${deck.id}">${deck.name}</a> ❤️ ${deck.likeCount || 0}</li>`;
        }).join('');
        
        popularDeckList.innerHTML = decksHTML;

    } catch (error) {
        console.error("인기글 데이터를 불러오는 중 오류 발생:", error);
        popularDeckList.innerHTML = '<li>오류가 발생했습니다.</li>';
    }
}
// ▲▲▲ [추가] 인기글 목록 렌더링 함수 ▲▲▲

    async function fetchAllDataFromFirebase() {
        const collectionsToFetch = {
            notice: db.collection('notice').where("isPublished", "==", true),
            pokemon: db.collection('pokemon').where("isPublished", "==", true),
            items: db.collection('items').where("isPublished", "==", true),
            runeAndChips: db.collection('runeAndChips').where("isPublished", "==", true),
            tips: db.collection('tips').where("isPublished", "==", true),
            recommendedDecks: db.collection('recommendedDecks').where("isPublished", "==", true),
            events: db.collection('events'),
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
            if (itemGrades[gradeKey]) itemGrades[gradeKey].push({ id: item.id, name: item.name });
        });
        Object.values(itemGrades).forEach(g => g.sort((a,b)=>a.name.localeCompare(b.name, 'ko')));
        DB.item.lev3 = itemGrades;
        
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(rc.type && runeAndChipTypes[rc.type]) runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name });
        });
        runeAndChipTypes.rune.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        runeAndChipTypes.chip.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
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

    /* script.js 파일에서 기존 renderSidebar 함수를 찾아 아래 코드로 전체 교체하세요 */
function renderSidebar() {
    // 1. 메뉴 목록을 담을 컨테이너 생성
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

    // 2. 광고 영역을 담을 컨테이너 생성
    const adContainer = document.createElement('div');
    adContainer.id = 'sidebar-ad-container';
    adContainer.innerHTML = `
        <div class="coupang-ad-box">
            <p class="ad-notice">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
            <iframe src="https://coupa.ng/cjwGmH" width="120" height="240" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics></iframe>
        </div>
        <div class="blog-ad-box">
            <a href="https://index001.elmajor710.com" target="_blank" class="custom-ad-banner">
                <div class="ad-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3c0 .35.07.69.18 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM8 4h8a1 1 0 0 1 1 1c0 .34-.07.66-.18 1H7.18C7.07 5.66 7 5.34 7 5a1 1 0 0 1 1-1zm12 15H4V8h16v11z"/>
                        <path d="M12 17a4 4 0 0 0 4-4h-2a2 2 0 0 1-2 2 2 2 0 0 1-2-2H8a4 4 0 0 0 4 4zm0-6a1 1 0 0 0 1-1V9a1 1 0 0 0-2 0v1a1 1 0 0 0 1 1z"/>
                    </svg>
                </div>
                <div class="ad-text">
                    <strong>나라지원금 Info.</strong>
                    <span>놓치면 손해! 혜택 확인하기</span>
                </div>
            </a>
        </div>
    `;

    // 3. 실제 사이드바(#sidebar)에 메뉴와 광고를 순서대로 추가
    if(sidebar) {
        sidebar.innerHTML = ''; // 기존 내용 초기화
        sidebar.appendChild(sidebarContent); // 메뉴 목록 추가
        sidebar.appendChild(adContainer); // 광고 영역 추가
    }
}

    function renderMainNoticeList() {
        if (!mainNoticeList) return;
        const noticesToShow = DB.notice.lev2.slice(0, 5);
        mainNoticeList.innerHTML = noticesToShow.map(notice => {
            const newBadge = isNew(notice.updatedAt) || isNew(notice.createdAt) ? '<span class="new-badge-list">New</span>' : '';
            return `<li><a href="#" data-menu-id="notice" data-item-id="${notice.id}">${notice.name}</a> ${newBadge}</li>`;
        }).join('');
    }

    // [추가] 인기글 목록 렌더링 함수
    function renderMainPopularList() {
        if (!mainPopularList) return;
        const popularDecks = [...DB.deck.lev3.recommended]
            .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
            .slice(0, 5);
        
        if (popularDecks.length > 0) {
            mainPopularList.innerHTML = popularDecks.map(deck => {
                return `<li><a href="#" data-menu-id="deck" data-item-id="${deck.id}">${deck.name}</a> <span class="popular-like-count">❤️ ${deck.likeCount || 0}</span></li>`;
            }).join('');
        } else {
            mainPopularList.innerHTML = '<li>아직 인기글이 없습니다.</li>';
        }
    }

    function addEventListeners() {
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.ad-container')) adBlockManager.recordClick();
    });

    document.body.addEventListener('click', e => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            handleLikeClick(likeBtn);
            return; 
        }

        const button = e.target.closest('button');
        if (button) {
            if (button.id === 'mobile-menu-btn') {
                sidebar.classList.toggle('visible');
            } else if (button.classList.contains('back-btn')) {
                handleBackClick(button); 
            } else if (button.classList.contains('main-btn')) {
                handleMainButtonClick();
            } else if (button.classList.contains('main-action-btn')) {
                // ▼▼▼ [수정] 모바일 '인기글' 버튼 클릭 시 '추천덱' 목록으로 바로 이동 ▼▼▼
                if (button.dataset.menuId === 'popular') {
                    const lev1_btn = sidebar.querySelector(`.menu-item[data-id="deck"]`);
                    if (lev1_btn) {
                        handleMenuClick(lev1_btn); // L1 '덱 구성' 클릭
                        setTimeout(() => {
                            const lev2_btn = panels.lev2.querySelector(`.list-item[data-id="recommended"]`);
                            if (lev2_btn) {
                                handleMenuClick(lev2_btn); // L2 '추천덱' 클릭
                            }
                        }, 50);
                    }
                    return;
                }
                // ▲▲▲ [수정] 모바일 '인기글' 버튼 클릭 시 '추천덱' 목록으로 바로 이동 ▲▲▲
                const targetMenuItem = sidebar.querySelector(`.menu-item[data-id="${button.dataset.menuId}"]`);
                if(targetMenuItem) handleMenuClick(targetMenuItem);
            } else if (button.dataset.level) {
                handleMenuClick(button); 
            }
        }

        const noticeLink = e.target.closest('#main-notice-list a');
        if (noticeLink) {
            e.preventDefault();
            const menuId = noticeLink.dataset.menuId;
            const itemId = noticeLink.dataset.itemId;

            const lev1_btn = sidebar.querySelector(`.menu-item[data-id="${menuId}"]`);
            if (lev1_btn) {
                handleMenuClick(lev1_btn);
                setTimeout(() => {
                    const lev2_btn = panels.lev2.querySelector(`.list-item[data-id="${itemId}"]`);
                    if (lev2_btn) handleMenuClick(lev2_btn);
                }, 50); 
            }
        }

        const popularDeckLink = e.target.closest('#popular-deck-list a');
        if (popularDeckLink) {
            e.preventDefault();
            const menuId = popularDeckLink.dataset.menuId;
            const itemId = popularDeckLink.dataset.itemId;

            const lev1_btn = sidebar.querySelector(`.menu-item[data-id="${menuId}"]`);
            if (lev1_btn) {
                handleMenuClick(lev1_btn);
                setTimeout(() => {
                    const lev2_btn = panels.lev2.querySelector(`.list-item[data-id="recommended"]`);
                    if (lev2_btn) {
                        handleMenuClick(lev2_btn);
                        setTimeout(() => {
                            const lev3_btn = panels.lev3.querySelector(`.list-item[data-id="${itemId}"]`);
                            if (lev3_btn) handleMenuClick(lev3_btn);
                        }, 50);
                    }
                }, 50); 
            }
        }
    });
}

    // ▼▼▼ [추가] 좋아요 기능 관련 함수 ▼▼▼

// 로컬 스토리지에서 '좋아요'한 덱 목록을 가져오는 헬퍼 함수
function getLikedDecks() {
    return JSON.parse(localStorage.getItem('likedDecks')) || [];
}

// '좋아요' 버튼 클릭을 처리하는 메인 함수
async function handleLikeClick(button) {
    const deckId = button.dataset.deckId;
    if (!deckId) return;

    const likeCountSpan = button.querySelector('.like-count');
    const heartIcon = button.querySelector('.heart-icon');
    let currentLikes = parseInt(likeCountSpan.textContent);
    
    let likedDecks = getLikedDecks();
    const isLiked = likedDecks.includes(deckId);

    // 낙관적 UI 업데이트: 서버 응답을 기다리지 않고 UI를 먼저 변경
    if (isLiked) {
        // 좋아요 취소
        likedDecks = likedDecks.filter(id => id !== deckId);
        button.classList.remove('liked');
        heartIcon.textContent = '♡';
        likeCountSpan.textContent = currentLikes - 1;
    } else {
        // 좋아요 누름
        likedDecks.push(deckId);
        button.classList.add('liked');
        heartIcon.textContent = '❤️';
        likeCountSpan.textContent = currentLikes + 1;
    }

    localStorage.setItem('likedDecks', JSON.stringify(likedDecks));

    // Firestore 데이터 업데이트
    try {
        await db.collection('recommendedDecks').doc(deckId).update({
            likeCount: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1)
        });
        // 성공 시 특별한 처리 없음. UI는 이미 업데이트 됨.
    } catch (error) {
        console.error("좋아요 업데이트 실패:", error);
        // 실패 시 UI 롤백
        alert('일시적인 오류로 좋아요 처리에 실패했습니다.');
        likeCountSpan.textContent = currentLikes; // 원래 값으로 복구
        if (isLiked) {
             button.classList.add('liked');
             heartIcon.textContent = '❤️';
        } else {
             button.classList.remove('liked');
             heartIcon.textContent = '♡';
        }
        // 로컬 스토리지도 원상 복구
        localStorage.setItem('likedDecks', JSON.stringify(getLikedDecks().filter(id => id !== deckId)));
    }
}
// ▲▲▲ [추가] 좋아요 기능 관련 함수 ▲▲▲

    

    function handleMenuClick(button) {
        if (isMobile()) sidebar.classList.remove('visible');
        mainPlaceholder.style.display = 'none';
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
        
        if (level === 2) {
            handleMainButtonClick();
        } else {
            setActive(level - 1, null);
        }
    }
    
    function handleMainButtonClick() {
        mainPlaceholder.style.display = 'flex';
        appContainer.classList.remove('menu-active');
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
                else if(menuId === 'calendar') renderCalendarView(contentDiv, DB.calendar.lev2);
                else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') renderPokemonView(contentDiv, data, menuId); 
                else renderSimpleView(contentDiv, data, menuId); 
            } else {
                data.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'list-item';
                    button.dataset.id = item.id;
                    button.dataset.level = level;
                    button.dataset.menuId = menuId;
                    
                    let itemHTML = item.name;
                    if (isNew(item.updatedAt) || isNew(item.createdAt)) {
                        itemHTML += '<span class="new-badge-list">New</span>';
                    }
                    button.innerHTML = itemHTML;
                    
                    contentDiv.appendChild(button);
                });
            }
        }
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
                    const dbKey = (type === 'recommendedRunes' || type === 'recommendedChips') ? 'runeAndChip' : 'item';
                    const itemData = DB[dbKey]?.lev4?.[id];
                    if (itemData) {
                         buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${dbKey}">${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}</div>`;
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
    
    // [수정] 복구 코드 기반으로 추천 덱 렌더링 함수 수정
    function renderDeckView(contentDiv, data) {
    const weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };

    // ▼▼▼ [추가] 좋아요 상태 확인 및 UI 구성 ▼▼▼
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
    // ▲▲▲ [추가] 좋아요 상태 확인 및 UI 구성 ▲▲▲
    
    // [수정] h2 태그 옆에 좋아요 버튼 HTML 삽입
    let html = `<div class="deck-detail-view">
                    <div class="deck-header">
                        <h2>${data.name}</h2>
                        ${likeButtonHTML}
                    </div>`;

    if (data.description) { html += `<p class="deck-description">${data.description}</p>`; }
    
    html += `<h4>덱 배치</h4>`;
    
    const grid = Array(4).fill(null).map(() => Array(4).fill(null));
    const positionMap = {
        'assist_4': [1, 0], 'assist_5': [2, 0], 'assist_6': [3, 0], 
        'assist_1': [1, 1], 'assist_2': [2, 1], 'assist_3': [3, 1],
        'main_4': [1, 2], 'main_5': [2, 2], 'main_6': [3, 2], 
        'main_1': [1, 3], 'main_2': [2, 3], 'main_3': [3, 3]
    };

    if (data.weather && weatherToEmoji[data.weather]) {
        grid[0][0] = { type: 'header', content: weatherToEmoji[data.weather], label: data.weather, colspan: 2 };
    }
    const mainPokemonIds = data.composition.filter(m => m.role === 'main').map(m => m.pokemonId);
    const synergy = calculateSynergy(mainPokemonIds);
    if (synergy) {
         grid[0][2] = { type: 'header', content: `<img src="${synergy.imageURL}" alt="${synergy.name}">`, label: synergy.name, colspan: 2 };
    }

    data.composition.forEach(member => { 
        const pkmData = DB.pokemonType.lev4[member.pokemonId]; 
        if (!pkmData) return; 
        const key = `${member.role}_${member.position}`;
        if(positionMap[key]) {
            const [row, col] = positionMap[key];
            grid[row][col] = { type: 'pokemon', ...pkmData };
        }
    });

    html += `<table class="four-by-four-table"><tbody>`;
    for (let i = 0; i < 4; i++) {
        html += '<tr>';
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === undefined) continue;
            const cell = grid[i][j];
            if (cell) {
                if (cell.type === 'pokemon') {
                    html += `<td><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"><span class="pkm-name">${cell.name_ko}</span></div></td>`;
                } else if (cell.type === 'header') {
                    html += `<td class="header-cell" colspan="${cell.colspan || 1}" title="${cell.label}"><div>${cell.content}</div></td>`;
                    if (cell.colspan > 1) {
                        for (let k = 1; k < cell.colspan; k++) grid[i][j+k] = undefined;
                    }
                }
            } else {
                html += `<td class="empty-cell"></td>`;
            }
        }
        html += '</tr>';
    }
    html += `</tbody></table></div>`;
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


    // --- 페이지 실행 ---
    adBlockManager.checkAndApplyBlock();
    initialize();

    function setScreenHeight() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);
});
