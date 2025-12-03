import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (gcTime é o novo nome para cacheTime)
    },
  },
});

// Função para inicializar a aplicação
function initApp() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found. Retrying...');
    // Tentar novamente após um pequeno delay
    setTimeout(initApp, 100);
    return;
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AuthProvider>
              <CssBaseline />
              <App />
            </AuthProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Aguardar o DOM estar pronto antes de inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM já está pronto
  initApp();
} 

// Desregistrar qualquer Service Worker antigo e limpar caches de app
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

if (window.caches) {
  caches.keys().then((keys) => {
    keys.forEach((key) => caches.delete(key));
  });
}