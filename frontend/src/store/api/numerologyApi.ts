import { baseApi } from './baseApi';

export interface NumerologyCoreNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  birthday: number;
  maturity: number;
}

export interface NumerologyTimingNumbers {
  personalYear: number;
  personalMonth: number;
  personalDay: number;
  lifeCycle: number;
  pinnacles: number[];
  challenges: number[];
}

export interface NumerologyInsights {
  lifePathMeaning: string;
  expressionMeaning: string;
  soulUrgeMeaning: string;
  personalityMeaning: string;
  birthdayMeaning: string;
  maturityMeaning: string;
  personalYearMeaning: string;
  personalMonthMeaning: string;
  theirNumberInYourLife: Record<string, string>;
}

export interface NumerologySelfInsights {
  // Core number descriptions
  lifePathMeaning: string;
  expressionMeaning: string;
  soulUrgeMeaning: string;
  personalityMeaning: string;
  birthdayMeaning: string;
  maturityMeaning: string;
  // Timing
  personalYearMeaning: string;
  personalMonthMeaning: string;
  // Deep identity insights (AI)
  emotionalCore: string;
  innerConflict: string;
  behaviorPattern: string;
  // Application insights (AI)
  careerAlignment: string;
  relationshipPattern: string;
  shadowAndSabotage: string;
  // Evolution (AI)
  growthPath: string;
  pinnacleInsight: string;
  challengeInsight: string;
}

export interface NumerologyCompatibility {
  lifePathScore: number;
  expressionScore: number;
  soulUrgeScore: number;
  yearAlignmentScore: number;
  overallScore: number;
  overallSummary: string;
  dimensionTexts: Record<string, string>;
}

export interface NumerologyProfile {
  id: string;
  memberId: string | null;
  coreNumbers: NumerologyCoreNumbers;
  timingNumbers: NumerologyTimingNumbers;
  insights: NumerologyInsights;
  compatibility: NumerologyCompatibility | null;
  createdAt: string;
  updatedAt: string;
}

export interface NumerologySelfProfile {
  id: string;
  userId: string;
  coreNumbers: NumerologyCoreNumbers;
  timingNumbers: NumerologyTimingNumbers;
  insights: NumerologySelfInsights;
  createdAt: string;
  updatedAt: string;
}

export interface CalculateNumerologyRequest {
  dob: string;
  fullName: string;
  memberId?: string;
  memberRelation?: string;
  memberDob?: string;
  memberFullName?: string;
}

export const numerologyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberNumerology: builder.query<NumerologyProfile | null, string>({
      query: (memberId) => `/numerology/member/${memberId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, memberId) => [{ type: 'MemberNumerology', id: memberId }],
    }),
    getMyNumerology: builder.query<NumerologyProfile | null, void>({
      query: () => `/numerology/me`,
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: 'MemberNumerology', id: '__self__' }],
    }),
    calculateNumerology: builder.mutation<NumerologyProfile, CalculateNumerologyRequest>({
      query: (body) => ({
        url: '/numerology/calculate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, arg) => [
        { type: 'MemberNumerology', id: arg.memberId },
        { type: 'MemberNumerology', id: '__self__' },
      ],
    }),
    calculateSelfNumerology: builder.mutation<NumerologySelfProfile, void>({
      query: () => ({
        url: '/numerology/self',
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'MemberNumerology', id: '__self__' }],
    }),
  }),
});

export const {
  useGetMemberNumerologyQuery,
  useGetMyNumerologyQuery,
  useCalculateNumerologyMutation,
  useCalculateSelfNumerologyMutation,
} = numerologyApi;
