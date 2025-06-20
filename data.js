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
        lev2: [ { id: 'water', name: '물' }, { id: 'fire', name: '불' } ],
        lev3: { 
            water: [ { id: 'kyogre', name: '가이오가' } ],
            fire: [ { id: 'charizard', name: '리자몽' } ],
        },
        lev4: { 
            kyogre: { name: '가이오가', content: '가이오가 최종 설명 (Lev.4)' },
            charizard: { name: '리자몽', content: '리자몽 최종 설명 (Lev.4)' }
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'SS', name: 'SS' } ],
        lev3: { SS: [ {id: 'mewtwo', name: '뮤츠'} ] },
        lev4: { mewtwo: { name: '뮤츠', content: '뮤츠 최종 설명 (Lev.4)' } }
    },
    item: {
        lev2: [ {id:'red', name:'빨간색'} ],
        lev3: { red: [ {id:'rustySword', name:'녹슨 검'} ] },
        lev4: { rustySword: { name:'녹슨 검', content: '녹슨 검 최종 설명 (Lev.4)' } }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'} ],
        lev3: { rune: [ { id: 'critical', name: '치명' } ] },
        lev4: { critical: { name: '치명', content: '치명 룬 최종 설명 (Lev.4)'} }
    },
    deck: {
        lev2: [ { id: 'fireDeck', name: '불 추천덱' } ],
        lev3: { fireDeck: { name: '불 추천덱', content: '불 추천덱 최종 설명 (Lev.3)' } }
    },
    calendar: {
        lev2: [ { id: 'ranking', name: '랭킹뽑기' } ],
        lev3: { ranking: { name: '랭킹뽑기 일정', content: '랭킹뽑기 최종 설명 (Lev.3)' } }
    },
    tips: {
        lev2: [ { id: 'guide', name: '육성가이드' } ],
        lev3: { guide: { name: '육성가이드', content: '육성가이드 최종 설명 (Lev.3)'} }
    }
};