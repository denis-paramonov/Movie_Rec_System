import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Recommendations from './Recommendations';
import History from './History';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/recommend" element={<Recommendations />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default App;
