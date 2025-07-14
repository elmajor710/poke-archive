function renderPokemonView(contentDiv, data) {
            const detailView = document.createElement('div');
            detailView.className = 'pokemon-detail-view';

            // Firebase 데이터(data.name_ko)와 기존 data.js(data.name.ko)를 모두 처리
            const nameKo = data.name_ko || (data.name && data.name.ko);
            const nameEn = data.name_en || (data.name && data.name.en);

            let badgesHTML = '<div class="badge-container">';
            if(data.grade) {
                const gradeClass = `grade-${data.grade.toLowerCase().replace('+', '-plus')}`;
                badgesHTML += `<span class="grade-badge ${gradeClass}">${data.grade}</span>`;
            }
            if (data.types && data.types.length > 0) {
                data.types.forEach(typeId => {
                    const typeInfo = DB.pokemonType.lev2.find(t => t.id === typeId);
                    if (typeInfo) {
                        badgesHTML += `<span class="type-badge" style="background-color:${typeInfo.color};">${typeInfo.name}</span>`;
                    }
                });
            }
            badgesHTML += '</div>';
            
            // alt와 h2 태그에 새로운 변수(nameKo, nameEn) 사용
            let commonHTML = `<h2>${nameKo} <span style="font-size:0.8em; color:#666;">${nameEn}</span></h2>`;
            commonHTML += badgesHTML;
            if (data.imageURL) { commonHTML += `<img src="${data.imageURL}" alt="${nameKo}" class="main-image">`; }
            
            let statsHTML = '';
            if (data.stats) {
                const totalStats = data.totalStats || Object.values(data.stats).reduce((a, b) => a + b, 0);
                statsHTML += `<h4>종족값 (총합: ${totalStats})</h4><table class="stats-table">`;
                Object.entries(data.stats).forEach(([stat, value]) => { statsHTML += `<tr><td>${stat}</td><td>${value}</td></tr>`; });
                statsHTML += '</table>';
            }
            let skillsHTML = '';
            if (data.skills && data.skills.length > 0) {
                skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
                data.skills.forEach((skill, index) => { 
                    skillsHTML += `<li class="skill-item"><span class="skill-name" data-skill-index="${index}">${skill.name}</span><span class="skill-type">${skill.type}</span></li>`; 
                });
                skillsHTML += '</ul>';
            }
            let buildHTML = '';
            if (data.recommendedNatures && data.recommendedNatures.length > 0) {
                const natureNames = data.recommendedNatures.map(natureId => DB.definitions.natures.find(n => n.id === natureId)?.name || '').filter(Boolean);
                buildHTML += `<h4>추천 성격</h4><p>${natureNames.join(', ')}</p>`;
            }
            
            const recommendTypes = { recommendedItems: '추천 아이템', recommendedRunes: '추천 룬', recommendedChips: '추천 칩' };
            for (const type in recommendTypes) {
                if (data[type] && data[type].length > 0) {
                    buildHTML += `<h4>${recommendTypes[type]}</h4><div class="recommend-list">`;
                    
                    data[type].forEach(id => {
                        const itemTypeForDB = type.replace('recommended', '').toLowerCase().replace('s', '');
                        const dbKey = (itemTypeForDB === 'rune' || itemTypeForDB === 'chip') ? 'runeAndChip' : 'item';
                        
                        const itemData = DB[dbKey]?.lev4?.[id];
                        
                        if (itemData) {
                             buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">
                                        ${itemData.imageURL ? `<img src="${itemData.imageURL}" alt="${itemData.name}">` : ''}<span>${itemData.name}</span>
                                     </div>`;
                        } else {
                            buildHTML += `<div class="recommend-item" data-item-id="${id}" data-item-type="${itemTypeForDB}">
                                            <span>${id} (정보 없음)</span>
                                         </div>`;
                        }
                    });
                    
                    buildHTML += `</div>`;
                }
            }
            
            detailView.innerHTML = commonHTML + statsHTML + skillsHTML + buildHTML;
            contentDiv.innerHTML = '';
            contentDiv.appendChild(detailView);

            contentDiv.querySelectorAll('.skill-name').forEach(el => { 
                el.addEventListener('click', () => { 
                    const skillIndex = parseInt(el.dataset.skillIndex);
                    const skill = data.skills[skillIndex];
                    if (skill) {
                        let skillDetailContent = `<p>${skill.description || ''}</p>`;
                        if (skill.keywords && skill.keywords.length > 0) {
                            skillDetailContent += '<hr><h4>키워드 설명</h4><ul>';
                            skill.keywords.forEach(kw => {
                                skillDetailContent += `<li><strong>${kw.term}:</strong> ${kw.desc}</li>`;
                            });
                            skillDetailContent += '</ul>';
                        }
                        showModal(skill.name, skillDetailContent); 
                    }
                }); 
            });

            contentDiv.querySelectorAll('.recommend-item').forEach(el => { 
                el.addEventListener('click', () => { 
                    const itemId = el.dataset.itemId;
                    const itemType = el.dataset.itemType;
                    const dbKey = (itemType === 'rune' || itemType === 'chip') ? 'runeAndChip' : 'item';
                    const itemData = DB[dbKey]?.lev4?.[itemId];
                    if (itemData) { 
                        showModal(itemData.name, `<p>${itemData.description || '상세 정보가 없습니다.'}</p>`); 
                    }
                }); 
            });
        }