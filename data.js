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
        { id: 'same3x2', name: '같은 타입 3마리씩 2개 조합', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbGFi7r%2FbtsO6dhIcxX%2FAAAAAAAAAAAAAAAAAAAAAAGdpk3aerqwUW4_PNGOyGi7YALOJYP6tE-aG8vZaCfY%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3Dwpa0JA33zF0koFqJn2%252BnQxhySNY%253D', description: '같은 타입 3마리씩 총 2개 조합의 포켓몬 출전<br>HP +20%, 공격 +15%, 특수공격 +15%' },
        { id: 'same2x4', name: '같은 타입 2마리씩 4개 조합', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2Fexp5n0%2FbtsO6x7ZCG9%2FAAAAAAAAAAAAAAAAAAAAAHuiTdkWsXHMDV_SsU6-t7lkX0n8k4HM7NV2blesvIj6%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3D6w%252B9Jhe0lDMUY%252BHoYez3a5YE1MI%253D', description: '같은 타입 2마리씩 총 4개 조합의 포켓몬 출전<br>HP +20%, 공격 +15%, 특수공격 +15%' },
        { id: 'same6', name: '같은 타입 6마리', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbVYYMX%2FbtsO6rtgElR%2FAAAAAAAAAAAAAAAAAAAAAIF-pqVgUZhB8j4FmnTOTYCtJe8akJAVI7eSgEiUJXvn%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1753973999%26allow_ip%3D%26allow_referer%3D%26signature%3DNp1rf%252FAhnAV%252BOxdMgIe04PogCrI%253D', description: '같은 타입의 포켓몬 6마리 출전<br>HP +25%, 공격 +20%, 특수공격 +20%' },
    ],
    sidebarMenu: [
        { id: 'pokemonType', name: '포켓몬 타입', levels: 4 },
        { id: 'pokemonGrade', name: '포켓몬 등급', levels: 4 },
        { id: 'item', name: '아이템', levels: 4 },
        { id: 'runeAndChip', name: '룬&칩', levels: 4 },
        { id: 'deck', name: '덱 구성', levels: 4 },
        { id: 'calendar', name: '캘린더', levels: 2 },
        { id: 'tips', name: '팁&노하우', levels: 3 },
    ],
    pokemonType: {
        lev2: [ 
            { id: 'normal', name: '노말', color: '#A8A878' }, { id: 'fire', name: '불', color: '#F08030' }, { id: 'water', name: '물', color: '#6890F0' }, { id: 'grass', name: '풀', color: '#78C850' }, { id: 'electric', name: '전기', color: '#F8D030' }, { id: 'ice', name: '얼음', color: '#98D8D8' }, { id: 'fighting', name: '격투', color: '#C03028' }, { id: 'poison', name: '독', color: '#A040A0' }, { id: 'ground', name: '땅', color: '#E0C068' }, { id: 'flying', name: '비행', color: '#A890F0' }, { id: 'psychic', name: '에스퍼', color: '#F85888' }, { id: 'bug', name: '벌레', color: '#A8B820' }, { id: 'rock', name: '바위', color: '#B8A038' }, { id: 'ghost', name: '유령', color: '#705898' }, { id: 'dragon', name: '드래곤', color: '#7038F8' }, { id: 'dark', name: '악', color: '#705848' }, { id: 'steel', name: '강철', color: '#B8B8D0' }, { id: 'fairy', name: '페어리', color: '#EE99AC' },
        ],
        lev3: {},
        lev4: {
            "megamewtwox": {
                "name_ko": "메가뮤츠X", "name_en": "Mega Mewtwo X", "grade": "SS", "types": ["psychic", "fighting"], "imageURL": "https://images.gameinfo.io/pokemon-trimmed/150-mega-x.png", "faceImageURL": "https://images.gameinfo.io/pokemon-icons/150-mega-x.png", "stats": { "HP": 106, "Speed": 130, "P.ATK": 190, "P.DEF": 100, "SP.ATK": 154, "SP.DEF": 100 },
                "skills": [], "recommendedNatures": ["jolly", "adamant"], "recommendedItems": ["immortalsword_god", "immortalsword_leg", "mysteriousnecklace", "scarletthornblade", "metalcoat", "springglove"], "recommendedRunes": ["deadly", "warlike", "punch"], "recommendedChips": ["lonewolf", "frogthorn"]
            },
            "megamewtwoy": {
                "name_ko": "메가뮤츠Y", "name_en": "Mega Mewtwo Y", "grade": "SS", "types": ["psychic"], "imageURL": "https://images.gameinfo.io/pokemon-trimmed/150-mega-y.png", "faceImageURL": "https://images.gameinfo.io/pokemon-icons/150-mega-y.png", "stats": { "HP": 106, "Speed": 140, "P.ATK": 150, "P.DEF": 70, "SP.ATK": 194, "SP.DEF": 120 },
                "skills": [], "recommendedNatures": [], "recommendedItems": [], "recommendedRunes": [], "recommendedChips": []
            }
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'ss', name: 'SS' }, { id: 'sPlus', name: 'S+' }, { id: 's', name: 'S' } ],
        lev3: {}
    },
    item: {
        lev2: [ 
            {id:'god', name:'빨강(God)'},
            {id:'legendary', name:'주황(Legendary)'},
            {id:'epic', name:'보라(Epic)'}
        ],
        lev3: { 
            god: [ {id:'immortalsword_god', name:'녹슨검/Immortal Sword'} ],
            legendary: [
                {id:'immortalsword_leg', name:'녹슨검/Immortal Sword'}, {id:'fieryclaws', name:'불꽃 발톱/Fiery Claws'}, {id:'immortalshield', name:'녹슨 방패/Immortal Shield'}, {id:'hugepowerbracer', name:'고에너지 밴드/Huge Power Bracer'}, {id:'powerring', name:'파워링/Power Ring'}, {id:'pokeflute', name:'포켓몬 피리/Poke Flute'}, {id:'resonanceelement', name:'공명 원소/Resonance Element'}, {id:'dynamaxband', name:'다이맥스 밴드/Dynamax Band'}, {id:'shliphscope', name:'실프 스코프/Shliph Scope'}, {id:'professorsmask', name:'박사 가면/Professor\'s Mask'}, {id:'gembracelet', name:'보석 팔찌/Gem Bracelet'}, {id:'megaglasses', name:'슈퍼 안경/Mega Glasses'}, {id:'megastickpin', name:'슈퍼 브로치/Mega Stickpin'}, {id:'safetygoggles', name:'방진 보안경/Safety Goggles'}, {id:'megawatch', name:'초능 시계/Mega Watch'}, {id:'dowsingmachine', name:'탐보기/Dowsing Machine'}, {id:'reveralglass', name:'현형경/Reveral Glass'}, {id:'mysteriousnecklace', name:'신비한 목걸이/Mysterious Necklace'}, {id:'megarollerskates', name:'초능 인라인스케이트/Mega Roller Skates'}, {id:'samuraihelmet', name:'무사 헬멧/Samurai Helmet'}, {id:'maskofpain', name:'고통의 가면/Mask of Pain'}, {id:'nsolarizer', name:'네크로플러스솔/N-Solarizer'}, {id:'dnasplicers', name:'유전자쐐기/DNA Splicers'}, {id:'spiritedawaycrown', name:'신은왕관/Spirited Away Crown'}, {id:'knightspear', name:'기사창/Knight Spear'}, {id:'flameorb', name:'화염보주/Flame Orb'}, {id:'swiftlybell', name:'맹렬한 방울/Swiftly Bell'}, {id:'sturdybell', name:'튼튼한 방울/Sturdy Bell'}, {id:'bondbell', name:'굴레 방울/Bond Bell'}, {id:'zygardecube', name:'유전자 다면체/Zygarde Cube'}, {id:'ghosthandgloves', name:'귀수권투/Ghost Hand Gloves'}, {id: 'lazydragonthorn', name:'어룡 가시/Lazy Dragon Thorn'}, {id:'sunflute', name:'태양의 피리/Sun Flute'}, {id:'soulheart', name:'기교 혼심/Soul-Heart'}, {id:'steamcannon', name:'증기 대포/Steam Cannon'}, {id:'lunarflute', name:'달의 피리/Lunar Flute'}, {id:'choascubeball', name:'혼돈 큐브/Choas cube Ball'}, {id:'rockyshield', name:'암석 방패/Rocky Shield'}, {id:'ultimateprism', name:'울트라 프리즘/Ultimate Prism'}, {id:'genecluster', name:'유전자 덩어리/Gene Cluster'}, {id:'crownofthorns', name:'가시덤불/Crown of Thorns'}, {id:'invincibleshield', name:'백전금방패/Invincible Golden Shield'}, {id:'scarletthornblade', name:'선홍색 가시날/Scarlet Thorn Blade'}, {id:'tricolorplumesword', name:'삼색 깃털 칼날/Tricolor Plume Sword'}, {id:'interpidsword', name:'불굴의 검/Interpid Sword'}, {id:'capeoftime', name:'시간의 망토/Cape of Time'}, {id:'heavygravityclaw', name:'초중력 강철 발톱/Heavy Gravity Steel Claw'}, {id:'blackreins', name:'검은 고삐/Black Reins'}, {id:'fiercebloodscythe', name:'폭렬 혈낫/Fierce Blood Scythe'}, {id:'surgespiritbone', name:'파동 혼골/Surge Spirit Bone'}, {id:'palereins', name:'창백한 굴레/Pale Reins'}, {id:'blazingchains', name:'염룡 화염사슬/Blazing Dragon Chains'}, {id:'flamewhiteturbine', name:'염백 터빈/Flame White Turbine'}, {id:'frostrotaryblade', name:'서리 회전날/Frost Rotary Blade'}, {id:'infinitestarshatter', name:'무극 파편성/Infinite Star Shatter'}, {id:'stellarthorntail', name:'별빛 꼬리 가시/Stellar Thorn Tail'}, {id:'basicattributes1', name:'유명 독핵/Basic Attributes'}, {id:'basicattributes2', name:'강자 엔진/Basic Attributes'}, {id:'championtrophy', name:'챔피언 트로피'}
            ],
            epic: [
                {id:'leftoverapple', name:'먹다남은 음식/Leftover Apple'}, {id:'kingsrock', name:'왕의 징표석/King\'s Rock'}, {id:'metalcoat', name:'금속 코트/Metal Coat'}, {id:'springglove', name:'스프링 글러브/Spring Glove'}, {id:'fairystorage', name:'페어리 메모리/Fairy Storage Device'}, {id:'oddincense', name:'괴상한 향로/Odd Incense'}
            ]
        },
        lev4: {
            'immortalswordgod': { name: '녹슨검 (God)', grade: 'God', imageURL: 'https://github.com/elmajor710/poke-asserts/blob/main/immortalswordgod.png?raw=true', description: '자시안에게 지니게 하면 전투 중에 검왕의 모습으로 변신한다.'},
            'immortalsword_leg': { name: '녹슨검 (Legendary)', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/immortalsword_leg.png', description: '자시안에게 지니게 하면 전투 중에 검왕의 모습으로 변신한다.'},
            'leftoverapple': { name: '먹다남은 음식/Leftover Apple', grade: 'Epic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/leftoverapple.png', description: '매 턴 종료 시, HP가 5% 회복됩니다.'},
            'kingsrock': { name: '왕의 징표석/King\'s Rock', grade: 'Epic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/kingsrock.png', description: '공격 시 10% 확률로 상대를 풀죽게 한다.'},
            'metalcoat': { name: '금속 코트/Metal Coat', grade: 'Epic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/metalcoat.png', description: '강철 타입 기술의 위력이 1.2배 상승한다.'},
            'fieryclaws': { name: '불꽃 발톱/Fiery Claws', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fieryclaws.png', description: '상세 설명이 필요합니다.'},
            'immortalshield': { name: '녹슨 방패/Immortal Shield', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/immortalshield.png', description: '상세 설명이 필요합니다.'},
            'hugepowerbracer': { name: '고에너지 밴드/Huge Power Bracer', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/hugepowerbracer.png', description: '상세 설명이 필요합니다.'},
            'powerring': { name: '파워링/Power Ring', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/powerring.png', description: '상세 설명이 필요합니다.'},
            'pokeflute': { name: '포켓몬 피리/Poke Flute', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/pokeflute.png', description: '상세 설명이 필요합니다.'},
            'resonanceelement': { name: '공명 원소/Resonance Element', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/resonanceelement.png', description: '상세 설명이 필요합니다.'},
            'dynamaxband': { name: '다이맥스 밴드/Dynamax Band', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/dynamaxband.png', description: '상세 설명이 필요합니다.'},
            'shliphscope': { name: '실프 스코프/Shliph Scope', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/shliphscope.png', description: '상세 설명이 필요합니다.'},
            'professorsmask': { name: '박사 가면/Professor\'s Mask', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/professorsmask.png', description: '상세 설명이 필요합니다.'},
            'gembracelet': { name: '보석 팔찌/Gem Bracelet', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/gembracelet.png', description: '상세 설명이 필요합니다.'},
            'megaglasses': { name: '슈퍼 안경/Mega Glasses', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/megaglasses.png', description: '상세 설명이 필요합니다.'},
            'megastickpin': { name: '슈퍼 브로치/Mega Stickpin', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/megastickpin.png', description: '상세 설명이 필요합니다.'},
            'safetygoggles': { name: '방진 보안경/Safety Goggles', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/safetygoggles.png', description: '상세 설명이 필요합니다.'},
            'megawatch': { name: '초능 시계/Mega Watch', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/megawatch.png', description: '상세 설명이 필요합니다.'},
            'dowsingmachine': { name: '탐보기/Dowsing Machine', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/dowsingmachine.png', description: '상세 설명이 필요합니다.'},
            'reveralglass': { name: '현형경/Reveral Glass', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/reveralglass.png', description: '상세 설명이 필요합니다.'},
            'mysteriousnecklace': { name: '신비한 목걸이/Mysterious Necklace', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/mysteriousnecklace.png', description: '상세 설명이 필요합니다.'},
            'megarollerskates': { name: '초능 인라인스케이트/Mega Roller Skates', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/megarollerskates.png', description: '상세 설명이 필요합니다.'},
            'samuraihelmet': { name: '무사 헬멧/Samurai Helmet', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/samuraihelmet.png', description: '상세 설명이 필요합니다.'},
            'maskofpain': { name: '고통의 가면/Mask of Pain', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/maskofpain.png', description: '상세 설명이 필요합니다.'},
            'nsolarizer': { name: '네크로플러스솔/N-Solarizer', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/nsolarizer.png', description: '상세 설명이 필요합니다.'},
            'dnasplicers': { name: '유전자쐐기/DNA Splicers', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/dnasplicers.png', description: '상세 설명이 필요합니다.'},
            'spiritedawaycrown': { name: '신은왕관/Spirited Away Crown', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/spiritedawaycrown.png', description: '상세 설명이 필요합니다.'},
            'knightspear': { name: '기사창/Knight Spear', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/knightspear.png', description: '상세 설명이 필요합니다.'},
            'flameorb': { name: '화염보주/Flame Orb', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/flameorb.png', description: '상세 설명이 필요합니다.'},
            'swiftlybell': { name: '맹렬한 방울/Swiftly Bell', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/swiftlybell.png', description: '상세 설명이 필요합니다.'},
            'sturdybell': { name: '튼튼한 방울/Sturdy Bell', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/sturdybell.png', description: '상세 설명이 필요합니다.'},
            'bondbell': { name: '굴레 방울/Bond Bell', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/bondbell.png', description: '상세 설명이 필요합니다.'},
            'zygardecube': { name: '유전자 다면체/Zygarde Cube', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/zygardecube.png', description: '상세 설명이 필요합니다.'},
            'ghosthandgloves': { name: '귀수권투/Ghost Hand Gloves', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/ghosthandgloves.png', description: '상세 설명이 필요합니다.'},
            'lazydragonthorn': { name: '어룡 가시/Lazy Dragon Thorn', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/lazydragonthorn.png', description: '상세 설명이 필요합니다.'},
            'sunflute': { name: '태양의 피리/Sun Flute', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/sunflute.png', description: '상세 설명이 필요합니다.'},
            'soulheart': { name: '기교 혼심/Soul-Heart', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/soulheart.png', description: '상세 설명이 필요합니다.'},
            'steamcannon': { name: '증기 대포/Steam Cannon', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/steamcannon.png', description: '상세 설명이 필요합니다.'},
            'lunarflute': { name: '달의 피리/Lunar Flute', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/lunarflute.png', description: '상세 설명이 필요합니다.'},
            'choascubeball': { name: '혼돈 큐브/Choas cube Ball', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/choascubeball.png', description: '상세 설명이 필요합니다.'},
            'rockyshield': { name: '암석 방패/Rocky Shield', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/rockyshield.png', description: '상세 설명이 필요합니다.'},
            'ultimateprism': { name: '울트라 프리즘/Ultimate Prism', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/ultimateprism.png', description: '상세 설명이 필요합니다.'},
            'genecluster': { name: '유전자 덩어리/Gene Cluster', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/genecluster.png', description: '상세 설명이 필요합니다.'},
            'crownofthorns': { name: '가시덤불/Crown of Thorns', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/crownofthorns.png', description: '상세 설명이 필요합니다.'},
            'invincibleshield': { name: '백전금방패/Invincible Golden Shield', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/invincibleshield.png', description: '상세 설명이 필요합니다.'},
            'scarletthornblade': { name: '선홍색 가시날/Scarlet Thorn Blade', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/scarletthornblade.png', description: '상세 설명이 필요합니다.'},
            'tricolorplumesword': { name: '삼색 깃털 칼날/Tricolor Plume Sword', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/tricolorplumesword.png', description: '상세 설명이 필요합니다.'},
            'interpidsword': { name: '불굴의 검/Interpid Sword', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/interpidsword.png', description: '상세 설명이 필요합니다.'},
            'capeoftime': { name: '시간의 망토/Cape of Time', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/capeoftime.png', description: '상세 설명이 필요합니다.'},
            'heavygravityclaw': { name: '초중력 강철 발톱/Heavy Gravity Steel Claw', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/heavygravityclaw.png', description: '상세 설명이 필요합니다.'},
            'blackreins': { name: '검은 고삐/Black Reins', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/blackreins.png', description: '상세 설명이 필요합니다.'},
            'fiercebloodscythe': { name: '폭렬 혈낫/Fierce Blood Scythe', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fiercebloodscythe.png', description: '상세 설명이 필요합니다.'},
            'surgespiritbone': { name: '파동 혼골/Surge Spirit Bone', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/surgespiritbone.png', description: '상세 설명이 필요합니다.'},
            'palereins': { name: '창백한 굴레/Pale Reins', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/palereins.png', description: '상세 설명이 필요합니다.'},
            'blazingchains': { name: '염룡 화염사슬/Blazing Dragon Chains', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/blazingchains.png', description: '상세 설명이 필요합니다.'},
            'flamewhiteturbine': { name: '염백 터빈/Flame White Turbine', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/flamewhiteturbine.png', description: '상세 설명이 필요합니다.'},
            'frostrotaryblade': { name: '서리 회전날/Frost Rotary Blade', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/frostrotaryblade.png', description: '상세 설명이 필요합니다.'},
            'infinitestarshatter': { name: '무극 파편성/Infinite Star Shatter', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/infinitestarshatter.png', description: '상세 설명이 필요합니다.'},
            'stellarthorntail': { name: '별빛 꼬리 가시/Stellar Thorn Tail', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/stellarthorntail.png', description: '상세 설명이 필요합니다.'},
            'basicattributes1': { name: '유명 독핵/Basic Attributes', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/basicattributes1.png', description: '상세 설명이 필요합니다.'},
            'basicattributes2': { name: '강자 엔진/Basic Attributes', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/basicattributes2.png', description: '상세 설명이 필요합니다.'},
            'championtrophy': { name: '챔피언 트로피', grade: 'Legendary', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/championtrophy.png', description: '상세 설명이 필요합니다.'},
            'springglove': { name: '스프링 글러브/Spring Glove', grade: 'Epic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/springglove.png', description: '상세 설명이 필요합니다.'},
            'fairystorage': { name: '페어리 메모리/Fairy Storage Device', grade: 'Epic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/fairystorage.png', description: '상세 설명이 필요합니다.'},
            'oddincense': { name: '괴상한 향로/Odd Incense', grade: 'Epic', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/oddincense.png', description: '상세 설명이 필요합니다.'}
        }
    },
    runeAndChip: {
        lev2: [ 
            {id: 'rune', name: '룬'}, 
            {id: 'chip', name: '칩'} 
        ],
        lev3: { 
            rune: [ 
                { id: 'deadly', name: '치명 / Deadly' }, { id: 'warlike', name: '전투광 / Warlike' }, { id: 'shield', name: '실드 / Shield' }, { id: 'kingkong', name: '금강 / King Kong' }, { id: 'shelter', name: '비호 / Shelter' }, { id: 'defend', name: '방어 / Defend' }, { id: 'shine', name: '반짝임 / Shine' }, { id: 'counter', name: '반격 / Counter' }, { id: 'punch', name: '강격 / Punch' }
            ], 
            chip: [ 
                { id: 'firedance', name: '화무 / Fire Dance' }, { id: 'sacrifice', name: '헌제 / Sacrifice' }, { id: 'psychic', name: '초능 / Psychic' }, { id: 'snakesoul', name: '뱀유령 / Snake Soul' }, { id: 'fistshield', name: '방패 / Fist Shield' }, { id: 'lonewolf', name: '늑대행자 / Lone Wolf' }, { id: 'tortoiseshell', name: '귀갑 / Tortoise Shell' }, { id: 'fear', name: '공포 / Fear' }, { id: 'frogthorn', name: '개구리가시 / Frog Thorn' }
            ] 
        },
        lev4: { 
            'deadly': { name: '치명 / Deadly', imageURL: '', description: '치명타 확률과 치명타 피해량을 증가시킵니다.' },
            'warlike': { name: '전투광 / Warlike', imageURL: '', description: '공격 시 추가 피해를 입힙니다.'},
            'shield': { name: '실드 / Shield', imageURL: '', description: '상세 설명이 필요합니다.'},
            'kingkong': { name: '금강 / King Kong', imageURL: '', description: '상세 설명이 필요합니다.'},
            'shelter': { name: '비호 / Shelter', imageURL: '', description: '상세 설명이 필요합니다.'},
            'defend': { name: '방어 / Defend', imageURL: '', description: '상세 설명이 필요합니다.'},
            'shine': { name: '반짝임 / Shine', imageURL: '', description: '상세 설명이 필요합니다.'},
            'counter': { name: '반격 / Counter', imageURL: '', description: '상세 설명이 필요합니다.'},
            'punch': { name: '강격 / Punch', imageURL: '', description: '상세 설명이 필요합니다.'},
            'firedance': { name: '화무 / Fire Dance', imageURL: '', description: '불꽃 타입 스킬의 위력을 증폭시킵니다.' },
            'lonewolf': { name: '늑대행자 / Lone Wolf', imageURL: 'https://raw.githubusercontent.com/elmajor710/poke-asserts/main/lonewolf.png', description: '주변에 아군이 없을 때 공격력이 대폭 상승합니다.'},
            'sacrifice': { name: '헌제 / Sacrifice', imageURL: '', description: '상세 설명이 필요합니다.'},
            'psychic': { name: '초능 / Psychic', imageURL: '', description: '상세 설명이 필요합니다.'},
            'snakesoul': { name: '뱀유령 / Snake Soul', imageURL: '', description: '상세 설명이 필요합니다.'},
            'fistshield': { name: '방패 / Fist Shield', imageURL: '', description: '상세 설명이 필요합니다.'},
            'tortoiseshell': { name: '귀갑 / Tortoise Shell', imageURL: '', description: '상세 설명이 필요합니다.'},
            'fear': { name: '공포 / Fear', imageURL: '', description: '상세 설명이 필요합니다.'},
            'frogthorn': { name: '개구리가시 / Frog Thorn', imageURL: '', description: '상세 설명이 필요합니다.'}
        }
    },
    deck: {
        lev2: [ { id: 'recommended', name: '추천덱' }, { id: 'builder', name: '배치툴' } ],
        lev3: { 
            recommended: [ { id: 'water_fairy_deck', name: '물&페어리' }, {id: 'fire_dragon_deck', name: '불&드래곤'} ],
            builder: [{ id: 'deckBuilder', name: '배치툴'}]
        },
        lev4: {
            water_fairy_deck: { name: '물&페어리 추천덱', description: '이 덱은 물과 페어리 타입의 시너지를 극대화하여 안정적인 운영을 자랑합니다.', composition: [ { role: 'main', position: 1, pokemonId: 'megamewtwoy' }, { role: 'assist', position: 1, pokemonId: 'megamewtwox' } ] },
            fire_dragon_deck: { name: '불&드래곤 추천덱', description: '이 덱은 불과 드래곤 타입 포켓몬의 시너지를 극대화하여 강력한 공격력을 자랑합니다.', composition: [ { role: 'main', position: 1, pokemonId: 'megamewtwox' } ] }
        }
    },
    calendar: {
        lev2: {
            name: '이벤트 캘린더',
            events: [
                { id: 'ranking_20250718', date: '2025-07-18', type: 'ranking', duration: 3, title: '웅의 메가 강철톤', description: '랭킹뽑기: 웅의 메가 강철톤(강철/땅) [어시스트: 무쇠 바퀴]' },
            ],
            recurringEvents: [
                { id: 'luckycat', name: '복냥이', title: '다이아 뽑기', type: 'luckycat', duration: 3, startDate: '2025-06-27', interval: '4_weeks', description: 'VIP 등급에 따라 다이아를 획득할 수 있는 복냥이 이벤트 기간입니다.' }
            ]
        }
    },
    tips: {
        lev2: [
            { id: 'how_to_get_gold', name: '골드 수급처 총정리' },
            { id: 'pvp_guide_beginner', name: '초보자를 위한 PVP 가이드' }
        ],
        lev3: {
            'how_to_get_gold': { name: '골드 수급처 총정리', htmlContent: `<h3>주요 재화 수급처 목록</h3><p>게임 내에서 얻을 수 있는 주요 재화와 그 수급처 목록입니다.</p><table class="content-table"><thead><tr><th>재화 종류</th><th>주요 수급처</th><th>비고</th></tr></thead><tbody><tr><td>골드</td><td>일일 퀘스트, 이벤트</td><td>가장 기본적인 재화입니다.</td></tr><tr><td>다이아</td><td>과금, 아레나 보상</td><td>모든 것을 할 수 있는 만능 재화입니다.</td></tr></tbody></table><p>위 표를 참고하여 효율적으로 재화를 모아보세요.</p>` },
            'pvp_guide_beginner': { name: '초보자를 위한 PVP 가이드', htmlContent: `<h3>PVP 기본 가이드</h3><p>PVP(유저 간 대결)는 이 게임의 핵심 콘텐츠 중 하나입니다. 다음 팁을 참고하여 승률을 높여보세요.</p><ol><li>상대의 덱 구성을 파악하세요.</li><li>타입 상성을 적극적으로 활용하세요.</li><li>선봉 포켓몬의 역할이 매우 중요합니다.</li></ol>` }
        }
    }
};