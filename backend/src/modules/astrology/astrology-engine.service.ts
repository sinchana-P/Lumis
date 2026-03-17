import { Injectable } from '@nestjs/common';
import * as swisseph from 'swisseph';

export const VEDIC_SIGNS = [
  'Mesha','Vrishabha','Mithuna','Karkata','Simha','Kanya',
  'Tula','Vrischika','Dhanu','Makara','Kumbha','Meena',
];
export const VEDIC_SIGNS_FULL = [
  'Mesha (Aries)','Vrishabha (Taurus)','Mithuna (Gemini)',
  'Karkata (Cancer)','Simha (Leo)','Kanya (Virgo)',
  'Tula (Libra)','Vrischika (Scorpio)','Dhanu (Sagittarius)',
  'Makara (Capricorn)','Kumbha (Aquarius)','Meena (Pisces)',
];
export const SIGN_LORDS = [
  'Mars','Venus','Mercury','Moon','Sun','Mercury',
  'Venus','Mars','Jupiter','Saturn','Saturn','Jupiter',
];

const EXALTATION: Record<string, number> = { Sun:0, Moon:1, Mars:9, Mercury:5, Jupiter:3, Venus:11, Saturn:6 };
const DEBILITATION: Record<string, number> = { Sun:6, Moon:7, Mars:3, Mercury:11, Jupiter:9, Venus:5, Saturn:0 };
const OWN_SIGNS: Record<string, number[]> = {
  Sun:[4], Moon:[3], Mars:[0,7], Mercury:[2,5], Jupiter:[8,11], Venus:[1,6], Saturn:[9,10],
};

export const NAKSHATRAS = [
  { name:'Ashwini',     lord:'Ketu',    dasha:7  },
  { name:'Bharani',     lord:'Venus',   dasha:20 },
  { name:'Krittika',    lord:'Sun',     dasha:6  },
  { name:'Rohini',      lord:'Moon',    dasha:10 },
  { name:'Mrigashira',  lord:'Mars',    dasha:7  },
  { name:'Ardra',       lord:'Rahu',    dasha:18 },
  { name:'Punarvasu',   lord:'Jupiter', dasha:16 },
  { name:'Pushya',      lord:'Saturn',  dasha:19 },
  { name:'Ashlesha',    lord:'Mercury', dasha:17 },
  { name:'Magha',       lord:'Ketu',    dasha:7  },
  { name:'Purva Phalguni',   lord:'Venus',   dasha:20 },
  { name:'Uttara Phalguni',  lord:'Sun',     dasha:6  },
  { name:'Hasta',       lord:'Moon',    dasha:10 },
  { name:'Chitra',      lord:'Mars',    dasha:7  },
  { name:'Swati',       lord:'Rahu',    dasha:18 },
  { name:'Vishakha',    lord:'Jupiter', dasha:16 },
  { name:'Anuradha',    lord:'Saturn',  dasha:19 },
  { name:'Jyeshtha',    lord:'Mercury', dasha:17 },
  { name:'Mula',        lord:'Ketu',    dasha:7  },
  { name:'Purva Ashadha',    lord:'Venus',   dasha:20 },
  { name:'Uttara Ashadha',   lord:'Sun',     dasha:6  },
  { name:'Shravana',    lord:'Moon',    dasha:10 },
  { name:'Dhanishtha',  lord:'Mars',    dasha:7  },
  { name:'Shatabhisha', lord:'Rahu',    dasha:18 },
  { name:'Purva Bhadrapada', lord:'Jupiter', dasha:16 },
  { name:'Uttara Bhadrapada',lord:'Saturn',  dasha:19 },
  { name:'Revati',      lord:'Mercury', dasha:17 },
];

export const DASHA_SEQUENCE = [
  { planet:'Ketu',    years:7  },
  { planet:'Venus',   years:20 },
  { planet:'Sun',     years:6  },
  { planet:'Moon',    years:10 },
  { planet:'Mars',    years:7  },
  { planet:'Rahu',    years:18 },
  { planet:'Jupiter', years:16 },
  { planet:'Saturn',  years:19 },
  { planet:'Mercury', years:17 },
];

