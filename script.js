// ------------ START: 이 아래의 코드로 script.js 파일 전체를 교체해주세요. ------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. 변수 설정
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
    const adsContainer = document.getElementById('ads-container');
    const panels = { lev2: document.getElementById('lev2-panel'), lev3: document.getElementById('lev3-panel'), lev4: document.getElementById('lev4-panel') };
    let activeButtons = {};
    let isAdmin = false;
    const AD_CLICK_LIMIT = 5;
    const AD_CLICK_TIME_WINDOW = 60 * 60 * 1000;

    // 2. 초기화
    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        checkAdStatusAndLoad();
        addEventListeners();
    }

    // 3. 이벤트 리스너
    function addEventListeners() {
        app.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) handleBackClick(button);
            else if (button.dataset.level) handleMenuClick(button);
        });
        adsContainer.addEventListener('click', handleAdClick);
    }

    // 4. 클릭 핸들러
// --- 이 handleMenuClick 함수를 통째로 교체해주세요 ---
function handleMenuClick(button) {
    const level = parseInt(button.dataset.level);
    const id = button.dataset.id;
    const context = button.dataset;

    // [추가] 사이드바 메뉴 클릭 시 전체화면 모드 해제
    if (level === 1) {
        app.classList.remove('fullscreen-active');
    }

    setActive(level, button);

    const nextLevel = level + 1;
    if (nextLevel > 5) return;

    let nextData;
    if (nextLevel === 2) nextData = DB[id]?.lev2;
    else if (nextLevel === 3) nextData = DB[context.menuId]?.lev3?.[id];
    else if (nextLevel === 4) nextData = DB[context.menuId]?.lev4?.[id];
    
    renderPanel(nextLevel, nextData, context);
}

// --- 이 handleBackClick 함수를 통째로 교체해주세요 ---
function handleBackClick(button) {
    const parentPanel = button.closest('.panel');
    parentPanel.classList.remove('visible');
    
    // [추가] 뒤로가기 시 항상 전체화면 모드 해제
    app.classList.remove('fullscreen-active');
    
    contentArea.classList.remove('final-view-L3', 'final-view-L4');
    const level = parseInt(parentPanel.id.slice(-1));
    setActive(level - 1, null);
}

    function handleAdClick() {
        if (isAdmin || adsContainer.querySelector('.ad-message')) return;
        const now = Date.now();
        let adClicks = JSON.parse(localStorage.getItem('adClicks')) || [];
        adClicks = adClicks.filter(timestamp => (now - timestamp) < AD_CLICK_TIME_WINDOW);
        adClicks.push(now);
        localStorage.setItem('adClicks', JSON.stringify(adClicks));
        if (adClicks.length >= AD_CLICK_LIMIT) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            localStorage.setItem('adBlockUntil', tomorrow.getTime());
            hideAdWithMessage('광고가 일시 중단되었습니다.');
        }
    }

    // 5. 렌더링 및 광고 관리
    // --- 이 renderPanel 함수를 통째로 교체해주세요 ---
function renderPanel(level, data, context) {
    for (let i = level; i <= 4; i++) {
        panels[`lev${i}`].classList.remove('visible');
        panels[`lev${i}`].querySelector('.panel-content').innerHTML = '';
    }

    if (!data) return;
    const targetPanel = panels[`lev${level}`];
    if (!targetPanel) return;

    const contentDiv = targetPanel.querySelector('.panel-content');
    setTimeout(() => { contentDiv.scrollTop = 0; }, 0);
    
    const isFinal = !Array.isArray(data);
    
    // [수정] 모바일 전체화면 클래스를 먼저 초기화
    app.classList.remove('fullscreen-active');

    if (isFinal) {
        contentDiv.innerHTML = data.content;
        contentArea.classList.add(`final-view-L${level}`);
        
        // [추가] 모바일에서 포켓몬 상세정보(lev4)를 볼 때만 전체화면 클래스 추가
        if (isMobile && level === 4 && (context.menuId === 'pokemonType' || context.menuId === 'pokemonGrade')) {
            app.classList.add('fullscreen-active');
        }

    } else {
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        data.forEach(item => {
            const button = document.createElement('button');
            button.className = 'list-item';
            button.textContent = item.name;
            Object.assign(button.dataset, { id: item.id, level: level, menuId: context.menuId || context.id });
            if (level > 2) button.dataset.lev2Id = context.id;
            if (item.color) button.style.backgroundColor = item.color;
            contentDiv.appendChild(button);
        });
    }
    targetPanel.classList.add('visible');
}

    function checkAdStatusAndLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const blockUntil = localStorage.getItem('adBlockUntil');
        if (urlParams.get('admin') === 'true') {
            isAdmin = true;
            hideAdWithMessage('관리자 모드입니다.');
        } else if (blockUntil && Date.now() < parseInt(blockUntil)) {
            hideAdWithMessage('광고가 일시 중단되었습니다.');
        } else {
            refreshAdSlot();
        }
    }

    function hideAdWithMessage(message) {
        adsContainer.innerHTML = `<div class="ad-message">${message}</div>`;
    }

    function refreshAdSlot() {
        if (adsContainer.querySelector('.ad-message')) return;
        adsContainer.innerHTML = '';
        const adWrapper = document.createElement('div');
        adWrapper.id = 'ad-click-detector';
        
        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2125965839205311`;
        adScript.crossOrigin = "anonymous";
        
        const adIns = document.createElement('ins');
        adIns.className = "adsbygoogle";
        Object.assign(adIns.style, { display: 'block' });
        Object.assign(adIns.dataset, { adClient: "ca-pub-2125965839205311", adSlot: "5532734526", adFormat: "auto", fullWidthResponsive: "false" });
        
        const adPushScript = document.createElement('script');
        adPushScript.innerHTML = "(adsbygoogle = window.adsbygoogle || []).push({});";
        
        adWrapper.append(adIns, adPushScript);
        adsContainer.append(adWrapper, adScript);
    }
    
    // 6. 헬퍼 함수
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

    initialize();
});