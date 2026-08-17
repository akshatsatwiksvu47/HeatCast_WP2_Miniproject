import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Monitoring from "./pages/Monitoring/Monitoring";
import Forecast from "./pages/Forecast/Forecast";
import Hotspots from "./pages/Hotspots/Hotspots";
import Alerts from "./pages/Alerts/Alerts";
import About from "./pages/About/About";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/hotspots" element={<Hotspots />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;