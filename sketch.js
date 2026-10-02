// =====================================================================
// VIRTUAL LAB: LATO-LATO — GHS & TUMBUKAN  (p5.js, satu file sketch.js)
// Cara pakai: tempel ke sketch.js di editor.p5js.org lalu klik Play.
// Seluruh antarmuka (tombol, slider, log, teori, kuis) dibuat dari
// file ini, jadi index.html bawaan editor tidak perlu diubah.
// =====================================================================

// ---------- CSS & KERANGKA HTML ----------
const CSS = `
body{background:#f4f6fb !important;font-family:system-ui,sans-serif;color:#1b2333;line-height:1.5}
#lab{max-width:940px;margin:auto;padding:16px}
#lab *{box-sizing:border-box}
.card{background:#fff;border-radius:12px;padding:14px 16px;margin:12px 0;box-shadow:0 1px 4px #0002}
#lab h1{font-size:1.5rem;margin:.2rem 0}#lab h2{font-size:1.05rem;margin:0 0 6px}
#lab button{border:0;border-radius:8px;padding:8px 14px;margin:2px;background:#3b6cf6;color:#fff;cursor:pointer;font-size:.95rem}
#lab button.g{background:#8a93a6}#lab button.o{background:#f08a24}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.stat{background:#eef2fb;border-radius:8px;padding:6px 10px;font-size:.8rem}.stat b{display:block;font-size:1.1rem}
#lab label{display:block;font-size:.85rem;margin-top:6px}
#lab input[type=range]{width:100%}#lab select{width:100%;padding:4px}
#lab canvas{max-width:100%;border-radius:8px;display:block}
#lab table{border-collapse:collapse;width:100%;font-size:.78rem}
#lab td,#lab th{border-bottom:1px solid #dde;padding:3px 5px;text-align:right}
.wrap{max-height:240px;overflow:auto}
#lab button.opt{display:block;width:100%;text-align:left;background:#eef2fb;color:#1b2333}
`;

const UI = `
<p style="color:#3b6cf6;font-weight:600;margin:0">Virtual Lab Fisika</p>
<h1>🪀 Lato-Lato: Gerak Harmonik &amp; Tumbukan</h1>
<p>Dua bola tergantung dari satu poros dan berayun seperti bandul. Saat keduanya bertemu terjadi tumbukan, di situlah kekekalan momentum dan koefisien restitusi bekerja. Ubah parameter lalu amati efeknya.</p>
<div class="card">
 <button id="go" onclick="toggle()">▶ Mulai</button>
 <button class="g" onclick="reset()">↺ Reset</button>
 <button class="o" onclick="kick()">⚡ Beri Dorongan</button>
 <div class="grid" id="stats" style="margin-top:8px"></div>
</div>
<div class="card"><div id="cv"></div></div>
<div class="card grid">
 <div><h2 style="color:#e5484d">Bola Merah</h2><div id="cr"></div></div>
 <div><h2 style="color:#c99700">Bola Kuning</h2><div id="cy"></div></div>
 <div><h2>⚙️ Parameter Umum</h2><div id="cu"></div>
  <label>Gravitasi (g)<select id="gv">
   <option value="1.6">Bulan (1.6 m/s²)</option><option value="3.7">Mars (3.7 m/s²)</option>
   <option value="9.8" selected>Bumi (9.8 m/s²)</option><option value="24.8">Jupiter (24.8 m/s²)</option></select></label>
  <p style="font-size:.78rem;color:#667">💡 Perubahan θ₀ baru berlaku setelah klik <b>Reset</b>. Parameter lain berlaku langsung.</p></div>
</div>
<div class="card"><h2>📋 Log Tumbukan</h2><div class="wrap" id="log"></div></div>
<div class="card"><h2>📖 Dasar Teori</h2>
<p><b>1. Gerak bandul.</b> Simulasi memakai persamaan sebenarnya d²θ/dt² = −(g/L)·sin θ. Untuk sudut kecil (di bawah ±15°) sin θ ≈ θ sehingga geraknya mendekati GHS dengan T = 2π√(L/g). Pada sudut besar (60°–75°) periodenya sedikit lebih lama, itulah batas pendekatan GHS.</p>
<p><b>2. Tumbukan.</b> Momentum selalu kekal: m₁v₁ + m₂v₂ = m₁v₁′ + m₂v₂′. Koefisien restitusi e = −(v₂′−v₁′)/(v₂−v₁): e = 1 lenting sempurna, 0 &lt; e &lt; 1 lenting sebagian (energi berubah jadi bunyi dan panas), e = 0 tidak lenting (kedua bola berkecepatan sama).</p>
<p><b>3. Menggabungkan keduanya.</b> Ayunan mengubah energi potensial menjadi kinetik, lalu sebagian hilang di tiap tumbukan bila e &lt; 1. Tanpa "pompa" dari tangan, lato-lato akhirnya berhenti. Tombol Beri Dorongan meniru tambahan energi dari tangan.</p></div>
<div class="card"><h2>🧠 Kuis Pemahaman</h2><div id="quiz"></div></div>
<p style="text-align:center;font-size:.8rem;color:#667">Virtual Lab Lato-Lato · dibuat dengan p5.js</p>
`;

