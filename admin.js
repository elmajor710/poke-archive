document.addEventListener('DOMContentLoaded', () => {
    // Firebase 객체 확인
    if (!window.db || !window.auth) {
        console.error("Firebase 'db' 또는 'auth' 객체를 찾을 수 없습니다. Firebase 초기화 스크립트를 확인해주세요.");
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
            loginContainer.style.display = 'none';
            adminContainer.style.display = 'flex';
            initializeAdminPanel();
        } else {
            loginContainer.style.display = 'flex';
            adminContainer.style.display = 'none';
        }
    });

    // 로그인 폼 제출 이벤트
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMessage = document.getElementById('login-error-message');
        errorMessage.textContent = '';
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                errorMessage.textContent = '이메일 또는 비밀번호가 잘못되었습니다.';
                console.error("Login Error:", error);
            });
    });

    // 로그아웃 버튼 이벤트
    logoutBtn.addEventListener('click', () => auth.signOut());

    // 관리자 패널 초기화 (한 번만 실행)
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
            setupTipsManagement();
            setupDeckManagement();
            setupCalendarManagement();
            console.log('관리자 패널 초기화 완료');
        } catch (error) {
            console.error("관리자 패널 초기화 중 심각한 오류 발생:", error);
            alert("관리자 패널 초기화에 실패했습니다. 콘솔을 확인해주세요.");
        }
    }

    // 모든 데이터를 로컬 DB 객체로 불러오기
    async function initializeAdminData() {
        // 이 함수는 현재 로컬 data.js를 사용하므로 비워두거나,
        // 필요 시 Firestore에서 초기 데이터를 가져오는 로직을 넣을 수 있습니다.
        // 지금 구조에서는 각 관리 탭에서 목록을 직접 불러오므로, 전역 로딩은 불필요할 수 있습니다.
    }

    // 탭 전환 로직
    function setupTabSwitching() {
        const adminNav = document.getElementById('admin-nav');
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
                // 게시물 관리 탭이 클릭되면 목록을 새로고침
                if(tabId === 'publish-management') {
                    document.getElementById('reload-drafts-btn').click();
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
            draftsContainer.innerHTML = '<h4><br>🔄 초안 데이터를 불러오는 중...</h4>';
            let allDraftsHTML = '';
            
            for (const col of Object.keys(collectionNames)) {
                try {
                    const snapshot = await db.collection(col).where("isPublished", "==", false).get();
                    if (!snapshot.empty) {
                        let categoryHTML = `<div class="draft-category"><h3>${collectionNames[col]}</h3><div class="draft-list">`;
                        snapshot.forEach(doc => {
                            const data = doc.data();
                            const name = data.name_ko || data.name || data.title || doc.id;
                            categoryHTML += `
                                <label class="draft-item">
                                    <input type="checkbox" class="draft-checkbox" data-collection="${col}" data-id="${doc.id}">
                                    <span class="draft-item-name">${name}</span>
                                    <span class="draft-item-id">${doc.id}</span>
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
        
        // 페이지가 처음 보일 때, 게시물 관리 탭이 활성화 상태라면 초안 목록을 불러옵니다.
        if (panel.classList.contains('active')) {
             loadDrafts();
        }
    }

    // 각 관리 탭에 대한 범용 핸들러 생성기
    function createManagementHandler(type) {
        const panel = document.getElementById(`${type}-management`);
        if (!panel) return;

        const form = panel.querySelector(`#${type}-form`);
        const selectList = panel.querySelector(`#${type}-select-list`);
        const loadBtn = panel.querySelector(`#load-${type}-btn`);
        const deleteBtn = panel.querySelector(`#delete-${type}-btn`);
        const collectionName = (type === 'rune-chip') ? 'runeAndChips' : `${type}s`;
        const idField = (type === 'rune-chip') ? 'rc-id' : `${type}-id`;
        
        // 목록 로드
        async function loadList() {
            try {
                const snapshot = await db.collection(collectionName).get();
                selectList.innerHTML = `<option value="">-- ${type} 선택 --</option>`;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const name = data.name_ko || data.name || data.title || doc.id;
                    selectList.innerHTML += `<option value="${doc.id}">${name}</option>`;
                });
            } catch(e) { console.error(`${type} 목록 로딩 오류:`, e); }
        }

        // 데이터 불러오기
        loadBtn.addEventListener('click', async () => {
            if (!selectList.value) return alert('불러올 항목을 선택해주세요.');
            const doc = await db.collection(collectionName).doc(selectList.value).get();
            if (doc.exists) {
                const data = doc.data();
                form.reset(); // 폼 초기화
                form.querySelector(`#${idField}`).value = doc.id;
                form.querySelector(`#${type}-is-published`).checked = data.isPublished === true;
                
                // 각 타입에 맞는 필드 채우기
                Object.keys(data).forEach(key => {
                    const el = form.querySelector(`#${type}-${key.toLowerCase().replace(/_/g, '-')}`);
                    if(el) {
                        if(el.type === 'checkbox') el.checked = data[key];
                        else el.value = data[key];
                    }
                });
                 // 특수 케이스 처리 (이름 필드 등)
                if(form.querySelector(`#${type}-name`)) form.querySelector(`#${type}-name`).value = data.name || '';
                if(form.querySelector(`#${type}-title`)) form.querySelector(`#${type}-title`).value = data.name || '';
                if(form.querySelector(`#${type}-content`)) form.querySelector(`#${type}-content`).value = data.htmlContent || '';


                alert(`'${data.name_ko || data.name || data.title}' 데이터를 불러왔습니다.`);
            }
        });

        // 데이터 저장
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = form.querySelector(`#${idField}`).value;
            if (!id) return alert('고유 ID를 입력해주세요.');

            const formData = new FormData(form);
            const data = { isPublished: form.querySelector(`#${type}-is-published`).checked };
            
            for(let [key, value] of formData.entries()) {
                const cleanKey = key.replace(`${type}-`, '').replace(/-/g, '_');
                data[cleanKey] = value;
            }
            // FormData는 체크되지 않은 체크박스를 포함하지 않으므로 직접 값을 넣어줌
            data.isPublished = form.querySelector(`#${type}-is-published`).checked;


            // 필드 이름 맞추기 (예: tip-title -> name)
             if(data.title) { data.name = data.title; delete data.title; }
             if(data.content) { data.htmlContent = data.content; delete data.content; }


            db.collection(collectionName).doc(id).set(data, { merge: true })
              .then(() => { alert('성공적으로 저장되었습니다!'); loadList(); form.reset(); })
              .catch(err => console.error("저장 오류:", err));
        });

        // 데이터 삭제
        deleteBtn.addEventListener('click', () => {
            const id = form.querySelector(`#${idField}`).value;
            if (!id) return alert('삭제할 데이터가 없습니다.');
            if (confirm(`'${id}' 데이터를 정말로 삭제하시겠습니까?`)) {
                db.collection(collectionName).doc(id).delete()
                  .then(() => { alert('삭제되었습니다.'); loadList(); form.reset(); })
                  .catch(err => console.error("삭제 오류:", err));
            }
        });

        loadList();
    }
    
    // 각 관리 기능 핸들러 실행
    function setupPokemonManagement() { createManagementHandler('pokemon'); }
    function setupItemManagement() { createManagementHandler('item'); }
    function setupRuneChipManagement() { createManagementHandler('rune-chip'); }
    function setupTipsManagement() { createManagementHandler('tip'); }
    function setupDeckManagement() { createManagementHandler('deck'); }
    function setupCalendarManagement() { /* 캘린더는 isPublished 로직이 없으므로 별도 구현 */ }

});