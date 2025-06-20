// 무효 트래픽 방지 로직 (전역 스코프)
const AD_CLICK_LIMIT = 3;
const AD_TIME_WINDOW_MS = 5 * 60 * 1000; // 5분
const AD_STORAGE_KEY = 'adClickHistory';

function isAdminMode() {
    return new URLSearchParams(window.location.search).get('admin') === 'true';
}

function handleAdClick() {
    if (isAdminMode()) return;
    const now = Date.now();
    let clickHistory = JSON.parse(localStorage.getItem(AD_STORAGE_KEY)) || [];
    const validClicks = clickHistory.filter(timestamp => (now - timestamp) < AD_TIME_WINDOW_MS);
    validClicks.push(now);
    console.log(`Ad click detected. Count in last 5 minutes: ${validClicks.length}`);
    if (validClicks.length >= AD_CLICK_LIMIT) {
        console.warn(`CLICK LIMIT REACHED! Forcing page reload.`);
        localStorage.removeItem(AD_STORAGE_KEY);
        window.location.reload(true);
    } else {
        localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(validClicks));
    }
}

// UI 제어 로직
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const adsContainer = document.getElementById('ads-container');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        if (isAdminMode()) {
             adsContainer.style.display = 'none';
        }
        addEventListeners();
    }

    function addEventListeners() {
        if (!isAdminMode() && adsContainer) {
            adsContainer.addEventListener('click', handleAdClick);
        }
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) handleBackClick(button);
            else if (button.dataset.level) handleMenuClick(button);
        });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        setActive(level, button);
        const nextData = getNextData(level, id, menuId);
        renderPanel(level + 1, nextData, menuId);
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
        app.className = "";
    }
    
    function renderPanel(startLevel, data, menuId) {
        for (let i = startLevel; i <= 4; i++) {
            panels[`lev${i}`].classList.remove('visible');
        }
        if (!data) return;

        const targetPanel = panels[`lev${startLevel}`];
        if (!targetPanel) return;

        const contentDiv = targetPanel.querySelector('.panel-content');
        setTimeout(() => { contentDiv.scrollTop = 0; }, 0);

        const isFinal = !Array.isArray(data);
        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        const finalLevelForCategory = categoryInfo ? categoryInfo.levels : 0;
        
        // 최종 레벨에 도달했는지, 또는 더 이상 하위 아이템이 없는 최종 콘텐츠인지 확인
        if (isFinal || startLevel > finalLevelForCategory) {
            app.className = `final-view-L${startLevel-1}`; // 최종 레벨 클래스는 (현재 레벨 - 1)
            contentDiv.innerHTML = data.content;
        } else {
            app.className = "";
            data.forEach(item => {
                const button = document.createElement('button');
                button.className = 'list-item';
                button.textContent = item.name;
                button.dataset.id = item.id;
                button.dataset.level = startLevel;
                button.dataset.menuId = menuId;
                contentDiv.appendChild(button);
            });
        }
        targetPanel.classList.add('visible');
    }

    function setActive(level, target) {
        for (let i = level; i <= 4; i++) {
            if(activeButtons[i]) activeButtons[i].classList.remove('active');
        }
        if (target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }
    
    initialize();
});