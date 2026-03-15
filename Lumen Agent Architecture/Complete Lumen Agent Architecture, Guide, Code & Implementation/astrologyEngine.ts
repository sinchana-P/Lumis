// ═══════════════════════════════════════════════════════════════
// LUMIS AI — ASTROLOGY ENGINE (VEDIC / JYOTISH)
// Uses Swiss Ephemeris (swisseph) for accurate sidereal positions.
// Lahiri ayanamsa. Whole sign house system.
//
// npm install swisseph
// ═══════════════════════════════════════════════════════════════

import * as swisseph from "swisseph";
import {
  AstrologyComputed, PlanetPosition, HousePosition,
  Yoga, DashaInfo
} from "../types";

// ── CONSTANTS ────────────────────────────────────────────────────
export const VEDIC_SIGNS = [
  "Mesha","Vrishabha","Mithuna","Karkata","Simha","Kanya",
  "Tula","Vrischika","Dhanu","Makara","Kumbha","Meena",
];
export const VEDIC_SIGNS_FULL = [
  "Mesha (Aries)","Vrishabha (Taurus)","Mithuna (Gemini)",
  "Karkata (Cancer)","Simha (Leo)","Kanya (Virgo)",
  "Tula (Libra)","Vrischika (Scorpio)","Dhanu (Sagittarius)",
  "Makara (Capricorn)","Kumbha (Aquarius)","Meena (Pisces)",
];
export const SIGN_LORDS = [
  "Mars","Venus","Mercury","Moon","Sun","Mercury",
  "Venus","Mars","Jupiter","Saturn","Saturn","Jupiter",
];
export const SIGN_ELEMENT = ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
export const SIGN_QUALITY = ["Movable","Fixed","Dual","Movable","Fixed","Dual","Movable","Fixed","Dual","Movable","Fixed","Dual"];

// Exaltation / debilitation signs (sidereal)
const EXALTATION: Record<string, number> = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 };
const DEBILITATION: Record<string, number> = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0 };
const OWN_SIGNS: Record<string, number[]> = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5], Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
};

