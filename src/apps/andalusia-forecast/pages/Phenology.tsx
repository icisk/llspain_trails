import {
    Box,
    Center,
    Container,
    Flex,
    HStack,
    VStack,
    Spacer,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Text,
    SliderMark
} from "@open-pioneer/chakra-integration";
import {MapAnchor, MapContainer, SimpleLayer, useMapModel} from "@open-pioneer/map";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {InfoBoxComponent} from "info-box";
import {useIntl, useService} from "open-pioneer:react-hooks";

import {MAP_ID} from "../services/BioindicatorMapProvider";
import {RegionZoom} from "../components/RegionZoom/RegionZoom";
import {CoordsScaleBar} from "../components/CoordsScaleBar/CoordsScaleBar"
import MapBrowserEvent from "ol/MapBrowserEvent";
import {transform} from "ol/proj";
import {createMarker, markerStyle} from "../components/utils/marker";
import {Vector as VectorLayer} from "ol/layer";
import {GeoTIFF, Vector as VectorSource} from "ol/source";

import {BioindicatorLayerHandler} from "../services/BioindicatorLayerHandler";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {meta} from "eslint-plugin-react/lib/rules/jsx-props-no-spread-multi";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import {PhenologyLegend} from "../components/Legends/PhenologyLegend";
import React, {useEffect, useState} from "react";
import {DynamicLegend} from "../components/Legends/DynamicLegend";
import {header} from "typedoc/dist/lib/output/themes/default/partials/header";
import description = meta.docs.description;
import {InfoTooltip} from "../components/InfoTooltip/InfoTooltip";


function getSeasonLabel(date) {
    const month = date.getMonth() + 1; // months are 0-indexed
    const year = date.getFullYear();

    let season;
    if (month >= 3 && month <= 5) season = "Primavera";
    else if (month >= 6 && month <= 8) season = "Verano";
    else if (month >= 9 && month <= 11) season = "Otoño";
    else season = "Invierno";

    return `${year} ${season}`;
}


