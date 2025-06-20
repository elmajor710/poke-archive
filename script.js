document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};
    let isMobile = window.innerWidth <= 768;

    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
    }

    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) handleBackClick(button);
            else if (button.dataset.level) handleMenuClick(button);
        });
        window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        
        // 메뉴를 새로 클릭하면, 이전 뷰 상태를 모두 초기화
        if (level === 1) {
            app.className = "";
        }

        setActive(level, button);

        // 현재 레벨 이후의 모든 패널을 닫음
        for (let i = level + 1; i <= 4; i++) {
            panels[`lev${i}`].classList.remove('visible');
        }

        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId);
        renderPanel(nextLevel, nextData, menuId);
    }
    
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 2) return DB[id]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        parentPanel.classList.remove('visible');
        setActive(level - 1, null);
        app.className = ""; // 뒤로가기 시 항상 뷰 상태 초기화
    }
    
    // --- 이 renderPanel 함수를 아래의 새로운 내용으로 통째로 교체해주세요 ---
function renderPanel(level, data, menuId) {
    // 현재 레벨 이후의 모든 패널을 초기화
    for (let i = level; i <= 4; i++) {
        const panelContent = panels[`lev${i}`]?.querySelector('.panel-content');
        if (panelContent) {
            panels[`lev${i}`].classList.remove('visible');
            panelContent.innerHTML = '';
        }
    }

    if (!data) return;

    const targetPanel = panels[`lev${level}`];
    if (!targetPanel) return;

    const contentDiv = targetPanel.querySelector('.panel-content');
    setTimeout(() => { contentDiv.scrollTop = 0; }, 0);

    const isFinal = !Array.isArray(data);
    const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
    const finalLevelForCategory = categoryInfo ? categoryInfo.levels : 0;
    
    // [수정] 최종 레벨에 도달했는지 정확하게 판단
    if (isFinal || level >= finalLevelForCategory) {
        // 최종 화면일 경우, 올바른 클래스를 app-container에 추가
        app.className = `final-view-L${finalLevelForCategory}`;
        // 최종 레벨에 맞는 패널에 콘텐츠를 표시
        const finalPanel = panels[`lev${finalLevelForCategory}`];
        if (finalPanel) {
            finalPanel.querySelector('.panel-content').innerHTML = data.content || "데이터가 없습니다.";
            finalPanel.classList.add('visible');
        }
    } else {
        // 중간 단계일 경우, 뷰 클래스 초기화
        app.className = "";
        data.forEach(item => {
            const button = document.createElement('button');
            button.className = 'list-item';
            button.textContent = item.name;
            button.dataset.id = item.id;
            button.dataset.level = level;
            button.dataset.menuId = menuId;
            if (item.color) {
                button.classList.add(`type-${item.color}`);
            }
            contentDiv.appendChild(button);
        });
        targetPanel.classList.add('visible');
    }
}

    function setActive(level, target) {
        for (let i = level; i <= 4; i++) {
            if (activeButtons[i]) activeButtons[i].classList.remove('active');
        }
        if (target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }
    
    initialize();
});