export const NAKSHATRAS = [
  { name:"Ashwini",     lord:"Ketu",    dasha:7,  deity:"Ashwini Kumaras",  meaning:"Pioneering, healing, quick starts" },
  { name:"Bharani",     lord:"Venus",   dasha:20, deity:"Yama",             meaning:"Transformative power, creative force" },
  { name:"Krittika",    lord:"Sun",     dasha:6,  deity:"Agni",             meaning:"Sharp intellect, purifying fire" },
  { name:"Rohini",      lord:"Moon",    dasha:10, deity:"Brahma",           meaning:"Creative abundance, sensual stability" },
  { name:"Mrigashira",  lord:"Mars",    dasha:7,  deity:"Soma",             meaning:"Curious, searching, refined" },
  { name:"Ardra",       lord:"Rahu",    dasha:18, deity:"Rudra",            meaning:"Intense transformation, storm before calm" },
  { name:"Punarvasu",   lord:"Jupiter", dasha:16, deity:"Aditi",            meaning:"Return to joy, renewal, expansion" },
  { name:"Pushya",      lord:"Saturn",  dasha:19, deity:"Brihaspati",       meaning:"Nourishing, protective, spiritual" },
  { name:"Ashlesha",    lord:"Mercury", dasha:17, deity:"Sarpa",            meaning:"Penetrating wisdom, serpentine depth" },
  { name:"Magha",       lord:"Ketu",    dasha:7,  deity:"Pitru",            meaning:"Royal nature, ancestral honour" },
  { name:"Purva Phalguni", lord:"Venus", dasha:20, deity:"Bhaga",           meaning:"Creative pleasure, rest, romance" },
  { name:"Uttara Phalguni", lord:"Sun",  dasha:6, deity:"Aryaman",          meaning:"Patronage, service through partnership" },
  { name:"Hasta",       lord:"Moon",    dasha:10, deity:"Savitar",          meaning:"Dexterity, skill, manifestation" },
  { name:"Chitra",      lord:"Mars",    dasha:7,  deity:"Tvastr",           meaning:"Artistic brilliance, structural beauty" },
  { name:"Swati",       lord:"Rahu",    dasha:18, deity:"Vayu",             meaning:"Independence, flexibility, diplomacy" },
  { name:"Vishakha",    lord:"Jupiter", dasha:16, deity:"Indragni",         meaning:"Goal-oriented, determined, achievement" },
  { name:"Anuradha",    lord:"Saturn",  dasha:19, deity:"Mitra",            meaning:"Devotion, friendship, discipline" },
  { name:"Jyeshtha",    lord:"Mercury", dasha:17, deity:"Indra",            meaning:"Seniority, protection, courage" },
  { name:"Mula",        lord:"Ketu",    dasha:7,  deity:"Nirrti",           meaning:"Root investigation, letting go, depth" },
  { name:"Purva Ashadha", lord:"Venus", dasha:20, deity:"Apas",             meaning:"Invincible, purifying, philosophic" },
  { name:"Uttara Ashadha", lord:"Sun",  dasha:6,  deity:"Vishvedeva",       meaning:"Final victory, universal service" },
  { name:"Shravana",    lord:"Moon",    dasha:10, deity:"Vishnu",           meaning:"Deep listening, learning, connection" },
  { name:"Dhanishtha",  lord:"Mars",    dasha:7,  deity:"Vasus",            meaning:"Wealth through action, musical nature" },
  { name:"Shatabhisha", lord:"Rahu",    dasha:18, deity:"Varuna",           meaning:"Healing, mysticism, hidden knowledge" },
  { name:"Purva Bhadrapada", lord:"Jupiter", dasha:16, deity:"Ajaikapada", meaning:"Intensity, spiritual fire, two-faced" },
  { name:"Uttara Bhadrapada", lord:"Saturn", dasha:19, deity:"Ahirbudhnya", meaning:"Depth, wisdom, compassionate stillness" },
  { name:"Revati",      lord:"Mercury", dasha:17, deity:"Pushan",           meaning:"Nourishing completion, safe journey" },
];

export const DASHA_SEQUENCE = [
  { planet:"Ketu",    years:7 },
  { planet:"Venus",   years:20 },
  { planet:"Sun",     years:6 },
  { planet:"Moon",    years:10 },
  { planet:"Mars",    years:7 },
  { planet:"Rahu",    years:18 },
  { planet:"Jupiter", years:16 },
  { planet:"Saturn",  years:19 },
  { planet:"Mercury", years:17 },
];

const SE_PLANETS: Record<string, number> = {
  Sun:0, Moon:1, Mercury:2, Venus:3, Mars:4,
  Jupiter:5, Saturn:6, Rahu:11,
};

export interface BirthData {
  dob: string;       // "YYYY-MM-DD"
  birthTime: string; // "HH:MM"
  lat: number;
  lon: number;
  utcOffset: number;
}

export class AstrologyEngine {
  constructor() {
    // Set Lahiri ayanamsa (standard for Jyotish)
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  }

