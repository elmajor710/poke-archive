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
        const statInputs = pokemonForm.querySelectorAll('.stat-input');
        const totalStatInput = pokemonForm.querySelector('#pkm-stat-total');

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
            
            if (data.stats) {
                pokemonForm.querySelector('#pkm-stat-hp').value = data.stats.HP || '';
                pokemonForm.querySelector('#pkm-stat-speed').value = data.stats.Speed || '';
                pokemonForm.querySelector('#pkm-stat-patk').value = data.stats['P.ATK'] || '';
                pokemonForm.querySelector('#pkm-stat-pdef').value = data.stats['P.DEF'] || '';
                pokemonForm.querySelector('#pkm-stat-spatk').value = data.stats['SP.ATK'] || '';
                pokemonForm.querySelector('#pkm-stat-spdef').value = data.stats['SP.DEF'] || '';
            } else {
                 statInputs.forEach(input => input.value = '');
            }
            updateTotalStat();

            if(data.skills && data.skills.length > 0) data.skills.forEach(skill => addSkillRow(skill));
            else addSkillRow();
        }
        
        function updateTotalStat() {
            let total = 0;
            statInputs.forEach(input => {
                total += Number(input.value) || 0;
            });
            totalStatInput.value = total;
        }
        
        statInputs.forEach(input => {
            input.addEventListener('input', updateTotalStat);
        });

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
                stats: {
                    HP: Number(pokemonForm.querySelector('#pkm-stat-hp').value) || 0,
                    Speed: Number(pokemonForm.querySelector('#pkm-stat-speed').value) || 0,
                    'P.ATK': Number(pokemonForm.querySelector('#pkm-stat-patk').value) || 0,
                    'P.DEF': Number(pokemonForm.querySelector('#pkm-stat-pdef').value) || 0,
                    'SP.ATK': Number(pokemonForm.querySelector('#pkm-stat-spatk').value) || 0,
                    'SP.DEF': Number(pokemonForm.querySelector('#pkm-stat-spdef').value) || 0,
                },
                skills: Array.from(skillsContainer.querySelectorAll('.skill-entry')).map(entry => ({
                    name: entry.querySelector('[name^="skill_name"]').value,
                    type: entry.querySelector('[name^="skill_type"]').value,
                    description: entry.querySelector('[name^="skill_desc"]').value,
                    keywords: Array.from(entry.querySelectorAll('.keyword-entry')).map(kwEntry => ({
                        term: kwEntry.querySelector('[name="keyword_term"]').value,
                        desc: kwEntry.querySelector('[name="keyword_desc"]').value
                    }))
                })),
                recommendedNatures: Array.from(pokemonForm.querySelectorAll('input[name="natures"]:checked')).map(cb => cb.value),
                recommendedItems: Array.from(itemsSelect.selectedOptions).map(opt => opt.value),
                recommendedRunes: Array.from(runesSelect.selectedOptions).map(opt => opt.value),
                recommendedChips: Array.from(chipsSelect.selectedOptions).map(opt => opt.value)
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
        if(!skillsContainer || skillsContainer.children.length === 0) {
            addSkillRow();
        }
    }


    // --- 아이템 관리 기능 ---
    const itemManagementPanel = document.getElementById('item-management');
    if (itemManagementPanel) {
        const itemForm = itemManagementPanel.querySelector('#item-form');
        const itemSelectList = itemManagementPanel.querySelector('#item-select-list');
        const loadItemBtn = itemManagementPanel.querySelector('#load-item-btn');
        const deleteItemBtn = itemForm.querySelector('#delete-item-btn');

        async function loadItemsList() {
            try {
                const snapshot = await db.collection("items").orderBy("name").get();
                itemSelectList.innerHTML = '<option value="">-- 아이템 선택 --</option>';
                snapshot.forEach(doc => {
                    const item = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = item.name || doc.id;
                    itemSelectList.appendChild(option);
                });
            } catch (error) { console.error("아이템 목록 로딩 오류: ", error); }
        }

        if(loadItemBtn) {
            loadItemBtn.addEventListener('click', async () => {
                const selectedId = itemSelectList.value;
                if (!selectedId) { alert('불러올 아이템을 선택해주세요.'); return; }
                try {
                    const docRef = db.collection("items").doc(selectedId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        itemForm.querySelector('#item-id').value = doc.id || '';
                        itemForm.querySelector('#item-name').value = data.name || '';
                        itemForm.querySelector('#item-grade').value = data.grade || 'Epic';
                        itemForm.querySelector('#item-image-url').value = data.imageURL || '';
                        itemForm.querySelector('#item-description').value = data.description || '';
                        alert(`'${data.name}' 데이터를 불러왔습니다.`);
                    } else { alert('해당 ID의 아이템 데이터를 찾을 수 없습니다.'); }
                } catch (error) { alert('데이터를 불러오는 중 오류가 발생했습니다.'); console.error("아이템 데이터 불러오기 오류: ", error); }
            });
        }

        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const itemId = itemForm.querySelector('#item-id').value.trim();
            if (!itemId) { alert('고유 ID를 입력해주세요.'); return; }

            const itemData = {
                name: itemForm.querySelector('#item-name').value.trim(),
                grade: itemForm.querySelector('#item-grade').value,
                imageURL: itemForm.querySelector('#item-image-url').value.trim(),
                description: itemForm.querySelector('#item-description').value.trim(),
            };

            db.collection("items").doc(itemId).set(itemData, { merge: true })
                .then(() => {
                    alert('아이템이 성공적으로 저장되었습니다!');
                    itemForm.reset();
                    loadItemsList();
                })
                .catch(error => {
                    console.error("아이템 저장 오류: ", error);
                    alert('아이템 저장 중 오류가 발생했습니다.');
                });
        });

        if(deleteItemBtn) {
            deleteItemBtn.addEventListener('click', () => {
                 const itemId = itemForm.querySelector('#item-id').value.trim();
                 if (!itemId) { alert('삭제할 아이템의 ID를 입력해주세요.'); return; }
                 if (confirm(`정말로 '${itemId}' 아이템을 삭제하시겠습니까?`)) {
                     db.collection("items").doc(itemId).delete()
                        .then(() => {
                            alert('아이템이 성공적으로 삭제되었습니다.');
                            itemForm.reset();
                            loadItemsList(); 
                        })
                        .catch(error => { console.error("아이템 삭제 오류: ", error); });
                 }
            });
        }
        
        loadItemsList();
    }

    // --- 룬&칩 관리 기능 ---
    const runeChipManagementPanel = document.getElementById('rune-chip-management');
    if (runeChipManagementPanel) {
        const runeChipForm = runeChipManagementPanel.querySelector('#rune-chip-form');
        const rcSelectList = runeChipManagementPanel.querySelector('#rc-select-list');
        const loadRcBtn = runeChipManagementPanel.querySelector('#load-rc-btn');
        const deleteRcBtn = runeChipForm.querySelector('#delete-rc-btn');

        async function loadRuneChipList() {
            try {
                const snapshot = await db.collection("runeAndChips").orderBy("name").get();
                rcSelectList.innerHTML = '<option value="">-- 룬/칩 선택 --</option>';
                snapshot.forEach(doc => {
                    const rc = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = rc.name || doc.id;
                    rcSelectList.appendChild(option);
                });
            } catch (error) { console.error("룬/칩 목록 로딩 오류: ", error); }
        }
        
        if(loadRcBtn) {
            loadRcBtn.addEventListener('click', async () => {
                const selectedId = rcSelectList.value;
                if (!selectedId) { alert('불러올 룬/칩을 선택해주세요.'); return; }
                try {
                    const docRef = db.collection("runeAndChips").doc(selectedId);
                    const doc = await docRef.get();
                    if (doc.exists) {
                        const data = doc.data();
                        runeChipForm.querySelector('#rc-id').value = doc.id || '';
                        runeChipForm.querySelector('#rc-name').value = data.name || '';
                        runeChipForm.querySelector('#rc-type').value = data.type || 'rune';
                        runeChipForm.querySelector('#rc-image-url').value = data.imageURL || '';
                        runeChipForm.querySelector('#rc-description').value = data.description || '';
                        alert(`'${data.name}' 데이터를 불러왔습니다.`);
                    } else { alert('해당 ID의 룬/칩 데이터를 찾을 수 없습니다.'); }
                } catch (error) { alert('데이터를 불러오는 중 오류가 발생했습니다.'); console.error("룬/칩 데이터 불러오기 오류: ", error); }
            });
        }

        runeChipForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rcId = runeChipForm.querySelector('#rc-id').value.trim();
            if (!rcId) { alert('고유 ID를 입력해주세요.'); return; }

            const runeChipData = {
                name: runeChipForm.querySelector('#rc-name').value.trim(),
                type: runeChipForm.querySelector('#rc-type').value,
                imageURL: runeChipForm.querySelector('#rc-image-url').value.trim(),
                description: runeChipForm.querySelector('#rc-description').value.trim(),
            };

            db.collection("runeAndChips").doc(rcId).set(runeChipData, { merge: true })
                .then(() => {
                    alert('룬/칩이 성공적으로 저장되었습니다!');
                    runeChipForm.reset();
                    loadRuneChipList();
                })
                .catch(error => {
                    console.error("룬/칩 저장 오류: ", error);
                    alert('룬/칩 저장 중 오류가 발생했습니다.');
                });
        });
        
        if(deleteRcBtn) {
            deleteRcBtn.addEventListener('click', () => {
                 const rcId = runeChipForm.querySelector('#rc-id').value.trim();
                 if (!rcId) { alert('삭제할 룬/칩의 ID를 입력해주세요.'); return; }
                 if (confirm(`정말로 '${rcId}' 룬/칩을 삭제하시겠습니까?`)) {
                     db.collection("runeAndChips").doc(rcId).delete()
                        .then(() => {
                            alert('룬/칩이 성공적으로 삭제되었습니다.');
                            runeChipForm.reset();
                            loadRuneChipList(); 
                        })
                        .catch(error => { console.error("룬/칩 삭제 오류: ", error); });
                 }
            });
        }

        loadRuneChipList();
    }

    // --- 팁 & 노하우 관리 기능 ---
    const tipManagementPanel = document.getElementById('tips-management');
    if(tipManagementPanel) {
        const tipForm = tipManagementPanel.querySelector('#tip-form');
        const tipSelectList = tipManagementPanel.querySelector('#tip-select-list');
        const loadTipBtn = tipManagementPanel.querySelector('#load-tip-btn');
        const deleteTipBtn = tipForm.querySelector('#delete-tip-btn');

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
        // --- 캘린더 관리 기능 ---
    const calendarManagementPanel = document.getElementById('calendar-management');
    if (calendarManagementPanel) {
        const calendarForm = calendarManagementPanel.querySelector('#calendar-form');
        const eventSelectList = calendarManagementPanel.querySelector('#event-select-list');
        const loadEventBtn = calendarManagementPanel.querySelector('#load-event-btn');
        const deleteEventBtn = calendarForm.querySelector('#delete-event-btn');
        const generateEventIdBtn = calendarForm.querySelector('#generate-event-id-btn');

        // Firestore 'events' 컬렉션에서 데이터 목록을 불러와 드롭다운에 채웁니다.
        async function loadEventsList() {
            try {
                const snapshot = await db.collection("events").orderBy("startDate", "desc").get();
                eventSelectList.innerHTML = '<option value="">-- 이벤트 선택 --</option>';
                snapshot.forEach(doc => {
                    const event = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = `${event.title} (${doc.id})`;
                    eventSelectList.appendChild(option);
                });
            } catch (error) {
                console.error("이벤트 목록 로딩 오류: ", error);
                alert("이벤트 목록을 불러오는 데 실패했습니다.");
            }
        }

        // Firestore 타임스탬프를 'YYYY-MM-DD' 형식의 문자열로 변환합니다.
        function formatDate(timestamp) {
            if (!timestamp) return '';
            const date = timestamp.toDate();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // 불러오기 버튼 클릭 이벤트
        loadEventBtn.addEventListener('click', async () => {
            const selectedId = eventSelectList.value;
            if (!selectedId) return alert('불러올 이벤트를 선택해주세요.');
            try {
                const docRef = db.collection("events").doc(selectedId);
                const doc = await docRef.get();
                if (doc.exists) {
                    const data = doc.data();
                    calendarForm.querySelector('#event-id').value = doc.id;
                    calendarForm.querySelector('#event-title').value = data.title || '';
                    calendarForm.querySelector('#event-type').value = data.type || 'ranking';
                    calendarForm.querySelector('#event-description').value = data.description || '';
                    calendarForm.querySelector('#event-start-date').value = formatDate(data.startDate);
                    calendarForm.querySelector('#event-end-date').value = formatDate(data.endDate);
                    alert(`'${data.title}' 데이터를 불러왔습니다.`);
                }
            } catch (error) {
                console.error("이벤트 데이터 불러오기 오류: ", error);
                alert("이벤트 데이터를 불러오는 데 실패했습니다.");
            }
        });

        // ID 자동생성 버튼 클릭 이벤트
        generateEventIdBtn.addEventListener('click', () => {
            const type = calendarForm.querySelector('#event-type').value;
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            calendarForm.querySelector('#event-id').value = `${type}_${date}_${Math.random().toString(36).substr(2, 5)}`;
        });
        
        // 저장 버튼 클릭 이벤트 (폼 제출)
        calendarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const eventId = calendarForm.querySelector('#event-id').value.trim();
            if (!eventId) return alert('고유 ID를 입력하거나 자동생성해주세요.');

            const startDate = new Date(calendarForm.querySelector('#event-start-date').value);
            const endDate = new Date(calendarForm.querySelector('#event-end-date').value);
            const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

            const eventData = {
                title: calendarForm.querySelector('#event-title').value.trim(),
                type: calendarForm.querySelector('#event-type').value,
                description: calendarForm.querySelector('#event-description').value.trim(),
                // 날짜를 Firestore Timestamp 형식으로 변환하여 저장
                startDate: firebase.firestore.Timestamp.fromDate(startDate),
                endDate: firebase.firestore.Timestamp.fromDate(endDate),
                // index.html 호환성을 위해 기존 필드명도 유지
                date: calendarForm.querySelector('#event-start-date').value,
                duration: duration > 0 ? duration : 1,
            };

            db.collection("events").doc(eventId).set(eventData)
                .then(() => {
                    alert('이벤트가 성공적으로 저장되었습니다!');
                    calendarForm.reset();
                    loadEventsList();
                })
                .catch(error => {
                    console.error("이벤트 저장 오류: ", error);
                    alert('이벤트 저장 중 오류가 발생했습니다.');
                });
        });

        // 삭제 버튼 클릭 이벤트
        deleteEventBtn.addEventListener('click', () => {
            const eventId = calendarForm.querySelector('#event-id').value.trim();
            if (!eventId) return alert('삭제할 이벤트가 없습니다.');
            if (confirm(`정말로 '${eventId}' 이벤트를 삭제하시겠습니까?`)) {
                db.collection("events").doc(eventId).delete()
                    .then(() => {
                        alert('이벤트가 성공적으로 삭제되었습니다.');
                        calendarForm.reset();
                        loadEventsList();
                    })
                    .catch(error => {
                        console.error("이벤트 삭제 오류: ", error);
                        alert('이벤트 삭제 중 오류가 발생했습니다.');
                    });
            }
        });
        
        // 페이지 로드 시 이벤트 목록 즉시 로딩
        loadEventsList();
    }
        loadTipsList();
    }
});

