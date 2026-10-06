import { createRoot } from 'react-dom/client';
import App from './app/App';
import { AppProviders } from './app/providers';
import './styles/tokens.css';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('The application root element is missing.');
}

createRoot(rootElement).render(
  <AppProviders>
    <App />
  </AppProviders>,
);