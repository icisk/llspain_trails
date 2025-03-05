import React, {useEffect, useState} from 'react';
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
import {CoordinateViewer} from "@open-pioneer/coordinate-viewer";
import {MapAnchor, MapContainer, SimpleLayer, useMapModel} from "@open-pioneer/map";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {ScaleBar} from "@open-pioneer/scale-bar";
import {ScaleViewer} from "@open-pioneer/scale-viewer";
import {InfoBoxComponent} from "info-box";
import {Point} from "ol/geom";
import {useIntl, useService} from "open-pioneer:react-hooks";
import {ZoomPointButtonComponent} from "zoom-point-button";

import {ChangeMonth} from "../controls/ChangeMonth";
import {MAP_ID} from "../services/BioindicatorMapProvider";
import {ChangeVariable} from "../controls/ChangeVariable";
import {completeExtent, cazorlaPoint, pedrochesPoint} from "../components/utils/globals";
import {RegionZoom} from "../components/RegionZoom/RegionZoom";

import {CoordsScaleBar} from "../components/CoordsScaleBar/CoordsScaleBar"
import MapBrowserEvent from "ol/MapBrowserEvent";
import {transform} from "ol/proj";
import {createMarker, markerStyle} from "../components/utils/marker";
import {Vector as VectorLayer} from "ol/layer";
import {GeoTIFF, Vector as VectorSource} from "ol/source";
import ImageLayer from 'ol/layer/Image';
import ImageStaticSource from 'ol/source/ImageStatic';
import WebGLTileLayer from "ol/layer/WebGLTile";
import TileLayer from "ol/layer/Tile";
import {Variable} from "../services/PrecipitationLayerHandler";
import {StationDataHandler} from "../services/StationDataHandler";
import {BioindicatorLayerHandler} from "../services/BioindicatorLayerHandler";
import {useReactiveSnapshot} from "@open-pioneer/reactivity";
import {meta} from "eslint-plugin-react/lib/rules/jsx-props-no-spread-multi";
import category = meta.docs.category;
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";




export function Phenology() {
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
        xAxis: { categories: [], title: { text: "Date" } },
        yAxis: { title: { text: "CDD" } },
        tooltip: { valueDecimals: 1 },
        series: [{ name: "CDD", data: [], type: "column", color: "orange" }]
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
        console.log(formattedDate)
    }, [sliderValue]);

     useEffect(() => {
         if (clickedCoordinates && dateObjects.length > 0){
             const coord4326 = transform(clickedCoordinates, 'EPSG:25830', 'EPSG:4326');
             let x = coord4326[0];
             let y = coord4326[1];

             console.log (x, y)
             console.log(`https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_2011-04-16%2000:00:00+00:00_None_CDD/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CDD`)
             fetch(`https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_2011-04-16%2000:00:00+00:00_None_CDD/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CDD`)
                 .then(response => response.json())
                 .then(data => setCDDValues(data.ranges.CDD.values))
                 .catch(error => console.error('Error fetching data:', error))
                 .finally(() => setChartLoading(false))            

         }
    }, [clickedCoordinates]);

    useEffect(() => {
        if (cddValues.length > 0) {
            let iso_dates = dateObjects.map((date) => date.toISOString().split('T')[0]);

            setChartOptions(prevOptions => ({
                ...prevOptions,
                title: { text: "CDD Over Time" },
                xAxis: { ...prevOptions.xAxis, categories: iso_dates },
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
        <Container minWidth={"container.xl"}>

            <InfoBoxComponent
                header={intl.formatMessage({id: "phenology.heading"})}
                description={intl.formatMessage({id: "phenology.heading_descr"})}
            ></InfoBoxComponent>

            <Box width={'100%'} padding={5}>
                <VStack>
                    {metadata.time.length > 0 && (
                        <>
                            <Slider
                                min={0}
                                max={dateObjects.length - 1}
                                step={1}
                                value={sliderValue}
                                onChange={(value) => setSliderValue(value)}
                            >
                                <SliderTrack bg="gray.200">
                                    <SliderFilledTrack bg="blue.450"/>
                                </SliderTrack>
                                <SliderThumb boxSize={30} bg="blue.450"/>
                            </Slider>

                            <Box mt={2} textAlign="center" fontSize="lg" fontWeight="bold">
                                {dateObjects[sliderValue].toISOString().split("T")[0]}
                            </Box>
                        </>
                    )}
                </VStack>

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
                <RegionZoom MAP_ID={MAP_ID}/>
            </Box>
            <CoordsScaleBar MAP_ID={MAP_ID}/>

            {!chartLoading && (
                <div style={{ marginTop: "50px" }}>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </div>
            )}
        </Container>
    )
}

export default Phenology;
