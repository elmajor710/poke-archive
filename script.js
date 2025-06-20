document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    // --- 화면 생성기 함수들 (이전과 동일) ---
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
        html += `<p>${data.description.replace(/\n/g, '<br>')}</p>`;
        contentDiv.innerHTML = html;
    }

    // --- [수정됨] renderPanel 함수 ---
    // 최종 화면(isFinal)일 때, 다른 패널들을 확실히 숨기는 로직이 추가되었습니다.
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
            
            // [핵심 수정] 최종 화면을 표시하기 전, 모든 패널을 일단 숨깁니다.
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

    // --- [수정됨] initialize 함수 ---
    // 포켓몬 등급 목록 생성 시, 각 포켓몬의 고유 id를 정확히 참조하도록 수정했습니다.
    function initialize() {
        const gradeCategory = 'pokemonGrade';
        if (DB[gradeCategory] && DB.pokemonType) {
            const grades = {};
            // Object.entries를 사용해 포켓몬의 고유 id(key)와 데이터(pokemon)를 모두 가져옵니다.
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                if (pokemon.grade) {
                    if (!grades[pokemon.grade]) grades[pokemon.grade] = [];
                    // 데이터에 고유 id를 포함하여 저장합니다.
                    grades[pokemon.grade].push({ ...pokemon, id: pokemonId });
                }
            });

            DB[gradeCategory].lev3 = {};
            Object.keys(grades).forEach(gradeKey => {
                 const gradeId = gradeKey.toLowerCase().replace('+', 'Plus');
                 // 버튼 생성 시, 이름이 아닌 고유 id를 사용하도록 수정합니다.
                 DB[gradeCategory].lev3[gradeId] = grades[gradeKey].map(p => ({id: p.id, name: p.name}));
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
    
    // --- [수정됨] getNextData 함수 ---
    // '포켓몬 등급' 카테고리에서 포켓몬을 선택했을 때, pokemonType에서 데이터를 가져오도록 수정했습니다.
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) {
            // '포켓몬 등급' 메뉴의 최종 데이터는 '포켓몬 타입' 데이터를 참조합니다.
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