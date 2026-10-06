# chongqing-chengdu 프로젝트 메모리

각 작업 세션의 기록을 1블록씩 append로 누적합니다. 작업 시작 시 이 파일을 먼저 읽어 직전 맥락을 이어갑니다.

---

## 2026-08-21 05:30~06:06 UTC / 실제 예약 반영 + 지도 시스템 복원 + 음악 플레이어 수정

**요청요약**: (1) 충칭→구채구, 구채구→청두 기차 시간 변경 반영, (2) 황룡역↔호텔 왕복 셔틀버스 예약 추가(9/4, 9/5), (3) 청두 홍정연(虹亭宴) 궁정 디너쇼 점심 예약 추가, (4) 충칭동물원+량강 야간 유람선 티켓 예약 추가, (5) 일정 변경 반영 + 지도에도 다 마킹, (6) 플레이리스트 음악 연결 안 되는 문제 수정, (7) 대시보드 열면 甜蜜蜜(톈미미)+夜来香(예라이샹) 자동재생, (8) 음악 정지/일시정지 기능 추가.

**수행내용**:
- Trip.com 예약 스크린샷 9장을 직접 읽어 실제 예약 데이터(기차 2건 시간 변경, 셔틀버스 2건, 홍정연 디너쇼, 충칭동물원+유람선) 추출.
- **중요 발견 및 수정**: 최초 작업 시 로컬 클론이 실제 저장소 HEAD보다 3커밋 뒤처져 있었음 — 실제 HEAD에는 `chongqing-chengdu/maps/` 애니메이션 이동 지도 시스템(overview/chongqing/jiuzhaigou/chengdu.html + trip-map.js)이 이미 존재했으나, 이를 모르고 작업하여 `index.html`의 "🗺️ 이동 지도" 네비 버튼을 실수로 파괴하고 중복된 단순 Leaflet 지도 섹션으로 덮어씀. → 이후 `device_bash`로 실제 HEAD 파일들을 추출·비교하여 문제를 발견하고, index.html에서 중복 Leaflet 섹션(CSS/스크립트/마커 IIFE)을 전부 제거하고 원래의 "🗺️ 이동 지도" → `maps/overview.html` 네비 버튼을 복원.
- `index.html`의 `DATA` 블록 수정: 기차 2건 시간/가격/예약번호 갱신, 셔틀버스 2건 신규 예약 추가, `hongjeongyeon-dinner`·`chongqing-zoo` 신규 place 추가, `two-rivers-cruise` 날짜를 9/2로 이동, 관련 itinerary(9/2~9/5, 9/7) 요약 재작성, `theme_music`에 甜蜜蜜+夜来香 추가.
- 음악 플레이어를 YouTube IFrame API 기반으로 전면 교체 (기존 단순 iframe 임베드 → `YT.Player` 큐/자동재생/일시정지/정지 지원). **근본 버그 수정**: `onclick="playMusic('...')"` 형태로 아포스트로피 포함 곡명(예: "One Summer's Day")을 HTML 속성에 넣으면 HTML 엔티티 디코딩이 JS 파싱보다 먼저 일어나 JS 문법 오류가 나던 문제를 `data-*` 속성 + `escAttr()` 헬퍼 + delegated onclick 리스너 방식으로 완전히 수정. 대시보드 오픈 시 `theme_music`(甜蜜蜜+夜来香) 자동재생(음소거 시작, 🔊소리켜기 버튼)과 ⏸/▶ 일시정지, ✕ 정지 버튼 구현.
- `maps/overview.html`, `maps/chongqing.html`, `maps/jiuzhaigou.html`, `maps/chengdu.html` 4개 파일 모두 실제 예약 데이터에 맞춰 재작성: 기차 시간(12:05/13:07/13:55/15:52/19:00/21:24), 실제 셔틀버스 예약번호·시간(16:20 F노선/16:00 C노선), 충칭동물원+량강야간유람선을 Day2(9/2) 저녁 실제 예약으로 이동(원래 Day3에 있던 임시 계획본은 제거), 홍정연 디너쇼를 청두 Day7(9/7) 12:00~14:10 일정에 삽입. **구채구 Day5(9/5) 상세 일정은 16:00 셔틀 정시 출발에 맞춰 전체를 앞당기고(관광 압축: 웅묘해·전죽해·수정구 정차 생략) 명확한 ⚠️ 경고 박스로 안내**. 충칭 Day4(9/4) 이동일 아침 일정도 12:05 기차 출발에 맞춰 전체 앞당김.
- Playwright(모킹된 YT/L 객체 + `node --check`)로 JS 문법·런타임 검증 완료. 모든 stale 시간 참조(20:33, 18:44, 14:35 등) 재검색으로 잔여 없음 확인.

