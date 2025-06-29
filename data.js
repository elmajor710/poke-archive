const DB = {
    definitions: {
        natures: [
            { id: 'jolly', name: '유쾌함(Jolly)' },
            { id: 'adamant', name: '고집이강함(Adamant)' },
            { id: 'timid', name: '겁쟁이(Timid)' },
            { id: 'modest', name: '조심(Modest)' },
        ]
    },
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
        { id: 'runeAndChip', name: '룬&칩', levels: 4 },
        { id: 'deck', name: '추천덱', levels: 3 },
        { id: 'calendar', name: '캘린더', levels: 3 },
        { id: 'tips', name: '팁&노하우', levels: 3 },
    ],
    pokemonType: {
        lev2: [ 
            { id: 'psychic', name: '에스퍼', color: 'psychic' }, { id: 'fighting', name: '격투', color: 'fighting' },
            { id: 'normal', name: '노말', color: 'normal' }, { id: 'fire', name: '불', color: 'fire' }, { id: 'water', name: '물', color: 'water' },
            { id: 'grass', name: '풀', color: 'grass' }, { id: 'electric', name: '전기', color: 'electric' }, { id: 'ice', name: '얼음', color: 'ice' },
            { id: 'poison', name: '독', color: 'poison' }, { id: 'ground', name: '땅', color: 'ground' },
            { id: 'flying', name: '비행', color: 'flying' }, { id: 'bug', name: '벌레', color: 'bug' },
            { id: 'rock', name: '바위', color: 'rock' }, { id: 'ghost', name: '유령', color: 'ghost' }, { id: 'dragon', name: '드래곤', color: 'dragon' },
            { id: 'dark', name: '악', color: 'dark' }, { id: 'steel', name: '강철', color: 'steel' }, { id: 'fairy', name: '페어리', color: 'fairy' }
        ],
        lev3: { 
            psychic: [ { id: 'megamewtwox', name: '메가뮤츠X' } ],
        },
        lev4: {
            megamewtwox: {
                name: { ko: '메가뮤츠X', en: 'Mega Mewtwo X' },
                grade: 'SS',
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/150-mega-x.png',
                stats: { 'HP': 106, 'Speed': 130, 'P.ATK': 190, 'P.DEF': 100, 'SP.ATK': 154, 'SP.DEF': 100 },
                totalStats: 780,
                natures: ['유쾌함(Jolly)', '고집이강함(Adamant)'],
                skills: [
                    { name: '진기권(Focus Punch)', type: 'Active', description: '진기권입니다.' },
                    { name: '진기권ㆍ유선권(Focus PunchㆍGentle Fist)', type: 'Active', description: '진기권ㆍ유선권입니다.' },
                    { name: '진기권ㆍ잔상권(Focus PunchㆍAfterimage Fist)', type: 'Active', description: '진기권ㆍ잔상권입니다.' },
                    { name: '수라화경(Shura Tansformation)', type: 'Ultimate', description: '수라화경입니다.' },
                    { name: '수라권의(Shura Fist Intent)', type: 'Passive', description: '수라권의입니다.' }
                ],
                recommendedItems: [
                    { id: 'nokseungeom_god', name: '녹슨검(God)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxtDeD%2FbtsOKJ36Be7%2FUrXuXYDmF5ADlMKoNkTlpK%2Fimg.png' },
                    { id: 'geumsogkoteu_epic', name: '금속 코트', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FFWwAa%2FbtsOMa0CeXA%2F0hr7ZPneYK9nMQbfmqnsQk%2Fimg.png' },
                ],
                recommendedRunes: [ { id: 'deadly', name: '치명(Deadly)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbU9JRa%2FbtsOv8izvWj%2FIf5dAZJsul5BwpbV6ECDuk%2Fimg.png' } ],
                recommendedChips: [ { id: 'loneWolf', name: '늑대행자(Lone Wolf)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcUh4D2%2FbtsOx40jDq4%2FyXEinUS88JPLxcuACYkjr1%2Fimg.png' } ]
            },
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'ss', name: 'SS' }, { id: 'sPlus', name: 'S+' }, { id: 's', name: 'S' } ],
        lev3: {},
        lev4: {}
    },
    item: {
        lev2: [ {id:'god', name:'빨강(God)'}, {id:'legendary', name:'주황(Legendary)'}, {id:'epic', name:'보라(Epic)'} ],
        lev3: { 
            god: [ {id:'nokseungeom_god', name:'녹슨검'} ], 
            legendary: [ {id:'nokseungeom_legendary', name:'녹슨검'} ], 
            epic: [ { id: 'geumsogkoteu_epic', name: '금속 코트' } ] 
        },
        lev4: { 
            'nokseungeom_god': { name: '녹슨검 (God)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxtDeD%2FbtsOKJ36Be7%2FUrXuXYDmF5ADlMKoNkTlpK%2Fimg.png', description: 'God 등급 녹슨검의 상세 설명입니다.' },
            'nokseungeom_legendary': { name: '녹슨검 (Legendary)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fmp4u9%2FbtsONLeu4AO%2FyKN9LkTgZDLbpFWHXZHxY1%2Fimg.png', description: 'Legendary 등급 녹슨검의 상세 설명입니다.' },
            'geumsogkoteu_epic': { name: '금속 코트', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FFWwAa%2FbtsOMa0CeXA%2F0hr7ZPneYK9nMQbfmqnsQk%2Fimg.png', baseStats: { 'HP': 2118, '스피드': 38, '공격': 466, '방어': 169, '특수공격': 423, '특수방어': 169 }, description: '휴대 시 공격 피해 보너스 12% 증가, 방어 무시 8% 증가' },
        }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { rune: [ { id: 'deadly', name: '치명' } ], chip: [ { id: 'loneWolf', name: '늑대행자' } ] },
        lev4: { deadly: { name: '치명', description: '치명 룬의 상세 설명입니다.'}, loneWolf: { name: '늑대행자', description: '늑대행자 칩의 상세 설명입니다.'} }
    },
    deck: {
        lev2: [ { id: 'newbieDeck', name: '초보자 추천덱' } ],
        lev3: { newbieDeck: { name: '초보자 추천덱', description: '콘텐츠 준비 중입니다.' } }
    },
    calendar: {
        lev2: [ { id: 'gachaSchedule', name: '뽑기 일정' } ],
        lev3: { 
            gachaSchedule: { 
                name: '뽑기 일정',
                description: '랭킹뽑기, 한정뽑기 등 주요 이벤트 일정을 확인할 수 있습니다.',
                events: [],
                recurringEvents: []
            } 
        }
    },
    tips: {
        lev2: [ { id: 'beginnerTop10', name: '팁&노하우' } ],
        lev3: { beginnerTop10: { name: '팁&노하우', content: '콘텐츠 준비 중입니다.' } }
    }
};