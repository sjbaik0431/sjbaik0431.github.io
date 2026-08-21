// 3번 AI — 표현/의성어 데이터셋  「포니에게 가는 길」
// 순수 데이터. import/export 없음. <script src="assets/expressions.js"></script> 로 붙이면
// 전역에 EXPRESSIONS 가 생긴다.
//
// 좌표계: 9분할 그리드 문자열 — "좌상" "상" "우상" "좌" "중앙" "우" "좌하" "하" "우하"
// size  : S(=clamp 18~28px) / M(28~44) / L(44~72) / XL(72~120)  ※ 실제 px는 2번 AI 재량
// dur   : ms, 등장~퇴장 전체 수명
// at    : 챕터 로컬 시각(ms). 모든 챕터는 0~30000ms.
// in/out: 아래 IN_VOCAB / OUT_VOCAB 중 하나. CSS keyframe 이름과 1:1 대응시키면 된다.

const EXPRESSION_VOCAB = {
  in: [
    "fade-rise",   // 아래에서 8~16px 떠오르며 opacity 0→1
    "drift-in",    // 옆으로 흘러들며 blur 4px→0
    "sparkle-pop", // scale 0.4→1.15→1, 짧고 반짝
    "blur-in",     // blur 12px→0, scale 1.06→1
    "scale-soft",  // scale 0.88→1, ease-out-quint
    "slide-left",  // +24px→0
    "slide-right", // -24px→0
    "peek-in",     // 아래 마스크에서 빼꼼 올라옴 (clip-path)
    "breath-in",   // opacity 0→1을 1.2s에 걸쳐, scale 1.0→1.04 아주 느리게
    "unroll-down", // 위 마스크에서 아래로 펼쳐짐
    "bounce-in",   // translateY -12 → 0, 2회 감쇠 바운스
    "settle-down"  // 위에서 6px 내려앉으며 opacity 0→1
  ],
  out: [
    "blur-out",          // blur 0→10px, opacity→0
    "fade-fall",         // 아래로 10px 흘러내리며 사라짐
    "sparkle-dissolve",  // scale 1→1.3, opacity→0, 짧게
    "scale-down",        // scale 1→0.9
    "drift-out",         // 옆으로 흘러나가며 사라짐
    "fade-hold",         // 제자리에서 아주 느리게 opacity→0 (여백용)
    "sink-out",          // 아래로 가라앉듯 6px + blur
    "pop-out"            // scale 1→0.6, 짧게
  ]
};

