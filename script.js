document.addEventListener('DOMContentLoaded', () => {
    // --- [디버그 모드] ---
    console.log('스크립트 초기화 완료. Nirvana Pokedex v1.1-debug');

    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {};

    function renderCalendarView(contentDiv, data) {
        // ... (이전과 동일)
    }
    function renderPokemonView(contentDiv, data) {
        // ... (이전과 동일)
    }
    function renderSimpleView(contentDiv, data) {
        // ... (이전과 동일)
    }

    function renderPanel(level, data, menuId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;

        // --- [디버그 로그 추가] ---
        console.log(`--- renderPanel 호출 (level: ${level}, menuId: ${menuId}) ---`);
        console.log('전달받은 데이터:', data);

        const contentDiv = targetPanel.querySelector('.panel-content');
        contentDiv.innerHTML = '';
        setTimeout(() => { contentDiv.scrollTop = 0; }, 0);

        if (!data) {
            console.log('결과: 데이터가 없으므로 "데이터가 없습니다." 출력');
            contentDiv.innerHTML = "데이터가 없습니다.";
            targetPanel.classList.add('visible');
            return;
        }

        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        const finalLevelForCategory = categoryInfo ? categoryInfo.levels : 0;
        const isFinal = !Array.isArray(data);
        
        console.log(`isFinal: ${isFinal}, 최종 레벨: ${finalLevelForCategory}`);

        if (isFinal) {
            const classNameToSet = `final-view-L${finalLevelForCategory}`;
            console.log(`최종 화면입니다. app-container에 클래스 "${classNameToSet}"를 설정합니다.`);
            app.className = classNameToSet;
            
            Object.values(panels).forEach(p => p.classList.remove('visible'));

            if (data.events) {
                console.log('뷰 타입: Calendar View');
                renderCalendarView(contentDiv, data);
            } else if (data.stats && data.skills) {
                console.log('뷰 타입: Pokemon View');
                renderPokemonView(contentDiv, data);
            } else if (data.description) {
                console.log('뷰 타입: Simple View');
                renderSimpleView(contentDiv, data);
            } else {
                console.log('뷰 타입: Fallback Content View');
                contentDiv.innerHTML = data.content || "콘텐츠를 표시할 수 없습니다.";
            }

        } else {
            console.log('목록 화면입니다. app-container 클래스를 초기화합니다.');
            app.className = "";
            // ... (이하 목록 생성 로직은 동일)
        }
        targetPanel.classList.add('visible');
        console.log('----------------------------------------------------');
    }

    // --- 나머지 함수들은 이전과 동일합니다 ---
    function initialize() {
        // ...
    }
    function addEventListeners() {
        // ...
    }
    function handleMenuClick(button) {
        // ...
    }
    function getNextData(currentLevel, id, menuId) {
        // ...
    }
    function handleBackClick(button) {
        // ...
    }
    function setActive(level, target) {
        // ...
    }
    
    // (이전과 동일한 전체 코드를 여기에 붙여넣으세요)
    // 이전 답변에서 드렸던 script.js의 나머지 함수들을 여기에 복사해서 사용하시면 됩니다.
    // 여기서는 설명을 위해 renderPanel 외 함수들은 생략했습니다.
});