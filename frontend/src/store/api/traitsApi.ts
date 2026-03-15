import { baseApi } from './baseApi';

// ── Types ───────────────────────────────────────────────────────────────────

export type TraitCategory = 'strength' | 'shadow' | 'trigger' | 'need' | 'pattern' | 'pro' | 'con';
export type TraitIntensity = 1 | 2 | 3; // 1=mild 2=moderate 3=strong

export interface Trait {
  id: string;
  userId: string;
  memberId?: string | null;
  category: TraitCategory;
  description: string;
  intensity?: TraitIntensity | null;
  emotionTag?: string | null;
  /** Searchable tags with prefix format: mood:happy, theme:trust, context:work, emotion:frustrated */
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTraitRequest {
  memberId?: string;
  category: TraitCategory;
  description: string;
  intensity?: TraitIntensity;
  emotionTag?: string;
  tags?: string[];
}

export interface UpdateTraitRequest extends Partial<CreateTraitRequest> {}

export interface TraitsQuery {
  memberId?: string;
  category?: TraitCategory;
  /** AND filter — returns only traits that contain ALL supplied tags */
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface TagSearchQuery {
  tags: string[];
  page?: number;
  limit?: number;
}

// ── Response shapes ──────────────────────────────────────────────────────────

interface TraitsResponse {
  success: boolean;
  data: Trait[];
  meta: { timestamp: string };
}

interface TraitResponse {
  success: boolean;
  data: Trait;
  meta: { timestamp: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQueryString(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach(v => parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`));
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// ── API slice ────────────────────────────────────────────────────────────────

export const traitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    /** List traits — optionally filtered by memberId, category, tags[] */
    getTraits: builder.query<TraitsResponse, TraitsQuery>({
      query: (params) => `/traits${buildQueryString(params)}`,
      providesTags: (result, _err, args) => {
        const tags: any[] = [
          { type: 'Traits', id: 'LIST' },
          // Tag each individual item so single-item refetches stay in sync
          ...(result?.data ?? []).map(t => ({ type: 'Traits' as const, id: t.id })),
        ];
        if (args.memberId) tags.push({ type: 'MemberTraits', id: args.memberId });
        return tags;
      },
    }),

    /** Single trait */
    getTrait: builder.query<TraitResponse, string>({
      query: (id) => `/traits/${id}`,
      providesTags: (result, _err, id) => [
        { type: 'Traits', id },
        // Also tag by memberId so member-scoped invalidations catch this too
        ...(result?.data.memberId ? [{ type: 'MemberTraits' as const, id: result.data.memberId }] : []),
      ],
    }),

    /** Cross-entity tag search */
    searchByTags: builder.query<TraitsResponse, TagSearchQuery>({
      query: (params) => `/traits/search${buildQueryString(params)}`,
      providesTags: (result) => [
        { type: 'Traits', id: 'SEARCH' },
        ...(result?.data ?? []).map(t => ({ type: 'Traits' as const, id: t.id })),
      ],
    }),

    /** Create */
    createTrait: builder.mutation<TraitResponse, CreateTraitRequest>({
      query: (body) => ({ url: '/traits', method: 'POST', body }),
      invalidatesTags: (result, _err, args) => [
        { type: 'Traits', id: 'LIST' },
        { type: 'Traits', id: 'SEARCH' },
        // Invalidate the specific member cache or user traits cache
        ...(args.memberId
          ? [{ type: 'MemberTraits' as const, id: args.memberId }]
          : [{ type: 'UserTraits' as const }]),
      ],
    }),

    /** Update */
    updateTrait: builder.mutation<TraitResponse, { id: string; data: UpdateTraitRequest }>({
      query: ({ id, data }) => ({ url: `/traits/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, _err, { id }) => [
        { type: 'Traits', id },
        { type: 'Traits', id: 'LIST' },
        { type: 'Traits', id: 'SEARCH' },
        // Invalidate member cache when we know which member this trait belongs to
        ...(result?.data.memberId ? [{ type: 'MemberTraits' as const, id: result.data.memberId }] : []),
      ],
    }),

    /** Soft delete */
    deleteTrait: builder.mutation<void, string>({
      query: (id) => ({ url: `/traits/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Traits', id },
        { type: 'Traits', id: 'LIST' },
        { type: 'Traits', id: 'SEARCH' },
        // MemberTraits will be caught via the LIST invalidation above
        // since getTraits tags each item + the LIST collectively
      ],
    }),
  }),
});

export const {
  useGetTraitsQuery,
  useGetTraitQuery,
  useSearchByTagsQuery,
  useCreateTraitMutation,
  useUpdateTraitMutation,
  useDeleteTraitMutation,
} = traitsApi;
