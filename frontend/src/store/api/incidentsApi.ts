import { baseApi } from './baseApi';

// ── Types ────────────────────────────────────────────────────────────────────

export type IncidentCategory = 'conflict' | 'breakthrough' | 'milestone' | 'challenge' | 'celebration';
export type IncidentSeverity = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  userId: string;
  memberId: string;
  title: string;
  description: string;
  date: string;               // YYYY-MM-DD
  category?: IncidentCategory | null;
  severity?: IncidentSeverity | null;
  outcome?: string | null;
  emotions: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  date: string;
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  outcome?: string;
  emotions?: string[];
  tags?: string[];
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {}

export interface IncidentsQuery {
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  tags?: string[];
  page?: number;
  limit?: number;
}

interface IncidentsResponse { success: boolean; data: Incident[]; meta: { timestamp: string } }
interface IncidentResponse  { success: boolean; data: Incident;   meta: { timestamp: string } }

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

export const incidentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getIncidents: builder.query<IncidentsResponse, { memberId: string } & IncidentsQuery>({
      query: ({ memberId, ...params }) => `/members/${memberId}/incidents${qs(params)}`,
      providesTags: (result, _err, { memberId }) => [
        { type: 'MemberIncidents', id: memberId },
        { type: 'Incidents', id: 'LIST' },
        ...(result?.data ?? []).map(i => ({ type: 'Incidents' as const, id: i.id })),
      ],
    }),

    getIncident: builder.query<IncidentResponse, { memberId: string; id: string }>({
      query: ({ memberId, id }) => `/members/${memberId}/incidents/${id}`,
      providesTags: (_res, _err, { id, memberId }) => [
        { type: 'Incidents', id },
        { type: 'MemberIncidents', id: memberId },
      ],
    }),

    createIncident: builder.mutation<IncidentResponse, { memberId: string } & CreateIncidentRequest>({
      query: ({ memberId, ...body }) => ({ url: `/members/${memberId}/incidents`, method: 'POST', body }),
      invalidatesTags: (_res, _err, { memberId }) => [
        { type: 'MemberIncidents', id: memberId },
        { type: 'Incidents', id: 'LIST' },
      ],
    }),

    updateIncident: builder.mutation<IncidentResponse, { memberId: string; id: string; data: UpdateIncidentRequest }>({
      query: ({ memberId, id, data }) => ({ url: `/members/${memberId}/incidents/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (_res, _err, { memberId, id }) => [
        { type: 'Incidents', id },
        { type: 'MemberIncidents', id: memberId },
        { type: 'Incidents', id: 'LIST' },
      ],
    }),

    deleteIncident: builder.mutation<void, { memberId: string; id: string }>({
      query: ({ memberId, id }) => ({ url: `/members/${memberId}/incidents/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, { memberId, id }) => [
        { type: 'Incidents', id },
        { type: 'MemberIncidents', id: memberId },
        { type: 'Incidents', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetIncidentsQuery,
  useGetIncidentQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
} = incidentsApi;
