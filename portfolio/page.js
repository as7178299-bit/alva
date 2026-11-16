class Component extends DCLogic {
componentDidMount() { this.revTimer = setInterval(() => { if (!this.revHover) { const st = this.state || {}; this.setState({ rev: ((st.rev || 0) + 1) % 5 }); } }, 6000);
this.panCss = document.createElement('style'); document.head.appendChild(this.panCss);
this.trackPan = () => { this.panQ = false; const el = document.querySelector('.dpan'); if (!el) return; const r = el.getBoundingClientRect(); const vh = window.innerHeight || document.documentElement.clientHeight || 800;
let p = (vh * 0.95 - r.top) / (vh * 0.6); p = Math.max(0, Math.min(1, p)); const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
const sc = 1.34 - 0.30 * e; const ox = 88 - 38 * e; const oy = 60 - 4 * e; const k = (sc - 1).toFixed(3);
if (k === this.panK && ox.toFixed(1) === this.panO) return; this.panK = k; this.panO = ox.toFixed(1);
this.panCss.textContent = '.dpan img{transform-origin:' + ox.toFixed(1) + '% ' + oy.toFixed(1) + '% !important;transform:scale(' + sc.toFixed(3) + ') !important}'; };
this.trkCss = document.createElement('style'); document.head.appendChild(this.trkCss); this.roadCss = document.createElement('style'); document.head.appendChild(this.roadCss); this.trkDist = 0; this.trkPrev = null; this.trkFace = 1;
this.trackTrk = () => { const st = document.querySelector('.dsteps'); if (!st) return; const r = st.getBoundingClientRect(); const vh = window.innerHeight || document.documentElement.clientHeight || 800; const mob = window.innerWidth <= 760;
const steps = [...st.querySelectorAll('.dstep')]; const pts = steps.map((sp) => { const d = sp.querySelector('.ddot').getBoundingClientRect(); return [(d.left + d.right) / 2 - r.left, (d.top + d.bottom) / 2 - r.top]; });
if (!pts.length) return; const key = pts.map((q) => q.map(Math.round).join(':')).join(',') + '|' + Math.round(r.height) + '|' + mob;
if (key !== this.roadKey) { this.roadKey = key; const P = []; const add = (x, y) => P.push([x, y]); const x0 = pts[0][0];
  for (let q = 0; q <= 8; q++) add(x0, pts[0][1] * q / 8);
  for (let k = 0; k + 1 < pts.length; k++) { const [ax, ay] = pts[k], [bx, by] = pts[k + 1]; const c = (by - ay) * 0.55;
    for (let q = 1; q <= 40; q++) { const t = q / 40, u = 1 - t; add(u * u * u * ax + 3 * u * u * t * ax + 3 * u * t * t * bx + t * t * t * bx, u * u * u * ay + 3 * u * u * t * (ay + c) + 3 * u * t * t * (by - c) + t * t * t * by); } }
  const lx = pts[pts.length - 1][0]; const ly = pts[pts.length - 1][1]; for (let q = 1; q <= 8; q++) add(lx, ly + (r.height - ly) * q / 8);
  this.road = P; const d = 'M' + P.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L');
  this.roadCss.textContent = mob ? '' : '.droad-p,.droad-e{d:path("' + d + '")}'; }
const P = this.road; const target = vh * 0.52 - r.top; let i = 0; while (i < P.length - 1 && P[i + 1][1] < target) i++;
let x, y, tx = 0, ty = 1; if (mob) { x = r.width - 29; y = Math.max(30, Math.min(r.height - 30, target)); } else { const A = P[i], B = P[Math.min(i + 1, P.length - 1)]; const f = B[1] > A[1] ? Math.max(0, Math.min(1, (target - A[1]) / (B[1] - A[1]))) : 0; x = A[0] + (B[0] - A[0]) * f; y = A[1] + (B[1] - A[1]) * f; tx = B[0] - A[0]; ty = B[1] - A[1]; }
let mv = false; if (this.trkPrev != null) { const dd = Math.hypot(x - this.trkPrev[0], y - this.trkPrev[1]); if (dd > 0.5) { this.trkDist += dd; mv = true; const sd = y >= this.trkPrev[1] ? 1 : -1; const hx = tx * sd; if (Math.abs(tx) > 1.2) this.trkFace = hx > 0 ? -1 : 1; } } this.trkPrev = [x, y]; if (!this.trkFace) this.trkFace = 1;
const nl = Math.hypot(tx, ty) || 1; const tilt = mob ? 0 : Math.max(-10, Math.min(10, 10 * Math.abs(tx) / nl)) * (this.trkFace < 0 ? 1 : -1);
const W = mob ? 48 : 84; const sc = W / 120; const rw = -this.trkDist / (25 * sc) * 57.3 * 0.8, fw = -this.trkDist / (13 * sc) * 57.3 * 0.8;
let lit = ''; let dusk = false; steps.forEach((sp, k) => { if (y >= pts[k][1] - 24) { lit += '.dsteps>.dstep:nth-child(' + ([...st.children].indexOf(sp) + 1) + ')'; lit += ','; if (sp.classList.contains('dstep-night') || k >= steps.length - 2) dusk = true; } });
lit = lit ? lit.replace(/,$/, '') : '';
const litCss = lit ? lit.split(',').map((q) => q + ' .dcard{filter:none;opacity:1}' + q + ' .ddot{filter:none}').join('') : '';
this.trkCss.textContent = '.dtrk{transform:translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) !important}.dtrk-in{transform:rotate(' + tilt.toFixed(1) + 'deg) scaleX(' + this.trkFace + ') !important}.dtrk .rw{transform:rotate(' + rw.toFixed(1) + 'deg)}.dtrk .fw{transform:rotate(' + fw.toFixed(1) + 'deg)}' + (mv ? '.dtrk .tb{animation-play-state:running}' : '') + (dusk ? '.dtrk .beam{opacity:1}' : '') + litCss;
clearTimeout(this.trkStop); if (mv) this.trkStop = setTimeout(() => { this.trackTrk(); }, 260); };
this.onScrollTrac = () => { if (this.panQ) return; this.panQ = true; requestAnimationFrame(() => { this.trackPan(); this.trackTrk(); }); };
document.addEventListener('scroll', this.onScrollTrac, { passive: true, capture: true }); window.addEventListener('resize', this.onScrollTrac);
this.tracHookT = setTimeout(() => { this.trackPan(); this.trackTrk(); }, 300); this.tracFallback = setInterval(() => { this.trackPan(); }, 1200);
}
componentWillUnmount() { this.stopSound(); clearInterval(this.revTimer); clearTimeout(this.tracHookT); clearInterval(this.tracFallback); document.removeEventListener('scroll', this.onScrollTrac, true); window.removeEventListener('resize', this.onScrollTrac); if (this.panCss) this.panCss.remove(); if (this.trkCss) this.trkCss.remove(); if (this.roadCss) this.roadCss.remove(); clearTimeout(this.trkStop); }
noiseBuf(ctx, brown) {
const len = ctx.sampleRate * 4; const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0); let last = 0;
for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else { d[i] = w; } }
return buf;
}
loopNoise(ctx, buf, type, freq, q, gain, lfoRate, lfoDepth) {
const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
const g = ctx.createGain(); g.gain.value = gain;
const lfo = ctx.createOscillator(); lfo.frequency.value = lfoRate; const lg = ctx.createGain(); lg.gain.value = lfoDepth; lfo.connect(lg); lg.connect(g.gain); lfo.start();
src.connect(f); f.connect(g); g.connect(this.master); src.start();
}
chirp(t, f0, pan) {
const ctx = this.ctx; const o = ctx.createOscillator(); const g = ctx.createGain(); const p = ctx.createStereoPanner(); p.pan.value = pan;
o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, t + 0.05); o.frequency.exponentialRampToValueAtTime(f0 * 0.9, t + 0.11);
g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
o.connect(g); g.connect(p); p.connect(this.master); o.start(t); o.stop(t + 0.15);
}
cricket(t, pan) {
const ctx = this.ctx; const o = ctx.createOscillator(); const g = ctx.createGain(); const p = ctx.createStereoPanner(); p.pan.value = pan;
o.type = 'sine'; o.frequency.value = 4400 + Math.random() * 500; g.gain.setValueAtTime(0, t);
for (let k = 0; k < 4; k++) { const s = t + k * 0.055; g.gain.setValueAtTime(0.035, s); g.gain.setValueAtTime(0, s + 0.03); }
o.connect(g); g.connect(p); p.connect(this.master); o.start(t); o.stop(t + 0.3);
}
scheduleLife() {
if (!this.ctx) return;
const night = !!(this.state && this.state.night); const t = this.ctx.currentTime + 0.05;
if (night) { const pan = Math.random() * 1.6 - 0.8; const reps = 2 + Math.floor(Math.random() * 3); for (let r = 0; r < reps; r++) this.cricket(t + r * 0.45, pan); }
else { const f0 = 2300 + Math.random() * 1600; const pan = Math.random() * 1.6 - 0.8; const n = 2 + Math.floor(Math.random() * 4); for (let k = 0; k < n; k++) this.chirp(t + k * (0.16 + Math.random() * 0.06), f0 * (1 + (Math.random() - 0.5) * 0.15), pan); }
this.lifeTimer = setTimeout(() => this.scheduleLife(), night ? 700 + Math.random() * 1400 : 1400 + Math.random() * 3800);
}
startSound() {
const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
const ctx = new AC(); this.ctx = ctx;
this.master = ctx.createGain(); this.master.gain.setValueAtTime(0, ctx.currentTime); this.master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2); this.master.connect(ctx.destination);
const brown = this.noiseBuf(ctx, true); const white = this.noiseBuf(ctx, false);
this.loopNoise(ctx, brown, 'lowpass', 800, 0.4, 0.05, 0.12, 0.012);
this.loopNoise(ctx, white, 'bandpass', 1700, 0.7, 0.004, 0.2, 0.002);
this.bubbleBus = ctx.createBiquadFilter(); this.bubbleBus.type = 'lowpass'; this.bubbleBus.frequency.value = 2400; this.bubbleBus.connect(this.master);
this.scheduleBubbles();
this.scheduleLife();

}
startEngine() {
const ctx = this.ctx; if (!ctx) return;
const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 38;
const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 19;
const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; lp.Q.value = 3;
const am = ctx.createGain(); am.gain.value = 0.5;
const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 9.5; const lfoG = ctx.createGain(); lfoG.gain.value = 0.45; lfo.connect(lfoG); lfoG.connect(am.gain);
const g = ctx.createGain(); g.gain.value = 0;
o.connect(lp); o2.connect(lp); lp.connect(am); am.connect(g); g.connect(this.master);
o.start(); o2.start(); lfo.start();
this.eng = { g, o, o2, lfo, lp };
this.updateEngine();
}
updateEngine() {
if (!this.eng || !this.ctx) return;
const v = this.tracVis || 0; const sp = Math.min(1, this.tracSpeed || 0); const t = this.ctx.currentTime;
this.eng.g.gain.setTargetAtTime(v * (0.09 + 0.09 * sp), t, 0.25);
this.eng.o.frequency.setTargetAtTime(38 + sp * 14, t, 0.3); this.eng.o2.frequency.setTargetAtTime(19 + sp * 7, t, 0.3);
this.eng.lfo.frequency.setTargetAtTime(9.5 + sp * 5, t, 0.3); this.eng.lp.frequency.setTargetAtTime(180 + sp * 160, t, 0.3);
}
bubble(t) {
const ctx = this.ctx; const o = ctx.createOscillator(); const g = ctx.createGain(); const p = ctx.createStereoPanner(); p.pan.value = Math.random() * 1.2 - 0.6;
const f = 420 + Math.random() * 900; const dur = 0.03 + Math.random() * 0.05; const peak = 0.006 + Math.random() * 0.014;
o.type = 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (1.4 + Math.random() * 0.5), t + dur);
g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
o.connect(g); g.connect(p); p.connect(this.bubbleBus); o.start(t); o.stop(t + dur + 0.02);
}
scheduleBubbles() {
if (!this.ctx) return;
const t = this.ctx.currentTime + 0.02; const n = 1 + Math.floor(Math.random() * 3);
for (let k = 0; k < n; k++) this.bubble(t + Math.random() * 0.06);
this.bubbleTimer = setTimeout(() => this.scheduleBubbles(), 45 + Math.random() * 110);
}
stopSound() {
clearTimeout(this.lifeTimer); clearTimeout(this.bubbleTimer);
const ctx = this.ctx; if (!ctx) return; this.ctx = null; this.eng = null;
try { this.master.gain.cancelScheduledValues(ctx.currentTime); this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime); this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6); } catch (e) {}
setTimeout(() => { try { ctx.close(); } catch (e) {} }, 800);
}
renderVals() {
const s = this.state || {};
const tracCls = s.tracOn ? 'ts-on' : '';
const night = !!s.night; const sound = !!s.sound;
const rnd = (i, k) => { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
const stars = Array.from({ length: 46 }, (_, i) => ({ x: (rnd(i, 1) * 100).toFixed(1), y: (rnd(i, 2) * 55).toFixed(1), size: (1 + rnd(i, 3) * 2.2).toFixed(1), t: (2 + rnd(i, 4) * 3).toFixed(1), d: (-rnd(i, 5) * 4).toFixed(1) }));
const flies = Array.from({ length: 28 }, (_, i) => ({ x: (rnd(i, 6) * 96 + 2).toFixed(1), y: (40 + rnd(i, 7) * 55).toFixed(1), t: (5 + rnd(i, 8) * 6).toFixed(1), d: (-rnd(i, 9) * 6).toFixed(1), dx: Math.round((rnd(i, 10) - 0.5) * 220), dy: Math.round((rnd(i, 11) - 0.5) * 160) }));
const LS = ['img/leaf-L0.webp', 'img/leaf-L6.webp', 'img/leaf-L2.webp', 'img/leaf-L0.webp', 'img/leaf-L7.webp', 'img/leaf-L6.webp'];
const leaves = Array.from({ length: 12 }, (_, i) => { const depth = rnd(i, 17); return { x: (rnd(i, 12) * 100).toFixed(1), t: (10 + (1 - depth) * 10 + rnd(i, 13) * 4).toFixed(1), d: (-rnd(i, 14) * 20).toFixed(1), dx: Math.round((rnd(i, 15) - 0.5) * 360), r: Math.round(90 + rnd(i, 16) * 300), size: Math.round(14 + depth * 24), blur: depth > 0.82 ? 2 : (depth < 0.2 ? 1 : 0), op: (0.75 + depth * 0.25).toFixed(2), s: (2.6 + rnd(i, 18) * 2.4).toFixed(1), src: LS[i % LS.length] }; });
const U = [
{ id: 'suite', name: 'סוויטת היער', week: 1190, wkend: 1490, max: 2 },
{ id: 'cabin', name: 'בקתת עץ', week: 1450, wkend: 1850, max: 5 },
{ id: 'villa', name: 'וילת הנוף', week: 3600, wkend: 4600, max: 12 }
];
const unitId = s.unit || 'cabin';
const u = U.find((x) => x.id === unitId);
const nights = s.nights ?? 2;
const guests = Math.min(s.guests ?? 2, u.max);
const weekend = !!s.weekend;
const breakfast = s.breakfast ?? true;
const fmt = (n) => n.toLocaleString('he-IL');
const rate = weekend ? u.wkend : u.week;
const lodging = rate * nights;
const bf = breakfast ? 95 * guests * nights : 0;
const total = lodging + bf;
const openIdx = s.open ?? -1;
const rev = (s.rev || 0) % 5;
const R = [
{ initial: 'כ', who: 'משפחת כהן · בני ברק', unit: 'בקתת עץ · 3 לילות', text: 'הגענו עייפים מהשנה והרגשנו כבר בשער שמשהו משתחרר. הבקתה מבריקה מניקיון, הילדים לא יצאו מהבריכה, ובערב ישבנו על המרפסת ושמענו רק צרצרים ואת הנחל. נחזור בעזרת ה׳.' },
{ initial: 'ל', who: 'הזוג לוי · ירושלים', unit: 'סוויטת היער · 2 לילות', text: 'נסענו לחגוג יום נישואין וקיבלנו בדיוק את מה שחיפשנו: שקט. הג׳קוזי מול צמרות העצים, נדנדת הביצה עם כוס קפה בבוקר, וארוחת בוקר נדיבה שהגיעה עד לדק. פרטיות מלאה.' },
{ initial: 'פ', who: 'משפחת פרידמן · מודיעין עילית', unit: 'וילת הנוף · שבת', text: 'עשינו שבת משפחתית עם הסבא והסבתא והנכדים — 11 נפשות. הכול חיכה מוכן: פלטה, מיחם, שעוני שבת מכוונים, והמגשים הגיעו חמים ובזמן. בית הכנסת קרוב והמניין נעים. שבת שלא נשכח.' },
{ initial: 'ש', who: 'משפחת שפירא · אלעד', unit: 'בקתת עץ · 4 לילות', text: 'מסלול המפלים היה ההצלחה הגדולה של החופשה — הילדים קיבלו מפה ותיק פיקניק והרגישו כמו חוקרים. הצוות סבלני ונעים, וחצר המשחקים המגודרת נתנה לנו לנשום רגע.' },
{ initial: 'ר', who: 'אברהם ר. · אורח חוזר', unit: 'סוויטת היער · ביקור שלישי', text: 'זו הפעם השלישית שלי כאן, ובכל פעם אני מגלה פינה חדשה בשבילים. מה שמחזיר אותי זה השקט האמיתי והיחס האישי — מקבלים אותך כמו בן בית.' }
];
const F = [
{ q: 'מתי אפשר להגיע ומתי עוזבים?', a: 'הכניסה מ־15:00 והעזיבה עד 11:00. בימי שישי ובמוצאי שבת אפשר לתאם מראש שעות גמישות.' },
{ q: 'האם המקום מתאים לשומרי שבת?', a: 'בהחלט. בכל יחידה יש פלטה, מיחם ושעוני שבת, בית הכנסת במרחק הליכה קצר, ואפשר להזמין מראש מגשי אוכל כשר לשבת.' },
{ q: 'האם יש שעות נפרדות בבריכה?', a: 'כן. הבריכה פועלת בשעות נפרדות לגברים ולנשים, ולוח השעות המלא נשלח אליכם לפני ההגעה.' },
{ q: 'האם אפשר להגיע עם ילדים?', a: 'בשמחה. בקתות העץ והווילה מתאימות למשפחות, ויש חצר משחקים מגודרת ומוצלת. סוויטת היער מיועדת לזוגות.' },
{ q: 'מה מדיניות הביטול?', a: 'ביטול עד 14 יום לפני ההגעה — ללא עלות. בין 14 ל־7 ימים לפני ההגעה יחויבו 50%, ובשבוע האחרון התשלום מלא.' }
];
return {
tracCls,
swingClass: (s.push || 0) === 0 ? '' : ((s.push % 2) ? 'swing-a' : 'swing-b'),
swingKey: 'sw' + (s.push || 0),
pushSwing: () => this.setState({ push: (s.push || 0) + 1 }),
night: night,
day: !night,
stars: stars,
flies: flies,
leaves: leaves,
nightDark: night ? 0.72 : 0,
nightTint: night ? 0.45 : 0,
nightPressed: night ? 'true' : 'false',
nightLabel: night ? 'חזרה ליום' : 'לילה בעלווה',
toggleNight: () => this.setState({ night: !night }),
soundPressed: sound ? 'true' : 'false',
soundLabel: sound ? 'השתקת הטבע' : 'צלילי הטבע',
soundBg: sound ? '#e8b04b' : 'rgba(255,253,243,.14)',
soundFg: sound ? '#1c2b1f' : '#fffdf3',
eqClass: sound ? 'eq-on' : '',
toggleSound: () => { if (sound) { this.stopSound(); } else { this.startSound(); } this.setState({ sound: !sound }); },
heroMove: (e) => { const el = e.currentTarget; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height; el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y * 100).toFixed(1) + '%'); el.style.setProperty('--px', ((x - 0.5) * 2).toFixed(3)); el.style.setProperty('--py', ((y - 0.5) * 2).toFixed(3)); },
units: U.map((x) => ({
name: x.name,
pressed: x.id === unitId ? 'true' : 'false',
bg: x.id === unitId ? '#1f4d2b' : '#fffdf3',
fg: x.id === unitId ? '#fffdf3' : '#1f4d2b',
pick: () => this.setState({ unit: x.id, guests: Math.min(guests, x.max) })
})),
nights: nights,
guests: guests,
maxGuests: u.max,
unitName: u.name,
rateText: fmt(rate),
lodgingText: fmt(lodging),
breakfastText: fmt(bf),
totalText: fmt(total),
incN: () => this.setState({ nights: Math.min(nights + 1, 14) }),
decN: () => this.setState({ nights: Math.max(nights - 1, 1) }),
incG: () => this.setState({ guests: Math.min(guests + 1, u.max) }),
decG: () => this.setState({ guests: Math.max(guests - 1, 1) }),
toggleWeekend: () => this.setState({ weekend: !weekend }),
toggleBreakfast: () => this.setState({ breakfast: !breakfast }),
weekendPressed: weekend ? 'true' : 'false',
weekendBg: weekend ? '#3f7f4e' : '#fffdf3',
weekendFg: weekend ? '#fffdf3' : '#3f7f4e',
weekendLabel: weekend ? '✓ סוף שבוע / חג' : 'סוף שבוע / חג',
breakfastPressed: breakfast ? 'true' : 'false',
breakfastBg: breakfast ? '#3f7f4e' : '#fffdf3',
breakfastFg: breakfast ? '#fffdf3' : '#3f7f4e',
breakfastLabel: breakfast ? '✓ ארוחת בוקר (95 ₪ לאורח)' : 'ארוחת בוקר (95 ₪ לאורח)',
reviews: R.map((r) => ({ text: r.text, who: r.who, unit: r.unit, initial: r.initial })),
revShift: rev * 100,
revDots: R.map((r, i) => ({ go: () => this.setState({ rev: i }), label: 'ביקורת ' + (i + 1), current: i === rev ? 'true' : 'false', w: i === rev ? 34 : 10, bg: i === rev ? '#1f4d2b' : '#9cc7a4' })),
revNext: () => this.setState({ rev: (rev + 1) % R.length }),
revPrev: () => this.setState({ rev: (rev - 1 + R.length) % R.length }),
revHoverOn: () => { this.revHover = true; },
revHoverOff: () => { this.revHover = false; },
faqs: F.map((f, i) => ({
q: f.q,
a: f.a,
isOpen: i === openIdx,
expanded: i === openIdx ? 'true' : 'false',
icon: i === openIdx ? '−' : '+',
iconBg: i === openIdx ? '#1f4d2b' : '#e9f3d8',
iconFg: i === openIdx ? '#fffdf3' : '#1f4d2b',
border: i === openIdx ? '#3f7f4e' : 'transparent',
toggle: () => this.setState({ open: i === openIdx ? -1 : i })
}))
};
}
}
mountPage(Component);
