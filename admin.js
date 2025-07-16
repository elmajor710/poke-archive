document.addEventListener('DOMContentLoaded', () => {
    if (!window.db) {
        console.error("Firestore 'db' 객체를 찾을 수 없습니다. HTML 파일의 순서를 확인하세요.");
        return;
    }

    // --- 탭 전환 기능 ---
    const adminNav = document.getElementById('admin-nav');
    const tabLinks = document.querySelectorAll('.admin-tab-link');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    if (adminNav) {
        adminNav.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedLink = e.target.closest('.admin-tab-link');
            if (!clickedLink || clickedLink.classList.contains('active')) return;

            const tabId = clickedLink.dataset.tab;

            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            clickedLink.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    }

    // --- 포켓몬 관리 기능 ---
    const pokemonForm = document.getElementById('pokemon-form');
    if (pokemonForm) {
        const pokemonSelectList = document.getElementById('pokemon-select-list');
        const loadPokemonBtn = document.getElementById('load-pokemon-btn');
        const typesContainer = document.getElementById('pkm-types-container');
        const naturesContainer = document.getElementById('pkm-natures-container');
        const itemsSelect = document.getElementById('pkm-items');
        const runesSelect = document.getElementById('pkm-runes');
        const chipsSelect = document.getElementById('pkm-chips');
        const skillsContainer = pokemonForm.querySelector('#skills-container');
        const addSkillBtn = pokemonForm.querySelector('#add-skill-btn');

        function populateDropdowns() {
            if (typesContainer) typesContainer.innerHTML = DB.pokemonType.lev2.map(type => `<label><input type="checkbox" name="types" value="${type.id}"> ${type.name}</label>`).join('');
            if (naturesContainer) naturesContainer.innerHTML = DB.definitions.natures.map(nature => `<label><input type="checkbox" name="natures" value="${nature.id}"> ${nature.name}</label>`).join('');
            if (itemsSelect) {
                const allItems = Object.values(DB.item.lev3).flat();
                itemsSelect.innerHTML = allItems.map(itemRef => `<option value="${itemRef.id}">${itemRef.name} (${DB.item.lev4[itemRef.id]?.grade || 'N/A'})</option>`).join('');
            }
            if (runesSelect) runesSelect.innerHTML = DB.runeAndChip.lev3.rune.map(runeRef => `<option value="${runeRef.id}">${runeRef.name}</option>`).join('');
            if (chipsSelect) chipsSelect.innerHTML = DB.runeAndChip.lev3.chip.map(chipRef => `<option value="${chipRef.id}">${chipRef.name}</option>`).join('');
        }

        async function loadPokemonList() {
            try {
                const snapshot = await db.collection("pokemon").orderBy("name_ko").get();
                pokemonSelectList.innerHTML = '<option value="">-- 포켓몬 선택 --</option>'; 
                snapshot.forEach(doc => {
                    const pokemon = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = pokemon.name_ko || doc.id;
                    pokemonSelectList.appendChild(option);
                });
            } catch (error) { console.error("포켓몬 목록 로딩 오류: ", error); }
        }

        function populateForm(data) {
            pokemonForm.reset();
            if(skillsContainer) skillsContainer.innerHTML = '';
            pokemonForm.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

            pokemonForm.querySelector('#pkm-id').value = data.id || '';
            pokemonForm.querySelector('#pkm-name-ko').value = data.name_ko || '';
            pokemonForm.querySelector('#pkm-name-en').value = data.name_en || '';
            pokemonForm.querySelector('#pkm-grade').value = data.grade || '';
            pokemonForm.querySelector('#pkm-image-url').value = data.imageURL || '';
            pokemonForm.querySelector('#pkm-face-url').value = data.faceImageURL || '';

            data.types?.forEach(id => { pokemonForm.querySelector(`input[name="types"][value="${id}"]`)?.setAttribute('checked', true); });
            data.recommendedNatures?.forEach(id => { pokemonForm.querySelector(`input[name="natures"][value="${id}"]`)?.setAttribute('checked', true); });

            Array.from(itemsSelect.options).forEach(opt => opt.selected = data.recommendedItems?.includes(opt.value));
            Array.from(runesSelect.options).forEach(opt => opt.selected = data.recommendedRunes?.includes(opt.value));
            Array.from(chipsSelect.options).forEach(opt => opt.selected = data.recommendedChips?.includes(opt.value));
            
            if(data.skills && data.skills.length > 0) data.skills.forEach(skill => addSkillRow(skill));
            else addSkillRow();
        }

        let skillCount = 0;
        function addSkillRow(skillData = null) { /* ... 이전과 동일 ... */ }
        function addKeywordRow(container, keywordData = null) { /* ... 이전과 동일 ... */ }
        
        loadPokemonBtn.addEventListener('click', async () => { /* ... 이전과 동일 ... */ });
        addSkillBtn.addEventListener('click', () => addSkillRow());
        skillsContainer.addEventListener('click', e => { /* ... 이전과 동일 ... */ });
        pokemonForm.addEventListener('submit', e => { /* ... 이전과 동일 ... */ });

        populateDropdowns();
        loadPokemonList();
    }


    // --- 팁 & 노하우 관리 기능 ---
    const tipForm = document.getElementById('tip-form');
    if (tipForm) {
        tipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tipId = tipForm.querySelector('#tip-id').value.trim();
            const tipTitle = tipForm.querySelector('#tip-title').value.trim();
            const tipContent = tipForm.querySelector('#tip-content').value.trim();

            if (!tipId || !tipTitle || !tipContent) {
                alert('ID, 제목, 내용을 모두 입력해주세요.');
                return;
            }

            const tipData = {
                id: tipId,
                name: tipTitle,
                htmlContent: tipContent
            };

            db.collection("tips").doc(tipId).set(tipData)
                .then(() => {
                    alert('팁이 성공적으로 저장되었습니다!');
                    tipForm.reset();
                })
                .catch(error => {
                    console.error("팁 저장 오류: ", error);
                    alert('팁 저장 중 오류가 발생했습니다.');
                });
        });
        
        const deleteTipBtn = tipForm.querySelector('.btn-danger');
        deleteTipBtn.addEventListener('click', () => {
             const tipId = tipForm.querySelector('#tip-id').value.trim();
             if (!tipId) {
                 alert('삭제할 팁의 ID를 입력해주세요.');
                 return;
             }
             if (confirm(`정말로 '${tipId}' 팁을 삭제하시겠습니까?`)) {
                 db.collection("tips").doc(tipId).delete()
                    .then(() => {
                        alert('팁이 성공적으로 삭제되었습니다.');
                        tipForm.reset();
                    })
                    .catch(error => {
                        console.error("팁 삭제 오류: ", error);
                        alert('팁 삭제 중 오류가 발생했습니다.');
                    });
             }
        });
    }
});