import { baseApi } from './baseApi';

export interface Member {
  id: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  relationType: string;
  relationTypeCustom?: string;
  photoUrl?: string;
  notes?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberRequest {
  fullName: string;
  nickname?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  relationType: string;
  relationTypeCustom?: string;
  notes?: string;
}

export interface MembersResponse {
  success: boolean;
  data: Member[];
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export interface MemberResponse {
  success: boolean;
  data: Member;
  meta: {
    timestamp: string;
    request_id: string;
  };
}

export const membersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMember: builder.mutation<MemberResponse, CreateMemberRequest>({
      query: (member) => ({
        url: '/members',
        method: 'POST',
        body: member,
      }),
      invalidatesTags: ['Members'],
    }),

    getMembers: builder.query<MembersResponse, void>({
      query: () => '/members',
      providesTags: ['Members'],
    }),

    getMember: builder.query<MemberResponse, string>({
      query: (id) => `/members/${id}`,
      providesTags: (result, error, id) => [{ type: 'Members', id }],
    }),

    updateMember: builder.mutation<MemberResponse, { id: string; data: Partial<CreateMemberRequest> }>({
      query: ({ id, data }) => ({
        url: `/members/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Members', id }, 'Members'],
    }),

    deleteMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Members'],
    }),
  }),
});

export const {
  useCreateMemberMutation,
  useGetMembersQuery,
  useGetMemberQuery,
  useUpdateMemberMutation,
  useDeleteMemberMutation,
} = membersApi;