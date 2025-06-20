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
        lev2: [ {id:'god', name:'빨강(God)'}, {id:'legendary', name:'주황(Legendary)'}, {id:'epic', name:'보라(Epic)'} ],
        lev3: { god: [ {id:'rustySword', name:'녹슨검'} ], legendary: [ {id:'kingsRock', name:'왕의징표석'} ], epic: [ {id:'leftovers', name:'먹다남은음식'}, {id:'focusSash', name:'기합의머리띠'} ], },
        lev4: { rustySword: { name:'녹슨검', imageURL: '이미지URL_준비중', description: '자시안에게 지니게 하면 강철타입으로 변화하며, 공격이 1.2배 강해진다.' }, kingsRock: { name:'왕의징표석', imageURL: '이미지URL_준비중', description: '공격 기술에 10% 확률로 풀죽음 효과를 부여한다.' }, leftovers: { name:'먹다남은음식', imageURL: '이미지URL_준비중', description: '지니게 하면 매 턴마다 최대 HP의 1/16만큼 HP를 회복한다.' }, focusSash: { name:'기합의머리띠', imageURL: '이미지URL_준비중', description: 'HP가 가득 찬 상태에서 기술을 받아 쓰러질 경우, HP 1을 남기고 한 번 버틴다.'} }
    },
    runeAndChip: {
        lev2: [ {id: 'rune', name: '룬'}, {id: 'chip', name: '칩'} ],
        lev3: { rune: [ { id: 'deadly', name: '치명 / Deadly' }, { id: 'shield', name: '실드 / Shield' } ], chip: [ { id: 'loneWolf', name: '늑대대행자 / Lone Wolf' }, { id: 'tortoiseShell', name: '귀갑 / Tortoise Shell' } ] },
        lev4: { deadly: { name: '치명 / Deadly', imageURL: '이미지URL_준비중', description: '치명 룬에 대한 설명입니다.'}, shield: { name: '실드 / Shield', imageURL: '이미지URL_준비중', description: '실드 룬에 대한 설명입니다.'}, loneWolf: { name: '늑대대행자 / Lone Wolf', imageURL: '이미지URL_준비중', description: '늑대대행자 칩에 대한 설명입니다.' }, tortoiseShell: { name: '귀갑 / Tortoise Shell', imageURL: '이미지URL_준비중', description: '귀갑 칩에 대한 설명입니다.' }, }
    },
    deck: {
        lev2: [ { id: 'newbieDeck', name: '극초반 뉴비 (S급 8마리)' } ],
        lev3: { newbieDeck: { name: '극초반 뉴비 (S급 8마리)', imageURL: '이미지URL_준비중', description: '보스로라, 코리갑, 포푸니라, 펄기아, 렌트라, 핫삼, 가디안, 버터플 조합의 추천 덱 상세 설명입니다.' }, }
    },
    calendar: {
        lev2: [ { id: 'gachaSchedule', name: '뽑기 일정' } ],
        lev3: { 
            gachaSchedule: { 
                name: '뽑기 일정',
                description: '랭킹뽑기, 한정뽑기 등 주요 이벤트 일정을 확인할 수 있습니다.',
                events: [
                    { date: '2025-07-18', title: '웅의 메가 강철톤(강철/땅)[무쇠 바퀴]', type: 'ranking' }, { date: '2025-08-22', title: '코라이돈(격투/드래곤)[애프룡]', type: 'ranking' },
                    { date: '2025-09-26', title: '메가 보만다(드래곤/비행)[고동치는달]', type: 'ranking' }, { date: '2025-10-31', title: '이로치 메가 핫삼(벌레/강철)[사마자르]', type: 'ranking' },
                    { date: '2025-12-05', title: '디아루가 오리진폼(강철/드래곤)[브리두라스]', type: 'ranking' }, { date: '2026-01-09', title: '이로치 메가 헤라크로스(벌레/격투)[땅을 기는 날개]', type: 'ranking' },
                    { date: '2026-02-13', title: '이로치 메가 쁘사이저 (벌레/비행)[꼬시레]', type: 'ranking' }, { date: '2025-06-27', title: '이로치 메가 눈설왕, 이로치 메가 이상해꽃', type: 'limited' },
                    { date: '2025-08-01', title: '무한다이노, 미라이돈', type: 'limited' }, { date: '2025-09-05', title: '이로치 메가 나무킹, 챔피언 피카츄', type: 'limited' },
                    { date: '2025-10-10', title: '이로치 메가 이상해꽃, 웅의 메가 강철톤', type: 'limited' }, { date: '2025-11-14', title: '미라이돈, 코라이돈', type: 'limited' },
                    { date: '2025-12-19', title: '챔피언 피카츄, 메가보만다', type: 'limited' }, { date: '2026-01-23', title: '웅의 메가 강철톤, 이로치 메가 핫삼', type: 'limited' },
                    { date: '2026-02-27', title: '코라이돈, 디아루가 오리진폼', type: 'limited' }, { date: '2026-04-03', title: '메가보만다, 이로치 메가 헤라크로스', type: 'limited' },
                    { date: '2026-05-08', title: '이로치 메가 핫삼, 이로치 메가 쁘사이저', type: 'limited' }
                ]
            } 
        }
    },
    tips: {
        lev2: [ { id: 'beginnerTop10', name: '초보자를 위한 가이드 TOP 10' } ],
        lev3: { 
            beginnerTop10: { name: '초보자를 위한 가이드 TOP 10', content: '<h3>1. 리세마라 가이드</h3><p>리세마라는 ... 하는 것이 좋습니다.</p>' },
        }
    }
};