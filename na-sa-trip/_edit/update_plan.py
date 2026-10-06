#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""대시보드 일정 갱신기 — 음성(mp3·tts_script·durations)은 건드리지 않습니다.
사용법: 이 폴더(_edit)에서  python3 update_plan.py
 - stops.json  : 여정 순서·박 수·이동수단 (고치면 일정/지도/부록 일정표/날짜가 모두 다시 만들어집니다)
 - sections.json: 숙박·예산·기후·체크리스트 등 문구(통째로 덮어쓰기)
실행 전 자동으로 ../_edit/backup/ 에 index.html 사본을 남깁니다."""
import re, json, os, shutil, datetime, copy
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
IDX=os.path.join(ROOT,'index.html')
st=json.load(open(os.path.join(HERE,'stops.json'),encoding='utf-8'))
sec=json.load(open(os.path.join(HERE,'sections.json'),encoding='utf-8'))
os.makedirs(os.path.join(HERE,'backup'),exist_ok=True)
shutil.copy(IDX,os.path.join(HERE,'backup','index_%s.html'%datetime.datetime.now().strftime('%Y%m%d_%H%M%S')))
s=open(IDX,encoding='utf-8',newline='').read()
m=re.search(r'const DATA = (\{.*\});\r?\n',s)
D=json.loads(m.group(1))
BASE=os.path.join(HERE,'base_days.json')
if not os.path.exists(BASE):
    json.dump(D['itinerary'],open(BASE,'w',encoding='utf-8'),ensure_ascii=False)
base=json.load(open(BASE,encoding='utf-8'))
PLACES_BASE=os.path.join(HERE,'base_places.json')
if not os.path.exists(PLACES_BASE):
    json.dump(D['places'],open(PLACES_BASE,'w',encoding='utf-8'),ensure_ascii=False)
places=json.load(open(PLACES_BASE,encoding='utf-8'))

# ---------- 새 명소 ----------
def P(id,ko,en,city,country,intro,tip,lat,lng,food=None):
    return {"id":id,"name_ko":ko,"name_en":en,"city":city,"country":country,"intro":intro,"tip":tip,"nearby_food":food or [],"coordinates":{"lat":lat,"lng":lng}}
NEW=[
 P('big-sur-bixby','빅서 비직스비 브리지','Bixby Creek Bridge','빅서 (경유)','미국','1번국도의 상징이 된 아치 다리. 해안 절벽과 태평양이 한 컷에 담깁니다.','도로 통제·산사태 여부를 출발 전 확인하고 해 지기 전에 통과하세요.',36.3715,-121.9018),
 P('poas-volcano','포아스 화산','Poás Volcano','산호세(코스타리카)','코스타리카','분화구 호수를 내려다볼 수 있는 국립공원. 산호세에서 당일투어로 갑니다.','오전에 맑고 오후엔 구름이 끼기 쉬워 일찍 출발. 입장 시간 예약이 필요할 수 있습니다.',10.1977,-84.2330),
 P('quito-old-town','키토 구시가지','Quito Old Town','키토','에콰도르','남미 최초로 유네스코 세계유산에 오른 구시가지. 플라사 그란데와 성당·수도원이 모여 있습니다.','해발 2,850m라 천천히 걷고, 밤 이동은 택시/우버를 이용하세요.',-0.2201,-78.5123),
 P('galapagos-darwin','찰스 다윈 연구소','Charles Darwin Research Station','갈라파고스(산타크루스)','에콰도르','산타크루스 섬 마을에 있는 연구소. 육지거북 번식 프로그램을 볼 수 있습니다.','입도 때 국립공원 입장료·TCT가 필요합니다. 야생동물 접근 거리 규정을 지키세요.',-0.7433,-90.3039),
 P('santiago-san-cristobal','산크리스토발 언덕','Cerro San Cristóbal','산티아고','칠레','산티아고 전경과 안데스 설산이 한눈에 보이는 언덕. 케이블카·푸니쿨라로 오릅니다.','맑은 날 오전이나 해 질 무렵이 가장 선명합니다.',-33.4263,-70.6347),
 P('paris-eiffel','에펠탑','Eiffel Tower','파리','프랑스','파리의 상징. 센강 건너 트로카데로 광장에서 보는 전경이 가장 좋습니다.','꼭대기 입장은 시간대 예약. 소매치기를 조심하세요.',48.8584,2.2945),
 P('london-westminster','웨스트민스터·빅벤','Westminster & Big Ben','런던','영국','국회의사당과 빅벤, 웨스트민스터 사원이 모인 런던의 중심. 템스강변 산책이 좋습니다.','관광객이 몰리는 곳이라 소매치기를 조심하고 아침 일찍 가면 한산합니다.',51.5007,-0.1246),
 P('prague-old-town','프라하 구시가지 광장·카를교','Old Town Square & Charles Bridge','프라하','체코','천문시계가 있는 구시가지 광장과 블타바강 위의 카를교. 귀국 전 마지막 산책 코스로 좋습니다.','낮에는 관광객이 많아 이른 아침이나 해 질 무렵을 추천합니다.',50.0875,14.4213),
]
have={p['id'] for p in places}
for p in NEW:
    if p['id'] not in have: places.append(p)
D['places']=places
NEWPLACE={'big_sur':'big-sur-bixby','san_jose':'poas-volcano','quito':'quito-old-town','galapagos':'galapagos-darwin','santiago':'santiago-san-cristobal','paris':'paris-eiffel','london':'london-westminster','prague':'prague-old-town'}
EXTRA_FREE=["🌿 자유 일정 · 여유","정해진 일정 없이 동네 산책·카페·현지 마켓 구경 등 쉬어가는 날. 컨디션 보며 근교 소도시나 못 가본 명소를 자유롭게 추가해도 좋음."]

# ---------- 일정 생성 ----------
def pick(old_city,n):
    days=[d for d in base if d['city']==old_city and 'inti-raymi' not in (d.get('places_ids') or [])]
    if not days: return []
    first=days[0]; rest=days[1:]
    withp=[d for d in rest if d.get('places_ids')]; others=[d for d in rest if not d.get('places_ids')]
    chosen=[first]+(withp+others)[:max(0,n-1)]
    chosen=chosen[:n]
    chosen.sort(key=lambda d:d['day_num'])
    return chosen[:n]
it=[]; cur=datetime.date.fromisoformat(st['start']); stops=st['stops']; arr={}
def add(date,city,en,country,leg,nights,title,summary,pids,mode_leg=''):
    it.append({"date":date.isoformat(),"day_num":len(it)+1,"city":city,"city_en":en,"country":country,"leg_nights":nights,"leg_mode":leg,"title":title,"summary":summary,"places_ids":pids})
for i,sp in enumerate(stops):
    n=sp['nights']; arr[sp['key']]=cur
    if sp.get('days'):
        dl=[]
        for it_ in sp['days']:
            if isinstance(it_,str) and it_.startswith('old:'):
                _,cn,ix=it_.split(':'); cand=[d for d in base if d['city']==cn and 'inti-raymi' not in (d.get('places_ids') or [])]; d0=cand[int(ix)]
                dl.append((d0['title'],d0['summary'],list(d0.get('places_ids') or [])))
            else: dl.append((it_[0],it_[1],list(it_[2]) if len(it_)>2 else []))
        pid=NEWPLACE.get(sp['key'])
        if pid and len(dl)>1: dl[1]=(dl[1][0],dl[1][1],[pid])
        elif pid: dl[0]=(dl[0][0],dl[0][1],[pid])
    else:
        ch=pick(sp['old'],n) if sp.get('old') else []
        dl=[(d['title'],d['summary'],d.get('places_ids',[])) for d in ch]
    while len(dl)<n: dl.append((EXTRA_FREE[0],EXTRA_FREE[1],[]))
    dl=dl[:n]
    for k,(t,sm,p) in enumerate(dl):
        add(cur+datetime.timedelta(days=k),sp['city'],sp['en'].split(',')[0],sp['country'],sp['leg'] if k==0 else '',n,t,sm,p)
    cur+=datetime.timedelta(days=n)
    for a in sp.get('after',[]):
        add(cur,a['city'],'' ,'대한민국' if a['city']=='인천' else sp['country'],a['leg'],n,a['title'],a['summary'],[])
        cur+=datetime.timedelta(days=1)
# 마지막 인천 도착일 보정: after 항목이 날짜 하루씩 이동
D['itinerary']=it
ndays=len(it); nights=sum(x['nights'] for x in stops)
first=it[0]['date']; last=it[-1]['date']
def md(iso): d=datetime.date.fromisoformat(iso); return '%d.%d'%(d.month,d.day)
D['meta']['subtitle']='%s ~ %s · %d일(숙박 %d박) · 동부·LA 패키지 + 남미 25일 패키지 · 뉴욕 입국 → 런던·프라하 → 인천'%('2027.'+md(first),md(last),ndays,nights)
D['meta']['end_iso']=last
D['meta']['concept']='동부 투어(4/17~22)와 LA 출발 패키지(5/3~7)·남미 25일 패키지(5/21~6/14)는 한국 여행사 패키지, 그 사이와 끝(런던·프라하)은 두 분 페이스대로 개별 일정입니다. 렌터카는 쓰지 않고 기차·항공으로 이동합니다.'

# ---------- 섹션 덮어쓰기 ----------
URL=sec['LODGING_REPORT_URL']
for k in ['transport_guide','climate','festivals','phase_checklists','booking_priorities','budget_detail']:
    D[k]=sec[k]
rg=D['rental_guide']; 
for k in ['intro','recommended_plan','total_estimate','booking_tips']: rg[k]=sec['rental_guide'][k]
for c in rg['companies']:
    c['desc']='이번 일정에서는 렌터카를 사용하지 않습니다(계획이 바뀔 때를 위한 참고 정보).'
ag=json.loads(json.dumps(sec['accommodation_guide'],ensure_ascii=False).replace('__URL__',URL))
D['accommodation_guide']=ag
# 예산 요약(상세 합계에서 계산)
cats=[]; tl=th=0
NOTE=sec['budget_extra']['notes']
for i,sc in enumerate(sec['budget_detail']['sections']):
    lo=sum(x['low'] for x in sc['items']); hi=sum(x['high'] for x in sc['items'])
    cats.append({"name":sc['cat'],"low_usd":lo,"high_usd":hi,"note":NOTE[i]}); tl+=lo; th+=hi
fx=sec['budget_extra']['krw']
D['budget']={"title":sec['budget_extra']['title'],"fx_note":sec['budget_extra']['fx_note'],"categories":cats,
 "note":"위 항목을 모두 더하면 2인 합산 약 %s~%s달러(약 %s만~%s만 원) 수준입니다. 모두 추정치이며 갈라파고스 비용·현지 변수를 감안해 여유분 15~20%%를 더 잡아두시길 권합니다."%(format(tl,','),format(th,','),format(round(tl*fx/10000),','),format(round(th*fx/10000),','))}
mg=json.dumps(D['mileage_guide'],ensure_ascii=False)
mg=mg.replace('6/29~30','6/24~25').replace('90일 이상의 대장정이니','70일의 대장정이니').replace('파리발 귀국편','프라하발 귀국편')
MG=json.loads(mg)
c2=MG['categories'][1]['items']
c2[1]={'perk':'프라하(PRG) → 인천 [마일리지, 귀국 · 확정]','desc':'2027-06-24(목) OZ546 프라하 18:50 → 인천 6/25 13:10 도착. 2인 편도 마일리지 70,000마일 + 세금·유류할증료 ₩705,200로 조회되었습니다. 아시아나는 남미·유럽 일부에 취항하지 않으므로 리우→파리→런던(에어프랑스, 현금)과 런던→프라하(항공, 현금)는 별도 발권이고, 프라하→인천만 마일리지로 발권합니다. 2026-12-17 통합 이후 규정이 바뀔 수 있어 발권 전 예약센터에 공제표·좌석을 확인하세요.'}
c3=MG['categories'][2]['items']
c3[0]['desc']=c3[0]['desc'].replace('구간 렌터카를 섞어 계획했고','패키지·기차를 섞어 계획했고')
c3[1]={'perk':'LA → 멕시코시티 (아에로멕시코 5/7 12:10, 확정) → 칸쿤 → 산호세 → 키토','desc':'LAX→MEX는 아에로멕시코 12:10 출발로 조회·확정했습니다. 이후 아에로멕시코·코파항공·아비앙카 등 중심(경유편 많음, 구간별 확인). 현금 결제.'}
c3[4]={'perk':'리마 → 리우 (한국 여행사 남미 25일 패키지)','desc':'리마에서 합류해 리우에서 끝나는 패키지입니다. 구간 항공·버스는 패키지에 포함되는지 업체 확정서로 확인하세요.'}
c3[5]={'perk':'리우 → 파리(CDG) → 런던 [에어프랑스 6/17 22:00, 현금]','desc':'리우(GIG) 22:00 출발 → 파리 6/18 도착, 23시간 경유(시내 1박) → 6/19 런던(LHR) 13:45 도착. 에어프랑스 현금 항공권이며 가격은 조회 화면 기준이라 예약 시점에 확인하세요. 런던→프라하는 별도 항공(현금)입니다.'}
c3.append({'perk':'뉴어크(EWR) → 밴쿠버(YVR) [에어캐나다 4/27 18:20, 현금]','desc':'동부 투어 종료 후 뉴욕·보스턴을 거쳐 4/27에 밴쿠버로 이동합니다. 캐나다 eTA가 필요합니다.'})
D['mileage_guide']=MG
em=[e for e in D['emergency'] if not any(w in e['label'] for w in ('쿠바','우루과이'))]
labs=' '.join(e['label'] for e in em)
for lab,ph,nt in [('코스타리카 긴급','911','경찰·구급 통합'),('에콰도르 긴급(ECU 911)','911','경찰·구급·소방 통합'),('프랑스·유럽 긴급','112','EU 공통(구급 15·경찰 17)'),('영국 긴급','999','경찰·구급·소방(112도 연결)'),('체코 긴급','112','경찰·구급·소방 통합')]:
    if lab.split()[0] not in labs: em.append({'label':lab,'phone':ph,'note':nt})
D['emergency']=em
D['venezuela_note']=json.loads(json.dumps(D['venezuela_note'],ensure_ascii=False).replace('90일이라는','%d일이라는'%ndays).replace('74일이라는','%d일이라는'%ndays))

# ---------- index.html 재조립 ----------
newdata='const DATA = '+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';'
s=s[:m.start()]+newdata+s[m.end(m.group(0).index(';')+1) if False else m.end()-len(m.group(0))+len(m.group(0))-len(('\r\n' if m.group(0).endswith('\r\n') else '\n'))]+s[m.end()-len(('\r\n' if m.group(0).endswith('\r\n') else '\n')):] if False else s[:m.start()]+newdata+('\r\n' if m.group(0).endswith('\r\n') else '\n')+s[m.end():]

# 부록 재생성
MON=['','Jan','Feb','Mar','Apr','May','Jun','Jul']
def en(d): d=datetime.date.fromisoformat(d) if isinstance(d,str) else d; return '%s %d'%(MON[d.month],d.day)
def kd(d): return '%d/%d'%(d.month,d.day)
# 국가 묶음
groups=[]; 
for sp in stops:
    a=arr[sp['key']]; e=a+datetime.timedelta(days=sp['nights'])
    g=next((g for g in groups if g['cc']==sp['cc']),None)
    if g is None: g={'cc':sp['cc'],'ranges':[]}; groups.append(g)
    if g['ranges'] and g['ranges'][-1][1]==a: g['ranges'][-1][1]=e
    else: g['ranges'].append([a,e])
def rng(g): return ', '.join('%s~%s'%(kd(a),kd(b)) for a,b in g['ranges'])
ROWS={
'US':('🇺🇸 미국','<b>ESTA</b>(전자여행허가)','최대 90일','공식 사이트 esta.cbp.dhs.gov 에서 신청(수수료 약 $40, 2026년 $40.27 안내). 승인 후 2년 유효. 출발 최소 72시간 전, <b>여유 있게 1~2개월 전</b> 권장. 승인이 입국을 보장하지는 않음.','입국심사 때 지문·얼굴 촬영. SNS 계정 제출 의무화는 현재 <b>제안 단계(미확정)</b>이니 신청 시점에 최신 안내 확인. 유사 대행 사이트 주의. 밴쿠버→샌프란시스코는 밴쿠버 공항에서 <b>미국 입국심사(사전통과)</b>를 받으므로 3시간 전 도착.'),
'CA':('🇨🇦 캐나다','<b>eTA 불필요</b>(시애틀→밴쿠버 기차=육로 입국)','최대 6개월','사전 신청 없음. <b>항공 입국으로 바뀌면 eTA(약 CAD 7) 필수</b>.','여권 지참, 국경 심사 질문(방문 목적·체류일). 미국 ESTA 유효 상태 유지.'),
'MX':('🇲🇽 멕시코','무비자(사전 허가 없음)','최대 180일(심사관이 일수 부여)','사전 신청 없음.','입국 시 여권·출국 항공권 확인 가능. 부여된 체류일수 확인. 입국 신고는 항공사 안내 확인.'),
'CR':('🇨🇷 코스타리카','무비자로 알려져 있음(출발 전 외교부·대사관 재확인)','일반적으로 최대 90일','사전 신청 없음(재확인).','입국 시 <b>출국(다음 도시) 항공권 증빙</b>을 요구할 수 있습니다. 오프라인 저장. 황열병 접종 증명 요구 여부는 경유 국가에 따라 달라 출발 전 확인.'),
'EC':('🇪🇨 에콰도르 (갈라파고스 포함)','무비자로 알려져 있음(출발 전 외교부·대사관 재확인)','일반적으로 최대 90일','본토: 사전 신청 없음(재확인). <b>갈라파고스</b>: 국립공원 입장료($200/성인 안내), TCT 입도카드($20), 출발 전 생물안전 신고서, 6개월 이상 여권, 왕복 항공권·숙소 증빙 — 금액·서류는 제3자 사이트 기준이라 <b>공식 사이트에서 재확인</b>.','갈라파고스 도착 시 짐 검사(식물·씨앗·생물 반입 금지). 해발 2,850m 키토에서 고산 적응.'),
'PE':('🇵🇪 페루','무비자','최대 90일 안팎(심사관 부여 일수 확인)','사전 신청 없음. 마추픽추 입장권·열차 사전 예약.','출국(항공·버스) 증빙 요구 가능. 황열병 접종 권장(볼리비아 입국 요건과 연결).'),
'BO':('🇧🇴 볼리비아','무사증(2025.12.2부터 한국인 대상, 외교부 안내)','최대 90일(도장이 30일로 찍히는 경우 많음 → 체류일 확인)','<b>SIGEMIG 온라인 사전 등록</b>(무료, 여행 30일 전부터 가능, QR코드 — 한국인 적용 여부 출발 전 재확인). <b>황열병 접종증명서</b>(감염위험국 경유·저지대 방문 시, 종이 수첩만 인정) — 페루에서 육로 입국하므로 지참 강력 권장.','여권 유효기간 6개월 이상, 첫 숙박지 예약과 출국 증빙 지참. 푸노→라파스, 우유니→칠레는 육로 국경.'),
'CL':('🇨🇱 칠레','무비자','최대 90일','사전 신청 없음.','<b>SAG 농축산물 신고서</b> 작성 의무(과일·육류·유제품·씨앗 반입 금지, 위반 시 벌금). 우유니→아타카마 국경 버스 입국 시 짐 검사.'),
'AR':('🇦🇷 아르헨티나 (이구아수 포함)','무비자','최대 90일','사전 신청 없음.','이구아수 브라질 쪽 방문 시 출입국 스탬프 확인. 겨울(6월)이라 엘칼라파테 방한 필수.'),
'BR':('🇧🇷 브라질','무비자(한국인)','최대 90일','사전 신청 없음.','세관 신고, 황열병 접종 권장(이구아수 등). 이구아수는 아르헨티나·브라질 양쪽 국경 이동.'),
'FR':('🇫🇷 프랑스(솅겐)','무비자(솅겐 90일)','솅겐 180일 중 90일','3박 시내 체류(입국)이므로 EES 지문·얼굴 등록, <b>ETIAS</b>(2026년 4분기 시행 예정으로 알려짐 — 시행·유예 여부 최신 확인).','리우→파리(현금)와 파리→인천(마일리지)은 별도 발권일 수 있어 <b>짐을 찾아 다시 부쳐야 하면 입국 절차</b>가 필요합니다. 수하물 연결 여부를 발권 때 확인.')}
usx=[g for g in groups if g['cc']=='US'][0]; us_exit=usx['ranges'][-1][1]
ret=datetime.date.fromisoformat(last)
dep_prg=ret-datetime.timedelta(days=1)
usdays=sum((b-a).days for a,b in usx['ranges'])
ROWS['US']=(ROWS['US'][0],ROWS['US'][1],ROWS['US'][2],ROWS['US'][3],'입국심사 때 지문·얼굴 촬영. SNS 계정 제출 의무화는 현재 <b>제안 단계(미확정)</b>이니 신청 시점에 최신 안내 확인. 유사 대행 사이트 주의. 밴쿠버→시애틀은 <b>육로(기차/버스) 미국 재입국</b>이라 국경에서 입국심사를 다시 받고, 육로 입국 시 I-94 수수료가 부과될 수 있으니 CBP 공식 안내를 확인하세요.')
ROWS['CA']=('🇨🇦 캐나다','<b>eTA 필수</b>(뉴어크→밴쿠버 항공 입국)','최대 6개월','캐나다 공식 사이트에서 eTA 신청(약 CAD 7/인, 보통 수 분~수일). 여권과 연결되므로 영문 이름을 정확히 입력하고 출발 전 여유 있게 받으세요.','밴쿠버 입국 시 방문 목적·체류일·숙소 질문. 4/29 시애틀로 육로 출국 때 미국 국경 심사를 받습니다.')
ROWS['FR']=('🇫🇷 프랑스(솅겐)','무비자(솅겐 90일)','솅겐 180일 중 90일','공항 경유가 아니라 <b>입국 후 시내 1박</b>(런던행 연결편이 23시간 뒤)이므로 EES 지문·얼굴 등록, <b>ETIAS</b>(2026년 4분기 시행 예정으로 알려짐 — 시행·유예 여부 최신 확인).','리우→파리→런던이 한 예약이라도 시내 1박이 필요하면 짐을 찾을지 항공사에 확인하세요. 파리 6/18~6/19.')
ROWS['GB']=('🇬🇧 영국','<b>ETA</b>(전자여행허가) 필요','최대 6개월(방문)','영국 정부 공식 사이트·앱에서 ETA 신청(약 £16/인, 보통 3영업일 이내 — 최신 요금·소요 확인). 출발 전 미리 받으세요.','런던 도착 6/19 13:45, 입국심사(전자게이트 이용 가능 여부 확인). 체류 6/19~6/23.')
ROWS['CZ']=('🇨🇿 체코(솅겐)','무비자(솅겐 90일)','솅겐 180일 중 90일','사전 신청 없음. ETIAS 시행 여부 최신 확인.','영국→솅겐 재진입이라 EES 등록이 필요할 수 있습니다. 프라하 6/23~6/24, 귀국 항공 체크인은 3시간 전.')
trs=''
for g in groups:
    r=ROWS[g['cc']]
    trs+='<tr><td><b>%s</b><br>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'%(r[0],rng(g),r[1],r[2],r[3],r[4])
b1='<details open><summary>1. 국가별 비자·전자허가 한눈에 보기</summary><div class="vtable-wrap"><table class="vtable"><thead><tr><th>국가 · 체류</th><th>비자·허가</th><th>허용 체류</th><th>사전 절차</th><th>현지 입국·주의</th></tr></thead><tbody>'+trs+'</tbody></table></div>\n      <div class="warn">ℹ️ 캐나다는 항공 입국이라 <b>eTA</b>, 영국은 <b>ETA</b>가 필요합니다. 코스타리카·에콰도르·갈라파고스 서류는 제3자 정보를 바탕으로 한 것이라 <b>출발 3개월 전과 1주 전에 공식 사이트에서 반드시 재확인</b>하세요.</div></details>'
b2='<details><summary>2. 준비 타임라인 (언제 무엇을)</summary><ul>\n<li><b>지금~출발 6개월 전:</b> 여권 유효기간 확인(귀국일 %s 기준 6개월 이상 → <b>2027년 12월 25일 이후 만료</b>여야 안전), 전자여권 확인.</li>\n<li><b>출발 3~4개월 전:</b> ESTA·캐나다 eTA·영국 ETA 신청, EWR→YVR·LAX→MEX·리우→런던 항공권과 코스트 스타라이트 예약, 동부·LA·남미 패키지 확정, 황열병 예방접종 상담(접종 후 10일 지나야 효력, 증명서는 평생 유효), 갈라파고스 항공권·숙소.</li>\n<li><b>출발 1~2개월 전:</b> 여행자보험(영문 가입증명서), SIGEMIG(볼리비아, 30일 전부터 가능), 갈라파고스 생물안전 신고 등 입도 서류 재확인.</li>\n<li><b>출발 1주 전:</b> 모든 증빙(ESTA·eTA·ETA·항공권·숙소·보험) 출력본 + 휴대폰 오프라인 저장.</li>\n<li><b>매 국경 이동 전날:</b> 여권 스탬프로 체류일수 확인, 다음 국가 입국 서류(QR·신고서) 점검.</li></ul></details>'%(kd(ret))
b3='<details><summary>3. 미국 입국심사 — 준비 서류</summary><ul>\n<li>여권(원본), <b>ESTA 승인서</b>(캡처·출력)</li>\n<li>인천→뉴욕 전자항공권 e-ticket 사본(예약정보는 이 페이지에 적지 않았으니 휴대폰·메일에서 꺼내기)</li>\n<li><b>미국 출국 증빙:</b> %s LA→멕시코시티 아에로멕시코 항공권(12:10) + %s 프라하→인천 귀국편 일정(OZ546)</li>\n<li>첫 숙박 증빙: 동부 패키지 투어 예약확인서(호텔 포함 5박) + 투어 종료 후 뉴욕 호텔 예약</li>\n<li>아래 <b>영문 여행 일정표</b> 출력본</li>\n<li>여행자보험 영문 가입증명서, 신용카드·체크카드, 잔액을 보여줄 수 있는 은행 앱(필요시 영문 잔고증명서)</li>\n<li>본국 연결 증빙: 행정사 자격증·사무소 사업자등록증(영문 번역본 권장)</li>\n<li>상비약은 원래 포장 + 영문 처방전(고산병약 등)</li></ul></details>'%(kd(us_exit),kd(dep_prg))
a=s.index('<details><summary>4. 미국 입국심사'); b=s.index('<details><summary>5. 영문 여행 일정표')
b4=s[a:b].rstrip('\r\n')
usd='%s %d'%(MON[us_exit.month],us_exit.day)
def qa(q,en_,ko):
    global b4
    pat=re.compile(r'(<tr><td class="en">'+re.escape(q)+r'</td>)<td class="en">.*?</td><td>.*?</td></tr>',re.S)
    assert pat.search(b4),q
    b4=pat.sub(lambda m:m.group(1)+'<td class="en">'+en_+'</td><td>'+ko+'</td></tr>',b4,count=1)
qa('How long will you stay?','About three weeks, including two days in Canada. We arrive today, April 17, and leave for Mexico on %s.'%usd,'체류 기간은? → 캐나다 2일 포함 약 3주, 4/17 도착, %s 멕시코로 출국'%kd(us_exit))
qa('Where will you stay?','The first five nights are with a guided group tour, hotels included. After that, a hotel in Manhattan. Here is my reservation. <span style="color:#999">(호텔명: ________)</span>','숙소는? → 첫 5박은 패키지 투어(호텔 포함), 이후 맨해튼 호텔, 예약서 제시')
qa('Do you have a return or onward ticket?','Yes. We fly from Los Angeles to Mexico City on %s, travel through Latin America and Europe, and fly home to Seoul from Prague on %s.'%(usd,en(dep_prg)),'돌아가거나 나갈 항공권은? → %s LA→멕시코시티, %s 프라하 출발 서울 귀국'%(kd(us_exit),kd(dep_prg)))
qa('Where else will you travel?','We fly from New York to Vancouver, Canada on April 27 for two days, then take a train or bus to Seattle. After the U.S., we go to Mexico, Costa Rica, Ecuador, South America, France, the U.K. and Czechia.','다른 여행지는? → 4/27 뉴욕→밴쿠버 항공 2일 후 시애틀로 기차·버스, 이후 멕시코·코스타리카·에콰도르·남미·프랑스·영국·체코')
rows5=''
for sp in stops:
    if sp['cc'] in ('US','CA') and arr[sp['key']]<us_exit:
        a_=arr[sp['key']]; e_=a_+datetime.timedelta(days=sp['nights'])
        label=sp['en']+(' (flight from Newark)' if sp['key']=='vancouver' else '')
        rows5+='<tr><td class="en">%s – %s</td><td class="en">%s</td><td class="en">%d</td><td class="en">&nbsp;</td></tr>'%(en(a_),(str(e_.day) if a_.month==e_.month else en(e_)),label,sp['nights'])
rows5+='<tr><td class="en">%s</td><td class="en">Depart U.S.: Los Angeles → Mexico City (Aeroméxico, 12:10)</td><td class="en">—</td><td class="en">&nbsp;</td></tr>'%en(us_exit)
rows5+='<tr><td class="en">After the U.S.</td><td class="en">Mexico, Costa Rica, Ecuador (Galápagos), Peru, Bolivia, Chile, Argentina, Brazil, France, the U.K., Czechia — fly home to Seoul from Prague on %s</td><td class="en">—</td><td class="en">&nbsp;</td></tr>'%en(dep_prg)
b5='<details><summary>5. 영문 여행 일정표 (인쇄해서 제시)</summary><div class="vtable-wrap"><table class="vtable"><thead><tr><th>Dates (2027)</th><th>City</th><th>Nights</th><th>Hotel / Address (예약 후 기재)</th></tr></thead><tbody>'+rows5+'</tbody></table></div></details>'
b6='<details><summary>6. 입국 절차 흐름과 주의사항</summary><ul>\n<li><b>도착(JFK 제1터미널, 4/17 10:00):</b> 입국심사장(Passport Control) → 전자 입국 절차(안내에 따라 키오스크/얼굴 촬영) → CBP 심사관 질문, 지문·사진 → 수하물 → 세관 신고(대부분 \'신고할 물품 없음\') → 출구. 사람이 몰리면 1~2시간 걸릴 수 있어 투어 집결 시간에 여유를 두세요.</li>\n<li>대답은 <b>짧고 사실대로</b>. 못 알아들으면 다시 말해 달라고 하고, 통역(한국어)도 요청할 수 있습니다.</li>\n<li>여권·ESTA·일정표·숙소 예약은 가방 맨 위에 두고 바로 꺼내기. 심사관은 휴대폰·짐을 확인할 수 있습니다.</li>\n<li><b>농축산물(과일·육류 등)과 1만 달러 초과 현금은 반드시 신고</b> — 미신고 시 벌금·압수 대상입니다.</li>\n<li>ESTA 체류 한도는 90일. 이번 미국 체류는 합계 약 %d일(%s)이라 여유가 있습니다.</li>\n<li>4/27 뉴어크→밴쿠버 때는 <b>eTA 승인서</b>를 지참하고, 4/29 밴쿠버→시애틀은 <b>육로로 미국에 재입국</b>하므로 국경 심사에서 같은 서류를 제시합니다. 귀국 경로는 프라하 경유가 아니라 직항(OZ546)이라 미국 경유는 없습니다.</li>\n<li>%s LA→멕시코시티 항공권이 미국 출국 증빙입니다. LA 패키지가 5/7 아침에 끝나면 12:10 출발에 촉박하니 업체에 먼저 확인하세요.</li></ul></details>'%(usdays,rng(usx),kd(us_exit))
a7=s.index('<details><summary>7. 입국 때 쓰는'); e7=s.index('<div class="src">',a7)
b7=s[a7:e7].rstrip('\r\n')
src='<div class="src">확인일 2026-10-05 · 각국 규정은 수시로 바뀌므로 <b>출발 3개월 전과 1주 전에 반드시 재확인</b>하세요.<br>\n· 외교부 해외안전여행 <a href="https://www.0404.go.kr" target="_blank" rel="noopener">0404.go.kr</a> (국가별 입국요건) · 미국 ESTA <a href="https://esta.cbp.dhs.gov" target="_blank" rel="noopener">esta.cbp.dhs.gov</a> ·\n<a href="https://www.cbp.gov/travel/international-visitors/visa-waiver-program/visa-waiver-program-improvement-and-terrorist-travel-prevention-act-faq" target="_blank" rel="noopener">CBP 비자면제 FAQ</a> ·\n<a href="https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/eta.html" target="_blank" rel="noopener">캐나다 eTA 안내</a> ·\n<a href="https://bo.mofa.go.kr/bo-ko/brd/m_27335/view.do?seq=1347159&amp;page=1" target="_blank" rel="noopener">주볼리비아 대사관 무사증 안내</a> ·\n<a href="https://travel-europe.europa.eu/etias_en" target="_blank" rel="noopener">EU ETIAS</a> ·\n<a href="https://www.gov.uk/eta" target="_blank" rel="noopener">영국 ETA</a></div>'
A0=s.index('<section id="appendix"'); head_end=s.index('<details open><summary>1.',A0); A1=s.index('</section>',A0)
newapp=s[A0:head_end]+b1+'\n    '+b2+'\n    '+b3+'\n    '+b4+'\n    '+b5+'\n    '+b6+'\n    '+b7+'\n    '+src+'\n  </div>\n'
s=s[:A0]+newapp+s[A1:]

# 기타 텍스트 (DATA 줄 밖에서만 치환 — 음성 대본 보호)
def outside(f):
    global s
    ds=s.index('const DATA = '); de=s.index('\n',ds)
    s=f(s[:ds])+s[ds:de]+f(s[de:])
def _t(x):
    x=re.sub(r'FREE &amp; EASY · \d+ DAYS','FREE &amp; EASY · %d DAYS'%ndays,x)
    x=re.sub(r'(?<![\d,])\d+일의 발자국','%d일의 발자국'%ndays,x)
    x=re.sub(r'(<p class="info">)[^<]*(</p>)',lambda m:m.group(1)+'2027.4.17 뉴욕 입국 ~ %s 인천 도착 (%d일·%d박) · 동부·LA·남미 패키지 + 기차·항공(렌터카 없음)'%(md(last),ndays,nights)+m.group(2),x)
    x=x.replace('총 75일','총 %d일'%ndays)
    x=re.sub(r'(?<![\d,])\d+일의 하루하루','%d일의 하루하루'%ndays,x)
    x=re.sub(r'\d+박 · 목표 총 1,300만원 · 안전·교통 우선\(중급 호텔\+한인민박\)','%d박 중 개별 33박 · 패키지 포함 34박 · 안전·교통 우선'%nights,x)
    x=re.sub(r'(?<![\d,])\d+일의 자유여행','%d일의 자유여행'%ndays,x)
    x=re.sub(r"msg='🏠 \d+일의 대장정","msg='🏠 %d일의 대장정"%ndays,x)
    x=x.replace('🚗 렌터카·캠핑카 상세 비교','🚆 이동 수단 상세 · 렌터카 없음').replace('🚗 렌터카·캠핑카','🚆 이동 수단 상세')
    x=x.replace('북미 렌터카·캠핑카 + 중남미 버스·기차·국내선','패키지 + 기차·항공 (렌터카 없음)')
    return x
outside(_t)
js_old="area.innerHTML = block(ag.na) + block(ag.latam);"
js_new="area.innerHTML = (ag.report?block(ag.report):'') + block(ag.na) + block(ag.latam);"
if js_old in s: s=s.replace(js_old,js_new)
s=s.replace('\r\n','\n').replace('\n','\r\n')
open(IDX,'w',encoding='utf-8',newline='').write(s)

# ---------- 지도 ----------
MP=os.path.join(ROOT,'maps','map_data.js')
mp=open(MP,encoding='utf-8').read()
S0=json.loads(re.search(r'var S = (\{.*?\});\n',mp,flags=re.S).group(1))
S={'icn_out':S0['icn_out']}
for sp in stops:
    old=S0.get(sp['key'],{})
    kind=sp.get('kind',old.get('kind','city'))
    ent={"name":'%s · %d박'%(sp['city'],sp['nights']),"zh":sp['en'],"kind":kind,"coord":sp['coord'],"stay":'%d박'%sp['nights'],"mode":sp['mode']}
    S[sp['key']]=ent
S['icn_in']=S0['icn_in']; S['icn_in']['mode']={"type":"flight","text":"프라하→인천 OZ546 18:50 출발(6/24) · 인천 6/25 13:10 도착","curve":0.12}
def dayrng(keys):
    ds=[x for x in it if x['city'] in [ [y for y in stops if y['key']==k][0]['city'] for k in keys]]
    return ds[0]['day_num'],ds[-1]['day_num']
allk=[sp['key'] for sp in stops]
def keyrng(k0,k1):
    i0=allk.index(k0); i1=allk.index(k1)
    a_=(arr[k0]-datetime.date.fromisoformat(st['start'])).days+1
    e_=arr[k1]+datetime.timedelta(days=stops[i1]['nights'])
    return a_,(e_-datetime.date.fromisoformat(st['start'])).days
lst=lambda ks:'['+','.join('S.'+k for k in ks)+']'
full=['icn_out']+allk+['icn_in']
c_na=['icn_out']+allk[:allk.index('pkg_la')+1]
c_ca=allk[allk.index('mexico_city'):allk.index('galapagos')+1]
c_sa=allk[allk.index('lima'):allk.index('rio_pkg')+1]
c_eu=allk[allk.index('rio'):]+['icn_in']
n1=keyrng('tour','pkg_la'); n2=keyrng('mexico_city','galapagos'); n3=keyrng('lima','rio_pkg'); n4=(keyrng('rio','rio')[0],ndays)
js='var S = '+json.dumps(S,ensure_ascii=False)+';\n\nvar OV = {\n  base: \'osm\',\n  center: [20, -50],\n  zoom: 3,\n  courses: [\n    { label: \'전체 여정\', sub: \'%d일 · 뉴욕→런던·프라하→인천\',\n      stops: %s },\n    { label: \'북미 구간\', sub: \'Day%d~%d · 동부 투어→LA 패키지\',\n      stops: %s },\n    { label: \'중미·갈라파고스\', sub: \'Day%d~%d · 멕시코→갈라파고스\',\n      stops: %s },\n    { label: \'남미 패키지\', sub: \'Day%d~%d · 리마→리우\',\n      stops: %s },\n    { label: \'리우·유럽·귀국\', sub: \'Day%d~%d · 리우→파리→런던→프라하→인천\',\n      stops: %s }\n  ]\n};\nvar TM = new TripMap(OV);\n'%(ndays,lst(full),n1[0],n1[1],lst(c_na),n2[0],n2[1],lst(c_ca),n3[0],n3[1],lst(c_sa),n4[0],n4[1],lst(c_eu))
open(MP,'w',encoding='utf-8').write(js)
OVP=os.path.join(ROOT,'maps','overview.html')
o=open(OVP,encoding='utf-8').read()
o=re.sub(r'2027\.4\.17~7\.26\(약 101일\)','2027.4.17~%s(%d일)'%(md(last),ndays),o)
o=re.sub(r'<h1>전체 여정[^<]*</h1>','<h1>전체 여정 · %d일 (2027.4.17 ~ %s)</h1>'%(ndays,md(last)),o)
o=re.sub(r'(<div class="head">\s*<h1>.*?</h1>\s*)<p>.*?</p>',lambda mm:mm.group(1)+'<p>인천 → 뉴욕 입국 → 동부 패키지 투어 → 뉴욕·보스턴 → 밴쿠버·시애틀 → LA 출발 패키지 → 멕시코·코스타리카·에콰도르(갈라파고스) → 남미 25일 패키지(리마~리우) → 리우 → 파리·런던·프라하 → 인천 도착. 아래 <b>「여정 재생」</b> 버튼을 누르면 이동수단별 색으로 경로가 순서대로 그려집니다. 일정이 바뀌면 이 지도는 _edit/update_plan.py로 다시 만듭니다.</p>',o,flags=re.S)
note='<div class="note">\n  <b>구간 총정리</b> · 🇺🇸🇨🇦 <b>북미(Day1~%d)</b>: 동부 투어(4/17~22)→뉴욕→보스턴→뉴욕→밴쿠버(항공)→시애틀→열차→LA→LA 출발 패키지 · 🇲🇽🇨🇷🇪🇨 <b>중미·갈라파고스</b>: 멕시코시티→칸쿤→산호세→키토→갈라파고스 · 🇵🇪🇧🇴🇨🇱🇦🇷🇧🇷 <b>남미 25일 패키지(5/21~6/14)</b>: 리마→쿠스코→마추픽추→푸노→라파스→우유니→아타카마→엘칼라파테→부에노스아이레스→이구아수→리우 → 리우 개별 3박 → 🇫🇷🇬🇧🇨🇿 파리 1박→런던 4박→프라하 1박 → 인천(Day%d). 항공: ICN→뉴욕·프라하→ICN은 마일리지, 나머지는 현금.\n</div>'%(n1[1],ndays)
o=re.sub(r'<div class="note">.*?</div>',lambda mm:note,o,flags=re.S)
open(OVP,'w',encoding='utf-8').write(o)

# ---------- README ----------
rd='''# 🌎 백상진·박현교 부부 북미·중남미 자유여행 (2027.4.17~%s, %d일·%d박)

- **여행**: 뉴욕 입국 → 동부 패키지 투어 → 뉴욕·보스턴 → 밴쿠버·시애틀 → LA 패키지 → 멕시코~갈라파고스 → 남미 25일 패키지(리마~리우) → 리우 → 파리·런던·프라하 → 인천
- **Live**: https://sjbaik0431.github.io/na-sa-trip/
- **숙박 보고서**: %s
- **음성 해설(TTS)**: 이전 일정 기준으로 만든 것이라 새 일정과 내용이 다릅니다. 파일은 수정하지 않았고, 재녹음은 일정이 확정된 뒤에 합니다.

## 일정이 바뀔 때 (대시보드만 갱신)
1. `_edit/stops.json` 에서 도시 순서·박 수·이동수단을 고칩니다.
2. 숙박·예산·기후·체크리스트 문구는 `_edit/sections.json` 에서 고칩니다.
3. `cd _edit && python3 update_plan.py` 실행 → index.html·maps/map_data.js·overview.html 이 다시 만들어집니다(음성 파일은 건드리지 않음).
4. 실행 전 `_edit/backup/` 에 index.html 사본이 자동 저장됩니다.
'''%(md(last),ndays,nights,URL)
open(os.path.join(ROOT,'README.md'),'w',encoding='utf-8').write(rd)
print('OK',ndays,nights,first,last,'US exit',us_exit,'budget',tl,th)
