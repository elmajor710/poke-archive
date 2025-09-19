const DB = {
    definitions: {
        natures: [
            { id: 'quirky', name: '방정맞음 / Quirky' }, { id: 'hardy', name: '근면함 / Hardy' },
            { id: 'bashful', name: '수줍어함 / Bashful' }, { id: 'docile', name: '솔직함 / Docile' },
            { id: 'serious', name: '전지함 / Serious' }, { id: 'timid', name: '겁이많음/Timid' },
            { id: 'hasty', name: '조급함/Hasty' }, { id: 'jolly', name: '유쾌함/Jolly' },
            { id: 'naive', name: '천진난만함/Naive' }, { id: 'lonely', name: '외로워함/Lonely' },
            { id: 'brave', name: '용감함/Brave' }, { id: 'adamant', name: '고집이강함/Adamant' },
            { id: 'naughty', name: '장난이심함/Naughty' }, { id: 'bold', name: '대담함/Bold' },
            { id: 'relaxed', name: '여유로움/Relaxed' }, { id: 'impish', name: '말썽쟁이/Impish' },
            { id: 'lax', name: '낙천적/Lax' }, { id: 'modest', name: '내성적/Modest' },
            { id: 'mild', name: '느림/Mild' }, { id: 'quiet', name: '냉정함/Quiet' },
            { id: 'rash', name: '건성건성함/Rash' }, { id: 'calm', name: '온화함/Clam' },
            { id: 'gentle', name: '온순함/Gentle' }, { id: 'sassy', name: '자만함/Sassy' },
            { id: 'careful', name: '신중함/Careful' }
        ]
    },
    synergyEffects: [
    { id: 'diff6', name: '다른 타입 6마리', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FcZDkRR%2FbtsO5xHLHZT%2FAAAAAAAAAAAAAAAAAAAAANyGEPoWV-3wwHQZorO2tONYBdAcb5wNrwd16dgDbsgv%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3D3isdf6p8HzFDc50owt3ac3Zyv2E%253D', description: '다른 타입의 포켓몬 6마리 출전<br>HP +10%, 공격 +10%, 특수공격 +10%' },
    { id: 'same3', name: '같은 타입 3마리', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fc2Nihz%2FbtsO45kHgZN%2FAAAAAAAAAAAAAAAAAAAAAGpdO3x4bP_uaw_gF2xkHAkXcj0I_i6Tw3KGCuZ3SPl3%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3Ddd2ysCbnDY0rKeYTEMwKOOKhG1U%253D', description: '같은 타입의 포켓몬 3마리 출전<br>HP +15%, 공격 +10%, 특수공격 +10%' },
    { id: 'same2x3', name: '같은 타입 2마리씩 3개 조합', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FR7jAG%2FbtsO5lgwX07%2FAAAAAAAAAAAAAAAAAAAAAMWYiKMYwQbKFuUKde99WBzectB_TN6CC8xCi1gbyXRl%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3DM%252Br5NulxqO7pRLLtsX0gA%252BN6iUU%253D', description: '같은 타입 2마리씩 총 3개 조합의 포켓몬 출전<br>HP +15%, 공격 +15%, 특수공격 +15%' },
    { id: 'same4_2', name: '같은 타입 4마리, 2마리 조합', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fexp5n0%2FbtsO6x7ZCG9%2FAAAAAAAAAAAAAAAAAAAAAHuiTdkWsXHMDV_SsU6-t7lkX0n8k4HM7NV2blesvIj6%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3D6w%252B9Jhe0lDMUY%252BHoYez3a5YE1MI%253D', description: '같은 타입 4마리, 같은 타입 2마리 조합의 포켓몬 출전<br>HP +20%, 공격 +15%, 특수공격 +15%' },
    { id: 'same3x2', name: '같은 타입 3마리씩 2개 조합', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbGAFi7r%2FbtsO6dhIcxX%2FAAAAAAAAAAAAAAAAAAAAAAGdpk3aerqwUW4_PNGOyGi7YALOJYP6tE-aG8vZaCfY%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3Dwpa0JA33zF0koFqJn2%252BnQxhySNY%253D', description: '같은 타입 3마리씩 총 2개 조합의 포켓몬 출전<br>HP +20%, 공격 +15%, 특수공격 +15%' },
    { id: 'same6', name: '같은 타입 6마리', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbVYYMX%2FbtsO6rtgElR%2FAAAAAAAAAAAAAAAAAAAAAIF-pqVgUZhB8j4FmnTOTYCtJe8akJAVI7eSgEiUJXvn%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3DNp1rf%252FAhnAV%252BOxdMgIe04PogCrI%253D', description: '같은 타입의 포켓몬 6마리 출전<br>HP +25%, 공격 +20%, 특수공격 +20%' },
],

    sidebarMenu: [
        { id: 'notice', name: '공지사항', levels: 3 },
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
        { id: 'runeAndChip', name: '룬&칩', levels: 4 },
        { id: 'deck', name: '덱 구성', levels: 4 },
        { id: 'calendar', name: '캘린더', levels: 2 },
        { id: 'tips', name: '팁&노하우', levels: 3 },
    ],

    notice: {
        lev2: [],
        lev3: {}
    },

    pokemonType: {
        lev2: [ 
            { id: 'normal', name: '노말', color: '#A8A878', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/normal.png' }, 
            { id: 'fire', name: '불', color: '#F08030', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fire.png' },
            { id: 'water', name: '물', color: '#6890F0', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/water.png' }, 
            { id: 'grass', name: '풀', color: '#78C850', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/grass.png' },
            { id: 'electric', name: '전기', color: '#F8D030', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/electric.png' }, 
            { id: 'ice', name: '얼음', color: '#98D8D8', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/ice.png' },
            { id: 'fighting', name: '격투', color: '#C03028', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fighting.png' }, 
            { id: 'poison', name: '독', color: '#A040A0', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/poison.png' },
            { id: 'ground', name: '땅', color: '#E0C068', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/ground.png' }, 
            { id: 'flying', name: '비행', color: '#A890F0', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/flying.png' },
            { id: 'psychic', name: '에스퍼', color: '#F85888', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/psychic.png' }, 
            { id: 'bug', name: '벌레', color: '#A8B820', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/bug.png' },
            { id: 'rock', name: '바위', color: '#B8A038', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/rock.png' }, 
            { id: 'ghost', name: '유령', color: '#705898', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/ghost.png' },
            { id: 'dragon', name: '드래곤', color: '#7038F8', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/dragon.png' }, 
            { id: 'dark', name: '악', color: '#705848', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/dark.png' },
            { id: 'steel', name: '강철', color: '#B8B8D0', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/stell.png' },
            { id: 'fairy', name: '페어리', color: '#EE99AC', iconURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fairy.png' },
        ],
        lev3: { },
        lev4: { }
    },
    pokemonGrade: {
        lev2: [ { id: 'ss', name: 'SS' }, { id: 'sPlus', name: 'S+' } ],
        lev3: {}
    },
    item: {
        lev2: [ 
            {id:'god', name:'빨강(God)'},
            {id:'legendary', name:'주황(Legendary)'},
            {id:'epic', name:'보라(Epic)'}
        ],
        lev3: {},
        lev4: {}
    },
    runeAndChip: {
        lev2: [ 
            {id: 'rune', name: '룬'}, 
            {id: 'chip', name: '칩'} 
        ], 
        lev3: { },
        lev4: { 
            'deadly': { type: 'rune', name: '치명 / Deadly', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/deadly.png', description: '치명타 확률 +15%\n[세트 효과]치명타 피해량 +30%' },
            'warlike': { type: 'rune', name: '전투광 / Warlike', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/warlike.png', description: '물리공격/특수공격 +10%\n[세트 효과]공격 시 대상의 현재 HP 5%만큼 추가 피해' },
            'shield': { type: 'rune', name: '실드 / Shield', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/shield.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'king-kong': { type: 'rune', name: '금강 / King Kong', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/king-kong.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'shelter': { type: 'rune', name: '비호 / Shelter', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/shelter.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'defend': { type: 'rune', name: '방어 / Defend', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/defend.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'shine': { type: 'rune', name: '반짝임 / Shine', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/shine.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'counter': { type: 'rune', name: '반격 / Counter', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/counter.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'punch': { type: 'rune', name: '강격 / Punch', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/punch.png', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            
            'firedance': { type: 'chip', name: '화무 / Fire Dance', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/firedance.jpg', description: '불꽃 타입 기술 위력 +20%\n[세트 효과]공격 시 30% 확률로 연소 부여' },
            'sacrifice': { type: 'chip', name: '헌제 / Sacrifice', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/sacrifice.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'psychic': { type: 'chip', name: '초능 / Psychic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/psychic.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'snakesoul': { type: 'chip', name: '뱀유령 / Snake Soul', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/snakesoul.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'fistshield': { type: 'chip', name: '방패 / Fist Shield', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fistshield.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'lonewolf': { type: 'chip', name: '늑대행자 / Lone Wolf', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/lonewolf.jpg', description: '주변에 아군이 없을 때 공격력 +25%\n[세트 효과]주변에 아군이 없을 때 받는 피해량 -15%' },
            'tortoiseshell': { type: 'chip', name: '귀갑 / Tortoise Shell', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/tortoiseshell.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'fear': { type: 'chip', name: '공포 / Fear', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fear.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' },
            'frogthorn': { type: 'chip', name: '개구리가시 / Frog Thorn', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/frogthorn.jpg', description: '기본 설명입니다.\n[세트 효과]세트 효과 설명입니다.' }
        }
    },
    deck: {
        lev2: [ { id: 'recommended', name: '추천덱' } ],
        lev3: { },
        lev4: { }
    },
    calendar: {
        lev2: {
            name: '이벤트 캘린더',
            events: [],
            recurringEvents: []
        }
    },
    tips: {
        lev2: [],
        lev3: {}
    }
};