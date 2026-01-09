import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardPage from './components/DashboardPage';
import AttendancePage from './components/AttendancePage';
import ReportPage from './components/ReportPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
