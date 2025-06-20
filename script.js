document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v1.3-stable');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    function renderCalendarView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        html += `<p>${data.description}</p><hr>`;
        if (data.events && data.events.length > 0) {
            html += '<div class="event-list">';
            data.events.forEach(event => {
                const typeClass = event.type === 'ranking' ? 'label-ranking' : 'label-limited';
                html += `<div class="event-item"><span class="event-date">${event.date}</span><span class="event-type ${typeClass}">${event.type === 'ranking' ? '랭킹' : '한정'}</span><span class="event-title">${event.title}</span></div>`;
            });
            html += '</div>';
        } else {
            html += '<p>예정된 이벤트가 없습니다.</p>';
        }
        contentDiv.innerHTML = html;
    }

    function renderPokemonView(contentDiv, data) {
        contentDiv.innerHTML = `<h2>${data.name} (${data.grade})</h2><p>포켓몬 상세 화면 개발 예정입니다.</p>`;
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
    
    // [수정] initialize 함수 - 버그 수정된 로직을 다시 활성화합니다.
    function initialize() {
        // --- [수정 완료] 포켓몬 등급 메뉴를 동적으로 생성하는 로직 ---
        const gradeCategory = 'pokemonGrade';
        if (DB[gradeCategory] && DB.pokemonType?.lev4) {
            const grades = {};
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                if (pokemon.grade) {
                    if (!grades[pokemon.grade]) grades[pokemon.grade] = [];
                    grades[pokemon.grade].push({ ...pokemon, id: pokemonId });
                }
            });

            DB[gradeCategory].lev3 = {};
            Object.keys(grades).forEach(gradeKey => { // gradeKey는 'S+', 'S'
                 // gradeKey('S+')와 일치하는 name을 가진 lev2 항목을 찾아, 그 항목의 id('sPlus')를 사용합니다.
                 const gradeInfo = DB.pokemonGrade.lev2.find(g => g.name === gradeKey);
                 if (gradeInfo) {
                    const gradeId = gradeInfo.id; // 'sPlus' 또는 's'
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
            if (menuId === 'pokemonGrade') {
                return DB.pokemonType.lev4[id];
            }
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