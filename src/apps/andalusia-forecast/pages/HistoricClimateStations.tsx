import React, {useEffect, useRef, useState} from 'react';
import {Box, Container, Switch} from "@open-pioneer/chakra-integration";
import {Radio, RadioGroup, Stack, VStack} from "@chakra-ui/react";
import {useIntl} from "open-pioneer:react-hooks";
import {Header} from "../components/MainComponents/Header";
import {MainMap} from "../components/MainComponents/MainMap";
import {useMapModel} from "@open-pioneer/map";
import {MAP_ID} from '../services/HistoricClimateStationsMapProvider';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {RegionZoom} from "../components/RegionZoom/RegionZoom"; // Import RegionZoom
import SelectInteraction from "ol/interaction/Select";
import {click} from "ol/events/condition";

const HistoricClimateStations = () => {
    const intl = useIntl();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapState = useMapModel(MAP_ID);
    const [stationsVisible, setStationsVisible] = useState(true);
    const [selectedFeatureId, setSelectedFeatureId] = useState(null);

    // State for managing data
    interface DataState {
        precip?: any;
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
        chart: { type: 'column' },
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

    // Add interaction to map for MAP_ID
    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;

            const selectInteraction = new SelectInteraction({
                condition: click,
                layers: (layer) => layer.get("title") === "Stations",
            });
            olMap.addInteraction(selectInteraction);
            selectInteraction.on("select", (event) => {
                const selectedFeatures = event.selected;
                if (selectedFeatures.length > 0) {
                    const feature = selectedFeatures[0];
                    const properties = feature?.getProperties();
                    setSelectedFeatureId(properties?.ID);
                }
            });
            return () => {
                olMap.removeInteraction(selectInteraction);
            };
        }
    }, [mapState]);

    useEffect(() => {
            if (selectedFeatureId !== null) {
                const fetchData = async (type: string, id: any, initialLimit: number) => {
                    let currentLimit = initialLimit;
                    let fetchedData = null;
                    while (true) {
                        const url = `https://i-cisk.dev.52north.org/data/collections/AEMET_stations_${type}/items?f=json&lang=en-US&limit=${currentLimit}&skipGeometry=false&offset=0&CODI_INM=${id}`;
                        try {
                            setLoading(true);
                            const response = await fetch(url);
                            if (!response.ok) throw new Error("Network response was not ok");
                            const jsonData = await response.json();
                            //console.log(`Fetched ${type} data (limit=${currentLimit}):`, jsonData);
                            if (jsonData.numberMatched > jsonData.numberReturned) {
                                //console.log(`Increasing limit for ${type} to ${jsonData.numberMatched}`);
                                currentLimit = jsonData.numberMatched; // Set the limit to the total number of features
                            } else {
                                fetchedData = jsonData;
                                break;
                            }
                        } catch (err: any) {
                            setError(err.message);
                            break;
                        } finally {
                            setLoading(false);
                        }
                    }
                    // Save the fetched data to the state
                    if (fetchedData) {
                        setData((prevData) => ({
                            ...prevData,
                            [type]: fetchedData,
                        }));
                    }
                };
                const id = selectedFeatureId;
                const initialLimit = 500;
                const types = ["precip", "t_mean", "t_max", "t_min"]; // Datatypes to fetch
                types.forEach((type) => fetchData(type, id, initialLimit));
            }
        }, [selectedFeatureId]);
    
        useEffect(() => {
            //console.log('Current data:', data);
        }, [data]); 
    
        useEffect(() => {
            if (data.precip && data.t_mean && data.t_max && data.t_min) {
                // Initialize a common time interval based on all data types
                const allFeatures = [
                    ...(data.precip?.features || []),
                    ...(data.t_mean?.features || []),
                    ...(data.t_max?.features || []),
                    ...(data.t_min?.features || []),
                ];
                // Sort all features by date and find the earliest and latest date
                const sortedAllFeatures = allFeatures.sort((a, b) => {
                    const dateA = new Date(a.properties.DATE);
                    const dateB = new Date(b.properties.DATE);
                    return dateA - dateB;
                });
                if (sortedAllFeatures.length === 0) return; // No data available
                
                const firstDate = new Date(sortedAllFeatures[0].properties.DATE);
                const lastDate = new Date(sortedAllFeatures[sortedAllFeatures.length - 1].properties.DATE);
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
                // Log the categories to debug
                // console.log("Categories:", categories);
                // Initialize series data
                const precipSeriesData = new Array(categories.length).fill(null);
                const meanTempSeriesData = new Array(categories.length).fill(null);
                const maxTempSeriesData = new Array(categories.length).fill(null);
                const minTempSeriesData = new Array(categories.length).fill(null);
                // Fill the series with the respective data
                const mapFeaturesToSeries = (features, property, seriesData) => {
                    features.forEach((feature) => {
                        const date = new Date(feature.properties.DATE).toISOString().split("T")[0].slice(0, 7); // Format: YYYY-MM
                        const index = categories.indexOf(date);
                        if (index !== -1) {
                            seriesData[index] = feature.properties[property];
                        } else {
                            // console.log(`Date ${date} not found in categories`);
                        }
                    });
                };
                // Process the different data types
                if (data.precip?.features) {
                    // console.log("Mapping Precipitation Data:", data.precip.features);
                    mapFeaturesToSeries(data.precip.features, "PL_monthly", precipSeriesData);
                }
                if (data.t_mean?.features) {
                    // console.log("Mapping Mean Temperature Data:", data.t_mean.features);
                    mapFeaturesToSeries(data.t_mean.features, "MT_monthly", meanTempSeriesData);
                }
                if (data.t_max?.features) {
                    // console.log("Mapping Max Temperature Data:", data.t_max.features);
                    mapFeaturesToSeries(data.t_max.features, "MX_monthly", maxTempSeriesData);
                }
                if (data.t_min?.features) {
                    // console.log("Mapping Min Temperature Data:", data.t_min.features);
                    mapFeaturesToSeries(data.t_min.features, "MN_monthly", minTempSeriesData);
                }
                // Log the series data to debug
                // console.log("Precipitation Series Data:", precipSeriesData);
                // console.log("Mean Temperature Series Data:", meanTempSeriesData);
                // console.log("Max Temperature Series Data:", maxTempSeriesData);
                // console.log("Min Temperature Series Data:", minTempSeriesData);
                const allSeries = [
                    {
                        name: "Mean Temperature",
                        data: meanTempSeriesData,
                        type: "spline",
                        color: "rgba(255, 179, 71, 1)", // Lighter orange with 50% opacity
                        yAxis: 1,
                    },
                    {
                        name: "Max Temperature",
                        data: maxTempSeriesData,
                        type: "spline",
                        color: "rgba(255, 133, 133, 1)", // Lighter red with 50% opacity
                        yAxis: 1,
                    },
                    {
                        name: "Min Temperature",
                        data: minTempSeriesData,
                        type: "spline",
                        color: "rgba(153, 255, 153, 1)", // Lighter green with 50% opacity
                        yAxis: 1,
                    },
                    {
                        name: "Precipitation",
                        data: precipSeriesData,
                        type: "column",
                        color: "blue",
                        yAxis: 0,
                    }
                ];
                const filteredSeries =
                selectedCategory === "1"
                    ? allSeries
                    : selectedCategory === "2"
                    ? allSeries.filter((s) => s.name.includes("Temperature"))
                    : selectedCategory === "3"
                    ? allSeries.filter((s) => s.name === "Precipitation")
                    : [];
                // console.log("Filtered Series:", filteredSeries);
                // Update the chart options
                setChartOptions({
                    chart: {
                        type: "column",
                        zoomType: "x"
                    },
                    title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
                    xAxis: { categories, title: { text: "Date" } },
                    yAxis: [
                        {
                            // Left axis for precipitation
                            title: { text: `${intl.formatMessage({ id: "global.vars.precip" })} (mm)` },
                            //min: 0,
                            opposite: false, // Default: left
                        },
                        {
                            // Right axis for temperature
                            title: { text: `${intl.formatMessage({ id: "global.vars.temp" })} (°C)` },
                            //min: 0,
                            opposite: true, // Display on the right
                        },
                    ],
                    series: filteredSeries,
                });
                
            }
        }, [data, intl, selectedCategory]);

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;

            const stationsLayer = olMap.getLayers().getArray().find(layer => layer.get('title') === 'Stations');
            if (stationsLayer) {
                stationsLayer.setVisible(stationsVisible);
            }
        }
    }, [stationsVisible, mapState]);

    return (
        <Container minWidth={"container.xl"}>
            <Header subpage={'historic_stations'} />
            <VStack>
                <Container flex={2} minWidth={"container.xl"}>
                    {/* Map section */}
                    <div style={{ flex: 1 }}>
                        {/* Removed year and month selection */}
                    </div>
                    <Box width="100%" height="500px" position="relative">
                        <MainMap MAP_ID={MAP_ID} />
                        {/* Removed DynamicPrecipitationLegend */}
                        <Box position="absolute" bottom="10px" left="10px">
                            <Switch
                                isChecked={stationsVisible}
                                onChange={() => setStationsVisible(!stationsVisible)}
                            >
                                {intl.formatMessage({ id: "global.controls.toggle_stations" })}
                            </Switch>
                        </Box>
                    </Box>
                    <Box width="100000%" pt={6}> {/* no idea why, but when i dont move it out of view the buttons are rendered twice */}
                        <RegionZoom MAP_ID={MAP_ID} /> {/* Added RegionZoom below the map */}
                    </Box>
                </Container>
                <Box width="100%" height="300px" position="relative" mt={20}>
                    <RadioGroup value={selectedCategory} onChange={setSelectedCategory}>
                        <Stack direction="row">
                            <Radio value="1">{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.temp_precip"})}</Radio>
                            <Radio value="2">{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.temp"})}</Radio>
                            <Radio value="3">{intl.formatMessage({ id: "historic_climate_stations.radio_buttons.precip"})}</Radio>
                        </Stack>
                    </RadioGroup>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </Box>
            </VStack>
        </Container>
    );
};

export default HistoricClimateStations;
