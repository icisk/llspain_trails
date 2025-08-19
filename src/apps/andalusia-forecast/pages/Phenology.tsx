import {
    Box,
    Center,
    Container,
    Flex,
    HStack,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Spacer,
    Text,
    VStack
} from "@open-pioneer/chakra-integration";
import { MapAnchor, MapContainer, SimpleLayer, useMapModel } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { InfoBoxComponent } from "info-box";
import { useIntl, useService } from "open-pioneer:react-hooks";

import { MAP_ID } from "../services/BioindicatorMapProvider";
import { RegionZoom } from "../components/RegionZoom/RegionZoom";
import { CoordsScaleBar } from "../components/CoordsScaleBar/CoordsScaleBar";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { transform } from "ol/proj";
import { createMarker, markerStyle } from "../components/utils/marker";
import { Vector as VectorLayer } from "ol/layer";
import { GeoTIFF, Vector as VectorSource } from "ol/source";

import { BioindicatorLayerHandler } from "../services/BioindicatorLayerHandler";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { meta } from "eslint-plugin-react/lib/rules/jsx-props-no-spread-multi";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { PhenologyLegend } from "../components/Legends/PhenologyLegend";
import React, { useEffect, useState } from "react";
import { DynamicLegend } from "../components/Legends/DynamicLegend";
import { header } from "typedoc/dist/lib/output/themes/default/partials/header";
import description = meta.docs.description;
import { InfoTooltip } from "../components/InfoTooltip/InfoTooltip";

