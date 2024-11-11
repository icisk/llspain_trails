import React from 'react';
import {Container} from "@open-pioneer/chakra-integration";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import {Header} from "../components/MainComponents/Header";
import {Map} from "../components/MainComponents/Map";
import {MAP_ID} from "../services/MapProvider";


const HistoricClimateData2 = () => {
    const intl =useIntl(); 
    return (
        <Container minWidth={"container.xl"}>
            
            <Header subpage={'historic_station'} />
            <Map MAP_ID={MAP_ID} />            
            
        </Container>
    )
};

export default HistoricClimateData2;
