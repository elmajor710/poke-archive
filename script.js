document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v8.4-readability-fix');

    // ... (운영자 모드 코드는 이전과 동일)

    // =============== 일반 사용자 모드 실행 ===============
    // ... (다른 변수 및 함수들은 이전과 동일)

    // [수정됨] renderSimpleView 함수
    function renderSimpleView(contentDiv, data) {
        let html = `<h2>${data.name}</h2>`;

        if (data.imageURL && data.imageURL.startsWith('http')) {
            html += `<img src="${data.imageURL}" alt="${data.name}" style="max-width: 150px; margin: 10px 0;">`;
        }

        if (data.baseStats && Object.values(data.baseStats).some(v => v !== 0)) {
            html += '<h4>기초 타입</h4><table class="stats-table">';
            Object.entries(data.baseStats).forEach(([stat, value]) => {
                if (value !== 0) {
                    html += `<tr><td>${stat}</td><td>+${value}</td></tr>`;
                }
            });
            html += '</table>';
        }

        if (data.description) {
            html += '<h4 style="margin-top: 15px;">휴대 효과</h4>';
            
            const descriptionLines = data.description.split('\\n');
            let processedDescription = '';
            descriptionLines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    if (trimmedLine.includes(':')) {
                        const parts = trimmedLine.split(':');
                        processedDescription += `<p><strong>${parts[0]}:</strong> ${parts.slice(1).join(':')}</p>`;
                    } else {
                        processedDescription += `<p>${trimmedLine}</p>`;
                    }
                }
            });
            html += processedDescription;
        }
        contentDiv.innerHTML = html;
    }

    // ... (나머지 모든 함수들은 이전 최종본과 동일합니다)
});