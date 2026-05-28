# cablecalc-pro

Professzionális kábelméretező a **MSZ 13207:2020** alapján – földkábel és levegőben elhelyezett kábel áramterhelhetőség, feszültségesés és megfelelőség-ellenőrzés egyetlen statikus oldalon.

> Mérnöki használatra. Az eredmények ellenőrzése a tervező felelőssége.

---

## Mit tud

- **Talajban** és **levegőben** elhelyezett kábelek számítása ugyanazzal a UI-jal.
- Az MSZ 13207:2020 12–19. táblázatainak teljes lefedettsége:
  - **12.a, 12.b** – f1 (talajhőm., ρ, LF) XLPE/PVC/PE és telített papír (65/60 °C).
  - **13–16.** – f2 (elrendezés × szigetelés × db × ρ × LF) háromszög-7, háromszög-25, sík-7, háromerű-7.
  - **17.** – f3 (levegőhőmérséklet ≠ 30 °C).
  - **18.a/b, 19.a/b** – f4 (több kábelrendszer levegőben: tálca, létra, fal, padozat).
- **Alapterhelhetőség lekérése** automatikusan a 6., 7.a és 7.b táblázatból (XLPE 10C/10B-A és telített papír 6/10–20,8/36 kV, Cu/Al).
- **Védőcső szorzó** (0,85) az MSZ 13207 §12.4.1.2 szerint.
- **Háromfázisú rendszer-ellenőrzés**: I = P / (√3·U·cos φ), kábel megfelelő/nem megfelelő badge.
- **Feszültségesés-számítás**: ΔU = √3·I·L·(R·cos φ + X·sin φ), %-ban is, IEC 60364-5-52 (3 %/5 %) figyelmeztetéssel. R₂₀ és üzemi hőmérsékletre (90/70 °C) korrigált R is választható.
- **XLSX export** projektlap formában (projekt, tervező, dátum, kábel jele, paraméterek, eredmények).
- **PDF / Nyomtatás** – böngészőből közvetlenül, dedikált print stylesheet-tel.
- **Magyar/English** felirat-váltás, **sötét/világos** téma, mindkettő perszisztálva (localStorage).
- 100 % offline statikus oldal – egyetlen CDN-kapcsolat (SheetJS), GitHub Pages-re feltöltve azonnal él.

---

## Telepítés és deploy

1. Töltsd fel a repository tartalmát egy GitHub repóba (pl. `cablecalc`).
2. *Settings → Pages → Branch: main / root → Save.*
3. Néhány másodperc múlva elérhető a `https://<usernév>.github.io/cablecalc/` címen.

Lokális futtatáshoz `python -m http.server` vagy `npx serve .` is elég – nincs build-step.

---

## Fájlszerkezet

```
cablecalc-pro/
├── index.html              # UI shell
├── styles/main.css         # téma + nyomtatási CSS
├── js/
│   ├── i18n.js             # HU / EN szótár
│   ├── calc.js             # számítási motor (lookupok, képletek)
│   ├── app.js              # DOM-bindings, UI-állapot
│   └── export.js           # XLSX export (SheetJS)
├── data/
│   ├── f1.js               # MSZ 13207 12.a, 12.b táblázat
│   ├── f2.js               # 13–16. táblázat (a/b)
│   ├── f3f4.js             # 17., 18.a/b, 19.a/b táblázat
│   ├── baseAmpacity.js     # 6., 7.a, 7.b táblázat
│   └── impedance.js        # R, X értékek (IEC 60228 + tipikus üzemi)
└── test-smoke.js           # node-os smoke teszt (16 lookup ↔ szabvány-érték)
```

A táblázatok diszkrétek – a szabvány nem definiál interpolációt sem ρ, sem LF tengelyen. Ha egy kombináció nincs a szabványban (pl. 25 °C ρ=0,7), a kalkulátor `Nincs adat`-ot ad vissza.

---

## Mi változott a 1.x-hez képest

| Téma | 1.x (cablecalc-main) | 2.0 (cablecalc-pro) |
|---|---|---|
| Hatókör | Csak földkábel | Földkábel + levegőben elhelyezett kábel (f3, f4) |
| f2 táblázatok | Tartalmaztak hibákat (pl. triangle25 PE 1 sys 0,7 ρ rossz értékek) | A szabványból újratranszkribálva, 16 ponton tesztelt |
| Alapterhelhetőség | Csak kézi megadás | Automatikus lekérés a 6, 7.a, 7.b táblázatból (Cu/Al, MV/HV) |
| Feszültségesés | XLPE-csak 20 °C-os R, kis táblázat | R₂₀ + R üzemi (90/70 °C), Cu és Al, helyes X-értékek arrangement szerint |
| UI | Csak HU/EN keverve, csak sötét téma | HU/EN toggle, sötét/világos toggle, automatikus alap-lekérés |
| Projekt-meta | Üres mezők XLSX-ben | Projekt név, tervező, dátum, kábel-jel – kitölthető a felületen, exportba kerül |
| Nyomtatás | Nincs | Dedikált print CSS, közvetlen PDF/print |

---

## Tesztek

```bash
node test-smoke.js
```

16 lookup ellenőrzi a számítási logikát az MSZ 13207:2020 nominális értékeivel (f1, f2, f3, f4, alapterhelhetőség, terhelő-áram, feszültségesés). Egészséges fejlesztés esetén minden zöld.

---

## Korlátok / ismert kérdések

- A 7.b táblázat (levegőben XLPE) PDF-ből nem volt minden cellában tisztán kiolvasható; csak a megbízhatóan átvett szakaszok kerültek be (95/16, 150/25, 240/25, 400/35). Hiányzó cellára „Nincs adat" jelenik meg, és a tervező a gyártói katalógus (Prysmian / NKT / HD 620 S2) alapján kézzel adja meg az alapot.
- A 0,6/1 kV LV táblázatok (8–11.) komplex oszlop-szerkezetűek (vegyes árnyékolt/árnyékolás-nélküli, 1/3 terhelt vezető). A kalkulátor itt a kézi alap-megadásra hagyatkozik – ez egyezik a szabvány gyakorlatával, miszerint LV cikkek elsősorban MSZ 146-6 vagy a gyártó adatlapja alapján méretezendők.
- A kalkulátor nem tartalmazza a rövidzárlati hőszilárdság-ellenőrzést – ezt önállóan kell igazolni (pl. K²·S² ≥ I"²·t).

---

## Forrás

- MSZ 13207:2020 – *0,6/1 kV-tól 20,8/36 kV-ig terjedő névleges feszültségű villamosenergia-kábelek és jelzőkábelek kiválasztása, fektetése és terhelhetősége.*
- IEC 60228 – conductor resistance (R₂₀).
- IEC 60364-5-52 – voltage drop limits.
- MSZ HD 620 S2 – XLPE-szigetelésű kábelek paraméterei.

A táblázat-értékek a szabvány nyomtatott oldalairól közvetlenül vannak átvéve, a forrás minden adatfájl tetején dokumentálva.

---

## Licenc

MIT – ld. a `LICENSE` fájlt (egyébként saját felelősségre használható, garancia nélkül).
