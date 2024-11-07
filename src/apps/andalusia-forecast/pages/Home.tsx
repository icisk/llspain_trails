import React from 'react';
import { Box } from "@open-pioneer/chakra-integration"
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";


const Home = () => {
    const intl = useIntl();
    return (
        <Box>
            <img src="/images/logo.png" alt = "I-CISK logo" style={{ width: "40%", height: "auto" }}/>
            <InfoBoxComponent
                header={intl.formatMessage({id: "heading_home"})}
                description={intl.formatMessage({id: "description_home"})}
            ></InfoBoxComponent>
        </Box>
        
    )
};

export default Home;
