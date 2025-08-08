document.addEventListener('DOMContentLoaded', () => {
    if (!window.db || !window.auth) {
        console.error("Firestore 'db' 또는 Auth 'auth' 객체를 찾을 수 없습니다.");
        return;
    }

    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const loginErrorMessage = document.getElementById('login-error-message');
    const logoutBtn = document.getElementById('logout-btn');

    // --- 로그인 상태 감지 ---
    auth.onAuthStateChanged(user => {
        if (user) {
            loginContainer.style.display = 'none';
            adminContainer.style.display = 'flex';
            initializeAdminPanel(); 
        } else {
            loginContainer.style.display = 'flex';
            adminContainer.style.display = 'none';
        }
    });

    // --- 로그인 폼 제출 이벤트 ---
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            loginErrorMessage.textContent = '';

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    console.log('로그인 성공:', userCredential.user);
                })
                .catch(error => {
                    console.error('로그인 오류:', error);
                    loginErrorMessage.textContent = '이메일 또는 비밀번호가 잘못되었습니다.';
                });
        });
    }

    // --- 로그아웃 버튼 클릭 이벤트 ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                console.log('로그아웃 성공');
            }).catch(error => {
                console.error('로그아웃 오류:', error);
            });
        });
    }

    let isPanelInitialized = false;
    async function initializeAdminPanel() {
        if (isPanelInitialized) return; 

        // 여기에 기존 admin.js의 모든 코드가 들어갑니다.
        // 데이터 초기화부터 각 패널별 이벤트 리스너까지 모두 포함됩니다.
        try {
            await initializeAdminData();
            setupTabSwitching();
            setupPokemonManagement();
            setupItemManagement();
            setupRuneChipManagement();
            setupTipsManagement();
            setupCalendarManagement();
            setupDeckManagement();
            isPanelInitialized = true; 
            console.log('관리자 패널 초기화 완료');
        } catch (error) {
            console.error("관리자 패널 초기화 중 심각한 오류 발생:", error);
            alert("관리자 패널을 초기화하는 데 실패했습니다. 콘솔을 확인해주세요.");
        }
    }

    async function initializeAdminData() {
        // 이 함수는 DB 객체에서 데이터를 불러와 채우는 역할을 합니다.
        // (기존 코드와 동일)
        const collections = ['pokemon', 'items', 'runeAndChips', 'tips', 'events', 'recommendedDecks'];
        const promises = collections.map(col => db.collection(col).get());
        const [pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, eventsSnapshot, decksSnapshot] = await Promise.all(promises);
        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => { dataMap[doc.id] = { id: doc.id, ...doc.data() }; });
            return dataMap;
        };
        const eventsToArray = (snapshot) => {
            const dataArray = [];
            snapshot.forEach(doc => { dataArray.push({ id: doc.id, ...doc.data() }); });
            return dataArray;
        }
        DB.pokemonType.lev4 = snapshotToMap(pokemonSnapshot);
        DB.item.lev4 = snapshotToMap(itemsSnapshot);
        DB.runeAndChip.lev4 = snapshotToMap(runeAndChipsSnapshot);
        DB.tips.lev3 = snapshotToMap(tipsSnapshot);
        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name }));
        DB.calendar.lev2.events = eventsToArray(eventsSnapshot);
        DB.deck.lev4 = snapshotToMap(decksSnapshot);
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));
        const itemGrades = { god: [], legendary: [], epic: [] };
        Object.entries(DB.item.lev4).forEach(([itemId, item]) => {
            const gradeKey = item.grade?.toLowerCase();
            if (itemGrades[gradeKey]) { itemGrades[gradeKey].push({ id: itemId, name: item.name }); }
        });
        DB.item.lev3 = itemGrades;
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.entries(DB.runeAndChip.lev4).forEach(([rcId, rc]) => {
            if(rc.type && runeAndChipTypes[rc.type]) {
                runeAndChipTypes[rc.type].push({ id: rcId, name: rc.name });
            }
        });
        DB.runeAndChip.lev3 = runeAndChipTypes;
    }

    function setupTabSwitching() {
        const adminNav = document.getElementById('admin-nav');
        if (adminNav) {
            adminNav.addEventListener('click', (e) => {
                e.preventDefault();
                const clickedLink = e.target.closest('.admin-tab-link');
                if (!clickedLink) return;
                const currentlyActive = adminNav.querySelector('.admin-tab-link.active');
                if(currentlyActive) currentlyActive.classList.remove('active');
                const currentContent = document.querySelector('.admin-tab-content.active');
                if(currentContent) currentContent.classList.remove('active');
                clickedLink.classList.add('active');
                const tabId = clickedLink.dataset.tab;
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        }
    }

    function setupPokemonManagement() {
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
                    allItems.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                    itemsSelect.innerHTML = allItems.map(itemRef => `<option value="${itemRef.id}">${itemRef.name} (${DB.item.lev4[itemRef.id]?.grade || 'N/A'})</option>`).join('');
                }
                if (runesSelect) {
                    const allRunes = DB.runeAndChip.lev3.rune;
                    allRunes.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                    runesSelect.innerHTML = allRunes.map(runeRef => `<option value="${runeRef.id}">${runeRef.name}</option>`).join('');
                }
                if (chipsSelect) {
                    const allChips = DB.runeAndChip.lev3.chip;
                    allChips.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
                    chipsSelect.innerHTML = allChips.map(chipRef => `<option value="${chipRef.id}">${chipRef.name}</option>`).join('');
                }
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
                pokemonForm.querySelector('#pkm-build-concept').value = data.build_concept || '';
                pokemonForm.querySelector('#pkm-name-ko').value = data.name_ko || '';
                pokemonForm.querySelector('#pkm-name-en').value = data.name_en || '';
                pokemonForm.querySelector('#pkm-grade').value = data.grade || '';
                pokemonForm.querySelector('#pkm-image-url').value = data.imageURL || '';
                pokemonForm.querySelector('#pkm-face-url').value = data.faceImageURL || '';
                
                // ▼▼▼ 공개 여부 체크박스 상태를 설정하는 코드 추가 ▼▼▼
                pokemonForm.querySelector('#pkm-is-published').checked = data.isPublished === true;
                // ▲▲▲ 여기까지 ▲▲▲

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
                    build_concept: pokemonForm.querySelector('#pkm-build-concept').value,
                    
                    // 공개 여부 값을 저장하는 코드 추가
                    isPublished: pokemonForm.querySelector('#pkm-is-published').checked,

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
                        alert("저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
                        console.error("Error writing document: ", error);
                    });
            });

            populatePokemonDropdowns();
            loadPokemonList();
            if(!skillsContainer || skillsContainer.children.length === 0) {
                addSkillRow();
            }
        }
    }

    function setupItemManagement() {
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
                            
                            // ▼▼▼ 공개 여부 체크박스 상태를 설정하는 코드 추가 ▼▼▼
                            itemForm.querySelector('#item-is-published').checked = data.isPublished === true;
                            // ▲▲▲ 여기까지 ▲▲▲

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
                    
                    // ▼▼▼ 공개 여부 값을 저장하는 코드 추가 ▼▼▼
                    isPublished: itemForm.querySelector('#item-is-published').checked,
                    // ▲▲▲ 여기까지 ▲▲▲
                };
                db.collection("items").doc(itemId).set(itemData, { merge: true })
                    .then(() => {
                        alert('아이템이 성공적으로 저장되었습니다!');
                        itemForm.reset();
                        loadItemsList();
                    })
                    .catch(error => {
                        console.error("아이템 저장 오류: ", error);
                        alert('아이템 저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
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
    }

    function setupRuneChipManagement() {
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

                            // ▼▼▼ 공개 여부 체크박스 상태를 설정하는 코드 추가 ▼▼▼
                            runeChipForm.querySelector('#rc-is-published').checked = data.isPublished === true;
                            // ▲▲▲ 여기까지 ▲▲▲

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

                    // ▼▼▼ 공개 여부 값을 저장하는 코드 추가 ▼▼▼
                    isPublished: runeChipForm.querySelector('#rc-is-published').checked,
                    // ▲▲▲ 여기까지 ▲▲▲
                };

                db.collection("runeAndChips").doc(rcId).set(runeChipData, { merge: true })
                    .then(() => {
                        alert('룬/칩이 성공적으로 저장되었습니다!');
                        runeChipForm.reset();
                        loadRuneChipList();
                    })
                    .catch(error => {
                        console.error("룬/칩 저장 오류: ", error);
                        alert('룬/칩 저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
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
    }

    function setupTipsManagement() {
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
                            
                            // ▼▼▼ 공개 여부 체크박스 상태를 설정하는 코드 추가 ▼▼▼
                            tipForm.querySelector('#tip-is-published').checked = data.isPublished === true;
                            // ▲▲▲ 여기까지 ▲▲▲

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
                    htmlContent: tipContent,

                    // ▼▼▼ 공개 여부 값을 저장하는 코드 추가 ▼▼▼
                    isPublished: tipForm.querySelector('#tip-is-published').checked
                    // ▲▲▲ 여기까지 ▲▲▲
                };

                db.collection("tips").doc(tipId).set(tipData)
                    .then(() => {
                        alert('팁이 성공적으로 저장되었습니다!');
                        tipForm.reset();
                        loadTipsList(); 
                    })
                    .catch(error => {
                        console.error("팁 저장 오류: ", error);
                        alert('팁 저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
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
            loadTipsList();
        }
    }
    
    function setupCalendarManagement() {
        const calendarManagementPanel = document.getElementById('calendar-management');
        if (calendarManagementPanel) {
            const calendarForm = calendarManagementPanel.querySelector('#calendar-form');
            const eventSelectList = calendarManagementPanel.querySelector('#event-select-list');
            const loadEventBtn = calendarManagementPanel.querySelector('#load-event-btn');
            const deleteEventBtn = calendarForm.querySelector('#delete-event-btn');
            const generateEventIdBtn = calendarForm.querySelector('#generate-event-id-btn');
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
            function formatDate(timestamp) {
                if (!timestamp) return '';
                const date = timestamp.toDate();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
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
            generateEventIdBtn.addEventListener('click', () => {
                const type = calendarForm.querySelector('#event-type').value;
                const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                calendarForm.querySelector('#event-id').value = `${type}_${date}_${Math.random().toString(36).substr(2, 5)}`;
            });
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
                    startDate: firebase.firestore.Timestamp.fromDate(startDate),
                    endDate: firebase.firestore.Timestamp.fromDate(endDate),
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
                        alert('이벤트 저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
                    });
            });
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
            loadEventsList();
        }
    }
    
    function setupDeckManagement() {
        const deckManagementPanel = document.getElementById('deck-management');
        if (deckManagementPanel) {
            const deckForm = deckManagementPanel.querySelector('#deck-form');
            const deckSelectList = deckManagementPanel.querySelector('#deck-select-list');
            const loadDeckBtn = deckManagementPanel.querySelector('#load-deck-btn');
            const deleteDeckBtn = deckForm.querySelector('#delete-deck-btn');
            const pokemonSelects = deckForm.querySelectorAll('.deck-pokemon-select');
            const weatherSelect = deckForm.querySelector('#deck-weather');
            const synergyDisplay = deckForm.querySelector('#deck-synergy-display');
            function calculateSynergy(pokemonIds) {
                if (!DB.synergyEffects || !pokemonIds || pokemonIds.length === 0) return null;
                const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
                if (mainPokemon.some(pkm => !pkm)) { return null; }
                const typePokemonCount = {};
                mainPokemon.forEach(pkm => {
                    if (pkm && pkm.types) {
                        pkm.types.forEach(type => {
                            typePokemonCount[type] = (typePokemonCount[type] || 0) + 1;
                        });
                    }
                });
                const counts = Object.values(typePokemonCount).sort((a, b) => b - a);
                const totalUniqueTypes = Object.keys(typePokemonCount).length;
                const totalPairs = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
                if (counts.length > 0 && counts[0] >= 6) { return DB.synergyEffects.find(s => s.id === 'same6'); }
                if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) { return DB.synergyEffects.find(s => s.id === 'same3x2'); }
                if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) { return DB.synergyEffects.find(s => s.id === 'same4_2'); }
                if (totalPairs >= 3) { return DB.synergyEffects.find(s => s.id === 'same2x3'); }
                if (counts.length > 0 && counts[0] >= 3) { return DB.synergyEffects.find(s => s.id === 'same3'); }
                if (totalUniqueTypes >= 6 && pokemonIds.length >= 6) { return DB.synergyEffects.find(s => s.id === 'diff6'); }
                return null;
            }
            function updateSynergyDisplay() {
                const mainPokemonIds = [];
                pokemonSelects.forEach(select => {
                    if (select.dataset.role === 'main' && select.value) {
                        mainPokemonIds.push(select.value);
                    }
                });
                const synergy = calculateSynergy(mainPokemonIds);
                if (synergy) {
                    synergyDisplay.innerHTML = `<img src="${synergy.imageURL}" style="width:30px; height:30px; object-fit:contain; margin-right: 10px;"> <strong>${synergy.name}</strong>`;
                } else {
                    synergyDisplay.innerHTML = `<span>메인 포켓몬 6마리를 선택하면 자동 계산됩니다.</span>`;
                }
            }
            pokemonSelects.forEach(select => {
                if (select.dataset.role === 'main') {
                    select.addEventListener('change', updateSynergyDisplay);
                }
            });
            function populateDeckPokemonSelectors() {
                const pokemonList = Object.values(DB.pokemonType.lev4);
                pokemonList.sort((a, b) => (a.name_ko || '').localeCompare(b.name_ko || '', 'ko'));
                const optionsHTML = pokemonList.map(pkm => `<option value="${pkm.id}">${pkm.name_ko}</option>`).join('');
                pokemonSelects.forEach(select => {
                    const currentValue = select.value;
                    select.innerHTML = '<option value="">-- 포켓몬 선택 --</option>' + optionsHTML;
                    select.value = currentValue;
                });
            }
            async function loadDecksList() {
                try {
                    const snapshot = await db.collection("recommendedDecks").orderBy("name").get();
                    deckSelectList.innerHTML = '<option value="">-- 추천 덱 선택 --</option>';
                    snapshot.forEach(doc => {
                        const deck = doc.data();
                        const option = document.createElement('option');
                        option.value = doc.id;
                        option.textContent = deck.name || doc.id;
                        deckSelectList.appendChild(option);
                    });
                } catch (error) { console.error("추천 덱 목록 로딩 오류: ", error); }
            }
            loadDeckBtn.addEventListener('click', async () => {
                const selectedId = deckSelectList.value;
                if (!selectedId) { alert('불러올 덱을 선택해주세요.'); return; }
                try {
                    const doc = await db.collection("recommendedDecks").doc(selectedId).get();
                    if (doc.exists) {
                        const data = doc.data();
                        deckForm.reset();
                        pokemonSelects.forEach(select => select.value = '');
                        deckForm.querySelector('#deck-id').value = doc.id;
                        deckForm.querySelector('#deck-name').value = data.name || '';
                        deckForm.querySelector('#deck-description').value = data.description || '';
                        if (data.composition) {
                            data.composition.forEach(member => {
                                const selector = `.deck-pokemon-select[data-role="${member.role}"][data-position="${member.position}"]`;
                                const selectEl = deckForm.querySelector(selector);
                                if (selectEl) {
                                    selectEl.value = member.pokemonId;
                                }
                            });
                        }
                        weatherSelect.value = data.weather || '';
                        updateSynergyDisplay();
                        alert(`'${data.name}' 데이터를 불러왔습니다.`);
                    }
                } catch (error) { console.error("덱 데이터 로딩 오류: ", error); alert("덱 데이터 로딩 중 오류가 발생했습니다."); }
            });
            deckForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const deckId = deckForm.querySelector('#deck-id').value.trim();
                if (!deckId) { alert('덱 고유 ID를 입력해주세요.'); return; }
                const composition = [];
                pokemonSelects.forEach(select => {
                    if (select.value) {
                        composition.push({
                            role: select.dataset.role,
                            position: parseInt(select.dataset.position),
                            pokemonId: select.value
                        });
                    }
                });
                const deckData = {
                    name: deckForm.querySelector('#deck-name').value.trim(),
                    description: deckForm.querySelector('#deck-description').value.trim(),
                    weather: weatherSelect.value,
                    composition: composition
                };
                try {
                    await db.collection("recommendedDecks").doc(deckId).set(deckData);
                    alert('추천 덱이 성공적으로 저장되었습니다!');
                    deckForm.reset();
                    updateSynergyDisplay();
                    loadDecksList();
                } catch (error) { 
                    alert('덱 저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
                    console.error("덱 저장 오류: ", error); 
                }
            });
            deleteDeckBtn.addEventListener('click', async () => {
                const deckId = deckForm.querySelector('#deck-id').value.trim();
                if (!deckId) { alert('삭제할 덱 데이터가 없습니다.'); return; }
                if (confirm(`정말로 '${deckId}' 덱을 삭제하시겠습니까?`)) {
                    try {
                        await db.collection("recommendedDecks").doc(deckId).delete();
                        alert('덱이 성공적으로 삭제되었습니다.');
                        deckForm.reset();
                        updateSynergyDisplay();
                        loadDecksList();
                    } catch (error) { 
                        alert('덱 삭제 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
                        console.error("덱 삭제 오류: ", error); 
                    }
                }
            });
            populateDeckPokemonSelectors();
            loadDecksList();
            updateSynergyDisplay();
        }
    }
});