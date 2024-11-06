import React from 'react';
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";


const Home = () => {
    const intl = useIntl();
    return (
        <InfoBoxComponent
            header={intl.formatMessage({id: "heading_home"})}
            description={intl.formatMessage({id: "description_home"})}
        ></InfoBoxComponent>
        
    )
};

export default Home;
