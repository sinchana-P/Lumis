import { store } from '../index';
import { setUser, clearUser } from '../slices/authSlice';
import { setTheme, toggleTheme, setLumenMode } from '../slices/uiSlice';

describe('Redux Store', () => {
  it('should have the correct initial state', () => {
    const state = store.getState();
    
    expect(state.auth).toBeDefined();
    expect(state.ui).toBeDefined();
    expect(state.api).toBeDefined();
  });

  it('should handle auth actions', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
    };

    store.dispatch(setUser(mockUser as any));
    let state = store.getState();
    expect(state.auth.user).toEqual(mockUser);
    expect(state.auth.isAuthenticated).toBe(true);

    store.dispatch(clearUser());
    state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('should handle UI actions', () => {
    store.dispatch(setTheme('dark'));
    let state = store.getState();
    expect(state.ui.theme).toBe('dark');

    store.dispatch(toggleTheme());
    state = store.getState();
    expect(state.ui.theme).toBe('light');

    store.dispatch(setLumenMode('analysis'));
    state = store.getState();
    expect(state.ui.lumenMode).toBe('analysis');
  });
});