// --- 추천 덱 관리 기능 ---
    const deckManagementPanel = document.getElementById('deck-management');
    if (deckManagementPanel) {
        const deckForm = deckManagementPanel.querySelector('#deck-form');
        const deckSelectList = deckManagementPanel.querySelector('#deck-select-list');
        const loadDeckBtn = deckManagementPanel.querySelector('#load-deck-btn');
        const deleteDeckBtn = deckForm.querySelector('#delete-deck-btn');
        const pokemonSelects = deckForm.querySelectorAll('.deck-pokemon-select');
        const visualSlots = deckForm.querySelectorAll('.deck-vis-slot');

        // 모든 포켓몬 목록을 가져와서 드롭다운(<select>)에 채웁니다.
        function populatePokemonSelectors() {
            // script.js 에서 이미 모든 포켓몬 정보를 DB.pokemonType.lev4에 로드했습니다.
            const allPokemon = Object.values(DB.pokemonType.lev4).sort((a, b) => a.name_ko.localeCompare(b.name_ko));
            
            pokemonSelects.forEach(select => {
                // 기존 옵션 초기화 (맨 처음 '선택' 옵션은 제외)
                select.innerHTML = '<option value="">선택</option>';
                allPokemon.forEach(pkm => {
                    const option = document.createElement('option');
                    option.value = pkm.id;
                    option.textContent = pkm.name_ko;
                    select.appendChild(option);
                });
            });
        }
        
        // 드롭다운 선택이 변경될 때 시각적 배치도를 업데이트합니다.
        pokemonSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const selectedPkmId = e.target.value;
                const role = e.target.dataset.role;
                const position = e.target.dataset.position;
                
                const targetSlot = deckManagementPanel.querySelector(`.deck-vis-slot[data-role="${role}"][data-position="${position}"]`);
                if (!targetSlot) return;

                if (selectedPkmId) {
                    const pkmData = DB.pokemonType.lev4[selectedPkmId];
                    targetSlot.innerHTML = `<img src="${pkmData.faceImageURL}" alt="${pkmData.name_ko}" data-pokemon-id="${selectedPkmId}">`;
                } else {
                    const originalText = (role === 'main' ? (position < 4 ? 'VAN ' : 'REAR ') : 'AST ') + position;
                    targetSlot.innerHTML = originalText;
                }
            });
        });
        
        // 시각적 배치도의 포켓몬 클릭 시 정보 팝업을 띄웁니다.
        deckManagementPanel.querySelector('.deck-vis-grid').addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                const pkmId = e.target.dataset.pokemonId;
                const pkmData = DB.pokemonType.lev4[pkmId];
                if (pkmData) {
                    const types = pkmData.types.map(typeId => DB.pokemonType.lev2.find(t => t.id === typeId).name).join(', ');
                    alert(`이름: ${pkmData.name_ko}\n타입: ${types}`);
                }
            }
        });

        // 저장된 추천 덱 목록을 불러옵니다.
        async function loadDecksList() {
            try {
                const snapshot = await db.collection("recommendedDecks").get();
                deckSelectList.innerHTML = '<option value="">-- 추천 덱 선택 --</option>';
                snapshot.forEach(doc => {
                    const deck = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = deck.name || doc.id;
                    deckSelectList.appendChild(option);
                });
            } catch (error) { console.error("덱 목록 로딩 오류: ", error); }
        }

        // 불러오기 버튼 클릭 이벤트
        loadDeckBtn.addEventListener('click', async () => {
            const selectedId = deckSelectList.value;
            if (!selectedId) return alert('불러올 덱을 선택해주세요.');

            const doc = await db.collection("recommendedDecks").doc(selectedId).get();
            if (doc.exists) {
                const data = doc.data();
                deckForm.querySelector('#deck-id').value = doc.id;
                deckForm.querySelector('#deck-name').value = data.name || '';
                deckForm.querySelector('#deck-description').value = data.description || '';
                
                // 모든 드롭다운과 시각적 슬롯 초기화
                pokemonSelects.forEach(s => s.value = '');
                visualSlots.forEach(slot => {
                    const role = slot.dataset.role;
                    const position = slot.dataset.position;
                    const originalText = (role === 'main' ? (position < 4 ? 'VAN ' : 'REAR ') : 'AST ') + position;
                    slot.innerHTML = originalText;
                });

                // 불러온 데이터로 채우기
                (data.composition || []).forEach(member => {
                    const { role, position, pokemonId } = member;
                    const select = deckForm.querySelector(`.deck-pokemon-select[data-role="${role}"][data-position="${position}"]`);
                    if (select) {
                        select.value = pokemonId;
                        // 수동으로 change 이벤트를 발생시켜 시각적 슬롯도 업데이트
                        select.dispatchEvent(new Event('change'));
                    }
                });
                alert(`'${data.name}' 덱을 불러왔습니다.`);
            }
        });

        // 폼 제출 (저장) 이벤트
        deckForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const deckId = deckForm.querySelector('#deck-id').value.trim();
            if (!deckId) return alert('덱 고유 ID를 입력해주세요.');

            const composition = [];
            pokemonSelects.forEach(select => {
                if (select.value) {
                    composition.push({
                        role: select.dataset.role,
                        position: parseInt(select.dataset.position, 10),
                        pokemonId: select.value
                    });
                }
            });

            const deckData = {
                id: deckId,
                name: deckForm.querySelector('#deck-name').value.trim(),
                description: deckForm.querySelector('#deck-description').value.trim(),
                composition: composition
            };
            
            db.collection("recommendedDecks").doc(deckId).set(deckData)
                .then(() => {
                    alert('추천 덱이 성공적으로 저장되었습니다!');
                    deckForm.reset();
                    pokemonSelects.forEach(s => s.dispatchEvent(new Event('change'))); // 시각적 슬롯 리셋
                    loadDecksList();
                })
                .catch(error => console.error("덱 저장 오류: ", error));
        });

        // 삭제 버튼 이벤트
        deleteDeckBtn.addEventListener('click', () => {
            const deckId = deckForm.querySelector('#deck-id').value.trim();
            if (!deckId) return alert('삭제할 덱이 없습니다.');
            if (confirm(`정말로 '${deckId}' 덱을 삭제하시겠습니까?`)) {
                db.collection("recommendedDecks").doc(deckId).delete()
                    .then(() => {
                        alert('덱이 성공적으로 삭제되었습니다.');
                        deckForm.reset();
                        pokemonSelects.forEach(s => s.dispatchEvent(new Event('change')));
                        loadDecksList();
                    });
            }
        });
        
        // 초기화
        populatePokemonSelectors();
        loadDecksList();
    }