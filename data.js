const DB = {
    // Lev.1 : 사이드바 메뉴
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
        { id: 'runeAndChip', name: '룬&칩', levels: 4 },
        { id: 'deck', name: '추천덱', levels: 3 },
        { id: 'calendar', name: '캘린더', levels: 3 },
        { id: 'tips', name: '팁&노하우', levels: 3 },
    ],

    // =============================================
    // 포켓몬 타입
    // =============================================
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
            normal: [ { id: 'regigigas', name: '레지기가스' } ],
            fire: [ { id: 'reshiram', name: '레시라무' }, { id: 'zarude', name: '자루도' } ],
            water: [ { id: 'kyogre', name: '원시 가이오가' } ],
            electric: [ { id: 'zekrom', name: '제크로무' } ],
            grass: [ { id: 'shaymin', name: '쉐이미' } ],
            ice: [ { id: 'whiteKyurem', name: '화이트큐레무' } ],
            fighting: [ { id: 'mewtwoX', name: '메가뮤츠X' } ],
            poison: [ { id: 'eternatus', name: '무한다이노' } ],
            flying: [ { id: 'megaRayquaza', name: '메가레쿠쟈(100%폼)' } ],
            psychic: [ { id: 'mewtwoY', name: '메가뮤츠Y' } ],
            bug: [ { id: 'genesect', name: '게노세크트' } ],
            rock: [ { id: 'megaDiancie', name: '메가디안시' } ],
            ghost: [ { id: 'giratina', name: '기라티나' } ],
            dragon: [ { id: 'megaRayquaza', name: '메가레쿠쟈' } ],
            dark: [ { id: 'darkrai', name: '다크라이' } ],
            steel: [ { id: 'zacian', name: '자시안' } ],
            fairy: [ { id: 'diancie', name: '디안시' }, { id: 'xerneas', name: '제르네아스' } ],
        },
        lev4: {
            regigigas: { name: '레지기가스', content: '노말 타입입니다.' },
            reshiram: { name: '레시라무', content: '불 타입입니다.' },
            zarude: { name: '자루도', content: '불 타입입니다.' },
            kyogre: { name: '원시 가이오가', content: '물 타입입니다.' },
            zekrom: { name: '제크로무', content: '전기 타입입니다.' },
            shaymin: { name: '쉐이미', content: '풀 타입입니다.' },
            whiteKyurem: { name: '화이트큐레무', content: '얼음 타입입니다.' },
            mewtwoX: { name: '메가뮤츠X', content: '격투 타입입니다.' },
            eternatus: { name: '무한다이노', content: '독 타입입니다.' },
            megaRayquaza: { name: '메가레쿠쟈(100%폼)', content: '비행 타입입니다.' },
            mewtwoY: { name: '메가뮤츠Y', content: '에스퍼 타입입니다.' },
            genesect: { name: '게노세크트', content: '벌레 타입입니다.' },
            megaDiancie: { name: '메가디안시', content: '바위 타입입니다.' },
            giratina: { name: '기라티나', content: '유령 타입입니다.' },
            megaRayquaza: { name: '메가레쿠쟈', content: '드래곤 타입입니다.' },
            darkrai: { name: '다크라이', content: '악 타입입니다.' },
            zacian: { name: '자시안', content: '강철 타입입니다.' },
            diancie: { name: '디안시', content: '페어리 타입입니다.' },
            xerneas: { name: '제르네아스', content: '페어리 타입입니다.' },
        }
    },

    // =============================================
    // 포켓몬 등급
    // =============================================
    pokemonGrade: {
        lev2: [ { id: 'sPlus', name: 'S+' }, { id: 's', name: 'S' } ],
        lev3: { 
            sPlus: [ {id: 'mew', name: '뮤'} ],
            s: [ {id: 'celebi', name: '세레비'} ],
        },
        lev4: { 
            mew: { name: '뮤', content: 'S+ 등급입니다.' },
            celebi: { name: '세레비', content: 'S 등급입니다.' }
        }
    },

    // =============================================
    // 아이템
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
            rustySword: { name:'녹슨 검', content: '빨강(God) 등급입니다.' },
            kingsRock: { name:'왕의징표석', content: '주황(Legendary) 등급입니다.' },
            leftovers: { name:'먹다남은음식', content: '보라(Epic) 등급입니다.' },
            focusSash: { name:'기합의머리띠', content: '보라(Epic) 등급입니다.' }
        }
    },

    // =============================================
    // 룬 & 칩
    // =============================================
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { 
            rune: [ 
                { id: 'deadly', name: '치명 / Deadly' }, { id: 'wartlike', name: '전투광 / Wartlike' }, { id: 'shield', name: '실드 / Shield' },
                { id: 'kingKong', name: '금강 / King Kong' }, { id: 'defend', name: '방어 / Defend' }, { id: 'shine', name: '반짝임 / Shine' },
                { id: 'counter', name: '반격 / Counter' }, { id: 'flinch', name: '움찔 / Flinch' }, { id: 'fireFance', name: '화무 / Fire Fance' },
                { id: 'sacrifice', name: '헌제 / Sacrifice' }, { id: 'psychic', name: '초능 / Psychic' }, { id: 'shackleSoul', name: '족쇄령 / Shackle Soul' }
            ],
            chip: [
                { id: 'rampageShield', name: '광란의 방패 / Rampage Shield' }, { id: 'loneWolf', name: '늑대대행자 / Lone Wolf' },
                { id: 'tortoiseShell', name: '귀갑 / Tortoise Shell' }, { id: 'fear', name: '공포 / Fear' },
                { id: 'frogThorn', name: '개구리가시 / Frog Thorn' }, { id: 'sun', name: '햇살' }
            ]
        },
        lev4: { 
            deadly: { name: '치명 / Deadly', content: '전투광 룬 입니다.'},
            wartlike: { name: '전투광 / Wartlike', content: '전투광 룬 입니다.'},
            shield: { name: '실드 / Shield', content: '실드 룬 입니다.'},
            kingKong: { name: '금강 / King Kong', content: '금강 룬 입니다.'},
            defend: { name: '방어 / Defend', content: '방어 룬 입니다.'},
            shine: { name: '반짝임 / Shine', content: '반짝임 룬 입니다.'},
            counter: { name: '반격 / Counter', content: '반격 룬 입니다.'},
            flinch: { name: '움찔 / Flinch', content: '움찔 룬 입니다.'},
            fireFance: { name: '화무 / Fire Fance', content: '화무 룬 입니다.'},
            sacrifice: { name: '헌제 / Sacrifice', content: '헌제 룬 입니다.'},
            psychic: { name: '초능 / Psychic', content: '초능 룬 입니다.'},
            shackleSoul: { name: '족쇄령 / Shackle Soul', content: '족쇄령 룬 입니다.'},
            rampageShield: { name: '광란의 방패', content: '광란의 방패 칩 입니다.' },
            loneWolf: { name: '늑대대행자', content: '늑대대행자 칩 입니다.' },
            tortoiseShell: { name: '귀갑', content: '귀갑 칩 입니다.' },
            fear: { name: '공포', content: '공포 칩 입니다.' },
            frogThorn: { name: '개구리가시', content: '개구리가시 칩 입니다.' },
            sun: { name: '햇살', content: '햇살 칩 입니다.' },
        }
    },

    // =============================================
    // 추천덱
    // =============================================
    deck: {
        lev2: [ 
            { id: 'newbieDeck', name: '극초반 뉴비 (S급 8마리)' },
            { id: 'waterFireDeck', name: '물, 페어리' }
        ],
        lev3: { 
            newbieDeck: { name: '극초반 뉴비 (S급 8마리)', content: '보스로라, 코리갑, 포푸니라, 펄기아, 렌트라, 핫삼, 가디안, 버터플 조합의 추천 덱 정보입니다. 콘텐츠 준비 중입니다.' },
            waterFireDeck: { name: '물, 페어리', content: '원시 가이오가, 제르네아스, 마나피, 디안시 조합의 추천 덱 정보입니다. 콘텐츠 준비 중입니다.' },
        }
    },
    
    // =============================================
    // 캘린더
    // =============================================
    calendar: {
        lev2: [ { id: 'ranking', name: '랭킹뽑기' } ],
        lev3: { 
            ranking: { name: '랭킹뽑기', content: '캘린더 형식으로 일정 확인 기능. 콘텐츠 준비 중입니다.' } 
        }
    },

    // =============================================
    // 팁&노하우
    // =============================================
    tips: {
        lev2: [ 
            { id: 'beginnerTop10', name: '초보자를 위한 가이드 TOP 10' }, 
            { id: 'sPlusMaterials', name: 'S+등급 성급재료 단계별 총정리' }, 
            { id: 'shinyReset', name: '매가진화 조각 초기화' } 
        ],
        lev3: { 
            beginnerTop10: { name: '초보자를 위한 가이드 TOP 10', content: '데이터 제공 예정' },
            sPlusMaterials: { name: 'S+등급 성급재료 단계별 총정리', content: '데이터 제공 예정' },
            shinyReset: { name: '매가진화 조각 초기화', content: '데이터 제공 예정' },
        }
    }
};