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
import {HistoricPickerLeft} from "../components/VariablePicker/HistoricPickerLeft";
import {HistoricPickerRight} from "../components/VariablePicker/HistoricPickerRight";
import {useService} from "open-pioneer:react-hooks";
import {Selection} from "../components/VariablePicker/HistoricPickerLeft";
import {Knecht} from "../components/Legends/Knecht";

const HistoricClimateData1 = () => {
    const intl = useIntl();
    const histLayerHandler = useService<HistoricLayerHandler>("app.HistoricLayerHandler");
    
    const mapRef = useRef<HTMLDivElement>(null);
    const [leftLayers, setLeftLayers]= useState<Layer[]>();
    const [rightLayers, setRightLayers]= useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);


    
    const mapModel = useMapModel(MAP_ID);

    useEffect(() => {
        if(mapModel.map){
            const map = mapModel.map;
            const leftLayer1 = map.layers.getLayerById("left") as SimpleLayer;
            setLeftLayers([leftLayer1.olLayer as Layer])
            const rightLayer1 = map.layers.getLayerById("right") as SimpleLayer;
            setRightLayers([rightLayer1.olLayer as Layer])
        }
    }, [mapModel])




    type VariableValues = {
        [key: string]: string;
    };


    
    function onLeftPickerChange(field: keyof Selection,value:string | number ) {
        if (field === 'year') {
            histLayerHandler.setYearLeft(value as number);
        } else if (field === 'month') {
            histLayerHandler.setMonthLeft(value as number);
        } else if (field === 'var') {
            histLayerHandler.setVarLeft(value as string);
        }
    }

    function onRightPickerChange(field: keyof Selection,value:string | number ) {
        if (field === 'year') {
            histLayerHandler.setYearRight(value as number);
        } else if (field === 'month') {
            histLayerHandler.setMonthRight(value as number);
        } else if (field === 'var') {
            histLayerHandler.setVarRight(value as string);
        }
    }
    
    //HistoricClimateHook1(mapRef);
    HistoricClimateHook2(mapRef);
    
    return (
<Box>
    <Header subpage={'historic_compare'} />
    <Box>
        <HStack>
            <HistoricPickerLeft onChange={onLeftPickerChange}/>
            <HistoricPickerRight onChange={onRightPickerChange}/>
        </HStack>
            <Container flex={2} minWidth={"container.xl"}>
                <Box width="100%" height="600px" position="relative">
                    <MainMap MAP_ID={MAP_ID}/>
                    <DynamicPrecipitationLegend />
                    <Knecht />
                </Box>

                {(leftLayers && rightLayers && mapModel.map) &&
                    <LayerSwipe map={mapModel.map} 
                                sliderValue={sliderValue} 
                                onSliderValueChanged={(newValue) => {setSliderValue(newValue)}} 
                                leftLayers={leftLayers} 
                                rightLayers={rightLayers} />
                }
            </Container>     
   
    </Box>
</Box>

    );
};

export default HistoricClimateData1;
