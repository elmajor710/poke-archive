// [모바일 전용 최종본] Nirvana Pokedex script.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('모바일 전용 스크립트 초기화 완료');

    window.addEventListener('popstate', function(event) {
        event.preventDefault();
        handleBackButton();
    });

    history.replaceState({ page: 'main' }, '');

    function setupAdObservers() {
        var adContainers = document.querySelectorAll('.ad-container');
        if (adContainers.length === 0) return;
        var adObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    try {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    } catch (e) {
                        console.error('AdSense push error:', e);
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        adContainers.forEach(function(container) {
            if (container.querySelector('ins.adsbygoogle') && container.querySelector('ins.adsbygoogle').innerHTML.trim() === '') {
                 adObserver.observe(container);
            }
        });
    }

    var adBlockManager = {
        CLICK_LIMIT: 3,
        TIME_WINDOW: 5 * 60 * 1000,
        checkAndApplyBlock: function() {
            var expiresAt = localStorage.getItem('adBlockExpiresAt');
            if (!expiresAt) return;
            var now = new Date().getTime();
            if (now < parseInt(expiresAt)) {
                this.hideAds();
            } else {
                localStorage.removeItem('adBlockExpiresAt');
                localStorage.removeItem('adClickTimestamps');
            }
        },
        recordClick: function() {
            var timestamps = JSON.parse(localStorage.getItem('adClickTimestamps')) || [];
            var now = new Date().getTime();
            var self = this;
            timestamps = timestamps.filter(function(ts) { return (now - ts) < self.TIME_WINDOW; });
            timestamps.push(now);
            localStorage.setItem('adClickTimestamps', JSON.stringify(timestamps));
            if (timestamps.length >= this.CLICK_LIMIT) {
                var tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                localStorage.setItem('adBlockExpiresAt', tomorrow.getTime());
                this.hideAds();
            }
        },
        hideAds: function() {
            document.querySelectorAll('.ad-container').forEach(function(container) {
                container.classList.add('hidden');
            });
        }
    };

    var appContainer = document.getElementById('app-container');
    var sidebar = document.getElementById('sidebar');
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    var mainPlaceholder = document.getElementById('main-placeholder');
    var panels = {
        lev1: sidebar,
        lev2: document.getElementById('lev2-panel'),
        lev3: document.getElementById('lev3-panel'),
        lev4: document.getElementById('lev4-panel')
    };
    var activeButtons = {};

    function handleBackButton() {
        var listPage = document.getElementById('list-filter-page');
        var lev4Panel = document.getElementById('lev4-panel');
        var lev3Panel = document.getElementById('lev3-panel');
        var lev2Panel = document.getElementById('lev2-panel');

        var openModal = document.querySelector('.modal-overlay.custom-modal');
        if (openModal && openModal.style.display === 'flex') {
            openModal.remove();
            return;
        }

        var filterModal = document.getElementById('filter-modal-overlay');
        if (filterModal && filterModal.style.display === 'flex') {
            closeFilterModal();
            return;
        }

        if (listPage && listPage.classList.contains('visible')) {
            if (lev4Panel.classList.contains('visible')) {
                lev4Panel.classList.remove('visible');
                listPage.classList.add('visible');
            } else {
                hideListPage();
            }
        } 
        else if (lev4Panel.classList.contains('visible')) {
            if (sessionStorage.getItem('returnToMain')) {
                handleMainButtonClick();
            } else {
                lev4Panel.classList.remove('visible');
            }
        } 
        else if (lev3Panel.classList.contains('visible')) {
            lev3Panel.classList.remove('visible');
            lev2Panel.classList.add('visible');
        } 
        else if (lev2Panel.classList.contains('visible')) {
            lev2Panel.classList.remove('visible');
            sidebar.classList.add('visible');
        } 
        else if (sidebar.classList.contains('visible')) {
            sidebar.classList.remove('visible');
            mainPlaceholder.style.display = 'flex';
        } 
        else {
            history.back();
        }
    }

    async function initialize() {
        try {
            await fetchAllDataFromFirebase();
            setupSideMenuData();
            renderSidebar();
            setupAdObservers();
            addEventListeners();
        } catch (error) {
            console.error("초기화 중 심각한 오류 발생:", error);
            document.body.innerHTML = "초기화 중 심각한 오류가 발생했습니다.";
        }
    }

    async function fetchAllDataFromFirebase() {
        var collectionsToFetch = {
            notice: db.collection('notice').where("isPublished", "==", true),
            pokemon: db.collection('pokemon').where("isPublished", "==", true),
            items: db.collection('items').where("isPublished", "==", true),
            runeAndChips: db.collection('runeAndChips').where("isPublished", "==", true),
            tips: db.collection('tips').where("isPublished", "==", true),
            recommendedDecks: db.collection('recommendedDecks').where("isPublished", "==", true),
            events: db.collection('events').where("isPublished", "==", true),
        };
        var promises = Object.values(collectionsToFetch).map(function(query) { return query.get(); });
        var results = await Promise.all(promises);
        
        var snapshotToMap = function(snapshot) {
            var dataMap = {};
            snapshot.forEach(function(doc) { 
                var docData = doc.data();
                dataMap[doc.id] = Object.assign({ id: doc.id }, docData);
            });
            return dataMap;
        };

        DB.notice.lev3 = snapshotToMap(results[0]);
        DB.pokemonType.lev4 = snapshotToMap(results[1]);
        DB.item.lev4 = snapshotToMap(results[2]);
        DB.runeAndChip.lev4 = snapshotToMap(results[3]);
        DB.tips.lev3 = snapshotToMap(results[4]);
        DB.deck.lev4 = snapshotToMap(results[5]);
        
        if(DB.calendar && DB.calendar.lev2) {
            DB.calendar.lev2.events = results[6].docs.map(function(doc) { 
                var docData = doc.data();
                return Object.assign({ id: doc.id }, docData);
            });
        }
    }

    function setupSideMenuData() {
        DB.notice.lev2 = Object.values(DB.notice.lev3).map(function(data) { 
            return { 
                id: data.id, 
                name: data.title,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        }).sort(function(a, b) { 
            var aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
            var bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
            return bTime - aTime;
        });

        DB.pokemonType.lev2.sort(function(a, b) { return a.name.localeCompare(b.name, 'ko'); });
        
        var types = {};
        DB.pokemonType.lev2.forEach(function(type) {
            types[type.id] = [];
        });
        
        Object.values(DB.pokemonType.lev4).forEach(function(pokemon) {
            if (pokemon.types && Array.isArray(pokemon.types)) {
                pokemon.types.forEach(function(typeId) {
                    if (types[typeId]) {
                        types[typeId].push({ 
                            id: pokemon.id, 
                            name: pokemon.name_ko || pokemon.name,
                            faceImageURL: pokemon.faceImageURL
                        });
                    }
                });
            }
        });
        
        Object.values(types).forEach(function(typeList) { 
            typeList.sort(function(a,b) { return a.name.localeCompare(b.name, 'ko'); });
        });
        DB.pokemonType.lev3 = types;

        var grades = {};
        DB.pokemonGrade.lev2.forEach(function(grade) {
            grades[grade.id] = [];
        });
        
        Object.values(DB.pokemonType.lev4).forEach(function(pokemon) {
            if (pokemon && pokemon.grade) {
                var foundGrade = DB.pokemonGrade.lev2.find(function(g) { return g.name === pokemon.grade; });
                var gradeId = foundGrade ? foundGrade.id : null;
                if (gradeId && grades[gradeId]) {
                    grades[gradeId].push({ 
                        id: pokemon.id, 
                        name: pokemon.name_ko || pokemon.name,
                        faceImageURL: pokemon.faceImageURL
                    });
                }
            }
        });
        
        Object.values(grades).forEach(function(gradeList) { 
            gradeList.sort(function(a,b) { return a.name.localeCompare(b.name, 'ko'); });
        });
        DB.pokemonGrade.lev3 = grades;
        
        var itemGrades = { god: [], legendary: [], epic: [] };
        Object.values(DB.item.lev4).forEach(function(item) {
            var gradeKey = item.grade ? item.grade.toLowerCase() : null;
            if (gradeKey && itemGrades[gradeKey]) {
                itemGrades[gradeKey].push({ id: item.id, name: item.name, imageURL: item.imageURL });
            }
        });
        DB.item.lev3 = itemGrades;
        
        var runeAndChipTypes = { rune: [], chip: [] };
        Object.values(DB.runeAndChip.lev4).forEach(function(rc) {
            if(rc.type && runeAndChipTypes[rc.type]) {
                runeAndChipTypes[rc.type].push({ id: rc.id, name: rc.name, imageURL: rc.imageURL });
            }
        });
        DB.runeAndChip.lev3 = runeAndChipTypes;

        DB.tips.lev2 = Object.values(DB.tips.lev3).map(function(data) { 
            return { 
                id: data.id, 
                name: data.name || data.title,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        });
        
        DB.deck.lev3 = {
            recommended: Object.values(DB.deck.lev4).map(function(deck) { 
                return { id: deck.id, name: deck.name, likeCount: deck.likeCount || 0 };
            })
        };
    }

    function isNew(timestamp) {
        if (!timestamp || !timestamp.toDate) return false;
        var postDate = timestamp.toDate();
        var now = new Date();
        var diffTime = now.getTime() - postDate.getTime();
        var diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }

    function renderSidebar() {
        var sidebarContent = document.createElement('div');
        sidebarContent.className = 'panel-content';
        DB.sidebarMenu.forEach(function(item) {
            var button = document.createElement('button');
            button.className = 'menu-item';
            button.dataset.level = 1;
            button.dataset.id = item.id;
            var buttonHTML = item.name;
            var dataToCheck = [];
            if (item.id === 'notice' || item.id === 'tips') {
                var lev3Data = DB[item.id] && DB[item.id].lev3 ? DB[item.id].lev3 : {};
                dataToCheck = Object.values(lev3Data);
            } else if (DB[item.id] && DB[item.id].lev4) {
                dataToCheck = Object.values(DB[item.id].lev4);
            }
            if (dataToCheck.length > 0) {
                var hasNewPost = dataToCheck.some(function(post) { 
                    return isNew(post.updatedAt) || isNew(post.createdAt); 
                });
                if (hasNewPost) {
                    buttonHTML += '<span class="new-badge">N</span>';
                }
            }
            button.innerHTML = buttonHTML;
            sidebarContent.appendChild(button);
        });
        if(sidebar) {
            sidebar.innerHTML = '';
            sidebar.appendChild(sidebarContent);
        }
    }

    function getLikedDecks() {
        return JSON.parse(localStorage.getItem('likedDecks')) || [];
    }

    async function handleLikeClick(button) {
        var deckId = button.dataset.deckId;
        if (!deckId) return;
        var likeCountSpan = button.querySelector('.like-count');
        var heartIcon = button.querySelector('.heart-icon');
        var currentLikes = parseInt(likeCountSpan.textContent);
        var likedDecks = getLikedDecks();
        var isLiked = likedDecks.includes(deckId);
        if (isLiked) {
            likedDecks = likedDecks.filter(function(id) { return id !== deckId; });
            button.classList.remove('liked');
            heartIcon.textContent = '♡';
            likeCountSpan.textContent = currentLikes - 1;
        } else {
            likedDecks.push(deckId);
            button.classList.add('liked');
            heartIcon.textContent = '❤️';
            likeCountSpan.textContent = currentLikes + 1;
        }
        localStorage.setItem('likedDecks', JSON.stringify(likedDecks));
        try {
            await db.collection('recommendedDecks').doc(deckId).update({
                likeCount: firebase.firestore.FieldValue.increment(isLiked ? -1 : 1)
            });
        } catch (error) {
            console.error("좋아요 업데이트 실패:", error);
            alert('일시적인 오류로 좋아요 처리에 실패했습니다.');
            likeCountSpan.textContent = currentLikes;
            if (isLiked) {
                 button.classList.add('liked');
                 heartIcon.textContent = '❤️';
            } else {
                 button.classList.remove('liked');
                 heartIcon.textContent = '♡';
            }
        }
    }

    function handleMenuClick(button) {
        if (parseInt(button.dataset.level) === 1) {
            sessionStorage.removeItem('returnToMain');
        }
        
        history.pushState({ level: parseInt(button.dataset.level), id: button.dataset.id }, '');
        
        mainPlaceholder.style.display = 'none';
        appContainer.classList.add('menu-active');
        
        var level = parseInt(button.dataset.level);
        var id = button.dataset.id;
        var menuId = button.dataset.menuId || id;
        var nextLevel = level + 1;
        var nextData = getNextData(level, id, menuId); 
        var nextPanel = panels['lev' + nextLevel];

        if (!nextPanel) return;
        
        Object.values(panels).forEach(function(p) { p.classList.remove('visible'); });
        
        nextPanel.classList.add('visible');
        
        setActive(level, button);
        renderPanelContent(nextLevel, nextData, menuId, id);
    }
        
    function handleMainButtonClick() {
        sessionStorage.removeItem('returnToMain');
        mainPlaceholder.style.display = 'flex';
        appContainer.classList.remove('menu-active');
        Object.values(panels).forEach(function(panel, index) {
            if (index > 0) panel.classList.remove('visible', 'is-hidden');
        });
        setActive(0, null);
        sidebar.classList.remove('visible', 'is-hidden');
    }

    function setActive(level, target) {
        for (var i = level; i <= 4; i++) {
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

    function getNextData(currentLevel, id, menuId) {
        var nextLevel = currentLevel + 1;
        if (nextLevel === 4 && (menuId === 'pokemonType' || menuId === 'pokemonGrade')) {
            return DB.pokemonType.lev4 && DB.pokemonType.lev4[id] ? DB.pokemonType.lev4[id] : null;
        }
        if (nextLevel === 2) {
            return DB[menuId] && DB[menuId].lev2 ? DB[menuId].lev2 : null;
        }
        if (nextLevel === 3) {
            if (menuId === 'notice' || menuId === 'tips') {
                return DB[menuId] && DB[menuId].lev3 && DB[menuId].lev3[id] ? DB[menuId].lev3[id] : null;
            }
            return DB[menuId] && DB[menuId].lev3 && DB[menuId].lev3[id] ? DB[menuId].lev3[id] : null;
        }
        if (nextLevel === 4) {
            return DB[menuId] && DB[menuId].lev4 && DB[menuId].lev4[id] ? DB[menuId].lev4[id] : null;
        }
        return null;
    }

    function renderCardList(data, menuId, container, level) {
        var dataArray = Array.isArray(data) ? data : Object.values(data);

        dataArray.sort(function(a, b) {
            var nameA = a.name_ko || a.name || a.title || '';
            var nameB = b.name_ko || b.name || b.title || '';
            return nameA.localeCompare(nameB, 'ko');
        });

        var listHTML = dataArray.map(function(item) {
            var name = item.name_ko || item.name || item.title;
            var imageURL = item.faceImageURL || item.imageURL || 'https://via.placeholder.com/64';
            var infoHTML = '';
            if (item.grade) {
                infoHTML += '<span class="grade-badge grade-' + item.grade.toLowerCase().replace('+', '-plus') + '">' + item.grade + '</span>';
            }
            if (item.types) {
                infoHTML += '<div class="type-badges-container">';
                item.types.forEach(function(typeId) {
                    var typeInfo = DB.pokemonType.lev2.find(function(t) { return t.id === typeId; });
                    if (typeInfo) {
                        infoHTML += '<span class="type-badge" style="background-color:' + typeInfo.color + ';">' + typeInfo.name + '</span>';
                    }
                });
                infoHTML += '</div>';
            }

            return '<div class="list-item-card" data-id="' + item.id + '" data-menu-id="' + menuId + '" data-level="' + level + '"><div class="item-card-image"><img src="' + imageURL + '" alt="' + name + '"></div><div class="item-card-info"><strong class="item-card-name">' + name + '</strong><div class="item-card-details">' + infoHTML + '</div></div></div>';
        }).join('');
        container.innerHTML = listHTML;
    }

    function renderPanelContent(level, data, menuId, clickedId) {
        var targetPanel = panels['lev' + level];
        if (!targetPanel) return;
        var contentDiv = targetPanel.querySelector('.panel-content');
        if (!contentDiv) return;
        
        targetPanel.querySelector('.panel-header').innerHTML = '<button class="back-btn">&lt; 뒤로</button>';
        contentDiv.innerHTML = '';
        contentDiv.scrollTop = 0;

        if (!data) {
            contentDiv.innerHTML = "데이터를 불러오지 못했습니다.";
            return;
        }

        var categoryInfo = DB.sidebarMenu.find(function(item) { return item.id === menuId; });
        var isFinalView = (level === (categoryInfo ? categoryInfo.levels : 0));

        if (isFinalView) {
            if (menuId === 'deck' && data.composition) {
                renderDeckView(contentDiv, data);
            } else if (menuId === 'calendar') {
                renderCalendarView(contentDiv, DB.calendar.lev2);
            } else if (menuId === 'pokemonType' || menuId === 'pokemonGrade') {
                renderPokemonView(contentDiv, data, menuId);
            } else {
                renderSimpleView(contentDiv, data, menuId);
            }
        } else {
            var cardLayoutMenus = ['pokemonType', 'pokemonGrade', 'item', 'runeAndChip'];
            
            if (level === 3 && cardLayoutMenus.includes(menuId)) {
                renderCardList(data, menuId, contentDiv, level);
            } else {
                data.forEach(function(item) {
                    var button = document.createElement('button');
                    button.className = 'list-item';
                    button.dataset.id = item.id;
                    button.dataset.level = level;
                    button.dataset.menuId = menuId;
                    
                    var itemHTML = '<span>' + (item.name || '이름 없음') + '</span>';
                    if (menuId === 'pokemonType' && item.iconURL) {
                        itemHTML = '<img src="' + item.iconURL + '" class="list-item-icon">' + itemHTML;
                    }
                    var newBadge = isNew(item.updatedAt) || isNew(item.createdAt) ? '<span class="new-badge-list">New</span>' : '';
                    button.innerHTML = itemHTML + newBadge;
                    contentDiv.appendChild(button);
                });
            }
        }
    }

    function showModal(title, contentElement) {
        console.log('showModal 호출:', title);
        
        var existingModal = document.querySelector('.modal-overlay.custom-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        var modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay custom-modal';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
        modalOverlay.style.zIndex = '10000';
        
        var modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        var modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = '<h2>' + title + '</h2><button class="modal-close-btn">&times;</button>';
        
        var modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.appendChild(contentElement);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        console.log('모달 DOM 추가 완료');
        
        var closeModal = function() {
            console.log('모달 닫기');
            modalOverlay.remove();
        };
        
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        var closeBtn = modalContent.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
    }

    function renderPokemonView(contentDiv, data, menuId) {
        var detailView = document.createElement('div');
        var nameKo = data.name_ko || '이름 없음';
        var nameEn = data.name_en || '';
        var commonHTML = '<h2>' + nameKo + ' <span style="font-size:0.8em; color:#666;">' + nameEn + '</span></h2>';
        var badgesHTML = '<div class="badge-container">';
        if (data.grade) {
            var gradeClass = 'grade-' + data.grade.toLowerCase().replace('+', '-plus');
            badgesHTML += '<span class="grade-badge ' + gradeClass + '">' + data.grade + '</span>';
        }
        if (data.types && data.types.length > 0) {
            data.types.forEach(function(typeId) {
                var typeInfo = DB.pokemonType.lev2.find(function(t) { return t.id === typeId; });
                if (typeInfo) badgesHTML += '<span class="type-badge" style="background-color:' + typeInfo.color + ';">' + typeInfo.name + '</span>';
            });
        }
        badgesHTML += '</div>';
        commonHTML += badgesHTML;
        if (data.imageURL) commonHTML += '<img src="' + data.imageURL + '" alt="' + nameKo + '" class="main-image">';
        
        var statsHTML = '';
        if (data.stats) {
            var totalStats = Object.values(data.stats).reduce(function(a, b) { return Number(a) + Number(b); }, 0);
            statsHTML += '<h4>종족값 (총합: ' + totalStats + ')</h4><table class="stats-table">';
            Object.entries(data.stats).forEach(function(entry) {
                statsHTML += '<tr><td>' + entry[0].toUpperCase() + '</td><td>' + entry[1] + '</td></tr>';
            });
            statsHTML += '</table>';
        } else {
            statsHTML = '<h4>기본 정보</h4><p>등록된 종족값 정보가 없습니다.</p>';
        }
        
        var skillsHTML = '';
        if (data.skills && data.skills.length > 0 && data.skills.some(function(s) { return s.name; })) {
            skillsHTML += '<h4>스킬</h4><ul class="skill-list">';
            data.skills.forEach(function(skill, index) { 
                if(skill.name) skillsHTML += '<li class="skill-item"><span class="skill-name" data-skill-index="' + index + '">' + skill.name + '</span><span class="skill-type">' + skill.type + '</span></li>'; 
            });
            skillsHTML += '</ul>';
        } else {
            skillsHTML = '<h4>스킬</h4><p>등록된 스킬 정보가 없습니다.</p>';
        }
        
        var buildHTML = '';
        var hasBuildInfo = false;
        if (data.build_concept) {
            buildHTML += '<h4>빌드 콘셉트</h4><p>' + data.build_concept + '</p>';
            hasBuildInfo = true;
        }
        if (data.recommendedNatures && data.recommendedNatures.length > 0) {
            var natureNames = data.recommendedNatures.map(function(natureId) { 
                var nature = DB.definitions.natures.find(function(n) { return n.id === natureId; });
                return nature ? nature.name : '';
            }).filter(Boolean);
            if(natureNames.length > 0) {
                buildHTML += '<h4>추천 성격</h4><p>' + natureNames.join(', ') + '</p>';
                hasBuildInfo = true;
            }
        }
        
        var recommendTypes = { 
            recommendedItems: '추천 아이템', 
            recommendedRunes: '추천 룬', 
            recommendedChips: '추천 칩' 
        };

        for (var type in recommendTypes) {
            if (data[type] && data[type].length > 0) {
                hasBuildInfo = true;
                buildHTML += '<h4>' + recommendTypes[type] + '</h4><div class="recommend-list">';

                data[type].forEach(function(item) {
                    var isObject = typeof item === 'object' && item !== null;
                    var id = isObject ? item.id : item;
                    var count = isObject ? item.count : null;

                    var dbKey = (type === 'recommendedRunes' || type === 'recommendedChips') ? 'runeAndChip' : 'item';
                    var itemData = DB[dbKey] && DB[dbKey].lev4 ? DB[dbKey].lev4[id] : null;

                    if (itemData) {
                        var countHTML = count ? '<span class="recommend-item-count">x' + count + '</span>' : '';
                        buildHTML += '<div class="recommend-item" data-item-id="' + id + '" data-item-type="' + dbKey + '">';
                        if (itemData.imageURL) buildHTML += '<img src="' + itemData.imageURL + '" alt="' + itemData.name + '">';
                        buildHTML += '<div class="recommend-item-info"><span class="recommend-item-name">' + itemData.name + '</span>' + countHTML + '</div></div>';
                    }
                });
                buildHTML += '</div>';
            }
        }
        
        if (!hasBuildInfo) {
            buildHTML = '<h4>추천 빌드</h4><p>등록된 추천 빌드 정보가 없습니다.</p>';
        }
        
        detailView.className = 'pokemon-detail-view use-tabs';
        detailView.innerHTML = commonHTML + '<div class="tab-container"><nav class="tab-nav"><button class="tab-button active" data-tab="tab-info">기본 정보</button><button class="tab-button" data-tab="tab-skills">스킬</button><button class="tab-button" data-tab="tab-build">추천 빌드</button></nav><div id="tab-info" class="tab-pane active">' + statsHTML + '</div><div id="tab-skills" class="tab-pane">' + skillsHTML + '</div><div id="tab-build" class="tab-pane">' + buildHTML + '</div></div>';
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);
        
        setTimeout(function() {
            var skillNames = detailView.querySelectorAll('.skill-name');
            skillNames.forEach(function(el) {
                el.addEventListener('click', function() {
                    console.log('스킬 클릭됨');
                    var skillIndex = parseInt(el.dataset.skillIndex);
                    var skill = data.skills[skillIndex];
                    if (skill) {
                        var skillDetailElement = document.createElement('div');
                        var contentHTML = '<p>' + (skill.description || '') + '</p>';
                        if (skill.keywords && skill.keywords.length > 0 && skill.keywords.some(function(kw) { return kw.term; })) {
                            contentHTML += '<hr><h4>키워드 설명</h4><ul>';
                            skill.keywords.forEach(function(kw) {
                                if(kw.term) contentHTML += '<li><strong>' + kw.term + ':</strong> ' + (kw.desc || '') + '</li>';
                            });
                            contentHTML += '</ul>';
                        }
                        skillDetailElement.innerHTML = contentHTML;
                        showModal(skill.name, skillDetailElement);
                    }
                });
            });
            
            var recommendItems = detailView.querySelectorAll('.recommend-item');
            recommendItems.forEach(function(el) {
                el.addEventListener('click', function() {
                    console.log('추천 아이템 클릭됨');
                    var itemId = el.dataset.itemId;
                    var dbKey = el.dataset.itemType;
                    var itemData = DB[dbKey] && DB[dbKey].lev4 ? DB[dbKey].lev4[itemId] : null;
                    if (itemData) {
                        var tempContentDiv = document.createElement('div');
                        renderSimpleView(tempContentDiv, itemData, dbKey);
                        showModal(itemData.name, tempContentDiv);
                    }
                });
            });
            
            var tabButtons = detailView.querySelectorAll('.tab-button');
            tabButtons.forEach(function(button) {
                button.addEventListener('click', function() {
                    if (button.classList.contains('active')) return;
                    detailView.querySelector('.tab-button.active').classList.remove('active');
                    detailView.querySelector('.tab-pane.active').classList.remove('active');
                    button.classList.add('active');
                    var tabId = button.dataset.tab;
                    detailView.querySelector('#' + tabId).classList.add('active');
                });
            });
        }, 100);
    }

    function renderSimpleView(contentDiv, data, menuId) {
        var detailView = document.createElement('div');
        detailView.className = 'simple-detail-view';
        var html = '<h2>' + (data.name || data.title) + '</h2>';
        if (data.grade) {
            var gradeClass = 'grade-' + data.grade.toLowerCase();
            html += '<div class="badge-container"><span class="grade-badge ' + gradeClass + '">' + data.grade + '</span></div>';
        }
        if (data.imageURL) {
            html += '<img src="' + data.imageURL + '" alt="' + data.name + '" class="main-image">';
        }
        var description = data.description || data.htmlContent || '';
        if (menuId === 'tips' || menuId === 'notice') {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            var paragraphs = tempDiv.querySelectorAll('p');
            paragraphs.forEach(function(p) {
                var text = p.textContent || p.innerText;
                if (text.includes('[TIP]')) {
                    p.innerHTML = p.innerHTML.replace('[TIP]', '');
                    var wrapper = document.createElement('div');
                    wrapper.className = 'tip-box';
                    p.parentNode.insertBefore(wrapper, p);
                    wrapper.appendChild(p);
                } else if (text.includes('[주의]')) {
                    p.innerHTML = p.innerHTML.replace('[주의]', '');
                    var wrapper = document.createElement('div');
                    wrapper.className = 'warning-box';
                    p.parentNode.insertBefore(wrapper, p);
                    wrapper.appendChild(p);
                }
            });
            description = tempDiv.innerHTML;
        }
        html += '<div class="item-description">' + description.replace(/\\n/g, '<br>') + '</div>';
        detailView.innerHTML = html;
        contentDiv.innerHTML = '';
        contentDiv.appendChild(detailView);
    }

    function calculateSynergy(pokemonIds) {
        if (!DB.synergyEffects || !pokemonIds || pokemonIds.length < 6) return null;
        var mainPokemon = pokemonIds.map(function(id) { return DB.pokemonType.lev4[id]; });
        if (mainPokemon.some(function(pkm) { return !pkm; })) return null;
        var typePokemonCount = {};
        mainPokemon.forEach(function(pkm) {
            if (pkm && pkm.types) {
                pkm.types.forEach(function(type) {
                    typePokemonCount[type] = (typePokemonCount[type] || 0) + 1;
                });
            }
        });
        var counts = Object.values(typePokemonCount).sort(function(a, b) { return b - a; });
        var totalUniqueTypes = Object.keys(typePokemonCount).length;
        if (counts.length > 0 && counts[0] >= 6) return DB.synergyEffects.find(function(s) { return s.id === 'same6'; });
        if (counts.length >= 2 && counts[0] >= 3 && counts[1] >= 3) return DB.synergyEffects.find(function(s) { return s.id === 'same3x2'; });
        if (counts.length >= 2 && counts[0] >= 4 && counts[1] >= 2) return DB.synergyEffects.find(function(s) { return s.id === 'same4_2'; });
        var totalPairs = counts.reduce(function(sum, c) { return sum + Math.floor(c / 2); }, 0);
        if (totalPairs >= 3) return DB.synergyEffects.find(function(s) { return s.id === 'same2x3'; });
        if (counts.length > 0 && counts[0] >= 3) return DB.synergyEffects.find(function(s) { return s.id === 'same3'; });
        if (totalUniqueTypes >= 6 && pokemonIds.length >= 6) return DB.synergyEffects.find(function(s) { return s.id === 'diff6'; });
        return null;
    }

    function renderDeckView(contentDiv, data) {
        var weatherToEmoji = { '매우맑음': '☀️', '맑음': '🌤️', '눈폭풍': '❄️', '비': '🌧️' };
        var likedDecks = getLikedDecks();
        var isLiked = likedDecks.includes(data.id);
        var likeButtonHTML = '<div class="like-container"><button class="like-btn ' + (isLiked ? 'liked' : '') + '" data-deck-id="' + data.id + '"><span class="heart-icon">' + (isLiked ? '❤️' : '♡') + '</span><span class="like-count">' + (data.likeCount || 0) + '</span></button></div>';

        var html = '<div class="deck-detail-view"><div class="deck-header"><h2>' + data.name + '</h2>' + likeButtonHTML + '</div>';
        if (data.description) { 
            html += '<p class="deck-description">' + data.description + '</p>'; 
        }
        html += '<h4>덱 배치</h4><div class="deck-grid-container">';

        var positionMap = {
            'assist_4': 'r2c1', 'assist_5': 'r3c1', 'assist_6': 'r4c1',
            'assist_1': 'r2c2', 'assist_2': 'r3c2', 'assist_3': 'r4c2',
            'main_4':   'r2c3', 'main_5':   'r3c3', 'main_6':   'r4c3',
            'main_1':   'r2c4', 'main_2':   'r3c4', 'main_3':   'r4c4'
        };

        var weather = data.weather && weatherToEmoji[data.weather] ? weatherToEmoji[data.weather] : '';
        var mainPokemonIds = data.composition.filter(function(m) { return m.role === 'main'; }).map(function(m) { return m.pokemonId; });
        var synergy = calculateSynergy(mainPokemonIds);

        html += '<div class="grid-item grid-header-item" style="grid-area: r1c1;">' + weather + '</div>';
        html += '<div class="grid-item grid-header-item" style="grid-area: r1c2;">' + (synergy ? '<img src="' + synergy.imageURL + '" alt="' + synergy.name + '">' : '') + '</div>';

        var gridItems = {};
        data.composition.forEach(function(member) {
            var pkmData = DB.pokemonType.lev4[member.pokemonId];
            if (pkmData) {
                var gridArea = positionMap[member.role + '_' + member.position];
                gridItems[gridArea] = pkmData;
            }
        });

        for (var r = 2; r <= 4; r++) {
            for (var c = 1; c <= 4; c++) {
                var area = 'r' + r + 'c' + c;
                var item = gridItems[area];
                if (item) {
                    html += '<div class="grid-item" style="grid-area: ' + area + ';"><div class="deck-pokemon-cell" data-pokemon-id="' + item.id + '"><img src="' + item.faceImageURL + '" alt="' + item.name_ko + '"></div></div>';
                } else {
                    html += '<div class="grid-item grid-empty-cell" style="grid-area: ' + area + ';"></div>';
                }
            }
        }

        html += '<div class="grid-footer" style="grid-area: r5c1;">어시스트 #1~#6</div>';
        html += '<div class="grid-footer" style="grid-area: r5c2;">메인덱 #1~#6</div>';
        html += '</div></div>';
        contentDiv.innerHTML = html;

        setTimeout(function() {
            contentDiv.querySelectorAll('.deck-pokemon-cell').forEach(function(cell) {
                cell.addEventListener('click', function() {
                    console.log('덱 포켓몬 클릭됨');
                    var pokemonId = cell.dataset.pokemonId;
                    var pkmData = DB.pokemonType.lev4[pokemonId];
                    if (pkmData) {
                        var tempContentDiv = document.createElement('div');
                        renderPokemonView(tempContentDiv, pkmData, 'pokemonType');
                        showModal(pkmData.name_ko || pkmData.name, tempContentDiv);
                    }
                });
            });
        }, 100);
    }

    function renderCalendarView(contentDiv, data) {
        var currentCalendarDate = new Date();
        
        function buildCalendar(year, month) {
            var calendarView = document.createElement('div');
            calendarView.className = 'calendar-view';
            var monthEvents = {};
            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            
            var addEvent = function(event, eventDate) {
                var day = eventDate.getDate();
                if (!monthEvents[day]) monthEvents[day] = [];
                var startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
                var endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + (event.duration - 1));
                monthEvents[day].push({ startDate: startDate, endDate: endDate, title: event.title || event.name, description: event.description, type: event.type, duration: event.duration });
            };
            
            if (data.events) {
                data.events.forEach(function(event) {
                    if (!event.startDate) return;
                    var startDate = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
                    for (var i = 0; i < (event.duration || 1); i++) {
                        var eventDate = new Date(startDate);
                        eventDate.setDate(eventDate.getDate() + i);
                        if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                            addEvent(event, eventDate);
                        }
                    }
                });
            }
            
            var html = '<div class="calendar-header"><span class="calendar-title">' + year + '년 ' + (month + 1) + '월</span><div class="calendar-nav"><button id="cal-prev-btn">&lt; 이전</button><button id="cal-today-btn">Today</button><button id="cal-next-btn">다음 &gt;</button></div></div>';
            html += '<div class="calendar-legend"><div class="legend-item"><span class="legend-dot event-type-ranking"></span> 랭킹뽑기</div><div class="legend-item"><span class="legend-dot event-type-limited"></span> 한정뽑기</div><div class="legend-item"><span class="legend-dot event-type-luckycat"></span> 복냥이</div><div class="legend-item"><span class="legend-dot event-type-carnival"></span> 카니발</div><div class="legend-item"><span class="legend-dot event-type-season"></span> 시즌</div><div class="legend-item"><span class="legend-dot event-type-etc"></span> 기타</div></div>';
            html += '<table class="calendar-grid"><thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead><tbody>';
            
            var dateCounter = 1;
            var startDay = firstDay.getDay();
            var daysInMonth = lastDay.getDate();
            
            for (var i = 0; i < 6; i++) {
                html += '<tr>';
                for (var j = 0; j < 7; j++) {
                    if (i === 0 && j < startDay || dateCounter > daysInMonth) {
                        html += '<td class="day-other-month"></td>';
                    } else {
                        var today = new Date();
                        var isToday = (dateCounter === today.getDate() && month === today.getMonth() && year === today.getFullYear());
                        var eventsOnDay = monthEvents[dateCounter];
                        var cellClass = 'day-current-month';
                        if (isToday) cellClass += ' day-today';
                        if (eventsOnDay) cellClass += ' has-events';
                        
                        html += '<td class="' + cellClass + '" data-day="' + dateCounter + '"><div class="date-number">' + dateCounter + '</div>';
                        if (eventsOnDay) {
                            html += '<div class="event-markers">';
                            eventsOnDay.forEach(function(event) {
                                html += '<div class="event-marker event-type-' + event.type + '">' + event.title + '</div>';
                            });
                            html += '</div>';
                        }
                        html += '</td>';
                        dateCounter++;
                    }
                }
                html += '</tr>';
                if (dateCounter > daysInMonth) break;
            }
            
            html += '</tbody></table>';
            calendarView.innerHTML = html;
            
            setTimeout(function() {
                calendarView.addEventListener('click', function(e) {
                    var target = e.target;
                    if(target.id === 'cal-prev-btn') {
                        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
                        updateCalendar();
                    } else if (target.id === 'cal-next-btn') {
                        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
                        updateCalendar();
                    } else if (target.id === 'cal-today-btn') {
                        currentCalendarDate = new Date();
                        updateCalendar();
                    } else {
                        var cell = target.closest('.has-events');
                        if (cell) {
                            console.log('캘린더 이벤트 클릭됨');
                            var day = parseInt(cell.dataset.day);
                            var events = monthEvents[day];
                            if(events && events.length > 0) {
                                var eventContent = events.map(function(evt) {
                                    var duration = evt.duration || 1;
                                    var startStr = evt.startDate.toISOString().split('T')[0];
                                    var endStr = evt.endDate.toISOString().split('T')[0];
                                    var period = duration > 1 ? startStr + ' ~ ' + endStr + ' (' + duration + '일간)' : startStr;
                                    return '<h4>' + evt.title + '</h4><p><strong>기간:</strong> ' + period + '</p><p>' + evt.description + '</p>';
                                }).join('<hr>');
                                var popupContent = document.createElement('div');
                                popupContent.innerHTML = eventContent;
                                var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                                showModal(dateStr + ' 이벤트', popupContent);
                            }
                        }
                    }
                });
            }, 100);
            
            return calendarView;
        }
        
        function updateCalendar() {
            contentDiv.innerHTML = '';
            contentDiv.appendChild(buildCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth()));
        }
        
        updateCalendar();
    }

    function showListPage(menuId, subMenuId) {
        history.pushState({ page: 'list', menuId: menuId, subMenuId: subMenuId }, '');
        var mainPlaceholder = document.getElementById('main-placeholder');
        var listPage = document.getElementById('list-filter-page');
        mainPlaceholder.style.display = 'none';
        listPage.style.display = 'flex';
        setTimeout(function() { listPage.classList.add('visible'); }, 10);
    }

    function hideListPage() {
        var mainPlaceholder = document.getElementById('main-placeholder');
        var listPage = document.getElementById('list-filter-page');
        listPage.classList.remove('visible');
        setTimeout(function() {
            listPage.style.display = 'none';
            mainPlaceholder.style.display = 'flex';
        }, 350);
    }

    function showDetailPage(itemId, menuId) {
        history.pushState({ page: 'detail', itemId: itemId, menuId: menuId }, '');
        var lev4Panel = document.getElementById('lev4-panel');
        lev4Panel.classList.add('visible');
    }

    function closeFilterModal() {
        document.getElementById('filter-modal-overlay').style.display = 'none';
    }

    function addEventListeners() {
        if(mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('visible');
                if (sidebar.classList.contains('visible')) {
                    history.pushState({ page: 'sidebar' }, '');
                }
            });
        }

        document.body.addEventListener('click', function(e) {
            var gridMenuBtn = e.target.closest('.grid-menu-btn');
            if (gridMenuBtn) {
                var menuId = gridMenuBtn.dataset.menuId;
                var subMenuId = gridMenuBtn.dataset.itemId;
                if (menuId === 'calendar') {
                    showDetailPage('calendar', 'calendar');
                } else {
                    showListPage(menuId, subMenuId);
                }
                return;
            }

            var listItem = e.target.closest('#sidebar .menu-item, .panel .list-item, .panel .list-item-card');
            if (listItem && !listItem.closest('#list-filter-page')) {
                handleMenuClick(listItem);
                return;
            }

            var mobileListItemCard = e.target.closest('#list-page-content .list-item-card, #list-page-content .list-item');
            if(mobileListItemCard){
                var itemId = mobileListItemCard.dataset.id;
                var menuId = mobileListItemCard.dataset.menuId;
                showDetailPage(itemId, menuId);
            }

            var likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                handleLikeClick(likeBtn);
            }

            var panelBackBtn = e.target.closest('.panel .back-btn');
            if (panelBackBtn) {
                handleBackButton();
            }
        });
    }

    adBlockManager.checkAndApplyBlock();
    initialize();
    
    function setScreenHeight() {
      var vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    setScreenHeight();
    window.addEventListener('resize', setScreenHeight);
});