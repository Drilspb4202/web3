import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import type { AppProps } from 'next/app';
import { wagmiConfig } from '@/config/wagmi';
import '@/styles/globals.css';
import { useEffect } from 'react';
// Импортируем все компоненты из основного модуля @mui/material
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Создание темы Material UI, соответствующей цветам Tailwind
const theme = createTheme({
  palette: {
    primary: {
      main: '#0095ff', // primary-600 из tailwind
      light: '#3ecbff', // primary-400
      dark: '#0077cc', // primary-700
    },
    secondary: {
      main: '#f98307', // secondary-500
      light: '#ffa41f', // secondary-400
      dark: '#dd6302', // secondary-600
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f9fafb', // gray-50
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
  },
});

// Отключение предупреждений
// @ts-ignore Игнорируем ошибку TypeScript для этого объявления
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Игнорируем предупреждение о fetchPriority
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: React does not recognize the `fetchPriority` prop') ||
       args[0].includes('legacy prop "layout"') ||
       args[0].includes('legacy prop "objectFit"'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };
}

// Создание клиента для React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  // Перехват ошибок wagmi
  useEffect(() => {
    const handleWagmiError = (error: any) => {
      console.error('Wagmi глобальная ошибка:', error);
    };

    window.addEventListener('unhandledrejection', handleWagmiError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleWagmiError);
    };
  }, []);

  // Проверка наличия MetaMask
  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window !== 'undefined' && !window.ethereum) {
        console.warn('MetaMask не установлен');
      }
    };

    checkMetaMask();
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default MyApp; 