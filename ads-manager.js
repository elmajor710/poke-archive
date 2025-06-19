// ads-manager.js 파일의 모든 내용을 지우고 아래 코드로 교체해주세요.

const AdManager = {
    // 설정값
    CLICK_LIMIT: 5,
    TIME_WINDOW_MS: 60 * 60 * 1000,
    STORAGE_KEY: 'adClickData',

    // 초기화 함수
    initialize: function() {
        if (this.canShowAd()) {
            this.loadAd();
        } else {
            this.hideAdContainer("Ad display is currently blocked.");
        }
        this.addClickListener();
    },
    
    // 데이터를 안전하게 가져오는 내부 함수
    _getData: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // 데이터 구조가 올바른지 확인
                if (Array.isArray(parsed.clicks) && typeof parsed.blockUntil !== 'undefined') {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Error reading from localStorage:", e);
        }
        // 데이터가 없거나 잘못된 경우 기본 구조 반환
        return { clicks: [], blockUntil: null };
    },

    // 데이터를 안전하게 저장하는 내부 함수
    _setData: function(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Error writing to localStorage:", e);
        }
    },

    // ▼▼▼ 이 함수를 여기에 추가해주세요 ▼▼▼
    isAdminMode: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('admin') === 'true';
    },
    
    // 광고를 표시할 수 있는지 확인
    canShowAd: function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            console.log("Admin mode: Ads hidden.");
            return false;
        }

        const data = this._getData();
        if (data.blockUntil && Date.now() < data.blockUntil) {
            const blockEndTime = new Date(data.blockUntil).toLocaleString();
            console.warn(`Ads currently blocked until: ${blockEndTime}`);
            return false;
        }
        return true;
    },

    // 광고 로드
    loadAd: function() {
        const adContainer = document.getElementById('ads-container');
        if (!adContainer) return;

        requestAnimationFrame(() => {
            adContainer.innerHTML = '';
            
            const adIns = document.createElement('ins');
            adIns.className = 'adsbygoogle';
            adIns.style.display = 'block';
            adIns.dataset.adClient = 'ca-pub-2125965839205311';
            adIns.dataset.adSlot = '2123059829';
            adIns.dataset.adFormat = 'auto';
            adIns.dataset.fullWidthResponsive = 'true';
            
            adContainer.appendChild(adIns);
            
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                console.log("Ad loaded successfully.");
            } catch (e) {
                console.error("adsbygoogle.push() failed: ", e);
            }
        });
    },

    // 광고 컨테이너 숨기기
    hideAdContainer: function(message) {
        const adContainer = document.getElementById('ads-container');
        if (adContainer) {
            adContainer.innerHTML = `<div style="text-align:center; padding: 20px; color: #888;">${message}</div>`;
        }
    },

    // 클릭 리스너 추가
    addClickListener: function() {
        const adContainer = document.getElementById('ads-container');
        if (adContainer) {
            adContainer.addEventListener('click', () => this.recordClick());
        }
    },

    // 클릭 기록 (버그 수정된 버전)
    recordClick: function() {
        if (this.isAdminMode()) return; // 관리자 모드에서는 클릭 기록 안함
        
        const data = this._getData();
        if (data.blockUntil && Date.now() < data.blockUntil) {
            console.log("Clicks are not recorded while ads are blocked.");
            return;
        }

        const now = Date.now();
        
        // 1시간이 지난 클릭 기록은 삭제
        let validClicks = data.clicks.filter(timestamp => (now - timestamp) < this.TIME_WINDOW_MS);
        validClicks.push(now);
        
        data.clicks = validClicks;

        console.log(`Ad click recorded. Count in last hour: ${data.clicks.length}`);

        if (data.clicks.length >= this.CLICK_LIMIT) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            data.blockUntil = tomorrow.getTime();
            
            console.warn(`CLICK LIMIT REACHED! Ads will be blocked until ${tomorrow.toLocaleString()}`);
            this.hideAdContainer('광고가 일시 중단되었습니다.');
        }

        this._setData(data);
    }
};

// AdManager 초기화는 script.js에서 호출합니다.