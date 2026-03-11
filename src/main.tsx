import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clear cached data on page refresh so it fetches fresh data next time
window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('activitiesData');
  sessionStorage.removeItem('timetableData');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
