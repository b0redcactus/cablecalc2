/* UI wiring for cablecalc-pro. */

(function () {
  const $ = (id) => document.getElementById(id);

  const LS_LANG = "cablecalc.lang";
  const LS_THEME = "cablecalc.theme";

  // Default language and theme from localStorage
  window.LANG = localStorage.getItem(LS_LANG) || "hu";
  document.documentElement.setAttribute("data-theme", localStorage.getItem(LS_THEME) || "light");

  // Cross-section options by insulation+voltage
  const SECTION_OPTIONS = {
    // MV XLPE — sections with built-in screen designation
    "XLPE:6/10":   ["95/16","120/16","150/25","185/25","240/25","300/25","400/35","500/35"],
    "XLPE:12/20":  ["95/16","120/16","150/25","185/25","240/25","300/25","400/35","500/35"],
    "XLPE:18/30":  ["95/16","120/16","150/25","185/25","240/25","300/25","400/35","500/35"],
    "XLPE:20.8/36":["95/16","150/25","240/25","400/35"],
    // LV XLPE / PVC / PE — IEC 60228 standard sections
    "XLPE:0.6/1":  ["1.5","2.5","4","6","10","16","25","35","50","70","95","120","150","185","240","300","400","500"],
    "PVC:0.6/1":   ["1.5","2.5","4","6","10","16","25","35","50","70","95","120","150","185","240","300","400","500"],
    "PVC:3.6/6":   ["10","16","25","35","50","70","95","120","150","185","240","300","400"],
    "PE:6/10":     ["25","35","50","70","95","120","150","185","240","300","400","500"],
    "PE:12/20":    ["25","35","50","70","95","120","150","185","240","300","400","500"],
    "PE:20.8/36":  ["95","120","150","185","240","300","400","500"],
    // Paper
    "PAPER65:6/10": ["25","35","50","70","95","120","150","185","240","300","400","500"],
    "PAPER65:12/20":["25","35","50","70","95","120","150","185","240","300","400","500"],
    "PAPER60:18/30":  ["35","50","70","95","120","150","185","240","300","400","500"],
    "PAPER60:20.8/36":["35","50","70","95","120","150","185","240","300","400","500"]
  };

  // Voltage options by insulation
  const VOLTAGE_OPTIONS = {
    XLPE: [
      {v:"0.6/1", lbl:"0,6/1 kV"},
      {v:"6/10",  lbl:"6/10 kV"},
      {v:"12/20", lbl:"12/20 kV"},
      {v:"18/30", lbl:"18/30 kV"},
      {v:"20.8/36", lbl:"20,8/36 kV"}
    ],
    PVC: [
      {v:"0.6/1", lbl:"0,6/1 kV"},
      {v:"3.6/6", lbl:"3,6/6 kV"}
    ],
    PE:  [
      {v:"6/10",  lbl:"6/10 kV"},
      {v:"12/20", lbl:"12/20 kV"},
      {v:"20.8/36", lbl:"20,8/36 kV"}
    ],
    PAPER65: [
      {v:"6/10",  lbl:"6/10 kV"},
      {v:"12/20", lbl:"12/20 kV"}
    ],
    PAPER60: [
      {v:"18/30", lbl:"18/30 kV"},
      {v:"20.8/36", lbl:"20,8/36 kV"}
    ]
  };

  // Apply translations to DOM
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = window.t(key);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = window.t(el.getAttribute('data-i18n-ph'));
    });
    document.documentElement.lang = window.LANG;
    $('btn-lang').textContent = window.t('btn.toggleLang');
    $('btn-theme').textContent = (document.documentElement.getAttribute('data-theme') === 'light')
      ? window.t('header.theme.dark') : window.t('header.theme.light');
  }

  // Populate voltage select based on insulation
  function refreshVoltageOptions() {
    const ins = $('f-insulation').value;
    const opts = VOLTAGE_OPTIONS[ins] || [];
    const sel = $('f-voltage');
    const prev = sel.value;
    sel.innerHTML = '';
    opts.forEach(({v,lbl}) => {
      const o = document.createElement('option');
      o.value = v; o.textContent = lbl;
      sel.appendChild(o);
    });
    if (opts.find(o => o.v === prev)) sel.value = prev;
  }

  // Populate cross-section select based on insulation+voltage
  function refreshSectionOptions() {
    const ins = $('f-insulation').value;
    const v = $('f-voltage').value;
    const key = ins + ':' + v;
    const opts = SECTION_OPTIONS[key] || [];
    const sel = $('f-section');
    const prev = sel.value;
    sel.innerHTML = '';
    opts.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s + ' mm²';
      sel.appendChild(o);
    });
    if (opts.includes(prev)) sel.value = prev;
  }

  // Show soil / air-specific fields
  function refreshInstallationVisibility() {
    const inst = $('f-installation').value;
    $('soil-card').style.display = (inst === 'soil') ? '' : 'none';
    $('air-card').style.display = (inst === 'air') ? '' : 'none';
    // hide soil-only result rows when air is selected and vice versa
    $('kv-f1').style.display = (inst === 'soil') ? '' : 'none';
    $('kv-f2').style.display = (inst === 'soil') ? '' : 'none';
    $('kv-f3').style.display = (inst === 'air') ? '' : 'none';
    $('kv-f4').style.display = (inst === 'air') ? '' : 'none';
    $('formula-soil').style.display = (inst === 'soil') ? '' : 'none';
    $('formula-air').style.display  = (inst === 'air') ? '' : 'none';
  }

  // Lookup base from standard tables
  function lookupBase() {
    const opts = {
      insulation: $('f-insulation').value,
      voltage:    $('f-voltage').value,
      material:   $('f-material').value,
      section:    $('f-section').value,
      arrangement:$('f-arrangement').value,
      installation: $('f-installation').value
    };
    const v = window.CALC.lookupBaseAmpacity(opts);
    if (v != null) {
      $('f-base').value = v;
      $('base-source').textContent = '✓ MSZ 13207 ' +
        (opts.installation === 'soil' ? 'Tábl. 6 / 7.a' : 'Tábl. 7.b');
      $('base-source').className = 'badge ok';
    } else {
      $('base-source').textContent = window.t('msg.noData') + ' — ' + window.t('field.baseManual');
      $('base-source').className = 'badge warn';
    }
  }

  // Auto-lookup base ampacity when the cable params support it AND user has not entered a value manually
  let userEditedBase = false;
  function maybeAutoLookup() {
    if (userEditedBase) return;
    const opts = {
      insulation: $('f-insulation').value,
      voltage:    $('f-voltage').value,
      material:   $('f-material').value,
      section:    $('f-section').value,
      arrangement:$('f-arrangement').value,
      installation: $('f-installation').value
    };
    const v = window.CALC.lookupBaseAmpacity(opts);
    if (v != null) {
      $('f-base').value = v;
      $('base-source').textContent = '✓ MSZ 13207 ' +
        (opts.installation === 'soil' ? 'Tábl. 6 / 7.a' : 'Tábl. 7.b');
      $('base-source').className = 'badge ok';
    } else {
      $('base-source').textContent = window.t('field.baseManual');
      $('base-source').className = 'badge';
    }
  }

  // Main calculation
  let lastResult = null;
  function calculate() {
    const installation = $('f-installation').value;
    const insulation   = $('f-insulation').value;
    const voltage      = $('f-voltage').value;
    const material     = $('f-material').value;
    const section      = $('f-section').value;
    const arrangement  = $('f-arrangement').value;
    const base         = parseFloat($('f-base').value);
    const duct         = $('f-duct').value === 'yes';
    const result = {
      installation, insulation, voltage, material, section, arrangement,
      base: isNaN(base) ? null : base,
      duct, f1: null, f2: null, f3: null, f4: null,
      ductFactor: duct ? 0.85 : 1.0, iN: null,
      iLoad: null, ok: null,
      vd: null, vdPct: null, R: null, X: null
    };

    if (installation === 'soil') {
      const soilT = $('f-soilTemp').value;
      const rho   = $('f-rho').value;
      const lf    = $('f-lf').value;
      const sys   = $('f-systems').value;
      result.soilT = soilT; result.rho = rho; result.lf = lf; result.systems = sys;
      result.f1 = window.CALC.getF1(insulation, voltage, soilT, rho, lf);
      result.f2 = window.CALC.getF2(arrangement, insulation, sys, rho, lf);
    } else {
      const airT = $('f-airTemp').value;
      const airArr = $('f-airArr').value;
      const sys   = $('f-airSystems').value;
      result.airT = airT; result.airArr = airArr; result.systems = sys;
      result.f3 = window.CALC.getF3(insulation, airT);
      result.f4 = window.CALC.getF4(arrangement, airArr, sys);
    }

    if (result.base != null && result.base > 0) {
      const fA = (installation === 'soil') ? result.f1 : result.f3;
      const fB = (installation === 'soil') ? result.f2 : result.f4;
      if (fA != null && fB != null) {
        result.iN = result.base * fA * fB * result.ductFactor;
      }
    }

    // Optional system check
    const sysU = parseFloat($('f-sysU').value);
    const sysP = parseFloat($('f-sysP').value);
    const cosphi = parseFloat($('f-cosphi').value);
    if (!isNaN(sysU) && !isNaN(sysP) && !isNaN(cosphi)) {
      result.iLoad = window.CALC.computeLoadCurrent(sysU, sysP, cosphi);
      result.sysU = sysU; result.sysP = sysP; result.cosphi = cosphi;
      if (result.iN != null && result.iLoad != null) {
        result.ok = (result.iN >= result.iLoad);
      }
    }

    // Optional voltage drop
    const len = parseFloat($('f-cableLen').value);
    if (!isNaN(len) && len > 0 && result.iLoad != null && !isNaN(sysU) && !isNaN(cosphi)) {
      const useOp = $('f-impedanceTemp').value === 'op';
      const { R, X } = window.CALC.getImpedance(insulation, material, section, voltage, arrangement, useOp);
      result.R = R; result.X = X; result.length = len;
      if (R != null && X != null) {
        const vd = window.CALC.computeVoltageDrop(sysU, result.iLoad, len, R, X, cosphi);
        if (vd) { result.vd = vd.dU; result.vdPct = vd.percent; }
      }
    }

    renderResults(result);
    lastResult = result;
    return result;
  }

  function renderResults(r) {
    const NA = window.t('msg.noData');
    const fmt = (n, digits) => (n == null || isNaN(n)) ? NA : Number(n).toFixed(digits);

    $('r-base').textContent = r.base != null ? fmt(r.base, 1) + ' A' : NA;
    $('r-f1').textContent   = fmt(r.f1, 3);
    $('r-f2').textContent   = fmt(r.f2, 3);
    $('r-f3').textContent   = fmt(r.f3, 3);
    $('r-f4').textContent   = fmt(r.f4, 3);
    $('r-duct').textContent = r.ductFactor.toFixed(2);

    if (r.iN != null) {
      $('r-iN').textContent = fmt(r.iN, 1) + ' A';
      $('kv-iN').classList.remove('ok','bad');
    } else {
      $('r-iN').textContent = NA;
    }

    if (r.iLoad != null) {
      $('r-iLoad').textContent = fmt(r.iLoad, 1) + ' A';
    } else {
      $('r-iLoad').textContent = '–';
    }

    const checkEl = $('r-check');
    if (r.ok === true) {
      checkEl.textContent = window.t('res.check.ok');
      checkEl.className = 'badge ok';
      $('kv-iN').classList.add('ok'); $('kv-iN').classList.remove('bad');
    } else if (r.ok === false) {
      checkEl.textContent = window.t('res.check.bad');
      checkEl.className = 'badge bad';
      $('kv-iN').classList.add('bad'); $('kv-iN').classList.remove('ok');
    } else {
      checkEl.textContent = window.t('res.check.na');
      checkEl.className = 'badge';
      $('kv-iN').classList.remove('ok','bad');
    }

    $('r-vd').textContent = r.vd != null ? fmt(r.vd, 2) + ' V' : '–';
    $('r-vdPct').textContent = r.vdPct != null ? fmt(r.vdPct, 2) + ' %' : '–';
    const vdEl = $('r-vd-badge');
    if (r.vdPct != null) {
      if (r.vdPct <= 3) { vdEl.textContent = '≤ 3 %'; vdEl.className = 'badge ok'; }
      else if (r.vdPct <= 5) { vdEl.textContent = '3–5 %'; vdEl.className = 'badge warn'; }
      else { vdEl.textContent = '> 5 %'; vdEl.className = 'badge bad'; }
    } else {
      vdEl.textContent = ''; vdEl.className = 'badge';
    }
  }

  function resetFields() {
    document.querySelectorAll('input').forEach(i => { if (i.type === 'number' || i.type === 'text' || i.type === 'date') i.value = ''; });
    $('base-source').textContent = '';
    lastResult = null;
    calculate();
  }

  // Init UI listeners
  function init() {
    applyI18n();
    refreshVoltageOptions();
    refreshSectionOptions();
    refreshInstallationVisibility();
    // default date
    if (!$('f-date').value) $('f-date').valueAsDate = new Date();

    $('f-insulation').addEventListener('change', () => { refreshVoltageOptions(); refreshSectionOptions(); maybeAutoLookup(); calculate(); });
    $('f-voltage').addEventListener('change', () => { refreshSectionOptions(); maybeAutoLookup(); calculate(); });
    $('f-installation').addEventListener('change', () => { refreshInstallationVisibility(); maybeAutoLookup(); calculate(); });
    $('f-material').addEventListener('change', maybeAutoLookup);
    $('f-section').addEventListener('change', maybeAutoLookup);
    $('f-arrangement').addEventListener('change', maybeAutoLookup);

    // Recalculate on any input change in calc-affecting fields
    [
      'f-material','f-section','f-arrangement','f-duct',
      'f-soilTemp','f-rho','f-lf','f-systems',
      'f-airTemp','f-airArr','f-airSystems',
      'f-sysU','f-sysP','f-cosphi','f-cableLen','f-impedanceTemp'
    ].forEach(id => $(id).addEventListener('input', calculate));

    // Track manual edits to base ampacity so auto-lookup stops overriding the engineer's number.
    $('f-base').addEventListener('input', () => { userEditedBase = true; calculate(); });

    // First auto-lookup for default selection
    maybeAutoLookup();

    $('btn-lookup').addEventListener('click', () => { userEditedBase = false; lookupBase(); calculate(); });
    $('btn-calc').addEventListener('click', calculate);
    $('btn-reset').addEventListener('click', () => { userEditedBase = false; resetFields(); maybeAutoLookup(); calculate(); });
    $('btn-xlsx').addEventListener('click', () => window.EXPORT.toXLSX(lastResult || calculate(), getProjectMeta()));
    $('btn-print').addEventListener('click', () => window.print());
    $('btn-lang').addEventListener('click', () => {
      window.LANG = (window.LANG === 'hu') ? 'en' : 'hu';
      localStorage.setItem(LS_LANG, window.LANG);
      applyI18n();
    });
    $('btn-theme').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = (cur === 'dark') ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(LS_THEME, next);
      applyI18n();
    });

    // First calc on load
    calculate();
  }

  function getProjectMeta() {
    return {
      project: $('f-project').value,
      designer: $('f-designer').value,
      date: $('f-date').value,
      cableLabel: $('f-cableLabel').value
    };
  }

  document.addEventListener('DOMContentLoaded', init);
})();
