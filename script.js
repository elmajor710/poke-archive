document.addEventListener('DOMContentLoaded', () => {
    // --- 임시 데이터 포함 전체 데이터 정의 ---
    const siteData = {
        'pokemon-types': {
            title: '포켓몬 타입',
            levels: 4, // 총 레벨 수
            items: { // Lev.2
                '물': {
                    title: '물 타입 포켓몬', items: { // Lev.3
                        '가이오가': { title: '가이오가 상세', content: '바다를 넓힌 포켓몬으로 알려져있다. [Lev.4 최종 설명]' },
                        '갸라도스': { title: '갸라도스 상세', content: '갸라도스에 대한 테스트 설명입니다. [Lev.4 최종 설명]' }
                    }
                },
                '불': {
                    title: '불 타입 포켓몬', items: { // Lev.3
                        '리자몽': { title: '리자몽 상세', content: '리자몽에 대한 테스트 설명입니다. [Lev.4 최종 설명]' },
                        '앤테이': { title: '앤테이 상세', content: '앤테이에 대한 테스트 설명입니다. [Lev.4 최종 설명]' }
                    }
                }
            }
        },
        'pokemon-ranks': {
            title: '포켓몬 등급', levels: 4, items: {
                'SS': { title: 'SS 등급', items: { '뮤츠': { title: '뮤츠 상세', content: '뮤츠에 대한 테스트 설명입니다. [Lev.4 최종 설명]' } } }
            }
        },
        'items': {
            title: '아이템', levels: 4, items: {
                '빨간색': { title: '빨간색 아이템', items: { '생명의구슬': { title: '생명의구슬 상세', content: '생명의구슬에 대한 테스트 설명입니다. [Lev.4 최종 설명]' } } }
            }
        },
        'runes-chips': {
            title: '룬&칩', levels: 4, items: {
                '룬': { title: '룬', items: { '금강': { title: '금강 룬 상세', content: '금강 룬에 대한 테스트 설명입니다. [Lev.4 최종 설명]' } } }
            }
        },
        'recommended-decks': {
            title: '추천덱', levels: 3, // 총 레벨 수
            items: { // Lev.2
                '물페어리덱': { title: '물페어리덱', content: '물페어리덱에 대한 최종 설명입니다. [Lev.3 최종 설명]' },
                '불덱': { title: '불덱', content: '불덱에 대한 최종 설명입니다. [Lev.3 최종 설명]' }
            }
        },
        'calendar': {
            title: '캘린더', levels: 3, items: {
                '랭킹뽑기': { title: '랭킹뽑기', content: '랭킹뽑기에 대한 최종 설명입니다. [Lev.3 최종 설명]' },
                '한정뽑기': { title: '한정뽑기', content: '한정뽑기에 대한 최종 설명입니다. [Lev.3 최종 설명]' }
            }
        },
        'tips': {
            title: '팁&노하우', levels: 3, items: {
                '성급기준': { title: '성급기준', content: '성급기준에 대한 최종 설명입니다. [Lev.3 최종 설명]' },
                '육성가이드': { title: '육성가이드', content: '육성가이드에 대한 최종 설명입니다. [Lev.3 최종 설명]' }
            }
        },
    };

    const sidebar = document.querySelector('.sidebar nav');
    const contentDisplay = document.querySelector('.content');
    let currentPath = []; // [ { key: 'pokemon-types', data: {...} }, { key: '물', data: {...} } ]

    function render() {
        contentDisplay.innerHTML = ''; // 콘텐츠 영역 초기화

        const currentCategoryData = currentPath.length > 0 ? currentPath[0].data : null;
        if (!currentCategoryData) return;

        const finalLevel = currentCategoryData.levels;
        const currentLevel = currentPath.length;

        // 최종 레벨에 도달했는지 확인
        const isFinalLevelReached = currentLevel === finalLevel;

        if (isFinalLevelReached) {
            // 최종 설명 화면 렌더링
            const finalData = currentPath[currentLevel - 1].data;
            const view = document.createElement('div');
            view.className = 'final-content-view';
            view.innerHTML = `<h2>${finalData.title}</h2><p>${finalData.content}</p>`;
            contentDisplay.appendChild(view);
        } else {
            // 다중 패널 렌더링
            currentPath.forEach((pathItem, index) => {
                const level = index + 1;
                // 마지막 레벨-1 까지만 패널을 그림
                if (level < finalLevel && pathItem.data.items) {
                    const panel = document.createElement('div');
                    panel.className = 'content-panel';

                    const title = document.createElement('h2');
                    title.textContent = `${pathItem.data.title} (Lev.${level+1})`;
                    panel.appendChild(title);

                    const list = document.createElement('ul');
                    Object.keys(pathItem.data.items).forEach(key => {
                        const listItem = document.createElement('li');
                        listItem.textContent = key;
                        // 다음 레벨로 가기 위한 경로 정보를 저장
                        listItem.dataset.path = JSON.stringify([...currentPath.slice(0, index + 1).map(p => p.key), key]);
                        list.appendChild(listItem);
                    });
                    panel.appendChild(list);
                    contentDisplay.appendChild(panel);
                }
            });
        }
    }

    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const categoryKey = e.target.getAttribute('data-category');
            if (siteData[categoryKey]) {
                currentPath = [{ key: categoryKey, data: siteData[categoryKey] }];
                render();
            }
        }
    });

    contentDisplay.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI' && e.target.dataset.path) {
            const pathKeys = JSON.parse(e.target.dataset.path);
            let newPath = [];
            let currentData = siteData;
            for (const key of pathKeys) {
                if (currentData[key]) {
                    currentData = currentData[key];
                } else {
                    currentData = currentData.items[key];
                }
                newPath.push({ key: key, data: currentData });
            }
            currentPath = newPath;
            render();
        }
    });
});