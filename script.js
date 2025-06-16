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
    // 방문 기록을 경로(key)의 배열로 관리하여 더 명확하게 처리
    let pathKeys = []; // 예: ['pokemon-types', '물', '가이오가']

    // 현재 경로의 데이터를 가져오는 함수
    function getCurrentData(path) {
        let data = siteData;
        for (const key of path) {
            data = data.items ? data.items[key] : data[key];
        }
        return data;
    }

    // 화면을 렌더링하는 메인 함수
    function render() {
        contentDisplay.innerHTML = ''; // 콘텐츠 영역 초기화

        if (pathKeys.length === 0) return; // 경로가 없으면 아무것도 안 함

        // 1. 뒤로가기 버튼 렌더링
        const backButton = document.createElement('button');
        backButton.textContent = '< 뒤로';
        backButton.className = 'back-button'; // CSS 클래스 추가
        backButton.style.display = pathKeys.length > 1 ? 'block' : 'none'; // 첫 단계에선 숨김
        backButton.onclick = goBack; // 뒤로가기 함수 연결
        contentDisplay.appendChild(backButton);
        
        const currentData = getCurrentData(pathKeys);
        const categoryData = getCurrentData(pathKeys.slice(0, 1));
        const finalLevel = categoryData.levels;
        const currentLevel = pathKeys.length;

        // 2. 최종 설명 화면인지, 중간 패널 화면인지 결정
        if (currentLevel === finalLevel) {
            // 최종 설명 화면 렌더링
            const view = document.createElement('div');
            view.className = 'final-content-view';
            view.innerHTML = `<h2>${currentData.title}</h2><p>${currentData.content}</p>`;
            contentDisplay.appendChild(view);
        } else {
            // 다중 패널 렌더링
            for (let i = 1; i <= currentLevel; i++) {
                const dataForPanel = getCurrentData(pathKeys.slice(0, i));
                
                if (dataForPanel.items) {
                    const panel = document.createElement('div');
                    panel.className = 'content-panel';
                    
                    let titleText = i > 0 ? getCurrentData(pathKeys.slice(0, i)).title : '';
                    panel.innerHTML = `<h2>${titleText} (Lev.${i + 1})</h2>`;

                    const list = document.createElement('ul');
                    Object.keys(dataForPanel.items).forEach(key => {
                        const listItem = document.createElement('li');
                        listItem.textContent = key;
                        listItem.dataset.nextKey = key; // 다음 경로의 키 저장
                        list.appendChild(listItem);
                    });
                    panel.appendChild(list);
                    contentDisplay.appendChild(panel);
                }
            }
        }
    }
    
    // 뒤로가기 기능
    function goBack() {
        if (pathKeys.length > 1) {
            pathKeys.pop(); // 마지막 경로 제거
            render(); // 화면 다시 그리기
        }
    }

    // 사이드바 클릭 이벤트
    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const categoryKey = e.target.getAttribute('data-category');
            if (siteData[categoryKey]) {
                pathKeys = [categoryKey]; // 새 카테고리 클릭 시 경로 초기화
                render();
            }
        }
    });

    // 콘텐츠(패널) 클릭 이벤트
    contentDisplay.addEventListener('click', (e) => {
        // LI 태그이고, 다음 키(nextKey) 정보를 가지고 있을 때만 작동
        if (e.target.tagName === 'LI' && e.target.dataset.nextKey) {
            pathKeys.push(e.target.dataset.nextKey); // 경로에 다음 키 추가
            render(); // 화면 다시 그리기
        }
    });
});