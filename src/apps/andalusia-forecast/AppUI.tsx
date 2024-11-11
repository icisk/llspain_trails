import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import { Forecast } from "./pages/Forecast";
import HistoricClimateData1 from "./pages/HistoricClimateData1";
import HistoricClimateData2 from "./pages/HistoricClimateData2";
import Projections from "./pages/Projections";
import Phaenology from "./pages/Phaenology";
import HydrologicalService from "./pages/HydrologicalService";
import Navbar from "./components/Navbar/Navbar";

const AppUI = () => {
    return (
        <Router>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Forecast" element={<Forecast />} />
                <Route path="/HistoricClimateData1" element={<HistoricClimateData1 />} />
                <Route path="/HistoricClimateData2" element={<HistoricClimateData2 />} />
                <Route path="/Projections" element={<Projections />} />
                <Route path="/Phaenology" element={<Phaenology />} />
                <Route path="/HydrologicalService" element={<HydrologicalService />} />
            </Routes>
        </Router>
    );
};

export default AppUI;
