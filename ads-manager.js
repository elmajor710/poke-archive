// ads-manager.js 파일의 모든 내용을 지우고 아래 코드로 교체해주세요.

const AdManager = {
    // 설정값
    CLICK_LIMIT: 5, // 광고 클릭 제한 횟수
    TIME_WINDOW_MS: 60 * 60 * 1000, // 제한 시간 (1시간)

    // 초기화 함수
    initialize: function() {
        if (this.canShowAd()) {
            this.loadAd();
        } else {
            this.hideAdContainer();
        }
        this.addClickListener();
    },

    // 광고를 표시할 수 있는지 확인
    canShowAd: function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            console.log("Admin mode: Ads hidden.");
            return false;
        }

        const blockUntil = localStorage.getItem('adBlockUntil');
        if (blockUntil && Date.now() < parseInt(blockUntil)) {
            const blockEndTime = new Date(parseInt(blockUntil)).toLocaleString();
            console.warn(`Ads currently blocked until: ${blockEndTime}`);
            return false;
        }
        return true;
    },

    // 광고 로드 (최초 1회 실행)
    loadAd: function() {
        const adContainer = document.getElementById('ads-container');
        if (!adContainer) return;

        // 안정성을 위해 requestAnimationFrame 사용
        requestAnimationFrame(() => {
            adContainer.innerHTML = ''; // 컨테이너 비우기
            
            const adIns = document.createElement('ins');
            adIns.className = 'adsbygoogle';
            adIns.style.display = 'block';
            adIns.dataset.adClient = 'ca-pub-2125965839205311';
            adIns.dataset.adSlot = '2123059829'; // 반응형 광고 슬롯
            adIns.dataset.adFormat = 'auto';
            adIns.dataset.fullWidthResponsive = 'true';
            
            adContainer.appendChild(adIns);
            
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                console.log("Ad loaded successfully (once per session).");
            } catch (e) {
                console.error("adsbygoogle.push() failed: ", e);
            }
        });
    },

    // 광고 컨테이너 숨기기
    hideAdContainer: function() {
        const adContainer = document.getElementById('ads-container');
        if (adContainer) {
            adContainer.innerHTML = '';
            adContainer.style.height = '0';
            adContainer.style.minHeight = '0';
            adContainer.style.border = 'none';
            adContainer.style.padding = '0';
        }
    },

    // 광고 컨테이너에 클릭 리스너 추가
    addClickListener: function() {
        const adContainer = document.getElementById('ads-container');
        if (adContainer) {
            adContainer.addEventListener('click', () => this.recordClick());
        }
    },

    // 광고 클릭 기록
    recordClick: function() {
        if (!this.canShowAd()) return; // 이미 차단되었으면 기록하지 않음

        const now = Date.now();
        let adClicks = [];
        try {
            adClicks = JSON.parse(localStorage.getItem('adClicks')) || [];
        } catch (e) {}

        adClicks = adClicks.filter(timestamp => (now - timestamp) < this.TIME_WINDOW_MS);
        adClicks.push(now);
        localStorage.setItem('adClicks', JSON.stringify(adClicks));

        console.log(`Ad click recorded. Count in last hour: ${adClicks.length}`);

        if (adClicks.length >= this.CLICK_LIMIT) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            localStorage.setItem('adBlockUntil', tomorrow.getTime());
            
            console.warn(`CLICK LIMIT REACHED! Ads will be blocked.`);
            this.hideAdContainer(); // 즉시 광고 숨기기
        }
    }
};