  // ── MAIN ENTRY POINT ─────────────────────────────────────────
  async calculate(birth: BirthData): Promise<AstrologyComputed> {
    const julday = this.toJulianDay(birth);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(julday);

    // Planets
    const rawPlanets = this.calcAllPlanets(julday);

    // Lagna (ascendant) using Whole Sign
    const lagna = this.calcLagna(julday, birth.lat, birth.lon);

    // Moon for Rashi + Nakshatra
    const moonPlanet = rawPlanets.find(p => p.name === "Moon")!;
    const nakshatra = this.calcNakshatra(moonPlanet.longitude);

    // Assign houses
    const planetsWithHouses = this.assignHouses(rawPlanets, lagna.signIndex);

    // Build house positions
    const houses = this.buildHousePositions(planetsWithHouses, lagna.signIndex);

    // Planet dignities
    const planetsWithDignity = planetsWithHouses.map(p => ({
      ...p,
      dignity: this.getDignity(p.name, p.vedicSignIndex),
    }));

    // Yogas
    const yogas = this.detectYogas(planetsWithDignity, lagna.signIndex);

    // Dasha
    const dasha = this.calcDasha(birth.dob, nakshatra, moonPlanet.longitude);

    // Map to output types
    const planets: PlanetPosition[] = planetsWithDignity.map(p => ({
      name: p.name,
      sign: VEDIC_SIGNS_FULL[p.vedicSignIndex],
      house: p.house,
      degree: Math.round(p.longitudeInSign * 100) / 100,
      isRetrograde: p.isRetrograde,
      nakshatra: p.nakshatra,
      dignity: p.dignity,
    }));

    return {
      ascendant: VEDIC_SIGNS_FULL[lagna.signIndex],
      ascendantDegree: Math.round(lagna.degree * 100) / 100,
      sunSign: VEDIC_SIGNS_FULL[Math.floor(rawPlanets.find(p => p.name === "Sun")!.longitude / 30)],
      moonSign: VEDIC_SIGNS_FULL[Math.floor(moonPlanet.longitude / 30)],
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
      nakshatraLord: nakshatra.lord,
      planets,
      houses,
      yogas,
      dasha,
      ayanamsa: Math.round(ayanamsa * 100) / 100,
    };
  }

  // ── JULIAN DAY ───────────────────────────────────────────────
  private toJulianDay(birth: BirthData): number {
    const [y, m, d] = birth.dob.split("-").map(Number);
    const [h, min] = birth.birthTime.split(":").map(Number);
    const utTime = h + min / 60 - birth.utcOffset;
    return swisseph.swe_julday(y, m, d, utTime, swisseph.SE_GREG_CAL);
  }

  // ── ALL PLANETS ──────────────────────────────────────────────
  private calcAllPlanets(julday: number) {
    const flag = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;
    const results = [];

    for (const [name, id] of Object.entries(SE_PLANETS)) {
      const r = swisseph.swe_calc_ut(julday, id, flag);
      if (r.error) continue;

      const lon = r.longitude;
      const signIdx = Math.floor(lon / 30);
      const lonInSign = lon % 30;
      const nakIdx = Math.floor(lon / 13.333333) % 27;
      const nakPada = Math.floor((lon % 13.333333) / 3.3333) + 1;

      results.push({
        name, longitude: lon, vedicSignIndex: signIdx,
        longitudeInSign: lonInSign,
        isRetrograde: r.longitudeSpeed < 0,
        nakshatra: NAKSHATRAS[nakIdx].name,
        nakshatraPada: nakPada,
        house: 0, vedicSignIndex_: signIdx,
      });
    }

    // Ketu = Rahu + 180
    const rahu = results.find(p => p.name === "Rahu");
    if (rahu) {
      const ketuLon = (rahu.longitude + 180) % 360;
      const ketuSignIdx = Math.floor(ketuLon / 30);
      const ketuNakIdx = Math.floor(ketuLon / 13.333333) % 27;
      results.push({
        name: "Ketu", longitude: ketuLon, vedicSignIndex: ketuSignIdx,
        longitudeInSign: ketuLon % 30,
        isRetrograde: false,
        nakshatra: NAKSHATRAS[ketuNakIdx].name,
        nakshatraPada: Math.floor((ketuLon % 13.333333) / 3.3333) + 1,
        house: 0, vedicSignIndex_: ketuSignIdx,
      });
    }

    return results;
  }

  // ── LAGNA ────────────────────────────────────────────────────
  private calcLagna(julday: number, lat: number, lon: number) {
    const houses = swisseph.swe_houses(julday, lat, lon, "W"); // Whole Sign
    const ascLon = houses.ascendant;
    return { signIndex: Math.floor(ascLon / 30), degree: ascLon % 30 };
  }

