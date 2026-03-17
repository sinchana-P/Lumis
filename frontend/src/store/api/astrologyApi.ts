import { baseApi } from './baseApi';

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

export interface AstrologyInsights {
  emotionalNature: string;
  emotionalGift: string;
  whatTriggersWithdrawal: string;
  whatMakesThemFeelSafe: string;
  emotionalAvailability: string;
  emotionalAvailabilityDetail: string;
  whenThingsGoWrong: string;
  relationshipGuidance: {
    whatThisRelationshipAsksOfYou: string;
    whatLandsWell: string;
    whereFrictionLives: string;
    howToMeetThemWell: string;
    bestMomentToApproach: string;
    avoidWhen: string;
  };
  planetarySignatures: string;
  dashaInfluence: string;
}

export interface AstrologyProfile {
  id: string;
  memberId: string | null;
  computed: AstrologyComputed;
  insights: AstrologyInsights;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateAstrologyRequest {
  dob: string;
  birthTime: string;
  lat: number;
  lon: number;
  utcOffset: number;
  memberId?: string;
  memberRelation?: string;
  memberName?: string;
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  utcOffset: number;
  displayName: string;
}

export const astrologyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberAstrology: builder.query<AstrologyProfile | null, string>({
      query: (memberId) => `/astrology/member/${memberId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, memberId) => [{ type: 'MemberAstrology', id: memberId }],
    }),
    getMyAstrology: builder.query<AstrologyProfile | null, void>({
      query: () => `/astrology/me`,
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'MemberAstrology', id: '__self__' }],
    }),
    calculateAstrology: builder.mutation<AstrologyProfile, CalculateAstrologyRequest>({
      query: (body) => ({
        url: '/astrology/calculate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'MemberAstrology', id: arg.memberId },
        { type: 'MemberAstrology', id: '__self__' },
      ],
    }),
    geocodePlace: builder.query<GeocodeResult, string>({
      query: (place) => `/astrology/geocode?place=${encodeURIComponent(place)}`,
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetMemberAstrologyQuery,
  useGetMyAstrologyQuery,
  useCalculateAstrologyMutation,
  useGeocodePlaceQuery,
} = astrologyApi;
