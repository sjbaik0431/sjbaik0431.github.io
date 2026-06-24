const INDUSTRY_DATA = {
  marketStats: {
    activeRentals: 23,
    totalEquipment: 847,
    utilizationRate: 68.4,
    monthlyRevenue: 48750000,
    yoyGrowth: 12.3,
    newCustomersThisMonth: 4,
    avgRentalDays: 3.2,
    returnRate: 78.5
  },
  monthlyRevenue: [
    {month:'1월',revenue:32400000,target:30000000},
    {month:'2월',revenue:28900000,target:30000000},
    {month:'3월',revenue:51200000,target:45000000},
    {month:'4월',revenue:58700000,target:50000000},
    {month:'5월',revenue:44300000,target:42000000},
    {month:'6월',revenue:52100000,target:48000000},
    {month:'7월',revenue:61500000,target:55000000},
    {month:'8월',revenue:55800000,target:52000000},
    {month:'9월',revenue:47200000,target:46000000},
    {month:'10월',revenue:63400000,target:58000000},
    {month:'11월',revenue:71200000,target:65000000},
    {month:'12월',revenue:48750000,target:50000000}
  ],
  utilizationByCategory: [
    {id:'cam',name:'카메라/렌즈',utilization:72,rentedCount:18,totalCount:25,revenue:14200000},
    {id:'light',name:'조명/스탠드',utilization:65,rentedCount:28,totalCount:43,revenue:8900000},
    {id:'audio',name:'음향/마이크',utilization:81,rentedCount:31,totalCount:38,revenue:7600000},
    {id:'broadcast',name:'중계/스위처',utilization:58,rentedCount:9,totalCount:15,revenue:9800000},
    {id:'wireless',name:'무선/트랜스미터',utilization:74,rentedCount:22,totalCount:30,revenue:5400000},
    {id:'display',name:'모니터/디스플레이',utilization:61,rentedCount:14,totalCount:23,revenue:7200000},
    {id:'support',name:'지지대/드론',utilization:55,rentedCount:12,totalCount:22,revenue:5650000}
  ],
  sampleCustomers: [
    {id:'C001',name:'MBC 콘텐츠사업부',type:'방송국',contact:'김OO PD',phone:'02-789-1234',totalRentals:47,lastRental:'2026-06-20',totalSpend:128500000,grade:'VIP',notes:'드라마 제작팀 고정 거래처'},
    {id:'C002',name:'스튜디오 드래곤',type:'제작사',contact:'이OO 장비감독',phone:'02-3456-7890',totalRentals:38,lastRental:'2026-06-22',totalSpend:98700000,grade:'VIP',notes:'연간 계약 고객'},
    {id:'C003',name:'KBS 스포츠국',type:'방송국',contact:'박OO 차장',phone:'02-781-5678',totalRentals:29,lastRental:'2026-06-15',totalSpend:76400000,grade:'Gold',notes:'스포츠 중계 장비 위주'},
    {id:'C004',name:'대도서관 채널',type:'유튜버',contact:'나OO',phone:'010-2345-6789',totalRentals:22,lastRental:'2026-06-18',totalSpend:32100000,grade:'Silver',notes:'유튜브 콘텐츠 제작'},
    {id:'C005',name:'서울시 홍보담당관',type:'공공기관',contact:'최OO 주무관',phone:'02-2133-2345',totalRentals:15,lastRental:'2026-05-30',totalSpend:41200000,grade:'Gold',notes:'연 2회 대형 행사 진행'},
    {id:'C006',name:'tvN 예능제작팀',type:'방송국',contact:'윤OO 조연출',phone:'02-2670-4567',totalRentals:31,lastRental:'2026-06-23',totalSpend:85600000,grade:'VIP',notes:'예능 프로그램 정기 이용'},
    {id:'C007',name:'매드스퀘어 영상',type:'제작사',contact:'강OO 촬영감독',phone:'02-776-8901',totalRentals:19,lastRental:'2026-06-10',totalSpend:54300000,grade:'Gold',notes:'광고 영상 전문'},
    {id:'C008',name:'빠니보틀 유튜브',type:'유튜버',contact:'유OO',phone:'010-9876-5432',totalRentals:28,lastRental:'2026-06-21',totalSpend:38900000,grade:'Gold',notes:'여행/콘텐츠 전문 유튜버'},
    {id:'C009',name:'문화체육관광부',type:'공공기관',contact:'정OO 사무관',phone:'044-203-2456',totalRentals:8,lastRental:'2026-04-15',totalSpend:28700000,grade:'Silver',notes:'문화행사 장비 임차'},
    {id:'C010',name:'제이에스픽처스',type:'제작사',contact:'조OO 프로듀서',phone:'02-3453-6789',totalRentals:14,lastRental:'2026-06-19',totalSpend:47800000,grade:'Gold',notes:'영화 및 OTT 드라마 제작'}
  ],
  clientTypeDistribution: [
    {type:'방송국/OTT',percentage:38,color:'#1f6feb'},
    {type:'영상 제작사',percentage:29,color:'#3fb950'},
    {type:'유튜버/크리에이터',percentage:18,color:'#d29922'},
    {type:'공공기관',percentage:15,color:'#bc8cff'}
  ],
  topEquipment: [
    {rank:1,name:'Sennheiser EW 6000 무선 시스템',category:'음향/마이크',rentCount:34,revenue:3230000},
    {rank:2,name:'Sony A7S III',category:'카메라/렌즈',rentCount:29,revenue:2755000},
    {rank:3,name:'Blackmagic ATEM Mini Extreme ISO',category:'중계/스위처',rentCount:27,revenue:1755000},
    {rank:4,name:'SmallHD CINE 7 터치스크린',category:'모니터',rentCount:26,revenue:1430000},
    {rank:5,name:'DJI RS 4 Pro 3축 짐벌',category:'지지대/드론',rentCount:24,revenue:1080000},
    {rank:6,name:'ARRI SkyPanel S360-C',category:'조명/스탠드',rentCount:22,revenue:6160000},
    {rank:7,name:'Hollyland Mars 4K LT 무선',category:'무선/트랜스미터',rentCount:21,revenue:1365000},
    {rank:8,name:'Aputure LS 600d Pro',category:'조명/스탠드',rentCount:20,revenue:2400000},
    {rank:9,name:'Sound Devices 888 필드 믹서',category:'음향/마이크',rentCount:18,revenue:3240000},
    {rank:10,name:'Teradek Bolt 6 XT 4K 무선영상',category:'무선/트랜스미터',rentCount:17,revenue:3060000}
  ],
  recentRentals: [
    {id:'R2026001',equipId:'CAM-001',equipName:'ARRI ALEXA 35',customer:'스튜디오 드래곤',startDate:'2026-06-20',endDate:'2026-06-25',days:5,amount:4250000,status:'rented'},
    {id:'R2026002',equipId:'AUDIO-008',equipName:'Sound Devices 888',customer:'MBC 콘텐츠사업부',startDate:'2026-06-22',endDate:'2026-06-24',days:2,amount:360000,status:'rented'},
    {id:'R2026003',equipId:'BC-001',equipName:'Blackmagic ATEM 4 M/E',customer:'KBS 스포츠국',startDate:'2026-06-21',endDate:'2026-06-23',days:2,amount:560000,status:'rented'},
    {id:'R2026004',equipId:'DISP-006',equipName:'ROE LED 월 5x3m',customer:'서울시 홍보담당관',startDate:'2026-06-18',endDate:'2026-06-20',days:2,amount:2400000,status:'returned'},
    {id:'R2026005',equipId:'SUP-009',equipName:'DJI Inspire 3 드론',customer:'제이에스픽처스',startDate:'2026-06-23',endDate:'2026-06-23',days:1,amount:850000,status:'rented'}
  ],
  franchisePartners: [
    {id:'P001',name:'부산 씨네렌탈',region:'부산/경남',city:'부산',equipmentCount:124,monthlyRevenue:12400000,joinDate:'2024-03',status:'active',contact:'051-234-5678'},
    {id:'P002',name:'대구 방송장비',region:'대구/경북',city:'대구',equipmentCount:98,monthlyRevenue:9800000,joinDate:'2024-06',status:'active',contact:'053-345-6789'},
    {id:'P003',name:'광주 미디어렌탈',region:'광주/전남',city:'광주',equipmentCount:87,monthlyRevenue:8700000,joinDate:'2024-09',status:'active',contact:'062-456-7890'},
    {id:'P004',name:'인천 영상장비',region:'인천/경기서부',city:'인천',equipmentCount:142,monthlyRevenue:14200000,joinDate:'2024-01',status:'active',contact:'032-567-8901'},
    {id:'P005',name:'제주 브로드캐스트',region:'제주',city:'제주',equipmentCount:65,monthlyRevenue:6500000,joinDate:'2025-03',status:'growth',contact:'064-678-9012'}
  ],
  aiInsights: [
    {icon:'trending-up',title:'드론 수요 급증 예측',description:'7-8월 여름 행사 시즌 드론 예약이 전월 대비 43% 증가 추세. 제주 파트너사 드론 재고 보강을 권장합니다.',priority:'high',type:'opportunity'},
    {icon:'alert-triangle',title:'음향 장비 집중 점검 필요',description:'AUDIO-012 Yamaha DM7가 3건 연속 예약 지연으로 고객 불만 2건 발생. 정기 점검 및 대체 장비 확보를 권장합니다.',priority:'urgent',type:'warning'},
    {icon:'users',title:'유튜버 고객군 성장 기회',description:'유튜버/크리에이터 고객 비중이 전년 11% → 18%로 성장. 1-3일 단기 패키지 상품 출시를 권장합니다.',priority:'medium',type:'growth'},
    {icon:'dollar-sign',title:'11월 연말 시즌 사전 준비',description:'작년 11월 매출 71.2M원으로 연중 최고. 현재 예약률 기준 60% 이미 채워짐. 방송국 VIP 고객 사전 우선 배정을 권장합니다.',priority:'medium',type:'planning'},
    {icon:'map-pin',title:'경기도 북부 파트너 공백',description:'의정부/고양/파주 권역 방송·영상 수요 대비 파트너사 없음. 해당 지역 파트너 모집 시 예상 월 1,200만원 추가 매출.',priority:'low',type:'expansion'}
  ]
};