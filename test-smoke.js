// Smoke test — verify lookup logic returns expected values from MSZ 13207:2020.
global.window = global;
require('./data/f1.js');
require('./data/f2.js');
require('./data/f3f4.js');
require('./data/baseAmpacity.js');
require('./data/impedance.js');
require('./js/calc.js');

const tests = [
  // f1: XLPE/PVC/PE @ 20°C, ρ=1.0, LF=0.7 → 1.00 (the "normal conditions" base)
  { name: "f1 XLPE 20°C ρ=1.0 LF=0.70", got: CALC.getF1('XLPE','12/20','20','1.0','0.70'), want: 1.00 },
  { name: "f1 XLPE 5°C ρ=0.7 LF=0.50",  got: CALC.getF1('XLPE','12/20','5','0.7','0.50'), want: 1.24 },
  { name: "f1 Paper65 25°C ρ=2.5 any",  got: CALC.getF1('PAPER65','12/20','25','2.5','0.70'), want: 0.70 },
  // f2: triangle7, XLPE, 3 systems, ρ=1.0, LF=0.7
  { name: "f2 triangle7 XLPE 3sys ρ=1.0 LF=0.7", got: CALC.getF2('triangle_7','XLPE','3','1.0','0.70'), want: 0.75 },
  { name: "f2 triangle25 PE 1sys ρ=0.7 LF=0.5",  got: CALC.getF2('triangle_25','PE','1','0.7','0.50'), want: 1.01 },
  { name: "f2 flat7 PVC 5sys ρ=2.5 LF=1.0",      got: CALC.getF2('flat_7','PVC','5','2.5','1.00'), want: 0.55 },
  { name: "f2 three_core PAPER65 2sys ρ=1.0 LF=0.85", got: CALC.getF2('three_core','PAPER65','2','1.0','0.85'), want: 0.82 },
  // f3: XLPE 90°C, air 40°C → 0.91
  { name: "f3 XLPE air 40°C",  got: CALC.getF3('XLPE','40'), want: 0.91 },
  { name: "f3 PVC air 10°C",   got: CALC.getF3('PVC','10'), want: 1.22 },
  // f4: single_flat, 3 systems on tray 2 → 0.83
  { name: "f4 single_flat tray_2 3sys",     got: CALC.getF4('flat_7','tray_2','3'), want: 0.83 },
  { name: "f4 three_core spaced perf_3 6",  got: CALC.getF4('three_core','perf_3','6'), want: 0.89 },
  // Base ampacity: XLPE 240/25 Cu 12/20 kV trefoil in soil = 532
  { name: "BaseAmp XLPE 240/25 Cu 12/20 trefoil soil", got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'12/20',material:'Cu',section:'240/25',arrangement:'triangle_7',installation:'soil'}), want: 532 },
  { name: "BaseAmp XLPE 150/25 Al 6/10 flat air", got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'6/10',material:'Al',section:'150/25',arrangement:'flat_7',installation:'air'}), want: 384 },
  { name: "BaseAmp Paper 95mm² Cu 18/30 soil",   got: CALC.lookupBaseAmpacity({insulation:'PAPER65',voltage:'18/30',material:'Cu',section:'95',arrangement:'triangle_7',installation:'soil'}), want: 287 },
  // Load current: P=500kW, U=22000V, cosφ=0.95 → 13.81 A
  { name: "I load 500 kW 22 kV cosφ=0.95", got: CALC.computeLoadCurrent(22000, 500, 0.95).toFixed(2), want: '13.81' },
  // Voltage drop: 22kV system, 100A, 1km, R=0.193, X=0.105, cosφ=0.95 → ΔU = √3 × 100 × 1 × (0.193·0.95 + 0.105·0.312) ≈ 37.40 V
  { name: "ΔU 22kV 100A 1km", got: CALC.computeVoltageDrop(22000,100,1000,0.193,0.105,0.95).dU.toFixed(2), want: '37.42' }
];

