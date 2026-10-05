# 🌎 백상진·박현교 부부 북미·중남미 자유여행 (2027.4.17~6.30, 75일·72박)

- **여행**: 뉴욕 입국 → 북미 동→서 횡단 → 멕시코·코스타리카·에콰도르(갈라파고스) → 페루·볼리비아·칠레 → 아르헨티나·브라질 → 파리 3박 → 인천
- **Live**: https://sjbaik0431.github.io/na-sa-trip/
- **숙박 보고서**: https://claude.ai/code/artifact/c8d586af-0257-4d74-a4db-0b8cb848e9a4
- **음성 해설(TTS)**: 이전 101일 일정 기준으로 만든 것이라 새 일정과 내용이 다릅니다. 파일은 수정하지 않았고, 재녹음은 일정이 확정된 뒤에 합니다.

## 일정이 바뀔 때 (대시보드만 갱신)
1. `_edit/stops.json` 에서 도시 순서·박 수·이동수단을 고칩니다.
2. 숙박·예산·기후·체크리스트 문구는 `_edit/sections.json` 에서 고칩니다.
3. `cd _edit && python3 update_plan.py` 실행 → index.html·maps/map_data.js·overview.html 이 다시 만들어집니다(음성 파일은 건드리지 않음).
4. 실행 전 `_edit/backup/` 에 index.html 사본이 자동 저장됩니다.
