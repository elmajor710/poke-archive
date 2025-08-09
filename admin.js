document.addEventListener('DOMContentLoaded', () => {
    // Firebase 객체 확인
    if (!window.db || !window.auth) {
        console.error("Firebase 'db' 또는 'auth' 객체를 찾을 수 없습니다.");
        return;
    }

    // 전역 DOM 요소
    const loginContainer = document.getElementById('login-container');
    const adminContainer = document.getElementById('admin-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    // 로그인 상태 감지 및 화면 전환
    auth.onAuthStateChanged(user => {
        if (user) {
            if(loginContainer) loginContainer.style.display = 'none';
            if(adminContainer) adminContainer.style.display = 'flex';
            initializeAdminPanel();
        } else {
            if(loginContainer) loginContainer.style.display = 'flex';
            if(adminContainer) adminContainer.style.display = 'none';
        }
    });

    if(loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorMessage = document.getElementById('login-error-message');
            if(errorMessage) errorMessage.textContent = '';
            auth.signInWithEmailAndPassword(email, password)
                .catch(error => {
                    if(errorMessage) errorMessage.textContent = '이메일 또는 비밀번호가 잘못되었습니다.';
                });
        });
    }

    if(logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());

    let isPanelInitialized = false;
    async function initializeAdminPanel() {
        if (isPanelInitialized) return;
        isPanelInitialized = true;

        setupTabSwitching();
        setupPublishManagement();
        setupPokemonManagement();
        setupItemManagement();
        setupRuneChipManagement();
        setupTipsManagement();
        setupDeckManagement();
    }

    function setupTabSwitching() {
        const adminNav = document.getElementById('admin-nav');
        if (!adminNav) return;
        adminNav.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedLink = e.target.closest('.admin-tab-link');
            if (!clickedLink || clickedLink.classList.contains('active')) return;
            adminNav.querySelector('.admin-tab-link.active')?.classList.remove('active');
            document.querySelector('.admin-tab-content.active')?.classList.remove('active');
            clickedLink.classList.add('active');
            const tabId = clickedLink.dataset.tab;
            const targetContent = document.getElementById(tabId);
            if(targetContent) {
                targetContent.classList.add('active');
                if(tabId === 'publish-management') {
                    const reloadBtn = document.getElementById('reload-drafts-btn');
                    if(reloadBtn) reloadBtn.click();
                }
            }
        });
    }

    function setupPublishManagement() {
        const panel = document.getElementById('publish-management');
        if (!panel) return;
        const draftsContainer = panel.querySelector('#drafts-container');
        const publishBtn = panel.querySelector('#publish-selected-btn');
        const reloadBtn = panel.querySelector('#reload-drafts-btn');
        const collectionNames = {
            pokemon: "포켓몬", items: "아이템", runeAndChips: "룬&칩",
            tips: "팁&노하우", recommendedDecks: "추천 덱"
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
                            const name = data.name_ko || data.name || data.title || doc.id;
                            if (typeof name === 'string') {
                                items.push({ id: doc.id, name: name });
                            }
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
            } catch (error) { console.error('일괄 공개 오류:', error); }
        });
        reloadBtn.addEventListener('click', loadDrafts);
        if (panel.classList.contains('active')) loadDrafts();
    }

    function createManagementHandler(config) {
        const { type, collectionName, idPrefix } = config;
        const panel = document.getElementById(`${type}-management`);
        if (!panel) return;

        const form = panel.querySelector(`#${type}-form`);
        const selectList = panel.querySelector(`#${type}-select-list`);
        const loadBtn = panel.querySelector(`#load-${type}-btn`);
        const deleteBtn = panel.querySelector(`#delete-${type}-btn`);

        async function loadList() {
            try {
                const snapshot = await db.collection(collectionName).get();
                selectList.innerHTML = `<option value="">-- 선택 --</option>`;
                const items = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const name = data.name_ko || data.name || data.title || doc.id;
                    if (typeof name === 'string') {
                        items.push({ id: doc.id, name: name });
                    }
                });
                
                // [오류 수정] 이름이 없는 경우(null, undefined)에도 안전하게 정렬
                items.sort((a, b) => {
                    const nameA = a.name || ''; // 이름이 없으면 빈 문자열로 처리
                    const nameB = b.name || ''; // 이름이 없으면 빈 문자열로 처리
                    return nameA.localeCompare(nameB, 'ko');
                });
                
                items.forEach(item => {
                    selectList.innerHTML += `<option value="${item.id}">${item.name}</option>`;
                });
            } catch(e) { console.error(`${type} 목록 로딩 오류:`, e); }
        }

        loadBtn.addEventListener('click', async () => {
            if (!selectList.value) return alert('불러올 항목을 선택해주세요.');
            const doc = await db.collection(collectionName).doc(selectList.value).get();
            if (doc.exists) {
                const data = doc.data();
                form.reset();
                form.querySelector(`#${idPrefix}-id`).value = doc.id;
                const isPublishedCheckbox = form.querySelector(`#${idPrefix}-is-published`);
                if (isPublishedCheckbox) isPublishedCheckbox.checked = data.isPublished === true;
                for (const key in data) {
                    if (key === 'isPublished') continue;
                    const element = form.querySelector(`[id^="${idPrefix}-${key.replace(/_/g, '-')}"]`);
                    if (element) {
                        if (element.type === 'checkbox') element.checked = !!data[key];
                        else element.value = data[key] || '';
                    }
                }
                if(form.querySelector(`#${idPrefix}-name-ko`)) form.querySelector(`#${idPrefix}-name-ko`).value = data.name_ko || '';
                if(form.querySelector(`#${idPrefix}-name-en`)) form.querySelector(`#${idPrefix}-name-en`).value = data.name_en || '';
                if(form.querySelector(`#${idPrefix}-name`)) form.querySelector(`#${idPrefix}-name`).value = data.name || '';
                if(form.querySelector(`#${idPrefix}-title`)) form.querySelector(`#${idPrefix}-title`).value = data.title || '';
                if(form.querySelector(`#${idPrefix}-content`)) form.querySelector(`#${idPrefix}-content`).value = data.htmlContent || '';
                alert(`'${data.name_ko || data.name || data.title}' 데이터를 불러왔습니다.`);
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = form.querySelector(`#${idPrefix}-id`).value.trim();
            if (!id) return alert('고유 ID를 입력해주세요.');
            const data = {};
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if(!input.id) return;
                const key = input.id.replace(`${idPrefix}-`, '').replace(/-/g, '_');
                if (key) {
                    if (input.type === 'checkbox') data[key] = input.checked;
                    else data[key] = input.value;
                }
            });
            delete data.id;
            await db.collection(collectionName).doc(id).set(data, { merge: true });
            alert('성공적으로 저장되었습니다!');
            form.reset();
            loadList();
        });

        deleteBtn.addEventListener('click', async () => {
            const id = form.querySelector(`#${idPrefix}-id`).value.trim();
            if (!id) return;
            if (confirm(`'${id}' 데이터를 정말로 삭제하시겠습니까?`)) {
                await db.collection(collectionName).doc(id).delete();
                alert('삭제되었습니다.');
                form.reset();
                loadList();
            }
        });

        loadList();
    }
    
    // [오류 수정] HTML ID와 일치하도록 type 이름 변경
    function setupPokemonManagement() { createManagementHandler({ type: 'pokemon', collectionName: 'pokemon', idPrefix: 'pkm' }); }
    function setupItemManagement() { createManagementHandler({ type: 'item', collectionName: 'items', idPrefix: 'item' }); }
    function setupRuneChipManagement() { createManagementHandler({ type: 'rune-chip', collectionName: 'runeAndChips', idPrefix: 'rc' }); }
    function setupTipsManagement() { createManagementHandler({ type: 'tips', collectionName: 'tips', idPrefix: 'tip' }); }
    function setupDeckManagement() { createManagementHandler({ type: 'deck', collectionName: 'recommendedDecks', idPrefix: 'deck' }); }
});