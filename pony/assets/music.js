// 5번 AI — 「포니에게 가는 길」 오리지널 스코어 (Web Audio API 실시간 합성)
// ---------------------------------------------------------------------------
// 조성  : D major (CH4에서 B minor로 기울었다가, CH6에서 E major로 전조)
// 템포  : 66 BPM · 4/4 · 16분음표 그리드 (1마디 = 3.636초)
// 구조  : 50마디 / 약 181.8초 (6개 챕터: 8-8-8-8-8-10마디)
// 음원  : 100% 실시간 합성. 외부 오디오/임펄스 파일 없음. 저작권 완전 자유.
// 레이어: musicbox(FM+가산합성) / pad(디튠 6성) / heartbeat(서브사인) / shimmer(고음벨)
// 공간계: ConvolverNode + 코드로 생성한 노이즈 임펄스 응답
// ---------------------------------------------------------------------------

var PonyScore = (function () {
  'use strict';

  /* ===================== 기본 상수 ===================== */
  var BPM = 66;
  var STEPS_PER_BAR = 16;                       // 16분음표 그리드
  var STEP_DUR = 60 / BPM / 4;                  // 0.2273s
  var BAR_DUR = STEP_DUR * STEPS_PER_BAR;       // 3.6364s
  var LOOKAHEAD_MS = 25;                        // 스케줄러 타이머 간격
  var SCHEDULE_AHEAD = 0.12;                    // 미리 예약할 시간(초)
  var XFADE = 0.75;                             // setTargetAtTime 시상수(≈2.2초 크로스페이드)

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  /* ===================== 화성 사전 ===================== */
  // 패드 4성부 보이싱 (MIDI). [0]번은 베이스/심장박동 루트로도 쓰인다.
  var CHORD = {
    D:      [50, 57, 62, 66],   // D  : D3 A3 D4 F#4
    Dsus2:  [50, 57, 64, 69],
    DoF:    [42, 57, 62, 66],   // D/F#
    Bm:     [47, 54, 62, 66],   // Bm : B2 F#3 D4 F#4
    Bm7:    [47, 54, 57, 66],
    G:      [43, 50, 59, 62],   // G  : G2 D3 B3 D4
    Gmaj7:  [43, 50, 59, 66],
    A:      [45, 52, 61, 64],   // A  : A2 E3 C#4 E4
    A7sus4: [45, 52, 59, 64],
    Em:     [40, 47, 55, 64],
    Em7:    [40, 50, 59, 64],
    Fsm:    [42, 49, 57, 66],   // F#m
    E:      [40, 52, 59, 68],   // E  : E2 E3 B3 G#4
    BoDs:   [39, 54, 59, 66],   // B/D#
    Csm:    [37, 52, 56, 68],   // C#m
    B:      [47, 54, 63, 66],   // B  : B2 F#3 D#4 F#4
    Amaj:   [45, 52, 61, 64]
  };

  /* ===================== 6개 챕터 악보 ===================== */
  // melody: 마디별 [MIDI(null=쉼표), 길이(16분음표 개수)] 배열. 각 마디 합계 = 16.
  var CHAPTERS = [
    { /* ---------- CH1 창가에서 : 오르골 단독. 조심스럽게. D major ---------- */
      id: 1, title: '창가에서',
      chords: ['D', 'Bm', 'G', 'A', 'D', 'G', 'A', 'D'],
      melody: [
        [[69, 4], [74, 4], [78, 8]],
        [[76, 4], [74, 4], [71, 8]],
        [[78, 4], [76, 4], [74, 4], [69, 4]],
        [[71, 8], [69, 8]],
        [[69, 4], [74, 4], [78, 4], [81, 4]],
        [[79, 8], [78, 8]],
        [[76, 4], [78, 4], [79, 4], [76, 4]],
        [[74, 16]]
      ],
      layers: { box: 1.00, pad: 0.00, bass: 0.22, shim: 0.00 },
      boxDecay: 2.6, boxVel: 0.30, hb: 'half', shimmerP: 0.00, bassFrom: 4
    },
    { /* ---------- CH2 반짝이는 것들 : shimmer 진입. 밝고 잘게 ---------- */
      id: 2, title: '반짝이는 것들',
      chords: ['D', 'A', 'Bm', 'G', 'D', 'G', 'A', 'D'],
      melody: [
        [[81, 2], [86, 2], [85, 2], [83, 2], [81, 4], [78, 4]],
        [[83, 2], [81, 2], [78, 2], [76, 2], [74, 8]],
        [[78, 2], [81, 2], [83, 2], [86, 2], [88, 4], [86, 4]],
        [[85, 4], [83, 4], [81, 8]],
        [[81, 2], [86, 2], [85, 2], [83, 2], [81, 4], [78, 4]],
        [[79, 2], [83, 2], [86, 2], [83, 2], [79, 8]],
        [[78, 2], [81, 2], [85, 2], [88, 2], [90, 8]],
        [[86, 16]]
      ],
      layers: { box: 0.95, pad: 0.10, bass: 0.40, shim: 0.55 },
      boxDecay: 2.0, boxVel: 0.26, hb: 'half', shimmerP: 0.26, bassFrom: 0
    },
    { /* ---------- CH3 포니라는 이름 : 패드 진입, 화성이 넓어짐 ---------- */
      id: 3, title: '포니라는 이름',
      chords: ['G', 'DoF', 'Em7', 'A7sus4', 'G', 'Bm7', 'A', 'D'],
      melody: [
        [[79, 4], [83, 4], [86, 8]],
        [[85, 4], [83, 4], [78, 8]],
        [[76, 4], [79, 4], [83, 4], [79, 4]],
        [[81, 8], [76, 8]],
        [[79, 4], [86, 4], [83, 8]],
        [[83, 2], [81, 2], [78, 4], [74, 8]],
        [[76, 4], [78, 4], [81, 4], [83, 4]],
        [[86, 16]]
      ],
      layers: { box: 0.90, pad: 0.62, bass: 0.48, shim: 0.34 },
      boxDecay: 2.8, boxVel: 0.28, hb: 'half', shimmerP: 0.16, bassFrom: 0
    },
    { /* ---------- CH4 아직 볼 수 없는 얼굴 : 여백. 5~6마디는 심장박동만 ---------- */
      id: 4, title: '아직 볼 수 없는 얼굴',
      chords: ['Bm', 'Gmaj7', 'Em', 'Bm', 'Bm', 'Bm', 'Fsm', 'A'],
      melody: [
        [[83, 4], [78, 4], [74, 8]],
        [[79, 4], [78, 4], [76, 8]],
        [[76, 4], [74, 4], [71, 8]],
        [[69, 8], [71, 8]],
        [[null, 16]],
        [[null, 16]],
        [[73, 4], [76, 4], [78, 8]],
        [[74, 8], [69, 8]]
      ],
      layers: { box: 0.72, pad: 0.30, bass: 0.62, shim: 0.05 },
      boxDecay: 3.4, boxVel: 0.24, hb: 'full', shimmerP: 0.03, bassFrom: 0,
      // 5~6마디(index 4,5): 오르골·패드·윤슬을 거의 지우고 심장박동만 남긴다.
      hollowBars: [4, 5]
    },
    { /* ---------- CH5 작은 신발 한 짝 : 따뜻하게 회복. 주제 변주 ---------- */
      id: 5, title: '작은 신발 한 짝',
      chords: ['D', 'Gmaj7', 'Bm7', 'A', 'D', 'G', 'A', 'D'],
      melody: [
        [[74, 4], [78, 4], [81, 8]],
        [[79, 4], [78, 4], [76, 8]],
        [[78, 2], [81, 2], [83, 4], [81, 8]],
        [[76, 4], [74, 4], [69, 8]],
        [[69, 4], [74, 4], [78, 4], [81, 4]],
        [[83, 8], [81, 8]],
        [[79, 4], [78, 4], [76, 4], [74, 4]],
        [[78, 16]]
      ],
      layers: { box: 1.00, pad: 0.52, bass: 0.50, shim: 0.30 },
      boxDecay: 3.0, boxVel: 0.30, hb: 'half', shimmerP: 0.14, bassFrom: 0
    },
    { /* ---------- CH6 우리가 함께 올려다본 것 : E major 전조. 전 레이어 ---------- */
      id: 6, title: '우리가 함께 올려다본 것',
      chords: ['E', 'BoDs', 'Csm', 'Amaj', 'E', 'Amaj', 'B', 'E', 'E', 'E'],
      melody: [
        [[71, 4], [76, 4], [80, 8]],
        [[78, 4], [76, 4], [73, 8]],
        [[80, 4], [78, 4], [76, 4], [71, 4]],
        [[73, 8], [71, 8]],
        [[71, 4], [76, 4], [80, 4], [83, 4]],
        [[81, 8], [80, 8]],
        [[78, 4], [80, 4], [81, 4], [78, 4]],
        [[76, 16]],
        [[88, 8], [83, 8]],          // 마지막 8초: 오르골 한 음씩만
        [[76, 16]]
      ],
      layers: { box: 1.00, pad: 0.70, bass: 0.55, shim: 0.60 },
      boxDecay: 3.2, boxVel: 0.32, hb: 'half', shimmerP: 0.22, bassFrom: 0,
      tailFromBar: 8, tailSeconds: 8.5   // 8번 마디부터 아주 길게 사라진다
    }
  ];

  /* ===================== 상태 ===================== */
  var ctx = null;
  var built = false;
  var playing = false;
  var timer = null;

  var master, tail, comp, mixBus, convolver, reverbReturn;
  var bus = {};        // box / pad / bass / shim 게인 노드
  var send = {};       // 각 레이어의 리버브 센드
  var padVoices = [];  // 상시 구동 패드 오실레이터 (노드 증식 방지)
  var padTrem, padFilter, padLfo, padLfoGain, padFiltLfo, padFiltLfoGain;

  var chapterIdx = 0;      // 0-based
  var barInChapter = 0;
  var stepInBar = 0;
  var nextStepTime = 0;
  var barStartTime = 0;
  var barPlan = null;      // 현재 마디의 스텝별 이벤트 계획
  var pendingChapter = -1; // 다음 마디 경계에서 적용될 챕터
  var autoFollow = true;   // setChapter()가 한 번이라도 불리면 false
  var loopEnabled = true;
  var userVolume = 0.85;
  var muted = false;
  var beatListeners = [];
  var eventQueue = [];
  var tailArmed = false;

  /* ===================== 오디오 그래프 ===================== */
  function makeContext() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    return new AC();
  }

  // 노이즈 + 지수 감쇠로 임펄스 응답을 코드로 생성 (외부 파일 없음)
  function makeImpulse(seconds, decay, preDelay) {
    var rate = ctx.sampleRate;
    var len = Math.max(1, Math.floor(rate * seconds));
    var pre = Math.floor(rate * (preDelay || 0));
    var buf = ctx.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var ch = buf.getChannelData(c);
      for (var i = 0; i < len; i++) {
        if (i < pre) { ch[i] = 0; continue; }
        var t = (i - pre) / (len - pre);
        // 초반 밀도를 낮춰 확산되는 홀 느낌을 낸다
        var env = Math.pow(1 - t, decay) * (1 - Math.exp(-t * 45));
        ch[i] = (Math.random() * 2 - 1) * env;
      }
    }
    return buf;
  }

  function makeBus(name, gainValue, sendValue, filterType, filterFreq) {
    var g = ctx.createGain();
    g.gain.value = gainValue;
    var node = g;
    if (filterType) {
      var f = ctx.createBiquadFilter();
      f.type = filterType;
      f.frequency.value = filterFreq;
      g.connect(f);
      node = f;
    }
    node.connect(mixBus);
    var s = ctx.createGain();
    s.gain.value = sendValue;
    node.connect(s);
    s.connect(convolver);
    bus[name] = g;
    send[name] = s;
    return g;
  }

  function buildGraph() {
    master = ctx.createGain();
    master.gain.value = 0.0001;

    tail = ctx.createGain();
    tail.gain.value = 1;

    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 12;
    comp.ratio.value = 6;
    comp.attack.value = 0.005;
    comp.release.value = 0.28;

    mixBus = ctx.createGain();
    mixBus.gain.value = 1;

    convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(3.1, 2.4, 0.018);
    reverbReturn = ctx.createGain();
    reverbReturn.gain.value = 0.9;
    convolver.connect(reverbReturn);
    reverbReturn.connect(mixBus);

    mixBus.connect(comp);
    comp.connect(tail);
    tail.connect(master);
    master.connect(ctx.destination);

    makeBus('box',  CHAPTERS[0].layers.box,  0.34, 'lowpass',  7200);
    makeBus('pad',  0,                        0.42, 'lowpass',  2400);
    makeBus('bass', 0,                        0.06, 'lowpass',  150);
    makeBus('shim', 0,                        0.72, 'highpass', 1100);

    buildPad();
    built = true;
  }

  // 패드: 오실레이터를 곡 내내 살려두고 주파수만 글라이드 → 노드 증식 0
  function buildPad() {
    padFilter = ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 1300;
    padFilter.Q.value = 0.6;

    padTrem = ctx.createGain();
    padTrem.gain.value = 0.85;

    padFilter.connect(padTrem);
    padTrem.connect(bus.pad);

    // 아주 느린 진폭 LFO
    padLfo = ctx.createOscillator();
    padLfo.type = 'sine';
    padLfo.frequency.value = 0.062;
    padLfoGain = ctx.createGain();
    padLfoGain.gain.value = 0.15;
    padLfo.connect(padLfoGain);
    padLfoGain.connect(padTrem.gain);
    padLfo.start();

    // 느린 필터 LFO (호흡)
    padFiltLfo = ctx.createOscillator();
    padFiltLfo.type = 'sine';
    padFiltLfo.frequency.value = 0.041;
    padFiltLfoGain = ctx.createGain();
    padFiltLfoGain.gain.value = 520;
    padFiltLfo.connect(padFiltLfoGain);
    padFiltLfoGain.connect(padFilter.frequency);
    padFiltLfo.start();

    var init = CHORD.D;
    for (var i = 0; i < 4; i++) {
      var vg = ctx.createGain();
      vg.gain.value = (i === 0 ? 0.16 : 0.13);
      vg.connect(padFilter);
      var pair = [];
      for (var j = 0; j < 2; j++) {
        var o = ctx.createOscillator();
        o.type = (j === 0 ? 'sine' : 'triangle');
        o.frequency.value = mtof(init[i]);
        o.detune.value = (j === 0 ? -6 : 7) + (i * 1.5);
        var og = ctx.createGain();
        og.gain.value = (j === 0 ? 0.75 : 0.25);
        o.connect(og);
        og.connect(vg);
        o.start();
        pair.push(o);
      }
      padVoices.push({ oscs: pair, gain: vg });
    }
  }

  function setPadChord(midis, t) {
    for (var i = 0; i < padVoices.length; i++) {
      var f = mtof(midis[i % midis.length]);
      var oscs = padVoices[i].oscs;
      for (var j = 0; j < oscs.length; j++) {
        oscs[j].frequency.setTargetAtTime(f, t, 0.55);
      }
    }
  }

  /* ===================== 음색: 오르골 ===================== */
  // FM(벨 배음) + 가산 부분음. 짧은 어택 · 긴 지수 감쇠.
  function playMusicBox(t, freq, vel, decay) {
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(Math.max(0.002, vel), t + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) {
      pan.pan.value = Math.max(-0.5, Math.min(0.5, (freq - 700) / 2600));
      out.connect(pan);
      pan.connect(bus.box);
    } else {
      out.connect(bus.box);
    }

    var carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(freq, t);
    carrier.connect(out);

    // 종 같은 배음을 만드는 비정수배 모듈레이터
    var mod = ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.setValueAtTime(freq * 3.02, t);
    var modGain = ctx.createGain();
    modGain.gain.setValueAtTime(freq * 5.2, t);
    modGain.gain.exponentialRampToValueAtTime(freq * 0.04, t + 0.26);
    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    // 가산 부분음 (오르골 특유의 금속 배음)
    var p1 = ctx.createOscillator();
    p1.type = 'sine';
    p1.frequency.setValueAtTime(freq * 2.0, t);
    var p1g = ctx.createGain();
    p1g.gain.setValueAtTime(0.0001, t);
    p1g.gain.exponentialRampToValueAtTime(0.22, t + 0.005);
    p1g.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.5);
    p1.connect(p1g);
    p1g.connect(out);

    var p2 = ctx.createOscillator();
    p2.type = 'sine';
    p2.frequency.setValueAtTime(freq * 5.43, t);
    var p2g = ctx.createGain();
    p2g.gain.setValueAtTime(0.0001, t);
    p2g.gain.exponentialRampToValueAtTime(0.075, t + 0.004);
    p2g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    p2.connect(p2g);
    p2g.connect(out);

    var stopAt = t + decay + 0.06;
    var all = [carrier, mod, p1, p2];
    for (var i = 0; i < all.length; i++) { all[i].start(t); all[i].stop(stopAt); }
    carrier.onended = function () {
      try {
        for (var k = 0; k < all.length; k++) all[k].disconnect();
        modGain.disconnect(); p1g.disconnect(); p2g.disconnect();
        out.disconnect(); if (pan) pan.disconnect();
      } catch (e) { /* noop */ }
    };
  }

  /* ===================== 음색: 심장박동 ===================== */
  function playHeartbeat(t, freq, vel) {
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(Math.max(0.002, vel), t + 0.014);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.40);
    out.connect(bus.bass);

    var o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq * 1.6, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.72, t + 0.13);
    o.connect(out);

    var body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(freq * 2, t);
    var bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, t);
    bg.gain.exponentialRampToValueAtTime(0.10, t + 0.012);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    body.connect(bg);
    bg.connect(out);

    var stopAt = t + 0.46;
    o.start(t); o.stop(stopAt);
    body.start(t); body.stop(stopAt);
    o.onended = function () {
      try { o.disconnect(); body.disconnect(); bg.disconnect(); out.disconnect(); } catch (e) { /* noop */ }
    };
  }

  /* ===================== 음색: 윤슬(shimmer) ===================== */
  function playBell(t, freq, vel) {
    var decay = 0.9 + Math.random() * 0.9;
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(Math.max(0.002, vel), t + 0.004);
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay);

    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) {
      pan.pan.value = Math.random() * 1.4 - 0.7;
      out.connect(pan); pan.connect(bus.shim);
    } else {
      out.connect(bus.shim);
    }

    var c = ctx.createOscillator();
    c.type = 'sine';
    c.frequency.setValueAtTime(freq, t);
    c.connect(out);

    var m = ctx.createOscillator();
    m.type = 'sine';
    m.frequency.setValueAtTime(freq * 5.41, t);
    var mg = ctx.createGain();
    mg.gain.setValueAtTime(freq * 2.4, t);
    mg.gain.exponentialRampToValueAtTime(freq * 0.02, t + 0.13);
    m.connect(mg);
    mg.connect(c.frequency);

    var stopAt = t + decay + 0.05;
    c.start(t); c.stop(stopAt);
    m.start(t); m.stop(stopAt);
    c.onended = function () {
      try { c.disconnect(); m.disconnect(); mg.disconnect(); out.disconnect(); if (pan) pan.disconnect(); } catch (e) { /* noop */ }
    };
  }

  /* ===================== 레이어 크로스페이드 ===================== */
  function applyLayers(L, t, tc) {
    var k = tc || XFADE;
    bus.box.gain.setTargetAtTime(L.box, t, k);
    bus.pad.gain.setTargetAtTime(L.pad, t, k);
    bus.bass.gain.setTargetAtTime(L.bass, t, k);
    bus.shim.gain.setTargetAtTime(L.shim, t, k);
  }

  /* ===================== 마디 계획 수립 ===================== */
  function subBassFreq(rootMidi) {
    var f = mtof(rootMidi);
    while (f > 76) f /= 2;
    while (f < 38) f *= 2;
    return f;
  }

  function planBar(ch, barIdx, t0) {
    var plan = [];
    for (var i = 0; i < STEPS_PER_BAR; i++) plan.push(null);

    var hollow = !!(ch.hollowBars && ch.hollowBars.indexOf(barIdx) >= 0);
    var chord = CHORD[ch.chords[barIdx % ch.chords.length]] || CHORD.D;

    // 패드 화성 이동 (마디 머리에서 부드럽게 글라이드)
    setPadChord(chord, t0);

    // 레이어 게인: hollow 구간 / 마지막 여운 구간 처리
    if (hollow) {
      applyLayers({ box: 0.10, pad: 0.06, bass: 0.78, shim: 0.0 }, t0, 0.55);
    } else if (ch.tailFromBar !== undefined && barIdx >= ch.tailFromBar) {
      applyLayers({ box: 1.0, pad: 0.16, bass: 0.06, shim: 0.10 }, t0, 1.1);
    } else {
      applyLayers(ch.layers, t0);
    }

    // ---- 멜로디(오르골)
    var bars = ch.melody[barIdx % ch.melody.length] || [];
    var step = 0;
    for (var n = 0; n < bars.length; n++) {
      var note = bars[n][0], dur = bars[n][1];
      if (note !== null && step < STEPS_PER_BAR && !hollow) {
        var vel = ch.boxVel * (0.82 + Math.random() * 0.24);
        // 마디 첫 음은 살짝 강하게
        if (step === 0) vel *= 1.12;
        var dec = Math.min(ch.boxDecay, dur * STEP_DUR + 1.9);
        if (!plan[step]) plan[step] = [];
        plan[step].push({ kind: 'box', midi: note, vel: vel, decay: dec });
      }
      step += dur;
    }

    // ---- 심장박동 (둥-둥)
    var hbSteps = (ch.hb === 'full' || hollow) ? [0, 4, 8, 12] : [0, 8];
    var hbFreq = subBassFreq(chord[0]);
    if (barIdx >= (ch.bassFrom || 0)) {
      for (var h = 0; h < hbSteps.length; h++) {
        var s = hbSteps[h];
        if (!plan[s]) plan[s] = [];
        plan[s].push({ kind: 'hb', freq: hbFreq, vel: hollow ? 0.62 : 0.42, lub: true });
        plan[s].push({ kind: 'hb', freq: hbFreq * 0.97, vel: (hollow ? 0.62 : 0.42) * 0.6, offset: 0.19 });
      }
    }

    // ---- 윤슬 (무작위 반짝임, 화음 구성음의 2~3옥타브 위)
    var p = hollow ? 0 : (ch.shimmerP || 0);
    if (ch.tailFromBar !== undefined && barIdx >= ch.tailFromBar) p *= 0.35;
    for (var st = 0; st < STEPS_PER_BAR; st++) {
      if (Math.random() < p) {
        var base = chord[1 + Math.floor(Math.random() * 3)];
        var up = (Math.random() < 0.55) ? 36 : 48;
        var midi = Math.min(107, base + up);
        if (!plan[st]) plan[st] = [];
        plan[st].push({ kind: 'bell', midi: midi, vel: 0.05 + Math.random() * 0.07 });
      }
    }
    return plan;
  }

  /* ===================== 이벤트 큐(시각 연출 동기화) ===================== */
  function queueEvent(type, time, velocity) {
    eventQueue.push({ type: type, time: time, velocity: velocity });
    if (eventQueue.length > 400) eventQueue.splice(0, eventQueue.length - 400);
  }

  function flushEvents() {
    if (!eventQueue.length || !beatListeners.length) {
      if (!beatListeners.length) eventQueue.length = 0;
      return;
    }
    var now = ctx.currentTime;
    var keep = [];
    for (var i = 0; i < eventQueue.length; i++) {
      var e = eventQueue[i];
      if (e.time <= now + 0.02) {
        for (var j = 0; j < beatListeners.length; j++) {
          try { beatListeners[j](e); } catch (err) { /* 콜백 오류는 음악을 멈추지 않는다 */ }
        }
      } else {
        keep.push(e);
      }
    }
    eventQueue = keep;
  }

  /* ===================== 스케줄러 ===================== */
  function scheduleStep(t) {
    var ch = CHAPTERS[chapterIdx];

    if (stepInBar === 0) {
      barStartTime = t;
      barPlan = planBar(ch, barInChapter, t);
      // 마지막 여운: 전체 테일을 아주 길게 페이드
      if (ch.tailFromBar !== undefined && barInChapter === ch.tailFromBar && !tailArmed) {
        tailArmed = true;
        tail.gain.cancelScheduledValues(t);
        tail.gain.setValueAtTime(1, t);
        tail.gain.exponentialRampToValueAtTime(0.0012, t + ch.tailSeconds);
      }
    }

    var evs = barPlan ? barPlan[stepInBar] : null;
    if (evs) {
      for (var i = 0; i < evs.length; i++) {
        var e = evs[i];
        if (e.kind === 'box') {
          playMusicBox(t, mtof(e.midi), e.vel, e.decay);
          queueEvent('melody', t, Math.min(1, e.vel / 0.34));
        } else if (e.kind === 'hb') {
          var ht = t + (e.offset || 0);
          playHeartbeat(ht, e.freq, e.vel);
          queueEvent('heartbeat', ht, Math.min(1, e.vel / 0.62));
        } else if (e.kind === 'bell') {
          playBell(t, mtof(e.midi), e.vel);
          queueEvent('bell', t, Math.min(1, e.vel / 0.12));
        }
      }
    }
  }

  function advanceStep() {
    nextStepTime += STEP_DUR;
    stepInBar++;
    if (stepInBar >= STEPS_PER_BAR) {
      stepInBar = 0;
      barInChapter++;
      var ch = CHAPTERS[chapterIdx];
      var len = ch.chords.length;

      if (pendingChapter >= 0 && pendingChapter !== chapterIdx) {
        chapterIdx = pendingChapter;
        pendingChapter = -1;
        barInChapter = 0;
        resetTail();
      } else if (barInChapter >= len) {
        if (autoFollow) {
          if (chapterIdx < CHAPTERS.length - 1) {
            chapterIdx++;
            barInChapter = 0;
          } else if (loopEnabled) {
            chapterIdx = 0;
            barInChapter = 0;
            resetTail(nextStepTime, 4.0);   // 처음으로 되돌아오며 서서히 밝아진다
          } else {
            fadeOutAndStop(1.5);
          }
        } else {
          // 외부(스크롤) 주도 모드: 같은 챕터를 자연스럽게 반복
          barInChapter = (len > 4) ? len - 4 : 0;
          resetTail();
        }
      }
    }
  }

  function resetTail(at, seconds) {
    if (!tail) return;
    var t = at || ctx.currentTime;
    tailArmed = false;
    tail.gain.cancelScheduledValues(t);
    var cur = Math.max(0.0012, tail.gain.value);
    tail.gain.setValueAtTime(cur, t);
    tail.gain.linearRampToValueAtTime(1, t + (seconds || 1.6));
  }

  function tick() {
    if (!playing || !ctx) return;
    var now = ctx.currentTime;

    // 백그라운드 탭 등으로 타이머가 크게 밀렸을 때: 밀린 만큼 몰아치지 않도록 재동기화
    if (now - nextStepTime > 1.0) {
      nextStepTime = now + 0.06;
      stepInBar = 0;
      barPlan = null;
    }

    var guard = 0;
    while (nextStepTime < now + SCHEDULE_AHEAD && guard < 64) {
      scheduleStep(nextStepTime);
      advanceStep();
      guard++;
    }
    flushEvents();
  }

  /* ===================== 볼륨 ===================== */
  function targetGain() { return muted ? 0.0001 : Math.max(0.0001, userVolume); }

  function rampMaster(v, seconds, at) {
    if (!master || !ctx) return;
    var t = at || ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), t + (seconds || 0.6));
  }

  function fadeOutAndStop(seconds) {
    rampMaster(0.0001, seconds || 1.2);
    var ms = (seconds || 1.2) * 1000 + 120;
    setTimeout(function () { teardown(); }, ms);
  }

  function teardown() {
    playing = false;
    if (timer) { clearInterval(timer); timer = null; }
    eventQueue.length = 0;
    for (var i = 0; i < padVoices.length; i++) {
      var oscs = padVoices[i].oscs;
      for (var j = 0; j < oscs.length; j++) {
        try { oscs[j].stop(); oscs[j].disconnect(); } catch (e) { /* noop */ }
      }
      try { padVoices[i].gain.disconnect(); } catch (e) { /* noop */ }
    }
    padVoices = [];
    var nodes = [padLfo, padFiltLfo];
    for (var k = 0; k < nodes.length; k++) {
      try { nodes[k].stop(); nodes[k].disconnect(); } catch (e) { /* noop */ }
    }
    var others = [padLfoGain, padFiltLfoGain, padTrem, padFilter,
                  bus.box, bus.pad, bus.bass, bus.shim,
                  send.box, send.pad, send.bass, send.shim,
                  convolver, reverbReturn, mixBus, comp, tail, master];
    for (var m = 0; m < others.length; m++) {
      try { if (others[m]) others[m].disconnect(); } catch (e) { /* noop */ }
    }
    bus = {}; send = {};
    built = false;
  }

  /* ===================== 공개 API ===================== */
  var api = {
    /**
     * 재생 시작. 반드시 사용자 제스처(click/touch) 핸들러 안에서 호출할 것.
     * @param {number} [chapter] 1~6. 지정하면 해당 챕터부터 시작(외부 주도 모드).
     * @returns {Promise<boolean>}
     */
    start: function (chapter) {
      if (!ctx) ctx = makeContext();
      if (!ctx) return Promise.resolve(false);
      if (!built) buildGraph();

      if (typeof chapter === 'number') {
        chapterIdx = Math.max(0, Math.min(CHAPTERS.length - 1, Math.round(chapter) - 1));
        autoFollow = false;
      }

      var resumed = (ctx.state === 'suspended' && ctx.resume) ? ctx.resume() : Promise.resolve();
      return Promise.resolve(resumed).then(function () {
        if (playing) return true;
        playing = true;
        barInChapter = 0;
        stepInBar = 0;
        barPlan = null;
        pendingChapter = -1;
        tailArmed = false;
        if (tail) tail.gain.setValueAtTime(1, ctx.currentTime);
        applyLayers(CHAPTERS[chapterIdx].layers, ctx.currentTime, 0.05);
        nextStepTime = ctx.currentTime + 0.12;
        rampMaster(targetGain(), 2.2);
        if (timer) clearInterval(timer);
        timer = setInterval(tick, LOOKAHEAD_MS);
        tick();
        return true;
      })['catch'](function () { return false; });
    },

    /** 페이드아웃 후 정지 + 모든 노드 정리. 다시 start() 하면 재구축된다. */
    stop: function (seconds) {
      if (!playing) return;
      fadeOutAndStop(typeof seconds === 'number' ? seconds : 1.2);
    },

    /**
     * 챕터 전환(1~6). 다음 마디 경계에서 화성/멜로디가 바뀌고,
     * 레이어 볼륨은 즉시 약 2초에 걸쳐 크로스페이드된다. 소리는 끊기지 않는다.
     */
    setChapter: function (n) {
      var idx = Math.max(0, Math.min(CHAPTERS.length - 1, (Math.round(n) || 1) - 1));
      autoFollow = false;
      if (!built || !ctx) { chapterIdx = idx; return; }
      if (ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) { /* noop */ } }
      if (idx === chapterIdx && pendingChapter < 0) return;
      pendingChapter = idx;
      // 볼륨 밸런스는 기다리지 않고 즉시 크로스페이드 시작
      applyLayers(CHAPTERS[idx].layers, ctx.currentTime);
      resetTail();
    },

    /** 현재 챕터 번호(1~6) */
    getChapter: function () { return chapterIdx + 1; },

    /** 마스터 볼륨 0~1 */
    setVolume: function (v) {
      userVolume = Math.max(0, Math.min(1, Number(v) || 0));
      if (built && playing) rampMaster(targetGain(), 0.4);
    },
    getVolume: function () { return userVolume; },

    mute: function () {
      muted = true;
      if (built) rampMaster(0.0001, 0.5);
    },
    unmute: function () {
      muted = false;
      if (built) rampMaster(targetGain(), 0.8);
      if (ctx && ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) { /* noop */ } }
    },
    isMuted: function () { return muted; },
    isPlaying: function () { return playing; },

    /** 180초(50마디) 후 처음으로 되돌아갈지 여부. 기본 true */
    setLoop: function (b) { loopEnabled = !!b; },

    /**
     * 음악 이벤트 구독. 콜백은 소리가 나는 순간(±25ms)에 호출된다.
     * @param {(e:{type:'heartbeat'|'bell'|'melody', time:number, velocity:number})=>void} cb
     * @returns {()=>void} 구독 해제 함수
     */
    onBeat: function (cb) {
      if (typeof cb !== 'function') return function () {};
      beatListeners.push(cb);
      return function () {
        var i = beatListeners.indexOf(cb);
        if (i >= 0) beatListeners.splice(i, 1);
      };
    },
    offBeat: function (cb) {
      var i = beatListeners.indexOf(cb);
      if (i >= 0) beatListeners.splice(i, 1);
    },

    /** 참고용 메타데이터 */
    info: {
      title: '포니에게 가는 길',
      bpm: BPM,
      barDuration: BAR_DUR,
      totalBars: 50,
      duration: 50 * BAR_DUR,
      chapters: CHAPTERS.map(function (c) {
        return { id: c.id, title: c.title, bars: c.chords.length, seconds: c.chords.length * BAR_DUR };
      })
    }
  };

  return api;
})();

if (typeof module !== 'undefined' && module.exports) { module.exports = PonyScore; }