export function Phenology() {
    const variable = "CDD"
    const intl = useIntl();
    const [sliderValue, setSliderValue] = useState(0);
    const [metadata, setMetadata] = useState({"time": []});
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    const [currentLayer, setCurrentLayer] = useState<any>(null); // State to keep track of the current layer
    const bioDataHandler = useService<BioindicatorLayerHandler>("app.BioindicatorLayerHandler");
    const [cddValues, setCDDValues] = useState([])
    const [chartOptions, setChartOptions] = useState({
        chart: { type: "column", zoomType: "x" },
        title: { text: "Loading..." },
        xAxis: { categories: [], title: { text: intl.formatMessage({ id: "global.vars.date" }) } },
        yAxis: { title: { text: intl.formatMessage({ id: "phenology.plot.yAxis" }) } },
        tooltip: { valueDecimals: 0 },
        series: [{ name: intl.formatMessage({ id: "phenology.plot.popupvar" }), data: [], type: "column", color: "orange" }]
    });
    const [chartLoading, setChartLoading] = useState<boolean>(true);

    const mapModel = useMapModel(MAP_ID);
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({ source: markerSource, zIndex: 100 });
    
    const [selectedDate] = useReactiveSnapshot(() =>[bioDataHandler.currentDate], [bioDataHandler]);

    useEffect(() => {
        fetch("https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/CDD/CDD_metadata.json")
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then(data => setMetadata(data))
            .catch(error => console.error("Fetch error:", error));

    }, []);
    
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
    const dateObjects = metadata.time.map(dateStr => new Date(dateStr));


    useEffect(() => {        
        const dateObjects = metadata.time.map(dateStr => new Date(dateStr));
        if (!mapModel?.map?.olMap || !dateObjects.length) return;
        const date = dateObjects[sliderValue];
        const localDate = new Date(date.getTime() + 12 * 60 * 60 * 1000); // Add 12 hours
        const formattedDate = localDate.toISOString().split('T')[0];
        bioDataHandler.setDate(formattedDate);
        //console.log(formattedDate)
    }, [sliderValue]);

     useEffect(() => {
         if (clickedCoordinates && dateObjects.length > 0){
             const coord4326 = transform(clickedCoordinates, 'EPSG:25830', 'EPSG:4326');
             let x = coord4326[0];
             let y = coord4326[1];

             //console.log (x, y)
             //console.log(`https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_2011-04-16%2000:00:00+00:00_None_CDD/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CDD`)
             fetch(`https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_201104_spain_CDD/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CDD`)
                 .then(response => response.json())
                 .then(data => setCDDValues(data.ranges.CDD.values))
                 .catch(error => console.error('Error fetching data:', error))
                 .finally(() => setChartLoading(false))            

         }
    }, [clickedCoordinates]);

    useEffect(() => {
        if (cddValues.length > 0) {
            let iso_dates = dateObjects.map((date) => date.toISOString().split('T')[0]);
            let seasonLabels = dateObjects.map(date => getSeasonLabel(date)); // Convert dates to season labels


            setChartOptions(prevOptions => ({
                ...prevOptions,
                title: { text: intl.formatMessage({ id: "phenology.plot.title" }) },
                xAxis: { ...prevOptions.xAxis, categories: seasonLabels },
                series: [{ ...prevOptions.series[0], data: cddValues }]
            }));

            setChartLoading(false); 
        }
    }, [cddValues]);

    
    // NEEDS TO STAY AT BOTTOM
    if (!mapModel || !metadata.time || metadata.time.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        <Box>
            {/*<InfoBoxComponent*/}
            {/*    header={intl.formatMessage({ id: "phenology.heading" })}*/}
            {/*    description={intl.formatMessage({ id: "phenology.heading_descr" }).split("\n").map((line, index) => (*/}
            {/*        <p key={index}>{line}</p>*/}
            {/*    ))}*/}
            {/*/>*/}

            <Box  border="2px solid #3498DB" borderRadius="10px" padding={3}>
                <HStack>
                    <Box fontSize="xl">{intl.formatMessage({ id: "phenology.heading" })}</Box>
                    <InfoTooltip i18n_path="phenology.info" />
                </HStack>
                <Box pt={1}>{intl.formatMessage({ id: "phenology.heading_descr" }).split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                ))}</Box>
            </Box>

            <Container flex={2} minWidth={"container.xl"}>
                <Box mt={5}>
                    <VStack>
                        {metadata.time.length > 0 && (
                            <>
                                <Box mt={2}>
                                    <p>
                                        Seleccione el período entre: {" "}
                                        {dateObjects?.[0] && getSeasonLabel(dateObjects[0])} -{" "}
                                        {dateObjects?.length > 0 && getSeasonLabel(dateObjects[dateObjects.length - 1])}
                                    </p>
                                </Box>

                                <Slider
                                    min={0}
                                    max={dateObjects.length - 1}
                                    step={1}
                                    value={sliderValue}
                                    onChange={(value) => setSliderValue(value)}
                                >
                                    <SliderTrack bg="gray.200">
                                        <SliderFilledTrack bg="blue.450" />
                                        {dateObjects.map((date, index) => {
                                            const year = date.getFullYear();
                                            const isFirstOfYear = index === 0 || dateObjects[index - 1].getFullYear() !== year;
                                            const isFifthYear = isFirstOfYear && year % 5 === 0;
                                            return (
                                                isFirstOfYear && (
                                                    <Box
                                                        key={year}
                                                        position="absolute"
                                                        left={`${(index / (dateObjects.length - 1)) * 100}%`}
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

                                <Box mt={2} textAlign="center" fontSize="lg" fontWeight="bold">
                                    {getSeasonLabel(dateObjects[sliderValue])}
                                </Box>
                            </>
                        )}
                    </VStack>
                </Box>

                <Box width="100%" height="540px" position="relative">
                    <Box height={"500px"} pt={2} overflow={"visible"}>
                        <MapContainer mapId={MAP_ID} role="main">
                            <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={30}>
                                <Flex role="bottom-right" direction="column" gap={1} padding={1}>
                                    <ZoomIn mapId={MAP_ID} />
                                    <ZoomOut mapId={MAP_ID} />
                                </Flex>
                            </MapAnchor>
                        </MapContainer>
                    </Box>
                    <Box mb={4}>
                        <CoordsScaleBar MAP_ID={MAP_ID} />
                    </Box>
                    <DynamicLegend position={"right"} variable={"CDD"} />

                </Box>

                <Box>
                    <RegionZoom MAP_ID={MAP_ID} />
                </Box>

                {!chartLoading && (
                    <div style={{ marginTop: "50px" }}>
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                    </div>
                )}
            </Container>
        </Box>
    );

}

export default Phenology;
