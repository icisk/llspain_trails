import React, { useState, useEffect } from "react";
import { Box, Center, Container, Flex, HStack, Spacer } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { ChangeMonth } from "../controls/ChangeMonth";
import { MAP_ID } from "../services/MidtermForecastMapProvider";
import { ChangeVariable } from "../controls/ChangeVariable";
import { useFetchData } from "../hooks/useFetchData";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useMapModel } from "@open-pioneer/map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { useService } from "open-pioneer:react-hooks";
import { PrecipitationLayerHandler } from "../services/PrecipitationLayerHandler";
import { createMarker, markerStyle } from "../components/utils/marker";
import { getMonthArray } from "../components/utils/globals";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";
import { StaticPrecipitationLegend } from "../components/Legends/StaticPrecipitationLegend"; // Correct import statement

// Marker layer for displaying clicks
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({ source: markerSource, zIndex: 1 });

export function Forecast() {
    const intl = useIntl();
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    const { data, loading, error } = useFetchData(clickedCoordinates);
    const mapState = useMapModel(MAP_ID);
    const precipitationService = useService<PrecipitationLayerHandler>("app.PrecipitationLayerHandler");

    
    const currentVariable = precipitationService?.currentVariable;

    // State for managing chart options
    const [chartOptions, setChartOptions] = useState({
        title: { text: intl.formatMessage({ id: "global.plot.header_precip" }) },
        xAxis: { categories: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto"] },
        yAxis: { title: { text: "Precipitation (mm)" }, min: 0, max: 350 },
        series: []
    });
    

    useEffect(() => {
        if (data) {
            const seriesData = Object.keys(data.ranges).map((param) => ({
                name: param,
                data: data.ranges[param].values || []
            }));
            setChartOptions((prevOptions :any) => ({
                ...prevOptions,
                series: seriesData
            }));
        }
    }, [data]);
    
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


    //console.log(getMonthArray())
    return (
        <Container minWidth={"container.xl"}>            
            <Header subpage={'forecast'} />

            <Center pt={2}>
                <HStack>
                    <ChangeMonth />
                    <ChangeVariable />
                </HStack>
            </Center>

            <Box position="relative">
                <MainMap MAP_ID={MAP_ID} />
                <StaticPrecipitationLegend /> 
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
