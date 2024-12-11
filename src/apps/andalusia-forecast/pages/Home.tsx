import React from 'react';
import { Box } from "@open-pioneer/chakra-integration"
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";


const Home = () => {
    const intl = useIntl();
    return (
        <Box>
            <img src="/public/images/logo.png" alt = "I-CISK logo" style={{ width: "40%", height: "auto" }}/>
            <InfoBoxComponent
                header={intl.formatMessage({id: "home.heading"})}
                description={intl.formatMessage({id: "home.heading_descr"})}
            ></InfoBoxComponent>
        </Box>
        
    )
};

export default Home;