// ─────────────────────────────────────────────────────────────────────────────
// Parallel-cable ("trönk kábel") scenario.
// 20 MW load on a 22 kV bus, cos φ = 1.0 → I_load ≈ 524.86 A.
// Single cable: Al 240/25 XLPE 12/20 kV in soil, trefoil, normal conditions
//   (20 °C, ρ=1.0, LF=0.7, 1 system). Per MSZ 13207 Table 7.a, base = 417 A;
//   f1 = 1.00, f2 = 1.00 at the reference conditions, no conduit
//   → per-cable ampacity = 417 A.
// 1 cable: 417 A  < 524.9 A  → inadequate.
// 2 cables: 834 A ≥ 524.9 A → adequate.
// 3 cables: 1251 A ≥ 524.9 A → adequate.
// ─────────────────────────────────────────────────────────────────────────────
const base   = CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'12/20',material:'Al',section:'240/25',arrangement:'triangle_7',installation:'soil'});
const f1     = CALC.getF1('XLPE','12/20','20','1.0','0.70');
const f2     = CALC.getF2('triangle_7','XLPE','1','1.0','0.70');
const iN_one = base * f1 * f2 * 1.0;
const iLoad  = CALC.computeLoadCurrent(22000, 20000, 1.0);

tests.push(
  { name: "Parallel: base Al 240/25 XLPE 12/20 trefoil soil",  got: base, want: 417 },
  { name: "Parallel: f1·f2 at normal (20°C, ρ=1.0, LF=0.7)",   got: (f1 * f2).toFixed(2), want: '1.00' },
  { name: "Parallel: per-cable ampacity",                       got: iN_one.toFixed(1), want: '417.0' },
  { name: "Parallel: I_load (20 MW @ 22 kV, cos φ=1.0)",        got: iLoad.toFixed(1), want: '524.9' },
  { name: "Parallel N=1 → I_N_total = 1 × 417 = inadequate",   got: (iN_one * 1 >= iLoad), want: false },
  { name: "Parallel N=2 → I_N_total = 2 × 417 = 834 A adequate",got: (iN_one * 2 >= iLoad), want: true },
  { name: "Parallel N=2 ΔU divided by 2",                       got: (CALC.computeVoltageDrop(22000, iLoad, 500, 0.161, 0.105, 1.0).dU / 2).toFixed(2),
                                                                want: (CALC.computeVoltageDrop(22000, iLoad, 500, 0.161, 0.105, 1.0).dU / 2).toFixed(2) }
);

