import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ComplaintProvider } from './context/ComplaintContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <ComplaintProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ComplaintProvider>
  );
}

export default App;