const SE_PLANETS: Record<string, number> = {
  Sun:0, Moon:1, Mercury:2, Venus:3, Mars:4, Jupiter:5, Saturn:6, Rahu:11,
};

export interface BirthData {
  dob: string;       // "YYYY-MM-DD"
  birthTime: string; // "HH:MM"
  lat: number;
  lon: number;
  utcOffset: number;
}

export interface PlanetPosition {
  name: string;
  sign: string;
  house: number;
  degree: number;
  isRetrograde: boolean;
  nakshatra: string;
  dignity?: 'exalted' | 'debilitated' | 'own' | 'neutral';
}

export interface HousePosition {
  house: number;
  sign: string;
  lord: string;
  planets: string[];
}

export interface Yoga {
  name: string;
  description: string;
  isPresent: boolean;
  strength?: 'weak' | 'moderate' | 'strong';
}

export interface DashaInfo {
  currentMahadasha: { planet: string; startDate: string; endDate: string };
  currentAntardasha: { planet: string; startDate: string; endDate: string };
  nextMahadasha: { planet: string; startDate: string };
  timeline: { planet: string; years: number; startDate: string; endDate: string }[];
}

export interface AstrologyComputed {
  ascendant: string;
  ascendantDegree: number;
  sunSign: string;
  moonSign: string;
  nakshatra: string;
  nakshatraPada: number;
  nakshatraLord: string;
  planets: PlanetPosition[];
  houses: HousePosition[];
  yogas: Yoga[];
  dasha: DashaInfo;
  ayanamsa: number;
}

@Injectable()
export class AstrologyEngineService {
  constructor() {
    swisseph.swe_set_sid_mode(swisseph.SE_SIDM_LAHIRI, 0, 0);
  }

