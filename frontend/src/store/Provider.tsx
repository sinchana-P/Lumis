'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './index';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<LoadingScreen />}
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
