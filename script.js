document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    const popupOverlay = document.getElementById('popup-overlay');
    const popupBody = document.getElementById('popup-body');
    const popupCloseBtn = document.getElementById('popup-close');
    
    let activeButtons = {};
    let isMobile = window.innerWidth <= 768;

    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
        refreshAd(); // 초기 광고 로드
    }

    function addEventListeners() {
        app.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                if (button.classList.contains('back-btn')) handleBackClick(button);
                else if (button.dataset.level) handleMenuClick(button);
                return;
            }
            const popupTrigger = e.target.closest('[data-popup-id]');
            if(popupTrigger) handlePopupTrigger(popupTrigger);
        });

        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay || e.target === popupCloseBtn) {
                popupOverlay.classList.remove('visible');
            }
        });
        window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });
    }

    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const context = button.dataset;
        
        refreshAd(); // 메뉴 클릭 시 광고 새로고침
        setActive(level, button);

        const nextLevel = level + 1;
        if (nextLevel > 4) return;

        let nextData;
        const menuId = context.menuId || id;
        
        if (nextLevel === 2) {
            nextData = DB[menuId]?.lev2;
        } else if (nextLevel === 3) {
            nextData = DB[menuId]?.lev3?.[id];
        } else if (nextLevel === 4) {
            nextData = DB[menuId]?.lev4?.[id];
        }
        
        renderPanel(nextLevel, nextData, { ...context, menuId });
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
        // Clear subsequent panels
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
            contentDiv.innerHTML = createDetailHtml(data, context.menuId);
            contentArea.className = 'final-view-L' + level;
            
            const isPokemonDetail = context.menuId === 'pokemonType' || context.menuId === 'pokemonGrade';
            if (isMobile && level === 4 && isPokemonDetail) {
                 app.classList.add('fullscreen-active');
            }
        } else {
            contentArea.className = '';
            data.forEach(item => {
                const button = document.createElement('button');
                button.className = 'list-item';
                button.textContent = item.name;
                Object.assign(button.dataset, { id: item.id, level: level, menuId: context.menuId });
                if (level > 2) button.dataset.lev2Id = context.id;
                if (item.color) button.style.backgroundColor = item.color;
                contentDiv.appendChild(button);
            });
        }
        
        targetPanel.classList.add('visible');
    }

    function createDetailHtml(data, menuId) {
        if (menuId === 'pokemonType' || menuId === 'pokemonGrade') return createPokemonDetailHtml(data);
        if (menuId === 'item') return createItemDetailHtml(data);
        if (menuId === 'runeAndChip') return createRuneChipDetailHtml(data);
        return `<div class="detail-card">${data.content || ''}</div>`;
    }

    function createPokemonDetailHtml(p) {
        const findItem = (id) => DB.item.lev4[id] || {};
        const findRuneChip = (id) => DB.runeAndChip.lev4[id] || {};

        return `
            <div class="detail-card pokemon-detail-card">
                <div class="pokemon-main-info">
                    <img src="${p.imgUrl}" alt="${p.name}">
                    <div class="pokemon-stats">
                        <h3>${p.name}</h3>
                        <p><strong>등급:</strong> ${p.grade}</p>
                        <p><strong>타입:</strong> ${p.types.map(t => `<span class="type-badge">${t}</span>`).join('')}</p>
                    </div>
                </div>
                <div class="detail-section">
                    <h4>스킬 정보</h4>
                    <p><strong>액티브:</strong> ${p.skills.active}</p>
                    <p><strong>패시브:</strong> ${p.skills.passive}</p>
                </div>
                ${p.items?.length > 0 ? `
                <div class="detail-section">
                    <h4>추천 아이템</h4>
                    <div class="item-grid">
                        ${p.items.map(id => {
                            const item = findItem(id);
                            return `<img src="${item.imgUrl}" alt="${item.name}" data-popup-id="${id}" data-popup-type="item">`;
                        }).join('')}
                    </div>
                </div>` : ''}
                ${p.runes?.length > 0 ? `
                <div class="detail-section">
                    <h4>추천 룬</h4>
                    <div class="item-grid">
                        ${p.runes.map(id => {
                            const rune = findRuneChip(id);
                            return `<img src="${rune.imgUrl}" alt="${rune.name}" data-popup-id="${id}" data-popup-type="runeAndChip">`;
                        }).join('')}
                    </div>
                </div>` : ''}
                 ${p.chips?.length > 0 ? `
                <div class="detail-section">
                    <h4>추천 칩</h4>
                    <div class="item-grid">
                         ${p.chips.map(id => {
                            const chip = findRuneChip(id);
                            return `<img src="${chip.imgUrl}" alt="${chip.name}" data-popup-id="${id}" data-popup-type="runeAndChip">`;
                        }).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;
    }

    function createItemDetailHtml(item) {
        return `
            <div class="detail-card">
                <h3>${item.name}</h3>
                <img src="${item.imgUrl}" alt="${item.name}" style="float: left; margin-right: 15px; width: 96px; height: 96px;">
                <p><strong>기초 타입:</strong> ${item.type}</p>
                <p><strong>휴대 효과:</strong> ${item.effect}</p>
            </div>
        `;
    }
    
    function createRuneChipDetailHtml(rc) {
         return `
            <div class="detail-card">
                <h3>${rc.name}</h3>
                <img src="${rc.imgUrl}" alt="${rc.name}" style="float: left; margin-right: 15px; width: 96px; height: 96px;">
                <p><strong>세트 효과:</strong> ${rc.setImage}</p>
                <p><strong>효과:</strong> ${rc.effect}</p>
            </div>
        `;
    }

    function handlePopupTrigger(element) {
        const id = element.dataset.popupId;
        const type = element.dataset.popupType;
        const data = DB[type]?.lev4?.[id];
        if (data && data.description) {
            popupBody.innerHTML = data.description;
            popupOverlay.classList.add('visible');
        }
    }
    
    function setActive(level, target) {
        for (let i = 1; i <= 4; i++) {
            if (activeButtons[i] && (i >= level)) {
                activeButtons[i].classList.remove('active');
                activeButtons[i] = null;
            }
        }
        if (target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }
    
    // --- 여기부터 ---
function refreshAd() {
    try {
        const adContainer = document.getElementById('ads-container');
        if (!adContainer) return;

        requestAnimationFrame(() => {
            adContainer.innerHTML = '';
            
            const adIns = document.createElement('ins');
            adIns.className = 'adsbygoogle';
            
            // --- 수정된 부분: 반응형 속성 제거 및 고정 크기 스타일 추가 ---
            adIns.style.display = 'inline-block';
            adIns.style.width = '320px';
            adIns.style.height = '100px';
            // --------------------------------------------------------

            adIns.dataset.adClient = 'ca-pub-2125965839205311';
            adIns.dataset.adSlot = '5532734526';
            
            adContainer.appendChild(adIns);
            
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                console.log("Ad refreshed with FIXED SIZE (320x100).");
            } catch (pushError) {
                console.error("adsbygoogle.push() failed: ", pushError);
            }
        });

    } catch (e) {
        console.error("Ad refresh setup failed: ", e);
    }
}

// --- 여기까지 ---
    
    initialize();
});