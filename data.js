const DB = {
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입' },
        { id: 'pokemonGrade', name: '포켓몬 등급' },
        { id: 'item', name: '아이템' },
        { id: 'runeAndChip', name: '룬&칩' },
        { id: 'deck', name: '추천덱' },
        { id: 'calendar', name: '캘린더' },
        { id: 'tips', name: '팁&노하우' },
    ],
    pokemonType: {
        lev2: [ { id: 'normal', name: '노말', color: '#A8A878' }, { id: 'fire', name: '불', color: '#F08030' }, { id: 'water', name: '물', color: '#6890F0' } ],
        lev3: { water: [ { id: 'kyogre', name: '가이오가' } ] },
        lev4: { kyogre: { name: '가이오가', content: '<h3>가이오가</h3><p>바다를 넓힌 포켓몬입니다.</p>' } }
    },
    // 다른 카테고리들은 비어있는 상태로 둡니다.
    pokemonGrade: { lev2: [], lev3: {}, lev4: {} },
    item: { lev2: [], lev3: {}, lev4: {} },
    runeAndChip: { lev2: [], lev3: {}, lev4: {} },
    deck: { lev2: [], lev3: {} },
    calendar: { lev2: [], lev3: {} },
    tips: { lev2: [], lev3: {} }
};