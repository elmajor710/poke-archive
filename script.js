document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    // --- 신규 함수: 캘린더 데이터를 화면에 그립니다 ---
    function renderCalendarView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        html += `<p>${data.description}</p><hr>`;
        
        // 'events' 배열의 각 항목을 목록으로 변환합니다.
        if (data.events && data.events.length > 0) {
            html += '<div class="event-list">';
            data.events.forEach(event => {
                // 이벤트 타입에 따라 라벨 색상을 다르게 줄 수 있습니다. (향후 확장용)
                const typeClass = event.type === 'ranking' ? 'label-ranking' : 'label-limited';
                html += `<div class="event-item">
                            <span class="event-date">${event.date}</span>
                            <span class="event-type ${typeClass}">${event.type === 'ranking' ? '랭킹' : '한정'}</span>
                            <span class="event-title">${event.title}</span>
                         </div>`;
            });
            html += '</div>';
        } else {
            html += '<p>예정된 이벤트가 없습니다.</p>';
        }
        contentDiv.innerHTML = html;
    }

    // --- 신규 함수: 포켓몬 상세 데이터를 화면에 그립니다 (현재는 임시) ---
    function renderPokemonView(contentDiv, data) {
        contentDiv.innerHTML = `<h2>${data.name} (${data.grade})</h2><p>포켓몬 상세 화면 개발 예정입니다.</p>`;
    }

    // --- 신규 함수: 아이템, 룬 등 단순 데이터를 화면에 그립니다 ---
    function renderSimpleView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;
        if (data.imageURL && data.imageURL !== '이미지URL_준비중') {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin-bottom: 10px;">`;
        }
        html += `<p>${data.description.replace(/\n/g, '<br>')}</p>`;
        contentDiv.innerHTML = html;
    }


    // --- 수정된 함수: renderPanel ---
    // 데이터 종류를 확인하고, 그에 맞는 render 함수를 호출하는 '라우터' 역할을 하도록 수정되었습니다.
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

            // --- 여기가 핵심 수정 부분 ---
            // 데이터의 내용에 따라 어떤 화면을 그릴지 결정합니다.
            if (data.events) { // 캘린더 데이터일 경우
                renderCalendarView(contentDiv, data);
            } else if (data.stats && data.skills) { // 포켓몬 데이터일 경우
                renderPokemonView(contentDiv, data);
            } else if (data.description) { // 아이템, 룬 등 단순 설명 데이터일 경우
                renderSimpleView(contentDiv, data);
            } else { // 기존 방식 호환용
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
                if (item.color) {
                    button.classList.add(`type-${item.color}`);
                }
                contentDiv.appendChild(button);
            });
        }
        targetPanel.classList.add('visible');
    }

    // --- 이하 함수들은 기존과 동일합니다 ---
    function initialize() {
        // '포켓몬 등급' 메뉴를 동적으로 생성
        const gradeCategory = 'pokemonGrade';
        if (DB[gradeCategory]) {
            const grades = {};
            Object.values(DB.pokemonType.lev4).forEach(pokemon => {
                if (pokemon.grade) {
                    if (!grades[pokemon.grade]) grades[pokemon.grade] = [];
                    grades[pokemon.grade].push(pokemon);
                }
            });

            DB[gradeCategory].lev3 = {};
            Object.keys(grades).forEach(gradeKey => {
                 const gradeId = gradeKey.toLowerCase().replace('+', 'Plus');
                 DB[gradeCategory].lev3[gradeId] = grades[gradeKey].map(p => ({id: p.name.toLowerCase(), name: p.name}));
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
        
        if (level === 1) {
            app.className = "";
        }

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