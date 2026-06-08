/* Cable impedance reference values for voltage-drop calculation.
 *
 * R20 = DC conductor resistance at 20 °C, per IEC 60228 (Ω/km).
 * Rop = AC conductor resistance at operating temperature including skin & proximity (Ω/km).
 *       Values use typical Hungarian distribution-network XLPE/PVC manufacturer datasheets
 *       (Prysmian, NKT) which align with MSZ HD 620 S2 and MSZ 146-6.
 * X   = reactance per phase (Ω/km), depends on cable construction & arrangement.
 *       For LV cables (0,6/1 kV): typically 0,08 Ω/km (trefoil) for sections ≤ 240 mm².
 *       For MV cables (6–36 kV): typically 0,10–0,17 Ω/km depending on arrangement.
 *
 * The user can also enter custom R/X values manually for non-standard cables.
 */

window.IMPEDANCE_DATA = {
  // R20 (Ω/km) per IEC 60228 — universal across insulation types
  R20: {
    Cu: { "1.5":12.1, "2.5":7.41, "4":4.61, "6":3.08, "10":1.83, "16":1.15, "25":0.727, "35":0.524, "50":0.387, "70":0.268, "95":0.193, "120":0.153, "150":0.124, "185":0.0991, "240":0.0754, "300":0.0601, "400":0.0470, "500":0.0366, "630":0.0283, "800":0.0221, "1000":0.0176 },
    Al: { "16":1.91, "25":1.20, "35":0.868, "50":0.641, "70":0.443, "95":0.320, "120":0.253, "150":0.206, "185":0.164, "240":0.125, "300":0.100, "400":0.0778, "500":0.0605, "630":0.0469, "800":0.0367, "1000":0.0291 }
  },

  // R at operating temperature (90 °C for XLPE, 70 °C for PVC/PE) — approximate, AC resistance
  // Calculated from R20 × [1 + α × (Top − 20)], α = 0.00393 (Cu) or 0.00403 (Al), then skin factor ≈ 1.0 for ≤ 300 mm², slightly higher above.
  Rop_XLPE: { // at 90 °C
    Cu: { "16":1.45, "25":0.927, "35":0.668, "50":0.494, "70":0.342, "95":0.246, "120":0.195, "150":0.158, "185":0.126, "240":0.0962, "300":0.0766, "400":0.0600, "500":0.0467, "630":0.0361 },
    Al: { "16":2.46, "25":1.54, "35":1.11, "50":0.822, "70":0.568, "95":0.410, "120":0.325, "150":0.265, "185":0.211, "240":0.161, "300":0.129, "400":0.100, "500":0.0779, "630":0.0604 }
  },
  Rop_PVC_PE: { // at 70 °C
    Cu: { "1.5":14.5, "2.5":8.87, "4":5.52, "6":3.69, "10":2.19, "16":1.38, "25":0.870, "35":0.627, "50":0.463, "70":0.321, "95":0.231, "120":0.183, "150":0.148, "185":0.119, "240":0.0903 },
    Al: { "16":2.29, "25":1.44, "35":1.04, "50":0.768, "70":0.530, "95":0.383, "120":0.303, "150":0.247, "185":0.197, "240":0.150 }
  },

  // Reactance X (Ω/km) — typical values per arrangement / voltage class.
  // For more precise designs the manufacturer's datasheet for the specific cable should be used.
  X: {
    "LV": { // 0,6/1 kV cables
      three_core_trefoil: 0.080,
      single_trefoil:     0.085,
      single_flat:        0.130
    },
    "MV": { // 6/10–20,8/36 kV cables
      single_trefoil:     0.105,
      single_flat:        0.165,
      three_core:         0.120
    }
  }
};