export function Phenology() {
    const variable = "CDD";
    const intl = useIntl();
    const [sliderValue, setSliderValue] = useState(0);
    const [metadata, setMetadata] = useState({ "time": [] });
    const [metadata_SU, setMetadata_SU] = useState({ "time": [] });
    const [clickedCoordinates, setClickedCoordinates] = useState<number[] | null>(null);
    const [currentLayer, setCurrentLayer] = useState<any>(null); // State to keep track of the current layer
    const bioDataHandler = useService<BioindicatorLayerHandler>("app.BioindicatorLayerHandler");
    const [IndicatorValues, setIndicatorValues] = useState([]);
    const [chartOptions, setChartOptions] = useState({
        chart: { type: "column", zoomType: "x" },
        title: { text: "Loading..." },
        xAxis: { categories: [], title: { text: intl.formatMessage({ id: "global.vars.date" }) } },
        yAxis: { title: { text: intl.formatMessage({ id: "phenology.plot.yAxis" }) } },
        tooltip: { valueDecimals: 0 },
        series: [
            {
                name: intl.formatMessage({ id: "phenology.plot.popupvar" }),
                data: [],
                type: "column",
                color: "orange"
            }
        ]
    });
    const [chartLoading, setChartLoading] = useState<boolean>(true);

    const mapModel = useMapModel(MAP_ID);
    const markerSource = new VectorSource();
    const markerLayer = new VectorLayer({ source: markerSource, zIndex: 100 });

    const [selectedDate] = useReactiveSnapshot(
        () => [bioDataHandler.currentDate],
        [bioDataHandler]
    );

    const [selectedIndicator, setSelectedIndicator] = useState("CDD");

    function getSeasonLabel(date) {
        if (selectedIndicator === "SU") {
            const oneDayInMs = 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden
            const nextDay = new Date(date.getTime() + oneDayInMs);
        
            const day = String(nextDay.getDate()).padStart(2, "0");
            const month = String(nextDay.getMonth() + 1).padStart(2, "0"); // Monate sind 0-basiert
            const year = nextDay.getFullYear();
        
            return `${day}-${month}-${year}`; // dd mm yyyy
        }
        

        const month = date.getMonth() + 1; // months are 0-indexed
        const year = date.getFullYear();

        let season;
        if (month >= 3 && month <= 5) season = "Primavera";
        else if (month >= 6 && month <= 8) season = "Verano";
        else if (month >= 9 && month <= 11) season = "Otoño";
        else season = "Invierno";

        return `${year} ${season}`;
    }

    useEffect(() => {
        bioDataHandler.setIndicator(selectedIndicator);
    }, [selectedIndicator]);

    useEffect(() => {
        fetch(
            "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/CDD/CDD_metadata.json"
        )
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then((data) => setMetadata(data))
            .catch((error) => console.error("Fetch error:", error));
    }, []);

    useEffect(() => {
        fetch(
            "https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/spain/agro_indicator/SU/SU_metadata.json"
        )
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .then((data) => setMetadata_SU(data))
            .catch((error) => console.error("Fetch error:", error));
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
        const marker = createMarker(coordinatesEPSG3857, markerStyle);
        markerSource.addFeature(marker);
    };

    const dateObjects = metadata.time.map((dateStr) => new Date(dateStr));
    const dateObjects_SU = metadata_SU.time.map((dateStr) => new Date(dateStr));

    useEffect(() => {
        let dateObjects: Date[] = [];
        if (selectedIndicator === "CDD" || selectedIndicator === "CSU") {
            dateObjects = metadata.time.map((dateStr) => new Date(dateStr));
        } else if (selectedIndicator === "SU") {
            dateObjects = metadata_SU.time.map((dateStr) => new Date(dateStr));
        }

        if (sliderValue < 0 || sliderValue >= dateObjects.length) {
            setSliderValue(0); // Reset to 0 if out of bounds
            return;
        } else {
            if (!mapModel?.map?.olMap || !dateObjects.length) return;
            const date = dateObjects[sliderValue];
            const localDate = new Date(date.getTime() + 12 * 60 * 60 * 1000); // Add 12 hours
            const formattedDate = localDate.toISOString().split("T")[0];

            bioDataHandler.setDate(formattedDate);
        }
    }, [sliderValue, selectedIndicator, metadata, metadata_SU, mapModel]);

    useEffect(() => {
        if (clickedCoordinates && dateObjects.length > 0) {
            const coord4326 = transform(clickedCoordinates, "EPSG:25830", "EPSG:4326");
            let x = coord4326[0];
            let y = coord4326[1];

            let url: string;
            if (selectedIndicator === "SU") {
                url = `https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_201101_spain_SU/position?f=json&coords=POINT(${x}%20${y})&parameter-name=SU`;
            } else if (selectedIndicator === "CSU") {
                url = `https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_201104_spain_CSU/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CSU`;
            } else {
                url = `https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_201104_spain_CDD/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CDD`;
            }
            //console.log (x, y)
            //console.log(`https://i-cisk.dev.52north.org/data/collections/sis-agroclimatic-indicators_2011-04-16%2000:00:00+00:00_None_CDD/position?f=json&coords=POINT(${x}%20${y})&parameter-name=CDD`)
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    if (data?.ranges?.[selectedIndicator]?.values) {
                        if (selectedIndicator === "SU") {
                            let selectedValues = [];
                            console.log("length of values:", data.ranges[selectedIndicator].values.length);
                            
                            const length = data.ranges[selectedIndicator].values.length;

                            for (let i = 0; i < length; i++) {
                                // select every 4th value starting from index 1 for the values for 23 degrees
                                if (i % 4 === 1) {
                                    selectedValues.push(data.ranges[selectedIndicator].values[i]);
                                }
                            }
                            setIndicatorValues(selectedValues);
                        } else {
                            setIndicatorValues(data.ranges[selectedIndicator].values);
                        }
                    } else {
                        console.warn("No values found for indicator:", selectedIndicator);
                        setIndicatorValues([]);
                    }
                    // console.log("Fetched data:", data);
                })
                .catch((error) => console.error("Error fetching data:", error))
                .finally(() => setChartLoading(false));
        }
    }, [clickedCoordinates, selectedIndicator]);

    function generateSUDateLabels(): string[] {
        const labels: string[] = [];
        const startYear = 2011;
        const endYear = 2040;
        const days = [5, 15, 25];
    
        for (let year = startYear; year <= endYear; year++) {
            for (let month = 0; month < 12; month++) {
                for (const day of days) {
                    const date = new Date(year, month, day);
                    const dd = String(date.getDate()).padStart(2, '0');
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const yyyy = date.getFullYear();
                    const label = `${dd}-${mm}-${yyyy}`;
                    labels.push(label);
                }
            }
        }
    
        return labels;
    }
    

    useEffect(() => {
        if (IndicatorValues.length > 0) {
            let iso_dates = dateObjects.map((date) => date.toISOString().split("T")[0]);
            let seasonLabels = dateObjects.map((date) => getSeasonLabel(date)); // Convert dates to season labels

            if (selectedIndicator === "CDD") {
                setChartOptions((prevOptions) => ({
                    ...prevOptions,
                    title: { text: intl.formatMessage({ id: "phenology.plot.title_cdd" }) },
                    xAxis: { ...prevOptions.xAxis, categories: seasonLabels },
                    series: [{ ...prevOptions.series[0], data: IndicatorValues, name: intl.formatMessage({ id: "phenology.plot.title_cdd" }) }]
                }));
            } else if (selectedIndicator === "CSU") {
                setChartOptions((prevOptions) => ({
                    ...prevOptions,
                    title: { text: intl.formatMessage({ id: "phenology.plot.title_csu" }) },
                    xAxis: { ...prevOptions.xAxis, categories: seasonLabels },
                    series: [{ ...prevOptions.series[0], data: IndicatorValues, name: intl.formatMessage({ id: "phenology.plot.title_csu" })}]
                }));
            } else if (selectedIndicator === "SU") {
                const suDateLabels = generateSUDateLabels();
                setChartOptions((prevOptions) => ({
                    ...prevOptions,
                    title: { text: intl.formatMessage({ id: "phenology.plot.title_su" }) },
                    xAxis: { ...prevOptions.xAxis, categories: suDateLabels },
                    series: [{ ...prevOptions.series[0], data: IndicatorValues, name: intl.formatMessage({ id: "phenology.plot.title_su" }) }]
                }));
            }

            setChartLoading(false);
        }
    }, [IndicatorValues]);

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

            <Container flex={2} minWidth={"container.xl"}>
                <Box border="2px solid #3498DB" borderRadius="10px" padding={3}>
                    <HStack>
                        <Box fontSize="xl">{intl.formatMessage({ id: "phenology.heading" })}</Box>
                        <InfoTooltip i18n_path="phenology.info" />
                    </HStack>
                    <Box pt={1}>
                        <p>
                            {intl.formatMessage({ id: "phenology.heading_descr" })}{" "}
                            <a
                            href={intl.formatMessage({ id: "phenology.heading_descr_link" })}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#1a0dab", textDecoration: "underline" }}
                            >
                            {intl.formatMessage({ id: "phenology.heading_descr_link_text" })}
                            </a>
                            {intl.formatMessage({ id: "phenology.heading_descr_end" })}
                        </p>
                    </Box>
                </Box>

                <Box mt={4}>
                    <Text>{intl.formatMessage({ id: "phenology.select_indicator" })}:</Text>
                    <VStack align={"start"}>
                        <HStack>
                            <label>
                                <input
                                    type="radio"
                                    value="CDD"
                                    checked={selectedIndicator === "CDD"}
                                    onChange={(e) => setSelectedIndicator(e.target.value)}
                                />{" "}
                                {intl.formatMessage({ id: "phenology.cdd" })}
                            </label>
                            <InfoTooltip i18n_path="phenology.cdd_info"/>
                        </HStack>
                        <HStack>
                            <label>
                                <input
                                    type="radio"
                                    value="CSU"
                                    checked={selectedIndicator === "CSU"}
                                    onChange={(e) => setSelectedIndicator(e.target.value)}
                                />{" "}
                                {intl.formatMessage({ id: "phenology.csu" })}
                            </label>
                        <InfoTooltip i18n_path="phenology.csu_info"/>
                        </HStack>
                        <HStack>
                            <label>
                                <input
                                    type="radio"
                                    value="SU"
                                    checked={selectedIndicator === "SU"}
                                    onChange={(e) => setSelectedIndicator(e.target.value)}
                                />{" "}
                                {intl.formatMessage({ id: "phenology.su" })}
                            </label>
                        <InfoTooltip i18n_path="phenology.su_info"/>
                        </HStack>
                    </VStack>
                </Box>
                <Box mt={5}>
                    <VStack>
                        {metadata.time.length > 0 && (
                            <>
                                {(selectedIndicator === "CDD" || selectedIndicator === "CSU") && (
                                    <>
                                        <Box mt={2}>
                                            <HStack>
                                                <p>
                                                    Seleccione el período entre:{" "}
                                                    {dateObjects?.[0] && getSeasonLabel(dateObjects[0])}{" "}
                                                    -{" "}
                                                    {dateObjects?.length > 0 &&
                                                        getSeasonLabel(
                                                            dateObjects[dateObjects.length - 1]
                                                        )}
                                                </p>
                                                <InfoTooltip i18n_path="phenology.info_slider"></InfoTooltip>
                                            </HStack>
                                        </Box>

                                        <Box position="relative" width="100%">
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
                                                        const isFirstOfYear =
                                                            index === 0 || dateObjects[index - 1].getFullYear() !== year;
                                                        const isFifthYear = isFirstOfYear && year % 5 === 0;

                                                        return (
                                                            isFirstOfYear && (
                                                                <Box
                                                                    key={`tick-${year}`}
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

                                            <Box position="relative" mt="0.5" height="20px">
                                                {dateObjects.map((date, index) => {
                                                    const year = date.getFullYear();
                                                    const isFirstOfYear =
                                                        index === 0 || dateObjects[index - 1].getFullYear() !== year;
                                                    const isFifthYear = isFirstOfYear && year % 5 === 0;

                                                    return (
                                                        isFifthYear && (
                                                            <Text
                                                                key={`label-${year}`}
                                                                position="absolute"
                                                                left={`${(index / (dateObjects.length - 1)) * 100}%`}
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
                                        </Box>

                                        <Box
                                            mt={2}
                                            textAlign="center"
                                            fontSize="lg"
                                            fontWeight="bold"
                                        >
                                            {dateObjects[sliderValue]
                                                ? getSeasonLabel(dateObjects[sliderValue])
                                                : "Loading..."}
                                        </Box>
                                    </>
                                )}
                                {selectedIndicator === "SU" && (
                                    <>
                                        <Box mt={2}>
                                            <HStack>
                                                <p>
                                                    Seleccione el período entre:{" "}
                                                    {dateObjects_SU?.[0] &&
                                                        dateObjects_SU[0].getFullYear()}{" "}
                                                    –{" "}
                                                    {dateObjects_SU?.[dateObjects_SU.length - 1] &&
                                                        dateObjects_SU[
                                                            dateObjects_SU.length - 1
                                                        ].getFullYear()}
                                                </p>
                                                <InfoTooltip i18n_path="phenology.info_slider"></InfoTooltip>
                                            </HStack>
                                        </Box>
                                        <Box position="relative" width="100%">
                                            <Slider
                                                min={0}
                                                max={dateObjects_SU.length - 1}
                                                step={1}
                                                value={sliderValue}
                                                onChange={(value) => setSliderValue(value)}
                                            >
                                                <SliderTrack bg="gray.200">
                                                    <SliderFilledTrack bg="blue.450" />
                                                    {dateObjects_SU.map((date, index) => {
                                                        const year = date.getFullYear();
                                                        const isFirstOfYear =
                                                            index === 0 || dateObjects_SU[index - 1].getFullYear() !== year;
                                                        const isFifthYear = isFirstOfYear && year % 5 === 0;
                                                        return (
                                                            isFirstOfYear && (
                                                                <Box
                                                                    key={`tick-${year}`}
                                                                    position="absolute"
                                                                    left={`${(index / (dateObjects_SU.length - 1)) * 100}%`}
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
                                                {dateObjects_SU.map((date, index) => {
                                                    const year = date.getFullYear();
                                                    const isFirstOfYear =
                                                        index === 0 || dateObjects_SU[index - 1].getFullYear() !== year;
                                                    const isFifthYear = isFirstOfYear && year % 5 === 0;

                                                    return (
                                                        isFifthYear && (
                                                            <Text
                                                                key={`label-${year}`}
                                                                position="absolute"
                                                                left={`${(index / (dateObjects_SU.length - 1)) * 100}%`}
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
                                        </Box>

                                        <Box
                                            mt={2}
                                            textAlign="center"
                                            fontSize="lg"
                                            fontWeight="bold"
                                        >
                                            {getSeasonLabel(dateObjects_SU[sliderValue])}
                                        </Box>
                                    </>
                                )}
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
                    <DynamicLegend position={"right"} variable={selectedIndicator} />
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