// ---------- DATA ANTARMUKA ----------
const $ = id => document.getElementById(id);
const val = id => +$('s_' + id).value;

const SL = { // id, label, min, max, nilai awal, langkah, satuan
  cr: [['L1', 'Panjang tali (L₁)', 10, 40, 25, 1, 'cm'], ['m1', 'Massa (m₁)', 5, 100, 25, 1, 'g'], ['t1', 'Sudut awal (θ₀₁)', 5, 75, 35, 1, '°']],
  cy: [['L2', 'Panjang tali (L₂)', 10, 40, 25, 1, 'cm'], ['m2', 'Massa (m₂)', 5, 100, 25, 1, 'g'], ['t2', 'Sudut awal (θ₀₂)', 5, 75, 35, 1, '°']],
  cu: [['e', 'Koefisien restitusi (e)', 0, 1, 0.9, 0.01, ''], ['c', 'Redaman udara', 0, 0.2, 0.02, 0.005, '']]
};
const ST = [['thR', 'θ Bola Merah', '°'], ['thY', 'θ Bola Kuning', '°'], ['vR', 'v Bola Merah', 'm/s'], ['vY', 'v Bola Kuning', 'm/s'],
  ['tm', 'Waktu', 's'], ['nc', 'Jumlah Tumbukan', 'kali'], ['en', 'Energi Mekanik Total', 'mJ'], ['mo', 'Momentum Total', 'g·m/s']];
const QZ = [
  ['Untuk sudut kecil, periode bandul bergantung pada…', ['massa dan panjang tali', 'panjang tali dan g', 'hanya amplitudo', 'hanya massa'], 1, 'T = 2π√(L/g): massa dan amplitudo tidak berpengaruh.'],
  ['Pada tumbukan dengan e = 0, setelah tumbukan…', ['kedua bola bertukar kecepatan', 'energi kinetik kekal', 'kedua bola berkecepatan sama', 'momentum hilang'], 2, 'e = 0 berarti kecepatan relatif sesudah tumbukan nol.'],
  ['Mengapa lato-lato melambat jika tidak dipompa?', ['e < 1 dan redaman mengurangi energi', 'massa bola bertambah', 'gravitasi mengecil', 'momentum tidak kekal'], 0, 'Energi hilang di tiap tumbukan dan oleh redaman udara.'],
  ['Bandul yang sama dibawa ke Bulan (g lebih kecil), periodenya…', ['lebih kecil', 'sama', 'lebih besar', 'nol'], 2, 'T sebanding dengan 1/√g, jadi g kecil membuat T besar.']
];
const ans = (i, j) => $('f' + i).textContent = (j == QZ[i][2] ? '✅ Benar. ' : '❌ Belum tepat. ') + QZ[i][3];

function buildUI() {
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);
  document.title = 'Virtual Lab: Lato-Lato — GHS & Tumbukan';
  const lab = document.createElement('div');
  lab.id = 'lab';
  lab.innerHTML = UI;
  document.body.appendChild(lab);

  for (const k in SL) $(k).innerHTML = SL[k].map(([id, l, a, b, v, s, u]) =>
    `<label>${l}: <b id="v_${id}">${v}</b> ${u}<input type="range" id="s_${id}" min="${a}" max="${b}" value="${v}" step="${s}" oninput="$('v_${id}').textContent=this.value"></label>`).join('');
  $('stats').innerHTML = ST.map(([i, l, u]) =>
    `<div class="stat">${l}<b><span id="${i}">0</span> <small>${u}</small></b></div>`).join('');
  $('quiz').innerHTML = QZ.map(([q, o], i) => `<p><b>${i + 1}. ${q}</b></p>` +
    o.map((t, j) => `<button class="opt" onclick="ans(${i},${j})">${t}</button>`).join('') + `<p id="f${i}"></p>`).join('');
}

