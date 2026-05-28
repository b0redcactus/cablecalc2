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

let pass = 0, fail = 0;
tests.forEach(t => {
  const ok = (t.got === t.want) || (Math.abs(parseFloat(t.got)-parseFloat(t.want)) < 0.05);
  if (ok) { console.log('✓ ' + t.name + ' = ' + t.got); pass++; }
  else    { console.log('✗ ' + t.name + ' got=' + t.got + ' want=' + t.want); fail++; }
});
console.log(`\n${pass}/${pass+fail} tests passed`);
process.exit(fail ? 1 : 0);
