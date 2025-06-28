const DB = {
    // [신규 추가] 각종 정의 목록 (성격 등)
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
            { id: 'psychic', name: '에스퍼', color: 'psychic' },
            { id: 'normal', name: '노말', color: 'normal' }, { id: 'fire', name: '불', color: 'fire' }, { id: 'water', name: '물', color: 'water' },
            { id: 'grass', name: '풀', color: 'grass' }, { id: 'electric', name: '전기', color: 'electric' }, { id: 'ice', name: '얼음', color: 'ice' },
            { id: 'fighting', name: '격투', color: 'fighting' }, { id: 'poison', name: '독', color: 'poison' }, { id: 'ground', name: '땅', color: 'ground' },
            { id: 'flying', name: '비행', color: 'flying' }, { id: 'bug', name: '벌레', color: 'bug' },
            { id: 'rock', name: '바위', color: 'rock' }, { id: 'ghost', name: '유령', color: 'ghost' }, { id: 'dragon', name: '드래곤', color: 'dragon' },
            { id: 'dark', name: '악', color: 'dark' }, { id: 'steel', name: '강철', color: 'steel' }, { id: 'fairy', name: '페어리', color: 'fairy' }
        ],
        lev3: { 
            psychic: [ { id: 'megamewtwoy', name: '메가뮤츠Y' } ],
            normal: [ { id: 'regigigas', name: '레지기가스' } ],
            fire: [ { id: 'reshiram', name: '레시라무' } ],
        },
        lev4: {
            megamewtwoy: {
                name: { ko: '메가뮤츠Y', en: 'Mega Mewtwo Y' },
                grade: 'SS',
                imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fb4OswI%2FbtsOVCi8x0Y%2FAAAAAAAAAAAAAAAAAAAAAB8G4ziseVkpl0KX-1wKUhsj8SzsVEwNwf5OmFmppKAA%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1751295599%26allow_ip%3D%26allow_referer%3D%26signature%3DNJUZyE8OW4efBzWgML9q3Vj2NKg%253D',
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
                    { id: 'nokseungeom_legendary', name: '녹슨검(Legendary)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fmp4u9%2FbtsONLeu4AO%2FyKN9LkTgZDLbpFWHXZHxY1%2Fimg.png' },
                ],
                recommendedRunes: [
                    { id: 'deadly', name: '치명(Deadly)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbU9JRa%2FbtsOv8izvWj%2FIf5dAZJsul5BwpbV6ECDuk%2Fimg.png' }
                ],
                recommendedChips: [
                    { id: 'loneWolf', name: '늑대행자(Lone Wolf)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcUh4D2%2FbtsOx40jDq4%2FyXEinUS88JPLxcuACYkjr1%2Fimg.png' }
                ]
            },
            regigigas: { name: { ko: '레지기가스', en: 'Regigigas' }, grade: 'S+', imageURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/486.png', stats: { 'HP': 110, 'Speed': 100, 'P.ATK': 160, 'P.DEF': 110, 'SP.ATK': 80, 'SP.DEF': 110 } },
            reshiram: { name: { ko: '레시라무', en: 'Reshiram' }, grade: 'S+' },
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
            epic: [ {id:'leftovers_epic', name:'먹다남은음식'} ] 
        },
        lev4: { 
            'nokseungeom_god': { name: '녹슨검', description: 'God 등급 녹슨검의 상세 설명입니다.' },
            'nokseungeom_legendary': { name: '녹슨검', description: 'Legendary 등급 녹슨검의 상세 설명입니다.' },
            'leftovers_epic': { name: '먹다남은음식', description: 'Epic 등급 먹다남은음식의 상세 설명입니다.' }
        }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { rune: [ { id: 'deadly', name: '치명 / Deadly' } ], chip: [ { id: 'loneWolf', name: '늑대행자(Lone Wolf)' } ] },
        lev4: { deadly: { name: '치명 / Deadly', description: '치명 룬의 상세 설명입니다.'}, loneWolf: { name: '늑대행자(Lone Wolf)', description: '늑대행자 칩의 상세 설명입니다.'} }
    },
    deck: {
        lev2: [ { id: 'newbieDeck', name: '극초반 뉴비 (S급 8마리)' } ],
        lev3: { newbieDeck: { name: '극초반 뉴비 (S급 8마리)', description: '콘텐츠 준비 중입니다.' } }
    },
    calendar: {
        lev2: [ { id: 'gachaSchedule', name: '뽑기 일정' } ],
        lev3: { 
            gachaSchedule: { 
                name: '뽑기 일정',
                description: '랭킹뽑기, 한정뽑기 등 주요 이벤트 일정을 확인할 수 있습니다.',
                events: [
                    { title: '웅의 메가 강철톤(강철/땅)[무쇠 바퀴]', type: 'ranking', startDate: '2025-07-18', endDate: '2025-07-20' }
                ],
                recurringEvents: [
                    { title: '복냥이', type: 'special', durationDays: 3, recurrence: { unit: 'weeks', interval: 4 }, startDate: '2025-06-27' }
                ]
            } 
        }
    },
    tips: {
        lev2: [ { id: 'beginnerTop10', name: '팁&노하우' } ],
        lev3: { beginnerTop10: { name: '팁&노하우', content: '콘텐츠 준비 중입니다.' } }
    }
};