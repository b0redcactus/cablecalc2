/* MSZ 13207:2020 — Base ampacity tables (Tables 6, 7.a, 7.b).
 *
 * Per the standard (§12.3) these values are informative — the cable manufacturer's catalogue is
 * the primary source. Numbers come from Annex tables of MSZ HD 620 S2 as published in MSZ 13207.
 *
 * Normal conditions for soil (Table 7.a):
 *   1 system, LF=1, trefoil, depth 0,8–1 m, soil 20 °C, ρ = 1 K·m/W.
 * Normal conditions for air (Table 7.b):
 *   air 30 °C, distance from wall ≥ 20 mm.
 *
 * Empty cells in the standard (—) appear as null here; the lookup returns null and the UI shows
 * "manual entry" so the engineer falls back to the manufacturer datasheet.
 *
 * Key structure for MV XLPE: cable[material][section][voltage][arrangement] → A
 *   material:     Cu | Al
 *   section:      "95/16", "120/16", "150/25", "185/25", "240/25", "300/25", "400/35", "500/35"
 *   voltage:      "6/10" | "12/20" | "18/30" | "20.8/36"
 *   arrangement:  "trefoil" | "flat"
 *
 * Key structure for MV saturated paper: paper[material][section][voltage] → A (trefoil only).
 */

