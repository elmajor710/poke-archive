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
        lev2: [ { id: 'normal', name: '노말', color: '#A8A878' }, { id: 'fire', name: '불', color: '#F08030' }, { id: 'water', name: '물', color: '#6890F0' }, { id: 'grass', name: '풀', color: '#78C850' }, { id: 'electric', name: '전기', color: '#F8D030' }, { id: 'ice', name: '얼음', color: '#98D8D8' }, { id: 'fighting', name: '격투', color: '#C03028' }, { id: 'poison', name: '독', color: '#A040A0' }, { id: 'ground', name: '땅', color: '#E0C068' }, { id: 'flying', name: '비행', color: '#A890F0' }, { id: 'psychic', name: '에스퍼', color: '#F85888' }, { id: 'bug', name: '벌레', color: '#A8B820' }, { id: 'rock', name: '바위', color: '#B8A038' }, { id: 'ghost', name: '유령', color: '#705898' }, { id: 'dragon', name: '드래곤', color: '#7038F8' }, { id: 'dark', name: '악', color: '#705848' }, { id: 'steel', name: '강철', color: '#B8B8D0' }, { id: 'fairy', name: '페어리', color: '#EE99AC' } ],
        lev3: { 
            water: [ { id: 'kyogre', name: '가이오가' } ], fire: [ { id: 'charizard', name: '리자몽' } ], normal: [ { id: 'snorlax', name: '잠만보' } ], grass: [ { id: 'bulbasaur', name: '이상해씨' } ], electric: [ { id: 'pikachu', name: '피카츄' } ], ice: [ { id: 'lapras', name: '라프라스' } ], fighting: [ { id: 'machamp', name: '괴력몬' } ], poison: [ { id: 'gengar', name: '팬텀' } ], ground: [ { id: 'rhydon', name: '코뿌리' } ], flying: [ { id: 'pidgeot', name: '피죤투' } ], psychic: [ { id: 'alakazam', name: '후딘' } ], bug: [ { id: 'scyther', name: '스라크' } ], rock: [ { id: 'golem', name: '딱구리' } ], ghost: [ { id: 'gengar2', name: '팬텀' } ], dragon: [ { id: 'dragonite', name: '망나뇽' } ], dark: [ { id: 'tyranitar', name: '마기라스' } ], steel: [ { id: 'scizor', name: '핫삼' } ], fairy: [ { id: 'gardevoir', name: '가디안' } ]
        },
        lev4: { 
            kyogre: { name: '가이오가', content: '<h3>가이오가</h3><p>바다를 넓힌 포켓몬으로 알려져있다.</p>' }, charizard: { name: '리자몽', content: '<h3>리자몽</h3><p>맹렬한 불꽃을 내뿜는다.</p>' }, snorlax: { name: '잠만보', content: '<h3>잠만보</h3><p>먹고 자는게 일상이다.</p>'}
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'SS', name: 'SS' }, { id: 'Splus', name: 'S+' }, { id: 'S', name: 'S' } ],
        lev3: { 
            SS: [ {id: 'mewtwo', name: '뮤츠'} ], Splus: [ {id: 'darkrai', name: '다크라이'} ], S: [ {id: 'lucario', name: '루카리오'} ]
        },
        lev4: { 
            mewtwo: { name: '뮤츠', content: '<h3>뮤츠</h3><p>강력한 유전자를 가졌다.</p>' }, darkrai: { name: '다크라이', content: '<h3>다크라이</h3><p>악몽을 꾸게 한다.</p>' }, lucario: { name: '루카리오', content: '<h3>루카리오</h3><p>파동을 다룬다.</p>'}
        }
    },
    item: {
        lev2: [ {id:'red', name:'빨간색', color:'#E74C3C'}, {id:'orange',name:'주황색', color:'#E67E22'}, {id:'purple',name:'보라색', color:'#9B59B6'} ],
        lev3: { 
            red: [ {id:'rustySword', name:'녹슨 검'} ], orange: [ {id:'oranBerry', name:'오랭열매'} ], purple: [ {id:'masterBall', name:'마스터볼'} ],
        },
        lev4: { 
            rustySword: { name:'녹슨 검', content: '<h3>녹슨 검</h3><p>자시안에게 힘을 준다.</p>' }, oranBerry: { name: '오랭열매', content: '<h3>오랭열매</h3><p>HP를 10 회복한다.</p>' }, masterBall: { name: '마스터볼', content: '<h3>마스터볼</h3><p>반드시 포켓몬을 잡는다.</p>' }
        }
    },
    runeAndChip: {
        lev2: [ { "id": "rune", name: "룬" }, { "id": "chip", name: "칩" } ],
        lev3: {
            rune: [ { "id": "counter", name: "반격(Counter)" }, { "id": "sparkle", name: "반짝임(Sparkle)" }, { "id": "aegis", "name": "비호(Aegis)" }, { "id": "diamond", name: "금강(King Kong)" }, { "id": "shield", name: "실드(Shield)" }, { "id": "defense", name: "방어(Defend)" }, { "id": "berserker", name: "전투광(Warlike)" }, { "id": "critical", name: "치명(Deadly)" }, { "id": "power", name: "강격(Punch)" } ],
            chip: [ { "id": "sacrifice", name: "헌제(Sacrifice)" }, { "id": "terror", name: "공포(Fear)" }, { "id": "psychic", name: "초능(Psychic)" }, { "id": "snakeghost", name: "뱀유령(Snake Soul)" }, { "id": "pavise", name: "방패(Fist Shield)" }, { "id": "carapace", name: "귀갑(Tortoise Shell)" }, { "id": "wolfwalker", name: "늑대행자(Lone Wolf)" }, { "id": "frogthorn", name: "개구리가시(Frog Thorn)" }, { "id": "firedance", name: "화무(Fire Dance)" } ]
        },
        lev4: {}
    },
    deck: {
        lev2: [ { id: 'fireDeck', name: '불덱' }, { id: 'waterFairyDeck', name: '물페어리덱' }, { id: 'electricDeck', name: '전기덱' }, { id: 'grassDeck', name: '풀덱' } ],
        lev3: {
            "fireDeck": { "name": "불덱", "content": "<h3>🔥 불덱 구성원</h3><p>원시 그란돈<br>마샤도<br>이터나투스<br>레시라무<br>이로치 칠색조<br>큐레무</p>" },
            "waterFairyDeck": { "name": "물페어리덱", "content": "<h3>💧 물페어리덱 구성원</h3><p>원시 가이오가<br>마나피<br>아쿠아단 마기아나<br>디안시<br>제르네아스<br>이로치 메가 가디안</p>" },
            "electricDeck": { "name": "전기덱", "content": "<h3>⚡ 전기덱 구성원</h3><p>제라오라<br>아르세우스<br>레지에레키<br>카푸꼬꼬꼭<br>제크로무<br>볼트로스</p>" },
            "grassDeck": { "name": "풀덱", "content": "<h3>🍃 풀덱 구성원</h3><p>자루도<br>고릴타<br>조로아크<br>버드렉스<br>세레비<br>쉐이미</p>" }
        }
    },
    calendar: {
        lev2: [ { id: 'ranking', name: '랭킹뽑기' }, { id: 'limited', name: '한정뽑기' } ],
        lev3: {
            "ranking": { "name": "랭킹뽑기", "content": `...` },
            "limited": { "name": "한정뽑기", "content": `...` }
        }
    },
    tips: {
        lev2: [ { id: 'star', name: 'S+급·S급 단계별 성급재료 총정리표' }, { id: 'guide', 'name': '포켓몬 유저라면 꼭 알아야 할 초보자 가이드 TOP10' }, { id: 'megaEvolution', name: '포켓몬 메가진화 조건 총정리' } ],
        lev3: {
            "star": { "name": "S+급·S급 단계별 성급재료 총정리표", "content": `...` },
            "guide": { "name": "포켓몬 유저라면 꼭 알아야 할 초보자 가이드 TOP10", "content": `...` },
            "megaEvolution": { "name": "포켓몬 메가진화 조건 총정리", "content": `...` }
        }
    }
};