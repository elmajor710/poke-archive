document.addEventListener('DOMContentLoaded', () => {
    // --- 임시 데이터 포함 전체 데이터 정의 ---
    const siteData = {
        'pokemon-types': {
            title: '포켓몬 타입',
            levels: 4,
            items: {
                '물': { title: '물 타입', items: { '가이오가': { title: '가이오가', content: '바다를 넓힌 포켓몬입니다. [Lev.4]' } } },
                '불': { title: '불 타입', items: { '리자몽': { title: '리자몽', content: '리자몽에 대한 설명입니다. [Lev.4]' } } }
            }
        },
        'pokemon-ranks': {
            title: '포켓몬 등급', levels: 4, items: {
                'SS': { title: 'SS 등급', items: { '뮤츠': { title: '뮤츠', content: '뮤츠에 대한 설명입니다. [Lev.4]' } } }
            }
        },
        'items': {
            title: '아이템', levels: 4, items: {
                '빨간색': { title: '빨간색 아이템', items: { '생명의구슬': { title: '생명의구슬', content: '생명의구슬에 대한 설명입니다. [Lev.4]' } } }
            }
        },
        'runes-chips': {
            title: '룬&칩', levels: 4, items: {
                '룬': { title: '룬', items: { '금강': { title: '금강 룬', content: '금강 룬에 대한 설명입니다. [Lev.4]' } } }
            }
        },
        'recommended-decks': {
            title: '추천덱', levels: 3, items: {
                '물페어리덱': { title: '물페어리덱', content: '물페어리덱에 대한 최종 설명입니다. [Lev.3]' },
                '불덱': { title: '불덱', content: '불덱에 대한 최종 설명입니다. [Lev.3]' }
            }
        },
        'calendar': {
            title: '캘린더', levels: 3, items: { '랭킹뽑기': { title: '랭킹뽑기', content: '랭킹뽑기 관련 내용입니다. [Lev.3]' } }
        },
        'tips': {
            title: '팁&노하우', levels: 3, items: { '성급기준': { title: '성급기준', content: '성급기준 관련 내용입니다. [Lev.3]' } }
        },
    };

    const sidebar = document.querySelector('.sidebar nav');
    const contentDisplay = document.querySelector('.content');
    let path = []; // 사용자의 현재 경로. 예: ['pokemon-types', '물']

    // --- 로직 시작 ---

    function render() {
        contentDisplay.innerHTML = ''; // 화면 초기화

        if (path.length === 0) return;

        // 뒤로가기 버튼 생성 및 관리
        const backButton = document.createElement('button');
        backButton.textContent = '< 뒤로';
        backButton.className = 'back-button';
        backButton.onclick = goBack;
        // 첫 단계(Lev.1)가 아니면 뒤로가기 버튼 표시
        if (path.length > 1) {
            contentDisplay.appendChild(backButton);
        }

        let currentData = siteData[path[0]];
        const totalLevels = currentData.levels;

        // 현재 경로가 최종 레벨에 도달했는지 확인
        const isFinalLevel = path.length === totalLevels;

        if (isFinalLevel) {
            // 최종 설명 화면 렌더링
            for (let i = 1; i < path.length; i++) {
                currentData = currentData.items[path[i]];
            }
            const view = document.createElement('div');
            view.className = 'final-content-view';
            view.innerHTML = `<h2>${currentData.title}</h2><p>${currentData.content}</p>`;
            contentDisplay.appendChild(view);
        } else {
            // 다중 패널 렌더링
            let panelData = siteData[path[0]];
            for (let i = 0; i < path.length; i++) {
                if (i > 0) {
                    panelData = panelData.items[path[i]];
                }

                if (panelData && panelData.items) {
                    const panel = document.createElement('div');
                    panel.className = 'content-panel';
                    panel.innerHTML = `<h2>${panelData.title} (Lev.${i + 2})</h2>`;

                    const list = document.createElement('ul');
                    Object.keys(panelData.items).forEach(key => {
                        const listItem = document.createElement('li');
                        listItem.textContent = key;
                        listItem.dataset.key = key;
                        list.appendChild(listItem);
                    });
                    panel.appendChild(list);
                    contentDisplay.appendChild(panel);
                }
            }
        }
    }

    function goBack() {
        if (path.length > 1) {
            path.pop();
            render();
        }
    }

    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const categoryKey = e.target.getAttribute('data-category');
            if (siteData[categoryKey]) {
                path = [categoryKey];
                render();
            }
        }
    });

    contentDisplay.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI' && e.target.dataset.key) {
            const key = e.target.dataset.key;
            path.push(key);
            render();
        }
    });
});