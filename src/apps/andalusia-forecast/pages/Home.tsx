import React from 'react';
import { Box } from "@open-pioneer/chakra-integration"
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";


const Home = () => {
    const intl = useIntl();
    const baseUrl = import.meta.env['BASE_URL']
    return (
        <Box>
            <img src={baseUrl + "images/logo.png"} alt = "I-CISK logo" style={{ width: "40%", height: "auto" }}/>
            <InfoBoxComponent
                header={intl.formatMessage({id: "home.heading"})}
                description={intl.formatMessage({id: "home.heading_descr"})}
            ></InfoBoxComponent>
        </Box>
        
    )
};

export default Home;
