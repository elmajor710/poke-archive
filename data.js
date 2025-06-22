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
            god: [ {id:'녹슨검', name:'녹슨검'} ],
            legendary: [ {id:'kingsRock', name:'왕의징표석'} ], 
            epic: [ {id:'leftovers', name:'먹다남은음식'}, {id:'focusSash', name:'기합의머리띠'} ], 
        },
        lev4: { 
            '녹슨검': {
                name: '녹슨검',
                imageURL: 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbxtDeD%2FbtsOKJ36Be7%2FUrXuXYDmF5ADlMKoNkTlpK%2Fimg.png',
                baseStats: { 'HP': 3872, '스피드': 77, '공격': 774, '방어': 310, '특수공격': 774, '특수방어': 310 },
                description: '휴대 시 피해 보너스 5% 증가, 최종 피해 보너스 5% 증가, 스피드 10% 증가\n창세법칙: 팀에 소지자와 자연 타입이 같은 아군이 2명 및 이상일 경우, 처음 3라운드 동안 아군 전체의 8% 물리&특수 공격과 4% 스피드는 증가한다. (같은 타입의 포켓몬이 50% 추가 부스트를 얻습니다.)\n검개천문: 전투 시작 전 2라운드에 거대한 검을 떨어뜨려 [참격] 적의 HP 최고 목표, [참격]: 대상 현재 HP의 15%를 직접 참격(상한은 자신의 물리&특수 공격의 250%), HP가 50% 이상인 대상의 참격 계수가 25%로 증가됩니다.\n쌍검합벽: 아군이 동시에 녹슨 검을 소지하고 있는 경우 아군 2명은 같은 라운드에 한 번 서로를 전투에 초대할 수 있습니다. 이 초대장에는 데미지 30%의 [참격] 효과가 함께 제공됩니다. 전투마다 최대 1회 발동.'
            },
            kingsRock: { name:'왕의징표석', imageURL: '이미지URL_준비중', description: '공격 기술에 10% 확률로 풀죽음 효과를 부여한다.' },
            leftovers: { name:'먹다남은음식', imageURL: '이미지URL_준비중', description: '지니게 하면 매 턴마다 최대 HP의 1/16만큼 HP를 회복한다.' },
            focusSash: { name:'기합의머리띠', imageURL: '이미지URL_준비중', description: 'HP가 가득 찬 상태에서 기술을 받아 쓰러질 경우, HP 1을 남기고 한 번 버틴다.'}
        }
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
                    { title: '웅의 메가 강철톤(강철/땅)[무쇠 바퀴]', type: 'ranking', startDate: '2025-07-18', endDate: '2025-07-20' },
                    { title: '코라이돈(격투/드래곤)[애프룡]', type: 'ranking', startDate: '2025-08-22', endDate: '2025-08-24' },
                    { title: '메가 보만다(드래곤/비행)[고동치는달]', type: 'ranking', startDate: '2025-09-26', endDate: '2025-09-28' },
                    { title: '이로치 메가 핫삼(벌레/강철)[사마자르]', type: 'ranking', startDate: '2025-10-31', endDate: '2025-11-02' },
                    { title: '디아루가 오리진폼(강철/드래곤)[브리두라스]', type: 'ranking', startDate: '2025-12-05', endDate: '2025-12-07' },
                    { title: '이로치 메가 헤라크로스(벌레/격투)[땅을 기는 날개]', type: 'ranking', startDate: '2026-01-09', endDate: '2026-01-11' },
                    { title: '이로치 메가 쁘사이저 (벌레/비행)[꼬시레]', type: 'ranking', startDate: '2026-02-13', endDate: '2026-02-15' },
                    { title: '이로치 메가 눈설왕, 이로치 메가 이상해꽃', type: 'limited', startDate: '2025-06-27', endDate: '2025-06-29' },
                    { title: '무한다이노, 미라이돈', type: 'limited', startDate: '2025-08-01', endDate: '2025-08-03' },
                    { title: '이로치 메가 나무킹, 챔피언 피카츄', type: 'limited', startDate: '2025-09-05', endDate: '2025-09-07' },
                    { title: '이로치 메가 이상해꽃, 웅의 메가 강철톤', type: 'limited', startDate: '2025-10-10', endDate: '2025-10-12' },
                    { title: '미라이돈, 코라이돈', type: 'limited', startDate: '2025-11-14', endDate: '2025-11-16' },
                    { title: '챔피언 피카츄, 메가보만다', type: 'limited', startDate: '2025-12-19', endDate: '2025-12-21' },
                    { title: '웅의 메가 강철톤, 이로치 메가 핫삼', type: 'limited', startDate: '2026-01-23', endDate: '2026-01-25' },
                    { title: '코라이돈, 디아루가 오리진폼', type: 'limited', startDate: '2026-02-27', endDate: '2026-03-01' },
                    { title: '메가보만다, 이로치 메가 헤라크로스', type: 'limited', startDate: '2026-04-03', endDate: '2026-04-05' },
                    { title: '이로치 메가 핫삼, 이로치 메가 쁘사이저', type: 'limited', startDate: '2026-05-08', endDate: '2026-05-10' },
                ],
                recurringEvents: [
                    { title: '복냥이', type: 'special', durationDays: 3, recurrence: { unit: 'weeks', interval: 4 }, startDate: '2025-06-27' }
                ]
            } 
        }
    },
    tips: {
        lev2: [ { id: 'beginnerTop10', name: '초보자를 위한 가이드 TOP 10' } ],
        lev3: { 
            beginnerTop10: { name: '초보자를 위한 가이드 TOP 10', content: '<h3>1. 리세마라 가이드</h3><p>리세마라는 ... 하는 것이 좋습니다.' },
        }
    }
};