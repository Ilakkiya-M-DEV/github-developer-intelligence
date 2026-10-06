import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import RepositoryPage from '../pages/RepositoryPage';
import SearchPage from '../pages/SearchPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <SearchPage />,
      },
      {
        path: 'repositories/:owner/:repo',
        element: <RepositoryPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);