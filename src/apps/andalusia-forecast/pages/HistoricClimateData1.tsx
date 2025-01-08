import React, {useEffect, useRef, useState} from 'react';
import {Box, Container} from "@open-pioneer/chakra-integration";
import {HStack} from "@chakra-ui/react";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {SimpleLayer, useMapModel} from "@open-pioneer/map";
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


// Marker layer for displaying clicks
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 100 });

const HistoricClimateData1 = () => {
    const intl = useIntl();
    const histLayerHandler = useService<HistoricLayerHandler>("app.HistoricLayerHandler");
    
    const mapRef = useRef<HTMLDivElement>(null);
    const [leftLayers, setLeftLayers]= useState<Layer[]>();
    const [rightLayers, setRightLayers]= useState<Layer[]>();
    const [sliderValue, setSliderValue] = useState<number>(50);
    
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);

    const [precipData, setPrecipData] = useState(null);
    const [tempData, setTempData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [precipTimeSeries, setPrecipTimeSeries] = useState<String>(null)
    const [tempTimeSeries, setTempTimeSeries] = useState<String>(null)
    const [longestTimeSeries, setLongestTimeSeries] = useState<String>(null)

    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: "column",
            zoomType: "x"
        },
        title: { text: intl.formatMessage({ id: "global.plot.header_precip" }) },
        xAxis: { categories: tempTimeSeries ? tempTimeSeries : null , 
                 title: {text: "Date"} },
        yAxis:  [
            {title: { text: "Precipitation (mm)" }, min: 0, max: 400, opposite: false},
            {title: {text: "Temperatura (ºC)" }, min: -10, max: 40, opposite: true}
        ],
        series: [
            {
                name: "Precipitation",
                data: precipData ? precipData?.ranges?.historic_precip?.values : null,
                type: "column",
                color: "blue",
                yAxis: 0
            },
            {
                name: "Temperatura",
                data: tempData ? tempData?.ranges?.historic_precip?.values : null,
                type: "spline",
                color: "orange",
                yAxis: 1
            }
        ]
    });

    const mapModel = useMapModel(MAP_ID);
    
    useEffect(() => {
        if (!clickedCoordinates) return;

        const fetchPrecipData = async (x :any, y :any) => {
            const url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_precip/position?coords=POINT(${x}%20${y})`;
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const jsonData = await response.json();
                setPrecipData(jsonData);
            } catch (err :any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        const fetchTempData = async (x :any, y :any) => {
            const url = `https://i-cisk.dev.52north.org/data/collections/creaf_historic_temperature/position?coords=POINT(${x}%20${y})`;
            try {
                setLoading(true);
                const response = await fetch(url);
                if (!response.ok) throw new Error("Network response was not ok");
                const jsonData = await response.json();
                setTempData(jsonData);
            } catch (err :any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };        

        function createTimeSeries(start, stop) {
            const startDate = new Date(start);
            const stopDate = new Date(stop);
            const timeSeries = [];

            while (startDate <= stopDate) {
                timeSeries.push(new Date(startDate).toISOString().split("T")[0].slice(0, 7));
                
                startDate.setMonth(startDate.getMonth() + 1);
                
            }
            return timeSeries;
        }

        const [x, y] = clickedCoordinates
        fetchPrecipData(x, y);
        fetchTempData(x, y);
        const precipStart = precipData?.domain?.axes?.time?.start
        const precipStop = precipData?.domain?.axes?.time?.stop
        const tempStart = tempData?.domain?.axes?.time?.start
        const tempStop = tempData?.domain?.axes?.time?.stop
        
        setPrecipTimeSeries(createTimeSeries(precipStart, precipStop));
        setTempTimeSeries(createTimeSeries(tempStart, tempStop))
        if (precipTimeSeries != null && tempTimeSeries != null) {
            setLongestTimeSeries(precipTimeSeries.length > tempTimeSeries.length ? precipTimeSeries : tempTimeSeries);
        }

    }, [clickedCoordinates]);

    useEffect(() => {
        if(mapModel.map){
            const map = mapModel.map;
            const leftLayer1 = map.layers.getLayerById("left") as SimpleLayer;
            setLeftLayers([leftLayer1.olLayer as Layer])
            const rightLayer1 = map.layers.getLayerById("right") as SimpleLayer;
            setRightLayers([rightLayer1.olLayer as Layer])
        }
    }, [mapModel])

    useEffect(() => {
        setChartOptions({
            chart: {
                type: "column",
                zoomType: "x"
            },
            title: { text: intl.formatMessage({ id: "global.plot.header_precip" }) },
            xAxis: { categories: tempTimeSeries, title: {text: "Date"} },
            yAxis:  [
                {title: { text: "Precipitation (mm)" }, min: 0, max: 400, opposite: false},
                {title: {text: "Temperatura (ºC)" }, min: -10, max: 40, opposite: true}
            ],
            series: [
                {
                    name: "Precipitation",
                    data: precipData ? precipData?.ranges?.historic_precip?.values : null,
                    type: "column",
                    color: "blue",
                    yAxis: 0
                },
                {
                    name: "Temperatura",
                    data: tempData ? tempData?.ranges?.historic_temperature?.values : null,
                    type: "spline",
                    color: "orange",
                    yAxis: 1
                }
            ]
        });
    }, [precipData, tempData]);
    
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
        //console.log("Clicked Coordinates (EPSG:25830):", coordinatesEPSG25830);
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
            histLayerHandler.setYearRight(histLayerHandler.currentYearRight)
            histLayerHandler.setVarRight(histLayerHandler.currentVarRight)
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
                <DynamicPrecipitationLegend/>
                <Knecht/>
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
        </Container>
        <div>
            <HighchartsReact highcharts={Highcharts} options={chartOptions}/>
        </div>
    </Box>
</Box>
    );
};

export default HistoricClimateData1;
