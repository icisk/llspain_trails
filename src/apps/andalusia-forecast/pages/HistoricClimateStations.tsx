import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Switch, Text } from "@open-pioneer/chakra-integration";
import { Radio, RadioGroup, Stack, VStack } from "@chakra-ui/react";
import { useIntl, useService } from "open-pioneer:react-hooks";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";
import { useMapModel } from "@open-pioneer/map";
import { MAP_ID } from "../services/HistoricClimateStationsMapProvider";
import { StationValueLegend } from "../components/Legends/StationValueLegend";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { RegionZoom } from "../components/RegionZoom/RegionZoom"; // Import RegionZoom
import SelectInteraction from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { CompareTwoStations } from "../components/CompareTwoStations/CompareTwoStations";
import { StationDataHandler } from "../services/StationDataHandler";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { mesesEnEspanol } from "../components/utils/globals";
import { Overlay } from "ol";

const HistoricClimateStations = () => {
    const intl = useIntl();
    const stationDataService = useService<StationDataHandler>("app.StationDataHandler");
    const mapRef = useRef<HTMLDivElement>(null);
    const mapState = useMapModel(MAP_ID);
    const [stationsVisible, setStationsVisible] = useState(true);
    const [selectedFeatureId, setSelectedFeatureId] = useState(null);
    const [lastChangedID, setlastChangedID] = useState(null);
    const [lastChangedElement, setlastChangedElement] = useState(null);
    // const [selectedStationId, setSelectedStationId] = useState(stationDataService.selectedStationId);
    const [hoveredStationName, setHoveredStationName] = useState<string | null>(null);

    // State for managing data
    interface DataState {
        features?: any;
    }

    // Hook to manage selected category from Radio buttons
    const [selectedCategory, setSelectedCategory] = useState("1");

    const [data, setData] = useState<DataState>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    interface SeriesOptions {
        name: string;
        data: any[];
        type: string;
        color: string;
        yAxis: number;
    }

    const [chartOptions, setChartOptions] = useState<Highcharts.Options>({
        chart: { type: "column" },
        title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
        xAxis: { categories: [] },
        yAxis: { title: { text: "Precipitation (mm)" }, min: 0 },
        series: [] as SeriesOptions[],
        plotOptions: {
            series: {
                zones: []
            }
        }
    });

    const [
        selectedStationId,
        selectedYear,
        modus,
        selectedFromTimeRange,
        selectedToTimeRange,
        selectedMonth,
        selectedYear1,
        selectedYear2
    ] = useReactiveSnapshot(
        () => [
            stationDataService.selectedStationId,
            stationDataService.selectedYear,
            stationDataService.modus,
            stationDataService.selectedFromTimeRange,
            stationDataService.selectedToTimeRange,
            stationDataService.selectedMonth,
            stationDataService.selectedYear1,
            stationDataService.selectedYear2
        ],
        [stationDataService]
    );

    const [selectInteraction, setSelectInteraction] = useState(null);

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;

            // Find the "Stations" layer
            const vectorLayer = olMap
                .getLayers()
                .getArray()
                .find((layer) => layer.get("title") === "Stations");
            if (!vectorLayer) return;

            const source = vectorLayer.getSource();
            if (!source) return;

            // Create the click-based selection interaction
            const interaction = new SelectInteraction({
                condition: click,
                layers: (layer) => layer.get("title") === "Stations"
            });

            olMap.addInteraction(interaction);

            interaction.on("select", (event) => {
                const selectedFeatures = event.selected;
                if (selectedFeatures.length > 0) {
                    const feature = selectedFeatures[0];
                    const properties = feature?.getProperties();
                    setSelectedFeatureId(properties?.CODE_INM);
                    stationDataService.setStationLeft(properties?.NAME_STATION);
                }
            });

            // Store interaction for programmatic selection
            setSelectInteraction(interaction);

            return () => {
                olMap.removeInteraction(interaction);
            };
        }
    }, [mapState]);

    // Programmatic selection when stationId changes
    useEffect(() => {
        if (mapState?.map?.olMap && selectedStationId && selectInteraction) {
            const vectorLayer = mapState.map.olMap
                .getLayers()
                .getArray()
                .find((layer) => layer.get("title") === "Stations");
            if (!vectorLayer) return;

            const source = vectorLayer.getSource();
            if (!source) return;

            // Find feature by selectedStationId
            const feature = source
                .getFeatures()
                .find((f) => f.get("CODE_INM") === selectedStationId);
            if (!feature) return;

            // This ensures OpenLayers correctly triggers selection events
            selectInteraction.getFeatures().clear(); // Clear previous selection
            selectInteraction.getFeatures().push(feature); // Select new feature
            selectInteraction.dispatchEvent({
                type: "select",
                selected: [feature],
                deselected: []
            });

            // Update the state
            setSelectedFeatureId(selectedStationId);
            stationDataService.setStationLeft(feature.get("NAME_STATION"));
        }
    }, [selectedStationId, selectInteraction]);

    const prevValues = useRef({ selectedFeatureId, selectedStationId });
    useEffect(() => {
        if (prevValues.current.selectedFeatureId !== selectedFeatureId) {
            setlastChangedID(selectedFeatureId);
            setlastChangedElement("map");
        }
        if (prevValues.current.selectedStationId !== selectedStationId) {
            setlastChangedID(selectedStationId);
            setlastChangedElement("dropdown");
        }
        prevValues.current = { selectedFeatureId, selectedStationId };
    }, [selectedFeatureId, selectedStationId]);

    useEffect(() => {
        if (selectedFeatureId !== null || selectedStationId !== null) {
            const fetchData = async (id: any) => {
                let fetchedData = null;
                const url = `https://i-cisk.dev.52north.org/data/collections/AEMET_stations_all/items?f=json&limit=2500&CODE_INM=${id}`;
                try {
                    setLoading(true);
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("Network response was not ok");
                    const jsonData = await response.json();
                    fetchedData = jsonData;
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
                if (fetchedData) {
                    setData(fetchedData);
                }
            };

            if (lastChangedID !== null) {
                fetchData(lastChangedID);
            }
        }
    }, [lastChangedID]);

    useEffect(() => {
        // console.log('Current data:', data);
    }, [data]);

    useEffect(() => {
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
            intl.formatMessage({ id: "global.months.sep" }),
            intl.formatMessage({ id: "global.months.oct" }),
            intl.formatMessage({ id: "global.months.nov" }),
            intl.formatMessage({ id: "global.months.dec" })
        ];
        if (data?.features) {
            // Initialize a common time interval based on all data types
            const allFeatures = data.features;

            // Sort all features by date and find the earliest and latest date
            const sortedAllFeatures = allFeatures.sort((a, b) => {
                const dateA = new Date(a.properties.TIMESTAMP);
                const dateB = new Date(b.properties.TIMESTAMP);
                return dateA - dateB;
            });
            if (sortedAllFeatures.length === 0) return; // No data available

            const firstDate = new Date(sortedAllFeatures[0].properties.TIMESTAMP);
            const lastDate = new Date(
                sortedAllFeatures[sortedAllFeatures.length - 1].properties.TIMESTAMP
            );

            // Create the categories (time axis) for the x-axis (months)
            const categories = [];
            const currentDate = new Date(firstDate);

            while (currentDate <= lastDate) {
                const month = currentDate.toISOString().split("T")[0].slice(0, 7); // Format: YYYY-MM
                if (!categories.includes(month)) {
                    categories.push(month);
                }
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            const years = [...new Set(categories.map((date) => new Date(date).getFullYear()))];
            stationDataService.setAvailableYears(years);

            // Log the categories to debug
            // console.log("Categories:", categories);
            // Initialize series data
            const precipSeriesData = new Array(categories.length).fill(null);
            const meanTempSeriesData = new Array(categories.length).fill(null);
            const maxTempSeriesData = new Array(categories.length).fill(null);
            const minTempSeriesData = new Array(categories.length).fill(null);

            // Fill the series with the respective data
            if (data?.features) {
                data.features.forEach((feature) => {
                    const date = new Date(feature.properties.TIMESTAMP)
                        .toISOString()
                        .split("T")[0]
                        .slice(0, 7); // Format: YYYY-MM
                    const index = categories.indexOf(date);
                    if (index !== -1) {
                        precipSeriesData[index] = feature.properties.PL_mm ?? null;
                        meanTempSeriesData[index] = feature.properties.MT_C ?? null;
                        maxTempSeriesData[index] = feature.properties.MX_C ?? null;
                        minTempSeriesData[index] = feature.properties.MN_C ?? null;
                    } else {
                        //console.error(`Date ${date} not found in categories`);
                    }
                });
            }

            // Log the series data to debug
            // console.log("Precipitation Series Data:", precipSeriesData);
            // console.log("Mean Temperature Series Data:", meanTempSeriesData);
            // console.log("Max Temperature Series Data:", maxTempSeriesData);
            // console.log("Min Temperature Series Data:", minTempSeriesData);

            let allSeries = [
                {
                    name: intl.formatMessage({ id: "global.vars.temp_mean" }),
                    data: meanTempSeriesData,
                    type: "spline",
                    color: "rgba(255, 179, 71, 1)", // Lighter orange with 50% opacity
                    marker: { symbol: "point", radius: 3 },
                    yAxis: 1
                },
                {
                    name: intl.formatMessage({ id: "global.vars.temp_max" }),
                    data: maxTempSeriesData,
                    type: "spline",
                    color: "rgba(255, 133, 133, 1)", // Lighter red with 50% opacity
                    marker: { symbol: "point", radius: 3 },
                    yAxis: 1
                },
                {
                    name: intl.formatMessage({ id: "global.vars.temp_min" }),
                    data: minTempSeriesData,
                    type: "spline",
                    color: "rgba(153, 255, 153, 1)", // Lighter green with 50% opacity
                    marker: { symbol: "point", radius: 3 },
                    yAxis: 1
                },
                {
                    name: intl.formatMessage({ id: "global.vars.precip" }),
                    data: precipSeriesData,
                    type: "column",
                    color: "blue",
                    yAxis: 0
                }
            ];

            function getIndexesByYear(categories, selectedYear) {
                return categories
                    .map((date, index) => {
                        return date.startsWith(selectedYear) ? index : -1;
                    })
                    .filter((index) => index !== -1); // Filter out -1 (dates that don't match)
            }
            const getIndexesByMonth = (dates, targetMonth) => {
                const formattedMonth = targetMonth.toString().padStart(2, "0");
                return dates
                    .map((date, index) => (date.split("-")[1] === formattedMonth ? index : -1))
                    .filter((index) => index !== -1);
            };
            let seriesYear1 = [];
            let seriesYear2 = [];
            let datesYear1 = [];
            let datesYear2 = [];
            let chartControl = "";
            if (modus === "no_filter") {
                stationDataService.setCompareOneYear(null);
                stationDataService.setCompareTwoYears1(null);
                stationDataService.setCompareTwoYears2(null);
                stationDataService.setFromTimeRange(null);
                stationDataService.setToTimeRange(null);
                stationDataService.setCompareOneMonth(null);
            } else if (modus === "one_year") {
                stationDataService.setCompareTwoYears1(null);
                stationDataService.setCompareTwoYears2(null);
                stationDataService.setFromTimeRange(null);
                stationDataService.setToTimeRange(null);
                stationDataService.setCompareOneMonth(null);

                if (selectedYear !== null) {
                    const matchingIndexes = getIndexesByYear(categories, selectedYear);
                    allSeries.forEach((serie) => {
                        serie.data = matchingIndexes.map((i) => serie.data[i]);
                    });
                    categories.splice(
                        0,
                        categories.length,
                        ...matchingIndexes.map((i) => categories[i])
                    );
                }
            } else if (modus === "two_years") {
                stationDataService.setCompareOneYear(null);

                stationDataService.setFromTimeRange(null);
                stationDataService.setToTimeRange(null);
                stationDataService.setCompareOneMonth(null);
                if (selectedYear1 !== null && selectedYear2 !== null) {
                    chartControl = "two_years";

                    function getStartMonthIndex(categories, year) {
                        const firstDateIndex = categories.findIndex((date) =>
                            date.startsWith(year)
                        );
                        if (firstDateIndex !== -1) {
                            return new Date(categories[firstDateIndex]).getMonth();
                        }
                        return null;
                    }

                    const indexYear1 = getIndexesByYear(categories, selectedYear1);
                    const indexYear2 = getIndexesByYear(categories, selectedYear2);

                    datesYear1 = indexYear1.map((index) => categories[index]);
                    datesYear2 = indexYear2.map((index) => categories[index]);
                    // console.log(datesYear1, datesYear2);

                    const startMonthIndex1 = getStartMonthIndex(categories, selectedYear1);
                    const startMonthIndex2 = getStartMonthIndex(categories, selectedYear2);
                    // console.log(startMonthIndex1, startMonthIndex2)

                    function createSeriesData(series, indexYear, startMonthIndex) {
                        const data = new Array(12).fill(null);
                        indexYear.forEach((index) => {
                            const monthIndex = new Date(categories[index]).getMonth();
                            //console.log(`Index: ${index}, Month Index: ${monthIndex}, Data Value: ${series.data[index]}`);

                            if (monthIndex >= 0 && monthIndex < 12) {
                                data[monthIndex] = series.data[index];
                            }
                        });
                        return data;
                    }

                    seriesYear1 = allSeries.map((serie) => ({
                        ...serie,
                        data: createSeriesData(serie, indexYear1, startMonthIndex1)
                    }));
                    seriesYear2 = allSeries.map((serie) => ({
                        ...serie,
                        data: createSeriesData(serie, indexYear2, startMonthIndex2)
                    }));

                    seriesYear1[0].marker = { symbol: "point", radius: 7 };
                    seriesYear1[0].color = "rgb(220,167,52)";
                    seriesYear1[0].type = "scatter";
                    seriesYear1[0].zIndex = 2;

                    seriesYear1[1].marker = { symbol: "triangle-down", radius: 7 };
                    seriesYear1[1].color = "rgb(89,7,7)";
                    seriesYear1[1].type = "scatter";
                    seriesYear1[1].zIndex = 2;

                    seriesYear1[2].marker = { symbol: "triangle", radius: 7 };
                    seriesYear1[2].color = "rgb(27,78,13)";
                    seriesYear1[2].type = "scatter";
                    seriesYear1[2].zIndex = 2;

                    seriesYear1[3].color = "rgb(14,36,78)";
                    seriesYear1[3].zIndex = 1;

                    seriesYear2[0].marker = { symbol: "point", radius: 5 };
                    seriesYear2[0].color = "rgb(207,125,73)";
                    seriesYear2[0].type = "scatter";
                    seriesYear2[0].zIndex = 3;

                    seriesYear2[1].marker = { symbol: "triangle-down", radius: 5 };
                    seriesYear2[1].color = "rgb(243,33,82)";
                    seriesYear2[1].type = "scatter";
                    seriesYear2[1].zIndex = 3;

                    seriesYear2[2].marker = { symbol: "triangle", radius: 5 };
                    seriesYear2[2].color = "rgba(124, 237, 92, 1)";
                    seriesYear2[2].type = "scatter";
                    seriesYear2[2].zIndex = 3;

                    seriesYear2[3].color = "rgb(75,159,241)";
                    seriesYear2[3].zIndex = 1;

                    // console.log(seriesYear1, seriesYear2);
                }
            } else if (modus === "time_range") {
                stationDataService.setCompareOneYear(null);
                stationDataService.setCompareTwoYears1(null);
                stationDataService.setCompareTwoYears2(null);

                stationDataService.setCompareOneMonth(null);
                if (selectedFromTimeRange !== null && selectedToTimeRange !== null) {
                    let startIndexes = getIndexesByYear(categories, selectedFromTimeRange);
                    let endIndexes = getIndexesByYear(categories, selectedToTimeRange);
                    if (selectedFromTimeRange > selectedToTimeRange) {
                        startIndexes = endIndexes;
                    }
                    allSeries.forEach((serie) => {
                        serie.data = serie.data.slice(
                            startIndexes[0],
                            endIndexes[endIndexes.length - 1] + 1
                        );
                    });
                    categories.splice(
                        0,
                        categories.length,
                        ...categories.slice(startIndexes[0], endIndexes[endIndexes.length - 1] + 2)
                    );
                }
            } else if (modus === "month") {
                stationDataService.setCompareOneYear(null);
                stationDataService.setCompareTwoYears1(null);
                stationDataService.setCompareTwoYears2(null);
                stationDataService.setFromTimeRange(null);
                stationDataService.setToTimeRange(null);

                if (selectedMonth !== null) {
                    const monthIndexes = getIndexesByMonth(categories, selectedMonth + 1);

                    allSeries.forEach((serie) => {
                        serie.data.splice(
                            0,
                            serie.data.length,
                            ...monthIndexes.map((index) => serie.data[index])
                        );
                    });
                    categories.splice(
                        0,
                        categories.length,
                        ...monthIndexes.map((index) => categories[index])
                    );
                }
            }

            const filteredSeries =
                selectedCategory === "1"
                    ? allSeries
                    : selectedCategory === "2"
                      ? allSeries.filter((s) => s.name.includes("Temperatura"))
                      : selectedCategory === "3"
                        ? allSeries.filter(
                              (s) => s.name === intl.formatMessage({ id: "global.vars.precip" })
                          )
                        : [];

            const filteredSeriesYear1 =
                selectedCategory === "1"
                    ? seriesYear1
                    : selectedCategory === "2"
                      ? seriesYear1.filter((s) => s.name.includes("Temperatura"))
                      : selectedCategory === "3"
                        ? seriesYear1.filter(
                              (s) => s.name === intl.formatMessage({ id: "global.vars.precip" })
                          )
                        : [];

            const filteredSeriesYear2 =
                selectedCategory === "1"
                    ? seriesYear2
                    : selectedCategory === "2"
                      ? seriesYear2.filter((s) => s.name.includes("Temperatura"))
                      : selectedCategory === "3"
                        ? seriesYear2.filter(
                              (s) => s.name === intl.formatMessage({ id: "global.vars.precip" })
                          )
                        : [];

            filteredSeriesYear1.year = selectedYear1;
            filteredSeriesYear2.year = selectedYear2;
            //console.log(selectedCategory, "Filtered Series:", filteredSeries);
            // Update the chart options
            if (modus === "two_years" && chartControl === "two_years") {
                // console.log(mesesEnEspanol)

                console.log(filteredSeriesYear1);

                setChartOptions({
                    chart: {
                        type: "column",
                        zoomType: "x"
                    },
                    title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
                    xAxis: {
                        categories: mesesEnEspanol,
                        title: { text: intl.formatMessage({ id: "global.vars.date" }) }
                    },
                    yAxis: [
                        {
                            // Left axis for precipitation
                            title: {
                                text: `${intl.formatMessage({ id: "global.vars.precip" })} (mm)`
                            },
                            //min: 0,
                            opposite: false // Default: left
                        },
                        {
                            // Right axis for temperature
                            title: {
                                text: `${intl.formatMessage({ id: "global.vars.temp" })} (°C)`
                            },
                            //min: 0,
                            opposite: true // Display on the right
                        }
                    ],
                    series: [
                        ...filteredSeriesYear1.map((s) => ({
                            ...s,
                            year: filteredSeriesYear1.year
                        })),
                        ...filteredSeriesYear2.map((s) => ({
                            ...s,
                            year: filteredSeriesYear2.year
                        }))
                    ],
                    tooltip: {
                        shared: true,
                        pointFormatter: function () {
                            let year = this.series.userOptions.year;

                            const value =
                                this.y !== null ? Highcharts.numberFormat(this.y, 2) : "–";
                            // return `<span style="color:${this.color}">\u25CF</span> ${year}: <b>${value}</b><br/>`;
                            return `${year}: <b>${value}</b><br/>`;
                        }
                    }
                });
            } else {
                setChartOptions({
                    chart: {
                        type: "column",
                        zoomType: "x"
                    },
                    title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
                    xAxis: {
                        categories,
                        title: { text: intl.formatMessage({ id: "global.vars.date" }) }
                    },
                    yAxis: [
                        {
                            // Left axis for precipitation
                            title: {
                                text: `${intl.formatMessage({ id: "global.vars.precip" })} (mm)`
                            },
                            //min: 0,
                            opposite: false // Default: left
                        },
                        {
                            // Right axis for temperature
                            title: {
                                text: `${intl.formatMessage({ id: "global.vars.temp" })} (°C)`
                            },
                            //min: 0,
                            opposite: true // Display on the right
                        }
                    ],
                    series: filteredSeries
                });
            }
        }
    }, [
        data,
        intl,
        selectedCategory,
        stationDataService,
        selectedYear,
        modus,
        selectedFromTimeRange,
        selectedToTimeRange,
        selectedMonth,
        selectedYear1,
        selectedYear2
    ]);

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;

            const stationsLayer = olMap
                .getLayers()
                .getArray()
                .find((layer) => layer.get("title") === "Stations");
            if (stationsLayer) {
                stationsLayer.setVisible(stationsVisible);
            }
        }
    }, [stationsVisible, mapState]);

    // Stationname on mouseover
    useEffect(() => {
        if (!mapState?.map?.olMap) return;

        const handlePointerMove = (event: any) => {
            mapState.map.olMap.forEachFeatureAtPixel(event.pixel, (feature: any) => {
                const name = feature.get("NAME_STATION");
                if (name) {
                    setHoveredStationName(name);
                }
            });
        };

        mapState.map.olMap.on("pointermove", handlePointerMove);

        return () => {
            mapState.map.olMap.un("pointermove", handlePointerMove);
        };
    }, [mapState]);

    return (
        <Container minWidth={"container.xl"}>
            <Header subpage={"historic_stations"} />
            <VStack>
                <Container flex={2} minWidth={"container.xl"}>
                    {/* Map section */}
                    <div style={{ flex: 1 }}>{/* Removed year and month selection */}</div>
                    <Box width="100%" height="500px" position="relative">
                        <MainMap MAP_ID={MAP_ID} />
                        <Box
                            position="absolute"
                            top="10px"
                            left="10px"
                            bg="white"
                            p={2}
                            borderRadius="md"
                            boxShadow="md"
                            zIndex={1000}
                        >
                            <Text>
                                {hoveredStationName
                                    ? hoveredStationName
                                    : intl.formatMessage({
                                          id: "historic_climate_stations.mouseoverInfo"
                                      })}
                            </Text>
                        </Box>
                        <StationValueLegend />
                        {/* Removed DynamicPrecipitationLegend */}
                        <Box position="absolute" bottom="10px" left="10px">
                            {/*<Switch*/}
                            {/*    isChecked={stationsVisible}*/}
                            {/*    onChange={() => setStationsVisible(!stationsVisible)}*/}
                            {/*>*/}
                            {/*    {intl.formatMessage({ id: "global.controls.toggle_stations" })}*/}
                            {/*</Switch>*/}
                        </Box>
                    </Box>
                    <Box width="100000%" pt={6}>
                        {" "}
                        {/* no idea why, but when i dont move it out of view the buttons are rendered twice */}
                        <RegionZoom MAP_ID={MAP_ID} /> {/* Added RegionZoom below the map */}
                    </Box>
                </Container>

                <CompareTwoStations />

                <Box width="100%" height="300px" position="relative" mt={20}>
                    <RadioGroup value={selectedCategory} onChange={setSelectedCategory}>
                        <Stack direction="row">
                            <Radio value="1">
                                {intl.formatMessage({
                                    id: "historic_climate_stations.radio_buttons.temp_precip"
                                })}
                            </Radio>
                            <Radio value="2">
                                {intl.formatMessage({
                                    id: "historic_climate_stations.radio_buttons.temp"
                                })}
                            </Radio>
                            <Radio value="3">
                                {intl.formatMessage({
                                    id: "historic_climate_stations.radio_buttons.precip"
                                })}
                            </Radio>
                        </Stack>
                    </RadioGroup>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </Box>
            </VStack>
        </Container>
    );
};

export default HistoricClimateStations;
