// ------------ START: 이 아래의 코드로 script.js 파일 전체를 교체해주세요. ------------

// =======================================================================
// 광고 관리 기능 (AdManager)
// =======================================================================

// --- 설정값 ---
const AD_CLICK_LIMIT = 5;
const AD_TIME_WINDOW_MS = 60 * 60 * 1000;
const AD_STORAGE_KEY = 'adClickData';

// --- 광고 관리 함수들 ---

function isAdminMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('admin') === 'true';
}

function getAdData() {
    try {
        const data = localStorage.getItem(AD_STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed.clicks) && typeof parsed.blockUntil !== 'undefined') {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Error reading ad data from localStorage:", e);
    }
    return { clicks: [], blockUntil: null };
}

function setAdData(data) {
    try {
        localStorage.setItem(AD_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Error writing ad data to localStorage:", e);
    }
}

function canShowAd() {
    if (isAdminMode()) {
        console.log("Admin mode: Ads hidden.");
        return false;
    }
    const data = getAdData();
    if (data.blockUntil && Date.now() < data.blockUntil) {
        const blockEndTime = new Date(data.blockUntil).toLocaleString();
        console.warn(`Ads currently blocked until: ${blockEndTime}`);
        return false;
    }
    return true;
}

function loadInitialAd() {
    if (!canShowAd()) {
        hideAdContainer("광고가 일시 중단되었습니다.");
        return;
    }

    const adContainer = document.getElementById('ads-container');
    if (!adContainer) return;

    requestAnimationFrame(() => {
        adContainer.innerHTML = '';
        const adIns = document.createElement('ins');
        adIns.className = 'adsbygoogle';
        adIns.style.display = 'block';
        adIns.dataset.adClient = 'ca-pub-2125965839205311';
        adIns.dataset.adSlot = '2123059829';
        adIns.dataset.adFormat = 'auto';
        adIns.dataset.fullWidthResponsive = 'true';
        adContainer.appendChild(adIns);
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            console.log("Ad loaded successfully.");
        } catch (e) {
            console.error("adsbygoogle.push() failed: ", e);
        }
    });
}

function hideAdContainer(message) {
    const adContainer = document.getElementById('ads-container');
    if (adContainer) {
        adContainer.innerHTML = `<div style="text-align:center; padding: 20px; color: #888;">${message}</div>`;
    }
}

function recordAdClick() {
    if (isAdminMode()) return;
    
    const data = getAdData();
    if (data.blockUntil && Date.now() < data.blockUntil) {
        console.log("Clicks not recorded while ads are blocked.");
        return;
    }

    const now = Date.now();
    let validClicks = data.clicks.filter(timestamp => (now - timestamp) < AD_TIME_WINDOW_MS);
    validClicks.push(now);
    data.clicks = validClicks;

    console.log(`Ad click recorded. Count in last hour: ${data.clicks.length}`);

    if (data.clicks.length >= AD_CLICK_LIMIT) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        data.blockUntil = tomorrow.getTime();
        console.warn(`CLICK LIMIT REACHED! Ads will be blocked until ${tomorrow.toLocaleString()}`);
        hideAdContainer('광고가 일시 중단되었습니다.');
    }
    setAdData(data);
}

// =======================================================================
// UI 제어 기능
// =======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- 변수 설정 ---
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
    const adsContainer = document.getElementById('ads-container');
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

    // --- 초기화 ---
    function initialize() {
        sidebar.innerHTML = DB.sidebarMenu.map(item => `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`).join('');
        addEventListeners();
        loadInitialAd(); // 광고는 여기서 딱 한번만 로드
    }

    // --- 이벤트 리스너 ---
    function addEventListeners() {
        adsContainer.addEventListener('click', recordAdClick); // 광고 컨테이너 클릭 시 클릭 기록
        
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

    // --- 클릭 핸들러 ---
    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const context = button.dataset;
        setActive(level, button);
        const nextLevel = level + 1;
        if (nextLevel > 4) return;
        let nextData;
        const menuId = context.menuId || id;
        if (nextLevel === 2) nextData = DB[menuId]?.lev2;
        else if (nextLevel === 3) nextData = DB[menuId]?.lev3?.[id];
        else if (nextLevel === 4) nextData = DB[menuId]?.lev4?.[id];
        renderPanel(nextLevel, nextData, { ...context, menuId });
    }

    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        parentPanel.classList.remove('visible');
        contentArea.classList.remove('final-view-L3', 'final-view-L4');
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel',''));
        setActive(level - 1, null);
    }
    
    // --- 렌더링 함수 ---
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
                <div class="detail-section"><h4>스킬 정보</h4><p><strong>액티브:</strong> ${p.skills.active}</p><p><strong>패시브:</strong> ${p.skills.passive}</p></div>
                ${p.items?.length > 0 ? `<div class="detail-section"><h4>추천 아이템</h4><div class="item-grid">${p.items.map(id => `<img src="${findItem(id).imgUrl}" alt="${findItem(id).name}" data-popup-id="${id}" data-popup-type="item">`).join('')}</div></div>` : ''}
                ${p.runes?.length > 0 ? `<div class="detail-section"><h4>추천 룬</h4><div class="item-grid">${p.runes.map(id => `<img src="${findRuneChip(id).imgUrl}" alt="${findRuneChip(id).name}" data-popup-id="${id}" data-popup-type="runeAndChip">`).join('')}</div></div>` : ''}
                ${p.chips?.length > 0 ? `<div class="detail-section"><h4>추천 칩</h4><div class="item-grid">${p.chips.map(id => `<img src="${findRuneChip(id).imgUrl}" alt="${findRuneChip(id).name}" data-popup-id="${id}" data-popup-type="runeAndChip">`).join('')}</div></div>` : ''}
            </div>
        `;
    }

    function createItemDetailHtml(item) {
        return `<div class="detail-card"><h3>${item.name}</h3><img src="${item.imgUrl}" alt="${item.name}" style="float: left; margin-right: 15px; width: 96px; height: 96px;"><p><strong>기초 타입:</strong> ${item.type}</p><p><strong>휴대 효과:</strong> ${item.effect}</p></div>`;
    }
    
    function createRuneChipDetailHtml(rc) {
        return `<div class="detail-card"><h3>${rc.name}</h3><img src="${rc.imgUrl}" alt="${rc.name}" style="float: left; margin-right: 15px; width: 96px; height: 96px;"><p><strong>세트 효과:</strong> ${rc.setImage}</p><p><strong>효과:</strong> ${rc.effect}</p></div>`;
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
    
    initialize();
});