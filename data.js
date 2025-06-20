const DB = {
    // sidebarMenu는 이전과 동일합니다.
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
        { id: 'runeAndChip', name: '룬&칩', levels: 4 },
        { id: 'deck', name: '추천덱', levels: 3 },
        { id: 'calendar', name: '캘린더', levels: 3 },
        { id: 'tips', name: '팁&노하우', levels: 3 },
    ],

    // pokemonType 데이터는 이전과 동일합니다.

    // pokemonGrade 데이터는 이전과 동일합니다.

    // =============================================
    // [수정됨] 아이템
    // Lev.3과 Lev.4의 데이터가 일치하도록 수정했습니다.
    // =============================================
    item: {
        lev2: [ 
            {id:'god', name:'빨강(God)'},
            {id:'legendary', name:'주황(Legendary)'},
            {id:'epic', name:'보라(Epic)'} 
        ],
        lev3: { 
            god: [ {id:'rustySword', name:'녹슨검'} ],
            legendary: [ {id:'kingsRock', name:'왕의징표석'} ],
            epic: [ {id:'leftovers', name:'먹다남은음식'}, {id:'focusSash', name:'기합의머리띠'} ],
        },
        lev4: { 
            // Lev.3 목록에 맞춰 Lev.4 데이터를 추가 및 수정
            rustySword: { name:'녹슨검', imageURL: '이미지URL_준비중', description: '자시안에게 지니게 하면 강철타입으로 변화하며, 공격이 1.2배 강해진다.' },
            kingsRock: { name:'왕의징표석', imageURL: '이미지URL_준비중', description: '공격 기술에 10% 확률로 풀죽음 효과를 부여한다.' },
            leftovers: { name:'먹다남은음식', imageURL: '이미지URL_준비중', description: '지니게 하면 매 턴마다 최대 HP의 1/16만큼 HP를 회복한다.' },
            focusSash: { name:'기합의머리띠', imageURL: '이미지URL_준비중', description: 'HP가 가득 찬 상태에서 기술을 받아 쓰러질 경우, HP 1을 남기고 한 번 버틴다.'}
        }
    },

    // =============================================
    // [수정됨] 룬 & 칩
    // Lev.3과 Lev.4의 데이터가 일치하도록 수정했습니다.
    // =============================================
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { 
            rune: [ { id: 'deadly', name: '치명 / Deadly' }, { id: 'shield', name: '실드 / Shield' } ],
            chip: [ { id: 'loneWolf', name: '늑대대행자 / Lone Wolf' }, { id: 'tortoiseShell', name: '귀갑 / Tortoise Shell' } ]
        },
        lev4: { 
            // Lev.3 목록에 맞춰 Lev.4 데이터를 추가 및 수정
            deadly: { name: '치명 / Deadly', imageURL: '이미지URL_준비중', description: '치명 룬에 대한 설명입니다.'},
            shield: { name: '실드 / Shield', imageURL: '이미지URL_준비중', description: '실드 룬에 대한 설명입니다.'},
            loneWolf: { name: '늑대대행자 / Lone Wolf', imageURL: '이미지URL_준비중', description: '늑대대행자 칩에 대한 설명입니다.' },
            tortoiseShell: { name: '귀갑 / Tortoise Shell', imageURL: '이미지URL_준비중', description: '귀갑 칩에 대한 설명입니다.' },
        }
    },

    // 나머지 deck, calendar, tips 데이터는 이전과 동일합니다.
};