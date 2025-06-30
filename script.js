document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v9.2-final');

    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    function renderSimpleView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        if (data.imageURL && data.imageURL.startsWith('http')) {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin: 10px 0;">`;
        }
        if (data.baseStats && Object.values(data.baseStats).some(v => v !== 0)) {
            html += '<h4>기초 타입</h4><table class="stats-table">';
            Object.entries(data.baseStats).forEach(([stat, value]) => {
                if (value !== 0) {
                    html += `<tr><td>${stat}</td><td>+${value}</td></tr>`;
                }
            });
            html += '</table>';
        }
        if (data.description) {
            html += '<h4 style="margin-top: 15px;">휴대 효과</h4>';
            const descriptionLines = data.description.split('\\n');
            let processedDescription = '';
            descriptionLines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    if (trimmedLine.includes(':')) {
                        const parts = trimmedLine.split(':');
                        processedDescription += `<p><strong>${parts[0]}:</strong> ${parts.slice(1).join(':')}</p>`;
                    } else {
                        processedDescription += `<p>${trimmedLine}</p>`;
                    }
                }
            });
            html += `<div class="item-description">${processedDescription}</div>`;
        }
        contentDiv.innerHTML = html;
    }

    function renderPanel(level, data, menuId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        contentDiv.innerHTML = '';
        setTimeout(() => { contentDiv.scrollTop = 0; }, 0);
        if (!data) {
            contentDiv.innerHTML = "데이터가 없습니다.";
            targetPanel.classList.add('visible');
            return;
        }
        const isFinal = !Array.isArray(data);
        if (isFinal) {
            const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
            const finalLevelForCategory = categoryInfo ? categoryInfo.levels : 0;
            appContainer.className = `final-view-L${finalLevelForCategory}`;
            Object.values(panels).forEach(p => p.classList.remove('visible'));
            renderSimpleView(contentDiv, data);
        } else {
            appContainer.className = "";
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
        targetPanel.classList.add('visible');
    }

    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
    }

    function addEventListeners() {
        appContainer.addEventListener('click', e => {
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

        for (let i = level + 1; i <= 4; i++) {
            if (panels[`lev${i}`]) {
                panels[`lev${i}`].classList.remove('visible');
            }
        }
        
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId);
        renderPanel(nextLevel, nextData, menuId);
    }

    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        parentPanel.classList.remove('visible');
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        setActive(level - 1, null);
    }

    function setActive(level, target) {
        if(activeButtons[level]) activeButtons[level].classList.remove('active');
        if(target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }

    initialize();
});