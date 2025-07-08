document.addEventListener('DOMContentLoaded', () => {
    // Firebase 앱과 Firestore DB를 초기화하는 코드가 admin.html에 이미 있다고 가정합니다.
    // 만약 admin.html에 없다면, 이 아래에 firebase.initializeApp(firebaseConfig) 코드가 있어야 합니다.
    // const db = firebase.firestore(); // admin.html에서 이미 선언되었다고 가정합니다.

    // --- 데이터 동적 로드 ---
    const typesContainer = document.getElementById('pkm-types-container');
    const naturesContainer = document.getElementById('pkm-natures-container');
    const itemsSelect = document.getElementById('pkm-items');
    const runesSelect = document.getElementById('pkm-runes');
    const chipsSelect = document.getElementById('pkm-chips');

    if (typesContainer) {
        DB.pokemonType.lev2.forEach(type => {
            typesContainer.innerHTML += `<label><input type="checkbox" value="${type.id}"> ${type.name}</label>`;
        });
    }

    if (naturesContainer) {
        DB.definitions.natures.forEach(nature => {
            naturesContainer.innerHTML += `<label><input type="checkbox" value="${nature.id}"> ${nature.name}</label>`;
        });
    }

    if (itemsSelect) {
        Object.values(DB.item.lev3).flat().forEach(itemRef => {
            const itemData = DB.item.lev4[itemRef.id];
            if (itemData) {
                itemsSelect.innerHTML += `<option value="${itemRef.id}">${itemData.name} (${itemData.grade})</option>`;
            }
        });
    }

    if (runesSelect) {
        DB.runeAndChip.lev3.rune.forEach(runeRef => {
            const runeData = DB.runeAndChip.lev4[runeRef.id];
            if (runeData) {
                runesSelect.innerHTML += `<option value="${runeRef.id}">${runeData.name}</option>`;
            }
        });
    }

    if (chipsSelect) {
        DB.runeAndChip.lev3.chip.forEach(chipRef => {
            const chipData = DB.runeAndChip.lev4[chipRef.id];
            if (chipData) {
                chipsSelect.innerHTML += `<option value="${chipRef.id}">${chipData.name}</option>`;
            }
        });
    }

    // --- 스킬 추가/삭제 기능 ---
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
    
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', addSkillRow);
    }

    if (skillsContainer) {
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
        addSkillRow();
    }
    
    // --- 저장하기 기능 ---
    const pokemonForm = document.getElementById('pokemon-form');
    if (pokemonForm) {
        pokemonForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const pkmId = document.getElementById('pkm-id').value;
            if (!pkmId) {
                alert('고유 ID를 입력해주세요.');
                return;
            }

            // 1. 모든 스킬 정보 수집
            const skillsData = [];
            document.querySelectorAll('#skills-container .skill-entry').forEach(skillEntry => {
                const keywordsData = [];
                skillEntry.querySelectorAll('.keyword-entry').forEach(keywordEntry => {
                    keywordsData.push({
                        term: keywordEntry.querySelector('[name="keyword_term"]').value,
                        desc: keywordEntry.querySelector('[name="keyword_desc"]').value
                    });
                });

                skillsData.push({
                    name: skillEntry.querySelector('[name^="skill_name"]').value,
                    type: skillEntry.querySelector('[name^="skill_type"]').value,
                    description: skillEntry.querySelector('[name^="skill_desc"]').value,
                    keywords: keywordsData
                });
            });
            
            // 2. 체크박스와 드롭다운에서 선택된 값들을 배열로 수집
            const selectedTypes = Array.from(typesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            const selectedNatures = Array.from(naturesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            const selectedItems = Array.from(itemsSelect.selectedOptions).map(opt => opt.value);
            const selectedRunes = Array.from(runesSelect.selectedOptions).map(opt => opt.value);
            const selectedChips = Array.from(chipsSelect.selectedOptions).map(opt => opt.value);

            // 3. 최종 pokemonData 객체 생성
            const pokemonData = {
                id: pkmId,
                name_ko: document.getElementById('pkm-name-ko').value,
                name_en: document.getElementById('pkm-name-en').value,
                grade: document.getElementById('pkm-grade').value,
                types: selectedTypes,
                imageURL: document.getElementById('pkm-image-url').value,
                faceImageURL: document.getElementById('pkm-face-url').value,
                skills: skillsData,
                recommendedNatures: selectedNatures,
                recommendedItems: selectedItems,
                recommendedRunes: selectedRunes,
                recommendedChips: selectedChips
            };

            console.log("저장될 데이터:", pokemonData);

            // 4. Firestore에 데이터 저장
            db.collection("pokemon").doc(pokemonData.id).set(pokemonData)
                .then(() => {
                    alert("'" + pokemonData.name_ko + "' 정보가 데이터베이스에 성공적으로 저장되었습니다!");
                })
                .catch((error) => {
                    alert("저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
                    console.error("Error writing document: ", error);
                });
        });
    }
});