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

    // 1. 포켓몬 타입

    pokemonType: {

        lev2: [ { id: 'normal', name: '노말', color: '#A8A878' }, { id: 'fire', name: '불', color: '#F08030' }, { id: 'water', name: '물', color: '#6890F0' }, { id: 'grass', name: '풀', color: '#78C850' }, { id: 'electric', name: '전기', color: '#F8D030' }, { id: 'ice', name: '얼음', color: '#98D8D8' }, { id: 'fighting', name: '격투', color: '#C03028' }, { id: 'poison', name: '독', color: '#A040A0' }, { id: 'ground', name: '땅', color: '#E0C068' }, { id: 'flying', name: '비행', color: '#A890F0' }, { id: 'psychic', name: '에스퍼', color: '#F85888' }, { id: 'bug', name: '벌레', color: '#A8B820' }, { id: 'rock', name: '바위', color: '#B8A038' }, { id: 'ghost', name: '유령', color: '#705898' }, { id: 'dragon', name: '드래곤', color: '#7038F8' }, { id: 'dark', name: '악', color: '#705848' }, { id: 'steel', name: '강철', color: '#B8B8D0' }, { id: 'fairy', name: '페어리', color: '#EE99AC' } ],

        lev3: { 

            water: [ { id: 'kyogre', name: '가이오가' } ],

            fire: [ { id: 'charizard', name: '리자몽' } ],

            normal: [ { id: 'snorlax', name: '잠만보' } ],

            grass: [ { id: 'bulbasaur', name: '이상해씨' } ],

            electric: [ { id: 'pikachu', name: '피카츄' } ],

            ice: [ { id: 'lapras', name: '라프라스' } ],

            fighting: [ { id: 'machamp', name: '괴력몬' } ],

            poison: [ { id: 'gengar', name: '팬텀' } ],

            ground: [ { id: 'rhydon', name: '코뿌리' } ],

            flying: [ { id: 'pidgeot', name: '피죤투' } ],

            psychic: [ { id: 'alakazam', name: '후딘' } ],

            bug: [ { id: 'scyther', name: '스라크' } ],

            rock: [ { id: 'golem', name: '딱구리' } ],

            ghost: [ { id: 'gengar2', name: '팬텀' } ],

            dragon: [ { id: 'dragonite', name: '망나뇽' } ],

            dark: [ { id: 'tyranitar', name: '마기라스' } ],

            steel: [ { id: 'scizor', name: '핫삼' } ],

            fairy: [ { id: 'gardevoir', name: '가디안' } ]

        },

        lev4: { 

            kyogre: { name: '가이오가', content: '<h3>가이오가</h3><p>바다를 넓힌 포켓몬으로 알려져있다.</p>' },

            charizard: { name: '리자몽', content: '<h3>리자몽</h3><p>맹렬한 불꽃을 내뿜는다.</p>' },

            snorlax: { name: '잠만보', content: '<h3>잠만보</h3><p>먹고 자는게 일상이다.</p>' },

            // 모든 테스트 포켓몬에 대한 lev4 데이터 추가

            bulbasaur: { name: '이상해씨', content: '<h3>이상해씨</h3><p>씨앗 포켓몬이다.</p>'},

            pikachu: { name: '피카츄', content: '<h3>피카츄</h3><p>전기 포켓몬이다.</p>'},

            lapras: { name: '라프라스', content: '<h3>라프라스</h3><p>탈것 포켓몬이다.</p>'},

            machamp: { name: '괴력몬', content: '<h3>괴력몬</h3><p>괴력 포켓몬이다.</p>'},

            gengar: { name: '팬텀', content: '<h3>팬텀</h3><p>그림자 포켓몬이다.</p>'},

            rhydon: { name: '코뿌리', content: '<h3>코뿌리</h3><p>드릴 포켓몬이다.</p>'},

            pidgeot: { name: '피죤투', content: '<h3>피죤투</h3><p>새 포켓몬이다.</p>'},

            alakazam: { name: '후딘', content: '<h3>후딘</h3><p>초능력 포켓몬이다.</p>'},

            scyther: { name: '스라크', content: '<h3>스라크</h3><p>사마귀 포켓몬이다.</p>'},

            golem: { name: '딱구리', content: '<h3>딱구리</h3><p>거석 포켓몬이다.</p>'},

            gengar2: { name: '팬텀', content: '<h3>팬텀</h3><p>그림자 포켓몬이다.</p>'},

            dragonite: { name: '망나뇽', content: '<h3>망나뇽</h3><p>드래곤 포켓몬이다.</p>'},

            tyranitar: { name: '마기라스', content: '<h3>마기라스</h3><p>갑옷 포켓몬이다.</p>'},

            scizor: { name: '핫삼', content: '<h3>핫삼</h3><p>집게 포켓몬이다.</p>'},

            gardevoir: { name: '가디안', content: '<h3>가디안</h3><p>포용 포켓몬이다.</p>'}

        }

    },

    pokemonGrade: {

        lev2: [ { id: 'SS', name: 'SS' }, { id: 'Splus', name: 'S+' }, { id: 'S', name: 'S' } ],

        lev3: { 

            SS: [ {id: 'mewtwo', name: '뮤츠'} ],

            Splus: [ {id: 'darkrai', name: '다크라이'} ],

            S: [ {id: 'lucario', name: '루카리오'} ]

        },

        lev4: { 

            mewtwo: { name: '뮤츠', content: '<h3>뮤츠</h3><p>강력한 유전자를 가졌다.</p>' },

            darkrai: { name: '다크라이', content: '<h3>다크라이</h3><p>악몽을 꾸게 한다.</p>' },

            lucario: { name: '루카리오', content: '<h3>루카리오</h3><p>파동을 다룬다.</p>' }

        }

    },

    item: {

        lev2: [ {id:'red', name:'빨간색', color:'#E74C3C'}, {id:'orange',name:'주황색', color:'#E67E22'}, {id:'purple',name:'보라색', color:'#9B59B6'} ],

        lev3: { 

            red: [ {id:'rustySword', name:'녹슨 검'} ],

            orange: [ {id:'oranBerry', name:'오랭열매'} ],

            purple: [ {id:'masterBall', name:'마스터볼'} ],

        },

        lev4: { 

            rustySword: { name:'녹슨 검', content: '<h3>녹슨 검</h3><p>자시안에게 힘을 준다.</p>' },

            oranBerry: { name: '오랭열매', content: '<h3>오랭열매</h3><p>HP를 10 회복한다.</p>' },

            masterBall: { name: '마스터볼', content: '<h3>마스터볼</h3><p>반드시 포켓몬을 잡는다.</p>' }

        }

    },

    runeAndChip: {

        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],

        lev3: {

            rune: [ { id: 'critical', name: '치명' }, { id: 'berserker', name: '전투광' } ],

            chip: [ { id: 'hwamu', name: '화무' }, { id: 'heonje', name: '헌제' } ],

        },

        lev4: {

            critical: { name: '치명', content: '<h3>치명 룬</h3><p>상세 설명입니다.</p>'},

            berserker: { name: '전투광', content: '<h3>전투광 룬</h3><p>상세 설명입니다.</p>'},

            hwamu: { name: '화무 칩', content: '<h3>화무 칩</h3><p>상세 설명입니다.</p>'},

            heonje: { name: '헌제 칩', content: '<h3>헌제 칩</h3><p>상세 설명입니다.</p>'}

        }

    },

    deck: {

        lev2: [ { id: 'fireDeck', name: '불 추천덱' }, { id: 'waterDeck', name: '물 추천덱' } ],

        lev3: {

            fireDeck: { name: '불 추천덱', content: '<h3>불 타입 추천덱</h3><p>리자몽, 앤테이, 칠색조 조합입니다.</p>' },

            waterDeck: { name: '물 추천덱', content: '<h3>물 타입 추천덱</h3><p>거북왕, 스이쿤, 가이오가 조합입니다.</p>' }

        }

    },

    calendar: {

        lev2: [ { id: 'ranking', name: '랭킹뽑기' }, { id: 'limited', name: '한정뽑기' } ],

        lev3: { 

            ranking: { name: '랭킹뽑기 일정', content: `<h3>랭킹뽑기 일정</h3><p>2025.07.18 웅의 메가 강철톤</p>` },

            limited: { name: '한정뽑기 일정', content: `<h3>한정뽑기 일정</h3><p>2025.08.01 무한다이노, 미라이돈</p>` }

        }

    },

    tips: {

        lev2: [ { id: 'guide', name: '육성가이드' }, { id: 'star', name: '성급기준' } ],

        lev3: { 

            guide: { name: '육성가이드', content: '<h3>육성 가이드입니다.</h3><p>내용은 나중에 채워넣습니다.</p>'},

            star: { name: '성급기준', content: '<h3>성급 기준입니다.</h3><p>내용은 나중에 채워넣습니다.</p>'}

        }

    }

};