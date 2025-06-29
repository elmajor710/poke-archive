document.addEventListener('DOMContentLoaded', () => {
    console.log('스크립트 초기화 완료. Nirvana Pokedex v11.0-admin-pokemon-form');

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
        appContainer.style.display = 'none';
        adminPanel.style.display = 'block';
        const adminContent = document.getElementById('admin-content');
        const codeOutput = document.getElementById('code-output');
        
        function renderAddPokemonForm() {
            const formContainer = document.getElementById('admin-form-container');
            const gradeOptions = DB.pokemonGrade.lev2.map(g => `<option value="${g.name}">${g.name}</option>`).join('');
            const natureOptions = DB.definitions.natures.map(n => `<div><input type="checkbox" id="nature-${n.id}" name="natures" value="${n.name}"><label for="nature-${n.id}">${n.name}</label></div>`).join('');

            formContainer.innerHTML = `
                <h4>포켓몬 추가</h4>
                <fieldset><legend>기본 정보</legend>
                    <div class="form-group"><label for="p-name-ko">이름 (한글):</label><input type="text" id="p-name-ko"></div>
                    <div class="form-group"><label for="p-name-en">이름 (영문):</label><input type="text" id="p-name-en"></div>
                    <div class="form-group"><label for="p-grade">등급:</label><select id="p-grade">${gradeOptions}</select></div>
                    <div class="form-group"><label for="p-image-url">이미지 URL:</label><input type="text" id="p-image-url"></div>
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
                <fieldset><legend>추천 성격</legend><div style="display: flex; flex-wrap: wrap; gap: 15px;">${natureOptions}</div></fieldset>
                <fieldset><legend>스킬</legend><div id="skills-list"></div><button type="button" class="add-btn" id="add-skill-btn">스킬 추가</button></fieldset>
                <fieldset><legend>추천 아이템</legend><div id="reco-items-list"></div><button type="button" class="add-btn" id="add-reco-item-btn">아이템 추가</button></fieldset>
                <fieldset><legend>추천 룬</legend><div id="reco-runes-list"></div><button type="button" class="add-btn" id="add-reco-rune-btn">룬 추가</button></fieldset>
                <fieldset><legend>추천 칩</legend><div id="reco-chips-list"></div><button type="button" class="add-btn" id="add-reco-chip-btn">칩 추가</button></fieldset>
                <button id="generate-pokemon-code" style="margin-top:20px; padding: 10px; font-size: 16px;">코드 생성</button>
            `;
        }

        function handleGeneratePokemonCode() {
            // ... 코드 생성 로직 ...
            alert('포켓몬 코드가 생성되었습니다!');
        }

        function renderAdminDashboard() {
            adminContent.innerHTML = `<h3>데이터 추가 종류 선택</h3><select id="data-type-selector"><option value="">-- 종류 선택 --</option><option value="pokemon">포켓몬</option></select><div id="admin-form-container" style="margin-top: 20px;"></div>`;
        }
        
        renderAdminDashboard();

        document.getElementById('data-type-selector').addEventListener('change', (e) => {
            if (e.target.value === 'pokemon') { renderAddPokemonForm(); }
            else { document.getElementById('admin-form-container').innerHTML = ''; }
        });

        adminPanel.addEventListener('click', (e) => {
            if (e.target.id === 'generate-pokemon-code') handleGeneratePokemonCode();
            // ... 다른 버튼 이벤트 리스너들 ...
        });

    } else {
        // ... (이전 최종본의 일반 사용자 모드 코드 전체)
    }
});