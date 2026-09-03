import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import SplitterLayout from './modules/splitter/SplitterLayout';
import Sidebar from './Sidebar';
import ExpenseList from './ExpenseList';

const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    localStorage.removeItem('token');
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    localStorage.removeItem('token');
    return null;
  }
  return token;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getValidToken());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSplitterMode, setIsSplitterMode] = useState(() => {
    return localStorage.getItem('splitterMode') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const toggleSplitter = () => {
    const newState = !isSplitterMode;
    setIsSplitterMode(newState);
    localStorage.setItem('splitterMode', newState);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-[var(--background)]">
        {isLoggedIn && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            isSplitterMode={isSplitterMode}
            onToggleSplitter={toggleSplitter}
          />
        )}

        <main className={`flex-1 overflow-x-hidden ${isLoggedIn ? 'lg:pl-0' : ''}`}>
          <Routes>
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <div className="h-full">
                    <ExpenseList activeTab={activeTab} />
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* Splitter Routes */}
            <Route
              path="/splitter"
              element={isLoggedIn ? <SplitterLayout /> : <Navigate to="/login" />}
            />
            <Route
              path="/splitter/:groupId"
              element={isLoggedIn ? <SplitterLayout /> : <Navigate to="/login" />}
            />
            <Route
              path="/splitter/insights"
              element={isLoggedIn ? <SplitterLayout isInsights /> : <Navigate to="/login" />}
            />

            <Route
              path="/login"
              element={<Login onLogin={() => setIsLoggedIn(true)} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