window.BASE_AMPACITY = {
  // Table 7.a — XLPE 10C / 10B-A in soil
  XLPE_soil: {
    Cu: {
      "95/16":  { "6/10":{trefoil:320, flat:359}, "12/20":{trefoil:323, flat:360}, "18/30":{trefoil:327, flat:362}, "20.8/36":{trefoil:318, flat:334} },
      "120/16": { "6/10":{trefoil:363, flat:405}, "12/20":{trefoil:367, flat:407}, "18/30":{trefoil:371, flat:409}, "20.8/36":{trefoil:null, flat:null} },
      "150/25": { "6/10":{trefoil:405, flat:442}, "12/20":{trefoil:409, flat:445}, "18/30":{trefoil:414, flat:449}, "20.8/36":{trefoil:404, flat:418} },
      "185/25": { "6/10":{trefoil:456, flat:493}, "12/20":{trefoil:461, flat:498}, "18/30":{trefoil:466, flat:502}, "20.8/36":{trefoil:null, flat:null} },
      "240/25": { "6/10":{trefoil:526, flat:563}, "12/20":{trefoil:532, flat:568}, "18/30":{trefoil:539, flat:574}, "20.8/36":{trefoil:527, flat:535} },
      "300/25": { "6/10":{trefoil:591, flat:626}, "12/20":{trefoil:599, flat:633}, "18/30":{trefoil:606, flat:640}, "20.8/36":{trefoil:null, flat:null} },
      "400/35": { "6/10":{trefoil:662, flat:675}, "12/20":{trefoil:671, flat:685}, "18/30":{trefoil:680, flat:695}, "20.8/36":{trefoil:669, flat:652} },
      "500/35": { "6/10":{trefoil:744, flat:748}, "12/20":{trefoil:754, flat:760}, "18/30":{trefoil:765, flat:773}, "20.8/36":{trefoil:null, flat:null} }
    },
    Al: {
      "95/16":  { "6/10":{trefoil:248, flat:281}, "12/20":{trefoil:251, flat:282}, "18/30":{trefoil:254, flat:283}, "20.8/36":{trefoil:247, flat:262} },
      "120/16": { "6/10":{trefoil:283, flat:318}, "12/20":{trefoil:285, flat:319}, "18/30":{trefoil:289, flat:321}, "20.8/36":{trefoil:null, flat:null} },
      "150/25": { "6/10":{trefoil:315, flat:350}, "12/20":{trefoil:319, flat:352}, "18/30":{trefoil:322, flat:354}, "20.8/36":{trefoil:314, flat:329} },
      "185/25": { "6/10":{trefoil:357, flat:394}, "12/20":{trefoil:361, flat:396}, "18/30":{trefoil:364, flat:399}, "20.8/36":{trefoil:null, flat:null} },
      "240/25": { "6/10":{trefoil:413, flat:452}, "12/20":{trefoil:417, flat:455}, "18/30":{trefoil:422, flat:458}, "20.8/36":{trefoil:412, flat:426} },
      "300/25": { "6/10":{trefoil:466, flat:506}, "12/20":{trefoil:471, flat:510}, "18/30":{trefoil:476, flat:514}, "20.8/36":{trefoil:null, flat:null} },
      "400/35": { "6/10":{trefoil:529, flat:558}, "12/20":{trefoil:535, flat:564}, "18/30":{trefoil:541, flat:570}, "20.8/36":{trefoil:531, flat:533} },
      "500/35": { "6/10":{trefoil:602, flat:627}, "12/20":{trefoil:609, flat:634}, "18/30":{trefoil:616, flat:642}, "20.8/36":{trefoil:null, flat:null} }
    }
  },

  // Table 7.b — XLPE 10C / 10B-A in air
  // (Only confidently-transcribed sections — manufacturer catalogue should confirm.)
  XLPE_air: {
    Cu: {
      "95/16":  { "6/10":{trefoil:358, flat:426}, "12/20":{trefoil:361, flat:426}, "18/30":{trefoil:363, flat:425}, "20.8/36":{trefoil:368, flat:414} },
      "150/25": { "6/10":{trefoil:413, flat:491}, "12/20":{trefoil:416, flat:491}, "18/30":{trefoil:418, flat:488}, "20.8/36":{trefoil:478, flat:536} },
      "240/25": { "6/10":{trefoil:468, flat:549}, "12/20":{trefoil:470, flat:549}, "18/30":{trefoil:472, flat:548}, "20.8/36":{trefoil:null, flat:null} },
      "400/35": { "6/10":{trefoil:535, flat:625}, "12/20":{trefoil:538, flat:625}, "18/30":{trefoil:539, flat:624}, "20.8/36":{trefoil:641, flat:714} }
    },
    Al: {
      "95/16":  { "6/10":{trefoil:278, flat:333}, "12/20":{trefoil:280, flat:332}, "18/30":{trefoil:282, flat:331}, "20.8/36":{trefoil:286, flat:323} },
      "150/25": { "6/10":{trefoil:321, flat:384}, "12/20":{trefoil:323, flat:384}, "18/30":{trefoil:325, flat:382}, "20.8/36":{trefoil:372, flat:419} },
      "240/25": { "6/10":{trefoil:418, flat:496}, "12/20":{trefoil:420, flat:494}, "18/30":{trefoil:421, flat:492}, "20.8/36":{trefoil:501, flat:563} },
      "400/35": { "6/10":{trefoil:568, flat:666}, "12/20":{trefoil:569, flat:663}, "18/30":{trefoil:568, flat:659}, "20.8/36":{trefoil:666, flat:739} }
    }
  },

  // Table 6 — Saturated paper-insulated cables in soil, base ampacity (trefoil single-core / 3-core combined; both columns rounded together)
  // Values are the trefoil (single-core in 3-phase) primary column of the standard's Table 6.
  Paper_soil: {
    Cu: {
      "25":  { "6/10":117, "12/20":126, "18/30":139, "20.8/36":153 },
      "35":  { "6/10":143, "12/20":151, "18/30":166, "20.8/36":184 },
      "50":  { "6/10":171, "12/20":180, "18/30":196, "20.8/36":219 },
      "70":  { "6/10":212, "12/20":222, "18/30":240, "20.8/36":269 },
      "95":  { "6/10":257, "12/20":268, "18/30":287, "20.8/36":321 },
      "120": { "6/10":293, "12/20":304, "18/30":327, "20.8/36":363 },
      "150": { "6/10":332, "12/20":343, "18/30":366, "20.8/36":404 },
      "185": { "6/10":377, "12/20":388, "18/30":414, "20.8/36":454 },
      "240": { "6/10":437, "12/20":453, "18/30":479, "20.8/36":519 },
      "300": { "6/10":493, "12/20":511, "18/30":539, "20.8/36":578 },
      "400": { "6/10":561, "12/20":591, "18/30":618, "20.8/36":650 },
      "500": { "6/10":null,"12/20":661, "18/30":689, "20.8/36":713 }
    },
    Al: {
      "35":  { "6/10":110, "12/20":117, "18/30":128, "20.8/36":142 },
      "50":  { "6/10":132, "12/20":140, "18/30":152, "20.8/36":170 },
      "70":  { "6/10":165, "12/20":173, "18/30":186, "20.8/36":210 },
      "95":  { "6/10":200, "12/20":208, "18/30":223, "20.8/36":250 },
      "120": { "6/10":229, "12/20":237, "18/30":254, "20.8/36":284 },
      "150": { "6/10":259, "12/20":267, "18/30":285, "20.8/36":317 },
      "185": { "6/10":295, "12/20":304, "18/30":323, "20.8/36":358 },
      "240": { "6/10":343, "12/20":355, "18/30":377, "20.8/36":414 },
      "300": { "6/10":389, "12/20":403, "18/30":425, "20.8/36":463 },
      "400": { "6/10":449, "12/20":471, "18/30":491, "20.8/36":529 },
      "500": { "6/10":null,"12/20":534, "18/30":555, "20.8/36":588 }
    }
  }
};
