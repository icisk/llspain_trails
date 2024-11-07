import React , { useState } from 'react';
import { Box, Center, Container, Flex, HStack, Spacer, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text } from "@open-pioneer/chakra-integration";
import { CoordinateViewer } from "@open-pioneer/coordinate-viewer";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { ScaleBar } from "@open-pioneer/scale-bar";
import { ScaleViewer } from "@open-pioneer/scale-viewer";
import { InfoBoxComponent } from "info-box";
import { Point } from "ol/geom";
import { useIntl } from "open-pioneer:react-hooks";
import { ZoomPointButtonComponent } from "zoom-point-button";

import { ChangeMonth } from "../controls/ChangeMonth";
import { MAP_ID } from "../services/BioindicatorMapProvider";
import { ChangeVariable } from "../controls/ChangeVariable";
import {completeExtent, cazorlaPoint, pedrochesPoint} from "../components/utils/globals";

export default BiologicalEffectiveDegreeDays;

export function BiologicalEffectiveDegreeDays(){
    const intl = useIntl();
    const [sliderValue, setSliderValue] = useState(1981);

    return (
        <Container minWidth={"container.xl"}>

            <InfoBoxComponent
                header={intl.formatMessage({ id: "heading_bioindicators" })}
                description={intl.formatMessage({ id: "description_bioindicators" })}
            ></InfoBoxComponent>
                        
            <Box height={"500px"} pt={2}>
                <HStack>
                    <HStack>
                        <Box width={600}>
                            <Slider defaultValue={1981} min={1981} max={2010} step={1} onChange={(value) => setSliderValue(value)}>
                                <SliderTrack bg="gray.200">
                                    <SliderFilledTrack bg="blue.400"/>
                                </SliderTrack>
                                <SliderThumb boxSize={6} bg="blue.400"/>
                            </Slider>
                            <Box display="flex" justifyContent="space-between" mt={2}>
                                {[1981, 2010].map((mark) => (
                                    <Text key={mark} fontSize="sm">
                                        {mark}
                                    </Text>
                                ))}
                            </Box>
                        </Box>
                    </HStack>
                    <Text mt={4}>
                                Year: {sliderValue}
                    </Text>
                </HStack>
                <MapContainer mapId={MAP_ID} role="main">
                    <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                            <ZoomIn mapId={MAP_ID} />
                            <ZoomOut mapId={MAP_ID} />
                        </Flex>
                    </MapAnchor>
                </MapContainer>
            </Box>

            <HStack height="24px">
                <CoordinateViewer mapId={MAP_ID} displayProjectionCode="EPSG:4326" precision={3} />
                <Spacer />
                <ScaleBar mapId={MAP_ID}></ScaleBar>
                <ScaleViewer mapId={MAP_ID}></ScaleViewer>
            </HStack>
            <Center pt={2}>
                <HStack>
                    <ZoomPointButtonComponent
                        label="Carzola"
                        mapId={MAP_ID}
                        point={cazorlaPoint.geom}
                        zoom={cazorlaPoint.zoom}
                    ></ZoomPointButtonComponent>
                    <ZoomPointButtonComponent
                        label="Los Pedroches"
                        mapId={MAP_ID}
                        point={pedrochesPoint.geom}
                        zoom={pedrochesPoint.zoom}
                    ></ZoomPointButtonComponent>
                    <ZoomPointButtonComponent
                        label="General"
                        mapId={MAP_ID}
                        point={completeExtent.geom}
                        zoom={completeExtent.zoom}
                    ></ZoomPointButtonComponent>
                </HStack>
            </Center>
        </Container>
    )
}