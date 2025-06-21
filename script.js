document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v3.0-stable');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    // 1단계에서는 텍스트 목록으로 되돌립니다.
    function renderCalendarView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        html += `<p>${data.description}</p><hr>`;
        if (data.events && data.events.length > 0) {
            html += '<div class="event-list">';
            data.events.forEach(event => {
                const typeClass = event.type === 'ranking' ? 'label-ranking' : 'label-limited';
                html += `<div class="event-item"><span class="event-date">${event.date}</span><span class="event-type ${typeClass}">${event.type}</span><span class="event-title">${event.title}</span></div>`;
            });
            html += '</div>';
        } else {
            html += '<p>예정된 이벤트가 없습니다.</p>';
        }
        contentDiv.innerHTML = html;
    }

    function renderPokemonView(contentDiv, data) {
        // 이 부분은 나중에 상세 기획에 맞춰 개발합니다.
        let html = `<h2>${data.name} (${data.grade})</h2>`;
        if (data.imageURL && data.imageURL.startsWith('http')) {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`;
        }
        html += `<p>포켓몬 상세 화면 개발 예정입니다.</p>`;
        contentDiv.innerHTML = html;
    }

    function renderSimpleView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        if (data.imageURL && data.imageURL.startsWith('http')) {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`;
        }
        if (data.description) {
            html += `<p>${data.description.replace(/\n/g, '<br>')}</p>`;
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
        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        const finalLevelForCategory = categoryInfo ? categoryInfo.levels : 0;
        const isFinal = !Array.isArray(data);
        if (isFinal) {
            app.className = `final-view-L${finalLevelForCategory}`;
            Object.values(panels).forEach(p => p.classList.remove('visible'));
            if (data.events) {
                renderCalendarView(contentDiv, data);
            } else if (data.stats && data.skills) {
                renderPokemonView(contentDiv, data);
            } else if (data.description) {
                renderSimpleView(contentDiv, data);
            } else {
                contentDiv.innerHTML = data.content || "콘텐츠를 표시할 수 없습니다.";
            }
        } else {
            app.className = "";
            data.forEach(item => {
                const button = document.createElement('button');
                button.className = 'list-item';
                button.textContent = item.name;
                button.dataset.id = item.id;
                button.dataset.level = level;
                button.dataset.menuId = menuId;
                if (item.color) { button.classList.add(`type-${item.color}`); }
                contentDiv.appendChild(button);
            });
        }
        targetPanel.classList.add('visible');
    }
    
    function initialize() {
        const gradeCategory = 'pokemonGrade';
        if (DB[gradeCategory] && DB.pokemonType?.lev4) {
            const grades = {};
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                if (pokemon && pokemon.grade) {
                    if (!grades[pokemon.grade]) grades[pokemon.grade] = [];
                    grades[pokemon.grade].push({ ...pokemon, id: pokemonId });
                }
            });
            DB[gradeCategory].lev3 = {};
            Object.keys(grades).forEach(gradeKey => {
                 const gradeInfo = DB.pokemonGrade.lev2.find(g => g.name === gradeKey);
                 if (gradeInfo) {
                    const gradeId = gradeInfo.id;
                    DB[gradeCategory].lev3[gradeId] = grades[gradeKey].map(p => ({id: p.id, name: p.name}));
                 }
            });
        }
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
    }

    function addEventListeners() {
        app.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('calendar-nav-btn')) {
                // 이 부분은 Phase 2에서 다시 구현합니다.
                return; 
            }
            if (button.classList.contains('back-btn')) handleBackClick(button);
            else if (button.dataset.level) handleMenuClick(button);
        });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        if (level === 1) { app.className = ""; }
        setActive(level, button);
        for (let i = level + 1; i <= 4; i++) {
             if (panels[`lev${i}`]) { panels[`lev${i}`].classList.remove('visible'); }
        }
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId);
        renderPanel(nextLevel, nextData, menuId);
    }
    
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) {
            if (menuId === 'pokemonGrade') { return DB.pokemonType.lev4[id]; }
            return DB[menuId]?.lev4?.[id];
        }
        return null;
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        parentPanel.classList.remove('visible');
        setActive(level - 1, null);
        app.className = ""; 
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