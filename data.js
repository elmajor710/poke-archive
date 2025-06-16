// ------------ START: 이 아래의 코드로 data.js 파일 전체를 교체해주세요. ------------
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
            water: [ { id: 'kyogre', name: '가이오가' } ], fire: [ { id: 'charizard', name: '리자몽' } ], normal: [ { id: 'snorlax', name: '잠만보' } ], grass: [ { id: 'bulbasaur', name: '이상해씨' } ], electric: [ { id: 'pikachu', name: '피카츄' } ], ice: [ { id: 'lapras', name: '라프라스' } ], fighting: [ { id: 'machamp', name: '괴력몬' } ], poison: [ { id: 'gengar', name: '팬텀' } ], ground: [ { id: 'rhydon', name: '코뿌리' } ], flying: [ { id: 'pidgeot', name: '피죤투' } ], psychic: [ { id: 'alakazam', name: '후딘' } ], bug: [ { id: 'scyther', name: '스라크' } ], rock: [ { id: 'golem', name: '딱구리' } ], ghost: [ { id: 'gengar2', name: '팬텀' } ], dragon: [ { id: 'dragonite', name: '망나뇽' } ], dark: [ { id: 'tyranitar', name: '마기라스' } ], steel: [ { id: 'scizor', name: '핫삼' } ], fairy: [ { id: 'gardevoir', name: '가디안' } ]
        },
        lev4: { 
            kyogre: { name: '가이오가', content: '<h3>가이오가</h3><p>바다를 넓힌 포켓몬으로 알려져있다.</p>' }, charizard: { name: '리자몽', content: '<h3>리자몽</h3><p>맹렬한 불꽃을 내뿜는다.</p>' }, snorlax: { name: '잠만보', content: '<h3>잠만보</h3><p>먹고 자는게 일상이다.</p>' }, bulbasaur: { name: '이상해씨', content: '<h3>이상해씨</h3><p>씨앗 포켓몬이다.</p>'}, pikachu: { name: '피카츄', content: '<h3>피카츄</h3><p>전기 포켓몬이다.</p>'}, lapras: { name: '라프라스', content: '<h3>라프라스</h3><p>탈것 포켓몬이다.</p>'}, machamp: { name: '괴력몬', content: '<h3>괴력몬</h3><p>괴력 포켓몬이다.</p>'}, gengar: { name: '팬텀', content: '<h3>팬텀</h3><p>그림자 포켓몬이다.</p>'}, rhydon: { name: '코뿌리', content: '<h3>코뿌리</h3><p>드릴 포켓몬이다.</p>'}, pidgeot: { name: '피죤투', content: '<h3>피죤투</h3><p>새 포켓몬이다.</p>'}, alakazam: { name: '후딘', content: '<h3>후딘</h3><p>초능력 포켓몬이다.</p>'}, scyther: { name: '스라크', content: '<h3>스라크</h3><p>사마귀 포켓몬이다.</p>'}, golem: { name: '딱구리', content: '<h3>딱구리</h3><p>거석 포켓몬이다.</p>'}, gengar2: { name: '팬텀', content: '<h3>팬텀</h3><p>그림자 포켓몬이다.</p>'}, dragonite: { name: '망나뇽', content: '<h3>망나뇽</h3><p>드래곤 포켓몬이다.</p>'}, tyranitar: { name: '마기라스', content: '<h3>마기라스</h3><p>갑옷 포켓몬이다.</p>'}, scizor: { name: '핫삼', content: '<h3>핫삼</h3><p>집게 포켓몬이다.</p>'}, gardevoir: { name: '가디안', content: '<h3>가디안</h3><p>포용 포켓몬이다.</p>'}
        }
    },
    pokemonGrade: {
        lev2: [ { id: 'SS', name: 'SS' }, { id: 'Splus', name: 'S+' }, { id: 'S', name: 'S' } ],
        lev3: { 
            SS: [ {id: 'mewtwo', name: '뮤츠'} ], Splus: [ {id: 'darkrai', name: '다크라이'} ], S: [ {id: 'lucario', name: '루카리오'} ]
        },
        lev4: { 
            mewtwo: { name: '뮤츠', content: '<h3>뮤츠</h3><p>강력한 유전자를 가졌다.</p>' }, darkrai: { name: '다크라이', content: '<h3>다크라이</h3><p>악몽을 꾸게 한다.</p>' }, lucario: { name: '루카리오', content: '<h3>루카리오</h3><p>파동을 다룬다.</p>' }
        }
    },
    item: {
        lev2: [ {id:'red', name:'빨간색', color:'#E74C3C'}, {id:'orange',name:'주황색', color:'#E67E22'}, {id:'purple',name:'보라색', color:'#9B59B6'} ],
        lev3: { 
            red: [ {id:'rustySword', name:'녹슨 검'} ], orange: [ {id:'oranBerry', name:'오랭열매'} ], purple: [ {id:'masterBall', name:'마스터볼'} ],
        },
        lev4: { 
            rustySword: { name:'녹슨 검', content: '<h3>녹슨 검</h3><p>자시안에게 힘을 준다.</p>' }, oranBerry: { name: '오랭열매', content: '<h3>오랭열매</h3><p>HP를 10 회복한다.</p>' }, masterBall: { name: '마스터볼', content: '<h3>마스터볼</h3><p>반드시 포켓몬을 잡는다.</p>' }
        }
    },
    runeAndChip: {
        lev2: [ { "id": "rune", "name": "룬" }, { "id": "chip", "name": "칩" } ],
        lev3: {
            rune: [ { "id": "counter", "name": "반격" }, { "id": "sparkle", "name": "반짝임" }, { "id": "aegis", "name": "비호" }, { "id": "diamond", "name": "금강" }, { "id": "shield", "name": "실드" }, { "id": "defense", "name": "방어" }, { "id": "berserker", name: "전투광" }, { "id": "critical", name: "치명" }, { "id": "power", name: "강격" } ],
            chip: [ { "id": "sacrifice", name: "헌제" }, { "id": "terror", name: "공포" }, { "id": "psychic", name: "초능" }, { "id": "snakeghost", name: "뱀유령" }, { "id": "pavise", name: "방패" }, { "id": "carapace", name: "귀갑" }, { "id": "wolfwalker", name: "늑대행자" }, { "id": "frogthorn", name: "개구리가시" }, { "id": "firedance", name: "화무" } ]
        },
        lev4: {
            counter: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F9FyNr%2FbtsOxx2LAy2%2Fk8M0rvXZ4gV7yDHTlVajoK%2Fimg.png" alt="반격 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>서포트 룬스톤<br>반격3개 <span style="color: red;">공명(빨간색)</span>: 반사율+12%</p>` },
            sparkle: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbfWdrA%2FbtsOyqBPbpA%2FmxnqjrkMl8zVCuIiS5MTAK%2Fimg.png" alt="반짝임 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>서포트 룬스톤<br>반짝임3개 <span style="color: red;">공명(빨간색)</span>: 흡혈률+8%</p>` },
            aegis: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbJUmHm%2FbtsOwNkWh7C%2F0dqMu4TQyn4Nt3wm4qmkMK%2Fimg.png" alt="비호 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>서포트 룬스톤<br>비호3개 <span style="color: red;">공명(빨간색)</span>: 치료율+12%</p>` },
            diamond: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FdC0J7t%2FbtsOAg8pFld%2Fy1MlzkkA6nYkkFzx4DWcK0%2Fimg.png" alt="금강 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>방어 룬스톤<br>금강3개 <span style="color: red;">공명(빨간색)</span>: PVP피해 감소율+8%<br>금강6개 <span style="color: red;">공명(빨간색)</span>: 피해 감소+8%</p>` },
            shield: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FephEJ1%2FbtsOxhTl9g7%2FLezrK4qGjmGxyKKNThKZ40%2Fimg.png" alt="실드 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>방어 룬스톤<br>실드3개 <span style="color: red;">공명(빨간색)</span>: HP+16%<br>실드6개 <span style="color: red;">공명(빨간색)</span>: 치명타 내성+10%</p>` },
            defense: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FwQbPg%2FbtsOyoxe8xs%2FWfU1mfpn3ZLBWTjkoIS8IK%2Fimg.png" alt="방어 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>방어 룬스톤<br>방어3개 <span style="color: red;">공명(빨간색)</span>: 저항률+10%<br>방어6개 <span style="color: red;">공명(빨간색)</span>: 저항 강도+10%</p>` },
            berserker: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbI8qmg%2FbtsOx9mICsj%2FHPekYM5s0k8xFLHYQoLdG1%2Fimg.png" alt="전투광 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>공격 룬스톤<br>전투광3개 <span style="color: red;">공명(빨간색)</span>: PVP피해 보너스+8%<br>전투광6개 <span style="color: red;">공명(빨간색)</span>: 피해 보너스+8%</p>` },
            critical: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbU9JRa%2FbtsOv8izvWj%2FIf5dAZJsul5BwpbV6ECDuk%2Fimg.png" alt="치명 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>공격 룬스톤<br>치명3개 <span style="color: red;">공명(빨간색)</span>: 치명타율 +8%<br>치명6개 <span style="color: red;">공명(빨간색)</span>: 치명타 피해+12%</p>` },
            power: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fxs8x9%2FbtsOxxPh1Nr%2FMun91YmWOgAB8pTnceOHzk%2Fimg.png" alt="강격 룬" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>공격 룬스톤<br>강격3개 <span style="color: red;">공명(빨간색)</span>: 공격+12%, 특수공격+12%<br>강격6개 <span style="color: red;">공명(빨간색)</span>: 방어 무시+10%, 특수방어 무시+10%</p>` },
            sacrifice: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FczfuV4%2FbtsOv8CROis%2FPuSYgpKgB5iISfz3dlRmuk%2Fimg.png" alt="헌제 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>2개 세트: HP+9%, 공격+6%, 특수공격+6%<br>4개 세트: 사망이나 반죽음 상태 적 전체 피해 보너스 및 피해 감소 12%를 1턴간 감소, 6번째 턴에 사망 후 효과 적용 1턴 간 상승</p>` },
            terror: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbdgxEQ%2FbtsOxAZwhTC%2FEqK9dhp4kutyPfmYh7kKLK%2Fimg.png" alt="공포 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>2개 세트: HP+9%, 공격+6%, 특수공격+6%<br>4개 세트: 필살기를 발동 시 공격 범위 내의 무작위 한 목표에서 부노 180 감소하고, 40%의 확률로 (첫 필살기 100%) 한 목표에 추가적으로 적용한다.</p>` },
            psychic: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fyx9zX%2FbtsOv9u3EEh%2FIKOC48KEUZBBlYlmuGcIL1%2Fimg.png" alt="초능 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>HP+9%, 공격+6%, 특수공격+6%<br>4개 세트: 필살기를 발동 시 공격 범위 내의 유닛에게 10%의 확률로 (메인 목표 25%) 무작위 제어 효과를 부여 (기절, 침묵, 마비, 수면), 라운드 내에 필살기를 발동되지 않으면 제어 확률 3% 증가(중첩 가능), 핈갈기를 발동한 후 증가 해제</p>` },
            snakeghost: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fevl7Dp%2FbtsOxuSsHOD%2Fd7KC7HhhmD6fg8kIcoeBJk%2Fimg.png" alt="뱀유령 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>HP+12%<br>4개 세트: 자신 HP가 50% 이상일 시 피해 감소 15%와 치명타 내성 8% 증가, 자신 주변의 유닛 HP가 60% 이상일 시 피해 감소 8%와 치명타 내성 5% 증가</p>` },
            pavise: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbA4VZ9%2FbtsOx98ansp%2FjUyqK3fNkvXTfQ0VkoZ6SK%2Fimg.png" alt="방패 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>HP+12%<br>4개 세트: 일반 스킬이나 필살기를 발동 후, 자신과 다른 랜덤 한 유닛에게 최대 HP 17%의 실드를 추가</p>` },
            carapace: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fc8VOzU%2FbtsOxsm48DU%2FWhK44S6yRIogtTK9Tm9kg1%2Fimg.png" alt="귀갑 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>HP+12%<br>4개 세트: 스킬 피해를 받은 후 100%의 확률로 이번 입은 피해의 27%를 반사 (해당 효과가 적용될 때마다 반사 확률 20% 낮추고 최소 60%까지 낮춘다.)</p>` },
            wolfwalker: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcUh4D2%2FbtsOx40jDq4%2FyXEinUS88JPLxcuACYkjr1%2Fimg.png" alt="늑대행자 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>공격+9%, 특수공격+9%<br>4개 세트: HP가 50%이상인 목표에게 스킬 피해 20% 증가</p>` },
            frogthorn: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcvD4ic%2FbtsOwxo9URU%2FAkK0KJQV79AK5MGMMi4nEk%2Fimg.png" alt="개구리가시 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>공격+9%, 특수공격+9%<br>4개 세트: HP 1% 손실될 때마다 피해 보너스 0.29%와 필살기 피해 보너스 0.1% 증가: HP가 50% 이하일 시 10%의 흡혈 효과 상승</p>` },
            firedance: { content: `<img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FGSHbB%2FbtsOx98anu1%2FlX42okgwuVKWR0ufIGTvgK%2Fimg.png" alt="화무 칩" style="width:100%; max-width:150px; margin-bottom: 10px;"><p>공격+9%, 특수공격+9%<br>4개 세트: 주동적인 공격이 저항 당하거나 치명타를 안한다면 앞으로 1~2턴간 자신의 치명타율 및 치명타 피해 18% 증가</p>` }
        }
    },
    deck: {
        lev2: [
            { id: 'fireDeck', name: '불덱' },
            { id: 'waterFairyDeck', name: '물페어리덱' },
            { id: 'electricDeck', name: '전기덱' },
            { id: 'grassDeck', name: '풀덱' }
        ],
        lev3: {
            "fireDeck": { "name": "불덱", "content": "<h3>🔥 불덱 구성원</h3><p>원시 그란돈<br>마샤도<br>이터나투스<br>레시라무<br>이로치 칠색조<br>큐레무</p>" },
            "waterFairyDeck": { "name": "물페어리덱", "content": "<h3>💧 물페어리덱 구성원</h3><p>원시 가이오가<br>마나피<br>아쿠아단 마기아나<br>디안시<br>제르네아스<br>이로치 메가 가디안</p>" },
            "electricDeck": { "name": "전기덱", "content": "<h3>⚡ 전기덱 구성원</h3><p>제라오라<br>아르세우스<br>레지에레키<br>카푸꼬꼬꼭<br>제크로무<br>볼트로스</p>" },
            "grassDeck": { "name": "풀덱", "content": "<h3>🍃 풀덱 구성원</h3><p>자루도<br>고릴타<br>조로아크<br>버드렉스<br>세레비<br>쉐이미</p>" }
        }
    },
    calendar: {
        lev2: [ { id: 'ranking', name: '랭킹뽑기' }, { id: 'limited', name: '한정뽑기' } ],
        lev3: {
            "ranking": { "name": "랭킹뽑기", "content": `<h2>🔥 랭킹뽑기 S+ 획득 일정</h2><ul><li>25.06.13 - <strong>챔피언 피카츄</strong> (전기) [레지에레키]</li><li>25.07.18 - <strong>웅의 메가 강철톤</strong> (강철/땅) [무쇠 바퀴]</li><li>25.08.22 - <strong>코라이돈</strong> (격투/드래곤) [애프룡]</li><li>25.09.26 - <strong>메가 보만다</strong> (드래곤/비행) [고동치는달]</li><li>25.10.31 - <strong>이로치 메가 핫삼</strong> (벌레/강철) [사마자르]</li><li>25.12.05 - <strong>디아루가 오리진폼</strong> (강철/드래곤) [브리두라스]</li><li>26.01.09 - <strong>이로치 메가 헤라크로스</strong> (벌레/격투) [땅을 기는 날개]</li></ul><h3>⚠️ 랭킹뽑기 주의점</h3><p>랭뽑 순위표 오른쪽 하단에 <strong>랭뽑 참여 제한 기준</strong>이 명시되어 있습니다.<br>일부 신규 서버는 해당 조건이 없을 수 있으며, 조건은 아래 중 하나입니다:</p><ul><li>전투력 ###### 이상(서버마다 상이)</li><li>VIP5 이상</li></ul><p><strong>꼭 확인 후 참여하세요! 다이아 손해보는 일이 없도록요 🙅‍♂️</strong></p><h3>💎 랭킹뽑기 비용 및 보상</h3><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;"><thead><tr><td>순위</td><td>소모 다이아</td><td>보상 내용</td></tr></thead><tbody><tr><td>1등 (7000포)</td><td>47,600</td><td>S+ 포켓몬 1마리 + 조각 240개 + 테두리 + 에멜랄드 성석 5개</td></tr><tr><td>2등 (5000포)</td><td>34,000</td><td>S+ 포켓몬 1마리 + 조각 160개 + 성석 4개</td></tr><tr><td>3등 (4000포)</td><td>27,200</td><td>S+ 포켓몬 1마리 + 조각 80개 + 성석 4개</td></tr><tr><td>4~6등 (3500포)</td><td>23,800</td><td>S+ 포켓몬 1마리 + 성석 4개 + 맛있는 우유 40개</td></tr></tbody></table><hr><p style="font-size: 0.9em; color: gray;">출처: <strong>s222 인연_밍ૢ</strong></p>`},
            "limited": { "name": "한정뽑기", "content": `<h2>🎯 한정뽑기 S+ 획득 일정</h2><ul><li>25.05.23 - 알랭의 메가 리자몽X, 이로치 메가 나무킹</li><li>25.06.27 - 이로치 메가 눈설왕, 이로치 메가 이상해꽃</li><li>25.08.01 - 무한다이노, 미라이돈</li><li>25.09.05 - 이로치 메가 나무킹, 챔피언 피카츄</li><li>25.10.10 - 이로치 메가 이상해꽃, 웅의 메가 강철톤</li><li>25.11.14 - 미라이돈, 코라이돈</li><li>25.12.19 - 챔피언 피카츄, 메가 보만다</li><li>26.01.23 - 웅의 메가 강철톤, 이로치 메가 핫삼</li><li>26.02.27 - 코라이돈, 디아루가 오리진폼</li><li>26.04.03 - 메가 보만다, 이로치 메가 헤라크로스</li></ul><h3>🎲 한정뽑기 확률 업 기준</h3><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;"><thead><tr><td>뽑기 횟수</td><td>1마리째</td><td>2마리째</td><td>3~5마리째</td></tr></thead><tbody><tr><td>1~60회</td><td>1%</td><td>1%</td><td>5%</td></tr><tr><td>61~70회</td><td>6%</td><td>11%</td><td>20%</td></tr><tr><td>71~80회</td><td>86%</td><td>95%</td><td>95%</td></tr><tr><td>81~90회</td><td colspan="3">공통 100% 확정</td></tr></tbody></table><p style="margin-top: 10px;">💡 <strong>TIP:</strong> 70회 이후에는 <mark>단일 뽑기(260 다이아)</mark>로 횟수를 조절해 뽑는 것이 <strong>다이아 절약에 도움</strong>됩니다!<br>(10회 뽑기 = 2480 다이아 / 단일 뽑기 5~6회면 800~1000 다야 절약 가능)<br><strong>단!</strong> 0시가 되면 확률업이 <u>초기화</u>되니 시간 조절 필수입니다.</p><p style="font-size: 0.9em; color: gray;">출처: <strong>s222 인연_밍ૢ</strong></p>` }
        }
    },
    tips: {
        lev2: [
            { id: 'star', name: 'S+급·S급 단계별 성급재료 총정리표' },
            { id: 'guide', name: '포켓몬 유저라면 꼭 알아야 할 초보자 가이드 TOP10' },
            { id: 'megaEvolution', name: '포켓몬 메가진화 조건 총정리' }
        ],
        lev3: {
            "star": {
                "name": "S+급·S급 단계별 성급재료 총정리표",
                "content": `<h2>S+급 성급재료 소모표</h2><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;"><thead><tr><td>성급 단계</td><td>소모 재료 수</td><td>누적 수량</td></tr></thead><tbody><tr><td>4 → 5성</td><td>1마리</td><td>1마리</td></tr><tr><td>5 → 6성</td><td>1마리</td><td>2마리</td></tr><tr><td>6 → 7성</td><td>2마리</td><td>4마리</td></tr><tr><td>7 → 8성</td><td>2마리</td><td>6마리</td></tr><tr><td>8 → 9성</td><td>2마리</td><td>8마리</td></tr><tr><td>9 → 10성</td><td>3마리</td><td>11마리</td></tr><tr><td>10 → 11성</td><td>3마리</td><td>14마리</td></tr><tr><td>11 → 12성</td><td>3마리</td><td>17마리</td></tr></tbody></table><br><br><h2>S급 성급재료 소모표</h2><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; text-align: center;"><thead><tr><td>성급 단계</td><td>소모 재료 수</td><td>누적 수량</td></tr></thead><tbody><tr><td>3 → 4성</td><td>1마리</td><td>1마리</td></tr><tr><td>4 → 5성</td><td>1마리</td><td>2마리</td></tr><tr><td>5 → 6성</td><td>2마리</td><td>4마리</td></tr><tr><td>6 → 7성</td><td>2마리</td><td>6마리</td></tr><tr><td>7 → 8성</td><td>2마리</td><td>8마리</td></tr><tr><td>8 → 9성</td><td>3마리</td><td>11마리</td></tr><tr><td>9 → 10성</td><td>3마리</td><td>14마리</td></tr><tr><td>10 → 11성</td><td>3마리</td><td>17마리</td></tr><tr><td>11 → 12성</td><td>4마리</td><td>21마리</td></tr></tbody></table>`
            },
            "guide": {
                "name": "포켓몬 유저라면 꼭 알아야 할 초보자 가이드 TOP10",
                "content": `<h2>🌟 포켓몬 유저라면 꼭 알아야 할 초보자 가이드 TOP 10</h2><ol><li><strong>A급, B급 포켓몬은 함부로 분해하지 마세요!</strong><br>→ 12성까지 진화에 필요하며, 도감 보너스도 챙길 수 있습니다.</li><li><strong>만능조각은 S급에 쓰지 마세요.</strong><br>→ 추후 S+급이나 귀한 포켓몬에게 아껴두세요.</li><li><strong>체력을 다이아로 너무 자주 사지 마세요.</strong><br>→ 하루 2~3회 정도만 구입하는 것이 적당합니다.</li><li><strong>S급 포켓몬 뽑기에 다이아를 낭비하지 마세요.</strong><br>→ 효율이 낮고 후회할 확률 높습니다.</li><li><strong>주황색 메타몽은 성급하기 어려운 포켓몬에 사용하세요.</strong><br>→ 레어 포켓몬을 중심으로 사용하면 성급작 수월합니다.</li><li><strong>보라색 메타몽은 나옹에게 우선적으로 투자하세요.</strong><br>→ 팀 구성이나 PVP에서 큰 도움을 줄 수 있습니다.</li><li><strong>보상 선택 시, 아바타부터 받는 것이 이득입니다.</strong><br>→ 전투력 상승 및 외형 효과까지 일석이조!</li><li><strong>로비 화면에서 눈이 점(.)인 포켓몬을 꼭 눌러보세요.</strong><br>→ <u>메타몽 = 다이아</u>를 얻을 수 있는 숨겨진 요소! (3일에 1번)</li><li><strong>주먹밥, 도시락 등 체력 아이템은 모아두세요.</strong><br>→ <mark>소탕 2배 이벤트</mark> 기간에 사용하면 효율 극대화!</li><li><strong>악세사리·탐지기 뽑기는 재화 150~300개 모아 이벤트 때 사용하세요.</strong><br>→ 누적 사용 시 보상도 높아지는 구조입니다.</li></ol><p style="font-size: 0.9em; color: gray;">출처: <strong>S170/FS_신디 & 90&131 너 뿐</strong></p>`
            },
            "megaEvolution": {
                "name": "포켓몬 메가진화 조건 총정리",
                "content": `<h2>🔥 메가진화에 필요한 재화 정리표</h2><h3>S+ ➜ SS 진화</h3><ul><li>진화 대상: S+ 11성</li><li>골드: 60M</li><li>성석: 50개</li><li>전설 조각: 200개</li><li>키스톤: 100개 (S+ 10마리)</li><li>진화석: 80개 (동일 타입 S+ 8마리)</li><li><strong>※ 전설 조각 환산 기준: 총 1640</strong></li></ul><h3>S ➜ S 진화</h3><ul><li>진화 대상: S 12성</li><li>골드: 5M</li><li>성석: 10개</li><li>일반 조각: 50개</li><li>키스톤: 60개 (S 6마리)</li><li>진화석: 40개 (동일 타입 S 4마리)</li></ul><h3>A ➜ S 진화</h3><ul><li>진화 대상: A 12성</li><li>골드: 10M</li><li>성석: 20개</li><li>일반 조각: 100개</li><li>키스톤: 150개 (S 15마리)</li><li>진화석: 120개 (동일 타입 S 12마리)</li></ul><h3>B ➜ A 진화</h3><ul><li>진화 대상: B 12성</li><li>골드: 5M</li><li>성석: 5개</li><li>일반 조각: 20개</li><li>키스톤: 180개 (A 18마리)</li><li>진화석: 150개 (동일 타입 A 15마리)</li></ul><hr><h2>💙 유대진화 조건</h2><ul><li>대상: 개굴닌자 12성</li><li>총 개체값: 160</li><li>호감도: 360</li><li>전투력: 20만 이상</li><li>필요 재화:<ul><li>성석: 20개</li><li>전설 조각: 20개</li><li>개구마르 조각: 50개</li><li>키스톤: 10개 (S+ 1마리)</li><li>진화석: 120개 (동일 타입 S 12마리)</li></ul></li></ul><hr><h2>📊 성급재료 필요 마릿수</h2><h3>S+급 성급재료</h3><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; text-align: center;"><thead><tr><td>성급 단계</td><td>소모 마릿수</td><td>누적</td></tr></thead><tbody><tr><td>4 → 5</td><td>1마리</td><td>1</td></tr><tr><td>5 → 6</td><td>1마리</td><td>2</td></tr><tr><td>6 → 7</td><td>2마리</td><td>4</td></tr><tr><td>7 → 8</td><td>2마리</td><td>6</td></tr><tr><td>8 → 9</td><td>2마리</td><td>8</td></tr><tr><td>9 → 10</td><td>3마리</td><td>11</td></tr><tr><td>10 → 11</td><td>3마리</td><td>14</td></tr><tr><td>11 → 12</td><td>3마리</td><td>17</td></tr></tbody></table><br><h3>S급 성급재료</h3><table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; text-align: center;"><thead><tr><td>성급 단계</td><td>소모 마릿수</td><td>누적</td></tr></thead><tbody><tr><td>3 → 4</td><td>1마리</td><td>1</td></tr><tr><td>4 → 5</td><td>1마리</td><td>2</td></tr><tr><td>5 → 6</td><td>2마리</td><td>4</td></tr><tr><td>6 → 7</td><td>2마리</td><td>6</td></tr><tr><td>7 → 8</td><td>2마리</td><td>8</td></tr><tr><td>8 → 9</td><td>3마리</td><td>11</td></tr><tr><td>9 → 10</td><td>3마리</td><td>14</td></tr><tr><td>10 → 11</td><td>3마리</td><td>17</td></tr><tr><td>11 → 12</td><td>4마리</td><td>21</td></tr></tbody></table><p style="font-size: 0.9em; color: gray;">출처: <strong>3.*Kaze_델로스</strong></p>`
            }
        }
    }
};
// ------------ END: 여기까지의 코드로 data.js 파일 전체를 교체해주세요. ------------