import React from 'react';
import './App.css';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Mobile from './pages/Mobile';
import { createTheme, ThemeProvider } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  }
});

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/mobile" element={<Mobile />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </SnackbarProvider >
  );
}
