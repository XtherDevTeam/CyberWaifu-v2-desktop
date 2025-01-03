import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'overlayscrollbars/overlayscrollbars.css';

import React from 'react';

import ReactDOM from 'react-dom/client';
import {
  createHashRouter,
  RouterProvider,
} from 'react-router-dom';
import usePrefersColorScheme from 'use-prefers-color-scheme';

import { ThemeProvider } from '@mui/material';

import reportWebVitals from './reportWebVitals';
import Home from './routes/Home';
import SignIn from './routes/SignIn';
import VoiceChat from './routes/VoiceChat';
import VoiceTest from './routes/VoiceTest';
import theme from './shared/theme';

const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/signin',
    element: <SignIn />,
  },
  {
    path: '/voice_chat',
    element: <VoiceChat />,
  },
  {
    path: '/voice_test',
    element: <VoiceTest />,
  },
  {
    path: '*',
    element: <h1>Page not found</h1>,
  }
]);

function App() {
  return (
    <ThemeProvider theme={usePrefersColorScheme() == 'light' ? theme.light : theme.dark}>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
