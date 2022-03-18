import React from "react";
import "./App.css";
import { SnackbarProvider } from "notistack";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import Login from "./pages/Login";
import Mobile from "./pages/Mobile";
import MobileEdit from "./pages/MobileEdit";
import Pc from "./pages/Pc";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <ThemeProvider theme={darkTheme}>
        <BrowserRouter>
          <Routes>
            <Route path="/editor/" element={<Login />} />
            <Route path="/editor/mobile" element={<Mobile />} />
            <Route path="/editor/pc" element={<Pc />} />
            <Route path="/editor/mobile_edit/:id" element={<MobileEdit />} />
            <Route path="*" element={<Navigate to="/editor/" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </SnackbarProvider>
  );
}
