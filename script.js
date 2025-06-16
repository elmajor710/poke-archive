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

    // --- 무효 트래픽 방지 설정 ---
    const AD_CLICK_LIMIT = 5; // 클릭 제한 횟수
    const AD_CLICK_TIME_WINDOW = 60 * 60 * 1000; // 1시간 (밀리초)

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
        
        // 광고 컨테이너에만 클릭 리스너 추가
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

        // [재활성화] 광고 새로고침 코드
        if (window.adsbygoogle && adsContainer.style.display !== 'none') {
            (adsbygoogle = window.adsbygoogle || []).push({});
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
        const now = Date.now();
        let adClicks = JSON.parse(localStorage.getItem('adClicks')) || [];

        // 1시간이 지난 클릭 기록은 삭제
        adClicks = adClicks.filter(timestamp => (now - timestamp) < AD_CLICK_TIME_WINDOW);

        // 새 클릭 기록 추가
        adClicks.push(now);
        localStorage.setItem('adClicks', JSON.stringify(adClicks));

        // 클릭 제한 횟수 확인
        if (adClicks.length >= AD_CLICK_LIMIT) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0); // 다음날 자정
            
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

    function checkAdStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const blockUntil = localStorage.getItem('adBlockUntil');

        // 관리자 모드 확인
        if (urlParams.get('admin') === 'true') {
            hideAdWithMessage('관리자 모드입니다.');
            return;
        }

        // 차단 기간 확인
        if (blockUntil && Date.now() < parseInt(blockUntil)) {
            hideAdWithMessage('광고가 일시 중단되었습니다.');
        }
    }

    function hideAdWithMessage(message) {
        adsContainer.innerHTML = `<div class="ad-message">${message}</div>`;
        adsContainer.style.minHeight = 'auto'; // 메시지만 보이도록 높이 조절
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