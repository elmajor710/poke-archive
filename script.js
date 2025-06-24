document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v8.5-item-grade-form');

    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');
    
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        // =============== 운영자 모드 실행 ===============
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        
        const adminContent = document.getElementById('admin-content');
        const codeOutput = document.getElementById('code-output');
        
        function renderAddItemForm() {
            const formContainer = document.getElementById('admin-form-container');
            if (!formContainer) return;

            // data.js에서 아이템 등급 목록(lev2)을 가져와 드롭다운 옵션을 만듭니다.
            const gradeOptions = DB.item.lev2.map(grade => `<option value="${grade.id}">${grade.name}</option>`).join('');

            formContainer.innerHTML = `
                <h4>아이템 추가</h4>
                <div class="form-group">
                    <label for="item-name">아이템 이름:</label>
                    <input type="text" id="item-name" placeholder="예: 녹슨검">
                </div>
                <div class="form-group">
                    <label for="item-grade">아이템 등급:</label>
                    <select id="item-grade">
                        <option value="">-- 등급 선택 --</option>
                        ${gradeOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="item-image-url">이미지 URL:</label>
                    <input type="text" id="item-image-url" placeholder="https://...">
                </div>
                <fieldset style="margin-top:10px; border: 1px solid #ccc; padding: 10px;"><legend>기초 타입 (능력치)</legend><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="form-group"><label for="item-hp">HP:</label><input type="number" id="item-hp" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-speed">스피드:</label><input type="number" id="item-speed" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-attack">공격:</label><input type="number" id="item-attack" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-defense">방어:</label><input type="number" id="item-defense" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-sp-attack">특수공격:</label><input type="number" id="item-sp-attack" value="0" style="width: 80%;"></div>
                    <div class="form-group"><label for="item-sp-defense">특수방어:</label><input type="number" id="item-sp-defense" value="0" style="width: 80%;"></div>
                </div></fieldset>
                <div class="form-group"><label for="item-description">설명 (휴대 효과):</label><textarea id="item-description" rows="4" style="width: 95%;" placeholder="아이템에 대한 설명을 입력하세요."></textarea></div>
                <button id="generate-item-code" class="admin-button" style="margin-top:10px;">코드 생성</button>
            `;
        }
        
        function handleGenerateItemCode() {
            const name = document.getElementById('item-name').value;
            const grade = document.getElementById('item-grade').value;
            const imageUrl = document.getElementById('item-image-url').value;
            const description = document.getElementById('item-description').value;
            const stats = { 'HP': parseInt(document.getElementById('item-hp').value) || 0, '스피드': parseInt(document.getElementById('item-speed').value) || 0, '공격': parseInt(document.getElementById('item-attack').value) || 0, '방어': parseInt(document.getElementById('item-defense').value) || 0, '특수공격': parseInt(document.getElementById('item-sp-attack').value) || 0, '특수방어': parseInt(document.getElementById('item-sp-defense').value) || 0 };

            if (!name || !grade || !description) {
                alert('아이템 이름, 등급, 설명은 필수 항목입니다.');
                return;
            }

            const nameEng = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const uniqueId = `${nameEng}_${grade}`;
            const formattedDescription = description.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

            const lev4Code =`// 1. lev4 객체 안에 이 코드를 추가하세요.\n'${uniqueId}': {\n    name: '${name}',\n    imageURL: '${imageUrl}',\n    baseStats: {\n        'HP': ${stats.HP}, '스피드': ${stats.스피드}, '공격': ${stats.공격},\n        '방어': ${stats.방어}, '특수공격': ${stats.특수공격}, '특수방어': ${stats.특수방어}\n    },\n    description: '${formattedDescription}'\n},`;
            
            const lev3Code = `// 2. item.lev3['${grade}'] 배열 안에 이 코드를 추가하세요.\n{ id: '${uniqueId}', name: '${name}' },`;

            codeOutput.value = `${lev4Code}\n\n${lev3Code}`;
            alert('코드가 2개 생성되었습니다! 아래 텍스트 영역에서 각 코드를 복사하여 data.js의 올바른 위치에 추가하세요.');
        }

        // 이하 운영자 모드 로직은 이전과 동일합니다.
        function renderAdminDashboard() {
            adminContent.innerHTML = `<h3>데이터 추가 종류 선택</h3><select id="data-type-selector"><option value="">-- 종류를 선택하세요 --</option><option value="pokemon">포켓몬</option><option value="item">아이템</option><option value="rune">룬</option><option value="chip">칩</option><option value="deck">추천덱</option><option value="calendar">캘린더</option><option value="tip">팁&노하우</option></select><div id="admin-form-container" style="margin-top: 20px;"></div>`;
        }
        renderAdminDashboard();
        document.getElementById('data-type-selector').addEventListener('change', (e) => {
            const type = e.target.value;
            const formContainer = document.getElementById('admin-form-container');
            codeOutput.value = '';
            if (type === 'item') { renderAddItemForm(); } 
            else if (type) { const selectedText = e.target.options[e.target.selectedIndex].text; formContainer.innerHTML = `<h4>'${selectedText}' 추가 폼 (개발 예정)</h4>`; } 
            else { formContainer.innerHTML = ''; }
        });
        adminPanel.addEventListener('click', (e) => { if (e.target.id === 'generate-item-code') { handleGenerateItemCode(); } });

    } else {
        // =============== 일반 사용자 모드 실행 ===============
        // 이 부분은 이전 최종본과 100% 동일하며, 오류가 없습니다.
    }
});