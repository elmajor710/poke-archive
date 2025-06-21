const DB = {
    // sidebarMenu, pokemonType, pokemonGrade, item, runeAndChip, deck, tips 객체는 이전과 동일합니다.
    // 설명을 위해 생략했습니다. 이전 버전의 데이터를 그대로 사용하시면 됩니다.

    // =============================================
    // [수정됨] 캘린더
    // =============================================
    calendar: {
        lev2: [ { id: 'gachaSchedule', name: '뽑기 일정' } ],
        lev3: { 
            gachaSchedule: { 
                name: '뽑기 일정',
                description: '랭킹뽑기, 한정뽑기 등 주요 이벤트 일정을 확인할 수 있습니다.',
                // 고정된 이벤트 목록
                events: [
                    // 랭킹뽑기
                    { title: '웅의 메가 강철톤(강철/땅)[무쇠 바퀴]', type: 'ranking', startDate: '2025-07-18', endDate: '2025-07-20' },
                    { title: '코라이돈(격투/드래곤)[애프룡]', type: 'ranking', startDate: '2025-08-22', endDate: '2025-08-24' },
                    { title: '메가 보만다(드래곤/비행)[고동치는달]', type: 'ranking', startDate: '2025-09-26', endDate: '2025-09-28' },
                    { title: '이로치 메가 핫삼(벌레/강철)[사마자르]', type: 'ranking', startDate: '2025-10-31', endDate: '2025-11-02' },
                    { title: '디아루가 오리진폼(강철/드래곤)[브리두라스]', type: 'ranking', startDate: '2025-12-05', endDate: '2025-12-07' },
                    { title: '이로치 메가 헤라크로스(벌레/격투)[땅을 기는 날개]', type: 'ranking', startDate: '2026-01-09', endDate: '2026-01-11' }, // 3일간
                    { title: '이로치 메가 쁘사이저 (벌레/비행)[꼬시레]', type: 'ranking', startDate: '2026-02-13', endDate: '2026-02-15' },
                    // 한정뽑기
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
                // 반복되는 이벤트 규칙 목록
                recurringEvents: [
                    {
                        title: '복냥이',
                        type: 'special', // '복냥이'를 위한 새로운 타입 (스타일 적용 위함)
                        durationDays: 3,
                        recurrence: {
                            unit: 'weeks',
                            interval: 4
                        },
                        startDate: '2025-06-27'
                    }
                ]
            } 
        }
    },
};