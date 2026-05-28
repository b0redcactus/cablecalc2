/* XLSX export — uses SheetJS (window.XLSX). */

(function () {
  function f(v, d) { return (v == null || isNaN(v)) ? '–' : Number(v).toFixed(d); }
  function tx(key) { return window.t(key); }

  function toXLSX(result, meta) {
    if (!window.XLSX) {
      alert('SheetJS (XLSX) nincs betöltve — ellenőrizd az internetkapcsolatot.');
      return;
    }
    const r = result || {};
    const rows = [
      ["Kábelméretező — MSZ 13207:2020"],
      [],
      ["Projekt", meta.project || ""],
      ["Tervező", meta.designer || ""],
      ["Dátum", meta.date || ""],
      ["Kábel jele", meta.cableLabel || ""],
      [],
      ["Kábel paraméterei"],
      ["Fektetés módja", r.installation === 'soil' ? 'Talajban' : 'Levegőben'],
      ["Szigetelés", r.insulation || ""],
      ["Névleges feszültség (U₀/U)", r.voltage || ""],
      ["Vezető anyaga", r.material || ""],
      ["Keresztmetszet", (r.section || "") + " mm²"],
      ["Elrendezés", r.arrangement || ""],
      ["Alapterhelhetőség (alap-A)", r.base != null ? r.base + " A" : "–"],
      ["Védőcső", r.duct ? "Igen (×0,85)" : "Nem"],
      []
    ];

    if (r.installation === 'soil') {
      rows.push(["Talaj körülmények"]);
      rows.push(["Talaj hőmérséklete", (r.soilT || "") + " °C"]);
      rows.push(["Talaj fajl. hőellenállása (ρ)", (r.rho || "") + " K·m/W"]);
      rows.push(["Terhelési tényező (LF)", r.lf || ""]);
      rows.push(["Kábelrendszerek száma", r.systems || ""]);
      rows.push([]);
    } else {
      rows.push(["Levegő körülmények"]);
      rows.push(["Levegő hőmérséklete", (r.airT || "") + " °C"]);
      rows.push(["Elhelyezés", r.airArr || ""]);
      rows.push(["Kábelrendszerek száma", r.systems || ""]);
      rows.push([]);
    }

    rows.push(["Eredmények"]);
    if (r.installation === 'soil') {
      rows.push(["f1 (talaj hőm., ρ, LF)", f(r.f1, 3)]);
      rows.push(["f2 (elrendezés, db, ρ, LF)", f(r.f2, 3)]);
    } else {
      rows.push(["f3 (levegő hőm.)", f(r.f3, 3)]);
      rows.push(["f4 (elrendezés, db)", f(r.f4, 3)]);
    }
    rows.push(["Védőcső szorzó", r.ductFactor.toFixed(2)]);
    rows.push(["Végső terhelhetőség (I)", r.iN != null ? f(r.iN, 1) + " A" : "–"]);
    rows.push([]);

    if (r.sysU != null) {
      rows.push(["Rendszeradatok"]);
      rows.push(["Hálózati feszültség", r.sysU + " V"]);
      rows.push(["Hatásos teljesítmény", r.sysP + " kW"]);
      rows.push(["cos φ", r.cosphi]);
      rows.push(["Számított terhelőáram I_terhelés", f(r.iLoad, 1) + " A"]);
      rows.push(["Megfelelés", r.ok === true ? "Megfelelő" : (r.ok === false ? "NEM megfelelő" : "–")]);
      rows.push([]);
    }

    if (r.vd != null) {
      rows.push(["Feszültségesés"]);
      rows.push(["Kábelhossz", r.length + " m"]);
      rows.push(["R", f(r.R, 4) + " Ω/km"]);
      rows.push(["X", f(r.X, 4) + " Ω/km"]);
      rows.push(["Feszültségesés ΔU", f(r.vd, 2) + " V"]);
      rows.push(["Százalékban", f(r.vdPct, 2) + " %"]);
      rows.push([]);
    }

    rows.push(["Megjegyzés"]);
    rows.push(["Forrás: MSZ 13207:2020. A táblázatok diszkrétek; közbeeső értékek nem interpoláltak."]);
    rows.push(["Az eredmények műszaki ellenőrzése a tervező felelőssége."]);

    const ws = window.XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 32 }, { wch: 24 }];
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Számítás");

    const ts = new Date().toISOString().slice(0,19).replace(/[T:]/g,'-');
    const fname = (meta.cableLabel ? meta.cableLabel.replace(/[^a-zA-Z0-9_\-]/g,'_') + '_' : 'kabel_') + ts + '.xlsx';
    window.XLSX.writeFile(wb, fname);
  }

  window.EXPORT = { toXLSX };
})();
