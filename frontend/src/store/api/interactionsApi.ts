import { baseApi } from './baseApi';

// ── Types ────────────────────────────────────────────────────────────────────

export type InteractionType    = 'call' | 'text' | 'in-person' | 'video' | 'email' | 'social';
export type InteractionQuality = 'excellent' | 'good' | 'neutral' | 'poor' | 'difficult';

export interface Interaction {
  id: string;
  userId: string;
  memberId: string;
  title: string;
  description: string;
  date: string;               // YYYY-MM-DD
  type?: InteractionType | null;
  duration?: string | null;
  quality?: InteractionQuality | null;
  moodBefore?: string | null;
  moodAfter?: string | null;
  energyLevel?: number | null; // 1-10
  topics: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInteractionRequest {
  title: string;
  description: string;
  date: string;
  type?: InteractionType;
  duration?: string;
  quality?: InteractionQuality;
  moodBefore?: string;
  moodAfter?: string;
  energyLevel?: number;
  topics?: string[];
  tags?: string[];
}

export interface UpdateInteractionRequest extends Partial<CreateInteractionRequest> {}

export interface InteractionsQuery {
  type?: InteractionType;
  quality?: InteractionQuality;
  tags?: string[];
  page?: number;
  limit?: number;
}

interface InteractionsResponse { success: boolean; data: Interaction[]; meta: { timestamp: string } }
interface InteractionResponse  { success: boolean; data: Interaction;   meta: { timestamp: string } }

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

export const interactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getInteractions: builder.query<InteractionsResponse, { memberId: string } & InteractionsQuery>({
      query: ({ memberId, ...params }) => `/members/${memberId}/interactions${qs(params)}`,
      providesTags: (result, _err, { memberId }) => [
        { type: 'MemberInteractions', id: memberId },
        { type: 'Interactions', id: 'LIST' },
        ...(result?.data ?? []).map(i => ({ type: 'Interactions' as const, id: i.id })),
      ],
    }),

    getInteraction: builder.query<InteractionResponse, { memberId: string; id: string }>({
      query: ({ memberId, id }) => `/members/${memberId}/interactions/${id}`,
      providesTags: (_res, _err, { id, memberId }) => [
        { type: 'Interactions', id },
        { type: 'MemberInteractions', id: memberId },
      ],
    }),

    createInteraction: builder.mutation<InteractionResponse, { memberId: string } & CreateInteractionRequest>({
      query: ({ memberId, ...body }) => ({ url: `/members/${memberId}/interactions`, method: 'POST', body }),
      invalidatesTags: (_res, _err, { memberId }) => [
        { type: 'MemberInteractions', id: memberId },
        { type: 'Interactions', id: 'LIST' },
      ],
    }),

    updateInteraction: builder.mutation<InteractionResponse, { memberId: string; id: string; data: UpdateInteractionRequest }>({
      query: ({ memberId, id, data }) => ({ url: `/members/${memberId}/interactions/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_res, _err, { memberId, id }) => [
        { type: 'Interactions', id },
        { type: 'MemberInteractions', id: memberId },
        { type: 'Interactions', id: 'LIST' },
      ],
    }),

    deleteInteraction: builder.mutation<void, { memberId: string; id: string }>({
      query: ({ memberId, id }) => ({ url: `/members/${memberId}/interactions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, { memberId, id }) => [
        { type: 'Interactions', id },
        { type: 'MemberInteractions', id: memberId },
        { type: 'Interactions', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetInteractionsQuery,
  useGetInteractionQuery,
  useCreateInteractionMutation,
  useUpdateInteractionMutation,
  useDeleteInteractionMutation,
} = interactionsApi;