  // ── NAKSHATRA ────────────────────────────────────────────────
  private calcNakshatra(moonSidLon: number) {
    const idx = Math.floor(moonSidLon / 13.333333) % 27;
    const nak = NAKSHATRAS[idx];
    const pada = Math.floor((moonSidLon % 13.333333) / 3.3333) + 1;
    return { ...nak, pada, index: idx };
  }

  // ── ASSIGN HOUSES (Whole Sign) ───────────────────────────────
  private assignHouses(planets: any[], lagnaSignIdx: number) {
    return planets.map(p => ({
      ...p,
      house: ((p.vedicSignIndex - lagnaSignIdx + 12) % 12) + 1,
    }));
  }

  // ── BUILD HOUSE POSITIONS ────────────────────────────────────
  private buildHousePositions(planets: any[], lagnaSignIdx: number): HousePosition[] {
    const houses: HousePosition[] = [];
    for (let h = 1; h <= 12; h++) {
      const signIdx = (lagnaSignIdx + h - 1) % 12;
      const planetsInHouse = planets.filter(p => p.house === h).map(p => p.name);
      houses.push({
        house: h,
        sign: VEDIC_SIGNS_FULL[signIdx],
        lord: SIGN_LORDS[signIdx],
        planets: planetsInHouse,
      });
    }
    return houses;
  }

  // ── DIGNITY ──────────────────────────────────────────────────
  private getDignity(planet: string, signIdx: number): PlanetPosition["dignity"] {
    if (EXALTATION[planet] === signIdx) return "exalted";
    if (DEBILITATION[planet] === signIdx) return "debilitated";
    if (OWN_SIGNS[planet]?.includes(signIdx)) return "own";
    return "neutral";
  }

  // ── YOGA DETECTION ───────────────────────────────────────────
  private detectYogas(planets: any[], lagnaSignIdx: number): Yoga[] {
    const yogas: Yoga[] = [];
    const byName = (n: string) => planets.find(p => p.name === n);

    const moon = byName("Moon");
    const jupiter = byName("Jupiter");
    const sun = byName("Sun");
    const mercury = byName("Mercury");
    const mars = byName("Mars");
    const venus = byName("Venus");
    const saturn = byName("Saturn");

    // Gaja Kesari: Jupiter in kendra from Moon
    if (moon && jupiter) {
      const diff = ((jupiter.house - moon.house + 12) % 12);
      const isKendra = [0, 3, 6, 9].includes(diff);
      yogas.push({ name:"Gaja Kesari Yoga", description:"Jupiter in kendra from Moon — wisdom, reputation, prosperity", isPresent:isKendra, strength: isKendra ? "strong" : "weak" });
    }

    // Budha-Aditya: Sun + Mercury conjunct
    if (sun && mercury) {
      const conjunct = sun.house === mercury.house;
      yogas.push({ name:"Budha-Aditya Yoga", description:"Sun and Mercury conjunct — sharp intellect, recognition in career", isPresent:conjunct });
    }

    // Chandra-Mangala: Moon + Mars
    if (moon && mars) {
      const conjunct = moon.house === mars.house;
      const opposing = Math.abs(moon.house - mars.house) === 6;
      yogas.push({ name:"Chandra-Mangala Yoga", description:"Moon and Mars connected — financial drive, emotional intensity", isPresent:conjunct || opposing });
    }

    // Pancha Mahapurusha (exalted/own sign in kendra)
    const kendras = [1, 4, 7, 10];
    const mahapurusha: Record<string, string> = { Mars:"Ruchaka", Mercury:"Bhadra", Jupiter:"Hamsa", Venus:"Malavya", Saturn:"Shasha" };
    for (const [planet, yogaName] of Object.entries(mahapurusha)) {
      const p = byName(planet);
      if (!p) continue;
      const isKendra = kendras.includes(p.house);
      const isStrong = p.dignity === "exalted" || p.dignity === "own";
      yogas.push({ name:`${yogaName} Yoga`, description:`${planet} in kendra in exaltation/own sign — ${yogaName} qualities prominent`, isPresent:isKendra && isStrong });
    }

    // Kemadruma: Moon with no planets in adjacent houses
    if (moon) {
      const prev = ((moon.house - 2 + 12) % 12) + 1;
      const next = (moon.house % 12) + 1;
      const adjacentEmpty = !planets.filter(p => p.name !== "Moon" && p.name !== "Rahu" && p.name !== "Ketu").some(p => p.house === prev || p.house === next);
      if (adjacentEmpty) {
        yogas.push({ name:"Kemadruma Yoga", description:"Moon without adjacent planetary support — emotional isolation possible", isPresent:true, strength:"moderate" });
      }
    }

    return yogas.filter(y => y.isPresent);
  }

