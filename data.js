const DB = {
    definitions: {
        natures: [
            { id: 'quirky', name: '방정맞음(Quirky)' }, { id: 'hardy', name: '근면함(Hardy)' },
            { id: 'bashful', name: '수줍어함(Bashful)' }, { id: 'docile', name: '솔직함(Docile)' },
            { id: 'serious', name: '전지함(Serious)' }, { id: 'timid', name: '겁이많음(Timid)' },
            { id: 'hasty', name: '조급함(Hasty)' }, { id: 'jolly', name: '유쾌함(Jolly)' },
            { id: 'naive', name: '천진난만함(Naive)' }, { id: 'lonely', name: '외로워함(Lonely)' },
            { id: 'brave', name: '용감함(Brave)' }, { id: 'adamant', name: '고집이강함(Adamant)' },
            { id: 'naughty', name: '장난이심함(Naughty)' }, { id: 'bold', name: '대담함(Bold)' },
            { id: 'relaxed', name: '여유로움(Relaxed)' }, { id: 'impish', name: '말썽쟁이(Impish)' },
            { id: 'lax', name: '낙천적(Lax)' }, { id: 'modest', name: '내성적(Modest)' },
            { id: 'mild', name: '느림(Mild)' }, { id: 'quiet', name: '냉정함(Quiet)' },
            { id: 'rash', name: '건성건성함(Rash)' }, { id: 'calm', name: '온화함(Calm)' },
            { id: 'gentle', name: '온순함(Gentle)' }, { id: 'sassy', name: '자만함(Sassy)' },
            { id: 'careful', name: '신중함(Careful)' }
        ]
    },
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
            {id:'epic', name:'보라(Epic)'},
            {id:'legendary', name:'주황(Legendary)'},
            {id:'god', name:'빨강(God)'}
        ],
        lev3: { 
            epic: [
                { id: 'leftoverapple_epic', name: '먹다남은 음식' }, { id: 'kingsrock_epic', name: '왕의 징표석' },
                { id: 'metalcoat_epic', name: '금속 코트' }, { id: 'springglove_epic', name: '스프링 글러브' },
                { id: 'fairystoragedevice_epic', name: '페어리 메모리' }, { id: 'oddincense_epic', name: '괴상한 향로' }
            ],
            legendary: [
                { id: 'immortalsword_legendary', name: '녹슨검' }, { id: 'fieryclaws_legendary', name: '불꽃 발톱' },
                { id: 'immortalshield_legendary', name: '녹슨 방패' }, { id: 'hugepowerbracer_legendary', name: '고에너지 밴드' },
                { id: 'powerring_legendary', name: '파워링' }, { id: 'pokeflute_legendary', name: '포켓몬 피리' },
                { id: 'resonanceelement_legendary', name: '공명 원소' }, { id: 'dynamaxband_legendary', name: '다이맥스 밴드' },
                { id: 'shliphscope_legendary', name: '실프 스코프' }, { id: 'professorsmask_legendary', name: '박사 가면' },
                { id: 'gembracelet_legendary', name: '보석 팔찌' }, { id: 'megaglasses_legendary', name: '슈퍼 안경' },
                { id: 'megastickpin_legendary', name: '슈퍼 브로치' }, { id: 'safetygoggles_legendary', name: '방진 보안경' },
                { id: 'megawatch_legendary', name: '초능 시계' }, { id: 'dowsingmachine_legendary', name: '탐보기' },
                { id: 'reveralglass_legendary', name: '현형경' }, { id: 'mysteriousnecklace_legendary', name: '신비한 목걸이' },
                { id: 'megarollerskates_legendary', name: '초능 인라인스케이트' }, { id: 'samuraihelmet_legendary', name: '무사 헬멧' },
                { id: 'maskofpain_legendary', name: '고통의 가면' }, { id: 'nsolarizer_legendary', name: '네크로플러스솔' },
                { id: 'dnasplicers_legendary', name: '유전자쐐기' }, { id: 'spiritedawaycrown_legendary', name: '신은왕관' },
                { id: 'knightspear_legendary', name: '기사창' }, { id: 'flameorb_legendary', name: '화염보주' },
                { id: 'swiftlybell_legendary', name: '맹렬한 방울' }, { id: 'sturdybell_legendary', name: '튼튼한 방울' },
                { id: 'bondbell_legendary', name: '굴레 방울' }, { id: 'zygardecube_legendary', name: '유전자 다면체' },
                { id: 'ghosthandgloves_legendary', name: '귀수권투' }, { id: 'lazydragonthorn_legendary', name: '어룡 가시' },
                { id: 'sunflute_legendary', name: '태양의 피리' }, { id: 'soulheart_legendary', name: '기교 혼심' },
                { id: 'steamcannon_legendary', name: '증기 대포' }, { id: 'lunarflute_legendary', name: '달의 피리' },
                { id: 'chaoscubeball_legendary', name: '혼돈 큐브' }, { id: 'rockyshield_legendary', name: '암석 방패' },
                { id: 'ultimateprism_legendary', name: '울트라 프리즘' }, { id: 'genecluster_legendary', name: '유전자 덩어리' },
                { id: 'crownofthorns_legendary', name: '가시덤불' }, { id: 'invinciblegoldenshield_legendary', name: '백전금방패' },
                { id: 'scarletthornblade_legendary', name: '선홍색 가시날' }, { id: 'tricolorplumesword_legendary', name: '삼색 깃털 칼날' },
                { id: 'interpidsword_legendary', name: '불굴의 검' }, { id: 'capeoftime_legendary', name: '시간의 망토' },
                { id: 'heavygravitysteelclaw_legendary', name: '초중력 강철 발톱' }, { id: 'blackreins_legendary', name: '검은 고삐' },
                { id: 'fiercebloodscythe_legendary', name: '폭렬 혈낫' }, { id: 'surgespiritbone_legendary', name: '파동 혼골' },
                { id: 'palereins_legendary', name: '창백한 굴레' }, { id: 'blazingdragonchains_legendary', name: '염룡 화염사슬' },
                { id: 'flamewhiteturbine_legendary', name: '염백 터빈' }, { id: 'frostrotaryblade_legendary', name: '서리 회전날' },
                { id: 'infinitestarshatter_legendary', name: '무극 파편성' }, { id: 'stellarthornntail_legendary', name: '별빛 꼬리 가시' },
                { id: 'basicattributes_legendary', name: '유명 독핵' }, { id: 'basicattributes2_legendary', name: '강자 엔진' },
                { id: 'championtrophy_legendary', name: '챔피언 트로피' }
            ],
            god: [ { id: 'immortalsword_god', name: '녹슨검' } ]
        },
        lev4: { 
            'leftoverapple_epic': { name: '먹다남은 음식', description: '상세 설명 준비 중입니다.' },
            'immortalsword_legendary': { name: '녹슨검 (Legendary)', description: '상세 설명 준비 중입니다.' },
            'immortalsword_god': { name: '녹슨검 (God)', description: '상세 설명 준비 중입니다.' }
        }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { 
            rune: [ 
                { id: 'deadly', name: '치명' }, { id: 'warlike', name: '전투광' }, { id: 'shield', name: '실드' },
                { id: 'kingkong', name: '금강' }, { id: 'shelter', name: '비호' }, { id: 'defend', name: '방어' },
                { id: 'shine', name: '반짝임' }, { id: 'counter', name: '반격' }, { id: 'punch', name: '강격' }
            ], 
            chip: [ 
                { id: 'firedance', name: '화무' }, { id: 'sacrifice', name: '헌제' }, { id: 'psychic', name: '초능' },
                { id: 'snakesoul', name: '뱀유령' }, { id: 'fistshield', name: '방패' }, { id: 'lonewolf', name: '늑대행자' },
                { id: 'tortoiseshell', name: '귀갑' }, { id: 'fear', name: '공포' }, { id: 'frogthorn', name: '개구리가시' }
            ] 
        },
        lev4: { 
            'deadly': { name: '치명', description: '상세 설명 준비 중입니다.' }
        }
    },
    deck: {
        lev2: [], lev3: {}
    },
    calendar: {
        lev2: [], lev3: {}
    },
    tips: {
        lev2: [], lev3: {}
    }
};