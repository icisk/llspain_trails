import React from 'react';
import {Box, Flex} from "@open-pioneer/chakra-integration";
import {HStack, VStack} from "@chakra-ui/react";
import {Container} from "@open-pioneer/chakra-integration";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import {ChangeMonth} from "../controls/ChangeMonth";
import {MapAnchor, MapContainer} from "@open-pioneer/map";
import {MAP_ID} from "../services/MapProvider";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {RadioGroup, Radio} from "@open-pioneer/chakra-integration";
import {Tooltip} from "@open-pioneer/chakra-integration";
import {IconButton} from "@open-pioneer/chakra-integration";

import {InfoTooltip} from "../components/InfoTooltip/InfoTooltip";



const HistoricClimateData1 = () => {
    const intl = useIntl();
    return (
        <Container minWidth={"container.xl"}>
            <InfoBoxComponent
                header={intl.formatMessage({id: "historic.heading"})}
                description={intl.formatMessage({id: "historic.heading_descr"})}
            ></InfoBoxComponent>

            <Container flex={2} minWidth={"container.xl"}>
                <HStack width="100%">
                    <div style={{flex: 1}}>
                        
                        <div style={{margin: 20}}>
                            <ChangeMonth />
                        </div>

                        <RadioGroup defaultValue="1">
                            <p>{intl.formatMessage({id: "global.controls.sel_var"})}:</p>
                            <VStack gap="1">
                                <HStack>
                                    <Radio
                                        value="1">{intl.formatMessage({id: "global.vars.temp"})}</Radio>
                                    <InfoTooltip i18n_path="historic.info.temp" />
                                </HStack>
                                <HStack>
                                    <Radio
                                        value="2">{intl.formatMessage({id: "global.vars.precip"})}</Radio>
                                    <InfoTooltip i18n_path="historic.info.precip" />
                                </HStack>  
                            </VStack>
                        </RadioGroup>

                        <Box height={"500px"} pt={2}>
                            <MapContainer mapId={MAP_ID} role="main">
                                <MapAnchor position="bottom-right" horizontalGap={10}
                                           verticalGap={30}>
                                    <Flex role="bottom-right" direction="column" gap={1}
                                          padding={1}>
                                        <ZoomIn mapId={MAP_ID}/>
                                        <ZoomOut mapId={MAP_ID}/>
                                    </Flex>
                                </MapAnchor>
                            </MapContainer>

                        </Box>
                    </div>
                    <div style={{flex: 1}}>
                        <ChangeMonth/>

                        <RadioGroup defaultValue="1">
                            <VStack gap="1">
                                <Radio
                                    value="1">{intl.formatMessage({id: "global.vars.temp"})}</Radio>
                                <Radio
                                    value="2">{intl.formatMessage({id: "global.vars.precip"})}</Radio>
                            </VStack>
                        </RadioGroup>

                        <Box height={"500px"} pt={2}>
                            <MapContainer mapId={MAP_ID} role="next">
                                <MapAnchor position="bottom-right" horizontalGap={10}
                                           verticalGap={30}>
                                    <Flex role="bottom-right" direction="column" gap={1}
                                          padding={1}>
                                        <ZoomIn mapId={MAP_ID}/>
                                        <ZoomOut mapId={MAP_ID}/>
                                    </Flex>
                                </MapAnchor>
                            </MapContainer>

                        </Box>
                    </div>

                </HStack>

            </Container>

        </Container>


    )
};

export default HistoricClimateData1;