  // ── VIMSHOTTARI DASHA ────────────────────────────────────────
  private calcDasha(dob: string, nakshatra: ReturnType<typeof this.calcNakshatra>, moonLon: number): DashaInfo {
    const [y, m, d] = dob.split("-").map(Number);
    const dobDate = new Date(y, m - 1, d);

    const lords = DASHA_SEQUENCE.map(x => x.planet);
    const lordIdx = lords.indexOf(nakshatra.lord);

    // Position within nakshatra (0-1) = fraction of dasha elapsed
    const lonInNak = moonLon % 13.333333;
    const fracElapsed = lonInNak / 13.333333;
    const dashaYears = DASHA_SEQUENCE[lordIdx].years;
    const elapsedYears = fracElapsed * dashaYears;

    const timeline: DashaInfo["timeline"] = [];
    let startDate = new Date(dobDate);
    startDate.setDate(startDate.getDate() - Math.round(elapsedYears * 365.25));

    for (let i = 0; i < 9; i++) {
      const di = (lordIdx + i) % 9;
      const years = DASHA_SEQUENCE[di].years;
      const end = new Date(startDate);
      end.setDate(end.getDate() + Math.round(years * 365.25));
      timeline.push({
        planet: DASHA_SEQUENCE[di].planet, years,
        startDate: startDate.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
      });
      startDate = new Date(end);
    }

    const now = new Date();
    const currentIdx = timeline.findIndex(t => new Date(t.startDate) <= now && new Date(t.endDate) > now);
    const current = timeline[Math.max(0, currentIdx)];
    const next = timeline[Math.min(8, currentIdx + 1)];

    // Antardasha within current mahadasha
    const antardasha = this.calcAntardasha(current, now, lordIdx + Math.max(0, currentIdx));

    return {
      currentMahadasha: { planet: current.planet, startDate: current.startDate, endDate: current.endDate },
      currentAntardasha: antardasha,
      nextMahadasha: { planet: next.planet, startDate: next.startDate },
      timeline,
    };
  }

  private calcAntardasha(maha: DashaInfo["currentMahadasha"], now: Date, mahaSeqIdx: number) {
    const lords = DASHA_SEQUENCE.map(x => x.planet);
    const mahaIdx = lords.indexOf(maha.planet);
    let start = new Date(maha.startDate);

    for (let i = 0; i < 9; i++) {
      const di = (mahaIdx + i) % 9;
      const antarYears = (DASHA_SEQUENCE[di].years / 120) * DASHA_SEQUENCE[mahaIdx].years;
      const end = new Date(start.getTime() + antarYears * 365.25 * 86400000);
      if (start <= now && end > now) {
        return { planet: DASHA_SEQUENCE[di].planet, startDate: start.toISOString().split("T")[0], endDate: end.toISOString().split("T")[0] };
      }
      start = new Date(end);
    }
    return { planet: maha.planet, startDate: maha.startDate, endDate: maha.endDate };
  }

  // ── GEOCODING (place name → lat/lon) ─────────────────────────
  static async geocode(place: string): Promise<{ lat: number; lon: number; utcOffset: number; displayName: string }> {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`, {
      headers: { "User-Agent": "Lumis/1.0" }
    });
    const data = await res.json();
    if (!data[0]) throw new Error(`Place not found: ${place}`);
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    return { lat, lon, utcOffset: Math.round(lon / 15 * 2) / 2, displayName: data[0].display_name };
  }
}
