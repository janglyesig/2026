/* auth.js */

// 🔥 이곳에 파이어베이스에서 복사한 주소를 넣고 끝에 'appData.json'을 꼭 붙여주세요!
const DB_URL = "https://hq2026-42c67-default-rtdb.firebaseio.com";

// 기본 데이터 세팅
let cloudData = {
    sys_password: "2026",
    notice_main: "현재 등록된 메인 공지가 없습니다.",
    notice_sub: "현장 지침을 준수해 주십시오."
};

async function runSecurity() {
    // 1. 클라우드에서 최신 데이터(암호, 공지) 불러오기
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        if (data) cloudData = data; // 클라우드 데이터가 있으면 덮어쓰기
    } catch (e) {
        console.log("DB 연결 실패, 기본값 사용");
    }

    // 2. 페이지 로드 시 무조건 지문/생체 인증 시도
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

function showPage() {
    document.body.classList.add('secure-visible');

    // 클라우드에서 가져온 공지사항을 화면에 적용
    const mBox = document.getElementById('mainNoticeBox');
    const sBox = document.getElementById('subNoticeBox');
    if(mBox) mBox.innerText = cloudData.notice_main;
    if(sBox) sBox.innerText = cloudData.notice_sub;
}

// 웹페이지 켜지면 실행
window.addEventListener('DOMContentLoaded', runSecurity);