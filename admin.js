document.addEventListener('DOMContentLoaded', () => {
    // 타입, 성격, 아이템, 룬, 칩 데이터 동적 로드
    const typesContainer = document.getElementById('pkm-types-container');
    const naturesContainer = document.getElementById('pkm-natures-container');
    const itemsSelect = document.getElementById('pkm-items');
    const runesSelect = document.getElementById('pkm-runes');
    const chipsSelect = document.getElementById('pkm-chips');

    DB.pokemonType.lev2.forEach(type => {
        typesContainer.innerHTML += `<label><input type="checkbox" value="${type.id}"> ${type.name}</label>`;
    });
    DB.definitions.natures.forEach(nature => {
        naturesContainer.innerHTML += `<label><input type="checkbox" value="${nature.id}"> ${nature.name}</label>`;
    });
    Object.values(DB.item.lev3).flat().forEach(itemRef => {
        const itemData = DB.item.lev4[itemRef.id];
        if (itemData) {
            itemsSelect.innerHTML += `<option value="${itemRef.id}">${itemData.name} (${itemData.grade})</option>`;
        }
    });
    DB.runeAndChip.lev3.rune.forEach(runeRef => {
        const runeData = DB.runeAndChip.lev4[runeRef.id];
        if (runeData) {
            runesSelect.innerHTML += `<option value="${runeRef.id}">${runeData.name}</option>`;
        }
    });
    DB.runeAndChip.lev3.chip.forEach(chipRef => {
        const chipData = DB.runeAndChip.lev4[chipRef.id];
        if (chipData) {
            chipsSelect.innerHTML += `<option value="${chipRef.id}">${chipData.name}</option>`;
        }
    });

    // --- 스킬 추가/삭제 기능 (업그레이드) ---
    const skillsContainer = document.getElementById('skills-container');
    const addSkillBtn = document.getElementById('add-skill-btn');
    let skillCount = 0;

    function addSkillRow() {
        skillCount++;
        const skillId = skillCount;
        const skillEntry = document.createElement('div');
        skillEntry.className = 'skill-entry';
        skillEntry.dataset.skillId = skillId;
        skillEntry.innerHTML = `
            <div class="skill-main-inputs">
                <input type="text" placeholder="스킬 이름" name="skill_name_${skillId}">
                <select name="skill_type_${skillId}">
                    <option value="Active">Active</option>
                    <option value="Ultimate">Ultimate</option>
                    <option value="Passive">Passive</option>
                </select>
                <button type="button" class="btn btn-danger btn-small remove-skill-btn">-</button>
            </div>
            <textarea class="skill-desc" placeholder="기본 스킬 설명 (HTML 가능)" name="skill_desc_${skillId}"></textarea>
            <div class="skill-keywords-header">
                키워드 설명 <button type="button" class="btn btn-small add-keyword">+</button>
            </div>
            <div class="keywords-container"></div>
        `;
        skillsContainer.appendChild(skillEntry);
    }

    function addKeywordRow(keywordsContainer) {
        const keywordEntry = document.createElement('div');
        keywordEntry.className = 'keyword-entry';
        keywordEntry.innerHTML = `
            <input type="text" placeholder="키워드 용어 (예: 진기권)" name="keyword_term">
            <textarea placeholder="키워드 상세 설명" name="keyword_desc"></textarea>
            <button type="button" class="btn btn-danger btn-small remove-keyword-btn">-</button>
        `;
        keywordsContainer.appendChild(keywordEntry);
    }
    
    addSkillBtn.addEventListener('click', addSkillRow);

    skillsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-skill-btn')) {
            e.target.closest('.skill-entry').remove();
        }
        if (e.target.classList.contains('add-keyword')) {
            const keywordsContainer = e.target.closest('.skill-entry').querySelector('.keywords-container');
            addKeywordRow(keywordsContainer);
        }
        if (e.target.classList.contains('remove-keyword-btn')) {
            e.target.closest('.keyword-entry').remove();
        }
    });

    // 기본으로 스킬 입력칸 1개 추가
    addSkillRow();
});