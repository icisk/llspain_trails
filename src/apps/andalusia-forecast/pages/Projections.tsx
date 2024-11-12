import React from 'react';
import {Container} from "@open-pioneer/chakra-integration";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import {Header} from "../components/MainComponents/Header";
import {MainMap} from "../components/MainComponents/MainMap";
import {MAP_ID} from "../services/MapProvider";


const Projections = () => {
    const intl = useIntl();
    return (
        <Container minWidth={'container.xl'}>
            <Header subpage={'projections'} />
            <MainMap MAP_ID={MAP_ID} />
        </Container>
    )
}


export default Projections;