**사용·생성 파일**:
- 수정: `chongqing-chengdu/index.html`, `chongqing-chengdu/maps/overview.html`, `chongqing-chengdu/maps/chongqing.html`, `chongqing-chengdu/maps/jiuzhaigou.html`, `chongqing-chengdu/maps/chengdu.html`
- 미변경(참고용으로만 로컬 복사): `chongqing-chengdu/maps/assets/trip-map.js`, `trip-map.css`
- 정리: 작업 중 생성한 `chongqing-chengdu/_real_head_*.html/js/css` 임시 파일들을 `chongqing-chengdu/_to_delete/`로 이동(device_bash가 삭제 권한이 없어 사용자가 직접 폴더 삭제 필요).

**산출물 URL**: https://sjbaik0431.github.io/chongqing-chengdu/ (커밋·푸시 후 반영)

**다음 액션**:
1. 사용자가 로컬 터미널에서 `git status`로 변경사항 확인 (단, `.git/index.lock` 파일이 남아있으면 삭제 후 진행 — 작업 중 device_bash 명령이 중간에 끊기며 생성된 것으로 추정).
2. `chongqing-chengdu/index.html`과 `chongqing-chengdu/maps/*.html` 4개 파일만 `git add`(레포 전체가 CRLF/LF 줄바꿈 이슈로 다 modified로 뜨는 기존 문제가 있으니 관련 없는 파일은 add하지 말 것) → commit → push.
3. `chongqing-chengdu/_to_delete/` 폴더는 확인 후 수동 삭제.
4. GitHub Pages 반영 후 실제 배포 사이트에서 음악 자동재생·지도 네비게이션·새 예약 항목들이 정상 표시되는지 최종 확인 권장.

---

## 2026-08-31 11:01 UTC — 대시보드 수정(호텔·셔틀·홍정연 재확인 + 새우메뉴 제거 + 9/7점심 대체 + 지도마커 보강)

**작업유형**: 대시보드 데이터 수정 + 지도(maps/) 마커 추가 + 실주소/연락처 리서치

**요청요약**: (1) 충칭 숙소 Elysee Sky Hotel 반영 확인, 구채구 왕복 유료 셔틀 취소→호텔 무료 셔틀 확인, 홍정연 궁정 디너쇼 예약 취소 확인. (2) 아침/점심/저녁/나이트라이프 메뉴 중 새우·킹크랩 포함 메뉴 삭제. (3) 나머지 메뉴 식당 주소·연락처 상세 조사 후 여행 지도(maps/)에 표기. (4) 식당(조식/중식/석식)·차마시는곳·간식먹는곳·저녁맥주마시는곳 전부 마킹.

