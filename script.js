document.addEventListener('DOMContentLoaded', () => {
    // Firebase 초기화
    if (window.firebase && window.firebaseConfig) {
        try {
            firebase.initializeApp(window.firebaseConfig);
            window.db = firebase.firestore();
        } catch (e) {
            console.error("Firebase 초기화 실패:", e);
            document.body.innerHTML = "<h4>사이트 로딩에 실패했습니다. Firebase 설정에 문제가 있습니다.</h4>";
            return;
        }
    } else {
        console.error("Firebase 라이브러리 또는 설정이 로드되지 않았습니다.");
        document.body.innerHTML = "<h4>사이트 로딩에 실패했습니다. Firebase 라이브러리를 불러올 수 없습니다.</h4>";
        return;
    }

    // --- 전역 변수 ---
    const appContainer = document.getElementById('app-container');
    const homeButton = document.getElementById('home-button');
    const menuToggleBtn = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');
    const initialContent = document.getElementById('initial-content');
    const noticeList = document.getElementById('notice-list');
    const popularList = document.getElementById('popular-list');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    let activeButtons = {};
    const isMobile = () => window.innerWidth <= 1199;

    // --- 메인 실행 ---
    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            addEventListeners();
            populateInitialContent();
            setupAdObservers();
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "<h4>사이트 초기화 중 오류가 발생했습니다.</h4>";
        }
    }

    // --- 데이터 로딩 (기존 코드와 동일) ---
    async function fetchAllDataFromFirebase() {
        const collections = ['pokemon', 'items', 'runeAndChips', 'tips', 'events', 'recommendedDecks', 'announcements'];
        const promises = collections.map(col => db.collection(col).where("isPublished", "==", true).get());
        const [pokemonSnap, itemsSnap, rcSnap, tipsSnap, eventsSnap, decksSnap, announcementsSnap] = await Promise.all(promises);

        const snapshotToMap = (s) => { const d = {}; s.forEach(doc => { d[doc.id] = { id: doc.id, ...doc.data() }; }); return d; };

        DB.pokemonType.lev4 = snapshotToMap(pokemonSnap);
        DB.item.lev4 = snapshotToMap(itemsSnap);
        DB.runeAndChip.lev4 = snapshotToMap(rcSnap);
        DB.tips.lev3 = snapshotToMap(tipsSnap);
        DB.deck.lev4 = snapshotToMap(decksSnap);
        DB.announcements.lev3 = snapshotToMap(announcementsSnap);
        DB.calendar.lev2.events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    function setupSideMenuData() {
        // ... (기존 운영 코드의 setupSideMenuData 로직과 동일)
    }
    
    // --- 렌더링 함수 ---
    function renderSidebar() {
        // ... (기존 운영 코드의 renderSidebar 로직과 동일)
    }

    function populateInitialContent() {
        const announcements = Object.values(DB.announcements.lev3 || {}).sort((a,b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0)).slice(0, 5);
        noticeList.innerHTML = announcements.length > 0 ? announcements.map(n => `<li data-menu-id="announcements" data-id="${n.id}">${n.title}</li>`).join('') : '<li>등록된 공지사항이 없습니다.</li>';
        popularList.innerHTML = `<li>인기글 데이터 준비중입니다.</li>`;
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        // ... (기존 운영 코드의 renderPanelContent 로직과 동일)
    }

    // --- 이벤트 핸들러 및 상태 관리 ---
    function addEventListeners() {
        homeButton.addEventListener('click', handleMainButtonClick);
        menuToggleBtn.addEventListener('click', () => document.body.classList.toggle('sidebar-visible'));
        sidebarOverlay.addEventListener('click', () => document.body.classList.remove('sidebar-visible'));

        appContainer.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) handleBackClick(button); 
            else if (button.classList.contains('main-btn')) handleMainButtonClick();
            else if (button.dataset.level) handleMenuClick(button); 
        });

        initialContent.addEventListener('click', e => {
            const noticeItem = e.target.closest('#notice-list li');
            if (noticeItem) {
                const sidebarBtn = sidebar.querySelector(`button[data-id="announcements"]`);
                if (sidebarBtn) handleMenuClick(sidebarBtn);
                setTimeout(() => {
                    const noticeBtn = panels.lev2.querySelector(`button[data-id="${noticeItem.dataset.id}"]`);
                    if (noticeBtn) handleMenuClick(noticeBtn);
                }, 50);
            }
            const mobileBtn = e.target.closest('.mobile-notice-btn');
            if (mobileBtn) {
                const sidebarBtn = sidebar.querySelector(`button[data-id="${mobileBtn.dataset.targetMenu}"]`);
                if(sidebarBtn) handleMenuClick(sidebarBtn);
            }
        });
    }

    function handleMenuClick(button) {
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

        if (isMobile()) document.body.classList.remove('sidebar-visible');
    }

    function handleBackClick(button) {
        // ... (기존 운영 코드의 handleBackClick 로직과 동일)
    }
    
    function handleMainButtonClick() {
        // ... (기존 운영 코드의 handleMainButtonClick 로직과 동일)
    }

    function setActive(level, target) {
        // ... (기존 운영 코드의 setActive 로직과 동일)
    }

    function getNextData(currentLevel, id, menuId) {
        // ... (기존 운영 코드의 getNextData 로직과 동일)
    }

    // --- 상세 뷰 렌더링 함수들 (기존 코드와 동일) ---
    function renderPokemonView(contentDiv, data, menuId) { /* ... */ }
    function renderSimpleView(contentDiv, data, menuId) { /* ... */ }
    function renderDeckView(contentDiv, data) { /* ... */ }
    function renderCalendarView(contentDiv, data) { /* ... */ }
    function renderDeckBuilder(contentDiv) { /* ... */ }
    function calculateSynergy(pokemonIds) { /* ... */ }
    function showModal(title, content) { /* ... */ }
    function setupAdObservers() { /* ... */ }

    initialize();
});
