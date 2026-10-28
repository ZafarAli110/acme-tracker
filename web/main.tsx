import '@fontsource-variable/inter';
import {CssBaseline} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {Navigate, RouterProvider, createBrowserRouter} from 'react-router';
import {ApiError} from './api/tracker-api';
import {AppLayout} from './layout/AppLayout';
import {BacklogPage} from './pages/BacklogPage';
import {BoardPage} from './pages/BoardPage';
import {TicketPage} from './pages/TicketPage';
import {trackerTheme} from './theme';

// A 4xx answer will not change by asking again; anything else is retried once.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => failureCount < 1 && !(error instanceof ApiError && error.problem.status < 500),
      refetchOnWindowFocus: false,
    },
  },
});

// Every page is registered here. src/server.ts serves index.html for the same paths.
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {index: true, element: <Navigate to="/board" replace />},
      {path: 'board', element: <BoardPage />},
      {path: 'backlog', element: <BacklogPage />},
      {path: 'tickets/:key', element: <TicketPage />},
    ],
  },
]);

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={trackerTheme} defaultMode="system">
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
