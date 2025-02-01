// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
      <Router>
        <div className="app">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<div>Dashboard</div>} />
                {/* Add more routes here as you create them */}
              </Routes>
            </main>
          </div>
        </div>
      </Router>
  );
}

export default App;