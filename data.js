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
            fire: [ { id: 'reshiram', name: '레시라무' } ],
        },
        lev4: {
            regigigas: { name: '레지기가스', grade: 'S+', imageURL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/486.png', stats: { 'HP': 110, '스피드': 100, '공격': 160, '방어': 110, '특수공격': 80, '특수방어': 110 }, skills: { active: '엄청난힘', ultimate: '기가임팩트', passive: '슬로스타트' }, recommendedItems: [ { id: 'leftovers', name: '먹다남은음식', imageURL: '이미지URL_준비중', reason: 'HP를 회복하여 안정성을 높입니다.' } ], recommendedRunes: [ { id: 'kingKong', name: '금강 룬', imageURL: '이미지URL_준비중', reason: '공격력을 극대화합니다.' } ], recommendedChips: [ { id: 'loneWolf', name: '늑대대행자 칩', imageURL: '이미지URL_준비중', reason: '단일 공격 능력을 강화합니다.' } ] },
            reshiram: { name: '레시라무', grade: 'S+', content: '콘텐츠 준비 중입니다.' },
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'sPlus', name: 'S+' }, { id: 's', name: 'S' } ],
        lev3: {},
        lev4: {}
    },
    item: {
        lev2: [ 
            {id:'god', name:'빨강(God)'},
            {id:'legendary', name:'주황(Legendary)'},
            {id:'epic', name:'보라(Epic)'} 
        ],
        lev3: { 
            god: [ {id:'nokseungeom_god', name:'녹슨검'} ],
            legendary: [ {id:'kingsrock_legendary', name:'왕의징표석'} ], 
            epic: [ 
                { id: 'meogdanamaneumsig_epic', name: '먹다남은 음식' },
                { id: 'wanguiiingpyoseog_epic', name: '왕의 징표석' },
                { id: 'geumsogkoteu_epic', name: '금속 코트' },
                { id: 'peeolimeoli_epic', name: '페어리 메모리' },
                { id: 'goe_epic', name: '괴상한 향로' },
                { id: 'seupeullinggeulreobeu_epic', name: '스프링 글러브' }
            ], 
        },
        lev4: { 
            'nokseungeom_god': { name:'녹슨검', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxtDeD%2FbtsOKJ36Be7%2FUrXuXYDmF5ADlMKoNkTlpK%2Fimg.png', baseStats: { 'HP': 3872, '스피드': 77, '공격': 774, '방어': 310, '특수공격': 774, '특수방어': 310 }, description: '기본 보너스:\\n피해 보너스 +5%, 최종 피해 +5%, 스피드 +10%\\n\\n창세법칙:\\n팀에 자연 타입이 2명 이상 있을 경우,\\n전투 시작 3라운드동안 아군 전체의\\n - 물리/특수 공격 +8%\\n - 스피드 +4%\\n    (※ 같은 타입 포켓몬은 50% 추가 부스트 효과)\\n\\n검개천문:\\n전투 시작 전 2라운드 동안,\\n거대한 검이 떨어져 [참격] 효과 발동\\n - 대상 HP의 15% 직접 참격 (최대 자신의 물리,특수 공격의 250%)\\n - 대상 HP가 50% 이상이면 참격 계수 +25%\\n\\n쌍검합벽:\\n아군 2명이 동시에 녹슨검을 장착한 경우\\n → 같은 라운드에 한 번 서로 전투 초대 가능\\n → 초대된 아군은 30% 데미지의 [참격] 효과 적용\\n → 전투마다 최대 1회만 발동' },
            'kingsrock_legendary': { name:'왕의징표석', imageURL: '이미지URL_준비중', description: '공격 기술에 10% 확률로 풀죽음 효과를 부여한다.' },
            'meogdanamaneumsig_epic': { name: '먹다남은 음식', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fp0Dxw%2FbtsONdCjFb0%2FU5iqpKR2YKARUfbKKhVEck%2Fimg.png', baseStats: { 'HP': 2330, '스피드': 38, '공격': 423, '방어': 169, '특수공격': 423, '특수방어': 169 }, description: '휴대 시 HP 12% 증가.\n전투 중 라우드가 종료될 때마다 자신은 최대 HP의 5.7%를 회복한다.' },
            'wanguiiingpyoseog_epic': { name: '왕의 징표석', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FXzEYy%2FbtsONCWcC36%2FsHqltK1SjoNYy0K0pVhm3k%2Fimg.png', baseStats: { 'HP': 2118, '스피드': 42, '공격': 423, '방어': 169, '특수공격': 423, '특수방어': 169 }, description: '휴대 시 스피드 12% 증가.\n전투 중 공격 후 추가로 18%의 확률로 적 포켓몬 한 마리를 침묵시킨다 (협동 공격 시에도 일정 확률로 침묵 효과가 발동된다)' },
            'geumsogkoteu_epic': { name: '금속 코트', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FFWwAa%2FbtsOMa0CeXA%2F0hr7ZPneYK9nMQbfmqnsQk%2Fimg.png', baseStats: { 'HP': 2118, '스피드': 38, '공격': 466, '방어': 169, '특수공격': 423, '특수방어': 169 }, description: '휴대 시 공격 피해 보너스 12% 증가, 방어 무시 8% 증가' },
            'peeolimeoli_epic': { name: '페어리 메모리', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FTJQ14%2FbtsOLqCT4FS%2FkohaVnWXv6P1z9SGWJ9HXk%2Fimg.png', baseStats: { 'HP': 2118, '스피드': 38, '공격': 423, '방어': 169, '특수공격': 466, '특수방어': 169 }, description: '휴대 시 특수공격 피해 보너스 12% 증가, 특수방어 무시 8% 증가' },
            'goe_epic': { name: '괴상한 향로', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FkJqfV%2FbtsOLdDZVxE%2F1tVioauJtVMjuzlK1C2wJ1%2Fimg.png', baseStats: { 'HP': 2330, '스피드': 38, '공격': 423, '방어': 169, '특수공격': 466, '특수방어': 169 }, description: '휴대 시 저항 12% 증가, 저항 강도 8% 증가' },
            'seupeullinggeulreobeu_epic': { name: '스프링 글러브', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FZT68i%2FbtsOLmHkQEU%2FU4DsFQ9NQ2kYbfhKEnxcJ1%2Fimg.png', baseStats: { 'HP': 2118, '스피드': 42, '공격': 423, '방어': 169, '특수공격': 423, '특수방어': 169 }, description: '소지 후 공격을 8%, 특수 공격을 8% 증가한다.\n전투 중 휴대자의 치명타율 8% 증가하고, 치명타 피해 10% 증가한다. 액티브 공격이 치명타 피해 10% 증가한다. 액티브 공격이 치명타 아닐 경우 치명타를 및 치명타 피해 영구적으로 5% 증가한다. (최대 3층 중첩 가능, 해당 부분 수치는 치명타 후 제거)' }
        }
    },
    // ... (이하 runeAndChip, deck, calendar, tips 객체는 이전과 동일)
};