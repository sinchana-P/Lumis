import { baseApi } from './baseApi';

export interface JournalEntry {
  id: string;
  memberId: string;
  title: string | null;
  content: string;
  date: string;
  emotions: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalEntryRequest {
  content: string;
  title?: string;
  date?: string;
  emotions?: string[];
  tags?: string[];
  isPrivate?: boolean;
}

function mapEntry(raw: any): JournalEntry {
  return {
    id:         raw.id,
    memberId:   raw.member_id,
    title:      raw.title      ?? null,
    content:    raw.content,
    date:       raw.date,
    emotions:   raw.emotions   ?? [],
    tags:       raw.tags       ?? [],
    isPrivate:  raw.is_private ?? false,
    createdAt:  raw.created_at,
    updatedAt:  raw.updated_at,
  };
}

export const journalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJournalEntries: builder.query<{ data: JournalEntry[] }, { memberId: string }>({
      query: ({ memberId }) => `/members/${memberId}/journal`,
      transformResponse: (res: any) => ({ data: (res.data ?? []).map(mapEntry) }),
      providesTags: (_r, _e, { memberId }) => [{ type: 'MemberJournal', id: memberId }],
    }),

    createJournalEntry: builder.mutation<JournalEntry, { memberId: string } & CreateJournalEntryRequest>({
      query: ({ memberId, ...body }) => ({
        url: `/members/${memberId}/journal`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => mapEntry(res.data),
      invalidatesTags: (_r, _e, { memberId }) => [{ type: 'MemberJournal', id: memberId }],
    }),

    updateJournalEntry: builder.mutation<JournalEntry, { memberId: string; id: string; data: CreateJournalEntryRequest }>({
      query: ({ memberId, id, data }) => ({
        url: `/members/${memberId}/journal/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res: any) => mapEntry(res.data),
      invalidatesTags: (_r, _e, { memberId }) => [{ type: 'MemberJournal', id: memberId }],
    }),

    deleteJournalEntry: builder.mutation<void, { memberId: string; id: string }>({
      query: ({ memberId, id }) => ({
        url: `/members/${memberId}/journal/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { memberId }) => [{ type: 'MemberJournal', id: memberId }],
    }),
  }),
});

export const {
  useGetJournalEntriesQuery,
  useCreateJournalEntryMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntryMutation,
} = journalApi;
