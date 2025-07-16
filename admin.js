document.addEventListener('DOMContentLoaded', () => {
    if (!window.db) {
        console.error("Firestore 'db' 객체를 찾을 수 없습니다. HTML 파일의 스크립트 순서를 확인하세요.");
        return;
    }

    // --- 탭 전환 기능 ---
    const adminNav = document.getElementById('admin-nav');
    if (adminNav) {
        adminNav.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedLink = e.target.closest('.admin-tab-link');
            if (!clickedLink || clickedLink.classList.contains('active')) return;

            const tabId = clickedLink.dataset.tab;
            
            adminNav.querySelectorAll('.admin-tab-link').forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

            clickedLink.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    }

    // --- 포켓몬 관리 기능 ---
    const pokemonManagementPanel = document.getElementById('pokemon-management');
    if (pokemonManagementPanel) {
        const pokemonForm = pokemonManagementPanel.querySelector('#pokemon-form');
        const pokemonSelectList = pokemonManagementPanel.querySelector('#pokemon-select-list');
        const loadPokemonBtn = pokemonManagementPanel.querySelector('#load-pokemon-btn');
        const typesContainer = pokemonForm.querySelector('#pkm-types-container');
        const naturesContainer = pokemonForm.querySelector('#pkm-natures-container');
        const itemsSelect = pokemonForm.querySelector('#pkm-items');
        const runesSelect = pokemonForm.querySelector('#pkm-runes');
        const chipsSelect = pokemonForm.querySelector('#pkm-chips');
        const skillsContainer = pokemonForm.querySelector('#skills-container');
        const addSkillBtn = pokemonForm.querySelector('#add-skill-btn');
        const deletePokemonBtn = pokemonForm.querySelector('#delete-pokemon-btn');

        function populatePokemonDropdowns() {
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

        function populatePokemonForm(data) {
            pokemonForm.reset();
            if(skillsContainer) skillsContainer.innerHTML = '';
            pokemonForm.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

            pokemonForm.querySelector('#pkm-id').value = data.id || '';
            pokemonForm.querySelector('#pkm-name-ko').value = data.name_ko || '';
            pokemonForm.querySelector('#pkm-name-en').value = data.name_en || '';
            pokemonForm.querySelector('#pkm-grade').value = data.grade || '';
            pokemonForm.querySelector('#pkm-image-url').value = data.imageURL || '';
            pokemonForm.querySelector('#pkm-face-url').value = data.faceImageURL || '';

            data.types?.forEach(id => { const cb = pokemonForm.querySelector(`input[name="types"][value="${id}"]`); if(cb) cb.checked = true; });
            data.recommendedNatures?.forEach(id => { const cb = pokemonForm.querySelector(`input[name="natures"][value="${id}"]`); if(cb) cb.checked = true; });

            Array.from(itemsSelect.options).forEach(opt => opt.selected = data.recommendedItems?.includes(opt.value));
            Array.from(runesSelect.options).forEach(opt => opt.selected = data.recommendedRunes?.includes(opt.value));
            Array.from(chipsSelect.options).forEach(opt => opt.selected = data.recommendedChips?.includes(opt.value));
            
            if(data.skills && data.skills.length > 0) data.skills.forEach(skill => addSkillRow(skill));
            else addSkillRow();
        }

        let skillCount = 0;
        function addSkillRow(skillData = null) {
            skillCount++;
            const skillId = skillCount;
            const skillEntry = document.createElement('div');
            skillEntry.className = 'skill-entry';
            const skillName = skillData?.name || '';
            const skillType = skillData?.type || 'Active';
            const skillDesc = skillData?.description || '';
            skillEntry.innerHTML = `
                <div class="skill-main-inputs">
                    <input type="text" placeholder="스킬 이름" name="skill_name_${skillId}" value="${skillName}">
                    <select name="skill_type_${skillId}">
                        <option value="Active" ${skillType === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Ultimate" ${skillType === 'Ultimate' ? 'selected' : ''}>Ultimate</option>
                        <option value="Passive" ${skillType === 'Passive' ? 'selected' : ''}>Passive</option>
                    </select>
                    <button type="button" class="btn btn-danger btn-small remove-skill-btn">-</button>
                </div>
                <textarea class="skill-desc" placeholder="기본 스킬 설명" name="skill_desc_${skillId}">${skillDesc}</textarea>
                <div class="skill-keywords-header">
                    키워드 설명 <button type="button" class="btn btn-small add-keyword">+</button>
                </div>
                <div class="keywords-container"></div>`;
            skillsContainer.appendChild(skillEntry);
            const keywordsContainer = skillEntry.querySelector('.keywords-container');
            skillData?.keywords?.forEach(kw => addKeywordRow(keywordsContainer, kw));
        }

        function addKeywordRow(container, keywordData = null) {
            const keywordEntry = document.createElement('div');
            keywordEntry.className = 'keyword-entry';
            const term = keywordData?.term || '';
            const desc = keywordData?.desc || '';
            keywordEntry.innerHTML = `
                <input type="text" placeholder="키워드 용어" name="keyword_term" value="${term}">
                <textarea placeholder="키워드 상세 설명" name="keyword_desc">${desc}</textarea>
                <button type="button" class="btn btn-danger btn-small remove-keyword-btn">-</button>`;
            container.appendChild(keywordEntry);
        }
        
        loadPokemonBtn.addEventListener('click', async () => {
            const selectedId = pokemonSelectList.value;
            if (!selectedId) { alert('불러올 포켓몬을 선택해주세요.'); return; }
            try {
                const docRef = db.collection("pokemon").doc(selectedId);
                const doc = await docRef.get();
                if (doc.exists) {
                    populatePokemonForm({ id: doc.id, ...doc.data() });
                    alert(`'${doc.data().name_ko}' 데이터를 불러왔습니다.`);
                } else { alert('해당 ID의 포켓몬 데이터를 찾을 수 없습니다.'); }
            } catch (error) { alert('데이터를 불러오는 중 오류가 발생했습니다.'); console.error("데이터 불러오기 오류: ", error); }
        });
        
        if(deletePokemonBtn) {
            deletePokemonBtn.addEventListener('click', async () => {
                const pkmId = pokemonForm.querySelector('#pkm-id').value.trim();
                if (!pkmId) { alert('삭제할 포켓몬 데이터가 없습니다.'); return; }
                if (confirm(`정말로 '${pkmId}' 포켓몬 데이터를 삭제하시겠습니까?`)) {
                    try {
                        await db.collection("pokemon").doc(pkmId).delete();
                        alert(`'${pkmId}' 데이터가 성공적으로 삭제되었습니다.`);
                        pokemonForm.reset();
                        if(skillsContainer) skillsContainer.innerHTML = '';
                        addSkillRow();
                        loadPokemonList();
                    } catch (error) { alert('삭제 중 오류가 발생했습니다.'); console.error("삭제 오류: ", error); }
                }
            });
        }
        
        if (addSkillBtn) addSkillBtn.addEventListener('click', () => addSkillRow());
        if (skillsContainer) {
            skillsContainer.addEventListener('click', e => {
                if (e.target.classList.contains('remove-skill-btn')) e.target.closest('.skill-entry').remove();
                if (e.target.classList.contains('add-keyword')) addKeywordRow(e.target.closest('.skill-entry').querySelector('.keywords-container'));
                if (e.target.classList.contains('remove-keyword-btn')) e.target.closest('.keyword-entry').remove();
            });
        }
        
        pokemonForm.addEventListener('submit', e => {
            e.preventDefault();
            const pkmId = pokemonForm.querySelector('#pkm-id').value.trim();
            if (!pkmId) { alert('고유 ID를 입력해주세요.'); return; }
            const pokemonData = {
                name_ko: pokemonForm.querySelector('#pkm-name-ko').value,
                name_en: pokemonForm.querySelector('#pkm-name-en').value,
                grade: pokemonForm.querySelector('#pkm-grade').value,
                imageURL: pokemonForm.querySelector('#pkm-image-url').value,
                faceImageURL: pokemonForm.querySelector('#pkm-face-url').value,
                types: Array.from(pokemonForm.querySelectorAll('input[name="types"]:checked')).map(cb => cb.value),
                recommendedNatures: Array.from(pokemonForm.querySelectorAll('input[name="natures"]:checked')).map(cb => cb.value),
                recommendedItems: Array.from(itemsSelect.selectedOptions).map(opt => opt.value),
                recommendedRunes: Array.from(runesSelect.selectedOptions).map(opt => opt.value),
                recommendedChips: Array.from(chipsSelect.selectedOptions).map(opt => opt.value),
                skills: Array.from(skillsContainer.querySelectorAll('.skill-entry')).map(entry => ({
                    name: entry.querySelector('[name^="skill_name"]').value,
                    type: entry.querySelector('[name^="skill_type"]').value,
                    description: entry.querySelector('[name^="skill_desc"]').value,
                    keywords: Array.from(entry.querySelectorAll('.keyword-entry')).map(kwEntry => ({
                        term: kwEntry.querySelector('[name="keyword_term"]').value,
                        desc: kwEntry.querySelector('[name="keyword_desc"]').value
                    }))
                }))
            };
            db.collection("pokemon").doc(pkmId).set(pokemonData)
                .then(() => {
                    alert(`'${pokemonData.name_ko}' 정보가 성공적으로 저장되었습니다!`);
                    if (!Array.from(pokemonSelectList.options).some(opt => opt.value === pkmId)) {
                        loadPokemonList();
                    }
                })
                .catch((error) => {
                    alert("저장 중 오류가 발생했습니다.");
                    console.error("Error writing document: ", error);
                });
        });

        populatePokemonDropdowns();
        loadPokemonList();
        addSkillRow();
    }


    // --- 팁 & 노하우 관리 기능 ---
    const tipManagementPanel = document.getElementById('tips-management');
    if(tipManagementPanel) {
        const tipForm = tipManagementPanel.querySelector('#tip-form');
        const tipSelectList = tipManagementPanel.querySelector('#tip-select-list');
        const loadTipBtn = tipManagementPanel.querySelector('#load-tip-btn');
        
        async function loadTipsList() {
            try {
                const snapshot = await db.collection("tips").orderBy("name").get();
                tipSelectList.innerHTML = '<option value="">-- 팁 선택 --</option>'; 
                snapshot.forEach(doc => {
                    const tip = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = tip.name || doc.id;
                    tipSelectList.appendChild(option);
                });
            } catch (error) { console.error("팁 목록 로딩 오류: ", error); }
        }

        if(loadTipBtn) {
            loadTipBtn.addEventListener('click', async () => {
                const selectedId = tipSelectList.value;
                if (!selectedId) {
                    alert('불러올 팁을 선택해주세요.');
                    return;
                }
                try {
                    const docRef = db.collection("tips").doc(selectedId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        tipForm.querySelector('#tip-id').value = data.id || '';
                        tipForm.querySelector('#tip-title').value = data.name || '';
                        tipForm.querySelector('#tip-content').value = data.htmlContent || '';
                        alert(`'${data.name}' 데이터를 불러왔습니다.`);
                    } else {
                        alert('해당 ID의 팁 데이터를 찾을 수 없습니다.');
                    }
                } catch (error) {
                    alert('데이터를 불러오는 중 오류가 발생했습니다.');
                    console.error("팁 데이터 불러오기 오류: ", error);
                }
            });
        }

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
                    loadTipsList(); 
                })
                .catch(error => {
                    console.error("팁 저장 오류: ", error);
                    alert('팁 저장 중 오류가 발생했습니다.');
                });
        });
        
        const deleteTipBtn = tipForm.querySelector('.btn-danger');
        if(deleteTipBtn) {
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
                            loadTipsList(); 
                        })
                        .catch(error => {
                            console.error("팁 삭제 오류: ", error);
                            alert('팁 삭제 중 오류가 발생했습니다.');
                        });
                 }
            });
        }
        
        loadTipsList();
    }
});