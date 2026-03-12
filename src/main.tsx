import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import App from './App.tsx';
import './index.css';

window.addEventListener('beforeunload', () => {
  sessionStorage.removeItem('activitiesData');
  sessionStorage.removeItem('timetableData');
});

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
