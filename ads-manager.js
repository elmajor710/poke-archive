// ads-manager.js (신규 파일)

// 설정을 상수로 관리 (수정 용이)
const CLICK_LIMIT = 5; // 광고 클릭 제한 횟수
const TIME_WINDOW_MS = 60 * 60 * 1000; // 제한 시간 (1시간)

// AdManager 객체를 전역으로 생성
window.AdManager = {
    
    // 현재 데이터를 로컬 스토리지에서 가져오는 함수
    _getData: function() {
        try {
            const data = localStorage.getItem('adClickData');
            // 데이터가 없으면 기본 구조 반환
            return data ? JSON.parse(data) : { clicks: [], blockUntil: null };
        } catch (e) {
            console.error("Error reading from localStorage", e);
            return { clicks: [], blockUntil: null };
        }
    },

    // 데이터를 로컬 스토리지에 저장하는 함수
    _setData: function(data) {
        try {
            localStorage.setItem('adClickData', JSON.stringify(data));
        } catch (e) {
            console.error("Error writing to localStorage", e);
        }
    },

    // 관리자 모드인지 확인하는 함수
    isAdminMode: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('admin') === 'true';
    },

    // 광고를 표시할 수 있는지 최종 확인하는 함수
    canShowAd: function() {
        // 1. 관리자 모드이면 광고 숨김
        if (this.isAdminMode()) {
            console.log("Admin mode: Ads hidden.");
            return false;
        }

        // 2. 차단 기간이 설정되어 있는지 확인
        const data = this._getData();
        if (data.blockUntil && Date.now() < data.blockUntil) {
            const blockEndTime = new Date(data.blockUntil).toLocaleString();
            console.log(`Ads blocked until: ${blockEndTime}`);
            return false;
        }

        // 3. 모든 조건을 통과하면 광고 표시 허용
        return true;
    },

    // (테스트용) 광고 클릭을 기록하는 함수
    recordClick: function() {
        const now = Date.now();
        let data = this._getData();

        // 1시간이 지난 클릭 기록은 삭제
        data.clicks = data.clicks.filter(timestamp => now - timestamp < TIME_WINDOW_MS);

        // 새로운 클릭 기록 추가
        data.clicks.push(now);

        console.log(`Ad click recorded. Count in last hour: ${data.clicks.length}`);

        // 클릭 횟수가 제한에 도달했는지 확인
        if (data.clicks.length >= CLICK_LIMIT) {
            // 차단 기간 설정: 다음날 자정
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            data.blockUntil = tomorrow.getTime();
            
            console.warn(`CLICK LIMIT REACHED! Ads will be blocked until ${tomorrow.toLocaleString()}`);
            
            // 광고 새로고침을 즉시 호출하여 광고를 숨김 처리
            if (window.refreshAd) window.refreshAd();
        }

        this._setData(data);
        this.updateTestUI(); // 테스트 UI 업데이트
    },

    // (테스트용) UI 업데이트 함수
    updateTestUI: function() {
        const data = this._getData();
        const statusDiv = document.getElementById('test-status');
        if (statusDiv) {
            const clicksInWindow = data.clicks.filter(t => Date.now() - t < TIME_WINDOW_MS).length;
            let statusText = `최근 1시간 클릭: ${clicksInWindow} / ${CLICK_LIMIT} 회`;
            if (data.blockUntil && Date.now() < data.blockUntil) {
                statusText += `<br><b>광고 차단됨 (~${new Date(data.blockUntil).toLocaleString()})</b>`;
            }
            statusDiv.innerHTML = statusText;
        }
    },
    
    // (테스트용) 데이터 초기화 함수
    resetData: function() {
        localStorage.removeItem('adClickData');
        console.log("Ad click data reset.");
        this.updateTestUI();
        if (window.refreshAd) window.refreshAd();
    }
};