import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={createTheme({
      palette: {
        mode: 'dark',
      },
    })}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);