/* auth.js */
const DB_URL = "https://hq2026-42c67-default-rtdb.firebaseio.com/appData.json";

let cloudData = {
    sys_password: "2026",
    notices_main: [],
    notices_sub: []
};

async function runSecurity() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        if (data) {
            if (data.sys_password) cloudData.sys_password = data.sys_password;
            if (data.notices_main) cloudData.notices_main = data.notices_main;
            if (data.notices_sub) cloudData.notices_sub = data.notices_sub;

            if (typeof data.notice_main === 'string') cloudData.notices_main = [{id: 1, text: data.notice_main, date: "이전 공지"}];
            if (typeof data.notice_sub === 'string') cloudData.notices_sub = [{id: 2, text: data.notice_sub, date: "이전 공지"}];
        }
    } catch (e) { console.log("DB 연결 실패"); }

    if (window.PublicKeyCredential) {
        try {
            const cred = await navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array([1,2,3,4]),
                    rp: { name: "서울아트센터 본부" }, // 지문 인식 팝업 이름 변경
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
    const input = prompt("🔐 보안 구역입니다. 암호를 입력하세요.");
    if (input === cloudData.sys_password) {
        showPage();
    } else {
        alert("접근이 거부되었습니다.");
        document.body.innerHTML = "<h2 style='color:white; text-align:center; margin-top:50px;'>인증 실패: 뒤로 가기를 눌러주세요.</h2>";
    }
}

function renderNoticeList(elementId, noticeArray) {
    const box = document.getElementById(elementId);
    if (!box) return;
    if (noticeArray.length === 0) {
        box.innerHTML = "<div style='opacity:0.6;'>현재 등록된 공지가 없습니다.</div>";
        return;
    }

    let html = "";
    const sorted = [...noticeArray].reverse();
    sorted.forEach(notice => {
        html += `
        <div style="background: rgba(255,255,255,0.08); padding: 15px; border-radius: 10px; margin-bottom: 15px; border-left: 3px solid #D4AF37;">
            <div style="font-size: 0.75rem; color: #D4AF37; margin-bottom: 8px; font-weight: bold;">${notice.date}</div>
            <div style="line-height: 1.5; font-size: 0.95rem; word-break: keep-all;">${notice.text.replace(/\n/g, '<br>')}</div>
        </div>`;
    });
    box.innerHTML = html;
}

function showPage() {
    document.body.classList.add('secure-visible');
    renderNoticeList('mainNoticeBox', cloudData.notices_main);
    renderNoticeList('subNoticeBox', cloudData.notices_sub);
}

window.addEventListener('DOMContentLoaded', runSecurity);