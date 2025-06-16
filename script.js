document.addEventListener('DOMContentLoaded', () => {
    // --- 데이터 정의 시작 (기획서 기반 전체 데이터) ---
    const siteData = {
        'pokemon-types': {
            title: '포켓몬 타입',
            items: { // Lev.2
                '노말': { title: '노말 타입 포켓몬', items: { /* Lev.3 포켓몬 이름 */ '따라큐': { title: '따라큐 정보', content: '여기에 따라큐의 상세 정보가 표시됩니다.' } } },
                '불': { title: '불 타입 포켓몬', items: { '리자몽': { title: '리자몽 정보', content: '여기에 리자몽의 상세 정보가 표시됩니다.' } } },
                '물': { title: '물 타입 포켓몬', items: { '가이오가': { title: '가이오가 정보', content: '바다를 넓힌 포켓몬으로 알려져있다.' } } },
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
            items: { // Lev.2
                'SS': { title: 'SS 등급 포켓몬', items: {} },
                'S+': { title: 'S+ 등급 포켓몬', items: {} },
                'S': { title: 'S 등급 포켓몬', items: {} }
            }
        },
        'items': {
            title: '아이템',
            items: { // Lev.2
                '빨간색': { title: '빨간색 아이템', items: {} },
                '주황색': { title: '주황색 아이템', items: {} },
                '보라색': { title: '보라색 아이템', items: {} }
            }
        },
        'runes-chips': {
            title: '룬&칩',
            items: { // Lev.2
                '룬': { title: '룬 목록', items: { '금강':{}, '치명':{}, '전투광':{}, '실드':{}, '비호':{}, '방어':{} /* 등등 */ } },
                '칩': { title: '칩 목록', items: { '화무':{}, '헌제':{}, '초능':{} /* 등등 */ } }
            }
        },
        'recommended-decks': {
            title: '추천덱',
            items: { // Lev.2
                '불덱': { title: '불덱', content: '불덱에 대한 설명' },
                '물페어리덱': { title: '물페어리덱', content: '예시 포켓몬: 원시가이오가, 마나피, 마기아나, 디안시 등' },
                '전기덱': { title: '전기덱', content: '전기덱에 대한 설명' },
                '풀덱': { title: '풀덱', content: '풀덱에 대한 설명' }
            }
        },
        'calendar': {
            title: '캘린더',
            items: { // Lev.2
                '랭킹뽑기': { title: '랭킹뽑기', content: '랭킹뽑기 관련 내용' },
                '한정뽑기': { title: '한정뽑기', content: '25.06.16 챔피언피카츄/레지' }
            }
        },
        'tips': {
            title: '팁&노하우',
            items: { // Lev.2
                '성급기준': { title: '성급기준', content: '성급기준 관련 내용' },
                '육성가이드': { title: '육성가이드', content: '육성가이드 관련 내용' }
            }
        },
    };
    // --- 데이터 정의 끝 ---

    const sidebar = document.querySelector('.sidebar nav');
    const contentDisplay = document.getElementById('content-display');
    let navigationHistory = [];

    function renderContent(data, isSidebarClick = false) {
        contentDisplay.innerHTML = '';

        if (!isSidebarClick) {
            const backButton = document.createElement('button');
            backButton.textContent = '< 뒤로';
            backButton.className = 'back-button';
            backButton.addEventListener('click', goBack);
            contentDisplay.appendChild(backButton);
        }

        const titleElement = document.createElement('h2');
        titleElement.textContent = data.title;
        contentDisplay.appendChild(titleElement);

        if (data.items && Object.keys(data.items).length > 0) {
            const listElement = document.createElement('ul');
            Object.keys(data.items).forEach(key => {
                const listItem = document.createElement('li');
                listItem.textContent = key;
                listItem.dataset.key = key;

                if (data.colors && data.colors[key]) {
                    listItem.className = data.colors[key];
                }
                
                listElement.appendChild(listItem);
            });
            contentDisplay.appendChild(listElement);
        } else if (data.content) {
            const contentElement = document.createElement('p');
            contentElement.innerHTML = data.content;
            contentDisplay.appendChild(contentElement);
        }
    }

    function goBack() {
        if (navigationHistory.length > 1) {
            navigationHistory.pop();
            const previousData = navigationHistory[navigationHistory.length - 1];
            renderContent(previousData, navigationHistory.length === 1);
        }
    }
    
    function getCurrentData() {
        if (navigationHistory.length === 0) return null;
        return navigationHistory[navigationHistory.length - 1];
    }

    sidebar.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const categoryKey = event.target.getAttribute('data-category');
            if (siteData[categoryKey]) {
                const categoryData = siteData[categoryKey];
                navigationHistory = [categoryData];
                renderContent(categoryData, true);
            }
        }
    });

    contentDisplay.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const key = event.target.dataset.key;
            const currentData = getCurrentData();

            if (currentData && currentData.items && currentData.items[key]) {
                const nextData = currentData.items[key];
                navigationHistory.push(nextData);

                // isSidebarClick은 false. 하위 메뉴로 들어가는 것이므로.
                renderContent(nextData, false); 
            }
        }
    });
});