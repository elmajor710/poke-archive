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
    function handleMenuClick(button) {
        setActive(parseInt(button.dataset.level), button);
        if (!isAdmin) refreshAdSlot(); // 관리자 모드가 아닐 때만 광고 새로고침
        
        const context = button.dataset;
        const nextLevel = parseInt(context.level) + 1;
        let nextData;
        if (nextLevel === 2) nextData = DB[context.id]?.lev2;
        else if (nextLevel === 3) nextData = DB[context.menuId]?.lev3?.[context.id];
        else if (nextLevel === 4) nextData = DB[context.menuId]?.lev4?.[context.id];
        renderPanel(nextLevel, nextData, context);
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        parentPanel.classList.remove('visible');
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        setActive(parseInt(parentPanel.id.slice(-1)) - 1, null);
    }

    function handleAdClick() {
        if (isAdmin) return;
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
    function renderPanel(level, data, context) {
        for (let i = level; i <= 4; i++) {
            panels[`lev${i}`].classList.remove('visible');
            panels[`lev${i}`].querySelector('.panel-content').innerHTML = '';
        }
        if (!data) return;
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        const isFinal = !Array.isArray(data);
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        if (isFinal) {
            contentDiv.innerHTML = data.content;
            contentArea.classList.add(`final-view-L${level}`);
        } else {
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
            refreshAdSlot(); // 정상적인 경우 첫 광고 로드
        }
    }

    function hideAdWithMessage(message) {
        adsContainer.innerHTML = `<div class="ad-message">${message}</div>`;
    }

    function refreshAdSlot() {
        // 광고 슬롯을 동적으로 생성하여 push 오류를 원천 차단
        adsContainer.innerHTML = ''; // 기존 광고 제거
        const adScript = document.createElement('script');
        adScript.async = true;
        adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2125965839205311";
        adScript.crossOrigin = "anonymous";

        const adIns = document.createElement('ins');
        adIns.className = "adsbygoogle";
        Object.assign(adIns.style, { display: 'block' });
        Object.assign(adIns.dataset, { adClient: "ca-pub-2125965839205311", adSlot: "5532734526", adFormat: "auto", fullWidthResponsive: "true" });
        
        const adPushScript = document.createElement('script');
        adPushScript.innerHTML = "(adsbygoogle = window.adsbygoogle || []).push({});";

        adsContainer.append(adScript, adIns, adPushScript);
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