// ─────────────────────────────────────────────────────────────────────────────
// LV (0,6/1 kV) base ampacity — Tables 8, 9, 10, 11. The user's specific bug report:
// "PVC 240 mm² → Nincs adat". Verify all four LV tables return non-null for arrangements
// `three_core` (→ multi-core unsc, Col 2) and `flat_7` (→ single-core unsc, Col 3).
// ─────────────────────────────────────────────────────────────────────────────
tests.push(
  // Table 8 — PVC 0,6/1 kV soil, three-core unscreened (Col 1) = the user's bug case
  { name: "LV PVC 240 Cu soil 3-core unsc",        got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Cu',section:'240',arrangement:'three_core',installation:'soil',screening:'no'}), want: 473 },
  { name: "LV PVC 240 Al soil 3-core unsc",        got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Al',section:'240',arrangement:'three_core',installation:'soil',screening:'no'}), want: 364 },
  // Same cable but screened version (NYCWY) → Col 3
  { name: "LV PVC 240 Cu soil 3-core SCREENED",    got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Cu',section:'240',arrangement:'three_core',installation:'soil',screening:'yes'}), want: 463 },
  // Trefoil (single-core, 3 loaded) unscreened = Col 2
  { name: "LV PVC 95 Cu soil trefoil unsc",        got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Cu',section:'95',arrangement:'triangle_7',installation:'soil',screening:'no'}), want: 286 },
  // Trefoil screened = Col 4
  { name: "LV PVC 95 Cu soil trefoil SCREENED",    got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Cu',section:'95',arrangement:'triangle_7',installation:'soil',screening:'yes'}), want: 281 },
  // Table 9 — PVC 0,6/1 kV air
  { name: "LV PVC 95 Cu air 3-core unsc",          got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Cu',section:'95',arrangement:'three_core',installation:'air',screening:'no'}), want: 246 },
  { name: "LV PVC 150 Al air 3-core unsc",         got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Al',section:'150',arrangement:'three_core',installation:'air',screening:'no'}), want: 246 },
  // Table 10 — XLPE 0,6/1 kV soil
  { name: "LV XLPE 240 Cu soil 3-core unsc",       got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'0.6/1',material:'Cu',section:'240',arrangement:'three_core',installation:'soil',screening:'no'}), want: 517 },
  { name: "LV XLPE 95 Al soil trefoil unsc",       got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'0.6/1',material:'Al',section:'95',arrangement:'triangle_7',installation:'soil',screening:'no'}), want: 238 },
  // Table 11 — XLPE 0,6/1 kV air
  { name: "LV XLPE 240 Cu air trefoil unsc",       got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'0.6/1',material:'Cu',section:'240',arrangement:'triangle_7',installation:'air',screening:'no'}), want: 604 },
  { name: "LV XLPE 50 Al air 3-core unsc",         got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'0.6/1',material:'Al',section:'50',arrangement:'three_core',installation:'air',screening:'no'}), want: 149 },
  // LV flat_7 is NOT tabulated by the standard — must return null
  { name: "LV PVC 95 Cu soil flat → null",         got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Cu',section:'95',arrangement:'flat_7',installation:'soil',screening:'no'}), want: null },
  // Al not manufactured in small sections
  { name: "LV PVC 1.5 Al soil → null",             got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'0.6/1',material:'Al',section:'1.5',arrangement:'three_core',installation:'soil',screening:'no'}), want: null },
  // PVC 3,6/6 kV not tabulated
  { name: "PVC 3.6/6 kV not tabulated → null",     got: CALC.lookupBaseAmpacity({insulation:'PVC',voltage:'3.6/6',material:'Cu',section:'240',arrangement:'three_core',installation:'soil',screening:'no'}), want: null },
  // MV XLPE 7.a/7.b only have trefoil + flat; three_core MV must return null
  { name: "MV XLPE 240/25 three_core → null",      got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'12/20',material:'Cu',section:'240/25',arrangement:'three_core',installation:'soil',screening:'no'}), want: null },
  // MV trefoil and flat both work (and ignore screening)
  { name: "MV XLPE 240/25 Cu trefoil soil",        got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'12/20',material:'Cu',section:'240/25',arrangement:'triangle_7',installation:'soil',screening:'no'}), want: 532 },
  { name: "MV XLPE 240/25 Cu flat soil",           got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'12/20',material:'Cu',section:'240/25',arrangement:'flat_7',installation:'soil',screening:'no'}), want: 568 },
  // 7 vs 25 cm spacing both map to "trefoil" base — only f2 cares about distance
  { name: "MV XLPE triangle_25 = triangle_7 base", got: CALC.lookupBaseAmpacity({insulation:'XLPE',voltage:'12/20',material:'Cu',section:'240/25',arrangement:'triangle_25',installation:'soil',screening:'no'}), want: 532 }
);

let pass = 0, fail = 0;
tests.forEach(t => {
  const ok = (t.got === t.want) || (Math.abs(parseFloat(t.got)-parseFloat(t.want)) < 0.05);
  if (ok) { console.log('✓ ' + t.name + ' = ' + t.got); pass++; }
  else    { console.log('✗ ' + t.name + ' got=' + t.got + ' want=' + t.want); fail++; }
});
console.log(`\n${pass}/${pass+fail} tests passed`);
process.exit(fail ? 1 : 0);
