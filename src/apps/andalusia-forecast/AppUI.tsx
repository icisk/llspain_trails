import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Forecast } from "./pages/Forecast";
import HistoricClimateData1 from "./pages/HistoricClimateData1";
import Projections from "./pages/Projections";
import Phenology from "./pages/Phenology";
import HydrologicalService from "./pages/HydrologicalService";
import HistoricClimateStations from "./pages/HistoricClimateStations";
import OliveOil from "./pages/OliveOil";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { ApplicationContext } from "@open-pioneer/runtime";
import { Flex, Box } from "@open-pioneer/chakra-integration";
const AppUI = () => {
    const baseUrl = import.meta.env["BASE_URL"];
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    
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
                        <Route path="/oliveoil" element={<OliveOil />} />
                    </Routes>
                </Box>
                {isDesktop && <Footer />}
            </Box>
        </Router>
    );
};

export default AppUI;
