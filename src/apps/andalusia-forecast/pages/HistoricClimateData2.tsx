import React from 'react';
import {Box, Container, Flex} from "@open-pioneer/chakra-integration";
//import { Collapsible } from "@chakra-ui/react";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import {Header} from "../components/MainComponents/Header";
import {MainMap} from "../components/MainComponents/MainMap";
import {MAP_ID} from "../services/MapProvider";
import {MapAnchor, MapContainer} from "@open-pioneer/map";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";

const HistoricClimateData2 = () => {
    const intl =useIntl(); 
    return (
        <Container minWidth={"container.xl"}>
            
            
            <MainMap MAP_ID={MAP_ID} />

            <Box height={"500px"} pt={2}>
                <MapContainer mapId={MAP_ID} role="main">
                    <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                            <ZoomIn mapId={MAP_ID}/>
                            <ZoomOut mapId={MAP_ID}/>
                        </Flex>
                        <Flex role="top">
                            {/*<Collapsible.Root>*/}
                            {/*    <Collapsible.Trigger paddingY="3">Toggle Collapsible</Collapsible.Trigger>*/}
                            {/*    <Collapsible.Content>*/}
                            {/*        <Box padding="4" borderWidth="1px">*/}
                            {/*            <Header subpage={'historic_station'} />*/}
                            {/*        </Box>*/}
                            {/*    </Collapsible.Content>*/}
                            {/*</Collapsible.Root>*/}
                        </Flex>
                    </MapAnchor>
                </MapContainer>
            </Box>
            
        </Container>
    )
};

export default HistoricClimateData2;
