import React, {useState} from 'react';
import {
    Box,
    Center,
    Container,
    Flex,
    HStack,
    Spacer,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Text,
    SliderMark
} from "@open-pioneer/chakra-integration";
import {CoordinateViewer} from "@open-pioneer/coordinate-viewer";
import {MapAnchor, MapContainer} from "@open-pioneer/map";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {ScaleBar} from "@open-pioneer/scale-bar";
import {ScaleViewer} from "@open-pioneer/scale-viewer";
import {InfoBoxComponent} from "info-box";
import {Point} from "ol/geom";
import {useIntl} from "open-pioneer:react-hooks";
import {ZoomPointButtonComponent} from "zoom-point-button";

import {ChangeMonth} from "../controls/ChangeMonth";
import {MAP_ID} from "../services/BioindicatorMapProvider";
import {ChangeVariable} from "../controls/ChangeVariable";
import {completeExtent, cazorlaPoint, pedrochesPoint} from "../components/utils/globals";
import {RegionZoom} from "../components/RegionZoom/RegionZoom";

import {CoordsScaleBar} from "../components/CoordsScaleBar/CoordsScaleBar"

export default Phenology;

export function Phenology() {
    const intl = useIntl();
    const [sliderValue, setSliderValue] = useState(1981);

    return (
        <Container minWidth={"container.xl"}>

            <InfoBoxComponent
                header={intl.formatMessage({id: "phenology.heading"})}
                description={intl.formatMessage({id: "phenology.heading_descr"})}
            ></InfoBoxComponent>

            <Box width={'100%'} padding={5}>
                <HStack>        
                    <Slider defaultValue={1981} min={1981} max={2010} step={1}
                            onChange={(value) => setSliderValue(value)}>
                        <SliderTrack bg="gray.200">
                            <SliderFilledTrack bg="blue.400"/>
                        </SliderTrack>
                        <SliderThumb boxSize={10} bg="blue.400">
                            <Box color="white" fontSize="s" textAlign="center">
                                {sliderValue}
                            </Box>
                        </SliderThumb>
                    </Slider>
                    {/*<Box display="flex" justifyContent="space-between" mt={2}>*/}
                    {/*    {[1981, 2010].map((mark) => (*/}
                    {/*        <Text key={mark} fontSize="sm">*/}
                    {/*            {mark}*/}
                    {/*        </Text>*/}
                    {/*    ))}                           */}
                    {/*</Box>                    */}
                </HStack>
                
            </Box>
            <Box height={500}>
                <MapContainer mapId={MAP_ID} role="main">
                    <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                        <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                            <ZoomIn mapId={MAP_ID}/>
                            <ZoomOut mapId={MAP_ID}/>
                        </Flex>
                    </MapAnchor>
                </MapContainer>
                <RegionZoom MAP_ID={MAP_ID} />
            </Box>
            <CoordsScaleBar MAP_ID={MAP_ID} />

            
        </Container>
    )
}
