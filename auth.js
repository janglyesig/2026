/* auth.js */
const CONFIG = {
    PASS_KEY: "sys_password",
    AUTH_KEY: "staff_session_auth", // 보안 강화를 위해 세션 단위로 관리
    MAIN_NOTICE: "notice_main",
    SUB_NOTICE: "notice_sub",
    DEFAULT_PW: "2026"
};

async function runSecurity() {
    const isAuthenticated = sessionStorage.getItem(CONFIG.AUTH_KEY);

    if (!isAuthenticated) {
        // 1. 지문/생체 인증 시도 (WebAuthn)
        if (window.PublicKeyCredential) {
            try {
                const cred = await navigator.credentials.create({
                    publicKey: {
                        challenge: new Uint8Array([1,2,3,4]),
                        rp: { name: "2026 한기총 발대식" },
                        user: { id: new Uint8Array([1]), name: "staff", displayName: "스태프" },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        timeout: 60000,
                        authenticatorSelection: { authenticatorAttachment: "platform" }
                    }
                });
                if (cred) finalizeAuth();
            } catch (e) { fallbackPassword(); }
        } else { fallbackPassword(); }
    } else { showPage(); }
}

function fallbackPassword() {
    const savedPw = localStorage.getItem(CONFIG.PASS_KEY) || CONFIG.DEFAULT_PW;
    const input = prompt("🔐 보안 구역입니다. 암호를 입력하세요.");
    if (input === savedPw) finalizeAuth();
    else {
        alert("접근이 거부되었습니다.");
        location.href = "about:blank";
    }
}

function finalizeAuth() {
    sessionStorage.setItem(CONFIG.AUTH_KEY, "true");
    showPage();
}

function showPage() {
    document.body.classList.add('secure-visible');

    // 관리자가 작성한 실시간 공지사항 텍스트 삽입
    const mBox = document.getElementById('mainNoticeBox');
    const sBox = document.getElementById('subNoticeBox');
    if(mBox) mBox.innerText = localStorage.getItem(CONFIG.MAIN_NOTICE) || "현재 등록된 메인 공지가 없습니다.";
    if(sBox) sBox.innerText = localStorage.getItem(CONFIG.SUB_NOTICE) || "현장 지침을 준수해 주십시오.";
}

// 웹페이지가 로드되면 무조건 보안 검사 실행
window.addEventListener('DOMContentLoaded', runSecurity);