import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import Forecast from "./pages/Forecast";
import Hotspots from "./pages/Hotspots";
import Alerts from "./pages/Alerts";
import About from "./pages/About";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;