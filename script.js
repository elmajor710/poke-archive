document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v11.1-final');

    const appContainer = document.getElementById('app-container');
    const adminPanel = document.getElementById('admin-panel');
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminMode = urlParams.get('admin') === 'true';

    if (isAdminMode) {
        initializeAppAdminMode();
    } else {
        initializeAppUserMode();
    }
    
    function initializeAppAdminMode() {
        document.body.classList.add('admin-mode-active');
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        
        const adminContent = document.getElementById('admin-content');
        const codeOutput = document.getElementById('code-output');
        
        function renderAddPokemonForm() {
            const formContainer = document.getElementById('admin-form-container');
            if (!formContainer) return;

            const gradeOptions = (DB.pokemonGrade?.lev2 || []).map(g => `<option value="${g.name}">${g.name}</option>`).join('');
            const typeOptions = (DB.pokemonType?.lev2 || []).map(t => `<option value="${t.id}">${t.name}</option>`).join('');
            const natureOptions = (DB.definitions?.natures || []).map(n => `<div><input type="checkbox" id="nature-${n.id}" class="p-nature" value="${n.name}"><label for="nature-${n.id}" style="margin-left: 5px; font-weight: normal;">${n.name}</label></div>`).join('');

            formContainer.innerHTML = `
                <h4>포켓몬 추가</h4>
                <fieldset><legend>기본 정보</legend>
                    <div class="form-group"><label for="p-name-ko">이름 (한글):</label><input type="text" id="p-name-ko"></div>
                    <div class="form-group"><label for="p-name-en">이름 (영문):</label><input type="text" id="p-name-en"></div>
                    <div class="form-group"><label for="p-type">타입:</label><select id="p-type"><option value="">--타입--</option>${typeOptions}</select></div>
                    <div class="form-group"><label for="p-grade">등급:</label><select id="p-grade"><option value="">--등급--</option>${gradeOptions}</select></div>
                    <div class="form-group"><label for="p-image-url">이미지 URL:</label><input type="text" id="p-image-url"></div>
                    <div class="form-group"><label for="p-face-image-url">얼굴 이미지 URL:</label><input type="text" id="p-face-image-url"></div>
                </fieldset>
                <fieldset><legend>종족값</legend>
                    <div class="form-group"><label for="p-total-stats">총합:</label><input type="number" id="p-total-stats" value="0"></div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group"><label>HP:</label><input type="number" id="p-hp" value="0"></div>
                        <div class="form-group"><label>Speed:</label><input type="number" id="p-speed" value="0"></div>
                        <div class="form-group"><label>P.ATK:</label><input type="number" id="p-atk" value="0"></div>
                        <div class="form-group"><label>P.DEF:</label><input type="number" id="p-def" value="0"></div>
                        <div class="form-group"><label>SP.ATK:</label><input type="number" id="p-sp-atk" value="0"></div>
                        <div class="form-group"><label>SP.DEF:</label><input type="number" id="p-sp-def" value="0"></div>
                    </div>
                </fieldset>
                <fieldset><legend>추천 성격</legend><div id="p-natures-container" style="display: flex; flex-wrap: wrap; gap: 15px;">${natureOptions}</div></fieldset>
                <fieldset><legend>스킬</legend><div id="skills-list"></div><button type="button" class="add-btn" id="add-skill-btn">스킬 추가</button></fieldset>
                <fieldset><legend>추천 아이템</legend><div id="reco-items-list"></div><button type="button" class="add-btn" id="add-reco-item-btn">아이템 추가</button></fieldset>
                <fieldset><legend>추천 룬</legend><div id="reco-runes-list"></div><button type="button" class="add-btn" id="add-reco-rune-btn">룬 추가</button></fieldset>
                <fieldset><legend>추천 칩</legend><div id="reco-chips-list"></div><button type="button" class="add-btn" id="add-reco-chip-btn">칩 추가</button></fieldset>
                <button id="generate-pokemon-code" style="margin-top:20px; padding: 12px 20px; font-size: 16px; background-color: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">코드 생성</button>
            `;
        }

        function addDynamicField(containerId, optionsHTML) {
            const container = document.getElementById(containerId);
            if(!container) return;
            const newItem = document.createElement('div');
            newItem.className = 'dynamic-list-item';
            
            if(containerId === 'skills-list') {
                newItem.innerHTML = `<input type="text" placeholder="스킬명" class="skill-name-input" style="flex-grow:1;"><select class="skill-type-select"><option value="Active">Active</option><option value="Ultimate">Ultimate</option><option value="Passive">Passive</option></select><textarea rows="2" placeholder="스킬 설명" class="skill-desc-input" style="flex-grow:2;"></textarea><button type="button" class="remove-btn">삭제</button>`;
            } else {
                newItem.innerHTML = `<select class="reco-select" style="flex-grow:1;"><option value="">--선택--</option>${optionsHTML}</select><button type="button" class="remove-btn">삭제</button>`;
            }
            container.appendChild(newItem);
        }

        function handleGeneratePokemonCode() {
            const getVal = (id) => document.getElementById(id).value;
            const nameKo = getVal('p-name-ko');
            const nameEn = getVal('p-name-en');
            const id = nameEn.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const type = getVal('p-type');

            if(!id || !type) {
                alert('포켓몬 영문 이름과 타입을 선택해주세요. 고유 ID 생성에 필요합니다.');
                return;
            }

            const lev4Data = {
                name: { ko: nameKo, en: nameEn },
                grade: getVal('p-grade'),
                imageURL: getVal('p-image-url'),
                faceImageURL: getVal('p-face-image-url'),
                stats: { 'HP': parseInt(getVal('p-hp')), 'Speed': parseInt(getVal('p-speed')), 'P.ATK': parseInt(getVal('p-atk')), 'P.DEF': parseInt(getVal('p-def')), 'SP.ATK': parseInt(getVal('p-sp-atk')), 'SP.DEF': parseInt(getVal('p-sp-def')) },
                totalStats: parseInt(getVal('p-total-stats')),
                natures: Array.from(document.querySelectorAll('#p-natures-container input:checked')).map(cb => cb.value),
                skills: Array.from(document.querySelectorAll('#skills-list .dynamic-list-item')).map(item => ({
                    name: item.querySelector('.skill-name-input').value,
                    type: item.querySelector('.skill-type-select').value,
                    description: item.querySelector('.skill-desc-input').value
                })),
                recommendedItems: Array.from(document.querySelectorAll('#reco-items-list .reco-select')).map(select => {
                    const selectedOption = select.options[select.selectedIndex];
                    return { id: select.value, name: selectedOption.text, imageURL: selectedOption.dataset.imageUrl || '' };
                }),
                recommendedRunes: Array.from(document.querySelectorAll('#reco-runes-list .reco-select')).map(select => {
                    const selectedOption = select.options[select.selectedIndex];
                    return { id: select.value, name: selectedOption.text, imageURL: selectedOption.dataset.imageUrl || '' };
                }),
                recommendedChips: Array.from(document.querySelectorAll('#reco-chips-list .reco-select')).map(select => {
                    const selectedOption = select.options[select.selectedIndex];
                    return { id: select.value, name: selectedOption.text, imageURL: selectedOption.dataset.imageUrl || '' };
                })
            };

            const lev4Code = `'${id}': ${JSON.stringify(lev4Data, null, 4)},`;
            const lev3Code = `{ id: '${id}', name: '${nameKo}' },`;

            codeOutput.value = `/* --- 1. pokemonType.lev4 객체 안에 추가할 코드 --- */\n${lev4Code}\n\n/* --- 2. pokemonType.lev3['${type}'] 배열 안에 추가할 코드 --- */\n${lev3Code}`;
            alert('코드가 생성되었습니다!');
        }

        function renderAdminDashboard() {
            adminContent.innerHTML = `<h3>데이터 추가 종류 선택</h3><select id="data-type-selector"><option value="">-- 종류 선택 --</option><option value="pokemon">포켓몬</option></select><div id="admin-form-container" style="margin-top: 20px;"></div>`;
        }
        
        renderAdminDashboard();

        document.getElementById('data-type-selector').addEventListener('change', (e) => {
            if (e.target.value === 'pokemon') { renderAddPokemonForm(); }
            else { document.getElementById('admin-form-container').innerHTML = `<h4>'${e.target.options[e.target.selectedIndex].text}' 추가 폼 (개발 예정)</h4>`; }
        });

        adminPanel.addEventListener('click', (e) => {
            if (e.target.id === 'generate-pokemon-code') handleGeneratePokemonCode();
            else if (e.target.classList.contains('remove-btn')) e.target.parentElement.remove();
            else if (e.target.id === 'add-skill-btn') addDynamicField('skills-list');
            else if (e.target.id === 'add-reco-item-btn') {
                const itemOptions = Object.entries(DB.item.lev4 || {}).map(([id, item]) => `<option value="${id}" data-image-url="${item.imageURL || ''}">${item.name}</option>`).join('');
                addDynamicField('reco-items-list', itemOptions);
            }
            else if (e.target.id === 'add-reco-rune-btn') {
                const runeOptions = (DB.runeAndChip.lev3.rune || []).map(r => {
                    const runeData = DB.runeAndChip.lev4[r.id] || {};
                    return `<option value="${r.id}" data-image-url="${runeData.imageURL || ''}">${r.name}</option>`;
                }).join('');
                addDynamicField('reco-runes-list', runeOptions);
            }
            else if (e.target.id === 'add-reco-chip-btn') {
                const chipOptions = (DB.runeAndChip.lev3.chip || []).map(c => {
                    const chipData = DB.runeAndChip.lev4[c.id] || {};
                    return `<option value="${c.id}" data-image-url="${chipData.imageURL || ''}">${c.name}</option>`;
                }).join('');
                addDynamicField('reco-chips-list', chipOptions);
            }
        });
    }
    
    function initializeAppUserMode() {
        // ...
    }
});