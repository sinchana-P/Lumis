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

export interface CalculateNumerologyRequest {
  dob: string;
  fullName: string;
  memberId: string;
  memberRelation?: string;
}

export const numerologyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberNumerology: builder.query<NumerologyProfile | null, string>({
      query: (memberId) => `/numerology/member/${memberId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, memberId) => [{ type: 'MemberNumerology', id: memberId }],
    }),
    calculateNumerology: builder.mutation<NumerologyProfile, CalculateNumerologyRequest>({
      query: (body) => ({
        url: '/numerology/calculate',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, arg) => [{ type: 'MemberNumerology', id: arg.memberId }],
    }),
  }),
});

export const { useGetMemberNumerologyQuery, useCalculateNumerologyMutation } = numerologyApi;
