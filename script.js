document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 기본 요소 및 변수 설정 ---
    const app = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const contentArea = document.getElementById('content-area');
    const panels = {
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel'),
    };
    let activeButtons = {}; // 활성화된 버튼 추적용
    let isMobile = window.innerWidth <= 768;

    // --- 2. 초기화 ---
    function initialize() {
        // 사이드바 메뉴 생성
        sidebar.innerHTML = DB.sidebarMenu.map(item => 
            `<button class="menu-item" data-level="1" data-id="${item.id}">${item.name}</button>`
        ).join('');
        
        // 이벤트 리스너 설정
        addEventListeners();
    }

    // --- 3. 이벤트 리스너 ---
    function addEventListeners() {
        // 앱 전체에서 발생하는 모든 클릭을 감지 (이벤트 위임)
        app.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return; // 버튼이 아니면 무시

            // 뒤로가기 버튼 클릭 처리
            if (button.classList.contains('back-btn')) {
                handleBackClick(button);
                return;
            }
            // 메뉴 또는 리스트 아이템 클릭 처리
            if (button.dataset.level) {
                handleMenuClick(button);
            }
        });
        
        window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });
    }

    // --- 4. 클릭 핸들러 ---
    function handleMenuClick(button) {
        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const context = button.dataset;

        setActive(level, button);

        // 광고 새로고침 기능은 안정화 전까지 비활성화 상태입니다.
        // if (window.adsbygoogle) {
        //     (adsbygoogle = window.adsbygoogle || []).push({});
        // }

        const nextLevel = level + 1;
        if (nextLevel > 5) return; // 레벨은 4까지 있으므로 5 이상은 처리 안함

        // 다음 레벨에 필요한 데이터 찾기
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

		// 뒤로가기 시 모든 최종 화면 클래스 제거
		contentArea.classList.remove('final-view-L3', 'final-view-L4');

		const level = parseInt(parentPanel.id.slice(-1));
		setActive(level - 1, null);
	}

    // --- 5. 화면 렌더링 ---
    function renderPanel(level, data, context) {
		// 현재 레벨 이후의 모든 패널을 초기화
		for (let i = level; i <= 4; i++) {
			panels[`lev${i}`].classList.remove('visible');
			panels[`lev${i}`].querySelector('.panel-content').innerHTML = '';
		}

		if (!data) return; 

		const targetPanel = panels[`lev${level}`];
		if (!targetPanel) return;

		const contentDiv = targetPanel.querySelector('.panel-content');
		const isFinal = !Array.isArray(data);

		// 최종 화면 클래스를 초기화
		contentArea.classList.remove('final-view-L3', 'final-view-L4');

		if (isFinal) {
			contentDiv.innerHTML = data.content;
			// 최종 화면 레벨에 따라 다른 클래스 추가
			contentArea.classList.add(`final-view-L${level}`);
		} else {
			data.forEach(item => {
				const button = document.createElement('button');
				button.className = 'list-item';
				button.textContent = item.name;
				button.dataset.id = item.id;
				button.dataset.level = level;
				button.dataset.menuId = context.menuId || context.id;
				if (level > 2) button.dataset.lev2Id = context.id;
				if (item.color) button.style.backgroundColor = item.color;
				contentDiv.appendChild(button);
			});
		}
		targetPanel.classList.add('visible');
	}

    // --- 6. 헬퍼 함수 ---
    function setActive(level, target) {
        // 현재 레벨과 하위 레벨의 활성화 상태 초기화
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
    
    // --- 초기화 함수 실행 ---
    initialize();
});