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
    // --- 이 handleMenuClick 함수 전체를 아래의 새로운 내용으로 교체해주세요 ---
function handleMenuClick(button) {
    const level = parseInt(button.dataset.level);
    const id = button.dataset.id;
    const context = button.dataset.context;

    // 현재 상태 저장
    const currentData = getDataByPath(currentDataContext, currentDataPath);
    if (currentData) {
        navigationHistory.push({
            path: [...currentDataPath],
            context: currentDataContext
        });
    }

    // 새 경로 설정
    currentDataContext = context || id;
    currentDataPath = [id];

    // 새 데이터 렌더링
    const nextData = getDataByPath(currentDataContext, currentDataPath);
    renderContent(nextData);

    // 스크롤 위치 초기화
    const contentPanel = document.querySelector('.content');
    if(contentPanel) {
        contentPanel.scrollTop = 0;
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

    // --- 이 "refreshAdSlot" 함수를 통째로 교체해주세요 ---
// --- 이 "refreshAdSlot" 함수를 통째로 교체해주세요 ---
function refreshAdSlot() {
    // 광고가 숨겨진 상태이거나 관리자 모드이면 함수를 실행하지 않음
    if (adsContainer.querySelector('.ad-message')) {
        return;
    }

    // 광고 슬롯을 동적으로 생성하여 push 오류를 원천 차단
    adsContainer.innerHTML = ''; // 기존 광고 제거
    
    // 광고 로딩 스크립트
    const adScript = document.createElement('script');
    adScript.async = true;
    adScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2125965839205311";
    adScript.crossOrigin = "anonymous";
    // 스크립트 로드 실패 시 오류를 콘솔에 기록 (디버깅용)
    adScript.onerror = () => console.error("AdSense script failed to load.");

    // 실제 광고 슬롯
    const adIns = document.createElement('ins');
    adIns.className = "adsbygoogle";
    // [수정] 광고 슬롯 자체에 최소 크기를 지정하여 'No slot size' 오류 방지
    Object.assign(adIns.style, { display: 'block', width: '100%', minHeight: '50px', textAlign: 'center' });
    // [최종 수정] fullWidthResponsive를 "false"로 변경합니다.
    Object.assign(adIns.dataset, { adClient: "ca-pub-2125965839205311", adSlot: "5532734526", adFormat: "auto", fullWidthResponsive: "false" });
    
    // 광고 실행 스크립트
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