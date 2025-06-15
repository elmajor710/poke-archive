document.addEventListener('DOMContentLoaded', () => {
    // 카테고리 데이터 정의 (기획서 기반)
    const categoryData = {
        'pokemon-types': {
            level: 2,
            title: '포켓몬 타입 (Lev.2)',
            items: ['노말', '불', '물', '풀', '전기', '얼음', '격투', '독', '땅', '비행', '에스퍼', '벌레', '바위', '유령', '드래곤', '악', '강철', '페어리']
        },
        'pokemon-ranks': {
            level: 2,
            title: '포켓몬 등급 (Lev.2)',
            items: ['SS', 'S+', 'S']
        },
        'items': {
            level: 2,
            title: '아이템 (Lev.2)',
            items: ['빨간색', '주황색', '보라색']
        },
        'runes-chips': {
            level: 2,
            title: '룬&칩 (Lev.2)',
            items: ['룬', '칩']
        },
        'recommended-decks': {
            level: 2,
            title: '추천덱 (Lev.2)',
            items: ['불덱', '물페어리덱', '전기덱', '풀덱']
        },
        'calendar': {
            level: 2,
            title: '캘린더 (Lev.2)',
            items: ['랭킹뽑기', '한정뽑기']
        },
        'tips': {
            level: 2,
            title: '팁&노하우 (Lev.2)',
            items: ['성급기준', '육성가이드 등 목록 나열']
        }
    };

    const sidebar = document.querySelector('.sidebar nav');
    const contentDisplay = document.getElementById('content-display');

    // 사이드바 메뉴 클릭 이벤트 리스너
    sidebar.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const category = event.target.getAttribute('data-category');
            displayContent(category);
        }
    });

    // 콘텐츠 표시 함수
    function displayContent(category) {
        // 기존 콘텐츠 삭제
        contentDisplay.innerHTML = '';

        const data = categoryData[category];
        if (data) {
            // 뒤로가기 버튼 추가 (Lev.2 이상부터 필요)
            if (data.level > 1) {
                const backButton = document.createElement('button');
                backButton.textContent = '< 뒤로';
                // 뒤로가기 기능은 추후 단계에서 구현합니다.
                // backButton.addEventListener('click', () => { ... });
                contentDisplay.appendChild(backButton);
            }
            
            const titleElement = document.createElement('h2');
            titleElement.textContent = data.title;
            contentDisplay.appendChild(titleElement);

            const listElement = document.createElement('ul');
            data.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                listItem.style.cursor = 'pointer'; // 다음 단계로 넘어갈 수 있음을 암시
                listElement.appendChild(listItem);
            });
            contentDisplay.appendChild(listElement);
        }
    }
});