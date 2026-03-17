import { baseApi } from './baseApi';

export interface DashboardEmotionalWeather {
  summary: string;
  vibe: string;
}

export interface DashboardActivity7d {
  interactions: number;
  incidents: number;
  journalEntries: number;
  patternsActive: number;
}

export interface DashboardSignal {
  type: 'pattern' | 'incident' | 'interaction';
  memberName: string;
  title: string;
  date: string;
}

export interface DashboardNumerologySnapshot {
  personalYear?: number;
  personalMonth?: number;
}

export interface DashboardMemberStats {
  total: number;
  friends: number;
  family: number;
}

export interface DashboardSummary {
  emotionalWeather: DashboardEmotionalWeather;
  activity7d: DashboardActivity7d;
  recentSignals: DashboardSignal[];
  memberStats: DashboardMemberStats;
  numerologySnapshot: DashboardNumerologySnapshot | null;
  generatedAt: string;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummary, void>({
      query: () => '/dashboard/summary',
      transformResponse: (response: any) => response.data,
      providesTags: ['DashboardSummary'],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