  async calculate(birth: BirthData): Promise<AstrologyComputed> {
    const julday = this.toJulianDay(birth);
    const ayanamsa = swisseph.swe_get_ayanamsa_ut(julday);
    const rawPlanets = this.calcAllPlanets(julday);
    const lagna = this.calcLagna(julday, birth.lat, birth.lon);
    const moonPlanet = rawPlanets.find(p => p.name === 'Moon')!;
    const nakshatra = this.calcNakshatra(moonPlanet.longitude);
    const planetsWithHouses = this.assignHouses(rawPlanets, lagna.signIndex);
    const houses = this.buildHousePositions(planetsWithHouses, lagna.signIndex);
    const planetsWithDignity = planetsWithHouses.map(p => ({
      ...p,
      dignity: this.getDignity(p.name, p.vedicSignIndex),
    }));
    const yogas = this.detectYogas(planetsWithDignity, lagna.signIndex);
    const dasha = this.calcDasha(birth.dob, nakshatra, moonPlanet.longitude);

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
      sunSign: VEDIC_SIGNS_FULL[Math.floor(rawPlanets.find(p => p.name === 'Sun')!.longitude / 30)],
      moonSign: VEDIC_SIGNS_FULL[Math.floor(moonPlanet.longitude / 30)],
      nakshatra: nakshatra.name,
      nakshatraPada: nakshatra.pada,
      nakshatraLord: nakshatra.lord,
      planets, houses, yogas, dasha,
      ayanamsa: Math.round(ayanamsa * 100) / 100,
    };
  }

  private toJulianDay(birth: BirthData): number {
    const [y, m, d] = birth.dob.split('-').map(Number);
    const [h, min] = birth.birthTime.split(':').map(Number);
    const utTime = h + min / 60 - birth.utcOffset;
    return swisseph.swe_julday(y, m, d, utTime, swisseph.SE_GREG_CAL);
  }

  private calcAllPlanets(julday: number) {
    const flag = swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED;
    const results: any[] = [];

    for (const [name, id] of Object.entries(SE_PLANETS)) {
      const r: any = swisseph.swe_calc_ut(julday, id, flag);
      if (r.error) continue;
      const lon: number = r.longitude;
      const signIdx = Math.floor(lon / 30);
      const nakIdx = Math.floor(lon / 13.333333) % 27;
      results.push({
        name, longitude: lon, vedicSignIndex: signIdx,
        longitudeInSign: lon % 30,
        isRetrograde: (r.longitudeSpeed as number) < 0,
        nakshatra: NAKSHATRAS[nakIdx].name,
        house: 0,
      });
    }

    const rahu = results.find(p => p.name === 'Rahu');
    if (rahu) {
      const ketuLon = (rahu.longitude + 180) % 360;
      const ketuSignIdx = Math.floor(ketuLon / 30);
      const ketuNakIdx = Math.floor(ketuLon / 13.333333) % 27;
      results.push({
        name: 'Ketu', longitude: ketuLon, vedicSignIndex: ketuSignIdx,
        longitudeInSign: ketuLon % 30,
        isRetrograde: false,
        nakshatra: NAKSHATRAS[ketuNakIdx].name,
        house: 0,
      });
    }

    return results;
  }

  private calcLagna(julday: number, lat: number, lon: number) {
    const houses: any = swisseph.swe_houses(julday, lat, lon, 'W');
    const ascLon: number = houses.ascendant;
    return { signIndex: Math.floor(ascLon / 30), degree: ascLon % 30 };
  }

  private calcNakshatra(moonSidLon: number) {
    const idx = Math.floor(moonSidLon / 13.333333) % 27;
    const nak = NAKSHATRAS[idx];
    const pada = Math.floor((moonSidLon % 13.333333) / 3.3333) + 1;
    return { ...nak, pada, index: idx };
  }

  private assignHouses(planets: any[], lagnaSignIdx: number) {
    return planets.map(p => ({
      ...p,
      house: ((p.vedicSignIndex - lagnaSignIdx + 12) % 12) + 1,
    }));
  }

  private buildHousePositions(planets: any[], lagnaSignIdx: number): HousePosition[] {
    const houses: HousePosition[] = [];
    for (let h = 1; h <= 12; h++) {
      const signIdx = (lagnaSignIdx + h - 1) % 12;
      const planetsInHouse = planets.filter(p => p.house === h).map(p => p.name);
      houses.push({ house: h, sign: VEDIC_SIGNS_FULL[signIdx], lord: SIGN_LORDS[signIdx], planets: planetsInHouse });
    }
    return houses;
  }

  private getDignity(planet: string, signIdx: number): PlanetPosition['dignity'] {
    if (EXALTATION[planet] === signIdx) return 'exalted';
    if (DEBILITATION[planet] === signIdx) return 'debilitated';
    if (OWN_SIGNS[planet]?.includes(signIdx)) return 'own';
    return 'neutral';
  }

  private detectYogas(planets: any[], _lagnaSignIdx: number): Yoga[] {
    const yogas: Yoga[] = [];
    const by = (n: string) => planets.find(p => p.name === n);
    const moon = by('Moon'), jupiter = by('Jupiter'), sun = by('Sun');
    const mercury = by('Mercury'), mars = by('Mars'), venus = by('Venus'), saturn = by('Saturn');

    if (moon && jupiter) {
      const diff = ((jupiter.house - moon.house + 12) % 12);
      const isKendra = [0, 3, 6, 9].includes(diff);
      yogas.push({ name:'Gaja Kesari Yoga', description:'Jupiter in kendra from Moon — wisdom, reputation, prosperity', isPresent:isKendra, strength:isKendra ? 'strong' : 'weak' });
    }
    if (sun && mercury) {
      yogas.push({ name:'Budha-Aditya Yoga', description:'Sun and Mercury conjunct — sharp intellect, recognition in career', isPresent:sun.house === mercury.house });
    }
    if (moon && mars) {
      const c = moon.house === mars.house || Math.abs(moon.house - mars.house) === 6;
      yogas.push({ name:'Chandra-Mangala Yoga', description:'Moon and Mars connected — financial drive, emotional intensity', isPresent:c });
    }

    const kendras = [1, 4, 7, 10];
    const mahapurusha: Record<string, string> = { Mars:'Ruchaka', Mercury:'Bhadra', Jupiter:'Hamsa', Venus:'Malavya', Saturn:'Shasha' };
    for (const [planet, yogaName] of Object.entries(mahapurusha)) {
      const p = by(planet);
      if (!p) continue;
      const isStrong = p.dignity === 'exalted' || p.dignity === 'own';
      yogas.push({ name:`${yogaName} Yoga`, description:`${planet} in kendra in exaltation/own sign`, isPresent:kendras.includes(p.house) && isStrong });
    }

    if (moon) {
      const prev = ((moon.house - 2 + 12) % 12) + 1;
      const next = (moon.house % 12) + 1;
      const adjEmpty = !planets.filter(p => !['Moon','Rahu','Ketu'].includes(p.name)).some(p => p.house === prev || p.house === next);
      if (adjEmpty) yogas.push({ name:'Kemadruma Yoga', description:'Moon without adjacent planetary support — emotional isolation possible', isPresent:true, strength:'moderate' });
    }

    return yogas.filter(y => y.isPresent);
  }

  private calcDasha(dob: string, nakshatra: ReturnType<typeof this.calcNakshatra>, moonLon: number): DashaInfo {
    const [y, m, d] = dob.split('-').map(Number);
    const dobDate = new Date(y, m - 1, d);
    const lords = DASHA_SEQUENCE.map(x => x.planet);
    const lordIdx = lords.indexOf(nakshatra.lord);
    const fracElapsed = (moonLon % 13.333333) / 13.333333;
    const elapsedYears = fracElapsed * DASHA_SEQUENCE[lordIdx].years;

    const timeline: DashaInfo['timeline'] = [];
    let startDate = new Date(dobDate);
    startDate.setDate(startDate.getDate() - Math.round(elapsedYears * 365.25));

    for (let i = 0; i < 9; i++) {
      const di = (lordIdx + i) % 9;
      const years = DASHA_SEQUENCE[di].years;
      const end = new Date(startDate);
      end.setDate(end.getDate() + Math.round(years * 365.25));
      timeline.push({ planet: DASHA_SEQUENCE[di].planet, years, startDate: startDate.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
      startDate = new Date(end);
    }

    const now = new Date();
    const currentIdx = Math.max(0, timeline.findIndex(t => new Date(t.startDate) <= now && new Date(t.endDate) > now));
    const current = timeline[currentIdx];
    const next = timeline[Math.min(8, currentIdx + 1)];
    const antardasha = this.calcAntardasha(current, now);

    return {
      currentMahadasha: { planet: current.planet, startDate: current.startDate, endDate: current.endDate },
      currentAntardasha: antardasha,
      nextMahadasha: { planet: next.planet, startDate: next.startDate },
      timeline,
    };
  }

  private calcAntardasha(maha: DashaInfo['currentMahadasha'], now: Date) {
    const lords = DASHA_SEQUENCE.map(x => x.planet);
    const mahaIdx = lords.indexOf(maha.planet);
    let start = new Date(maha.startDate);
    for (let i = 0; i < 9; i++) {
      const di = (mahaIdx + i) % 9;
      const antarYears = (DASHA_SEQUENCE[di].years / 120) * DASHA_SEQUENCE[mahaIdx].years;
      const end = new Date(start.getTime() + antarYears * 365.25 * 86400000);
      if (start <= now && end > now) {
        return { planet: DASHA_SEQUENCE[di].planet, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
      }
      start = new Date(end);
    }
    return { planet: maha.planet, startDate: maha.startDate, endDate: maha.endDate };
  }

  static async geocode(place: string): Promise<{ lat: number; lon: number; utcOffset: number; displayName: string }> {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`, {
      headers: { 'User-Agent': 'Lumis/1.0' },
    });
    const data = await res.json();
    if (!data[0]) throw new Error(`Place not found: ${place}`);
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    return { lat, lon, utcOffset: Math.round(lon / 15 * 2) / 2, displayName: data[0].display_name };
  }
}
