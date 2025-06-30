const DB = {
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
        lev2: [ { id: 'fire', name: '불', color: 'fire' }, { id: 'water', name: '물', color: 'water' } ],
        lev3: { fire: [ { id: 'charizard', name: '리자몽' } ] },
        lev4: { charizard: { name: '리자몽', description: '리자몽 최종 설명입니다.' } }
    },
    pokemonGrade: {
        lev2: [ { id: 's', name: 'S' } ],
        lev3: { s: [ {id: 'mewtwo', name: '뮤츠'} ] },
        lev4: { mewtwo: { name: '뮤츠', description: '뮤츠 최종 설명입니다.' } }
    },
    item: {
        lev2: [ {id:'epic', name:'보라(Epic)'} ],
        lev3: { epic: [ {id: 'leftovers', name:'먹다남은음식'} ] },
        lev4: { leftovers: { name:'먹다남은음식', description: '매우 맛있는 음식입니다.' } }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { rune: [ {id: 'deadly', name: '치명'} ], chip: [ {id: 'loneWolf', name: '늑대행자'} ] },
        lev4: { deadly: {name: '치명', description: '치명 룬 설명'}, loneWolf: {name: '늑대행자', description: '늑대행자 칩 설명'} }
    },
    deck: {
        lev2: [ { id: 'newbieDeck', name: '초보자 추천덱' } ],
        lev3: { newbieDeck: { name: '초보자 추천덱', description: '콘텐츠 준비 중입니다.' } }
    },
    calendar: {
        lev2: [ { id: 'gachaSchedule', name: '뽑기 일정' } ],
        lev3: { gachaSchedule: { name: '뽑기 일정', description: '콘텐츠 준비 중입니다.' } }
    },
    tips: {
        lev2: [ { id: 'beginnerTop10', name: '팁&노하우' } ],
        lev3: { beginnerTop10: { name: '팁&노하우', content: '콘텐츠 준비 중입니다.' } }
    }
};