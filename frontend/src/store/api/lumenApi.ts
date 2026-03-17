import { baseApi } from './baseApi';

export type LumenMode = 'VENT' | 'GUIDED' | 'ANALYSIS' | 'ADVICE' | 'TIMING';
export type AnalysisDepth = 'FULL_SPECTRUM' | 'COSMIC' | 'BEHAVIORAL';

export interface LumenChatRequest {
  prompt: string;
  mode: LumenMode;
  depth: AnalysisDepth;
  memberIds: string[];
  history: { role: 'user' | 'assistant'; content: string }[];
  conversationId?: string;
}

export interface LumenChatResponse {
  text: string;
  mode: LumenMode;
  model: string;
  intentDetected: string;
  latencyMs: number;
  conversationId?: string;
}

export interface RelationshipReportRequest {
  depth?: AnalysisDepth;
}

// ── Conversation types ─────────────────────────────────────────
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  depth?: AnalysisDepth;
  mode?: LumenMode;
  model?: string;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  mode: string;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

export const lumenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    lumenAsk: builder.mutation<{ success: boolean; data: LumenChatResponse }, LumenChatRequest>({
      query: (body) => ({ url: '/lumen/ask', method: 'POST', body }),
    }),
    lumenSelfReport: builder.query<{ success: boolean; data: { text: string } }, void>({
      query: () => '/lumen/self-report',
    }),
    lumenRelationshipReport: builder.mutation<{ success: boolean; data: { text: string } }, { memberId: string } & RelationshipReportRequest>({
      query: ({ memberId, ...body }) => ({ url: `/lumen/relationship-report/${memberId}`, method: 'POST', body }),
    }),
    lumenWeeklyDigest: builder.query<{ success: boolean; data: { text: string } }, void>({
      query: () => '/lumen/weekly-digest',
    }),
    lumenListConversations: builder.query<{ success: boolean; data: ConversationRecord[] }, void>({
      query: () => '/lumen/conversations',
      providesTags: ['LumenConversations'],
    }),
    lumenGetConversation: builder.query<{ success: boolean; data: ConversationRecord }, string>({
      query: (id) => `/lumen/conversations/${id}`,
    }),
    lumenDeleteConversation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/lumen/conversations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LumenConversations'],
    }),
  }),
});

export const {
  useLumenAskMutation,
  useLumenSelfReportQuery,
  useLumenRelationshipReportMutation,
  useLumenWeeklyDigestQuery,
  useLumenListConversationsQuery,
  useLumenGetConversationQuery,
  useLumenDeleteConversationMutation,
} = lumenApi;
