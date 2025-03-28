import React, {useEffect, useRef, useState} from 'react';
import {Box, Container, Flex} from "@open-pioneer/chakra-integration";
import {HStack} from "@chakra-ui/react";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {MapAnchor, MapContainer, SimpleLayer, useMapModel} from "@open-pioneer/map";
import {Header} from "../components/MainComponents/Header";
import {MainMap} from "../components/MainComponents/MainMap";
import {HistoricClimateHook2} from '../hooks/HistoricClimatehook';
import Layer from "ol/layer/Layer";
import {MAP_ID} from '../services/HistoricClimateMapProvider';
import {DynamicPrecipitationLegend} from "../components/Legends/DynamicLegend";
import {LayerSwipe} from '../components/LayerSwipe/LayerSwipe';
import Highcharts from 'highcharts';
import {HistoricPickerLeft, Selection} from "../components/VariablePicker/HistoricPickerLeft";
import {HistoricPickerRight} from "../components/VariablePicker/HistoricPickerRight";
import {Knecht} from "../components/Legends/Knecht";
import MapBrowserEvent from "ol/MapBrowserEvent";
import {transform} from "ol/proj";
import {createMarker, markerStyle} from "../components/utils/marker";
import {Vector as VectorLayer} from "ol/layer";
import {Vector as VectorSource} from "ol/source";
import HighchartsReact from "highcharts-react-official";
import { set } from 'ol/transform';
import { Radio, RadioGroup, Stack } from '@chakra-ui/react';
import {HistoricLayerHandler} from "../services/HistoricLayerHandler";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {CoordsScaleBar} from "../components/CoordsScaleBar/CoordsScaleBar";
import {RegionZoom} from "../components/RegionZoom/RegionZoom";

// Marker layer for displaying clicks
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 100 });



