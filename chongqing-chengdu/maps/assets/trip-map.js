/* ============================================================
   trip-map.js — 충칭·구채구·청두 여행 애니메이션 지도 엔진
   백상진·박현교 부부 환갑 여행 (2026.09.01~09.08)
   좌표는 WGS-84 기준으로 입력하고, 고덕(高德) 타일 사용 시
   GCJ-02로 자동 변환한다.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- WGS-84 → GCJ-02 (중국 측지계) ---------- */
  var PI = 3.14159265358979324, A = 6378245.0, EE = 0.00669342162296594323;
  function outOfChina(lat, lng) {
    return !(lng > 72.0 && lng < 137.9 && lat > 0.8 && lat < 55.9);
  }
  function tLat(x, y) {
    var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    r += (20 * Math.sin(y * PI) + 40 * Math.sin(y / 3 * PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * PI) + 320 * Math.sin(y * PI / 30)) * 2 / 3;
    return r;
  }
  function tLng(x, y) {
    var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2 / 3;
    r += (20 * Math.sin(x * PI) + 40 * Math.sin(x / 3 * PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * PI) + 300 * Math.sin(x / 30 * PI)) * 2 / 3;
    return r;
  }
  function wgs2gcj(lat, lng) {
    if (outOfChina(lat, lng)) return [lat, lng];
    var dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
    var rad = lat / 180 * PI, m = Math.sin(rad);
    m = 1 - EE * m * m;
    var sq = Math.sqrt(m);
    dLat = (dLat * 180) / ((A * (1 - EE)) / (m * sq) * PI);
    dLng = (dLng * 180) / (A / sq * Math.cos(rad) * PI);
    return [lat + dLat, lng + dLng];
  }

  /* ---------- 거리 ---------- */
  function hav(a, b) {
    var R = 6371, p = PI / 180;
    var dLat = (b[0] - a[0]) * p, dLng = (b[1] - a[1]) * p;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(a[0] * p) * Math.cos(b[0] * p) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  }

  /* ---------- 이동수단 정의 ---------- */
  var MODES = {
    walk:   { c: '#2E7D32', e: '🚶', n: '도보',      dash: '2,7' },
    metro:  { c: '#1565C0', e: '🚇', n: '지하철',    dash: null },
    taxi:   { c: '#EF6C00', e: '🚕', n: '택시',      dash: null },
    car:    { c: '#455A64', e: '🚙', n: '차량',      dash: null },
    bus:    { c: '#4527A0', e: '🚌', n: '버스',      dash: null },
    train:  { c: '#6A1B9A', e: '🚄', n: '고속열차',  dash: null },
    flight: { c: '#C0392B', e: '✈️', n: '항공',      dash: '10,8' },
    boat:   { c: '#00838F', e: '⛴️', n: '유람선',    dash: '9,6' },
    cable:  { c: '#AD1457', e: '🚡', n: '로프웨이',  dash: '8,5' },
    shuttle:{ c: '#00695C', e: '🚐', n: '관광버스',  dash: null }
  };
  var KIND_EMOJI = {
    hotel: '🏨', sight: '📍', food: '🍜', tea: '🍵', station: '🚄', airport: '✈️',
    view: '🌃', show: '🎭', park: '🌲', city: '🏙️', info: 'ℹ️', panda: '🐼', lake: '💧'
  };
  function kindClass(k) { return 'k-' + (['hotel','sight','food','tea','station','airport','view','show','park','city','info'].indexOf(k) >= 0 ? k : 'sight'); }

  /* ---------- 타일 ---------- */
  var TILES = {
    amap: {
      label: '고덕지도 (중국 내 추천)',
      url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      opt: { subdomains: '1234', maxZoom: 18, attribution: '高德地图 AutoNavi' }, datum: 'gcj'
    },
    amapsat: {
      label: '고덕 위성',
      url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      opt: { subdomains: '1234', maxZoom: 18, attribution: '高德卫星影像' }, datum: 'gcj'
    },
    osm: {
      label: 'OpenStreetMap (한국어권)',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      opt: { maxZoom: 19, attribution: '&copy; OpenStreetMap' }, datum: 'wgs'
    }
  };

  /* ---------- 보간 유틸 ---------- */
  function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
  function arcPath(a, b, curve, n) {
    // 두 점 사이 곡선(항공 경로용) — 중점을 수직 방향으로 밀어 2차 베지어
    n = n || 64; curve = curve == null ? 0.22 : curve;
    var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var cx = mx - dy * curve, cy = my + dx * curve;
    var pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0],
                u * u * a[1] + 2 * u * t * cy + t * t * b[1]]);
    }
    return pts;
  }
  function densify(pts, seg) {
    // 직선 구간을 잘게 쪼개 애니메이션이 부드럽게 흐르도록
    seg = seg || 24;
    var out = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
      for (var j = 1; j <= seg; j++) out.push(lerp(pts[i - 1], pts[i], j / seg));
    }
    return out;
  }

  /* ============================================================ */
  function TripMap(cfg) {
    this.cfg = cfg;
    this.datum = TILES[cfg.base || 'amap'].datum;
    this.baseKey = cfg.base || 'amap';
    this.courseIdx = 0;
    this.speed = 1;
    this.showFood = true;
    this.playing = false;
    this.init();
  }

  TripMap.prototype.P = function (c) {
    return this.datum === 'gcj' ? wgs2gcj(c[0], c[1]) : [c[0], c[1]];
  };

  TripMap.prototype.init = function () {
    var self = this, cfg = this.cfg;
    var map = L.map('map', { zoomControl: true, scrollWheelZoom: true, attributionControl: true })
      .setView(cfg.center, cfg.zoom);
    this.map = map;

    var layers = {}, first = null;
    ['amap', 'amapsat', 'osm'].forEach(function (k) {
      var t = TILES[k];
      var lyr = L.tileLayer(t.url, t.opt);
      lyr._tmKey = k;
      layers[t.label] = lyr;
      if (k === self.baseKey) { first = lyr; }
    });
    first.addTo(map);
    L.control.layers(layers, null, { position: 'topright' }).addTo(map);
    map.on('baselayerchange', function (e) {
      var k = e.layer._tmKey;
      self.baseKey = k;
      var d = TILES[k].datum;
      if (d !== self.datum) { self.datum = d; self.render(true); }
    });

    this.gRoute = L.layerGroup().addTo(map);
    this.gPins = L.layerGroup().addTo(map);
    this.gFood = L.layerGroup().addTo(map);
    this.gInfo = L.layerGroup().addTo(map);

    this.buildDayBar();
    this.buildControls();
    this.render();
  };

  TripMap.prototype.course = function () { return this.cfg.courses[this.courseIdx]; };

  TripMap.prototype.buildDayBar = function () {
    var self = this, bar = document.getElementById('daybar');
    if (!bar) return;
    bar.innerHTML = '';
    this.cfg.courses.forEach(function (c, i) {
      var b = document.createElement('button');
      b.innerHTML = c.label + '<small>' + c.sub + '</small>';
      b.onclick = function () { self.setCourse(i); };
      bar.appendChild(b);
    });
    this.dayBtns = bar.querySelectorAll('button');
  };

  TripMap.prototype.setCourse = function (i) {
    this.courseIdx = i;
    this.render();
  };

  TripMap.prototype.buildControls = function () {
    var self = this;
    var play = document.getElementById('btnPlay');
    var reset = document.getElementById('btnReset');
    var fit = document.getElementById('btnFit');
    var food = document.getElementById('togFood');
    if (play) play.onclick = function () { self.playing ? self.pause() : self.play(); };
    if (reset) reset.onclick = function () { self.render(); };
    if (fit) fit.onclick = function () { self.fit(); };
    if (food) food.onchange = function () {
      self.showFood = food.checked;
      if (self.showFood) self.map.addLayer(self.gFood); else self.map.removeLayer(self.gFood);
    };
    document.querySelectorAll('.spd b').forEach(function (el) {
      el.onclick = function () {
        document.querySelectorAll('.spd b').forEach(function (x) { x.classList.remove('on'); });
        el.classList.add('on');
        self.speed = parseFloat(el.dataset.s);
      };
    });
  };

  /* ---------- 렌더 ---------- */
  TripMap.prototype.render = function (keepView) {
    var self = this, c = this.course();
    this.stop();
    this.gRoute.clearLayers(); this.gPins.clearLayers();
    this.gFood.clearLayers(); this.gInfo.clearLayers();

    if (this.dayBtns) this.dayBtns.forEach(function (b, i) { b.classList.toggle('on', i === self.courseIdx); });

    var stops = c.stops;
    this.legs = [];
    for (var i = 1; i < stops.length; i++) {
      var a = stops[i - 1], b = stops[i], m = b.mode || { type: 'taxi' };
      var raw;
      if (m.type === 'flight') raw = arcPath(a.coord, b.coord, m.curve == null ? 0.2 : m.curve);
      else if (b.via) raw = densify([a.coord].concat(b.via).concat([b.coord]), 16);
      else raw = densify([a.coord, b.coord], 40);
      this.legs.push({ from: i - 1, to: i, mode: m, pts: raw, km: hav(a.coord, b.coord) });
    }

    // 전체 경로(연한 점선) — 어디로 가는지 미리 보이게
    this.legs.forEach(function (lg) {
      L.polyline(lg.pts.map(function (p) { return self.P(p); }), {
        color: MODES[lg.mode.type].c, weight: 4, opacity: 0.22,
        dashArray: '3,9', lineCap: 'round'
      }).addTo(self.gRoute);
    });

    // 애니메이션용 라인
    this.animLines = this.legs.map(function (lg) {
      return L.polyline([], {
        color: MODES[lg.mode.type].c, weight: 6, opacity: 0.95,
        dashArray: MODES[lg.mode.type].dash, lineCap: 'round', lineJoin: 'round'
      }).addTo(self.gRoute);
    });

    // 핀
    this.pins = stops.map(function (s, i) {
      var em = s.emoji || KIND_EMOJI[s.kind] || '📍';
      var html = '<div class="pin ' + kindClass(s.kind) + '"><span>' + em + '</span>' +
        (s.noNum ? '' : '<b class="no">' + (i + 1) + '</b>') + '</div>';
      var mk = L.marker(self.P(s.coord), {
        icon: L.divIcon({ className: '', html: html, iconSize: [38, 38], iconAnchor: [19, 36], popupAnchor: [0, -32] }),
        zIndexOffset: 400 + i
      }).addTo(self.gPins);
      mk.bindPopup(self.popupHTML(s, i), { maxWidth: 280 });
      mk.on('click', function () { self.highlight(i); });
      return mk;
    });

    // 맛집·찻집(경로 밖)
    (c.food || []).forEach(function (f) {
      var em = f.kind === 'tea' ? '🍵' : '🍜';
      var mk = L.marker(self.P(f.coord), {
        icon: L.divIcon({ className: '', html: '<div class="pin ' + kindClass(f.kind || 'food') + ' on"><span>' + em + '</span></div>', iconSize: [38, 38], iconAnchor: [19, 36], popupAnchor: [0, -32] })
      }).addTo(self.gFood);
      mk.bindPopup(self.popupHTML(f, -1));
    });

    // 참고 지점
    (c.info || []).forEach(function (f) {
      var mk = L.marker(self.P(f.coord), {
        icon: L.divIcon({ className: '', html: '<div class="pin k-info on"><span>' + (f.emoji || 'ℹ️') + '</span></div>', iconSize: [38, 38], iconAnchor: [19, 36], popupAnchor: [0, -32] })
      }).addTo(self.gInfo);
      mk.bindPopup(self.popupHTML(f, -1));
    });

    this.buildList();
    if (!keepView) this.fit();
    this.setStatus('▶ <b>경로 재생</b> 버튼을 누르면 오늘 동선이 순서대로 그려집니다.');
    this.progress(0);
    this.reached = -1;
    this.markPin(0, true);
  };

  TripMap.prototype.popupHTML = function (s, i) {
    var m = s.mode ? MODES[s.mode.type] : null;
    var h = '<div class="pp"><h4>' + (i >= 0 && !s.noNum ? (i + 1) + '. ' : '') + s.name + '</h4>';
    if (s.zh) h += '<div class="zh">' + s.zh + '</div>';
    if (s.time) h += '<span class="t">🕘 ' + s.time + '</span>';
    if (s.stay) h += '<span class="t">⏱ ' + s.stay + '</span>';
    if (m) h += '<span class="t">' + m.e + ' ' + (s.mode.text || m.n) + '</span>';
    if (s.desc) h += '<p>' + s.desc + '</p>';
    if (s.food && s.food.length) h += '<div class="fd">🍽 <b>먹거리</b><br>' + s.food.join('<br>') + '</div>';
    if (s.tip) h += '<div class="tip">💡 ' + s.tip + '</div>';
    var g = wgs2gcj(s.coord[0], s.coord[1]);
    h += '<div class="go">' +
      '<a href="https://uri.amap.com/marker?position=' + g[1].toFixed(6) + ',' + g[0].toFixed(6) +
      '&name=' + encodeURIComponent(s.zh || s.name) + '&src=trip&coordinate=gaode&callnative=1" target="_blank" rel="noopener">고덕지도</a>' +
      (s.zh ? '<button onclick="TM.card(\'' + (s.zh || '') + '\',\'' + (s.addr || '') + '\',\'' + s.name.replace(/'/g, '') + '\')">기사님께</button>' : '') +
      '<a class="alt" href="https://www.google.com/maps/search/?api=1&query=' + s.coord[0] + ',' + s.coord[1] + '" target="_blank" rel="noopener">구글</a>' +
      '</div></div>';
    return h;
  };

  TripMap.prototype.buildList = function () {
    var self = this, box = document.getElementById('list');
    if (!box) return;
    var c = this.course();
    box.innerHTML = '';
    c.stops.forEach(function (s, i) {
      var m = s.mode ? MODES[s.mode.type] : null;
      var d = document.createElement('div');
      d.className = 'item';
      d.innerHTML = '<div class="num">' + (s.noNum ? (KIND_EMOJI[s.kind] || '•') : (i + 1)) + '</div><div class="tx">' +
        '<b>' + s.name + (s.optional ? '<span class="opt">선택</span>' : '') + '</b>' +
        (s.zh ? '<div class="zh">' + s.zh + '</div>' : '') +
        '<span>' + (s.time ? '🕘 ' + s.time + (s.stay ? ' · ' + s.stay : '') : (s.stay || '')) + '</span>' +
        (m ? '<span class="mode" style="background:' + m.c + '">' + m.e + ' ' + (s.mode.text || m.n) + '</span>' : '') +
        (s.short ? '<span>' + s.short + '</span>' : '') +
        '</div>';
      d.onclick = function () {
        self.map.flyTo(self.P(s.coord), Math.max(self.map.getZoom(), 15), { duration: 0.8 });
        self.pins[i].openPopup();
        self.highlight(i);
      };
      box.appendChild(d);
    });
    this.items = box.querySelectorAll('.item');
  };

  TripMap.prototype.highlight = function (i) {
    if (!this.items) return;
    this.items.forEach(function (el, j) { el.classList.toggle('active', j === i); });
    var el = this.items[i];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  TripMap.prototype.markPin = function (i, on, pop) {
    var mk = this.pins[i]; if (!mk) return;
    var el = mk.getElement(); if (!el) return;
    var d = el.querySelector('.pin'); if (!d) return;
    d.classList.toggle('on', !!on);
    if (pop) { d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); }
  };

  TripMap.prototype.fit = function () {
    var self = this, pts = this.course().stops.map(function (s) { return self.P(s.coord); });
    this.map.fitBounds(L.latLngBounds(pts).pad(0.12), { animate: true });
  };

  TripMap.prototype.setStatus = function (h) {
    var el = document.getElementById('status'); if (el) el.innerHTML = h;
  };
  TripMap.prototype.progress = function (p) {
    var el = document.querySelector('.bar i'); if (el) el.style.width = (p * 100).toFixed(1) + '%';
  };

  /* ---------- 애니메이션 ---------- */
  TripMap.prototype.play = function () {
    if (!this.legs.length) return;
    if (this.legIdx == null || this.legIdx >= this.legs.length) this.resetAnim();
    this.playing = true;
    var b = document.getElementById('btnPlay'); if (b) b.textContent = '⏸ 일시정지';
    this.last = null;
    this.tick();
  };
  TripMap.prototype.pause = function () {
    this.playing = false;
    var b = document.getElementById('btnPlay'); if (b) b.textContent = '▶ 이어서 재생';
    if (this.raf) cancelAnimationFrame(this.raf);
  };
  TripMap.prototype.stop = function () {
    this.playing = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.legIdx = null;
    var b = document.getElementById('btnPlay'); if (b) b.textContent = '▶ 경로 재생';
    if (this.mover) { this.map.removeLayer(this.mover); this.mover = null; }
  };
  TripMap.prototype.resetAnim = function () {
    var self = this;
    this.animLines.forEach(function (l) { l.setLatLngs([]); });
    this.course().stops.forEach(function (s, i) { self.markPin(i, i === 0); });
    if (this.items) this.items.forEach(function (el) { el.classList.remove('done', 'active'); });
    this.legIdx = 0; this.t = 0;
    this.progress(0);
  };

  TripMap.prototype.tick = function () {
    var self = this;
    this.raf = requestAnimationFrame(function (ts) {
      if (!self.playing) return;
      if (self.last == null) self.last = ts;
      var dt = Math.min(120, ts - self.last); self.last = ts;

      var lg = self.legs[self.legIdx];
      if (!lg) { self.finish(); return; }
      var stops = self.course().stops;

      // 구간 길이에 따라 재생시간 결정 (짧아도 최소 0.9초, 길어도 4초)
      var dur = Math.max(900, Math.min(4000, 700 + lg.km * 260)) / self.speed;
      self.t += dt / dur;
      var t = Math.min(1, self.t);
      var n = lg.pts.length;
      var idx = Math.max(1, Math.floor(t * (n - 1)));
      var sub = lg.pts.slice(0, idx + 1).map(function (p) { return self.P(p); });
      self.animLines[self.legIdx].setLatLngs(sub);

      // 이동 아이콘
      var cur = self.P(lg.pts[idx]);
      var em = MODES[lg.mode.type].e;
      if (!self.mover) {
        self.mover = L.marker(cur, { icon: L.divIcon({ className: '', html: '<div class="mover">' + em + '</div>', iconSize: [30, 30], iconAnchor: [15, 15] }), zIndexOffset: 1000 }).addTo(self.map);
      } else {
        self.mover.setLatLng(cur);
        var mel = self.mover.getElement();
        if (mel && mel.firstChild && mel.firstChild.textContent !== em) mel.firstChild.textContent = em;
      }

      var a = stops[lg.from], b = stops[lg.to];
      self.setStatus(MODES[lg.mode.type].e + ' <b>' + a.name + '</b> → <b>' + b.name + '</b> · ' +
        (b.mode && b.mode.text ? b.mode.text : MODES[lg.mode.type].n) +
        ' <span style="color:#8C7B67">(직선 ' + (lg.km < 1 ? (lg.km * 1000).toFixed(0) + 'm' : lg.km.toFixed(1) + 'km') + ')</span>');
      self.progress((self.legIdx + t) / self.legs.length);
      self.highlight(lg.to);

      if (t >= 1) {
        self.markPin(lg.to, true, true);
        if (self.items && self.items[lg.to]) self.items[lg.to].classList.add('done');
        self.legIdx++; self.t = 0;
        if (self.legIdx >= self.legs.length) { self.finish(); return; }
      }
      self.tick();
    });
  };

  TripMap.prototype.finish = function () {
    this.playing = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    var b = document.getElementById('btnPlay'); if (b) b.textContent = '↻ 다시 재생';
    this.legIdx = this.legs.length;
    this.progress(1);
    var c = this.course();
    this.setStatus('🎉 <b>' + c.label + '</b> 동선 완료 — ' + (c.done || '핀을 눌러 상세 정보를 보세요.'));
    if (this.mover) { this.map.removeLayer(this.mover); this.mover = null; }
  };

  /* ---------- 기사님께 보여주는 카드 ---------- */
  TripMap.prototype.card = function (zh, addr, ko) {
    var box = document.getElementById('card');
    if (!box) return;
    box.querySelector('.zh').textContent = zh;
    box.querySelector('.ad').innerHTML = addr ? addr : '　';
    box.querySelector('.ko').textContent = ko || '';
    box.classList.add('on');
  };

  global.TripMap = TripMap;
  global.MODES = MODES;
  global.wgs2gcj = wgs2gcj;
})(window);
