document.addEventListener('DOMContentLoaded', () => {
    // 타입, 성격, 아이템, 룬, 칩 데이터 동적 로드
    const typesContainer = document.getElementById('pkm-types-container');
    const naturesContainer = document.getElementById('pkm-natures-container');
    const itemsSelect = document.getElementById('pkm-items');
    const runesSelect = document.getElementById('pkm-runes');
    const chipsSelect = document.getElementById('pkm-chips');

    // 타입 체크박스 생성
    DB.pokemonType.lev2.forEach(type => {
        typesContainer.innerHTML += `<label><input type="checkbox" value="${type.id}"> ${type.name}</label>`;
    });

    // 성격 체크박스 생성
    DB.definitions.natures.forEach(nature => {
        naturesContainer.innerHTML += `<label><input type="checkbox" value="${nature.id}"> ${nature.name}</label>`;
    });

    // 아이템 드롭다운 생성
    Object.values(DB.item.lev3).flat().forEach(itemRef => {
        const itemData = DB.item.lev4[itemRef.id];
        if (itemData) {
            itemsSelect.innerHTML += `<option value="${itemRef.id}">${itemData.name} (${itemData.grade})</option>`;
        }
    });

    // 룬 드롭다운 생성
    DB.runeAndChip.lev3.rune.forEach(runeRef => {
        const runeData = DB.runeAndChip.lev4[runeRef.id];
        if (runeData) {
            runesSelect.innerHTML += `<option value="${runeRef.id}">${runeData.name}</option>`;
        }
    });

    // 칩 드롭다운 생성
    DB.runeAndChip.lev3.chip.forEach(chipRef => {
        const chipData = DB.runeAndChip.lev4[chipRef.id];
        if (chipData) {
            chipsSelect.innerHTML += `<option value="${chipRef.id}">${chipData.name}</option>`;
        }
    });


    // 스킬 추가/삭제 기능
    const skillsContainer = document.getElementById('skills-container');
    const addSkillBtn = document.getElementById('add-skill-btn');

    let skillCount = 0;

    function addSkillRow() {
        skillCount++;
        const skillEntry = document.createElement('div');
        skillEntry.className = 'skill-entry';
        skillEntry.innerHTML = `
            <input type="text" placeholder="스킬 이름" name="skill_name_${skillCount}">
            <select name="skill_type_${skillCount}">
                <option value="Active">Active</option>
                <option value="Ultimate">Ultimate</option>
                <option value="Passive">Passive</option>
            </select>
            <textarea placeholder="스킬 설명 (HTML 가능)" name="skill_desc_${skillCount}"></textarea>
            <button type="button" class="btn btn-danger btn-small remove-skill-btn">-</button>
        `;
        skillsContainer.appendChild(skillEntry);
    }

    addSkillBtn.addEventListener('click', addSkillRow);

    skillsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-skill-btn')) {
            e.target.parentElement.remove();
        }
    });

    // 기본으로 스킬 입력칸 1개 추가
    addSkillRow();
});