const HistoricClimateData1 = () => {
    const intl = useIntl();
    const histLayerHandler = useService<HistoricLayerHandler>("app.HistoricLayerHandler");

    const months = [
        intl.formatMessage({ id: "global.months.jan" }),
        intl.formatMessage({ id: "global.months.feb" }),
        intl.formatMessage({ id: "global.months.mar" }),
        intl.formatMessage({ id: "global.months.apr" }),
        intl.formatMessage({ id: "global.months.may" }),
        intl.formatMessage({ id: "global.months.jun" }),
        intl.formatMessage({ id: "global.months.jul" }),
        intl.formatMessage({ id: "global.months.aug" }),
        intl.formatMessage({ id: "global.months.sep" }),
        intl.formatMessage({ id: "global.months.oct" }),
        intl.formatMessage({ id: "global.months.nov" }),
        intl.formatMessage({ id: "global.months.dec" }),
    ];
    const [varLeft, 
        varRight] = useReactiveSnapshot(()=> [
            histLayerHandler.currentVarLeft, 
        histLayerHandler.currentVarRight], [histLayerHandler])
    const mapRef = useRef<HTMLDivElement>(null);
    const [leftLayers, setLeftLayers]= useState<Layer[]>();
    const [rightLayers, setRightLayers]= useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);
    
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    const [yearLeft, setYearLeft] = useState<number>(2000);
    const [yearRight, setYearRight] = useState<number>(2005);

    //states for comparison mode
    const [precipData1, setPrecipData1] = useState(null);
    const [tempData1, setTempData1] = useState(null);
    const [precipData2, setPrecipData2] = useState(null);
    const [tempData2, setTempData2] = useState(null);

    //states for single mode
    const [precipData, setPrecipData] = useState(null);
    const [tempData, setTempData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [precipTimeSeries, setPrecipTimeSeries] = useState<String>(null)
    const [tempTimeSeries, setTempTimeSeries] = useState<String>(null)
    const [longestTimeSeries, setLongestTimeSeries] = useState<String>(null)

    const [isComparisonMode, setIsComparisonMode] = useState(false);

    const [chartOptions, setChartOptions] = useState({
        chart: { type: "column", zoomType: "x" },
        title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
        xAxis: { 
            categories: months, 
            title: { text: intl.formatMessage({ id: "global.vars.date" }) }
        },
        yAxis: [
            {
                title: { text: intl.formatMessage({ id: "global.vars.precip" }) + " (mm)" },
                min: 0,
                max: 400,
                opposite: false,
            },
            {
                title: { text: intl.formatMessage({ id: "global.vars.temp" }) + " (°C)" },
                min: -10,
                max: 40,
                opposite: true,
            }
        ],
        tooltip: { valueDecimals: 1 },
        series: [
            {
                name: intl.formatMessage({ id: "global.vars.precip" }),
                data: new Array(12).fill(null),
                type: "column",
                color: "blue",
                yAxis: 0,
                showInLegend: false
            },
            {
                name: intl.formatMessage({ id: "global.vars.temp" }),
                data: new Array(12).fill(null),
                type: "line",
                color: "orange",
                yAxis: 1,
                marker: { symbol: "circle" },
                lineWith: 0,
                showInLegend: false
            }
        ]
    });
    
    const mapModel = useMapModel(MAP_ID);

    // comparison mode: fetch data when coordinates are clicked
    useEffect(() => {
        if (!clickedCoordinates) return;

        if (!isComparisonMode) return;

        const fetchData = async (x: number, y: number, year1: number, year2: number) => {
            const precipUrl = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_precip/position?coords=POINT(${x}%20${y})`;
            const tempUrl = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_temperature/position?coords=POINT(${x}%20${y})`;
            const tempMetadataUrl = "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_temperature_metrics.zarr/.zmetadata";
            const precipMetadataUrl = "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/creaf_historic_precip_metrics.zarr/.zmetadata";
        
            try {
                setLoading(true);
                const [precipMetadata, tempMetadata] = await Promise.all([
                    fetch(precipMetadataUrl).then((response) => response.json()),
                    fetch(tempMetadataUrl).then((response) => response.json())
                ]);
        
                // Funktion zur Ermittlung der Indizes für ein bestimmtes Jahr
                const getIndicesForYear = (metrics: Record<string, any>, year: number): [number, number][] => {
                    return Object.keys(metrics).reduce((indices: [number, number][], timestamp, index) => {
                        const match = timestamp.match(/^(\d{4})-(\d{2})/); // Extrahiere Jahr und Monat
                        if (match && parseInt(match[1]) === year) {
                            const month = parseInt(match[2]) - 1; // Monat auf 0-basiert umwandeln
                            indices.push([index, month]);
                        }
                        return indices;
                    }, []);
                };
                
                
        
                const tempMetrics = tempMetadata.metadata[".zattrs"].metrics;
                const precipMetrics = precipMetadata.metadata[".zattrs"].metrics;
        
                const tempIndicesYear1 = getIndicesForYear(tempMetrics, year1);
                const tempIndicesYear2 = getIndicesForYear(tempMetrics, year2);
                const precipIndicesYear1 = getIndicesForYear(precipMetrics, year1);
                const precipIndicesYear2 = getIndicesForYear(precipMetrics, year2);
        
                const precipData = await fetch(precipUrl).then((response) => response.json());
                const tempData = await fetch(tempUrl).then((response) => response.json());

                const getValuesByIndices = (data: Record<string, any>, indices: [number, number][]) => {
                    const values = Array(12).fill(null);
                
                    indices.forEach(([index, month]) => {
                        values[month] = data[index] ?? null;
                    });
                
                    return values;
                };
                

                const tempValuesYear1 = getValuesByIndices(tempData.ranges.historic_temperature.values, tempIndicesYear1);
                const tempValuesYear2 = getValuesByIndices(tempData.ranges.historic_temperature.values, tempIndicesYear2);
                const precipValuesYear1 = getValuesByIndices(precipData.ranges.historic_precip.values, precipIndicesYear1);
                const precipValuesYear2 = getValuesByIndices(precipData.ranges.historic_precip.values, precipIndicesYear2);

                setTempData1(tempValuesYear1);
                setTempData2(tempValuesYear2);
                setPrecipData1(precipValuesYear1);
                setPrecipData2(precipValuesYear2);
        
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        

        const [x, y] = clickedCoordinates;
        fetchData(x, y, yearLeft, yearRight);

        if (precipTimeSeries && tempTimeSeries) {
            setLongestTimeSeries(precipTimeSeries.length > tempTimeSeries.length ? precipTimeSeries : tempTimeSeries);
        }

    }, [clickedCoordinates, yearLeft, yearRight, isComparisonMode]);

    // comparison mode: update chart options when data is updated
    useEffect(() => {
        if (!precipData1 || !precipData2 || !tempData1 || !tempData2) return;
    
        setChartOptions({
            chart: { type: "column", zoomType: "x" },
            title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
            xAxis: { categories: months, title: { text: intl.formatMessage({ id: "global.vars.date" }) } },
            yAxis: [
                {
                    title: { text: intl.formatMessage({ id: "global.vars.precip" }) + " (mm)" },
                    min: 0,
                    max: 400,
                    opposite: false,
                },
                {
                    title: { text: intl.formatMessage({ id: "global.vars.temp" }) + " (°C)" },
                    min: -10,
                    max: 40,
                    opposite: true,
                }
            ],
            tooltip: { valueDecimals: 1,
                shared: true,
             },
            series: [
                {
                    name: `${yearLeft} ${intl.formatMessage({ id: "global.vars.precip" })}`,
                    data: precipData1,
                    type: "column",
                    color: "blue",
                    yAxis: 0,
                    showInLegend: true
                },
                {
                    name: `${yearRight} ${intl.formatMessage({ id: "global.vars.precip" })}`,
                    data: precipData2,
                    type: "column",
                    color: "lightblue",
                    yAxis: 0,
                    showInLegend: true
                },
                {
                    name: `${yearLeft} ${intl.formatMessage({ id: "global.vars.temp" })}`,
                    data: tempData1,
                    type: "line",
                    color: "orange",
                    yAxis: 1,
                    marker: { symbol: "circle" },
                    lineWith: 0,
                    showInLegend: true
                },
                {
                    name: `${yearRight} ${intl.formatMessage({ id: "global.vars.temp" })}`,
                    data: tempData2,
                    type: "line",
                    color: "red",
                    yAxis: 1,
                    marker: { symbol: "circle" },
                    lineWith: 0,
                    showInLegend: true
                }
            ]
        });
    }, [precipData1, precipData2, tempData1, tempData2]);

    // single mode: fetch data when coordinates are clicked
    useEffect(() => {
        if (!clickedCoordinates) return;

        if (isComparisonMode) return

        const fetchData = async (x, y) => {
            const precipUrl = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_precip/position?coords=POINT(${x}%20${y})`;
            const tempUrl = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_temperature/position?coords=POINT(${x}%20${y})`;

            try {
                setLoading(true);
                const [precipResponse, tempResponse] = await Promise.all([
                    fetch(precipUrl),
                    fetch(tempUrl)
                ]);
                if (!precipResponse.ok || !tempResponse.ok) throw new Error("Network response was not ok");

                const precipJsonData = await precipResponse.json();
                const tempJsonData = await tempResponse.json();
                setPrecipData(precipJsonData);
                setTempData(tempJsonData);

                // Create time series
                const createTimeSeries = (start, stop) => {
                    const startDate = new Date(start);
                    const stopDate = new Date(stop);
                    const timeSeries = [];
                    while (startDate <= stopDate) {
                        const year = startDate.getFullYear();
                        const month = String(startDate.getMonth() + 1).padStart(2, "0");
                        timeSeries.push(`${year}-${month}`);
                        startDate.setMonth(startDate.getMonth() + 1);
                    }
                    return timeSeries;
                };

                const precipStart = precipJsonData?.domain?.axes?.time?.start;
                const precipStop = precipJsonData?.domain?.axes?.time?.stop;
                const tempStart = tempJsonData?.domain?.axes?.time?.start;
                const tempStop = tempJsonData?.domain?.axes?.time?.stop;

                if (precipStart && precipStop && tempStart && tempStop) {
                    const precipTimeSeries = createTimeSeries(precipStart, precipStop);
                    const tempTimeSeries = createTimeSeries(tempStart, tempStop);

                    setPrecipTimeSeries(precipTimeSeries);
                    setTempTimeSeries(tempTimeSeries);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const [x, y] = clickedCoordinates;
        fetchData(x, y);

            if (precipTimeSeries && tempTimeSeries) {
                setLongestTimeSeries(precipTimeSeries.length > tempTimeSeries.length ? precipTimeSeries : tempTimeSeries);
            }

    }, [clickedCoordinates, isComparisonMode]);

    // single mode: update chart options when data is updated
    useEffect(() => {
        if (!tempTimeSeries || !precipTimeSeries) return;  // Wait until both time series are available

        setChartOptions({
            chart: { type: "column", zoomType: "x" },
            title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
            xAxis: { categories: tempTimeSeries, title: {text: intl.formatMessage({ id: "global.vars.date" })} },
            yAxis: [
                {title: { text: "Precipitation (mm)" }, min: 0, max: 400, opposite: false},
                {title: {text: "Temperatura (ºC)" }, min: -10, max: 40, opposite: true}
            ],
            tooltip: {
                valueDecimals: 1
            },
            series: [
                {
                    name: intl.formatMessage({ id: "global.vars.precip" }),
                    data: precipData?.ranges?.historic_precip?.values || [],
                    type: "column",
                    color: "blue",
                    yAxis: 0
                },
                {
                    name: intl.formatMessage({ id: "global.vars.temp" }),
                    data: tempData?.ranges?.historic_temperature?.values || [],
                    type: "spline",
                    color: "orange",
                    yAxis: 1
                }
            ]
        });
    }, [longestTimeSeries, precipData, tempData]);
    
    useEffect(() => {
        if(mapModel.map){
            const map = mapModel.map;
            const leftLayer1 = map.layers.getLayerById("left") as SimpleLayer;
            setLeftLayers([leftLayer1.olLayer as Layer])
            const rightLayer1 = map.layers.getLayerById("right") as SimpleLayer;
            setRightLayers([rightLayer1.olLayer as Layer])
        }
    }, [mapModel])

    //click on map
    useEffect(() => {
        if (mapModel?.map?.olMap) {
            const olMap = mapModel.map.olMap;
            // add marker layer
            olMap.addLayer(markerLayer);
            // attach click event handler 
            olMap.on("click", handleMapClick);
            // Cleanup function 
            return () => {
                olMap.removeLayer(markerLayer);
                olMap.un("click", handleMapClick);
            };
        }
    }, [mapModel]);

    const handleMapClick = (event: MapBrowserEvent<MouseEvent>) => {
        const coordinatesEPSG3857 = event.coordinate;
        const coordinatesEPSG25830 = transform(coordinatesEPSG3857, "EPSG:3857", "EPSG:25830");
        setClickedCoordinates(coordinatesEPSG25830);

        //Clear previous markers and add a new one
        markerSource.clear();
        const marker = createMarker(coordinatesEPSG3857, markerStyle)
        markerSource.addFeature(marker);
    };

    type VariableValues = {
        [key: string]: string;
    };

    function onLeftPickerChange(field: keyof Selection,value:string | number ) {
        if (field === 'year') {
            histLayerHandler.setYearLeft(value as number);
            setYearLeft(value as number);
        } else if (field === 'month') {
            histLayerHandler.setMonthLeft(value as number);
        } else if (field === 'var') {
            histLayerHandler.setVarLeft(value as string);
        }
    }

    function onRightPickerChange(field: keyof Selection,value:string | number ) {
        if (field === 'year') {
            histLayerHandler.setYearRight(value as number);
            setYearRight(value as number);
        } else if (field === 'month') {
            histLayerHandler.setYearRight(histLayerHandler.currentYearRight)
            histLayerHandler.setVarRight(histLayerHandler.currentVarRight)
            histLayerHandler.setMonthRight(value as number);
            
        } else if (field === 'var') {
            histLayerHandler.setVarRight(value as string);
        }
    }
    
    //HistoricClimateHook1(mapRef);
    HistoricClimateHook2(mapRef);
    
    //console.log(histLayerHandler.currentVarLeft)
    useEffect(() => {
        
    }, [histLayerHandler]);
    
    return (
<Box>
    <Header subpage={'historic_compare'} />
    <Box>
        <HStack>
            <HistoricPickerLeft onChange={onLeftPickerChange}/>
            <HistoricPickerRight onChange={onRightPickerChange}/>
        </HStack>
        <Container flex={2} minWidth={"container.xl"}>
            <Box width="100%" height="540px" position="relative">
                {/*<MainMap MAP_ID={MAP_ID}/>*/}

                    <Box height={"500px"} pt={2} overflow="visible">
                        <MapContainer mapId={MAP_ID} role="main" >
                            <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                                <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                                    <ZoomIn mapId={MAP_ID}/>
                                    <ZoomOut mapId={MAP_ID}/>
                                </Flex>
                            </MapAnchor>
                            
                        </MapContainer>
                    </Box>
                    <Box mb={4}>
                        <CoordsScaleBar MAP_ID={MAP_ID} />
                    </Box>                   

                {
                    (varLeft === 'temp' || varRight === 'temp') &&
                    <DynamicPrecipitationLegend/>
                }
                {
                    (varLeft=== 'precip' || varRight === 'precip') &&
                    <Knecht/>
                }
                {/*<Knecht/>*/}
                
            </Box>

            {(leftLayers && rightLayers && mapModel.map) &&
                <LayerSwipe map={mapModel.map}
                            sliderValue={sliderValue}
                            onSliderValueChanged={(newValue) => {
                                setSliderValue(newValue)
                            }}
                            leftLayers={leftLayers}
                            rightLayers={rightLayers}/>
            }
            <Box mb={4} gap={10}>
                <RegionZoom MAP_ID={MAP_ID} />
            </Box>
            <Box mt={4}>
                <RadioGroup
                onChange={(value) => {
                    setIsComparisonMode(value === "true");
                }}
                value={isComparisonMode ? "true" : "false"}
                >
                    <Box>
                        {intl.formatMessage({ id: "historic_compare.radio_buttons.heading" })}
                    </Box>
                    <Stack direction="row">
                        <Radio value="true">{intl.formatMessage({ id: "historic_compare.radio_buttons.compare" })}</Radio>
                        <Radio value="false">{intl.formatMessage({ id: "historic_compare.radio_buttons.full_series" })}</Radio>
                    </Stack>
                </RadioGroup>
                <div>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions}/>
                </div>
            </Box>
        </Container>
    </Box>
</Box>
    );
};

export default HistoricClimateData1;
