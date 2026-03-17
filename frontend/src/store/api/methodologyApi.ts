import { baseApi } from './baseApi';

export interface ContentBlock {
  type: 'paragraph' | 'formula' | 'table' | 'list' | 'note' | 'heading';
  // paragraph / heading / note
  text?: string;
  // formula
  label?: string;
  expression?: string;
  note?: string;
  // table
  headers?: string[];
  rows?: string[][];
  // list
  items?: { label: string; text: string; color?: string }[];
}

export interface MethodologySection {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: string;
  blocks: ContentBlock[];
}

export interface MethodologyData {
  version: string;
  lastUpdated: string;
  sections: MethodologySection[];
}

export const methodologyApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getMethodology: builder.query<MethodologyData, void>({
      query: () => '/methodology',
      transformResponse: (r: any) => r.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetMethodologyQuery } = methodologyApi;