**수행내용**:
- 세션 시작 시 로컬 클론이 origin보다 뒤처져 있어(`git fetch`+`git log HEAD..origin/main`) CRLF 노이즈만 있는 무관 파일은 `git checkout --`로 버리고 `git merge --ff-only origin/main`으로 정확히 동기화 후 작업 시작(직전 세션의 "구버전 클론으로 작업 중 지도 시스템 파괴" 실수 재발 방지).
- index.html의 `DATA.hotels_selected.chongqing`, `reservations`(셔틀 2건·홍정연), `tickets_todo`는 이미 이전 세션(커밋 f8bd939, 94760df)에서 정확히 반영되어 있음을 JSON 파싱으로 확인 — 추가 수정 불필요.
- **새우/킹크랩 실제 메뉴 항목**: `DATA.dining`(30건)에는 없었고, `maps/chengdu.html` 슈지우샹 훠궈(9/6 저녁) food 목록의 "虾滑(새우완자)"만 실제 주문 메뉴로 존재 → 삭제하고 "不要虾滑" 확인 문구 추가. (인덱스의 알러지 경고 배너·이츠카드 21종은 사전 확인용 안전장치이므로 유지.)
- **9/7 점심 대체**: 웹 리서치로 청두 롱차오슈어(龙抄手) 춘시로총점 실주소(城守街63号) 확인 → 홍정연 자리를 대체. `index.html`(DATA.dining/places/tts_script) + `maps/chengdu.html`(Day7 stop·이틀 얼개 노트·학화찻집 desc) 전부 동기화.
- **충칭 숙소 정보 갱신**: 웹 리서치로 Elysee Sky Hotel(艾诗丽舍高空酒店·重庆解放碑洪崖洞店) 실주소(重庆市渝中区新华路328号)·대표전화(+86-23-6300-6188) 확인. `maps/chongqing.html`이 여전히 구 호텔명(Holiday Four Seasons·临江路60号)을 쓰고 있던 것을 발견해 HOTEL 좌표·HADDR 변수·전 stops의 addr·안내 노트까지 전부 교체(HADDR 변수 도입, 8곳 일괄 치환). `index.html`의 checklists/meta.hotel_strategy/hotelInfo 배너에 남아있던 구 호텔명·구 가격(240,147원)도 224,880원으로 수정.
- **판다카페(9/6 점심)·琴台路 노포(9/6 저녁)**: DATA.dining이 실제 지도 동선(판다기지 제외, 슈지우샹 훠궈 저녁)과 어긋나 있던 것을 발견해 금리 고거리 점심·슈지우샹 훠궈 저녁으로 정합.
- **식당/차/간식/맥주 마커 전수 점검**: 4개 map 페이지(overview/chongqing/jiuzhaigou/chengdu.html)와 trip-map.js 엔진 구조(course().stops/food[]/info[], popupHTML의 고덕지도·구글 링크 자동생성, 기사님께 카드) 확인 후, DATA.dining 30건을 기존 stops/food[] 마커와 대조해 누락분만 신규 추가:
  - 충칭: 디 온리 카페(신규 tea), Chadianxia Coffee(신규 tea), Caver 精酿酒吧(신규 맥주), 칠성강 노포거리(신규 lunch), 홍야동 stop에 重庆啤酒 야간맥주 문구 추가, 交通茶馆 주소 정정.
  - 구채구: 청과藏餐厅(신규 dinner, 九寨千古情 맞은편), 노일랑 환승센터에 짜파/야크요구르트 간식 문구 추가.
  - 청두: 위린 소주관(玉林小酒馆, 신규 선택 맥주), 롱차오슈어 주소 정정(城守街63号).
- 웹 리서치로 확인한 실주소·전화: 陶然居 南滨路店(+86-23-8902-3118, 폐업정보 있어 재확인 권장 문구 첨부), 武侯祠/锦里 매표부(+86-28-8553-5951), 交通茶馆(重庆市九龙坡区黄桷坪街道新建路3栋临街门面34号). 蜀九香火锅 人民南路店은 Ctrip에서 "商户已下线"(폐업 가능성) 확인 → 삭제 대신 "방문 전 최신 영업 여부 확인 권장" 캐션 추가(허위 대체정보 기입 지양).
- `diningCardHTML`(index.html)에 `d.phone` 표시 필드(☎) 신규 추가.
- 4개 수정 파일 모두 Node `new Function()`으로 인라인 스크립트 문법 검증 통과, JSON.loads로 DATA 무결성 확인.
- 로컬 저장소에 git identity(user.name/email = Cowork-Claude/cowork@claude.ai, local scope)가 없어 최초 설정 후 커밋, PAT 임베드 URL로 push 성공(커밋 5868760).

**사용·생성 파일**:
- 수정: `chongqing-chengdu/index.html`, `chongqing-chengdu/maps/chongqing.html`, `chongqing-chengdu/maps/chengdu.html`, `chongqing-chengdu/maps/jiuzhaigou.html`
- 미변경: `chongqing-chengdu/maps/overview.html`, `chongqing-chengdu/maps/assets/trip-map.js`, `trip-map.css` (구조 파악만, 편집 없음)

**산출물 URL**: https://sjbaik0431.github.io/chongqing-chengdu/ · https://sjbaik0431.github.io/chongqing-chengdu/maps/chongqing.html · .../maps/chengdu.html · .../maps/jiuzhaigou.html (커밋 5868760, push 완료 · GitHub Pages 반영까지 수 분 소요될 수 있음)

**다음 액션**:
1. GitHub Pages 재배포 후 실제 사이트에서 충칭 지도 핀 위치(신화로 328号 근사치)·9/7 롱차오슈어 마커·신규 차/간식/맥주 마커가 정상 표시되는지 최종 확인.
2. 陶然居 南滨路店·蜀九香 人民南路店은 온라인상 폐업 정보가 있어 실제 출발 전 大众点评/디디로 최신 영업 여부 재확인 권장(사용자에게 안내됨).
3. `chongqing-chengdu/_to_delete/` 폴더가 여전히 남아있으면 사용자가 직접 삭제.
