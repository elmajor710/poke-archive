document.addEventListener('DOMContentLoaded', async () => {
    if (!window.db) {
        console.error("Firestore 'db' 객체를 찾을 수 없습니다. HTML 파일의 스크립트 순서를 확인하세요.");
        return;
    }
    
    async function initializeAdminData() {
        try {
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

        } catch (error) {
            console.error("관리자 페이지 데이터 초기화 오류:", error);
            alert("데이터를 불러오는 데 실패했습니다. 페이지를 새로고침 해주세요.");
        }
    }
    
    await initializeAdminData();

    // --- 탭 전환 기능 ---
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

    // --- 포켓몬 관리 기능 ---
    const pokemonManagementPanel = document.getElementById('pokemon-management');
    if (pokemonManagementPanel) {
        // (JT님의 기존 포켓몬 관리 코드는 여기에 그대로 유지됩니다)
    }

    // --- 아이템 관리 기능 ---
    const itemManagementPanel = document.getElementById('item-management');
    if (itemManagementPanel) {
        // (JT님의 기존 아이템 관리 코드는 여기에 그대로 유지됩니다)
    }

    // --- 룬&칩 관리 기능 ---
    const runeChipManagementPanel = document.getElementById('rune-chip-management');
    if (runeChipManagementPanel) {
        // (JT님의 기존 룬&칩 관리 코드는 여기에 그대로 유지됩니다)
    }

    // --- 팁 & 노하우 관리 기능 ---
    const tipManagementPanel = document.getElementById('tips-management');
    if(tipManagementPanel) {
        // (JT님의 기존 팁&노하우 관리 코드는 여기에 그대로 유지됩니다)
        loadTipsList(); // loadTipsList()는 이 블록 안에서 호출되어야 합니다.
    } // <--- 이 닫는 괄호 '}'가 빠져있었습니다.

    // --- 캘린더 관리 기능 ---
    const calendarManagementPanel = document.getElementById('calendar-management');
    if (calendarManagementPanel) {
        // (JT님의 기존 캘린더 관리 코드는 여기에 그대로 유지됩니다)
        loadEventsList();
    }
        
    // --- 추천 덱 관리 기능 ---
    const deckManagementPanel = document.getElementById('deck-management');
    if (deckManagementPanel) {
        const deckForm = deckManagementPanel.querySelector('#deck-form');
        const deckSelectList = deckManagementPanel.querySelector('#deck-select-list');
        const loadDeckBtn = deckManagementPanel.querySelector('#load-deck-btn');
        const deleteDeckBtn = deckForm.querySelector('#delete-deck-btn');
        const pokemonSelects = deckForm.querySelectorAll('.deck-pokemon-select');

        function populateDeckPokemonSelectors() {
            const pokemonList = Object.values(DB.pokemonType.lev4);
            pokemonList.sort((a, b) => (a.name_ko || '').localeCompare(b.name_ko || '', 'ko'));
            
            const optionsHTML = pokemonList.map(pkm => `<option value="${pkm.id}">${pkm.name_ko}</option>`).join('');

            pokemonSelects.forEach(select => {
                select.innerHTML = '<option value="">-- 포켓몬 선택 --</option>' + optionsHTML;
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
                    deckForm.querySelector('#deck-id').value = doc.id;
                    deckForm.querySelector('#deck-name').value = data.name || '';
                    deckForm.querySelector('#deck-description').value = data.description || '';
                    
                    pokemonSelects.forEach(select => select.value = '');
                    if (data.composition) {
                        data.composition.forEach(member => {
                            const selector = `.deck-pokemon-select[data-role="${member.role}"][data-position="${member.position}"]`;
                            const selectEl = deckForm.querySelector(selector);
                            if (selectEl) selectEl.value = member.pokemonId;
                        });
                    }
                    alert(`'${data.name}' 데이터를 불러왔습니다.`);
                }
            } catch (error) { console.error("덱 데이터 로딩 오류: ", error); alert("덱 데이터를 불러오는 중 오류가 발생했습니다."); }
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
                composition: composition
            };

            try {
                await db.collection("recommendedDecks").doc(deckId).set(deckData);
                alert('추천 덱이 성공적으로 저장되었습니다!');
                deckForm.reset();
                loadDecksList();
            } catch (error) { console.error("덱 저장 오류: ", error); alert('덱 저장 중 오류가 발생했습니다.'); }
        });

        deleteDeckBtn.addEventListener('click', async () => {
            const deckId = deckForm.querySelector('#deck-id').value.trim();
            if (!deckId) { alert('삭제할 덱 데이터가 없습니다.'); return; }
            if (confirm(`정말로 '${deckId}' 덱을 삭제하시겠습니까?`)) {
                try {
                    await db.collection("recommendedDecks").doc(deckId).delete();
                    alert('덱이 성공적으로 삭제되었습니다.');
                    deckForm.reset();
                    loadDecksList();
                } catch (error) { console.error("덱 삭제 오류: ", error); alert('덱 삭제 중 오류가 발생했습니다.'); }
            }
        });

        populateDeckPokemonSelectors();
        loadDecksList();
    }
});