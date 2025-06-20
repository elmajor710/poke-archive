const DB = {
    // Lev.1 : 사이드바 메뉴
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
        { id: 'runeAndChip', name: '룬&칩', levels: 4 },
        { id: 'deck', name: '추천덱', levels: 3 },
        { id: 'calendar', name: '캘린더', levels: 3 },
        { id: 'tips', name: '팁&노하우', levels: 3 },
    ],

    // =============================================
    // 포켓몬 타입
    // - 포켓몬 등급' 메뉴에서 데이터를 사용하므로, 각 포켓몬 데이터에 'grade' 필드 추가
    // - '추천~' 배열에는 팝업 기능을 위한 'id' 필드 추가
    // =============================================
    pokemonType: {
        lev2: [ /* 이전과 동일한 18타입 목록 */ 
            { id: 'normal', name: '노말', color: 'normal' }, { id: 'fire', name: '불', color: 'fire' }, { id: 'water', name: '물', color: 'water' },
            { id: 'grass', name: '풀', color: 'grass' }, { id: 'electric', name: '전기', color: 'electric' }, { id: 'ice', name: '얼음', color: 'ice' },
            { id: 'fighting', name: '격투', color: 'fighting' }, { id: 'poison', name: '독', color: 'poison' }, { id: 'ground', name: '땅', color: 'ground' },
            { id: 'flying', name: '비행', color: 'flying' }, { id: 'psychic', name: '에스퍼', color: 'psychic' }, { id: 'bug', name: '벌레', color: 'bug' },
            { id: 'rock', name: '바위', color: 'rock' }, { id: 'ghost', name: '유령', color: 'ghost' }, { id: 'dragon', name: '드래곤', color: 'dragon' },
            { id: 'dark', name: '악', color: 'dark' }, { id: 'steel', name: '강철', color: 'steel' }, { id: 'fairy', name: '페어리', color: 'fairy' }
        ],
        lev3: { // lev3 목록은 이전 skeleton과 동일
            normal: [ { id: 'regigigas', name: '레지기가스' } ],
            fire: [ { id: 'reshiram', name: '레시라무' }, { id: 'zarude', name: '자루도' } ],
            // ... etc
        },
        lev4: {
            // "레지기가스"를 상세 기획안에 맞춘 완벽한 예시로 작성했습니다. 
            // 다른 포켓몬들도 이 형식에 맞춰 데이터를 채워주시면 됩니다.
            regigigas: {
                name: '레지기가스',
                grade: 'S+', // '포켓몬 등급' 메뉴에서 필터링하기 위한 등급 필드
                imageURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/486.png',
                stats: { // 종족값 (표)
                    'HP': 110, '스피드': 100, '공격': 160, '방어': 110, '특수공격': 80, '특수방어': 110
                },
                skills: { // 스킬 (표)
                    active: '엄청난힘', ultimate: '기가임팩트', passive: '슬로스타트'
                },
                recommendedItems: [ // 추천 아이템 (표 + 팝업)
                    { id: 'leftovers', name: '먹다남은음식', imageURL: '이미지URL_준비중', reason: 'HP를 회복하여 안정성을 높입니다.' },
                    { id: 'focusSash', name: '기합의머리띠', imageURL: '이미지URL_준비중', reason: '한 번에 쓰러지지 않고 버틸 수 있게 해줍니다.' }
                ],
                recommendedRunes: [ // 추천 룬 (표 + 팝업)
                    { id: 'kingKong', name: '금강 룬', imageURL: '이미지URL_준비중', reason: '공격력을 극대화합니다.' }
                ],
                recommendedChips: [ // 추천 칩 (표 + 팝업)
                    { id: 'loneWolf', name: '늑대대행자 칩', imageURL: '이미지URL_준비중', reason: '단일 공격 능력을 강화합니다.' }
                ]
            },
            // 다른 포켓몬들은 현재 임시 데이터로 채워져 있습니다.
            reshiram: { name: '레시라무', grade: 'S+', content: '콘텐츠 준비 중입니다.' },
            zarude: { name: '자루도', grade: 'S', content: '콘텐츠 준비 중입니다.' },
            // ... etc
        }
    },

    // =============================================
    // 포켓몬 등급
    // - 이 카테고리의 lev3, lev4는 수동으로 입력하지 않습니다.
    // - script.js가 'pokemonType'의 모든 포켓몬을 읽어 'grade' 필드값에 따라 자동으로 목록을 생성합니다.
    // =============================================
    pokemonGrade: {
        lev2: [ { id: 'sPlus', name: 'S+' }, { id: 's', name: 'S' } ],
        lev3: { 
            // 이 부분은 스크립트가 자동으로 채울 것이므로 비워둡니다.
        },
        lev4: { 
            // 이 부분 역시 스크립트가 'pokemonType.lev4'의 데이터를 참조하므로 비워둡니다.
        }
    },

    // =============================================
    // 아이템 / 룬&칩
    // - 최종 설명화면: 이미지 + 텍스트
    // =============================================
    item: {
        lev2: [ /* 이전 skeleton과 동일 */ ],
        lev3: { /* 이전 skeleton과 동일 */ },
        lev4: {
            leftovers: { // '레지기가스' 추천 아이템 예시에 맞춰 'leftovers' 아이디로 예시 데이터 작성
                name:'먹다남은음식',
                imageURL: '이미지URL_준비중',
                description: '지니게 하면 매 턴마다 최대 HP의 1/16만큼 HP를 회복한다.'
            },
            focusSash: { name:'기합의머리띠', imageURL: '이미지URL_준비중', description: 'HP가 가득 찬 상태에서 기술을 받아 쓰러질 경우, HP 1을 남기고 한 번 버틴다.'},
             // ... etc
        }
    },
    runeAndChip: {
        lev2: [ /* 이전 skeleton과 동일 */ ],
        lev3: { /* 이전 skeleton과 동일 */ },
        lev4: {
            kingKong: { name:'금강 룬', imageURL: '이미지URL_준비중', description: '금강 룬에 대한 설명입니다.' },
            loneWolf: { name:'늑대대행자 칩', imageURL: '이미지URL_준비중', description: '늑대대행자 칩에 대한 설명입니다.' },
             // ... etc
        }
    },

    // =============================================
    // 추천덱
    // - 최종 설명화면: 이미지 + 텍스트
    // =============================================
    deck: {
        lev2: [ /* 이전 skeleton과 동일 */ ],
        lev3: { 
            newbieDeck: { 
                name: '극초반 뉴비 (S급 8마리)',
                imageURL: '이미지URL_준비중',
                description: '보스로라, 코리갑, 포푸니라, 펄기아, 렌트라, 핫삼, 가디안, 버터플 조합의 추천 덱 상세 설명입니다.'
            },
            // ... etc
        }
    },
    
    // =============================================
    // 캘린더
    // - 최종 설명화면: 캘린더 + 텍스트
    // - 'events' 배열에 객체 형식으로 일정을 추가하면, 스크립트가 읽어 달력에 표시합니다.
    // =============================================
    calendar: {
        lev2: [ { id: 'gachaSchedule', name: '뽑기 일정' } ],
        lev3: { 
            gachaSchedule: { 
                name: '뽑기 일정',
                description: '랭킹뽑기, 한정뽑기 등 주요 이벤트 일정을 확인할 수 있습니다.',
                events: [
                    { date: '2025-06-23', title: '랭킹뽑기: 레쿠쟈', type: 'ranking' },
                    { date: '2025-07-01', title: '한정뽑기: 자시안', type: 'limited' }
                ]
            } 
        }
    },

    // =============================================
    // 팁&노하우
    // - 최종 설명화면: 텍스트 위주 (필요시 표 포함)
    // - 'content'에 HTML 태그를 직접 사용하여 표 등을 구현할 수 있도록 처리할 예정입니다.
    // =============================================
    tips: {
        lev2: [ /* 이전 skeleton과 동일 */ ],
        lev3: { 
            beginnerTop10: { 
                name: '초보자를 위한 가이드 TOP 10', 
                content: '<h3>1. 리세마라 가이드</h3><p>리세마라는 ... 하는 것이 좋습니다.</p><h3>2. 재화 활용법</h3><p>다이아는 ... 에 우선적으로 사용하세요.</p>'
            },
            // ... etc
        }
    }
};