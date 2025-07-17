document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex 최종 완성본');

    // --- 전역 변수 및 초기 설정 ---
    const appContainer = document.getElementById('app-container');
    const sidebar = document.getElementById('sidebar');
    const welcomeScreen = document.getElementById('welcome-screen');
    const panels = {
        lev1: sidebar,
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    let activeButtons = {};
    const isMobile = () => window.innerWidth <= 768;

    // --- 유틸리티 함수 ---
    function showModal(title, contentHTML, isWeatherPopup = false, callback) {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        let modalClass = 'modal-content';
        if (isWeatherPopup) modalClass += ' weather-popup';
        modalOverlay.innerHTML = `<div class="${modalClass}"><div class="modal-header"><h2>${title}</h2><button class="modal-close-btn">&times;</button></div><div class="modal-body">${contentHTML}</div></div>`;
        document.body.appendChild(modalOverlay);
        modalOverlay.addEventListener('click', (e) => {
            const target = e.target;
            const weatherOption = target.closest('.weather-option');
            if (target.matches('.modal-overlay, .modal-close-btn')) {
                modalOverlay.remove();
            } else if (isWeatherPopup && weatherOption && callback) {
                callback(weatherOption.dataset.weatherName);
                modalOverlay.remove();
            }
        });
    }

    // --- 렌더링 함수들 ---
    function renderPokemonView(contentDiv, data, menuId) {
        const detailView=document.createElement("div"),nameKo=data.name_ko||data.name&&data.name.ko||"이름 없음",nameEn=data.name_en||data.name&&data.name.en||"";let commonHTML=`<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${nameEn}</span></h2>`,badgesHTML='<div class="badge-container">';data.grade&&(badgesHTML+=`<span class="grade-badge ${`grade-${data.grade.toLowerCase().replace("+","-plus")}`}">${data.grade}</span>`),data.types&&Array.isArray(data.types)&&data.types.length>0&&data.types.forEach(typeId=>{const typeInfo=DB.pokemonType.lev2.find(t=>t.id===typeId);typeInfo&&(badgesHTML+=`<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`)}),badgesHTML+="</div>",commonHTML+=badgesHTML,data.imageURL&&(commonHTML+=`<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`);let statsHTML="";statsHTML=data.stats?`<h4>종족값 (총합: ${Object.values(data.stats).reduce((a,b)=>Number(a)+Number(b),0)})</h4><table class="stats-table">${Object.entries(data.stats).map(([stat,value])=>`<tr><td>${stat}</td><td>${value}</td></tr>`).join("")}</table>`:"<h4>기본 정보</h4><p>등록된 종족값 정보가 없습니다.</p>";let skillsHTML="";skillsHTML=data.skills&&data.skills.length>0&&data.skills.some(s=>s.name)?`<h4>스킬</h4><ul class="skill-list">${data.skills.map((skill,index)=>skill.name?`<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`:"").join("")}</ul>`:"<h4>스킬</h4><p>등록된 스킬 정보가 없습니다.</p>";let buildHTML="",hasBuildInfo=!1;data.recommendedNatures&&data.recommendedNatures.length>0&&(()=>{const natureNames=data.recommendedNatures.map(natureId=>DB.definitions.natures.find(n=>n.id===natureId)?.name||"").filter(Boolean);natureNames.length>0&&(buildHTML+=`<h4>추천 성격</h4><p>${natureNames.join(", ")}</p>`,hasBuildInfo=!0)})();const recommendTypes={recommendedItems:"추천 아이템",recommendedRunes:"추천 룬",recommendedChips:"추천 칩"};for(const type in recommendTypes)data[type]&&data[type].length>0&&(hasBuildInfo=!0,buildHTML+='<h4>'+recommendTypes[type]+'</h4><div class="recommend-list">',data[type].forEach(id=>{const itemTypeForDB=type.replace("recommended","").toLowerCase().replace("s",""),dbKey="rune"===itemTypeForDB||"chip"===itemTypeForDB?"runeAndChip":"item",itemData=DB[dbKey]?.lev4?.[id];itemData?buildHTML+=`<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">${itemData.imageURL?`<img src="${itemData.imageURL}" alt="${itemData.name}">`:""}</div>`:buildHTML+=`<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}"><span>${id}(정보 없음)</span></div>`}),buildHTML+="</div>");hasBuildInfo||(buildHTML="<h4>추천 빌드</h4><p>등록된 추천 빌드 정보가 없습니다.</p>");const useTabs=isMobile()||"pokemonType"===menuId||"pokemonGrade"===menuId;detailView.className=`pokemon-detail-view ${useTabs?"use-tabs":""}`;let finalHTML=commonHTML;useTabs?finalHTML+=`<div class="tab-container"><nav class="tab-nav"><button class="tab-button active" data-tab="tab-info">기본 정보</button><button class="tab-button" data-tab="tab-skills">스킬</button><button class="tab-button" data-tab="tab-build">추천 빌드</button></nav><div id="tab-info" class="tab-pane active">${statsHTML}</div><div id="tab-skills" class="tab-pane">${skillsHTML}</div><div id="tab-build" class="tab-pane">${buildHTML}</div></div>`:finalHTML+=`<div class="info-sections">${statsHTML}${skillsHTML}${buildHTML}</div>`,detailView.innerHTML=finalHTML,contentDiv.innerHTML="",contentDiv.appendChild(detailView),contentDiv.querySelectorAll(".skill-name").forEach(el=>{el.addEventListener("click",()=>{const skillIndex=parseInt(el.dataset.skillIndex),skill=data.skills[skillIndex];if(skill){let skillDetailContent=`<p>${skill.description||""}</p>`;skill.keywords&&skill.keywords.length>0&&(skillDetailContent+="<hr><h4>키워드 설명</h4><ul>",skill.keywords.forEach(kw=>{skillDetailContent+=`<li><strong>${kw.term}:</strong> ${kw.desc}</li>`}),skillDetailContent+="</ul>"),showModal(skill.name,skillDetailContent)}})}),contentDiv.querySelectorAll(".recommend-item").forEach(el=>{el.addEventListener("click",()=>{const itemId=el.dataset.itemId,itemType=el.dataset.itemType,dbKey="rune"===itemType||"chip"===itemType?"runeAndChip":"item",itemData=DB[dbKey]?.lev4?.[itemId];itemData&&showModal(itemData.name,`<p>${itemData.description||"상세 정보가 없습니다."}</p>`)})}),contentDiv.querySelectorAll(".tab-button").forEach(button=>{button.addEventListener("click",()=>{button.classList.contains("active")||(contentDiv.querySelector(".tab-button.active").classList.remove("active"),contentDiv.querySelector(".tab-pane.active").classList.remove("active"),button.classList.add("active"),contentDiv.querySelector("#"+button.dataset.tab).classList.add("active"))})})}
    function renderSimpleView(contentDiv,data){let html=`<div class="simple-detail-view"><h2>${data.name}</h2>`;data.htmlContent?html+=data.htmlContent:(data.grade&&(html+=`<div class="badge-container"><span class="grade-badge grade-${data.grade.toLowerCase()}">${data.grade}</span></div>`),data.imageURL&&(html+=`<img src="${data.imageURL}" alt="${data.name}" class="main-image">`),data.description&&(html+=`<div class="item-description">${data.description.replace(/\\n/g,"<br>")}</div>`),data.content&&(html+=`<p>${data.content}</p>`)),html+="</div>",contentDiv.innerHTML=html}
    function renderDeckView(contentDiv,data){let html=`<div class="deck-detail-view"><h2>${data.name}</h2>`;data.description&&(html+=`<p>${data.description}</p>`);const grid=Array(3).fill(null).map(()=>Array(3).fill(null)),positionMap={vanguard_1:[0,2],vanguard_2:[1,2],vanguard_3:[2,2],rearguard_4:[0,1],rearguard_5:[1,1],rearguard_6:[2,1],assist_1:[0,0],assist_2:[1,0],assist_3:[2,0]};data.composition.forEach(member=>{const pkmData=DB.pokemonType.lev4[member.pokemonId];if(pkmData){const roleKey="assist"===member.role?"assist":member.position<4?"vanguard":"rearguard",key=`${roleKey}_${member.position}`,[row,col]=positionMap[key];grid[row][col]={...pkmData,id:member.pokemonId,role:member.role,position:member.position}}}),html+='<h4>덱 배치</h4><table class="deck-grid-table"><thead><tr><th>어시스트</th><th>후방</th><th>전방</th></tr></thead><tbody>';for(let i=0;i<3;i++){html+="<tr>";for(let j=0;j<3;j++){const cell=grid[i][j];cell?html+=`<td><div class="deck-pokemon-cell" data-pokemon-id="${cell.id}"><img src="${cell.faceImageURL}" alt="${cell.name_ko}"><span class="position-number">${"assist"===cell.role?"어시스트":"메인"} #${cell.position}</span></div></td>`:html+="<td></td>"}html+="</tr>"}html+='</tbody></table>',html+='<div class="deck-composition-container"><h4>덱 구성원</h4>';const mainMembers=data.composition.filter(m=>"main"===m.role).sort((a,b)=>a.position-b.position),assistMembers=data.composition.filter(m=>"assist"===m.role).sort((a,b)=>a.position-b.position);mainMembers.length>0&&(html+="<h5>메인</h5><ul class=\"deck-composition-list\">",mainMembers.forEach(member=>{const pkmData=DB.pokemonType.lev4[member.pokemonId];pkmData&&(html+=`<li><b>메인 #${member.position}:</b> ${pkmData.name_ko}</li>`)}),html+="</ul>"),assistMembers.length>0&&(html+="<h5>어시스트</h5><ul class=\"deck-composition-list\">",assistMembers.forEach(member=>{const pkmData=DB.pokemonType.lev4[member.pokemonId];pkmData&&(html+=`<li><b>어시스트 #${member.position}:</b> ${pkmData.name_ko}</li>`)}),html+="</ul>"),html+="</div>",contentDiv.innerHTML=html,contentDiv.querySelectorAll(".deck-pokemon-cell").forEach(cell=>{cell.addEventListener("click",()=>{const pokemonId=cell.dataset.pokemonId,pkmData=DB.pokemonType.lev4[pokemonId];if(pkmData){let typesHTML=(pkmData.types||[]).map(typeId=>{const typeInfo=DB.pokemonType.lev2.find(t=>t.id===typeId);return typeInfo?`<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`:""}).join(" "),modalContent=`<div class="badge-container"><span class="grade-badge grade-${pkmData.grade.toLowerCase().replace("+","-plus")}">${pkmData.grade}</span>${typesHTML}</div>`;showModal(pkmData.name_ko,modalContent)}})})}
    function renderCalendarView(contentDiv, data) { /* 전체 코드 생략 */ }
    function renderDeckBuilder(contentDiv) { /* 전체 코드 생략 */ }
    
    // --- 이벤트 핸들러 및 페이지 로직 (수정됨) ---
    function handleMainButtonClick() {
        Object.values(panels).forEach((panel, index) => {
            if (index > 0) { 
                panel.classList.remove('visible', 'is-hidden');
            }
        });
        setActive(0, null);
        if (isMobile()) {
            sidebar.classList.remove('is-hidden');
        }
        // welcome-screen 다시 보여주기 (PC에서만)
        if (!isMobile() && welcomeScreen) {
            welcomeScreen.style.display = 'flex';
        }
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        const targetPanel = panels[`lev${level}`];
        if (!targetPanel) return;
        const contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        const panelHeader = targetPanel.querySelector('.panel-header');
        const existingMainBtn = panelHeader.querySelector('.main-btn');
        if (existingMainBtn) existingMainBtn.remove();
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;
        if (clickedId === 'deckBuilder') {
            const mainButton = document.createElement('button');
            mainButton.className = 'main-btn';
            mainButton.textContent = '메인';
            panelHeader.appendChild(mainButton);
            if (isMobile()) {
                contentDiv.innerHTML = `<div class="pc-only-message"><h3>기능 안내</h3><p>배치툴 기능은 화면이 넓은 PC 환경에 최적화되어 있습니다.<br>PC에서 접속하여 이용해주세요.</p></div>`;
            } else {
                renderDeckBuilder(contentDiv);
            }
            return;
        }
        if (!data) {
            contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
            return;
        }
        const categoryInfo = DB.sidebarMenu.find(item => item.id === menuId);
        const isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));
        if (isFinalView) {
            const mainButton = document.createElement('button');
            mainButton.className = 'main-btn';
            mainButton.textContent = '메인';
            panelHeader.appendChild(mainButton);
            if (menuId === 'deck' && data.composition) {
                renderDeckView(contentDiv, data);
            } else if (menuId === 'calendar') {
                renderCalendarView(contentDiv, data);
            } else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') {
                renderPokemonView(contentDiv, data, menuId);
            } else {
                renderSimpleView(contentDiv, data);
            }
        } else {
            data.forEach(item => {
                const button = document.createElement('button');
                button.className = 'list-item';
                button.textContent = item.name;
                button.dataset.id = item.id;
                button.dataset.level = level;
                button.dataset.menuId = menuId;
                contentDiv.appendChild(button);
            });
        }
    }
    
    function handleMenuClick(button) {
        // 메뉴 클릭 시 welcome-screen 숨기기
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }

        const level = parseInt(button.dataset.level);
        const id = button.dataset.id;
        const menuId = button.dataset.menuId || id;
        const nextLevel = level + 1;
        const nextData = getNextData(level, id, menuId);
        const currentPanel = panels[`lev${level}`] || sidebar;
        const nextPanel = panels[`lev${nextLevel}`];
        if (!nextPanel) return;
        if (isMobile()) {
            currentPanel.classList.add('is-hidden');
        }
        Object.values(panels).forEach((panel, index) => {
            if (index > 0 && panel !== nextPanel) { panel.classList.remove('visible'); }
        });
        nextPanel.classList.remove('is-hidden');
        nextPanel.classList.add('visible');
        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
    }
    
    function getNextData(currentLevel, id, menuId) {
        const nextLevel = currentLevel + 1;
        if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) {
            return DB.pokemonType.lev4?.[id];
        }
        if (nextLevel === 2) return DB[menuId]?.lev2;
        if (nextLevel === 3) return DB[menuId]?.lev3?.[id];
        if (nextLevel === 4) return DB[menuId]?.lev4?.[id];
        return null;
    }
    
    function handleBackClick(button) {
        const parentPanel = button.closest('.panel');
        if (!parentPanel) return;
        const level = parseInt(parentPanel.id.replace('lev', '').replace('-panel', ''));
        const currentPanel = panels[`lev${level}`];
        const prevPanel = panels[`lev${level - 1}`] || sidebar;
        currentPanel.classList.remove('visible');
        if (prevPanel && prevPanel !== sidebar) {
            prevPanel.classList.remove('is-hidden');
            prevPanel.classList.add('visible');
        } else if (prevPanel === sidebar) {
            if (isMobile()) {
                prevPanel.classList.remove('is-hidden');
            } else if (welcomeScreen) {
                // PC에서 사이드바로 돌아올 때 welcome-screen 다시 보여주기
                welcomeScreen.style.display = 'flex';
            }
        }
        setActive(level - 1, null);
    }
    
    function setActive(level, target) {
        for (let i = level; i <= 4; i++) {
            if (activeButtons[i]) {
                activeButtons[i].classList.remove('active');
                activeButtons[i] = null;
            }
        }
        if (target) {
            target.classList.add('active');
            activeButtons[level] = target;
        }
    }
    
    async function fetchAllDataFromFirebase() {
        const collections = ['pokemon', 'items', 'runeAndChips', 'tips', 'events', 'recommendedDecks'];
        const promises = collections.map(col => db.collection(col).get());

        const [pokemonSnapshot, itemsSnapshot, runeAndChipsSnapshot, tipsSnapshot, eventsSnapshot, decksSnapshot] = await Promise.all(promises);

        const snapshotToMap = (snapshot) => {
            const dataMap = {};
            snapshot.forEach(doc => {
                dataMap[doc.id] = { id: doc.id, ...doc.data() };
            });
            return dataMap;
        };

        const eventsToArray = (snapshot) => {
            const dataArray = [];
            snapshot.forEach(doc => {
                dataArray.push({ id: doc.id, ...doc.data() });
            });
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
    }
    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            const types = {};
            DB.pokemonType.lev2.forEach(type => { types[type.id] = []; });
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                const pkmName = pokemon.name_ko || (pokemon.name && pokemon.name.ko);
                if (pokemon.types && Array.isArray(pokemon.types) && pkmName) {
                    pokemon.types.forEach(typeId => {
                        if (types[typeId]) { types[typeId].push({ id: pokemonId, name: pkmName }); }
                    });
                }
            });
            DB.pokemonType.lev3 = types;

            const grades = {};
            DB.pokemonGrade.lev2.forEach(grade => { grades[grade.id] = []; });
            Object.entries(DB.pokemonType.lev4).forEach(([pokemonId, pokemon]) => {
                const pkmName = pokemon.name_ko || (pokemon.name && pokemon.name.ko);
                if (pokemon && pokemon.grade && pkmName) {
                     const gradeId = DB.pokemonGrade.lev2.find(g => g.name === pokemon.grade)?.id;
                    if (gradeId && grades[gradeId]) { grades[gradeId].push({ id: pokemonId, name: pkmName }); }
                }
            });
            DB.pokemonGrade.lev3 = grades;
            
            const itemGrades = { god: [], legendary: [], epic: [] };
            Object.entries(DB.item.lev4).forEach(([itemId, item]) => {
                const gradeKey = item.grade?.toLowerCase();
                if (itemGrades[gradeKey]) {
                    itemGrades[gradeKey].push({ id: itemId, name: item.name });
                }
            });
            DB.item.lev3 = itemGrades;
            
            const runeAndChipTypes = { rune: [], chip: [] };
            Object.entries(DB.runeAndChip.lev4).forEach(([rcId, rc]) => {
                if(runeAndChipTypes[rc.type]) {
                    runeAndChipTypes[rc.type].push({ id: rcId, name: rc.name });
                }
            });
            DB.runeAndChip.lev3 = runeAndChipTypes;

            renderSidebar();
            addEventListeners();
            
            // 페이지 로드 후 초기 상태 설정
            if (!isMobile()) {
                welcomeScreen.style.display = 'flex';
            }

        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다. Firebase 연결 또는 데이터 구조를 확인해주세요.";
        }
    }
    
    function renderSidebar() {
        const sidebarContent = document.createElement('div');
        sidebarContent.className = 'panel-content';
        DB.sidebarMenu.forEach(item => {
            const button = document.createElement('button');
            button.className = 'menu-item';
            button.textContent = item.name;
            button.dataset.level = 1;
            button.dataset.id = item.id;
            sidebarContent.appendChild(button);
        });
        sidebar.innerHTML = '';
        sidebar.appendChild(sidebarContent);
    }

    function addEventListeners() {
        appContainer.addEventListener('click', e => {
            const button = e.target.closest('button');
            if (!button) return;
            if (button.classList.contains('back-btn')) { 
                handleBackClick(button); 
            } else if (button.classList.contains('main-btn')) {
                handleMainButtonClick();
            }
            else if (button.dataset.level) { 
                handleMenuClick(button); 
            }
        });
    }
    
    initialize();
});