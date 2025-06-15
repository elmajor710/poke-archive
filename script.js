document.addEventListener('DOMContentLoaded', () => {
    // --- 데이터 정의 시작 ---
    // 기획서와 검색된 색상 정보를 바탕으로 모든 데이터를 재구성합니다.
    const siteData = {
        'pokemon-types': {
            title: '포켓몬 타입',
            items: {
                '노말': { title: '노말 타입 포켓몬', items: { /* Lev.3 포켓몬 이름 */ '따라큐': { title: '따라큐 정보', content: '여기에 따라큐의 상세 정보가 표시됩니다.' } } },
                '불': { title: '불 타입 포켓몬', items: {} },
                '물': { title: '물 타입 포켓몬', items: {} },
                '풀': { title: '풀 타입 포켓몬', items: {} },
                '전기': { title: '전기 타입 포켓몬', items: {} },
                '얼음': { title: '얼음 타입 포켓몬', items: {} },
                '격투': { title: '격투 타입 포켓몬', items: {} },
                '독': { title: '독 타입 포켓몬', items: {} },
                '땅': { title: '땅 타입 포켓몬', items: {} },
                '비행': { title: '비행 타입 포켓몬', items: {} },
                '에스퍼': { title: '에스퍼 타입 포켓몬', items: {} },
                '벌레': { title: '벌레 타입 포켓몬', items: {} },
                '바위': { title: '바위 타입 포켓몬', items: {} },
                '유령': { title: '유령 타입 포켓몬', items: {} },
                '드래곤': { title: '드래곤 타입 포켓몬', items: {} },
                '악': { title: '악 타입 포켓몬', items: {} },
                '강철': { title: '강철 타입 포켓몬', items: {} },
                '페어리': { title: '페어리 타입 포켓몬', items: {} }
            },
            // 각 타입에 대한 색상 정보
            colors: {
                '노말': 'type-normal', '불': 'type-fire', '물': 'type-water', '전기': 'type-electric',
                '풀': 'type-grass', '얼음': 'type-ice', '격투': 'type-fighting', '독': 'type-poison',
                '땅': 'type-ground', '비행': 'type-flying', '에스퍼': 'type-psychic', '벌레': 'type-bug',
                '바위': 'type-rock', '유령': 'type-ghost', '드래곤': 'type-dragon', '악': 'type-dark',
                '강철': 'type-steel', '페어리': 'type-fairy'
            }
        },
        'pokemon-ranks': {
            title: '포켓몬 등급',
            items: { 'SS': { title: 'SS 등급 포켓몬', items: {} }, 'S+': { title: 'S+ 등급 포켓몬', items: {} }, 'S': { title: 'S 등급 포켓몬', items: {} } }
        },
        // ... 다른 카테고리 데이터도 위와 같은 구조로 추가 ...
    };
    // --- 데이터 정의 끝 ---

    const sidebar = document.querySelector('.sidebar nav');
    const contentDisplay = document.getElementById('content-display');
    let navigationHistory = []; // 뒤로가기를 위한 방문 기록

    // 현재 보고 있는 데이터의 경로를 저장
    let currentDataPath = [];

    // 콘텐츠 렌더링 함수
    function renderContent(data, isInitial = false) {
        contentDisplay.innerHTML = ''; // 기존 콘텐츠 초기화

        if (!isInitial) {
            const backButton = document.createElement('button');
            backButton.textContent = '< 뒤로';
            backButton.className = 'back-button';
            backButton.addEventListener('click', goBack);
            contentDisplay.appendChild(backButton);
        }

        const titleElement = document.createElement('h2');
        titleElement.textContent = data.title;
        contentDisplay.appendChild(titleElement);

        if (data.items) { // 하위 목록이 있으면 목록 렌더링
            const listElement = document.createElement('ul');
            Object.keys(data.items).forEach(key => {
                const listItem = document.createElement('li');
                listItem.textContent = key;
                listItem.dataset.key = key; // 다음 단계로 넘어가기 위한 키 저장

                // 포켓몬 타입에만 색상 클래스 적용
                if (data.colors && data.colors[key]) {
                    listItem.className = data.colors[key];
                }
                
                listElement.appendChild(listItem);
            });
            contentDisplay.appendChild(listElement);
        } else if (data.content) { // 최종 콘텐츠가 있으면 내용 렌더링
            const contentElement = document.createElement('p');
            contentElement.textContent = data.content;
            contentDisplay.appendChild(contentElement);
        }
    }

    // 데이터 경로를 따라 데이터를 찾는 함수
    function getDataByPath(path) {
        let current = siteData;
        for (const key of path) {
            current = current.items ? current.items[key] : current[key];
        }
        return current;
    }

    // 뒤로가기 함수
    function goBack() {
        if (navigationHistory.length > 1) {
            navigationHistory.pop(); // 현재 페이지를 기록에서 제거
            const previousPath = navigationHistory[navigationHistory.length - 1];
            currentDataPath = previousPath;
            const data = getDataByPath(previousPath);
            renderContent(data, previousPath.length === 1);
        }
    }

    // 사이드바 클릭 이벤트 처리
    sidebar.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const category = event.target.getAttribute('data-category');
            if (siteData[category]) {
                currentDataPath = [category];
                navigationHistory = [currentDataPath.slice()];
                renderContent(siteData[category], true);
            }
        }
    });
    
    // 콘텐츠 영역 클릭 이벤트 처리 (하위 메뉴 이동)
    contentDisplay.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const key = event.target.dataset.key;
            
            let currentData = getDataByPath(currentDataPath);

            if (currentData && currentData.items && currentData.items[key]) {
                currentDataPath.push(key);
                navigationHistory.push(currentDataPath.slice());
                const nextData = currentData.items[key];
                renderContent(nextData);
            }
        }
    });
});