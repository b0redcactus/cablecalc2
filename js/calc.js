/* Calculation engine for MSZ 13207:2020 cable sizing.
 *
 * Lookups are exact — keys are read literally from the dataset; no implicit interpolation.
 * If a combination is not present the function returns null and the UI shows "Nincs adat".
 */

(function () {

  // Map (insulation + voltage) → f1 group
  function f1Group(insulation, voltage) {
    if (insulation === 'XLPE' || insulation === 'PVC' || insulation === 'PE') return 'XLPE_PVC_PE';
    if (insulation === 'PAPER65') return 'PAPER_65';
    if (insulation === 'PAPER60') return 'PAPER_60';
    return null;
  }

  // Map insulation → f2 family key (XLPE | PE | PVC | PAPER)
  function f2Family(insulation) {
    if (insulation === 'XLPE') return 'XLPE';
    if (insulation === 'PE')   return 'PE';
    if (insulation === 'PVC')  return 'PVC';
    if (insulation === 'PAPER65' || insulation === 'PAPER60') return 'PAPER';
    return null;
  }

  // Map insulation → f3 group
  function f3Group(insulation) {
    if (insulation === 'XLPE') return 'XLPE_90';
    if (insulation === 'PVC' || insulation === 'PE') return 'PE_PVC_70';
    if (insulation === 'PAPER65') return 'PAPER_65';
    if (insulation === 'PAPER60') return 'PAPER_60';
    return null;
  }

  function lfKey(lf) {
    // Accept "0.5" or "0.50" — normalise to standard's keys: "0.50","0.60","0.70","0.85","1.00" (f1) and "0.5"…"1.0" (f2)
    const n = parseFloat(lf);
    if (isNaN(n)) return null;
    return n;
  }

  function getF1(insulation, voltage, soilTemp, rho, lf) {
    const grp = f1Group(insulation, voltage);
    if (!grp) return null;
    const tBucket = window.F1_DATA[grp][soilTemp];
    if (!tBucket) return null;
    const rhoBucket = tBucket[rho];
    if (!rhoBucket) return null;
    if ('any' in rhoBucket) return rhoBucket.any;
    // f1 LF keys are "0.50" / "0.60" / "0.70" / "0.85" / "1.00"
    const n = parseFloat(lf);
    const key = (n === 1) ? "1.00" : (n === 0.85) ? "0.85" : n.toFixed(2);
    if (key in rhoBucket) return rhoBucket[key];
    return null;
  }

  function getF2(arrangement, insulation, systems, rho, lf) {
    const fam = f2Family(insulation);
    if (!fam) return null;
    const tbl = window.F2_DATA[arrangement];
    if (!tbl) return null;
    const famTbl = tbl[fam];
    if (!famTbl) return null;
    const sysData = famTbl[parseInt(systems, 10)];
    if (!sysData) return null;
    const rhoData = sysData[rho];
    if (!rhoData) return null;
    const n = parseFloat(lf);
    const key = (n === 1) ? "1.0" : (n === 0.85) ? "0.85" : n.toFixed(1);
    if (key in rhoData) return rhoData[key];
    return null;
  }

  function getF3(insulation, airTemp) {
    const grp = f3Group(insulation);
    if (!grp) return null;
    const tbl = window.F3_DATA[grp];
    const t = parseInt(airTemp, 10);
    if (!(t in tbl)) return null;
    return tbl[t];
  }

  // Map cable-arrangement (UI) + cable-cores to F4 arrangement key
  function f4ArrKey(arrangement) {
    if (arrangement === 'three_core') return 'three_core_spaced'; // default to "spaced" (per Table 19.a, more common)
    if (arrangement === 'three_core_touching') return 'three_core_touching';
    if (arrangement === 'flat_7') return 'single_flat';
    if (arrangement === 'triangle_7' || arrangement === 'triangle_25') return 'single_trefoil';
    return null;
  }

  function getF4(arrangement, placement, systems) {
    const key = f4ArrKey(arrangement);
    if (!key) return null;
    const tbl = window.F4_DATA[key];
    if (!tbl) return null;
    const placeData = tbl[placement];
    if (!placeData) return null;
    // Clamp # systems to available bucket
    const n = parseInt(systems, 10) || 1;
    if (n in placeData) return placeData[n];
    // Use highest available key ≤ n
    const keys = Object.keys(placeData).map(k => parseInt(k, 10)).sort((a,b)=>a-b);
    let pick = null;
    for (const k of keys) { if (k <= n) pick = k; }
    return pick !== null ? placeData[pick] : null;
  }

  function lookupBaseAmpacity(opts) {
    // opts: { insulation, voltage, material, section, arrangement, installation }
    const { insulation, voltage, material, section, arrangement, installation } = opts;
    if (insulation === 'PAPER65' || insulation === 'PAPER60') {
      if (installation === 'soil') {
        const m = window.BASE_AMPACITY.Paper_soil[material];
        if (!m || !m[section]) return null;
        return m[section][voltage] || null;
      }
      return null; // air values for paper not included
    }
    if (insulation === 'XLPE' && (voltage === '6/10' || voltage === '12/20' || voltage === '18/30' || voltage === '20.8/36')) {
      const set = installation === 'soil' ? window.BASE_AMPACITY.XLPE_soil : window.BASE_AMPACITY.XLPE_air;
      const m = set && set[material];
      if (!m || !m[section]) return null;
      const v = m[section][voltage];
      if (!v) return null;
      const arrKey = (arrangement === 'flat_7') ? 'flat' : 'trefoil';
      return v[arrKey];
    }
    return null;
  }

  function computeLoadCurrent(U_V, P_kW, cosphi) {
    if (!U_V || !P_kW || !cosphi) return null;
    if (U_V <= 0 || P_kW <= 0 || cosphi <= 0) return null;
    return (P_kW * 1000) / (Math.sqrt(3) * U_V * cosphi);
  }

  function getImpedance(insulation, material, section, voltage, arrangement, useOperatingTemp) {
    const D = window.IMPEDANCE_DATA;
    let R = null;
    const sec = String(section).split('/')[0]; // for "150/25" → "150"
    if (useOperatingTemp) {
      if (insulation === 'XLPE') {
        R = D.Rop_XLPE[material] && D.Rop_XLPE[material][sec];
      } else if (insulation === 'PVC' || insulation === 'PE') {
        R = D.Rop_PVC_PE[material] && D.Rop_PVC_PE[material][sec];
      } else {
        R = D.R20[material] && D.R20[material][sec];
      }
    } else {
      R = D.R20[material] && D.R20[material][sec];
    }
    const isLV = (voltage === '0.6/1');
    const xGroup = isLV ? D.X.LV : D.X.MV;
    let X;
    if (arrangement === 'three_core') {
      X = isLV ? xGroup.three_core_trefoil : xGroup.three_core;
    } else if (arrangement === 'flat_7') {
      X = xGroup.single_flat;
    } else {
      X = xGroup.single_trefoil;
    }
    return { R: R || null, X: X || null };
  }

  function computeVoltageDrop(U_V, I_A, length_m, R, X, cosphi) {
    if (!U_V || !I_A || !length_m || R == null || X == null || !cosphi) return null;
    const L_km = length_m / 1000;
    const sinphi = Math.sqrt(Math.max(0, 1 - cosphi * cosphi));
    const dU = Math.sqrt(3) * I_A * L_km * (R * cosphi + X * sinphi);
    return { dU, percent: (dU / U_V) * 100 };
  }

  window.CALC = {
    getF1, getF2, getF3, getF4,
    lookupBaseAmpacity,
    computeLoadCurrent,
    computeVoltageDrop,
    getImpedance
  };
})();
