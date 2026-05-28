/* MSZ 13207:2020 — Tables 17, 18.a, 18.b, 19.a, 19.b
 * Air laying correction factors.
 *
 * f3 — Table 17 — correction for air temperature different from 30 °C.
 * f4 — Tables 18.a / 18.b / 19.a / 19.b — correction for multiple cable systems in air.
 *
 * Cable group keys for f3:
 *   XLPE_90  — XLPE-insulated, max operating temp 90 °C
 *   PE_PVC_70 — PE- and PVC-insulated, max op temp 70 °C
 *   PAPER_65 — saturated paper-insulated 6/10 kV and 12/20 kV, max op temp 65 °C
 *   PAPER_60 — saturated paper-insulated 18/30 kV and 20,8/36 kV, max op temp 60 °C
 *
 * f4 arrangements:
 *   single_flat   — Table 18.a — single-core in 3-phase, flat formation, spacing = d (cable diameter)
 *   single_trefoil — Table 18.b — single-core in 3-phase, trefoil, spacing 2d between systems
 *   three_core_spaced — Table 19.a — 3-core cables or single-core DC, spacing = d
 *   three_core_touching — Table 19.b — 3-core cables or single-core DC, cables touching each other and wall
 *
 * f4 placement keys:
 *   floor       — cables on the floor
 *   tray_1..6   — non-perforated tray, 1/2/3/6 trays stacked (impeded heat loss)
 *   perf_1..6   — perforated tray or ladder, 1/2/3/6 trays stacked (unimpeded)
 *   wall        — cables on wall or support
 */

window.F3_DATA = {
  // op temp (°C) → air temp (°C) → factor
  XLPE_90:    { 10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82 },
  PE_PVC_70:  { 10: 1.22, 15: 1.17, 20: 1.12, 25: 1.07, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71 },
  PAPER_65:   { 10: 1.00, 15: 1.00, 20: 1.00, 25: 1.00, 30: 1.00, 35: 0.93, 40: 0.85, 45: 0.76, 50: 0.65 },
  PAPER_60:   { 10: 1.00, 15: 1.00, 20: 1.00, 25: 1.00, 30: 1.00, 35: 0.91, 40: 0.82, 45: 0.71, 50: 0.58 }
};

window.F4_DATA = {
  // Table 18.a — single-core 3-phase, flat, spacing = d, distance from wall ≥ 2 cm
  // # systems side-by-side: 1, 2, 3
  single_flat: {
    floor:    { 1: 0.92, 2: 0.89, 3: 0.88 },
    tray_1:   { 1: 0.92, 2: 0.89, 3: 0.88 },
    tray_2:   { 1: 0.87, 2: 0.84, 3: 0.83 },
    tray_3:   { 1: 0.84, 2: 0.82, 3: 0.81 },
    tray_6:   { 1: 0.82, 2: 0.80, 3: 0.79 },
    perf_1:   { 1: 1.00, 2: 0.97, 3: 0.96 },
    perf_2:   { 1: 0.97, 2: 0.94, 3: 0.93 },
    perf_3:   { 1: 0.96, 2: 0.93, 3: 0.92 },
    perf_6:   { 1: 0.94, 2: 0.91, 3: 0.90 },
    wall:     { 1: 0.94, 2: 0.91, 3: 0.89 }
  },

  // Table 18.b — single-core 3-phase, trefoil, spacing between systems 2d, distance from wall ≥ 2 cm
  single_trefoil: {
    floor:    { 1: 0.95, 2: 0.90, 3: 0.88 },
    tray_1:   { 1: 0.95, 2: 0.90, 3: 0.88 },
    tray_2:   { 1: 0.90, 2: 0.85, 3: 0.83 },
    tray_3:   { 1: 0.88, 2: 0.83, 3: 0.81 },
    tray_6:   { 1: 0.86, 2: 0.81, 3: 0.79 },
    perf_1:   { 1: 1.00, 2: 0.98, 3: 0.96 },
    perf_2:   { 1: 1.00, 2: 0.95, 3: 0.93 },
    perf_3:   { 1: 1.00, 2: 0.94, 3: 0.92 },
    perf_6:   { 1: 1.00, 2: 0.93, 3: 0.90 },
    wall:     { 1: 0.89, 2: 0.86, 3: 0.84 }
  },

  // Table 19.a — three-core or single-core DC, spacing = d, distance from wall ≥ 2 cm
  // # systems side-by-side: 1, 2, 3, 6, 9
  three_core_spaced: {
    floor:    { 1: 0.95, 2: 0.90, 3: 0.88, 6: 0.85, 9: 0.84 },
    tray_1:   { 1: 0.95, 2: 0.90, 3: 0.88, 6: 0.85, 9: 0.84 },
    tray_2:   { 1: 0.90, 2: 0.85, 3: 0.83, 6: 0.81, 9: 0.80 },
    tray_3:   { 1: 0.88, 2: 0.83, 3: 0.81, 6: 0.79, 9: 0.78 },
    tray_6:   { 1: 0.86, 2: 0.81, 3: 0.79, 6: 0.77, 9: 0.76 },
    perf_1:   { 1: 1.00, 2: 0.98, 3: 0.96, 6: 0.93, 9: 0.92 },
    perf_2:   { 1: 1.00, 2: 0.95, 3: 0.93, 6: 0.90, 9: 0.89 },
    perf_3:   { 1: 1.00, 2: 0.94, 3: 0.92, 6: 0.89, 9: 0.88 },
    perf_6:   { 1: 1.00, 2: 0.93, 3: 0.90, 6: 0.87, 9: 0.86 },
    wall:     { 1: 1.00, 2: 0.93, 3: 0.90, 6: 0.87, 9: 0.86 }
  },

  // Table 19.b — three-core or single-core DC, cables touching each other and wall
  three_core_touching: {
    floor:    { 1: 0.90, 2: 0.84, 3: 0.80, 6: 0.75, 9: 0.73 },
    tray_1:   { 1: 0.95, 2: 0.84, 3: 0.80, 6: 0.75, 9: 0.73 },
    tray_2:   { 1: 0.95, 2: 0.80, 3: 0.76, 6: 0.71, 9: 0.69 },
    tray_3:   { 1: 0.95, 2: 0.78, 3: 0.74, 6: 0.70, 9: 0.68 },
    tray_6:   { 1: 0.95, 2: 0.76, 3: 0.72, 6: 0.68, 9: 0.66 },
    perf_1:   { 1: 0.95, 2: 0.84, 3: 0.80, 6: 0.75, 9: 0.73 },
    perf_2:   { 1: 0.95, 2: 0.80, 3: 0.76, 6: 0.71, 9: 0.69 },
    perf_3:   { 1: 0.95, 2: 0.78, 3: 0.74, 6: 0.70, 9: 0.68 },
    perf_6:   { 1: 0.95, 2: 0.76, 3: 0.72, 6: 0.68, 9: 0.66 },
    wall:     { 1: 0.95, 2: 0.78, 3: 0.73, 6: 0.68, 9: 0.66 }
  }
};
