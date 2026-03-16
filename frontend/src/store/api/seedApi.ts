import { baseApi } from './baseApi';

interface SeedDemoResponse {
  success: boolean;
  data: {
    created: boolean;
    memberId: string;
    message: string;
  };
}

export const seedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    seedDemoLuminary: builder.mutation<SeedDemoResponse, void>({
      query: () => ({
        url: '/seed/demo-luminary',
        method: 'POST',
      }),
      invalidatesTags: ['Members'],
    }),
  }),
});

export const { useSeedDemoLuminaryMutation } = seedApi;
