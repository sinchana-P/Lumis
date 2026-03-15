import { baseApi } from './baseApi';

// ── Types ────────────────────────────────────────────────────────────────────

export type PatternCategory = 'communication' | 'conflict' | 'affection' | 'decision-making' | 'stress-response' | 'social';
export type PatternFrequency = 'rare' | 'occasional' | 'frequent' | 'constant';
export type PatternImpact = 'positive' | 'neutral' | 'negative';

export interface Pattern {
  id: string;
  userId: string;
  memberId: string;
  title: string;
  description: string;
  category?: PatternCategory | null;
  frequency?: PatternFrequency | null;
  impact?: PatternImpact | null;
  triggers: string[];
  examples: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatternRequest {
  title: string;
  description: string;
  category?: PatternCategory;
  frequency?: PatternFrequency;
  impact?: PatternImpact;
  triggers?: string[];
  examples?: string[];
  tags?: string[];
}

export interface UpdatePatternRequest extends Partial<CreatePatternRequest> {}

export interface PatternsQuery {
  category?: PatternCategory;
  impact?: PatternImpact;
  tags?: string[];
  page?: number;
  limit?: number;
}

interface PatternsResponse { success: boolean; data: Pattern[]; meta: { timestamp: string } }
interface PatternResponse  { success: boolean; data: Pattern;   meta: { timestamp: string } }

function qs(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) val.forEach(v => parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// ── API slice ────────────────────────────────────────────────────────────────

export const patternsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPatterns: builder.query<PatternsResponse, { memberId: string } & PatternsQuery>({
      query: ({ memberId, ...params }) => `/members/${memberId}/patterns${qs(params)}`,
      providesTags: (result, _err, { memberId }) => [
        { type: 'MemberPatterns', id: memberId },
        { type: 'Patterns', id: 'LIST' },
        ...(result?.data ?? []).map(p => ({ type: 'Patterns' as const, id: p.id })),
      ],
    }),

    getPattern: builder.query<PatternResponse, { memberId: string; id: string }>({
      query: ({ memberId, id }) => `/members/${memberId}/patterns/${id}`,
      providesTags: (_res, _err, { id, memberId }) => [
        { type: 'Patterns', id },
        { type: 'MemberPatterns', id: memberId },
      ],
    }),

    createPattern: builder.mutation<PatternResponse, { memberId: string } & CreatePatternRequest>({
      query: ({ memberId, ...body }) => ({ url: `/members/${memberId}/patterns`, method: 'POST', body }),
      invalidatesTags: (_res, _err, { memberId }) => [
        { type: 'MemberPatterns', id: memberId },
        { type: 'Patterns', id: 'LIST' },
      ],
    }),

    updatePattern: builder.mutation<PatternResponse, { memberId: string; id: string; data: UpdatePatternRequest }>({
      query: ({ memberId, id, data }) => ({ url: `/members/${memberId}/patterns/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_res, _err, { memberId, id }) => [
        { type: 'Patterns', id },
        { type: 'MemberPatterns', id: memberId },
        { type: 'Patterns', id: 'LIST' },
      ],
    }),

    deletePattern: builder.mutation<void, { memberId: string; id: string }>({
      query: ({ memberId, id }) => ({ url: `/members/${memberId}/patterns/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, { memberId, id }) => [
        { type: 'Patterns', id },
        { type: 'MemberPatterns', id: memberId },
        { type: 'Patterns', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPatternsQuery,
  useGetPatternQuery,
  useCreatePatternMutation,
  useUpdatePatternMutation,
  useDeletePatternMutation,
} = patternsApi;