// ---------- VARIABEL SIMULASI ----------
let W = 900, SC = 700;
const H = 752, SH = 380;          // tinggi kanvas dan tinggi area simulasi
let ball, t, run, nCol, hist, clog = [], flash = [];

function setup() {
  buildUI();
  W = Math.min(900, $('cv').clientWidth || 900);
  SC = Math.min(700, W / 1.5);    // piksel per meter
  createCanvas(W, H).parent('cv');
  reset();
}

function P() { // parameter saat ini (satuan SI)
  return {
    L: [val('L1') / 100, val('L2') / 100],
    m: [val('m1') / 1000, val('m2') / 1000],
    r: [0.012 + val('m1') * 0.00016, 0.012 + val('m2') * 0.00016],
    e: val('e'), c: val('c'), g: +$('gv').value
  };
}

function reset() {
  ball = [{ th: -val('t1') * Math.PI / 180, w: 0 }, { th: val('t2') * Math.PI / 180, w: 0 }];
  t = 0; nCol = 0; hist = []; clog = []; flash = []; run = false;
  $('go').textContent = '▶ Mulai';
  renderLog();
}

function toggle() {
  run = !run;
  $('go').textContent = run ? '⏸ Jeda' : '▶ Mulai';
}

function kick() { // tambahan energi dari "tangan"
  const p = P();
  ball.forEach((b, i) => {
    const d = b.w ? Math.sign(b.w) : (i ? -1 : 1);
    b.w = b.w * 1.25 + d * 0.8 * Math.sqrt(p.g / p.L[i]);
  });
  if (!run) toggle();
}

// ---------- FISIKA ----------
const pos = (i, p) => ({ x: p.L[i] * Math.sin(ball[i].th), y: p.L[i] * Math.cos(ball[i].th) });
const snap = p => ball.map((b, i) => p.L[i] * b.w);                          // kecepatan tangensial (m/s)
const mom = (v, p) => (p.m[0] * v[0] + p.m[1] * v[1]) * 1000;                 // g·m/s
const ek = (v, p) => (0.5 * p.m[0] * v[0] ** 2 + 0.5 * p.m[1] * v[1] ** 2) * 1000; // mJ

function energy(p) {
  let E = 0;
  ball.forEach((b, i) => {
    E += p.m[i] * p.g * p.L[i] * (1 - Math.cos(b.th)) + 0.5 * p.m[i] * (p.L[i] * b.w) ** 2;
  });
  return E * 1000;
}

function step(dt, p) { // semi-implicit Euler
  ball.forEach((b, i) => {
    b.w += (-(p.g / p.L[i]) * Math.sin(b.th) - p.c * b.w) * dt;
    b.th += b.w * dt;
  });
  collide(p);
  t += dt;
}

function collide(p) {
  const a = pos(0, p), b = pos(1, p);
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), R = p.r[0] + p.r[1];
  if (d >= R || d < 1e-9) return;
  const n = [dx / d, dy / d];                                          // normal tumbukan
  const nt = ball.map(q => n[0] * Math.cos(q.th) - n[1] * Math.sin(q.th)); // n · t_i
  const vn = p.L[1] * ball[1].w * nt[1] - p.L[0] * ball[0].w * nt[0];  // kecepatan relatif sepanjang n

  if (vn < 0) { // saling mendekat -> impuls J (tali menahan komponen lain)
    const before = snap(p);
    const k = nt[1] ** 2 / p.m[1] + nt[0] ** 2 / p.m[0];
    const J = -(1 + p.e) * vn / k;
    ball[0].w -= J * nt[0] / (p.m[0] * p.L[0]);
    ball[1].w += J * nt[1] / (p.m[1] * p.L[1]);
    const after = snap(p);
    nCol++;
    clog.unshift({ n: nCol, t, b: before, a: after, pb: mom(before, p), pa: mom(after, p), dE: ek(after, p) - ek(before, p) });
    if (clog.length > 40) clog.pop();
    renderLog();
    flash.push({ x: W / 2 + (a.x + b.x) / 2 * SC, y: 36 + (a.y + b.y) / 2 * SC, a: 255 });
  }
  const o = (R - d) / 2; // pisahkan tumpang tindih
  ball[0].th -= o / p.L[0];
  ball[1].th += o / p.L[1];
}

