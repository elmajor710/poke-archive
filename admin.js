document.addEventListener('DOMContentLoaded', () => {
    // ▼▼▼ [1. 추가] 에디터 초기화 함수 ▼▼▼
    function initializeEditor() {
        tinymce.init({
            selector: '#notice-content, #tip-content', // 에디터를 적용할 textarea의 ID
            plugins: 'lists link image table code help wordcount',
            toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist | code | help'
        });
    }
    // ▲▲▲ [1. 추가] 여기까지 ▲▲▲
    if (!window.db || !window.auth) {
        console.error("Firebase 객체를 찾을 수 없습니다.");
        alert("Firebase가 로드되지 않았습니다.");
        return;
    }

    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

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

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMessage = document.getElementById('login-error-message');
        errorMessage.textContent = '';
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                errorMessage.textContent = '이메일 또는 비밀번호가 잘못되었습니다.';
            });
    });

    logoutBtn.addEventListener('click', () => auth.signOut());

    let isPanelInitialized = false;
    async function initializeAdminPanel() {
        if (isPanelInitialized) return;
        isPanelInitialized = true;

        try {
            await initializeAdminData();
            
            setupTabSwitching();
            setupPublishManagement();
            setupPokemonManagement();
            setupItemManagement();
            setupRuneChipManagement();
            setupNoticeManagement();
            setupTipsManagement();
            setupCalendarManagement();
            setupDeckManagement();
            // ▼▼▼ [2. 추가] 에디터 실행 코드 ▼▼▼
        initializeEditor();
        // ▲▲▲ [2. 추가] 여기까지 ▲▲▲
            
            console.log("관리자 패널이 모든 데이터를 준비하고 초기화되었습니다.");
        } catch (error) {
            console.error("관리자 패널 초기화 중 오류:", error);
            alert("관리자 패널 초기화에 실패했습니다.");
        }
    }

    async function initializeAdminData() {
        console.log("initializeAdminData: Firestore에서 모든 데이터 로딩 시작...");
        const collections = ['pokemon', 'items', 'runeAndChips', 'notice', 'tips', 'events', 'recommendedDecks'];
        const promises = collections.map(col => db.collection(col).get());
        const [pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, noticeSnapshot, tipsSnapshot, eventsSnapshot, decksSnapshot] = await Promise.all(promises);

        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => { dataMap[doc.id] = { id: doc.id, ...doc.data() }; });
            return dataMap;
        };
        
        DB.pokemonType.lev4 = snapshotToMap(pokemonSnapshot);
        DB.item.lev4 = snapshotToMap(itemsSnapshot);
        DB.runeAndChip.lev4 = snapshotToMap(runeAndChipsSnapshot);
        DB.notice.lev3 = snapshotToMap(noticeSnapshot);
        DB.tips.lev3 = snapshotToMap(tipsSnapshot);
        DB.deck.lev4 = snapshotToMap(decksSnapshot);
        DB.calendar.lev2.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const itemGrades = { god: [], legendary: [], epic: [] };
        Object.values(DB.item.lev4).forEach(item => {
            const gradeKey = item.grade?.toLowerCase();
            if (itemGrades[gradeKey]) itemGrades[gradeKey].push({ id: item.id, name: item.name });
        });
        DB.item.lev3 = itemGrades;
        
        const runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(rc => {
            if(rc.type && runeAndChipTypes[rc.type]) runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name });
        });
        DB.runeAndChip.lev3 = runeAndChipTypes;

        DB.notice.lev2 = Object.values(DB.notice.lev3).map(data => ({ id: data.id, name: data.name || data.title }));
        DB.tips.lev2 = Object.values(DB.tips.lev3).map(data => ({ id: data.id, name: data.name || data.title }));
        DB.deck.lev3.recommended = Object.values(DB.deck.lev4).map(deck => ({ id: deck.id, name: deck.name }));

        console.log("initializeAdminData: 모든 Firestore 데이터를 전역 DB 객체에 로드 완료.");
    }

    async function saveDataWithTimestamp(collectionName, docId, data) {
        const docRef = db.collection(collectionName).doc(docId);
        const doc = await docRef.get();

        const dataToSave = {
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!doc.exists) {
            dataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            if (['recommendedDecks'].includes(collectionName)) {
                dataToSave.likeCount = 0;
            }
        }

        await docRef.set(dataToSave, { merge: true });
    }


    function setupTabSwitching() {
        const adminNav = document.getElementById('admin-nav');
        adminNav.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedLink = e.target.closest('.admin-tab-link');
            if (!clickedLink) return;
            adminNav.querySelector('.admin-tab-link.active')?.classList.remove('active');
            document.querySelector('.admin-tab-content.active')?.classList.remove('active');
            clickedLink.classList.add('active');
            const tabId = clickedLink.dataset.tab;
            document.getElementById(tabId)?.classList.add('active');
        });
    }

    function setupPublishManagement() {
        const panel = document.getElementById('publish-management');
        if (!panel) return;
        const draftsContainer = panel.querySelector('#drafts-container');
        const publishBtn = panel.querySelector('#publish-selected-btn');
        const reloadBtn = panel.querySelector('#reload-drafts-btn');
        const selectAllCheckbox = panel.querySelector('#select-all-drafts');

        const collectionNames = {
            pokemon: "포켓몬", items: "아이템", runeAndChips: "룬&칩",
            notice: "공지사항", tips: "팁&노하우", recommendedDecks: "추천 덱"
        };
        
        async function loadDrafts() {
            if(!draftsContainer) return;
            draftsContainer.innerHTML = '<h4><br>🔄 초안 데이터를 불러오는 중...</h4>';
            let allDraftsHTML = '';
            for (const col of Object.keys(collectionNames)) {
                try {
                    const snapshot = await db.collection(col).where("isPublished", "==", false).get();
                    if (!snapshot.empty) {
                        let categoryHTML = `<div class="draft-category"><h3>${collectionNames[col]}</h3><div class="draft-list">`;
                        const items = [];
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            items.push({ id: doc.id, name: data.name_ko || data.name || data.title || doc.id });
                        });
                        items.sort((a,b)=> (a.name || '').localeCompare(b.name || '', 'ko'));
                        items.forEach(item => {
                             categoryHTML += `<label class="draft-item"><input type="checkbox" class="draft-checkbox" data-collection="${col}" data-id="${item.id}"><span class="draft-item-name">${item.name}</span><span class="draft-item-id">${item.id}</span></label>`;
                        });
                        categoryHTML += `</div></div>`;
                        allDraftsHTML += categoryHTML;
                    }
                } catch (e) { console.error(`'${col}' 컬렉션 초안 로딩 오류:`, e); }
            }
            draftsContainer.innerHTML = allDraftsHTML || '<h4><br>✔️ 비공개 상태인 데이터가 없습니다.</h4>';
        }

        publishBtn.addEventListener('click', async () => {
            const selectedItems = draftsContainer.querySelectorAll('.draft-checkbox:checked');
            if (selectedItems.length === 0) return alert('게시할 항목을 선택해주세요.');
            if (!confirm(`선택한 ${selectedItems.length}개의 항목을 공개하시겠습니까?`)) return;
            const batch = db.batch();
            selectedItems.forEach(item => {
                const { collection, id } = item.dataset;
                batch.update(db.collection(collection).doc(id), { isPublished: true });
            });
            try {
                await batch.commit();
                alert('성공적으로 공개 처리되었습니다.');
                loadDrafts();
                selectAllCheckbox.checked = false;
            } catch (error) { console.error('일괄 공개 오류:', error); }
        });

        reloadBtn.addEventListener('click', () => {
            loadDrafts();
            selectAllCheckbox.checked = false;
        });
        
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const allDraftCheckboxes = draftsContainer.querySelectorAll('.draft-checkbox');
            
            allDraftCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
        
        if (panel.classList.contains('active')) loadDrafts();
    }
    
    function setupPokemonManagement() {
        const form = document.getElementById('pokemon-form');
        const selectList = document.getElementById('pokemon-select-list');
        const loadBtn = document.getElementById('load-pokemon-btn');
        const deleteBtn = document.getElementById('delete-pokemon-btn');
        
        const typesContainer = form.querySelector('#pkm-types-container');
        const naturesContainer = form.querySelector('#pkm-natures-container');
        const itemsSelect = form.querySelector('#pkm-items-select');
        
        const runesSourceSelect = form.querySelector('#pkm-runes-source-select');
        const addRuneBtn = form.querySelector('#add-rune-btn');
        const runesContainer = form.querySelector('#pkm-runes-container');

        const chipsSourceSelect = form.querySelector('#pkm-chips-source-select');
        const addChipBtn = form.querySelector('#add-chip-btn');
        const chipsContainer = form.querySelector('#pkm-chips-container');
        
        const skillsContainer = form.querySelector('#skills-container');
        const addSkillBtn = form.querySelector('#add-skill-btn');
        const statInputs = form.querySelectorAll('.stat-input');
        const totalStatInput = form.querySelector('#pkm-stat-total');

        function populateSubDropdowns() {
            typesContainer.innerHTML = DB.pokemonType.lev2.map(type => `<label><input type="checkbox" name="types" value="${type.id}"> ${type.name}</label>`).join('');
            naturesContainer.innerHTML = DB.definitions.natures.map(nature => `<label><input type="checkbox" name="natures" value="${nature.id}"> ${nature.name}</label>`).join('');
            
            const allItems = Object.values(DB.item.lev4).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
            itemsSelect.innerHTML = allItems.map(item => `<option value="${item.id}">${item.name} (${item.id})</option>`).join('');

            const allRunes = Object.values(DB.runeAndChip.lev4).filter(rc => rc.type === 'rune').sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
            runesSourceSelect.innerHTML = '<option value="">-- 룬 선택 --</option>' + allRunes.map(rune => `<option value="${rune.id}">${rune.name}</option>`).join('');

            const allChips = Object.values(DB.runeAndChip.lev4).filter(rc => rc.type === 'chip').sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
            chipsSourceSelect.innerHTML = '<option value="">-- 칩 선택 --</option>' + allChips.map(chip => `<option value="${chip.id}">${chip.name}</option>`).join('');
        }

        function loadPokemonList() {
            const pokemons = Object.values(DB.pokemonType.lev4);
            pokemons.sort((a,b)=>(a.name_ko || '').localeCompare(b.name_ko || '', 'ko'));
            selectList.innerHTML = '<option value="">-- 포켓몬 선택 --</option>';
            pokemons.forEach(pkm => {
                selectList.innerHTML += `<option value="${pkm.id}">${pkm.name_ko || pkm.id}</option>`;
            });
        }

        function addRecommendItem(container, id, name, count = 1) {
            if (container.querySelector(`[data-id="${id}"]`)) {
                alert('이미 추가된 항목입니다.');
                return;
            }
            const itemElement = document.createElement('div');
            itemElement.className = 'recommend-item-entry';
            itemElement.dataset.id = id;
            itemElement.innerHTML = `
                <span class="item-name">${name}</span>
                <input type="number" class="item-count" value="${count}" min="1" max="99">
                <button type="button" class="btn btn-danger btn-small remove-item-btn">×</button>
            `;
            container.appendChild(itemElement);
        }
        
        loadBtn.addEventListener('click', () => {
            const selectedId = selectList.value;
            if (!selectedId) { alert('불러올 포켓몬을 선택해주세요.'); return; }
            const data = DB.pokemonType.lev4[selectedId];
            if (!data) { alert('선택한 포켓몬 데이터를 찾을 수 없습니다.'); return; }
            
            form.reset();
            skillsContainer.innerHTML = '';
            runesContainer.innerHTML = '';
            chipsContainer.innerHTML = '';

            form.querySelector('#pkm-id').value = data.id || '';
            form.querySelector('#pkm-name-ko').value = data.name_ko || '';
            form.querySelector('#pkm-name-en').value = data.name_en || '';
            form.querySelector('#pkm-grade').value = data.grade || 'S';
            form.querySelector('#pkm-is-published').checked = data.isPublished === true;
            form.querySelector('#pkm-image-url').value = data.imageURL || '';
            form.querySelector('#pkm-face-url').value = data.faceImageURL || '';
            form.querySelector('#pkm-build-concept').value = data.build_concept || '';

            data.types?.forEach(id => { const cb = form.querySelector(`input[name="types"][value="${id}"]`); if(cb) cb.checked = true; });
            data.recommendedNatures?.forEach(id => { const cb = form.querySelector(`input[name="natures"][value="${id}"]`); if(cb) cb.checked = true; });
            
            Array.from(itemsSelect.options).forEach(opt => opt.selected = data.recommendedItems?.includes(opt.value));
            
            data.recommendedRunes?.forEach(item => {
                const runeData = DB.runeAndChip.lev4[item.id];
                if(runeData) addRecommendItem(runesContainer, item.id, runeData.name, item.count);
            });
            data.recommendedChips?.forEach(item => {
                const chipData = DB.runeAndChip.lev4[item.id];
                if(chipData) addRecommendItem(chipsContainer, item.id, chipData.name, item.count);
            });

            if (data.stats) {
                form.querySelector('#pkm-stat-hp').value = data.stats.HP || 0;
                form.querySelector('#pkm-stat-speed').value = data.stats.Speed || 0;
                form.querySelector('#pkm-stat-patk').value = data.stats['P.ATK'] || 0;
                form.querySelector('#pkm-stat-pdef').value = data.stats['P.DEF'] || 0;
                form.querySelector('#pkm-stat-spatk').value = data.stats['SP.ATK'] || 0;
                form.querySelector('#pkm-stat-spdef').value = data.stats['SP.DEF'] || 0;
            }
            updateTotalStat();
            
            if(data.skills && data.skills.length > 0) data.skills.forEach(skill => addSkillRow(skill));
            else addSkillRow();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const pkmId = form.querySelector('#pkm-id').value.trim();
            if (!pkmId) { alert('고유 ID를 입력해주세요.'); return; }
            
            const pokemonData = {
                name_ko: form.querySelector('#pkm-name-ko').value,
                name_en: form.querySelector('#pkm-name-en').value,
                grade: form.querySelector('#pkm-grade').value,
                isPublished: form.querySelector('#pkm-is-published').checked,
                imageURL: form.querySelector('#pkm-image-url').value,
                faceImageURL: form.querySelector('#pkm-face-url').value,
                build_concept: form.querySelector('#pkm-build-concept').value,
                types: Array.from(form.querySelectorAll('input[name="types"]:checked')).map(cb => cb.value),
                stats: {
                    HP: Number(form.querySelector('#pkm-stat-hp').value) || 0,
                    Speed: Number(form.querySelector('#pkm-stat-speed').value) || 0,
                    'P.ATK': Number(form.querySelector('#pkm-stat-patk').value) || 0,
                    'P.DEF': Number(form.querySelector('#pkm-stat-pdef').value) || 0,
                    'SP.ATK': Number(form.querySelector('#pkm-stat-spatk').value) || 0,
                    'SP.DEF': Number(form.querySelector('#pkm-stat-spdef').value) || 0,
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
                recommendedNatures: Array.from(form.querySelectorAll('input[name="natures"]:checked')).map(cb => cb.value),
                recommendedItems: Array.from(itemsSelect.selectedOptions).map(opt => opt.value),
                recommendedRunes: Array.from(runesContainer.querySelectorAll('.recommend-item-entry')).map(entry => ({
                    id: entry.dataset.id,
                    count: parseInt(entry.querySelector('.item-count').value) || 1
                })),
                recommendedChips: Array.from(chipsContainer.querySelectorAll('.recommend-item-entry')).map(entry => ({
                    id: entry.dataset.id,
                    count: parseInt(entry.querySelector('.item-count').value) || 1
                }))
            };
            
            await saveDataWithTimestamp("pokemon", pkmId, pokemonData);
            alert(`'${pokemonData.name_ko}' 정보가 성공적으로 저장되었습니다!`);
            await initializeAdminData();
            loadPokemonList();
        });
        
        deleteBtn.addEventListener('click', async () => {
            const pkmId = form.querySelector('#pkm-id').value.trim();
            if (!pkmId) return;
            if (confirm(`정말로 '${pkmId}' 포켓몬 데이터를 삭제하시겠습니까?`)) {
                await db.collection("pokemon").doc(pkmId).delete();
                alert(`'${pkmId}' 데이터가 성공적으로 삭제되었습니다.`);
                form.reset();
                skillsContainer.innerHTML = '';
                runesContainer.innerHTML = '';
                chipsContainer.innerHTML = '';
                addSkillRow();
                await initializeAdminData();
                loadPokemonList();
            }
        });

        addRuneBtn.addEventListener('click', () => {
            const selectedId = runesSourceSelect.value;
            if (selectedId) {
                const selectedName = runesSourceSelect.options[runesSourceSelect.selectedIndex].text;
                addRecommendItem(runesContainer, selectedId, selectedName);
            }
        });
        addChipBtn.addEventListener('click', () => {
            const selectedId = chipsSourceSelect.value;
            if (selectedId) {
                const selectedName = chipsSourceSelect.options[chipsSourceSelect.selectedIndex].text;
                addRecommendItem(chipsContainer, selectedId, selectedName);
            }
        });

        runesContainer.addEventListener('click', e => {
            if (e.target.classList.contains('remove-item-btn')) {
                e.target.closest('.recommend-item-entry').remove();
            }
        });
        chipsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('remove-item-btn')) {
                e.target.closest('.recommend-item-entry').remove();
            }
        });
        
        let skillCount = 0;
        function addSkillRow(skillData = {}) {
            skillCount++;
            const skillEntry = document.createElement('div');
            skillEntry.className = 'skill-entry';
            skillEntry.innerHTML = `
                <div class="skill-main-inputs">
                    <input type="text" placeholder="스킬 이름" name="skill_name_${skillCount}" value="${skillData.name || ''}">
                    <select name="skill_type_${skillCount}">
                        <option value="Active" ${skillData.type === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Ultimate" ${skillData.type === 'Ultimate' ? 'selected' : ''}>Ultimate</option>
                        <option value="Passive" ${skillData.type === 'Passive' ? 'selected' : ''}>Passive</option>
                    </select>
                    <button type="button" class="btn btn-danger btn-small remove-skill-btn">-</button>
                </div>
                <textarea class="skill-desc" placeholder="기본 스킬 설명" name="skill_desc_${skillCount}">${skillData.description || ''}</textarea>
                <div class="skill-keywords-header">
                    키워드 설명 <button type="button" class="btn btn-small add-keyword">+</button>
                </div>
                <div class="keywords-container"></div>`;
            skillsContainer.appendChild(skillEntry);
            const keywordsContainer = skillEntry.querySelector('.keywords-container');
            skillData.keywords?.forEach(kw => addKeywordRow(keywordsContainer, kw));
        }

        function addKeywordRow(container, keywordData = {}) {
            const keywordEntry = document.createElement('div');
            keywordEntry.className = 'keyword-entry';
            keywordEntry.innerHTML = `
                <input type="text" placeholder="키워드 용어" name="keyword_term" value="${keywordData.term || ''}">
                <textarea placeholder="키워드 상세 설명" name="keyword_desc">${keywordData.desc || ''}</textarea>
                <button type="button" class="btn btn-danger btn-small remove-keyword-btn">-</button>`;
            container.appendChild(keywordEntry);
        }
        function updateTotalStat() {
            let total = 0;
            statInputs.forEach(input => { total += Number(input.value) || 0; });
            totalStatInput.value = total;
        }
        statInputs.forEach(input => input.addEventListener('input', updateTotalStat));
        addSkillBtn.addEventListener('click', () => addSkillRow());
        skillsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('remove-skill-btn')) e.target.closest('.skill-entry').remove();
            if (e.target.classList.contains('add-keyword')) addKeywordRow(e.target.closest('.skill-entry').querySelector('.keywords-container'));
            if (e.target.classList.contains('remove-keyword-btn')) e.target.closest('.keyword-entry').remove();
        });

        populateSubDropdowns();
        loadPokemonList();
        addSkillRow();
    }
    
    function setupItemManagement() {
        const form = document.getElementById('item-form');
        const selectList = document.getElementById('item-select-list');
        const loadBtn = document.getElementById('load-item-btn');
        const deleteBtn = document.getElementById('delete-item-btn');
        
        function loadItemList() {
            const items = Object.values(DB.item.lev4);
            items.sort((a,b)=>(a.name || '').localeCompare(b.name || '', 'ko'));
            selectList.innerHTML = '<option value="">-- 아이템 선택 --</option>';
            items.forEach(item => {
                selectList.innerHTML += `<option value="${item.id}">${item.name || item.id}</option>`;
            });
        }

        loadBtn.addEventListener('click', () => {
            const data = DB.item.lev4[selectList.value];
            if(!data) return;
            form.querySelector('#item-id').value = data.id || '';
            form.querySelector('#item-name').value = data.name || '';
            form.querySelector('#item-grade').value = data.grade || 'Epic';
            form.querySelector('#item-image-url').value = data.imageURL || '';
            form.querySelector('#item-description').value = data.description || '';
            form.querySelector('#item-is-published').checked = data.isPublished === true;
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itemId = form.querySelector('#item-id').value.trim();
            if (!itemId) return;
            const itemData = {
                name: form.querySelector('#item-name').value,
                grade: form.querySelector('#item-grade').value,
                imageURL: form.querySelector('#item-image-url').value,
                description: form.querySelector('#item-description').value,
                isPublished: form.querySelector('#item-is-published').checked,
            };
            await saveDataWithTimestamp("items", itemId, itemData);
            alert('저장 완료');
            form.reset();
            await initializeAdminData();
            loadItemList();
        });

        deleteBtn.addEventListener('click', async () => {
            const itemId = form.querySelector('#item-id').value.trim();
            if (!itemId) return;
            if (confirm(`'${itemId}' 아이템을 삭제하시겠습니까?`)) {
                await db.collection("items").doc(itemId).delete();
                alert('삭제 완료');
                form.reset();
                await initializeAdminData();
                loadItemList();
            }
        });

        loadItemList();
    }
    
    function setupRuneChipManagement() {
        const form = document.getElementById('rune-chip-form');
        const selectList = document.getElementById('rc-select-list');
        const loadBtn = document.getElementById('load-rc-btn');
        const deleteBtn = document.getElementById('delete-rc-btn');
        
        function loadRuneChipList() {
            const items = Object.values(DB.runeAndChip.lev4);
            items.sort((a,b)=>(a.name || '').localeCompare(b.name || '', 'ko'));
            selectList.innerHTML = '<option value="">-- 룬/칩 선택 --</option>';
            items.forEach(item => {
                selectList.innerHTML += `<option value="${item.id}">${item.name || item.id}</option>`;
            });
        }

        loadBtn.addEventListener('click', () => {
            const data = DB.runeAndChip.lev4[selectList.value];
            if(!data) return;
            form.querySelector('#rc-id').value = data.id || '';
            form.querySelector('#rc-name').value = data.name || '';
            form.querySelector('#rc-type').value = data.type || 'rune';
            form.querySelector('#rc-image-url').value = data.imageURL || '';
            form.querySelector('#rc-description').value = data.description || '';
            form.querySelector('#rc-is-published').checked = data.isPublished === true;
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rcId = form.querySelector('#rc-id').value.trim();
            if (!rcId) return;
            const rcData = {
                name: form.querySelector('#rc-name').value,
                type: form.querySelector('#rc-type').value,
                imageURL: form.querySelector('#rc-image-url').value,
                description: form.querySelector('#rc-description').value,
                isPublished: form.querySelector('#rc-is-published').checked,
            };
            await saveDataWithTimestamp("runeAndChips", rcId, rcData);
            alert('저장 완료');
            form.reset();
            await initializeAdminData();
            loadRuneChipList();
        });

        deleteBtn.addEventListener('click', async () => {
            const rcId = form.querySelector('#rc-id').value.trim();
            if (!rcId) return;
            if (confirm(`'${rcId}' 룬/칩을 삭제하시겠습니까?`)) {
                await db.collection("runeAndChips").doc(rcId).delete();
                alert('삭제 완료');
                form.reset();
                await initializeAdminData();
                loadRuneChipList();
            }
        });

        loadRuneChipList();
    }

    function setupNoticeManagement() {
        const form = document.getElementById('notice-form');
        const selectList = document.getElementById('notice-select-list');
        const loadBtn = document.getElementById('load-notice-btn');
        const deleteBtn = document.getElementById('delete-notice-btn');
        const generateIdBtn = document.getElementById('generate-notice-id-btn');
        
        function loadNoticesList() {
            const items = Object.values(DB.notice.lev3);
            items.sort((a,b)=>(a.title || '').localeCompare(b.title || '', 'ko'));
            selectList.innerHTML = '<option value="">-- 공지 선택 --</option>';
            items.forEach(item => {
                selectList.innerHTML += `<option value="${item.id}">${item.title || item.id}</option>`;
            });
        }

        // [5. 교체] 공지사항 불러오기 로직
loadBtn.addEventListener('click', () => {
    const data = DB.notice.lev3[selectList.value];
    if(!data) return;
    form.querySelector('#notice-id').value = data.id || '';
    form.querySelector('#notice-title').value = data.title || '';
    tinymce.get('notice-content').setContent(data.htmlContent || ''); // 에디터에 내용 채우기
    form.querySelector('#notice-is-published').checked = data.isPublished === true;
});
        
        generateIdBtn.addEventListener('click', () => {
            const title = form.querySelector('#notice-title').value.trim().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomStr = Math.random().toString(36).substr(2, 5);
            
            const newId = title ? `notice-${title.substring(0, 20)}-${randomStr}` : `notice-${date}-${randomStr}`;
            form.querySelector('#notice-id').value = newId;
        });

        // [3. 교체] 공지사항 저장 로직
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const noticeId = form.querySelector('#notice-id').value.trim();
    if (!noticeId) {
        alert('고유 ID를 입력하거나 자동생성 버튼을 눌러주세요.');
        return;
    }

    const noticeData = {
        title: form.querySelector('#notice-title').value,
        htmlContent: tinymce.get('notice-content').getContent(), // 에디터 내용 가져오기
        isPublished: form.querySelector('#notice-is-published').checked,
    };

    await saveDataWithTimestamp("notice", noticeId, noticeData);
    alert('저장 완료');
    form.reset();
    tinymce.get('notice-content').setContent(''); // 에디터 내용 비우기
    await initializeAdminData();
    loadNoticesList();
});

        deleteBtn.addEventListener('click', async () => {
            const noticeId = form.querySelector('#notice-id').value.trim();
            if (!noticeId) return;
            if (confirm(`'${noticeId}' 공지를 삭제하시겠습니까?`)) {
                await db.collection("notice").doc(noticeId).delete();
                alert('삭제 완료');
                form.reset();
                await initializeAdminData();
                loadNoticesList();
            }
        });

        loadNoticesList();
    }

    function setupTipsManagement() {
        const form = document.getElementById('tip-form');
        const selectList = document.getElementById('tip-select-list');
        const loadBtn = document.getElementById('load-tip-btn');
        const deleteBtn = document.getElementById('delete-tip-btn');
        const generateIdBtn = document.getElementById('generate-tip-id-btn');
        
        function loadTipsList() {
            const items = Object.values(DB.tips.lev3);
            items.sort((a,b)=>(a.name || a.title || '').localeCompare(b.name || b.title || '', 'ko'));
            selectList.innerHTML = '<option value="">-- 팁 선택 --</option>';
            items.forEach(item => {
                selectList.innerHTML += `<option value="${item.id}">${item.name || item.title || item.id}</option>`;
            });
        }

        // [6. 교체] 팁&노하우 불러오기 로직
loadBtn.addEventListener('click', () => {
    const data = DB.tips.lev3[selectList.value];
    if(!data) return;
    form.querySelector('#tip-id').value = data.id || '';
    form.querySelector('#tip-title').value = data.name || data.title || '';
    tinymce.get('tip-content').setContent(data.htmlContent || ''); // 에디터에 내용 채우기
    form.querySelector('#tip-is-published').checked = data.isPublished === true;
});
        
        generateIdBtn.addEventListener('click', () => {
            const title = form.querySelector('#tip-title').value.trim().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomStr = Math.random().toString(36).substr(2, 5);
            
            const newId = title ? `tip-${title.substring(0, 20)}-${randomStr}` : `tip-${date}-${randomStr}`;
            form.querySelector('#tip-id').value = newId;
        });

        // [4. 교체] 팁&노하우 저장 로직
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tipId = form.querySelector('#tip-id').value.trim();
    if (!tipId) {
        alert('고유 ID를 입력하거나 자동생성 버튼을 눌러주세요.');
        return;
    }
    const tipData = {
        name: form.querySelector('#tip-title').value,
        title: form.querySelector('#tip-title').value,
        htmlContent: tinymce.get('tip-content').getContent(), // 에디터 내용 가져오기
        isPublished: form.querySelector('#tip-is-published').checked,
    };
    await saveDataWithTimestamp("tips", tipId, tipData);
    alert('저장 완료');
    form.reset();
    tinymce.get('tip-content').setContent(''); // 에디터 내용 비우기
    await initializeAdminData();
    loadTipsList();
});

        deleteBtn.addEventListener('click', async () => {
            const tipId = form.querySelector('#tip-id').value.trim();
            if (!tipId) return;
            if (confirm(`'${tipId}' 팁을 삭제하시겠습니까?`)) {
                await db.collection("tips").doc(tipId).delete();
                alert('삭제 완료');
                form.reset();
                await initializeAdminData();
                loadTipsList();
            }
        });

        loadTipsList();
    }

    function setupCalendarManagement() {
        const form = document.getElementById('calendar-form');
        const selectList = document.getElementById('event-select-list');
        const loadBtn = document.getElementById('load-event-btn');
        const deleteBtn = document.getElementById('delete-event-btn');
        const generateIdBtn = document.getElementById('generate-event-id-btn');
        
        async function loadEventsList() {
            const snapshot = await db.collection("events").orderBy("startDate", "desc").get();
            selectList.innerHTML = '<option value="">-- 이벤트 선택 --</option>';
            snapshot.forEach(doc => {
                const event = doc.data();
                selectList.innerHTML += `<option value="${doc.id}">${event.title} (${doc.id})</option>`;
            });
        }

        function formatDate(timestamp) {
            if (!timestamp) return '';
            const date = timestamp.toDate();
            return date.toISOString().split('T')[0];
        }

        loadBtn.addEventListener('click', async () => {
    const selectedId = selectList.value;
    if(!selectedId) return;
    const doc = await db.collection("events").doc(selectedId).get();
    if (doc.exists) {
        const data = doc.data();
        form.querySelector('#event-id').value = doc.id;
        form.querySelector('#event-title').value = data.title || '';
        form.querySelector('#event-type').value = data.type || 'ranking';
        form.querySelector('#event-description').value = data.description || '';
        form.querySelector('#event-start-date').value = formatDate(data.startDate);
        form.querySelector('#event-end-date').value = formatDate(data.endDate);
        form.querySelector('#event-is-published').checked = data.isPublished === true;
    }
});

        generateIdBtn.addEventListener('click', () => {
            const type = form.querySelector('#event-type').value;
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            form.querySelector('#event-id').value = `${type}_${date}_${Math.random().toString(36).substr(2, 5)}`;
        });
        
        form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = form.querySelector('#event-id').value.trim();
    if (!eventId) return;
    const startDate = new Date(form.querySelector('#event-start-date').value);
    const endDate = new Date(form.querySelector('#event-end-date').value);
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    const eventData = {
        title: form.querySelector('#event-title').value,
        type: form.querySelector('#event-type').value,
        description: form.querySelector('#event-description').value,
        startDate: firebase.firestore.Timestamp.fromDate(startDate),
        endDate: firebase.firestore.Timestamp.fromDate(endDate),
        date: form.querySelector('#event-start-date').value,
        duration: duration > 0 ? duration : 1,
        isPublished: form.querySelector('#event-is-published').checked,
    };
    await db.collection("events").doc(eventId).set(eventData, { merge: true });
    alert('이벤트 저장 완료');
    form.reset();
    loadEventsList();
});

        deleteBtn.addEventListener('click', async () => {
            const eventId = form.querySelector('#event-id').value.trim();
            if (!eventId) return;
            if (confirm(`'${eventId}' 이벤트를 삭제하시겠습니까?`)) {
                await db.collection("events").doc(eventId).delete();
                alert('이벤트 삭제 완료');
                form.reset();
                loadEventsList();
            }
        });
        
        loadEventsList();
    }

    function setupDeckManagement() {
    const form = document.getElementById('deck-form');
    const selectList = document.getElementById('deck-select-list');
    const loadBtn = document.getElementById('load-deck-btn');
    const deleteBtn = document.getElementById('delete-deck-btn');
    const pokemonSelects = form.querySelectorAll('.deck-pokemon-select');
    const weatherSelect = form.querySelector('#deck-weather'); 
    const synergyDisplay = form.querySelector('#deck-synergy-display');

    function populateDeckPokemonSelectors() {
        const pokemonList = Object.values(DB.pokemonType.lev4);
        pokemonList.sort((a, b) => (a.name_ko || '').localeCompare(b.name_ko || '', 'ko'));
        const optionsHTML = pokemonList.map(pkm => `<option value="${pkm.id}">${pkm.name_ko}</option>`).join('');
        pokemonSelects.forEach(select => {
            select.innerHTML = '<option value="">-- 선택 --</option>' + optionsHTML;
        });
    }
    
    function loadDecksList() {
        const decks = Object.values(DB.deck.lev4);
        decks.sort((a,b)=>(a.name || '').localeCompare(b.name || '', 'ko'));
        selectList.innerHTML = '<option value="">-- 추천 덱 선택 --</option>';
        decks.forEach(deck => {
            selectList.innerHTML += `<option value="${deck.id}">${deck.name}</option>`;
        });
    }

    function calculateSynergy(pokemonIds) {
        if (!DB.synergyEffects || !pokemonIds || pokemonIds.length < 6) return null;
        const mainPokemon = pokemonIds.map(id => DB.pokemonType.lev4[id]);
        if (mainPokemon.some(pkm => !pkm)) return null;
        const typePokemonCount = {};
        mainPokemon.forEach(pkm => {
            if (pkm && pkm.types) pkm.types.forEach(type => { typePokemonCount[type] = (typePokemonCount[type] || 0) + 1; });
        });
        const counts = Object.values(typePokemonCount).sort((a, b) => b - a);
        const totalUniqueTypes = Object.keys(typePokemonCount).length;
        if (counts.length > 0 && counts[0] >= 6) return DB.synergyEffects.find(s => s.id === 'same6');
        if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) return DB.synergyEffects.find(s => s.id === 'same3x2');
        if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) return DB.synergyEffects.find(s => s.id === 'same4_2');
        const totalPairs = counts.reduce((sum, c) => sum + Math.floor(c / 2), 0);
        if (totalPairs >= 3) return DB.synergyEffects.find(s => s.id === 'same2x3');
        if (counts.length > 0 && counts[0] >= 3) return DB.synergyEffects.find(s => s.id === 'same3');
        if (totalUniqueTypes >= 6 && pokemonIds.length >= 6) return DB.synergyEffects.find(s => s.id === 'diff6');
        return null;
    }

    function updateSynergyDisplay() {
        const mainPokemonIds = Array.from(pokemonSelects)
            .filter(select => select.dataset.role === 'main' && select.value)
            .map(select => select.value);
        const synergy = calculateSynergy(mainPokemonIds);
        if (synergy) {
            synergyDisplay.innerHTML = `<img src="${synergy.imageURL}" style="height:30px; margin-right: 10px;"> <strong>${synergy.name}</strong>`;
        } else {
            synergyDisplay.innerHTML = `<span>메인 포켓몬 6마리를 선택하면 자동 계산됩니다.</span>`;
        }
    }
    pokemonSelects.forEach(select => {
        if (select.dataset.role === 'main') select.addEventListener('change', updateSynergyDisplay);
    });
    
    loadBtn.addEventListener('click', () => {
        const data = DB.deck.lev4[selectList.value];
        if (!data) return;
        form.reset();
        form.querySelector('#deck-id').value = data.id || '';
        form.querySelector('#deck-name').value = data.name || '';
        form.querySelector('#deck-description').value = data.description || '';
        weatherSelect.value = data.weather || '';
        form.querySelector('#deck-like-count').value = data.likeCount || 0;
        form.querySelector('#deck-is-published').checked = data.isPublished === true;
        if (data.composition) {
            data.composition.forEach(member => {
                const selector = `.deck-pokemon-select[data-role="${member.role}"][data-position="${member.position}"]`;
                const selectEl = form.querySelector(selector);
                if (selectEl) selectEl.value = member.pokemonId;
            });
        }
        updateSynergyDisplay();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const deckId = form.querySelector('#deck-id').value.trim();
        if (!deckId) return;
        
        const existingData = DB.deck.lev4[deckId];
        const deckData = {
            name: form.querySelector('#deck-name').value,
            description: form.querySelector('#deck-description').value,
            weather: weatherSelect.value,
            isPublished: form.querySelector('#deck-is-published').checked,
            likeCount: existingData ? existingData.likeCount || 0 : 0, 
            composition: Array.from(pokemonSelects)
                .filter(s => s.value)
                .map(s => ({
                    role: s.dataset.role,
                    position: parseInt(s.dataset.position),
                    pokemonId: s.value
                }))
        };

        await saveDataWithTimestamp("recommendedDecks", deckId, deckData);
        alert('저장 완료');
        form.reset();
        updateSynergyDisplay();
        await initializeAdminData();
        loadDecksList();
    });

    deleteBtn.addEventListener('click', async () => {
        const deckId = form.querySelector('#deck-id').value.trim();
        if (!deckId) return;
        if (confirm(`'${deckId}' 덱을 삭제하시겠습니까?`)) {
            await db.collection("recommendedDecks").doc(deckId).delete();
            alert('삭제 완료');
            form.reset();
            updateSynergyDisplay();
            await initializeAdminData();
            loadDecksList();
        }
    });
    
    populateDeckPokemonSelectors();
    loadDecksList();
    updateSynergyDisplay();
}
});