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
            water: [ { id: 'kyogre', name: '가이오가' }, {id: 'manaphy', name: '마나피'} ],
            fire: [ { id: 'charizard', name: '리자몽' } ],
            fighting: [ { id: 'megaMewtwoX', name: '메가뮤츠X' } ],
        },
        lev4: { 
            kyogre: { name: '원시 가이오가', grade: 'SS', types: ['물'], skills: { active: '근원의파동', passive: '시작의바다' }, items: ['item_blueorb'], runes: ['rune_aegis'], chips: ['chip_wolfwalker'], imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/200.png' },
            manaphy: { name: '마나피', grade: 'S+', types: ['물'], skills: { active: '하트스왑', passive: '촉촉바디' }, items: ['item_mysticwater'], runes: [], chips: [], imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/490.png' },
            charizard: { name: '리자몽', grade: 'A', types: ['불', '비행'], skills: { active: '화염방사', passive: '맹화' }, items: [], runes: [], chips: [], imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png' },
            megaMewtwoX: { name: '메가뮤츠X', grade: 'SS', types: ['에스퍼', '격투'], skills: { active: '사이코브레이크', passive: '불굴의마음' }, items: ['item_rustySword'], runes: ['rune_berserker'], chips: ['chip_firedance'], imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10046.png' }
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'SS', name: 'SS' }, { id: 'Splus', name: 'S+' }, { id: 'S', name: 'S' } ],
        lev3: { 
            SS: [ {id: 'megaMewtwoX', name: '메가뮤츠X'} ], Splus: [ {id: 'darkrai', name: '다크라이'} ], S: [ {id: 'lucario', name: '루카리오'} ]
        },
        lev4: { 
             megaMewtwoX: { name: '메가뮤츠X', grade: 'SS', types: ['에스퍼', '격투'], skills: { active: '사이코브레이크', passive: '불굴의마음' }, items: ['item_rustySword'], runes: ['rune_berserker'], chips: ['chip_firedance'], imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10046.png' }
        }
    },
    item: {
        lev2: [ {id:'red', name:'빨간색', color:'#E74C3C'}, {id:'orange',name:'주황색', color:'#E67E22'}, {id:'purple',name:'보라색', color:'#9B59B6'} ],
        lev3: { 
            red: [ {id:'item_rustySword', name:'녹슨 검(Rusty Sword)'} ], orange: [ {id:'item_oranBerry', name:'오랭열매(Oran Berry)'} ], purple: [ {id:'item_masterBall', name:'마스터볼(Master Ball)'} ],
        },
        lev4: { 
            item_rustySword: { name:'녹슨 검(Rusty Sword)', type: '전용 아이템', effect: '자시안에게 힘을 부여한다.', imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rusty-sword.png', description: '<h3>녹슨 검</h3><p>오래된 검이지만, 특정 포켓몬에게 강대한 힘을 이끌어내는 신비한 힘이 깃들어 있다.</p>' }, 
            item_oranBerry: { name: '오랭열매(Oran Berry)', type: '회복 아이템', effect: 'HP를 10 회복한다.', imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oran-berry.png', description: '<h3>오랭열매</h3><p>포켓몬에게 주면 HP를 약간 회복시켜주는 나무열매. 달콤하고 맛있다.</p>'},
            item_masterBall: { name: '마스터볼(Master Ball)', type: '포획 아이템', effect: '반드시 포켓몬을 잡는다.', imgUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png', description: '<h3>마스터볼</h3><p>궁극의 성능을 자랑하는 볼. 야생 포켓몬을 반드시 잡을 수 있다.</p>' }
        }
    },
    runeAndChip: {
        lev2: [ { "id": "rune", name: "룬" }, { "id": "chip", name: "칩" } ],
        lev3: {
            rune: [ { "id": "rune_berserker", name: "전투광(Warlike)" }, { "id": "rune_aegis", name: "비호(Aegis)" } ],
            chip: [ { "id": "chip_firedance", name: "화무(Fire Dance)" }, { "id": "chip_wolfwalker", name: "늑대행자(Lone Wolf)"} ]
        },
        lev4: {
            rune_berserker: { name: '전투광(Warlike)', setImage: '전투광 룬 세트', effect: '공격 시 데미지가 대폭 증가한다.', imgUrl: 'https://via.placeholder.com/64/FFD700/000000?text=R', description: '<h3>전투광 룬</h3><p>공격적인 성향을 극한으로 끌어올리는 룬 세트의 일부입니다.</p>'},
            chip_firedance: { name: '화무(Fire Dance)', setImage: '화무 칩 세트', effect: '불타입 기술의 위력이 상승한다.', imgUrl: 'https://via.placeholder.com/64/FF6347/000000?text=C', description: '<h3>화무 칩</h3><p>타오르는 불꽃의 춤을 형상화한 칩입니다.</p>'}
        }
    },
    deck: {
        lev2: [ { id: 'fireDeck', name: '불덱' }, { id: 'waterFairyDeck', name: '물페어리덱' } ],
        lev3: { "fireDeck": { "name": "불덱", "content": "<h3>🔥 불덱 구성원</h3><p>원시 그란돈<br>마샤도<br>이터나투스<br>레시라무<br>이로치 칠색조<br>큐레무</p>" }, "waterFairyDeck": { "name": "물페어리덱", "content": "<h3>💧 물페어리덱 구성원</h3><p>원시 가이오가<br>마나피<br>아쿠아단 마기아나<br>디안시<br>제르네아스<br>이로치 메가 가디안</p>" } }
    },
    calendar: {
        lev2: [ { id: 'ranking', name: '랭킹뽑기' }, { id: 'limited', name: '한정뽑기' } ],
        lev3: { "ranking": { "name": "랭킹뽑기", "content": "<h3>기간: 25.06.19 ~ 25.06.26</h3><p>이번주 랭킹뽑기 대상: <b>메가 레쿠쟈</b></p>" }, "limited": { "name": "한정뽑기", "content": "<h3>기간: 25.06.20 ~ 25.06.22</h3><p>주말 한정뽑기: <b>챔피언 피카츄</b></p>" } }
    },
    tips: {
        lev2: [ { id: 'star', name: 'S+급·S급 성급재료' }, { id: 'guide', name: '초보자 가이드 TOP10' } ],
        lev3: {
            "star": { "name": "S+급·S급 단계별 성급재료 총정리표", "content": "<h3>성급 재료 가이드</h3><p>내용 준비중입니다...</p>" },
            "guide": { "name": "포켓몬 유저라면 꼭 알아야 할 초보자 가이드 TOP10", "content": "<h3>초보자 가이드</h3><p>내용 준비중입니다...</p>" }
        }
    }
};