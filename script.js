// ------------ START: 이 아래의 코드로 script.js 파일 전체를 교체해주세요. ------------
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 기본 요소 및 변수 설정 ---
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
    const adsContainer = document.getElementById('ads-container');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};
    let isMobile = window.innerWidth <= 768;
    let isAdmin = false; // 관리자 모드 상태 저장 변수

    // --- 무효 트래픽 방지 설정 ---
    const AD_CLICK_LIMIT = 5;
    const AD_CLICK_TIME_WINDOW = 60 * 60 * 1000;

    // --- 2. 초기화 ---
    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item =>
            `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`
        ).join('');
        
        checkAdStatus();
        addEventListeners();
    }

    // --- 3. 이벤트 리스너 ---
    function addEventListeners() {
        app.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.classList.contains('back-btn')) {
                handleBackClick(button);
                return;
            }
            if (button.dataset.level) {
                handleMenuClick(button);
            }
        });
        
        window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });
        
        const adClickDetector = document.getElementById('ad-click-detector');
        if (adClickDetector) {
            adClickDetector.addEventListener('click', handleAdClick);
        }
    }

    // --- 4. 클릭 핸들러 ---
    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const context = button.dataset;

        setActive(level, button);

        // [수정] 관리자 모드가 아닐 때만 광고 새로고침 실행
        if (!isAdmin) {
            refreshAdSlot();
        }

        const nextLevel = level + 1;
        if (nextLevel > 5) return;

        let nextData;
        if (nextLevel === 2) nextData = DB[id]?.lev2;
        else if (nextLevel === 3) nextData = DB[context.menuId]?.lev3?.[id];
        else if (nextLevel === 4) nextData = DB[context.menuId]?.lev4?.[id];
        
        renderPanel(nextLevel, nextData, context);
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        parentPanel.classList.remove('visible');
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        const level = parseInt(parentPanel.id.slice(-1));
        setActive(level - 1, null);
    }

    function handleAdClick() {
        if (isAdmin) return; // 관리자 모드에서는 클릭 카운트 안 함

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

    // --- 5. 화면 렌더링 및 광고 관리 ---
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
                button.dataset.id = item.id;
                button.dataset.level = level;
                button.dataset.menuId = context.menuId || context.id;
                if (level > 2) button.dataset.lev2Id = context.id;
                if (item.color) button.style.backgroundColor = item.color;
                contentDiv.appendChild(button);
            });
        }
        targetPanel.classList.add('visible');
    }
    
    // [신설] 광고 슬롯을 통째로 새로고침하는 안정적인 함수
    function refreshAdSlot() {
        // adsbygoogle.push()는 오류가 많으므로, 광고 슬롯 자체를 다시 그려줍니다.
        const adClickDetector = document.getElementById('ad-click-detector');
        if (adClickDetector && window.adsbygoogle) {
            const adHtml = `
                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2125965839205311" crossorigin="anonymous"></script>
                <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2125965839205311" data-ad-slot="5532734526" data-ad-format="auto" data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            `;
            adClickDetector.innerHTML = adHtml;
        }
    }

    function checkAdStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const blockUntil = localStorage.getItem('adBlockUntil');

        if (urlParams.get('admin') === 'true') {
            isAdmin = true; // 관리자 상태 플래그 설정
            hideAdWithMessage('관리자 모드입니다.');
            return;
        }

        if (blockUntil && Date.now() < parseInt(blockUntil)) {
            hideAdWithMessage('광고가 일시 중단되었습니다.');
        }
    }

    function hideAdWithMessage(message) {
        adsContainer.innerHTML = `<div class="ad-message">${message}</div>`;
        adsContainer.style.minHeight = 'auto';
    }

    // --- 6. 헬퍼 함수 ---
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
    
    // --- 초기화 함수 실행 ---
    initialize();
});
// ------------ END: 여기까지의 코드로 script.js 파일 전체를 교체해주세요. ------------