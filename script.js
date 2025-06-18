document.addEventListener('DOMContentLoaded', () => {
    // 1. 변수 설정
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
    const adsContainer = document.getElementById('ads-container');
    const panels = { lev2: document.getElementById('lev2-panel'), lev3: document.getElementById('lev3-panel'), lev4: document.getElementById('lev4-panel') };
    let activeButtons = {};
    let isAdmin = false;

    // 2. 초기화
    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
    }

    // 3. 이벤트 리스너
    function addEventListeners() {
        // 클릭과 터치 이벤트를 모두 처리하여 모바일 호환성 강화
        ['click', 'touchend'].forEach(eventType => {
            app.addEventListener(eventType, (e) => {
                // 터치 이벤트 시, 기본 스크롤 동작과 겹치지 않도록 처리
                if (e.type === 'touchend') e.preventDefault();
                
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
        });
    }

    // 4. 클릭 핸들러
    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const context = button.dataset;

        setActive(level, button);

        const nextLevel = level + 1;
        if (nextLevel > 5) return;

        let nextData;
        if (nextLevel === 2) {
            nextData = DB[id]?.lev2;
        } else if (nextLevel === 3) {
            nextData = DB[context.menuId]?.lev3?.[id];
        } else if (nextLevel === 4) {
            nextData = DB[context.menuId]?.lev4?.[id];
        }
        
        renderPanel(nextLevel, nextData, context);
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        parentPanel.classList.remove('visible');
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        const level = parseInt(parentPanel.id.slice(-1));
        setActive(level - 1, null);
    }

    // 5. 화면 렌더링
// --- 이 renderPanel 함수를 아래의 새로운 내용으로 통째로 교체해주세요 ---
function renderPanel(level, data, context) {
    // 현재 레벨 이후의 모든 패널을 초기화
    for (let i = level; i <= 4; i++) {
        panels[`lev${i}`].classList.remove('visible');
        panels[`lev${i}`].querySelector('.panel-content').innerHTML = '';
    }

    if (!data) return;

    const targetPanel = panels[`lev${level}`];
    if (!targetPanel) return;

    const contentDiv = targetPanel.querySelector('.panel-content');
    const isFinal = !Array.isArray(data);

    // 최종 화면 클래스를 초기화
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

    // [최종 수정] 브라우저가 내용을 그린 후 스크롤을 초기화하도록 타이밍을 조정합니다.
    setTimeout(() => {
        contentDiv.scrollTop = 0;
    }, 0);
}

    // 6. 헬퍼 함수
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
    
    // --- 초기화 함수 실행 ---
    initialize();
});