import React from 'react';
import './App.css';
import LeafletMap from './pages/LeafletMap';
import { SnackbarProvider } from "notistack";

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <div className="App">
        <LeafletMap />
      </div>
    </SnackbarProvider>
  )
}