const EXPRESSIONS = {

  // ───────────────────────────────────────────────
  // A. 의성어 · 의태어
  // ───────────────────────────────────────────────
  onomatopoeia: [
    // ── 꽃 · 종이 · 천 ──
    { t: "사르르",   photo: "p01", anim: "float-up",    size: "L", color: "#E8B4C8", dur: 2600, note: "꽃 포장지가 손끝에서 풀리는 결" },
    { t: "사락",     photo: "p02", anim: "drift-side",  size: "M", color: "#F3C9D6", dur: 2000, note: "꽃잎 한 겹이 넘어가는 소리" },
    { t: "사르락",   photo: "p09", anim: "strip-slide", size: "L", color: "#F5E6C0", dur: 1800, note: "필름 스트립 세 칸이 위에서 아래로 미끄러진다" },
    { t: "사르륵",   photo: "p10", anim: "slide-soft",  size: "L", color: "#EBD7E0", dur: 2600, note: "초음파 필름이 손끝에서 풀려 내려오는 결" },
    { t: "바스락",   photo: "p02", anim: "jitter-fade", size: "M", color: "#D9AE6B", dur: 2000, note: "포장지의 마른 소리. 분홍인데 소리는 건조하다" },
    { t: "겹겹",     photo: "p02", anim: "stack-in",    size: "M", color: "#F3C9D6", dur: 2400, note: "장미 꽃잎이 안으로 안으로 접힌 밀도" },
    { t: "나풀",     photo: "p03", anim: "flutter",     size: "M", color: "#FFE9BE", dur: 2200, note: "배냇저고리 소매가 공기에 한 번 들리는 순간" },
    { t: "하늘하늘", photo: "p03", anim: "sway",        size: "M", color: "#F5E6C0", dur: 2400, note: "아직 아무도 입지 않은 얇은 천의 무게 없음" },
    { t: "도톰",     photo: "p03", anim: "thicken",     size: "S", color: "#E8C88A", dur: 2000, note: "그래도 배냇저고리 깃은 두껍다. 미리 대비한 두께" },
    { t: "팔랑",     photo: "p10", anim: "page-flip",   size: "M", color: "#F3C9D6", dur: 2000, note: "침대 위 흩어진 초음파 사진 한 장이 넘어간다" },
    { t: "스르륵",   photo: "p10", anim: "unroll-down", size: "L", color: "#F5E3C8", dur: 2800, note: "일곱 칸이 위에서부터 차례로 펼쳐지는 길이감" },

    // ── 풍선 · 부력 ──
    { t: "두둥실",   photo: "p03", anim: "balloon-float", size: "XL", color: "#E8C88A", dur: 3000, note: "은박 글자 네 개가 창에 떠 있는 부력. 무겁지 않은 이름" },
    { t: "둥실",     photo: "p08", anim: "rise-slow",     size: "L",  color: "#F2D9A0", dur: 2600, note: "하트 풍선이 손끝을 떠나려는 1초" },
    { t: "통통",     photo: "p08", anim: "bounce",        size: "M",  color: "#F3C9D6", dur: 1800, note: "풍선이 손바닥을 두 번 치고 돌아오는 탄력" },
    { t: "톡",       photo: "p08", anim: "pop-in",        size: "S",  color: "#FFF2D0", dur: 1200, note: "손끝이 풍선을 아주 살짝 건드린 지점" },
    { t: "조롱조롱", photo: "p03", anim: "hang-sway",     size: "M",  color: "#E8B4C8", dur: 2400, note: "P·O·N·Y와 하트가 한 줄로 매달린 모양" },
    { t: "동글",     photo: "p02", anim: "round-in",      size: "S",  color: "#7BD64F", dur: 1600, note: "사진 앱으로 그린 초록 동그라미의 손맛" },

    // ── 반짝임 · 빛 ──
    { t: "반짝",     photo: "p01", anim: "sparkle-pop",   size: "S", color: "#FFF2D0", dur: 1400, note: "배 위 보석 스티커의 한 점. 딱 한 번만" },
    { t: "알알이",   photo: "p02", anim: "scatter-in",    size: "M", color: "#FFE9BE", dur: 2200, note: "낱낱이 세어질 만큼 작은 것들이 박혀 있다" },
    { t: "오밀조밀", photo: "p02", anim: "cluster-in",    size: "L", color: "#E8B4C8", dur: 2600, note: "리본·하트·고양이 얼굴이 손바닥만 한 자리에 모여 있음" },
    { t: "초롱초롱", photo: "p03", anim: "twinkle-pair",  size: "L", color: "#E8C88A", dur: 2400, note: "두 사람의 눈. 하나가 아니라 둘이라서 초롱'초롱'" },
    { t: "또랑또랑", photo: "p03", anim: "clear-pulse",   size: "M", color: "#E8C88A", dur: 2400, note: "이름을 또박또박 부를 때의 자음 윤곽" },
    { t: "아롱아롱", photo: "p01", anim: "blur-glow",     size: "M", color: "#FFE9BE", dur: 3000, note: "정오 역광이 유리 가장자리에 만드는 빛무리" },
    { t: "어른어른", photo: "p01", anim: "shimmer",       size: "M", color: "#E8C88A", dur: 2600, note: "통유리에 비친 도시가 흔들리며 겹친다" },
    { t: "일렁",     photo: "p01", anim: "wave-slow",     size: "M", color: "#BFD6C8", dur: 2600, note: "창밖 초록 강물의 결. 한 번만 크게" },
    { t: "윤슬",     photo: "p01", anim: "sparkle-drift", size: "S", color: "#F5E6C0", dur: 2000, note: "강 위에 부서진 햇빛. 소리 없는 의태어" },
    { t: "화르르",   photo: "p01", anim: "flare-out",     size: "XL", color: "#FFE9BE", dur: 2800, note: "정오의 빛이 한꺼번에 창을 넘어오는 폭" },
    { t: "스미듯",   photo: "p05", anim: "soak-in",       size: "L", color: "#F5E6C0", dur: 3400, note: "스탠드 불빛이 흰 몰딩 벽에 번져 들어간다" },

    // ── 구름 · 이불 · 부푸는 것 ──
    { t: "뭉게뭉게", photo: "p01", anim: "puff-grow",  size: "L", color: "#F2D9A0", dur: 3200, note: "여름 구름이 창 위쪽에서 계속 부푼다" },
    { t: "몽글몽글", photo: "p05", anim: "puff-soft",  size: "L", color: "#FFD9E4", dur: 2800, note: "이불과 마음이 같은 속도로 부푸는 것" },
    { t: "폭",       photo: "p05", anim: "squash-in",  size: "M", color: "#F0E4DC", dur: 1800, note: "흰 침구에 몸 한쪽이 잠기는 한 음절" },
    { t: "포옥",     photo: "p06", anim: "soft-cover", size: "XL", color: "#F0E4DC", dur: 3200, note: "인형이 얼굴을 덮는 부드러움. '폭'보다 한 박자 길게" },
    { t: "보들보들", photo: "p06", anim: "soft-pulse", size: "M", color: "#E8B4C8", dur: 2400, note: "회색 조랑말의 털. 손보다 볼로 먼저 아는 감촉" },
    { t: "소르르",   photo: "p05", anim: "sink-down",  size: "M", color: "#EDE7E0", dur: 2600, note: "기대앉은 몸이 이불로 내려가는 각도" },

    // ── 숨기기 · 멈춤 ──
    { t: "살며시",   photo: "p04", anim: "fade-slide", size: "L",  color: "#E8DDD4", dur: 3400, note: "가리는 손이 소리를 내지 않으려고 애쓰는 속도" },
    { t: "살포시",   photo: "p07", anim: "feather-drop", size: "L", color: "#F5E6C0", dur: 2800, note: "신발 한 짝을 두 손 위에 얹는 무게. 거의 0" },
    { t: "슬며시",   photo: "p06", anim: "peek-in",    size: "M",  color: "#F3C9D6", dur: 2200, note: "가린 것 뒤에서 웃음이 먼저 새어 나온다" },
    { t: "빼꼼",     photo: "p06", anim: "peek-in",    size: "L",  color: "#F3C9D6", dur: 2400, note: "아기 얼굴 풍선이 두 사람 사이로 딱 절반만" },
    { t: "가만",     photo: "p07", anim: "freeze-hold", size: "XL", color: "#DCD6D0", dur: 3800, note: "움직이지 않는 것을 소리로 적으면 이 두 글자" },
    { t: "축",       photo: "p06", anim: "droop",      size: "L",  color: "#C8BEB4", dur: 2800, note: "조랑말 인형의 앞다리 두 개가 늘어진 각도" },
    { t: "숨",       photo: "p05", anim: "breath-hold", size: "XL", color: "#C8BEB4", dur: 3600, note: "이 챕터 전체가 한 번의 들숨이다" },
    { t: "후",       photo: "p04", anim: "breath-out",  size: "XL", color: "#EDE7E0", dur: 3400, note: "참았던 것을 놓는 날숨. 화면에서 가장 큰 글자여도 된다" },
    { t: "소곤",     photo: "p06", anim: "whisper-in",  size: "M",  color: "#E8DDD4", dur: 2600, note: "가려도 목소리는 새어 나온다. 포니가 아는 건 그것뿐" },
    { t: "도란도란", photo: "p05", anim: "murmur-pair", size: "M",  color: "#E5B98C", dur: 2800, note: "두 사람의 낮은 목소리가 번갈아 나는 리듬" },

    // ── 심장 · 태동 ──
    { t: "콩",     photo: "p03", anim: "kick-pop",    size: "L",  color: "#D98CA8", dur: 1200, note: "가장 작은 단위의 태동. 한 번" },
    { t: "콩닥",   photo: "p07", anim: "heart-beat",  size: "M",  color: "#D98CA8", dur: 2200, note: "신발을 들여다보는 쪽의 가슴이 먼저 뛴다" },
    { t: "톡톡",   photo: "p07", anim: "kick-double", size: "S",  color: "#F3C9D6", dur: 1600, note: "배 안쪽에서 두 번. 대답에 가깝다" },
    { t: "토독",   photo: "p03", anim: "tap",         size: "S",  color: "#E8C88A", dur: 1400, note: "투명 신발 상자 뚜껑을 손톱으로 건드린 소리" },
    { t: "두근",   photo: "p03", anim: "heart-swell", size: "L",  color: "#D98CA8", dur: 2400, note: "이름을 부르기 직전의 반 박자" },
    { t: "쿵",     photo: "p10", anim: "deep-thud",   size: "XL", color: "#D98CA8", dur: 2200, note: "필름을 올려다본 순간 가슴 아래가 한 번 내려앉는다" },
    { t: "쿵쿵",   photo: "p10", anim: "double-thud", size: "L",  color: "#E8B4C8", dur: 2200, note: "두 사람의 심장이 반 박자 어긋난 채 겹쳐 뛴다" },

    // ── 걸음 · 아직 오지 않은 발 ──
    { t: "아장",   photo: "p07", anim: "toddle",    size: "M", color: "#F0C97A", dur: 2400, note: "아직 오지 않은 걸음을 미리 적어두는 말" },
    { t: "자박",   photo: "p05", anim: "step-fade", size: "M", color: "#E5B98C", dur: 2200, note: "이 방에서 언젠가 날 소리. 지금은 없는 소리" },
    { t: "성큼",   photo: "p09", anim: "big-step",  size: "M", color: "#C9A25E", dur: 2400, note: "세로 3분할 사이를 시간이 한 칸씩 건너뛴다" },
    { t: "총총",   photo: "p10", anim: "dot-chain", size: "M", color: "#CBB8D6", dur: 2400, note: "초음파 일곱 칸이 촘촘히 이어진 모양. 걸음이자 별" },

    // ── 시선 · 시간 ──
    { t: "물끄러미", photo: "p07", anim: "slow-hold", size: "L", color: "#F0C97A", dur: 3400, note: "오래 들여다보는 것. 이 사진의 전부" },
    { t: "오도카니", photo: "p02", anim: "sit-still", size: "M", color: "#C9A25E", dur: 3000, note: "선반 위 조랑말이 혼자 앉아 기다리는 자세" },
    { t: "사부작",   photo: "p07", anim: "slow-rise", size: "M", color: "#E5B98C", dur: 2400, note: "소리 나지 않게 무언가를 만지작거리는 손" },
    { t: "나부시",   photo: "p01", anim: "settle-down", size: "M", color: "#E8C88A", dur: 2400, note: "사위가 허리를 접는 각도. 꽃보다 낮게" },
    { t: "살랑",     photo: "p01", anim: "sway-side", size: "S", color: "#E8C88A", dur: 2200, note: "창가의 공기 한 겹" },
    { t: "문득",     photo: "p09", anim: "cut-in",    size: "M", color: "#C9A25E", dur: 2400, note: "겹친 시간 사이로 서른 해 전이 한 칸 끼어든다" },
    { t: "아득",     photo: "p09", anim: "far-blur",  size: "L", color: "#CBB8D6", dur: 2800, note: "딸을 안고 있던 팔의 기억이 뒤로 물러난다" },
    { t: "쓱",       photo: "p02", anim: "stroke",    size: "M", color: "#7BD64F", dur: 1200, note: "초록 낙서가 그어지는 한 획. 유일하게 급한 표현" },
    { t: "휙",       photo: "p02", anim: "stroke",    size: "M", color: "#D94A4A", dur: 1200, note: "빨간 하트 낙서를 마무리하는 손목" },
    { t: "또르르",   photo: "p07", anim: "roll-down", size: "M", color: "#E8B4C8", dur: 2600, note: "맺혔다가 굴러떨어지기 직전까지만" },
    { t: "그렁",     photo: "p10", anim: "swell-hold", size: "L", color: "#EBD7E0", dur: 2800, note: "차올랐지만 넘치지는 않은 상태. 이 작품의 기본값" },
    { t: "뭉클",     photo: "p10", anim: "swell-up",  size: "L", color: "#E8C88A", dur: 2800, note: "목 아래에서 위로 한 번 밀려 올라오는 것" }
  ],

  // ───────────────────────────────────────────────
  // B. 감탄사
  // ───────────────────────────────────────────────
  interjections: {
    grandpa: [
      { t: "허",       size: "M",  color: "#D9AE6B", dur: 2000, anim: "breath-out",  note: "말보다 웃음이 먼저 나오는 숨. 외할아버지의 기본형" },
      { t: "허허",     size: "M",  color: "#D9AE6B", dur: 2200, anim: "breath-out",  note: "'허'를 두 번. 흐뭇함이 한 겹 얹힌다" },
      { t: "어이구",   size: "M",  color: "#D9AE6B", dur: 2400, anim: "fade-rise",   note: "반가움과 애틋함이 같은 자리에 있는 말" },
      { t: "고놈",     size: "L",  color: "#D9AE6B", dur: 2400, anim: "fade-rise",   note: "얼굴도 못 본 아이를 벌써 이렇게 부른다" },
      { t: "이런",     size: "M",  color: "#C9A25E", dur: 2000, anim: "blur-in",     note: "예상하지 못한 데서 뭉클해졌을 때" },
      { t: "저런",     size: "M",  color: "#C9A25E", dur: 2000, anim: "blur-in",     note: "딸의 옆모습을 보다가 나오는 낮은 소리" },
      { t: "그래",     size: "L",  color: "#D9AE6B", dur: 3000, anim: "fade-rise",   note: "대답이 아니라 스스로 끄덕이는 말. 마지막에 쓸 것" },
      { t: "그렇구나", size: "M",  color: "#C9A25E", dur: 2600, anim: "fade-rise",   note: "이제야 알겠다는 뜻. 서른 해 걸렸다" },
      { t: "참",       size: "M",  color: "#D9AE6B", dur: 2200, anim: "breath-in",   note: "세월에 대고 하는 한 글자" },
      { t: "글쎄",     size: "M",  color: "#C9A25E", dur: 2200, anim: "drift-in",    note: "말문이 막혔을 때 대신 나오는 말" },
      { t: "어느새",   size: "L",  color: "#E8C88A", dur: 3000, anim: "fade-rise",   note: "감탄사라기보다 감탄 어구. 시간을 세는 말" },
      { t: "벌써",     size: "M",  color: "#E8C88A", dur: 2400, anim: "fade-rise",   note: "'어느새'의 짧은 형. 조급함이 아니라 놀람" },
      { t: "그새",     size: "M",  color: "#E8C88A", dur: 2200, anim: "drift-in",    note: "잠깐 눈 돌린 사이에 이만큼 됐다는 뜻" },
      { t: "여태",     size: "M",  color: "#C9A25E", dur: 2400, anim: "blur-in",     note: "지금까지, 라는 뜻이지만 원망은 없다" },
      { t: "이제",     size: "L",  color: "#E8C88A", dur: 2600, anim: "fade-rise",   note: "다음 챕터로 넘기는 접속사 겸 감탄" }
    ],
    pony: [
      { t: "응?",     size: "M",  color: "#F3C9D6", dur: 1800, anim: "peek-in",    note: "바깥 소리를 처음 알아들었을 때" },
      { t: "여기",    size: "M",  color: "#F3C9D6", dur: 2000, anim: "peek-in",    note: "위치를 알리는 말. 손을 들 수 없으니 말로만" },
      { t: "나야",    size: "XL", color: "#F3C9D6", dur: 2400, anim: "fade-rise",  note: "초음파 사진을 가리키며. 이 작품에서 가장 중요한 두 글자" },
      { t: "봤지",    size: "M",  color: "#FFD9E4", dur: 2000, anim: "bounce-in",  note: "자랑에 가깝지만 조용한 자랑" },
      { t: "있잖아",  size: "M",  color: "#F3C9D6", dur: 2200, anim: "peek-in",    note: "말을 꺼내기 전의 뜸. 아기말투의 핵심" },
      { t: "잠깐",    size: "M",  color: "#FFD9E4", dur: 1800, anim: "pop-in",     note: "어른들이 너무 빨리 넘어갈 때" },
      { t: "쉿",      size: "XL", color: "#EDE7E0", dur: 3400, anim: "fade-rise",  note: "CH4 전체를 지배하는 한 글자. 크고 느리게" },
      { t: "간다",    size: "L",  color: "#F3C9D6", dur: 2600, anim: "fade-rise",  note: "곧 나갈 거라는 예고. 신파 없이 담백하게" },
      { t: "누구야",  size: "M",  color: "#FFD9E4", dur: 2200, anim: "drift-in",   note: "목소리 하나가 늘었을 때 (외할아버지)" },
      { t: "따뜻해",  size: "M",  color: "#F0C97A", dur: 2400, anim: "blur-in",    note: "벽등 켜진 방의 온도를 배 안에서 느낀다" },
      { t: "밝다",    size: "M",  color: "#FFE9BE", dur: 2200, anim: "flare-out",  note: "창가에서. 깜깜한 데 있는 아이의 유일한 감탄" },
      { t: "곧",      size: "L",  color: "#F3C9D6", dur: 2600, anim: "fade-rise",  note: "한 글자로 시간을 다 말한다" },
      { t: "조금만",  size: "M",  color: "#FFD9E4", dur: 2400, anim: "fade-rise",  note: "기다려 달라는 뜻이자 기다리겠다는 뜻" },
      { t: "안녕",    size: "XL", color: "#FFD9E4", dur: 1200, anim: "fade-rise",  note: "마지막 흰 화면 직전. 인사인지 예고인지 모르게" },
      { t: "손이다",  size: "M",  color: "#F3C9D6", dur: 2200, anim: "peek-in",    note: "배 위에 얹힌 것의 정체를 알아차렸을 때" }
    ]
  },

  // ───────────────────────────────────────────────
  // C. 반짝임 텍스트 파티클 (1~4글자, 금가루처럼 흩날림)
  // ───────────────────────────────────────────────
  sparkles: [
    "윤슬", "톡", "결", "숨", "볕", "빛알", "반짝", "살폿",
    "여름", "구름", "솜", "깃", "실", "봄", "싹", "씨",
    "점", "금", "분홍", "여린", "말갛", "보송", "포근", "동글",
    "맑음", "고요", "여백", "기척", "온기", "이슬", "낮잠", "물결",
    "✧", "˚", "·", "·˚", "✧˚", "˚·", "·✧·", "˚✧",
    "톡˚", "✧결", "·숨·", "빛˚"
  ],

  // ───────────────────────────────────────────────
  // D. 태동 리듬 텍스트 (텍스트가 박자에 맞춰 튀어오름)
  // ───────────────────────────────────────────────
  // pattern[i] 는 timing[i] ms 에 등장. 각 글자는 등장 후 ~700ms 뒤 pop-out.
  // chapter 는 권장 배치 챕터, feel 은 연출 메모.
  kicks: [
    { id: "k01", pattern: ["콩", "콩", "콩닥"],              timing: [0, 320, 640],            chapter: "ch3", feel: "가장 기본형. 세 번째에서 한 박자 겹쳐 리듬이 살짝 접힌다" },
    { id: "k02", pattern: ["톡", "톡"],                       timing: [0, 240],                 chapter: "ch5", feel: "짧은 대답. 두 번이면 충분하다" },
    { id: "k03", pattern: ["콩닥", "콩닥"],                   timing: [0, 520],                 chapter: "ch7", feel: "느린 두 박. 어른의 심장 쪽에 가깝다" },
    { id: "k04", pattern: ["쿵", "쿵쿵"],                     timing: [0, 700],                 chapter: "ch6", feel: "한 번 크게, 그다음 겹쳐서. 두 번째 항목은 두 글자라 그 자체가 반 박 늦게 닫힌다" },
    { id: "k05", pattern: ["톡", "토독", "톡"],               timing: [0, 260, 600],            chapter: "ch3", feel: "가운데만 두 음절. 발끝이 미끄러진 느낌" },
    { id: "k06", pattern: ["콩", "콩", "콩", "콩닥"],         timing: [0, 300, 600, 900],       chapter: "ch3", feel: "네 박. 마지막에서 이름이 붙는다" },
    { id: "k07", pattern: ["두근", "두근"],                   timing: [0, 640],                 chapter: "ch3", feel: "호명 직전. 태동이 아니라 기대" },
    { id: "k08", pattern: ["톡", "톡", "톡", "톡", "톡"],     timing: [0, 280, 560, 680, 800],  chapter: "ch5", feel: "뒤로 갈수록 빨라진다. 신났을 때" },
    { id: "k09", pattern: ["콩", "콩"],                       timing: [0, 900],                 chapter: "ch4", feel: "사이가 아주 멀다. 침묵을 세는 용도" },
    { id: "k10", pattern: ["쿵", "쿵", "쿵"],                 timing: [0, 480, 960],            chapter: "ch6", feel: "균일한 저역 세 번. 마지막 줌아웃 아래에 깔 것" },
    { id: "k11", pattern: ["콩닥", "톡", "콩닥"],             timing: [0, 360, 700],            chapter: "ch5", feel: "엄마-아이-엄마 순으로 주고받는 형태" },
    { id: "k12", pattern: ["톡", "콩", "콩", "톡"],           timing: [0, 220, 520, 760],       chapter: "ch2", feel: "작은 것과 큰 것이 번갈아. 스티커 붙이는 손과 같은 박" },
    { id: "k13", pattern: ["콩", "콩닥", "콩닥", "콩"],       timing: [0, 340, 680, 1120],      chapter: "ch1", feel: "여닫이형. 시작과 끝이 같은 소리라 문장처럼 읽힌다" },
    { id: "k14", pattern: ["톡톡", "톡"],                     timing: [0, 520],                 chapter: "ch5", feel: "첫 항목이 두 글자라 앞이 무겁다. 신발 두 짝 중 한 짝" },
    { id: "k15", pattern: ["쿵"],                             timing: [0],                      chapter: "ch4", feel: "단 한 번. 여백이 리듬인 챕터에서는 이걸 쓴다" },
    { id: "k16", pattern: ["콩", "콩", "콩", "콩", "콩", "콩"], timing: [0, 300, 600, 900, 1200, 1500], chapter: "ch6", feel: "초음파 필름 일곱 칸에 맞춘 등속 반복. 마지막 칸은 소리 없이 비운다" }
  ],

  // ───────────────────────────────────────────────
  // E. 단어 조각 (의성어도 감탄사도 아닌, 화면에 얹는 명사·부사)
  // ───────────────────────────────────────────────
  fragments: [
    { t: "포니",   note: "CH3 호명. 화면 정중앙, 이 페이지에서 가장 큰 글자여도 된다" },
    { t: "이름",   note: "포니 직후. 작게 받아치듯" },
    { t: "한 짝",  note: "CH5. 띄어쓰기를 살릴 것. 붙이면 뜻이 죽는다" },
    { t: "발",     note: "CH5. 아직 없는 것을 부르는 한 글자" },
    { t: "온기",   note: "CH5 벽등 구간" },
    { t: "마주",   note: "CH5 하트 풍선과 조랑말이 마주 보는 가로선 위" },
    { t: "거꾸로", note: "CH2 뒤집힌 생일 카드" },
    { t: "아직",   note: "CH4의 결론이자 이 작품 전체의 부사" },
    { t: "우리",   note: "CH6. 두 사람이 세 사람이 되는 지점" },
    { t: "셋",     note: "'우리' 다음. 숫자 하나로 끝내는 편이 낫다" }
  ],

  // ───────────────────────────────────────────────
  // F. 챕터별 배치 (at = 챕터 로컬 ms, 0~30000)
  // ───────────────────────────────────────────────
  placement: {

    // CH1 창가에서 · P01, P09 · 빛과 구름, 꽃, 배 위의 한 손
    ch1: [
      { at:   600, text: "뭉게뭉게", pos: "우상", size: "L",  dur: 3200, in: "fade-rise",   out: "drift-out",        color: "#F2D9A0" },
      { at:  2000, text: "화르르",   pos: "상",   size: "XL", dur: 2800, in: "blur-in",     out: "fade-hold",        color: "#FFE9BE" },
      { at:  4200, text: "어른어른", pos: "좌",   size: "M",  dur: 2600, in: "drift-in",    out: "drift-out",        color: "#E8C88A" },
      { at:  6400, text: "아득",     pos: "좌상", size: "L",  dur: 2800, in: "blur-in",     out: "blur-out",         color: "#CBB8D6" },
      { at:  8600, text: "문득",     pos: "우",   size: "M",  dur: 2400, in: "blur-in",     out: "blur-out",         color: "#C9A25E" },
      { at: 10400, text: "살랑",     pos: "우하", size: "S",  dur: 2200, in: "drift-in",    out: "drift-out",        color: "#E8C88A" },
      { at: 12200, text: "일렁",     pos: "좌하", size: "M",  dur: 2600, in: "slide-left",  out: "blur-out",         color: "#BFD6C8" },
      { at: 14000, text: "윤슬",     pos: "하",   size: "S",  dur: 2000, in: "sparkle-pop", out: "sparkle-dissolve", color: "#F5E6C0" },
      { at: 15600, text: "아롱아롱", pos: "우상", size: "M",  dur: 3000, in: "blur-in",     out: "blur-out",         color: "#FFE9BE" },
      { at: 17400, text: "밝다",     pos: "중앙", size: "M",  dur: 2200, in: "blur-in",     out: "fade-hold",        color: "#FFE9BE" },
      { at: 19200, text: "사르르",   pos: "중앙", size: "L",  dur: 2600, in: "fade-rise",   out: "blur-out",         color: "#E8B4C8" },
      { at: 20800, text: "사락",     pos: "우",   size: "M",  dur: 2000, in: "drift-in",    out: "fade-fall",        color: "#F3C9D6" },
      { at: 22200, text: "나부시",   pos: "좌",   size: "M",  dur: 2400, in: "settle-down", out: "sink-out",         color: "#E8C88A" },
      { at: 24200, text: "살포시",   pos: "좌하", size: "M",  dur: 2400, in: "settle-down", out: "sink-out",         color: "#F5E6C0" },
      { at: 25600, text: "반짝",     pos: "중앙", size: "S",  dur: 1400, in: "sparkle-pop", out: "sparkle-dissolve", color: "#FFF2D0" },
      { at: 26800, text: "알알이",   pos: "우상", size: "M",  dur: 2200, in: "sparkle-pop", out: "fade-fall",        color: "#FFE9BE" },
      { at: 28200, text: "사르락",   pos: "상",   size: "L",  dur: 1800, in: "unroll-down", out: "drift-out",        color: "#F5E6C0" }
    ],

    // CH2 반짝이는 것들 · P02 · 스티커, 선반 위 조랑말, 낙서, 거꾸로 된 카드
    ch2: [
      { at:   500, text: "알알이",   pos: "우",   size: "M",  dur: 2200, in: "sparkle-pop", out: "fade-fall",        color: "#FFE9BE" },
      { at:  1600, text: "반짝",     pos: "우상", size: "S",  dur: 1400, in: "sparkle-pop", out: "sparkle-dissolve", color: "#FFF2D0" },
      { at:  2600, text: "오밀조밀", pos: "중앙", size: "L",  dur: 2600, in: "scale-soft",  out: "blur-out",         color: "#E8B4C8" },
      { at:  4000, text: "톡",       pos: "좌",   size: "S",  dur: 1200, in: "sparkle-pop", out: "pop-out",          color: "#FFF2D0" },
      { at:  5200, text: "오도카니", pos: "좌상", size: "M",  dur: 3000, in: "fade-rise",   out: "fade-hold",        color: "#C9A25E" },
      { at:  7400, text: "보들보들", pos: "좌",   size: "M",  dur: 2400, in: "scale-soft",  out: "scale-down",       color: "#E8B4C8" },
      { at:  9000, text: "포옥",     pos: "좌하", size: "M",  dur: 2200, in: "scale-soft",  out: "scale-down",       color: "#F0E4DC" },
      { at: 11200, text: "쓱",       pos: "우하", size: "M",  dur: 1200, in: "slide-left",  out: "pop-out",          color: "#7BD64F" },
      { at: 12200, text: "휙",       pos: "우",   size: "M",  dur: 1200, in: "slide-right", out: "pop-out",          color: "#D94A4A" },
      { at: 13400, text: "동글",     pos: "중앙", size: "S",  dur: 1600, in: "sparkle-pop", out: "pop-out",          color: "#7BD64F" },
      { at: 14800, text: "겹겹",     pos: "좌",   size: "M",  dur: 2400, in: "scale-soft",  out: "fade-fall",        color: "#F3C9D6" },
      { at: 16400, text: "사락",     pos: "우상", size: "M",  dur: 2000, in: "drift-in",    out: "fade-fall",        color: "#F3C9D6" },
      { at: 17800, text: "초롱초롱", pos: "중앙", size: "L",  dur: 2400, in: "bounce-in",   out: "fade-fall",        color: "#E8C88A" },
      { at: 19400, text: "거꾸로",   pos: "상",   size: "M",  dur: 2200, in: "scale-soft",  out: "blur-out",         color: "#D9AE6B" },
      { at: 21200, text: "고놈",     pos: "하",   size: "L",  dur: 2400, in: "fade-rise",   out: "blur-out",         color: "#D9AE6B" },
      { at: 23000, text: "바스락",   pos: "좌하", size: "M",  dur: 2000, in: "drift-in",    out: "blur-out",         color: "#D9AE6B" },
      { at: 24600, text: "조롱조롱", pos: "우",   size: "M",  dur: 2400, in: "fade-rise",   out: "drift-out",        color: "#E8B4C8" },
      { at: 26400, text: "하늘하늘", pos: "우하", size: "M",  dur: 2400, in: "drift-in",    out: "drift-out",        color: "#F5E6C0" },
      { at: 28200, text: "사르르",   pos: "중앙", size: "L",  dur: 1800, in: "fade-rise",   out: "blur-out",         color: "#E8B4C8" }
    ],

    // CH3 포니라는 이름 · P03 · 은박 글자, 하트, 호명, 배냇저고리와 신발 상자
    ch3: [
      { at:   400, text: "두둥실",   pos: "상",   size: "XL", dur: 3000, in: "fade-rise",   out: "drift-out",        color: "#E8C88A" },
      { at:  2200, text: "조롱조롱", pos: "우상", size: "M",  dur: 2400, in: "fade-rise",   out: "drift-out",        color: "#E8B4C8" },
      { at:  4000, text: "반짝",     pos: "좌상", size: "S",  dur: 1400, in: "sparkle-pop", out: "sparkle-dissolve", color: "#FFF2D0" },
      { at:  5200, text: "어른어른", pos: "우",   size: "M",  dur: 2200, in: "drift-in",    out: "drift-out",        color: "#C6CBD1" },
      { at:  6600, text: "둥실",     pos: "좌",   size: "M",  dur: 2400, in: "fade-rise",   out: "drift-out",        color: "#D02534" },
      { at:  8200, text: "톡",       pos: "중앙", size: "S",  dur: 1200, in: "sparkle-pop", out: "pop-out",          color: "#FFF2D0" },
      { at:  9400, text: "또랑또랑", pos: "우하", size: "M",  dur: 2400, in: "bounce-in",   out: "fade-fall",        color: "#E8C88A" },
      { at: 11000, text: "두근",     pos: "좌하", size: "L",  dur: 2400, in: "breath-in",   out: "fade-fall",        color: "#D98CA8" },
      { at: 12400, text: "포니",     pos: "중앙", size: "XL", dur: 3400, in: "scale-soft",  out: "fade-hold",        color: "#D98CA8" },
      { at: 15800, text: "콩",       pos: "중앙", size: "L",  dur: 1200, in: "bounce-in",   out: "pop-out",          color: "#D98CA8" },
      { at: 16800, text: "콩",       pos: "중앙", size: "L",  dur: 1200, in: "bounce-in",   out: "pop-out",          color: "#D98CA8" },
      { at: 18200, text: "나풀",     pos: "우상", size: "M",  dur: 2200, in: "drift-in",    out: "fade-fall",        color: "#FFE9BE" },
      { at: 19800, text: "하늘하늘", pos: "좌",   size: "M",  dur: 2400, in: "drift-in",    out: "drift-out",        color: "#F5E6C0" },
      { at: 21600, text: "도톰",     pos: "우",   size: "S",  dur: 2000, in: "scale-soft",  out: "scale-down",       color: "#E8C88A" },
      { at: 23000, text: "허허",     pos: "좌하", size: "M",  dur: 2200, in: "breath-in",   out: "blur-out",         color: "#D9AE6B" },
      { at: 24600, text: "토독",     pos: "하",   size: "S",  dur: 1400, in: "sparkle-pop", out: "pop-out",          color: "#E8C88A" },
      { at: 25800, text: "아장",     pos: "우하", size: "M",  dur: 2400, in: "bounce-in",   out: "drift-out",        color: "#F0C97A" },
      { at: 27600, text: "이름",     pos: "중앙", size: "L",  dur: 2200, in: "fade-rise",   out: "fade-hold",        color: "#C9A25E" }
    ],

    // CH4 아직 볼 수 없는 얼굴 · P04, P06, P05 · 숨-멈춤. 항목을 줄이고 하나하나 크고 느리게.
    ch4: [
      { at:   900, text: "살며시",   pos: "상",   size: "L",  dur: 3400, in: "fade-rise",   out: "blur-out",  color: "#EDE7E0" },
      { at:  4800, text: "가만",     pos: "좌",   size: "XL", dur: 3800, in: "blur-in",     out: "fade-hold", color: "#DCD6D0" },
      { at:  8200, text: "빼꼼",     pos: "중앙", size: "L",  dur: 2400, in: "peek-in",     out: "pop-out",   color: "#F3C9D6" },
      { at: 10800, text: "쉿",       pos: "중앙", size: "XL", dur: 3400, in: "fade-rise",   out: "fade-hold", color: "#EDE7E0" },
      { at: 14400, text: "축",       pos: "좌하", size: "L",  dur: 2800, in: "settle-down", out: "sink-out",  color: "#C8BEB4" },
      { at: 17400, text: "포옥",     pos: "우",   size: "XL", dur: 3200, in: "scale-soft",  out: "scale-down", color: "#F0E4DC" },
      { at: 20200, text: "숨",       pos: "중앙", size: "XL", dur: 3600, in: "breath-in",   out: "fade-hold", color: "#C8BEB4" },
      { at: 22000, text: "소곤",     pos: "우상", size: "M",  dur: 2600, in: "drift-in",    out: "blur-out",  color: "#E8DDD4" },
      { at: 24000, text: "후",       pos: "하",   size: "XL", dur: 3400, in: "breath-in",   out: "fade-hold", color: "#EDE7E0" },
      { at: 25400, text: "스미듯",   pos: "좌상", size: "L",  dur: 3800, in: "blur-in",     out: "blur-out",  color: "#E5B463" },
      { at: 27000, text: "몽글몽글", pos: "우하", size: "L",  dur: 2600, in: "scale-soft",  out: "blur-out",  color: "#F0E4DC" },
      { at: 28400, text: "아직",     pos: "중앙", size: "XL", dur: 1600, in: "blur-in",     out: "fade-hold", color: "#DCD6D0" }
    ],

    // CH5 작은 신발 한 짝 · P07, P08 · 벽등 앰버, 조용하고 사적인 구간
    ch5: [
      { at:   800, text: "물끄러미", pos: "좌",   size: "L",  dur: 3400, in: "fade-rise",   out: "blur-out",         color: "#F0C97A" },
      { at:  3400, text: "사부작",   pos: "우상", size: "M",  dur: 2400, in: "drift-in",    out: "fade-fall",        color: "#E5B98C" },
      { at:  5400, text: "가만",     pos: "중앙", size: "M",  dur: 2400, in: "blur-in",     out: "fade-hold",        color: "#DCD6D0" },
      { at:  6600, text: "살포시",   pos: "중앙", size: "L",  dur: 2800, in: "settle-down", out: "sink-out",         color: "#F5E6C0" },
      { at:  8800, text: "한 짝",    pos: "좌하", size: "L",  dur: 2600, in: "fade-rise",   out: "fade-hold",        color: "#E8C88A" },
      { at: 10800, text: "콩닥",     pos: "우",   size: "M",  dur: 2200, in: "bounce-in",   out: "pop-out",          color: "#D98CA8" },
      { at: 12400, text: "스미듯",   pos: "상",   size: "L",  dur: 3200, in: "blur-in",     out: "blur-out",         color: "#E4B375" },
      { at: 14600, text: "온기",     pos: "우하", size: "S",  dur: 2200, in: "blur-in",     out: "blur-out",         color: "#F0C97A" },
      { at: 16200, text: "톡톡",     pos: "하",   size: "S",  dur: 1600, in: "sparkle-pop", out: "pop-out",          color: "#F3C9D6" },
      { at: 17800, text: "아장",     pos: "우상", size: "M",  dur: 2400, in: "bounce-in",   out: "drift-out",        color: "#F0C97A" },
      { at: 19600, text: "자박",     pos: "좌",   size: "M",  dur: 2200, in: "fade-rise",   out: "fade-fall",        color: "#E5B98C" },
      { at: 21400, text: "어이구",   pos: "좌상", size: "M",  dur: 2400, in: "fade-rise",   out: "blur-out",         color: "#D9AE6B" },
      { at: 23200, text: "보들보들", pos: "우",   size: "M",  dur: 2400, in: "scale-soft",  out: "scale-down",       color: "#E8B4C8" },
      { at: 25200, text: "둥실",     pos: "좌",   size: "L",  dur: 2600, in: "fade-rise",   out: "drift-out",        color: "#EFA6BC" },
      { at: 26800, text: "통통",     pos: "중앙", size: "M",  dur: 1800, in: "bounce-in",   out: "pop-out",          color: "#F3C9D6" },
      { at: 28200, text: "마주",     pos: "중앙", size: "L",  dur: 1800, in: "scale-soft",  out: "fade-hold",        color: "#E8C88A" }
    ],

    // CH6 우리가 함께 올려다본 것 · P10 · 필름 일곱 칸, 그리고 흰 화면
    ch6: [
      { at:   600, text: "사르륵",   pos: "상",   size: "L",  dur: 2600, in: "unroll-down", out: "blur-out",         color: "#EBD7E0" },
      { at:  2400, text: "그렁",     pos: "좌상", size: "L",  dur: 2800, in: "breath-in",   out: "fade-hold",        color: "#EBD7E0" },
      { at:  4600, text: "쿵",       pos: "중앙", size: "XL", dur: 2200, in: "breath-in",   out: "fade-hold",        color: "#D98CA8" },
      { at:  6200, text: "스르륵",   pos: "우상", size: "L",  dur: 2800, in: "unroll-down", out: "drift-out",        color: "#F5E3C8" },
      { at:  8000, text: "총총",     pos: "중앙", size: "M",  dur: 2400, in: "scale-soft",  out: "fade-fall",        color: "#CBB8D6" },
      { at:  9800, text: "사르락",   pos: "좌",   size: "M",  dur: 2200, in: "drift-in",    out: "fade-fall",        color: "#EBD7E0" },
      { at: 11600, text: "팔랑",     pos: "우",   size: "M",  dur: 2000, in: "drift-in",    out: "drift-out",        color: "#F3C9D6" },
      { at: 13000, text: "아롱아롱", pos: "중앙", size: "L",  dur: 2800, in: "blur-in",     out: "blur-out",         color: "#6A574A" },
      { at: 15000, text: "나야",     pos: "중앙", size: "XL", dur: 2400, in: "fade-rise",   out: "fade-hold",        color: "#F3C9D6" },
      { at: 17200, text: "오도카니", pos: "좌하", size: "M",  dur: 2600, in: "fade-rise",   out: "fade-hold",        color: "#C9A25E" },
      { at: 19200, text: "보들보들", pos: "우하", size: "M",  dur: 2200, in: "scale-soft",  out: "scale-down",       color: "#E8B4C8" },
      { at: 21200, text: "화르르",   pos: "상",   size: "L",  dur: 2600, in: "blur-in",     out: "fade-hold",        color: "#E2B47C" },
      { at: 23000, text: "뭉클",     pos: "좌",   size: "L",  dur: 2800, in: "fade-rise",   out: "blur-out",         color: "#E8C88A" },
      { at: 25000, text: "쿵쿵",     pos: "하",   size: "L",  dur: 2200, in: "bounce-in",   out: "fade-fall",        color: "#E8B4C8" },
      { at: 26200, text: "우리",     pos: "중앙", size: "XL", dur: 2200, in: "fade-rise",   out: "fade-hold",        color: "#F5E3C8" },
      { at: 27600, text: "셋",       pos: "중앙", size: "XL", dur: 1600, in: "scale-soft",  out: "blur-out",         color: "#E8C88A" },
      { at: 28800, text: "안녕",     pos: "중앙", size: "XL", dur: 1200, in: "fade-rise",   out: "fade-hold",        color: "#FFD9E4" }
    ]
  }
};
