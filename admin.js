document.addEventListener('DOMContentLoaded', () => {
    // Firebase 객체 확인
    if (!window.db || !window.auth) {
        console.error("Firebase 'db' 또는 'auth' 객체를 찾을 수 없습니다. Firebase 초기화 스크립트를 확인해주세요.");
        alert("Firebase가 로드되지 않았습니다. 페이지를 새로고침하거나 스크립트 태그를 확인해주세요.");
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

    // 로그인 폼 제출 이벤트
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
                    console.error("Login Error:", error);
                });
        });
    }

    // 로그아웃 버튼 이벤트
    if(logoutBtn) logoutBtn.addEventListener('click', () => auth.signOut());

    // 관리자 패널 초기화 (한 번만 실행)
    let isPanelInitialized = false;
    async function initializeAdminPanel() {
        if (isPanelInitialized) return;
        isPanelInitialized = true;

        try {
            console.log("[DEBUG] initializeAdminPanel: 관리자 패널 초기화 시작");
            setupTabSwitching();
            setupPublishManagement();
            setupPokemonManagement();
            setupItemManagement();
            setupRuneChipManagement();
            setupTipsManagement();
            setupDeckManagement();
            console.log('[DEBUG] initializeAdminPanel: 관리자 패널 초기화 완료');
        } catch (error) {
            console.error("[DEBUG] initializeAdminPanel: 관리자 패널 초기화 중 심각한 오류 발생:", error);
            alert("관리자 패널 초기화에 실패했습니다. 콘솔을 확인해주세요.");
        }
    }

    // 탭 전환 로직
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

    // 게시물 관리 기능
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
                            items.push({ id: doc.id, name: data.name_ko || data.name || data.title || doc.id });
                        });
                        items.sort((a,b)=> a.name.localeCompare(b.name, 'ko'));
                        
                        items.forEach(item => {
                             categoryHTML += `
                                <label class="draft-item">
                                    <input type="checkbox" class="draft-checkbox" data-collection="${col}" data-id="${item.id}">
                                    <span class="draft-item-name">${item.name}</span>
                                    <span class="draft-item-id">${item.id}</span>
                                </label>`;
                        });

                        categoryHTML += `</div></div>`;
                        allDraftsHTML += categoryHTML;
                    }
                } catch (e) {
                    console.error(`'${col}' 컬렉션 초안 로딩 오류:`, e);
                }
            }
            draftsContainer.innerHTML = allDraftsHTML || '<h4><br>✔️ 비공개 상태인 데이터가 없습니다.</h4>';
        }

        publishBtn.addEventListener('click', async () => {
            const selectedItems = draftsContainer.querySelectorAll('.draft-checkbox:checked');
            if (selectedItems.length === 0) return alert('게시할 항목을 선택해주세요.');
            if (!confirm(`선택한 ${selectedItems.length}개의 항목을 웹사이트에 공개하시겠습니까?`)) return;

            const batch = db.batch();
            selectedItems.forEach(item => {
                const { collection, id } = item.dataset;
                batch.update(db.collection(collection).doc(id), { isPublished: true });
            });

            try {
                await batch.commit();
                alert('선택한 항목이 성공적으로 공개 처리되었습니다.');
                loadDrafts();
            } catch (error) {
                alert('공개 처리 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
                console.error('일괄 공개 오류:', error);
            }
        });

        reloadBtn.addEventListener('click', loadDrafts);
        
        if (panel.classList.contains('active')) {
             loadDrafts();
        }
    }

    // 범용 관리 핸들러 생성기
    function createManagementHandler(config) {
        const { type, collectionName, idPrefix } = config;
        const panel = document.getElementById(`${type}-management`);
        if (!panel) {
            console.error(`[${type}-DEBUG]: ERROR! 관리 패널을 찾을 수 없습니다. (ID: ${type}-management)`);
            return;
        }

        const form = panel.querySelector(`#${type}-form`);
        const selectList = panel.querySelector(`#${type}-select-list`);
        const loadBtn = panel.querySelector(`#load-${type}-btn`);
        const deleteBtn = panel.querySelector(`#delete-${type}-btn`);

        async function loadList() {
            console.log(`[${type}-DEBUG]: 1. loadList 함수 시작. 컬렉션 이름: "${collectionName}"`);
            try {
                const snapshot = await db.collection(collectionName).get();
                console.log(`[${type}-DEBUG]: 2. Firestore로부터 응답 받음. 가져온 문서 개수: ${snapshot.size}`);

                if (snapshot.empty) {
                    console.warn(`[${type}-DEBUG]: 3. 경고: Firestore에서 문서를 하나도 가져오지 못했습니다.`);
                }

                selectList.innerHTML = `<option value="">-- 선택 --</option>`;
                const items = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const name = data.name_ko || data.name || data.title || doc.id;
                    console.log(`[${type}-DEBUG]: 4. 문서 처리 중 -> ID: ${doc.id}, 이름: ${name}`);
                    if (typeof name === 'string') {
                        items.push({ id: doc.id, name: name });
                    } else {
                        console.warn(`[${type}-DEBUG]: 4-1. 경고: 이름이 없는 데이터를 발견하여 목록에서 제외합니다. ID: ${doc.id}`);
                    }
                });

                console.log(`[${type}-DEBUG]: 5. 목록에 추가할 최종 아이템 개수: ${items.length}`);
                items.sort((a,b) => a.name.localeCompare(b.name, 'ko'));
                
                items.forEach(item => {
                    selectList.innerHTML += `<option value="${item.id}">${item.name}</option>`;
                });
                console.log(`[${type}-DEBUG]: 6. 드롭다운 메뉴 생성을 완료했습니다.`);
            } catch(e) { 
                console.error(`[${type}-DEBUG]: 7. 치명적 오류! 목록 로딩 중 에러가 발생했습니다:`, e);
            }
        }
        
        loadBtn.addEventListener('click', async () => {
            if (!selectList.value) return alert('불러올 항목을 선택해주세요.');
            try {
                const doc = await db.collection(collectionName).doc(selectList.value).get();
                if (doc.exists) {
                    const data = doc.data();
                    form.reset();
                    form.querySelector(`#${idPrefix}-id`).value = doc.id;
                    
                    const isPublishedCheckbox = form.querySelector(`#${idPrefix}-is-published`);
                    if (isPublishedCheckbox) {
                        isPublishedCheckbox.checked = data.isPublished === true;
                    }

                    for (const key in data) {
                        if (key === 'isPublished') continue;
                        const element = form.querySelector(`[id^="${idPrefix}-${key.replace(/_/g, '-')}"]`);
                        if (element) {
                            if (element.type === 'checkbox') {
                                element.checked = !!data[key];
                            } else {
                                element.value = data[key] || '';
                            }
                        }
                    }
                    if(form.querySelector(`#${idPrefix}-name-ko`)) form.querySelector(`#${idPrefix}-name-ko`).value = data.name_ko || '';
                    if(form.querySelector(`#${idPrefix}-name-en`)) form.querySelector(`#${idPrefix}-name-en`).value = data.name_en || '';
                    if(form.querySelector(`#${idPrefix}-name`)) form.querySelector(`#${idPrefix}-name`).value = data.name || '';
                    if(form.querySelector(`#${idPrefix}-title`)) form.querySelector(`#${idPrefix}-title`).value = data.title || '';
                    if(form.querySelector(`#${idPrefix}-content`)) form.querySelector(`#${idPrefix}-content`).value = data.htmlContent || '';

                    alert(`'${data.name_ko || data.name || data.title}' 데이터를 불러왔습니다.`);
                }
            } catch(e) { console.error(`${type} 데이터 로딩 오류:`, e); alert('데이터 로딩 중 오류가 발생했습니다.'); }
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
                    if (input.type === 'checkbox') {
                        data[key] = input.checked;
                    } else {
                        data[key] = input.value;
                    }
                }
            });
            
            delete data.id;

            try {
                await db.collection(collectionName).doc(id).set(data, { merge: true });
                alert('성공적으로 저장되었습니다!');
                form.reset();
                loadList();
            } catch (err) {
                console.error("저장 오류:", err);
                alert("저장 중 오류가 발생했습니다.");
            }
        });

        deleteBtn.addEventListener('click', async () => {
            const id = form.querySelector(`#${idPrefix}-id`).value.trim();
            if (!id) return alert('삭제할 데이터가 없습니다.');
            if (confirm(`'${id}' 데이터를 정말로 삭제하시겠습니까?`)) {
                try {
                    await db.collection(collectionName).doc(id).delete();
                    alert('삭제되었습니다.');
                    form.reset();
                    loadList();
                } catch(err) {
                    console.error("삭제 오류:", err);
                    alert("삭제 중 오류가 발생했습니다.");
                }
            }
        });

        loadList();
    }
    
    // 각 관리 기능 핸들러 실행
    function setupPokemonManagement() { createManagementHandler({ type: 'pokemon', collectionName: 'pokemon', idPrefix: 'pkm' }); }
    function setupItemManagement() { createManagementHandler({ type: 'item', collectionName: 'items', idPrefix: 'item' }); }
    function setupRuneChipManagement() { createManagementHandler({ type: 'rc', collectionName: 'runeAndChips', idPrefix: 'rc' }); }
    function setupTipsManagement() { createManagementHandler({ type: 'tip', collectionName: 'tips', idPrefix: 'tip' }); }
    function setupDeckManagement() { createManagementHandler({ type: 'deck', collectionName: 'recommendedDecks', idPrefix: 'deck' }); }
});