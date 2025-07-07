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
            { id: 'psychic', name: '에스퍼', color: '#F85888' },
            { id: 'fighting', name: '격투', color: '#C03028' },
            { id: 'electric', name: '전기', color: '#F8D030' },
            { id: 'fire', name: '불', color: '#F08030' },
            { id: 'rock', name: '바위', color: '#B8A038' },
            { id: 'water', name: '물', color: '#6890F0' },
            { id: 'dragon', name: '드래곤', color: '#7038F8' },
            { id: 'flying', name: '비행', color: '#A890F0' },
            { id: 'steel', name: '강철', color: '#B8B8D0' },
            { id: 'grass', name: '풀', color: '#78C850' },
            { id: 'dark', name: '악', color: '#705848' },
            { id: 'bug', name: '벌레', color: '#A8B820' },
            // 이 줄을 추가하세요.
            { id: 'ice', name: '얼음', color: '#98D8D8' },
        ],
        lev3: { 
            psychic: [ { id: 'megamewtwox', name: '메가뮤츠X' }, { id: 'alakazam', name: '후딘' }, { id: 'mew', name: '뮤' }, { id: 'jirachi', name: '지라치' } ],
            fighting: [ { id: 'megamewtwox', name: '메가뮤츠X' } ],
            electric: [ { id: 'pikachu', name: '피카츄' }],
            fire: [ { id: 'charmander', name: '파이리' }, { id: 'primalgroudon', name: '원시그란돈' } ],
            rock: [ { id: 'primalgroudon', name: '원시그란돈' } ],
            water: [ { id: 'primalkyogre', name: '원시가이오가' } ],
            dragon: [ { id: 'megarayquaza', name: '메가레쿠쟈' }, { id: 'dialga', name: '디아루가' } ],
            flying: [ { id: 'megarayquaza', name: '메가레쿠쟈' } ],
            steel: [ { id: 'jirachi', name: '지라치' }, { id: 'dialga', name: '디아루가' }, { id: 'scizor', name: '핫삼' } ],
            grass: [ { id: 'zarude', name: '자루도' } ],
            dark: [ { id: 'zarude', name: '자루도' } ],
            bug: [ { id: 'scizor', name: '핫삼' } ],
        },
        lev4: {
            megamewtwox: {
                name: { ko: '메가뮤츠X', en: 'Mega Mewtwo X' },
                grade: 'SS',
                types: ['psychic', 'fighting'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/150-mega-x.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/150-mega-x.png',
                stats: { 'HP': 106, 'Speed': 130, 'P.ATK': 190, 'P.DEF': 100, 'SP.ATK': 154, 'SP.DEF': 100 },
                totalStats: 780,
                recommendedNatures: ['jolly', 'adamant'],
                skills: [
                    { name: '진기권(Focus Punch)', type: 'Active', description: '...' },
                    { name: '수라화경(Shura Tansformation)', type: 'Ultimate', description: '...' },
                    { name: '수라권의(Shura Fist Intent)', type: 'Passive', description: '...' }
                ],
                recommendedItems: [
                    { id: 'immortalsword_god', name: '녹슨검(God)', imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxtDeD%2FbtsOKJ36Be7%2FUrXuXYDmF5ADlMKoNkTlpK%2Fimg.png' },
                ],
                recommendedRunes: [ { id: 'deadly', name: '치명 / Deadly' } ],
                recommendedChips: [ { id: 'lonewolf', name: '늑대행자 / Lone Wolf' } ]
            },
            pikachu: {
                name: { ko: '피카츄', en: 'Pikachu' },
                grade: 'S+',
                types: ['electric'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/025.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/025.png',
            },
            charmander: {
                name: { ko: '파이리', en: 'Charmander' },
                grade: 'S',
                types: ['fire'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/004.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/004.png',
            },
            primalgroudon: {
                name: { ko: '원시그란돈', en: 'Primal Groudon' },
                grade: 'SS',
                types: ['rock', 'fire'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/383-primal.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/383-primal.png',
            },
            megarayquaza: {
                name: { ko: '메가레쿠쟈', en: 'Mega Rayquaza' },
                grade: 'SS',
                types: ['dragon', 'flying'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/384-mega.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/384-mega.png',
            },
            jirachi: {
                name: { ko: '지라치', en: 'Jirachi' },
                grade: 'S+',
                types: ['steel', 'psychic'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/385.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/385.png',
            },
            zarude: {
                name: { ko: '자루도', en: 'Zarude' },
                grade: 'S+',
                types: ['grass', 'dark'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/893.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/893.png',
            },
            dialga: {
                name: { ko: '디아루가', en: 'Dialga' },
                grade: 'S+',
                types: ['dragon', 'steel'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/483.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/483.png',
            },
            scizor: {
                name: { ko: '핫삼', en: 'Scizor' },
                grade: 'S',
                types: ['steel', 'bug'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/212.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/212.png',
            },
            alakazam: {
                name: { ko: '후딘', en: 'Alakazam' },
                grade: 'S',
                types: ['psychic'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/065.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/065.png',
            },
            mew: {
                name: { ko: '뮤', en: 'Mew' },
                grade: 'S',
                types: ['psychic'],
                imageURL: 'https://images.gameinfo.io/pokemon-trimmed/151.png',
                faceImageURL: 'https://images.gameinfo.io/pokemon-icons/151.png',
            },
            shaymin: { name: { ko: '쉐이미', en: 'Shaymin' }, grade: 'S+', types: ['grass', 'flying'], imageURL: 'https://images.gameinfo.io/pokemon-trimmed/492-sky.png', faceImageURL: 'https://images.gameinfo.io/pokemon-icons/492-sky.png', weatherEffects: [{ name: '매우맑음', description: '아군 풀 타입 포켓몬의 치유 속도가 30% 증가, 행동 턴 전에 최대 체력의 10% 회복, 적 타겟이 얼었을 때 날씨 해방기는 물리/특수 공격 HP를 100% 흡수' }, { name: '맑음', description: '아군 풀 타입 포켓몬의 치료율이 20% 증가, 행동 턴 전에 최대 체력의 5%를 회복' }] },
            megaabomasnow: { name: { ko: '메가눈설왕', en: 'Mega Abomasnow' }, grade: 'S+', types: ['grass', 'ice'], imageURL: 'https://images.gameinfo.io/pokemon-trimmed/460-mega.png', faceImageURL: 'https://images.gameinfo.io/pokemon-icons/460-mega.png', weatherEffects: [{ name: '눈폭풍', description: '아군의 얼음 타입 포켓몬의 반사율, 얼음 타입 피해, 패시브 피해 감소가 각각 10% 증가, [얼음] 확률이 20% 증가' }] },
            primalkyogre: { name: { ko: '원시가이오가', en: 'Primal Kyogre' }, grade: 'SS', types: ['water'], imageURL: 'https://images.gameinfo.io/pokemon-trimmed/382-primal.png', faceImageURL: 'https://images.gameinfo.io/pokemon-icons/382-primal.png', weatherEffects: [{ name: '비', description: '날씨를 비 상태로 변경합니다.' }] },
            celebi: { name: { ko: '세레비', en: 'Celebi' }, grade: 'S+', types: ['psychic', 'grass'], imageURL: 'https://images.gameinfo.io/pokemon-trimmed/251.png', faceImageURL: 'https://images.gameinfo.io/pokemon-icons/251.png' },
            megasceptile_shiny: { name: { ko: '이로치 메가나무킹', en: 'Shiny Mega Sceptile' }, grade: 'S+', types: ['grass', 'dragon'], imageURL: 'https://images.gameinfo.io/pokemon-trimmed/254-mega-shiny.png', faceImageURL: 'https://images.gameinfo.io/pokemon-icons/254-mega-shiny.png' },
            burdrex_white: { name: { ko: '버드렉스(백마)', en: 'Calyrex Ice Rider' }, grade: 'SS', types: ['psychic', 'ice'], imageURL: 'https://images.gameinfo.io/pokemon-trimmed/898-ice-rider.png', faceImageURL: 'https://images.gameinfo.io/pokemon-icons/898-ice-rider.png' },
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'ss', name: 'SS' }, { id: 'sPlus', name: 'S+' }, { id: 's', name: 'S' } ],
        lev3: {}
    },
    item: {
        lev2: [ {id:'god', name:'빨강(God)'} ],
        lev3: { 
            god: [ {id:'immortalsword_god', name:'녹슨검/Immortal Sword'} ], 
        },
        lev4: { 
            'immortalsword_god': { 
                name: '녹슨검 (God) / Immortal Sword',
                grade: 'God',
                imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxtDeD%2FbtsOKJ36Be7%2FUrXuXYDmF5ADlMKoNkTlpK%2Fimg.png',
                description: 'God 등급 녹슨검의 상세 설명입니다.' 
            },
        }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { 
            rune: [ { id: 'deadly', name: '치명 / Deadly' } ], 
            chip: [ { id: 'lonewolf', name: '늑대행자 / Lone Wolf' } ] 
        },
        lev4: { 
            'deadly': { 
                name: '치명 / Deadly',
                imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcE5kYa%2FbtsOM4aGGe9%2F2O5kzKchvUjzk6y1T8UEk0%2Fimg.png',
                description: '치명 룬에 대한 상세 설명입니다.' 
            },
            'lonewolf': { 
                name: '늑대행자 / Lone Wolf', 
                imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb14n9D%2FbtsOLaXQc82%2F8OMfS4o2aWfBkhsKEb2kKk%2Fimg.png',
                description: '늑대행자 칩에 대한 상세 설명입니다.'
            },
        }
    },
    deck: {
        lev2: [ 
            { id: 'recommended', name: '추천덱' },
            { id: 'builder', name: '배치툴' }
        ],
        lev3: { 
            recommended: [ { id: 'fireDragonDeck', name: '불&드래곤' } ],
            builder: [{ id: 'deckBuilder', name: '배치툴'}]
        },
        lev4: {
            fireDragonDeck: {
                name: '불&드래곤 추천덱',
                description: '이 덱은 불과 드래곤 타입 포켓몬의 시너지를 극대화하여 강력한 공격력을 자랑합니다.',
                composition: [
                    { role: 'main', position: 1, pokemonId: 'megamewtwox' }, { role: 'main', position: 2, pokemonId: 'megamewtwox' },
                    { role: 'main', position: 3, pokemonId: 'megamewtwox' }, { role: 'main', position: 4, pokemonId: 'megamewtwox' },
                    { role: 'main', position: 5, pokemonId: 'megamewtwox' }, { role: 'main', position: 6, pokemonId: 'megamewtwox' },
                    { role: 'assist', position: 1, pokemonId: 'megamewtwox' }, { role: 'assist', position: 2, pokemonId: 'megamewtwox' },
                    { role: 'assist', position: 3, pokemonId: 'megamewtwox' }
                ]
            },
            deckBuilder: { id: 'deckBuilder', name: '나만의 덱 만들기', content: '배치툴 기능은 PC에서 이용해주세요.'}
        }
    },
    calendar: {
        lev2: {
            name: '이벤트 캘린더',
            events: [
                { date: '2025-07-18', type: 'ranking', duration: 3, title: '웅의 메가 강철톤', description: '랭킹뽑기: 웅의 메가 강철톤(강철/땅) [어시스트: 무쇠 바퀴]' },
            ],
            recurringEvents: [
                { id: 'luckycat', name: '복냥이', title: '다이아 뽑기', type: 'luckycat', duration: 3, startDate: '2025-06-27', interval: '4_weeks', description: 'VIP 등급에 따라 다이아를 획득할 수 있는 복냥이 이벤트 기간입니다.' }
            ]
        }
    },
    tips: {
        lev2: [
            { id: 'tip1', name: '초보자를 위한 팁' },
            { id: 'tip2', name: '재화 수급처 총정리 (표 포함)' }
        ],
        lev3: {
            'tip1': {
                name: '초보자를 위한 팁',
                htmlContent: `<h3>환영합니다!</h3><p>이 웹사이트는 포켓몬 도감 정보를 제공하기 위해 만들어졌습니다. 궁금한 점이 있다면 언제든지 문의해주세요.</p><p>앞으로 더 많은 정보가 추가될 예정입니다.</p>`
            },
            'tip2': {
                name: '재화 수급처 총정리 (표 포함)',
                htmlContent: `<h3>주요 재화 수급처 목록</h3><p>게임 내에서 얻을 수 있는 주요 재화와 그 수급처 목록입니다.</p><table class="content-table"><thead><tr><th>재화 종류</th><th>주요 수급처</th><th>비고</th></tr></thead><tbody><tr><td>골드</td><td>일일 퀘스트, 이벤트</td><td>가장 기본적인 재화입니다.</td></tr><tr><td>다이아</td><td>과금, 아레나 보상</td><td>모든 것을 할 수 있는 만능 재화입니다.</td></tr></tbody></table><p>위 표를 참고하여 효율적으로 재화를 모아보세요.</p>`
            }
        }
    }
};