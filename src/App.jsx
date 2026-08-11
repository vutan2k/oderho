import React from 'react';
import { AppProvider } from './context/AppContext';
import KROrderHomePage from './pages/KROrderHomePage';

export default function App() {
  return (
    <AppProvider>
      <KROrderHomePage />
    </AppProvider>
  );
}
