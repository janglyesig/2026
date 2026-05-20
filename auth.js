/* auth.js */
const DB_URL = "https://hq2026-42c67-default-rtdb.firebaseio.com/appData.json";

window.cloudData = {
    sys_password: "2026",
    notices_main: [], 
    notices_sub: []   
};

async function runSecurity() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        if (data) {
            if (data.sys_password) window.cloudData.sys_password = data.sys_password;
            if (data.notices_main) window.cloudData.notices_main = data.notices_main;
            if (data.notices_sub) window.cloudData.notices_sub = data.notices_sub;
            
            if (typeof data.notice_main === 'string') window.cloudData.notices_main = [{id: 1, text: data.notice_main, date: "이전"}];
            if (typeof data.notice_sub === 'string') window.cloudData.notices_sub = [{id: 2, text: data.notice_sub, date: "이전"}];
        }
    } catch (e) { console.log("DB 연결 실패 - 로컬 모드로 진행"); }

    if (window.PublicKeyCredential) {
        try {
            const cred = await navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array([1,2,3,4]),
                    rp: { name: "서울아트센터 본부" }, 
                    user: { id: new Uint8Array([1]), name: "staff", displayName: "스태프" },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    timeout: 60000,
                    authenticatorSelection: { authenticatorAttachment: "platform" }
                }
            });
            if (cred) showPage();
        } catch (e) { fallbackPassword(); }
    } else { fallbackPassword(); }
}

function fallbackPassword() {
    const input = prompt("보안 구역입니다. 암호를 입력하세요.");
    if (input === window.cloudData.sys_password) {
        showPage();
    } else {
        alert("접근이 거부되었습니다.");
        document.body.innerHTML = "<h2 style='color:white; text-align:center; margin-top:50px;'>인증 실패</h2>";
    }
}

function showPage() {
    document.body.classList.add('secure-visible');
    if(typeof syncNoticeUI === 'function') syncNoticeUI();
}

window.syncCloudData = async function() {
    try {
        await fetch(DB_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.cloudData)
        });
        return true;
    } catch (e) {
        return false;
    }
};

window.addEventListener('DOMContentLoaded', runSecurity);
