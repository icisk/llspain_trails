import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Forecast } from "./pages/Forecast";
import HistoricClimateData1 from "./pages/HistoricClimateData1";
import Projections from "./pages/Projections";
import Phenology from "./pages/Phenology";
import HydrologicalService from "./pages/HydrologicalService";
import HistoricClimateStations from "./pages/HistoricClimateStations";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { ApplicationContext } from "@open-pioneer/runtime";
import { Flex, Box } from "@open-pioneer/chakra-integration";
const AppUI = () => {
    const baseUrl = import.meta.env["BASE_URL"];
    return (
        <Router basename={baseUrl}> 
            <Box pb="60px">   
                <Navbar />
                <Box flex={1}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/forecast" element={<Forecast />} />
                        <Route path="/historicclimatedata1" element={<HistoricClimateData1 />} />
                        <Route path="/historicclimatestations" element={<HistoricClimateStations />} />
                        <Route path="/projections" element={<Projections />} />
                        <Route path="/phenology" element={<Phenology />} />
                        <Route path="/hydrologicalservice" element={<HydrologicalService />} />
                    </Routes>
                </Box>
                <Footer />
            </Box>
        </Router>
    );
};

export default AppUI;
