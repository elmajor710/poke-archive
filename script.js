document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v10.1-final-fix');

    const appContainer = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    function showPanels(level) {
        Object.values(panels).forEach(panel => panel.classList.remove('visible'));
        appContainer.className = '';

        const activeMenuId = activeButtons[1]?.dataset.id;
        if (!activeMenuId) return; 

        const categoryInfo = DB.sidebarMenu.find(item => item.id === activeMenuId);
        const isFinalView = categoryInfo && level === categoryInfo.levels;

        if (isFinalView) {
            appContainer.className = `final-view-L${level}`;
            if (panels[`lev${level}`]) {
                panels[`lev${level}`].classList.add('visible');
            }
        } else {
            for (let i = 2; i <= level; i++) {
                if (panels[`lev${i}`]) {
                    panels[`lev${i}`].classList.add('visible');
                }
            }
        }
    }

    function renderContent(panel, data, level, menuId) {
        const contentDiv = panel.querySelector('.panel-content');
        contentDiv.innerHTML = '';
        setTimeout(() => { contentDiv.scrollTop = 0; }, 0);

        if (!data) {
            contentDiv.innerHTML = "데이터가 없습니다.";
            return;
        }

        const isFinal = !Array.isArray(data);
        if (isFinal) {
            contentDiv.innerHTML = data.description || data.content || "상세 정보입니다.";
        } else {
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
        }
    }
    
    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
    }

    function addEventListeners() {
        appContainer.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;

            if (button.classList.contains('back-btn')) {
                const parentPanel = button.closest('.panel');
                const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
                
                // [핵심 수정] 현재 레벨의 활성화된 버튼을 비활성화 합니다.
                setActive(level, null);
                // [핵심 수정] 이전 레벨의 화면 구성을 보여줍니다.
                showPanels(level - 1);
            } else if (button.dataset.level) {
                handleMenuClick(button);
            }
        });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        
        setActive(level, button);

        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId);
        
        const targetPanel = panels[`lev${nextLevel}`];
        if (targetPanel) {
            renderContent(targetPanel, nextData, nextLevel, menuId);
            showPanels(nextLevel);
        }
    }
    
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }

    function setActive(level, target) {
        for (let i = level; i <= 4; i++) {
            if(activeButtons[i]) {
                activeButtons[i].classList.remove('active');
                activeButtons[i] = null;
            }
        }
        if (target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }
    
    initialize();
});