function renderLog() {
  const f = x => x.toFixed(3);
  $('log').innerHTML = clog.length
    ? '<table><tr><th>#</th><th>t (s)</th><th>v₁</th><th>v₂</th><th>v₁′</th><th>v₂′</th><th>p</th><th>p′</th><th>ΔEk (mJ)</th></tr>' +
      clog.map(r => `<tr><td>${r.n}</td><td>${r.t.toFixed(2)}</td><td>${f(r.b[0])}</td><td>${f(r.b[1])}</td><td>${f(r.a[0])}</td><td>${f(r.a[1])}</td><td>${f(r.pb)}</td><td>${f(r.pa)}</td><td>${f(r.dE)}</td></tr>`).join('') + '</table>'
    : 'Belum ada tumbukan. Klik "Mulai" untuk menjalankan simulasi.';
}

// ---------- GAMBAR ----------
function draw() {
  const p = P();
  if (run) {
    const fd = Math.min(deltaTime / 1000, 0.033), n = Math.ceil(fd / 0.001);
    for (let i = 0; i < n; i++) step(fd / n, p);
    if (!hist.length || t - hist[hist.length - 1].t >= 0.02) {
      hist.push({ t, a: ball[0].th * 180 / Math.PI, b: ball[1].th * 180 / Math.PI, E: energy(p) });
      if (hist.length > 600) hist.shift();
    }
  }
  drawSim(p);
  graph(392, 170, 'Simpangan sudut θ(t) (°)', [[q => q.a, '#e5484d'], [q => q.b, '#d9a200']], -80, 80);
  const Em = Math.max(1, ...hist.map(q => q.E)) * 1.1;
  graph(574, 170, 'Energi mekanik total (mJ)', [[q => q.E, '#3b6cf6']], 0, Em);
  updateStats(p);
}

function drawSim(p) {
  background('#f8faff');
  const px = W / 2, py = 36, col = ['#e5484d', '#f2b705'];
  noStroke(); fill('#cbd3e6'); rect(px - 70, py - 14, 140, 10, 5);
  const q = [0, 1].map(i => pos(i, p));
  stroke(90); strokeWeight(1.5);
  q.forEach(s => line(px, py, px + s.x * SC, py + s.y * SC));
  noStroke();
  q.forEach((s, i) => {
    const x = px + s.x * SC, y = py + s.y * SC, r = p.r[i] * SC;
    fill(col[i]); circle(x, y, r * 2);
    fill(255, 255, 255, 120); circle(x - r * 0.3, y - r * 0.3, r * 0.7);
  });
  for (let i = flash.length - 1; i >= 0; i--) { // kilatan "klak"
    const f = flash[i];
    noFill(); stroke(255, 160, 0, f.a); strokeWeight(3);
    circle(f.x, f.y, 24 + (255 - f.a) / 6);
    f.a -= 14;
    if (f.a <= 0) flash.splice(i, 1);
  }
  if (!run) {
    noStroke(); fill(120); textSize(14); textAlign(CENTER, CENTER);
    text(t ? 'Dijeda' : 'Klik "Mulai" untuk memulai', W / 2, SH - 14);
  }
}

function graph(y, h, title, ser, lo, hi) {
  const x0 = 44, w = W - x0 - 12, t0 = Math.max(0, t - 10);
  fill(255); stroke(210); strokeWeight(1); rect(x0, y, w, h);
  noStroke(); fill(90); textSize(12); textAlign(LEFT, TOP); text(title, x0 + 6, y + 4);
  textAlign(RIGHT, CENTER); text(hi.toFixed(0), x0 - 4, y + 8); text(lo.toFixed(0), x0 - 4, y + h - 8);
  if (lo < 0 && hi > 0) { stroke(225); const zy = map(0, lo, hi, y + h, y); line(x0, zy, x0 + w, zy); }
  ser.forEach(([f, c]) => {
    noFill(); stroke(c); strokeWeight(2); beginShape();
    for (const s of hist) if (s.t >= t0) vertex(x0 + (s.t - t0) / 10 * w, constrain(map(f(s), lo, hi, y + h - 2, y + 2), y, y + h));
    endShape();
  });
  strokeWeight(1); noStroke(); fill(120); textAlign(RIGHT, BOTTOM);
  text('t: ' + t0.toFixed(0) + ' – ' + (t0 + 10).toFixed(0) + ' s', x0 + w - 4, y + h - 2);
}

function updateStats(p) {
  const v = snap(p), set = (i, x) => $(i).textContent = x;
  set('thR', (ball[0].th * 180 / Math.PI).toFixed(1));
  set('thY', (ball[1].th * 180 / Math.PI).toFixed(1));
  set('vR', v[0].toFixed(2)); set('vY', v[1].toFixed(2));
  set('tm', t.toFixed(2)); set('nc', nCol);
  set('en', energy(p).toFixed(2)); set('mo', mom(v, p).toFixed(2));
}
