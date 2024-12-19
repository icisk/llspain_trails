import React, { useEffect, useRef, useState } from 'react';
import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@open-pioneer/chakra-integration";
import { HStack, Select, VStack } from "@chakra-ui/react";
import { Container } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { ChangeMonth } from "../controls/ChangeMonth";
import { LayerBase, MapAnchor, MapContainer, SimpleLayer, useMapModel } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { RadioGroup, Radio } from "@open-pioneer/chakra-integration";
import { InfoTooltip } from "../components/InfoTooltip/InfoTooltip";
import { RegionZoom } from "../components/RegionZoom/RegionZoom";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";
import { HistoricClimateHook1, HistoricClimateHook2 }  from '../hooks/HistoricClimatehook';
import Layer from "ol/layer/Layer";
import { MAP_ID } from '../services/HistoricClimateMapProvider';
import { MAP_ID2 } from '../services/HistoricClimateMapProvider2';
import {DynamicPrecipitationLegend} from "../components/Legends/DynamicLegend";
import { LayerSwipe } from '../components/LayerSwipe/LayerSwipe';
import { isFormElement } from 'react-router-dom/dist/dom';
import { map } from 'highcharts';

const HistoricClimateData1 = () => {
    const intl = useIntl();

    const mapRef = useRef<HTMLDivElement>(null);
    const [leftLayers, setLeftLayers]= useState<Layer[]>();
    const [rightLayers, setRightLayers]= useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);

    const mapModel = useMapModel(MAP_ID);

    useEffect(() => {
        if(mapModel.map){
            const map = mapModel.map;
            const leftLayer1 = map.layers.getLayerById("mean_temp_1") as SimpleLayer;
            setLeftLayers([leftLayer1.olLayer as Layer])
            const rightLayer1 = map.layers.getLayerById("mean_temp_2") as SimpleLayer;
            setRightLayers([rightLayer1.olLayer as Layer])
        }
    }, [mapModel])

    //HistoricClimateHook1(mapRef);
    HistoricClimateHook2(mapRef);
    
    return (
<Box>
    <Header subpage={'historic_compare'} />
    <Box>
        <VStack>
            <Container flex={2} minWidth={"container.xl"}>
                <div style={{flex: 1}}>
                    <div style={{margin: 20}}>
                        <HStack>
                            <>
                                {intl.formatMessage({id: "global.controls.sel_year"})}
                            </>
                            <Select placeholder={intl.formatMessage({id: "global.vars.year"})}>
                                {[...Array(20)].map((_, i) => 2000 + i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Select>
                        </HStack>
                        <ChangeMonth/>
                    </div>
                    <RadioGroup defaultValue="1">
                        <p>{intl.formatMessage({id: "global.controls.sel_var"})}:</p>
                        <VStack gap="1">
                            <HStack>
                                <Radio
                                    value="1">{intl.formatMessage({id: "global.vars.temp"})}</Radio>
                                <InfoTooltip i18n_path="historic_compare.info.temp"/>
                            </HStack>
                            <HStack>
                                <Radio
                                    value="2">{intl.formatMessage({id: "global.vars.precip"})}</Radio>
                                <InfoTooltip i18n_path="historic_compare.info.precip"/>
                            </HStack>
                        </VStack>
                    </RadioGroup>
                </div>
                <Box width="100%" height="600px" position="relative">
                    <MainMap MAP_ID={MAP_ID}/>
                    <DynamicPrecipitationLegend />           
                </Box>
                
                {(leftLayers && rightLayers && mapModel.map) && 
                    <LayerSwipe map={mapModel.map} sliderValue={sliderValue} onSliderValueChanged={(newValue) => {setSliderValue(newValue)}} leftLayers={leftLayers} rightLayers={rightLayers}></LayerSwipe>
                }
            </Container>
            
            <Box margin={50}></Box>
            
            <Container flex={2} minWidth={"container.xl"}>
                <div style={{flex: 1}}>
                    <div style={{margin: 20}}>
                        <HStack>
                            <>
                                {intl.formatMessage({id: "global.controls.sel_year"})}
                            </>
                            <Select placeholder={intl.formatMessage({id: "global.vars.year"})}>
                                {[...Array(20)].map((_, i) => 2000 + i).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </Select>
                        </HStack>
                        <ChangeMonth/>
                    </div>
                    <RadioGroup defaultValue="1">
                        <p>{intl.formatMessage({id: "global.controls.sel_var"})}:</p>
                        <VStack gap="1">
                            <HStack>
                                <Radio
                                    value="1">{intl.formatMessage({id: "global.vars.temp"})}</Radio>
                                <InfoTooltip i18n_path="historic_compare.info.temp"/>
                            </HStack>
                            <HStack>
                                <Radio
                                    value="2">{intl.formatMessage({id: "global.vars.precip"})}</Radio>
                                <InfoTooltip i18n_path="historic_compare.info.precip"/>
                            </HStack>
                        </VStack>
                    </RadioGroup>
                </div>

                <Box width="100%" height="500px" position="relative">
                    <MainMap MAP_ID={MAP_ID2}/>
                    <DynamicPrecipitationLegend />
                </Box>
            </Container>
           
        </VStack>

    </Box>
</Box>

    );
};

export default HistoricClimateData1;
