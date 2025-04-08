import React, {useEffect, useState} from "react";
import {Box, Center, Container, HStack} from "@open-pioneer/chakra-integration";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {ChangeMonth} from "../controls/ChangeMonth";
import {MAP_ID} from "../services/MidtermForecastMapProvider";
import {ChangeVariable} from "../controls/ChangeVariable";
import {useFetchData} from "../hooks/useFetchData";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {useMapModel} from "@open-pioneer/map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import {transform} from "ol/proj";
import {Vector as VectorLayer} from "ol/layer";
import {Vector as VectorSource} from "ol/source";
import {PrecipitationLayerHandler} from "../services/PrecipitationLayerHandler";
import {createMarker, markerStyle} from "../components/utils/marker";
import {Header} from "../components/MainComponents/Header";
import {MainMap} from "../components/MainComponents/MainMap";
import {StaticPrecipitationLegend} from "../components/Legends/StaticPrecipitationLegend"; // Correct import statement
import {UncertaintyLegend} from "../components/Legends/uncertainty";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {Select, Switch, Text} from "@chakra-ui/react";
import {DynamicLegend} from "../components/Legends/DynamicLegend";
import {espanolChartOptions} from "../components/Charts/ChartOptions";

// Marker layer for displaying clicks
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 1 });


export function Forecast() {
    const intl = useIntl();
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    
    const mapState = useMapModel(MAP_ID);
    const precipitationService = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");
    const prepSrvc = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");
    const   [curVar,
            curForecast,
            curForecastMonths,
            showUncert] = useReactiveSnapshot(() =>
        [prepSrvc.currentVariable, 
        prepSrvc.currentForecast,
        prepSrvc.currentForecastMonths,
        prepSrvc.showUncert], [prepSrvc])
    const { data, loading, error } = useFetchData(clickedCoordinates, curVar);
    const currentVariable = precipitationService?.currentVariable;
    
    // State for managing chart options
    const [chartOptions, setChartOptions] = useState({
        title: { text: "" },
        xAxis: { type: "datetime" },
        tooltip: { valueDecimals: 1,
            formatter: function() {
                const date = new Date(this.x);
                date.setDate(date.getDate() + 1); 
                const formattedDate = Highcharts.dateFormat('%b %Y', date); 
                return `${this.series.name}: ${formattedDate}: ${this.y.toFixed(1)}`; 
            }},
        yAxis: { title: { text: ""}},
        series: []
    });
    Highcharts.setOptions(espanolChartOptions());


    const variables = [
        { temp: "Temperatura" },
        { precip: "Precipitación" }
    ];
    
    useEffect(() => {
        prepSrvc.setForecast("2025-01")
        prepSrvc.setVariable("temp")
        prepSrvc.setShowUncert(false)
        //console.log(prepSrvc)
    }, []);
    
    useEffect(() => {
        let newOpts = {}
        if (curVar === "temp"){
            newOpts = {title: {text: intl.formatMessage({ id: "global.plot.header_temp" })},
                        yAxis: {title: { text: intl.formatMessage({ id: "global.vars.temp" }) + " (ºC)"},}}
        } else if (curVar === "precip"){
            newOpts = {title: {text: intl.formatMessage({ id: "global.plot.header_precip" })},
                yAxis: {title: { text: intl.formatMessage({ id: "global.vars.precip" }) + " (mm)"},}}
        }
        if (data) {
            setChartOptions((prevOptions :any) => ({
                ...prevOptions,
                ...newOpts,
                series: data
            }));
        }
    }, [data, curVar]);
    
    useEffect(() => {
        if (precipitationService) {
            mapState?.map?.olMap?.getLayers().forEach((layer) => {
                if (layer === precipitationService.layer) {
                    layer.setStyle({
                        color: precipitationService.getColorStyle(),
                    });
                }
            });
        }
    }, [currentVariable, mapState, precipitationService]);
    
    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
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
    }, [mapState]);
    
    // Handle map clicks to set clicked coordinates and add marker
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

    const handleForecastMonthChange = (event) => {
        const selectedDate = new Date(event.target.value); 
        prepSrvc.setMonth(selectedDate.toISOString()); 
    };
    const handleVariableChange = (event) => {
        //console.log(event.target.value)
        prepSrvc.setVariable(event.target.value);
    }
    const handleUncertChange = (event) => {
        prepSrvc.setShowUncert(event.target.checked); 
        //console.log(event.target.checked); 
    }

    useEffect(() => {
        
    }, []);

    //console.log(curVar)
    return (
        <Container minWidth={"container.xl"}>            
            <Header subpage={'forecast'} />

            <Center pt={2}>
                <HStack flex={"overflow"}>
                    <HStack>
                        <Box
                            whiteSpace={"nowrap"}>{intl.formatMessage({id: "global.controls.sel_prediction"})} </Box>
                        <Select>
                            <option value="2025-01">{curForecast}</option>
                        </Select>
                    </HStack>
                    <HStack>
                        <Box whiteSpace={"nowrap"}>{intl.formatMessage({id: "global.controls.sel_month"})} </Box>
                        <Select onChange={handleForecastMonthChange}>
                            {curForecastMonths.map((date, index) => {
                                const label = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                                const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
                                const dateString = date.toISOString(); 

                                return (
                                    <option key={index} value={dateString}>
                                        {capitalized} ({index})
                                    </option>
                                );
                            })}
                        </Select>                       
                    </HStack>
                    <HStack>
                        <Box whiteSpace={"nowrap"}>{intl.formatMessage({id: "global.controls.sel_var"})} </Box>
                        <Select onChange={handleVariableChange}>
                            {variables.map((variable, index) => (
                                <option key={index} value={Object.keys(variable)[0]}>
                                    {Object.values(variable)[0]}
                                </option>
                            ))}
                        </Select>
                    </HStack>
                    <HStack>
                        <Switch size="lg" isChecked={showUncert} onChange={handleUncertChange} />
                        <Text>Mostrar incertidumbre</Text>
                    </HStack>
                </HStack>
            </Center>

            <Box position="relative">
                <MainMap MAP_ID={MAP_ID} />

                <DynamicLegend variable={curVar} position={"right"} />
                {
                    showUncert && <DynamicLegend variable={'uncertainty'} position={"left"} />
                }
                
            </Box>
            <Box p={4}>
                {/*<div style={{ marginBottom: "10px", fontSize: "16px" }}>*/}
                {/*    {clickedCoordinates*/}
                {/*        ? intl.formatMessage({id: "global.map.coord_clicked"}, */}
                {/*            {x:clickedCoordinates[0].toFixed(2),*/}
                {/*             y:clickedCoordinates[1].toFixed(2)})*/}
                {/*        : intl.formatMessage({id: "global.map.no_coord_clicked"})}*/}
                {/*</div>*/}

                <div>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            </Box>
        </Container>
    );
}
