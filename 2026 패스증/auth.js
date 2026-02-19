/* auth.js */
const CONFIG = {
    PASS_KEY: "sys_password",
    AUTH_KEY: "staff_authenticated",
    MAIN_NOTICE: "notice_main",
    SUB_NOTICE: "notice_sub",
    DEFAULT_PW: "2026"
};

async function runSecurity() {
    const isAuthenticated = localStorage.getItem(CONFIG.AUTH_KEY);
    if (!isAuthenticated) {
        // 1. 지문 인식 (WebAuthn) 시도
        if (window.PublicKeyCredential) {
            try {
                const cred = await navigator.credentials.create({
                    publicKey: {
                        challenge: new Uint8Array([1,2,3,4]),
                        rp: { name: "2026 한기총" },
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
    const input = prompt("보안 암호를 입력하세요.");
    if (input === savedPw) finalizeAuth();
    else { alert("접근 거부"); location.href="about:blank"; }
}

function finalizeAuth() {
    localStorage.setItem(CONFIG.AUTH_KEY, "true");
    showPage();
}

function showPage() {
    document.body.classList.add('secure-visible');
    // 관리자 공지 실시간 로드
    const mBox = document.getElementById('mainNoticeBox');
    const sBox = document.getElementById('subNoticeBox');
    if(mBox) mBox.innerText = localStorage.getItem(CONFIG.MAIN_NOTICE) || "현재 공지가 없습니다.";
    if(sBox) sBox.innerText = localStorage.getItem(CONFIG.SUB_NOTICE) || "현장 지침을 준수 바랍니다.";
}

window.addEventListener('DOMContentLoaded', runSecurity);