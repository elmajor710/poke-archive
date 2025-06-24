// 이전 답변에서 드렸던 'script.js' 최종본과 동일합니다. 
// 가장 마지막에 드렸던 완전체 코드를 그대로 사용하시면 됩니다.
// 설명을 위해, 수정된 아이템 추가 관련 함수 부분만 다시 보여드립니다.

function renderAddItemForm() {
    const formContainer = document.getElementById('admin-form-container');
    if (!formContainer) return;

    const gradeOptions = DB.item.lev2.map(grade => `<option value="${grade.id}">${grade.name}</option>`).join('');

    formContainer.innerHTML = `
        <h4>아이템 추가</h4>
        <div class="form-group" style="margin-bottom: 10px;">
            <label for="item-name">아이템 이름:</label>
            <input type="text" id="item-name" placeholder="예: 녹슨검" style="width: 95%;">
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label for="item-grade">아이템 등급:</label>
            <select id="item-grade">
                <option value="">-- 등급 선택 --</option>
                ${gradeOptions}
            </select>
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
            <label for="item-image-url">이미지 URL:</label>
            <input type="text" id="item-image-url" placeholder="https://..." style="width: 95%;">
        </div>
        <fieldset style="margin-top:10px; border: 1px solid #ccc; padding: 10px;"><legend>기초 타입 (능력치)</legend><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group"><label for="item-hp">HP:</label><input type="number" id="item-hp" value="0" style="width: 80%;"></div>
            <div class="form-group"><label for="item-speed">스피드:</label><input type="number" id="item-speed" value="0" style="width: 80%;"></div>
            <div class="form-group"><label for="item-attack">공격:</label><input type="number" id="item-attack" value="0" style="width: 80%;"></div>
            <div class="form-group"><label for="item-defense">방어:</label><input type="number" id="item-defense" value="0" style="width: 80%;"></div>
            <div class="form-group"><label for="item-sp-attack">특수공격:</label><input type="number" id="item-sp-attack" value="0" style="width: 80%;"></div>
            <div class="form-group"><label for="item-sp-defense">특수방어:</label><input type="number" id="item-sp-defense" value="0" style="width: 80%;"></div>
        </div></fieldset>
        <div class="form-group" style="margin-top: 10px;">
            <label for="item-description">설명 (휴대 효과):</label>
            <textarea id="item-description" rows="5" style="width: 95%;" placeholder="아이템에 대한 설명을 입력하세요."></textarea>
        </div>
        <button id="generate-item-code" style="margin-top:15px; padding: 10px;">코드 생성</button>
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
    
    const nameForId = name.replace(/ /g, '').replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
    const uniqueId = `${nameForId}_${grade}`;
    const formattedDescription = description.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

    const lev4Code =`// 1. item.lev4 객체 안에 이 코드를 추가하세요.\n'${uniqueId}': {\n    name: '${name}',\n    imageURL: '${imageUrl}',\n    baseStats: {\n        'HP': ${stats.HP}, '스피드': ${stats.스피드}, '공격': ${stats.공격},\n        '방어': ${stats.방어}, '특수공격': ${stats.특수공격}, '특수방어': ${stats.특수방어}\n    },\n    description: '${formattedDescription}'\n},`;
    
    const lev3Code = `// 2. item.lev3['${grade}'] 배열 안에 이 코드를 추가하세요.\n{ id: '${uniqueId}', name: '${name}' },`;

    codeOutput.value = `/* --- lev4에 추가할 코드 --- */\n${lev4Code}\n\n/* --- lev3.${grade}에 추가할 코드 --- */\n${lev3Code}`;
    alert('코드가 2개 생성되었습니다! 아래 텍스트 영역에서 각 코드를 복사하여 data.js의 올바른 위치에 추가하세요.');
}