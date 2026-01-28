import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { OperatorDashboard } from './components/OperatorDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/operator" element={<OperatorDashboard />} />
        <Route path="/supervisor" element={<SupervisorDashboard />} />
        {/* Qualquer rota desconhecida volta pro login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;