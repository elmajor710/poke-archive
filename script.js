document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
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
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const context = button.dataset;

        if (level === 1) {
            app.classList.remove('fullscreen-active');
        }

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
        app.classList.remove('fullscreen-active');
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel',''));
        setActive(level - 1, null);
    }

    function renderPanel(level, data, context) {
        for (let i = level; i <= 4; i++) {
            if (panels[`lev${i}`]) {
                panels[`lev${i}`].classList.remove('visible');
                panels[`lev${i}`].querySelector('.panel-content').innerHTML = '';
            }
        }

        if (!data) return;
        
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;

        const contentDiv = targetPanel.querySelector('.panel-content');
        const isFinal = !Array.isArray(data);
        
        app.classList.remove('fullscreen-active');
        
        if (isFinal) {
            contentDiv.innerHTML = data.content;
            contentArea.classList.add(`final-view-L${level}`);
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
        setTimeout(() => {
            if (contentDiv) contentDiv.scrollTop = 0;
        }, 0);
    }

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
    
    initialize();
});