const DB = {
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
    ],
    pokemonType: {
        lev2: [ 
            { id: 'normal', name: '노말', color: 'normal' }, { id: 'fire', name: '불', color: 'fire' }, { id: 'water', name: '물', color: 'water' },
            { id: 'grass', name: '풀', color: 'grass' }, { id: 'electric', name: '전기', color: 'electric' }, { id: 'ice', name: '얼음', color: 'ice' },
            { id: 'fighting', name: '격투', color: 'fighting' }, { id: 'poison', name: '독', color: 'poison' }, { id: 'ground', name: '땅', color: 'ground' },
            { id: 'flying', name: '비행', color: 'flying' }, { id: 'psychic', name: '에스퍼', color: 'psychic' }, { id: 'bug', name: '벌레', color: 'bug' },
            { id: 'rock', name: '바위', color: 'rock' }, { id: 'ghost', name: '유령', color: 'ghost' }, { id: 'dragon', name: '드래곤', color: 'dragon' },
            { id: 'dark', name: '악', color: 'dark' }, { id: 'steel', name: '강철', color: 'steel' }, { id: 'fairy', name: '페어리', color: 'fairy' }
        ],
        lev3: { 
            fire: [ { id: 'charizard', name: '리자몽' } ],
        },
        lev4: {
            charizard: { name: '리자몽', content: '리자몽 최종 설명입니다.' },
        }
    },
    pokemonGrade: {
        lev2: [ { id: 's', name: 'S' } ],
        lev3: { s: [ {id: 'mewtwo', name: '뮤츠'} ] },
        lev4: { mewtwo: { name: '뮤츠', content: '뮤츠 최종 설명입니다.' } }
    },
    item: {
        lev2: [ {id:'epic', name:'보라(Epic)'} ],
        lev3: { epic: [ {id: 'leftovers', name:'먹다남은음식'} ] },
        lev4: { leftovers: { name:'먹다남은음식', description: '매우 맛있는 음식입니다.' } }
    }
};