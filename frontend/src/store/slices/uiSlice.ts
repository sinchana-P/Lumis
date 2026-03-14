import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  journalMode: boolean;
  analysisDepth: 'cosmic' | 'behavioral' | 'full_spectrum';
  lumenMode: 'vent' | 'guided' | 'analysis' | 'advice' | 'timing';
  notifications: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }[];
}

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  journalMode: false,
  analysisDepth: 'full_spectrum',
  lumenMode: 'guided',
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumis_theme', action.payload);
        document.documentElement.classList.toggle('dark', action.payload === 'dark');
      }
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumis_theme', state.theme);
        document.documentElement.classList.toggle('dark', state.theme === 'dark');
      }
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setJournalMode: (state, action: PayloadAction<boolean>) => {
      state.journalMode = action.payload;
    },
    toggleJournalMode: (state) => {
      state.journalMode = !state.journalMode;
    },
    setAnalysisDepth: (state, action: PayloadAction<'cosmic' | 'behavioral' | 'full_spectrum'>) => {
      state.analysisDepth = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumis_analysis_depth', action.payload);
      }
    },
    setLumenMode: (state, action: PayloadAction<'vent' | 'guided' | 'analysis' | 'advice' | 'timing'>) => {
      state.lumenMode = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  setJournalMode,
  toggleJournalMode,
  setAnalysisDepth,
  setLumenMode,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
