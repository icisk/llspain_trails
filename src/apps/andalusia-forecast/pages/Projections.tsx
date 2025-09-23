import React, {useEffect, useState} from "react";
import {
    Container,
    Box,
    FormControl,
    FormLabel,
    Select,
    Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, HStack, Flex
} from "@open-pioneer/chakra-integration";
import {useIntl, useService} from "open-pioneer:react-hooks";
import { Header } from "../components/MainComponents/Header";
import {MapAnchor, MapContainer, useMapModel} from "@open-pioneer/map";
import { MAP_ID } from "../services/ProjectionMapProvider";
import { transform } from "ol/proj";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import {ProjectionLayerHandler} from "../services/ProjectionLayerHandler";
import { DynamicLegend } from "../components/Legends/DynamicLegend";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {CoordsScaleBar} from "../components/CoordsScaleBar/CoordsScaleBar";
import {espanolChartOptions} from "../components/Charts/ChartOptions";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { createMarker, markerStyle } from "../components/utils/marker";

const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 100 });

const Projections = () => {
    const intl = useIntl();
    const [projectionData, setProjectionData] = React.useState(null);
    const [itemsUrl, setItemsUrl] = React.useState<string | null>(null);
    const [variable, setVariable] = React.useState<"temp" | "precip">("temp");
    
    const [chartOptions, setChartOptions] = React.useState<any>({
        title: { text: "Proyecciones Climáticas" },
        xAxis: {
            type: "datetime",
            title: { text: "Fecha" },
            labels: {
                format: '{value:%d %b %Y}'
            }
        },
        yAxis: { title: { text: "Valor" } },
        tooltip: { valueDecimals: 2 },
        series: []
    });
    Highcharts.setOptions(espanolChartOptions(intl));
    const mapState = useMapModel(MAP_ID);
    const projectionService = useService<ProjectionLayerHandler>("app.ProjectionLayerHandler");
    const timestamps:Date[] = [];
    for (let year = 2026; year <= 2040; year++) {
        for (let month = 1; month <= 12; month++) {
            timestamps.push(new Date(Date.UTC(year, month - 1, 1)));
        }
    }
    const [sliderValue, setSliderValue] = React.useState(timestamps[0]);


    const handleMapClick = React.useCallback((event: any) => {
        const [lon, lat] = transform(event.coordinate, "EPSG:3857", "EPSG:25830");
        const newEndpointBaseUrl = "https://i-cisk.dev.52north.org/data/collections/creaf_projection/position";
        // console.log("Map clicked at (lon, lat):", lon, lat);
        setItemsUrl(`${newEndpointBaseUrl}?f=json&coords=POINT(${lon.toString()} ${lat.toString()})`);

        // Update marker position
        markerSource.clear();
        const marker = createMarker(event.coordinate, markerStyle);
        markerSource.addFeature(marker);
    }, []);

    React.useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            olMap.on("click", handleMapClick);
            return () => {
                olMap.un("click", handleMapClick);
            };
        }
    }, [mapState, handleMapClick]);

        
    React.useEffect(() => {
        if (itemsUrl) {
            fetch(itemsUrl)
                .then((res) => res.json())
                .then((itemsData) => {
                    // console.log("Fetched chart data:", itemsData);
                    const newSeries = [];
                    // console.log(timestamps);
                    if (timestamps.length > 0 && itemsData.ranges) {
                        for (const varName in itemsData.ranges) {
                            const isTemp = varName.includes("temp");
                            const isPrecip = varName.includes("pr");
                            if ((variable === "temp" && isTemp) || (variable === "precip" && isPrecip)) {
                                const values = itemsData.ranges[varName].values;
                                const seriesData = values.map((value: number, index: number)=> [timestamps[index]?.getTime(), value] )
                                newSeries.push({name: varName, data: seriesData});
                            }
                        }
                    }
                    console.log(newSeries);
                    setChartOptions((prev: any) => ({
                        ...prev,
                        series: newSeries
                    }));
                })
                .catch(console.error);
        }
    }, [itemsUrl, variable]);
    
    
    function onSliderChange(index: number){
        setSliderValue(timestamps[index]);
    }
    useEffect(() => {
        projectionService.setcurrentDate(sliderValue)
    }, [sliderValue, projectionService]);
    
    function onVariableChange(){
        setVariable(prev => prev === "temp" ? "precip" : "temp");
    }
    useEffect(() => {
        projectionService.setcurrentVariable(variable)
    }, [variable, projectionService]);

    // Marker on click
    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            olMap.addLayer(markerLayer);
            olMap.on("click", handleMapClick);
            return () => {
                olMap.removeLayer(markerLayer);
                olMap.un("click", handleMapClick);
            }
        }

    }, [mapState]);

    function getSeasonLabel(date: Date) {
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthlabels = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        return `${intl.formatMessage({id: `global.months.${monthlabels[month]}`})} ${year}`;
    }

    return (
        <Container minWidth={"container.xl"}>
            <Header subpage={"projections"} />
                <HStack>                    
                        <FormLabel htmlFor="variable-select">
                            {intl.formatMessage({id: "global.controls.sel_var"})}
                        </FormLabel>
                        <Select
                            id="variable-select"
                            value={variable}
                            onChange={onVariableChange}
                        >
                            <option value="temp">{intl.formatMessage({id: "global.vars.temp"})}</option>
                            <option value="precip">{intl.formatMessage({ id: "global.vars.precip" })}</option>
                        </Select>                     
                </HStack>

            <Slider
                min={0}
                max={timestamps.length - 1}
                step={1}
                value={timestamps.findIndex(date => date.getTime() === sliderValue?.getTime())}
                onChange={onSliderChange}
            >
                <SliderTrack bg="gray.200">
                    <SliderFilledTrack bg="blue.450" />
                    {timestamps.map((date, index) => {
                        const year = date.getFullYear();
                        const isFirstOfYear =
                            index === 0 || timestamps[index - 1].getFullYear() !== year;
                        const isFifthYear = isFirstOfYear && year % 5 === 0;

                        return (
                            isFirstOfYear && (
                                <Box
                                    key={`tick-${year}`}
                                    position="absolute"
                                    left={`${(index / (timestamps.length - 1)) * 100}%`}
                                    bottom="-8px"
                                    width="2px"
                                    height={isFifthYear ? "30px" : "10px"}
                                    bg="black"
                                />
                            )
                        );
                    })}
                </SliderTrack>
                <SliderThumb boxSize={30} bg="blue.450" />
            </Slider>            
            <Box position="relative" mt="0.5" height="20px">
                {timestamps.map((date, index) => {
                    const year = date.getFullYear();
                    const isFirstOfYear =
                        index === 0 || timestamps[index - 1].getFullYear() !== year;
                    const isFifthYear = isFirstOfYear && year % 5 === 0;
                    return (
                        isFifthYear && (
                            <Text
                                key={`label-${year}`}
                                position="absolute"
                                left={`${(index / (timestamps.length - 1)) * 100}%`}
                                transform="translateX(-50%)"
                                fontSize="xs"
                                whiteSpace="nowrap"
                            >
                                {year}
                            </Text>
                        )
                    );
                })}
            </Box>
            <Box
                mt={2}
                textAlign="center"
                fontSize={"lg"}
            >
                {sliderValue ? getSeasonLabel(sliderValue) : ""}
            </Box>                        
            <Container flex={2} minWidth={"container.xl"}>
                <Box width="100%" height="540px" position="relative">
                    <Box height={"500px"}>
                        <MapContainer mapId={MAP_ID} role="main" >
                            <MapAnchor
                                position="bottom-right"
                                horizontalGap={10}
                                verticalGap={30}
                            >
                                <Flex
                                    role="bottom-right"
                                    direction="column"
                                    gap={1}
                                    padding={1}
                                >
                                    <ZoomIn mapId={MAP_ID} />
                                    <ZoomOut mapId={MAP_ID} />
                                </Flex>

                            </MapAnchor>                            
                        </MapContainer>
                    </Box>
                    <Box mb={4}>
                        <CoordsScaleBar MAP_ID={MAP_ID} />
                    </Box>
                    <DynamicLegend variable={variable} position={"right"} />
                </Box>                
            </Container>

            <Box p={4}>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </Box>
        </Container>
    );
};

export default Projections;
