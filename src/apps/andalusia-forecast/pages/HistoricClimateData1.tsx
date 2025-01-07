import React, { useRef, useState, useEffect } from 'react';
import { Box, Switch } from "@open-pioneer/chakra-integration";
import { HStack, Select, VStack } from "@chakra-ui/react";
import { Container } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { ChangeMonth } from "../controls/ChangeMonth";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { RadioGroup, Radio } from "@open-pioneer/chakra-integration";
import { InfoTooltip } from "../components/InfoTooltip/InfoTooltip";
import { RegionZoom } from "../components/RegionZoom/RegionZoom";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";
import { useMapModel } from "@open-pioneer/map";
import { MAP_ID } from '../services/HistoricClimateMapProvider';
import { MAP_ID2 } from '../services/HistoricClimateMapProvider2';
import { DynamicPrecipitationLegend } from "../components/Legends/DynamicLegend";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import SelectInteraction from "ol/interaction/Select";
import { click } from "ol/events/condition";
import { connect } from 'http2';

const HistoricClimateData1 = () => {
    const intl = useIntl();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapState = useMapModel(MAP_ID);
    const mapState2 = useMapModel(MAP_ID2);
    const [stationsVisibleMap1, setStationsVisibleMap1] = useState(true);
    const [stationsVisibleMap2, setStationsVisibleMap2] = useState(true);

    const [selectedFeatureId, setSelectedFeatureId] = useState(null);
    
    // State for managing data
    interface DataState {
        precip?: any;
        t_mean?: any;
        t_max?: any;
        t_min?: any;
    }
    
    const [data, setData] = useState<DataState>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [chartOptions, setChartOptions] = useState({
        chart: { type: 'column' },
        title: { text: intl.formatMessage({ id: "global.plot.header_precip" }) },
        xAxis: { categories: [] },
        yAxis: { title: { text: "Precipitation (mm)" }, min: 0 },
        series: [],
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
                        console.log(`Fetched ${type} data (limit=${currentLimit}):`, jsonData);
    
                        if (jsonData.numberMatched > jsonData.numberReturned) {
                            console.log(`Increasing limit for ${type} to ${jsonData.numberMatched}`);
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
        console.log('Current data:', data);
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
            console.log("Categories:", categories);
    
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
                        console.log(`Date ${date} not found in categories`);
                    }
                });
            };
    
            // Process the different data types
            if (data.precip?.features) {
                console.log("Mapping Precipitation Data:", data.precip.features);
                mapFeaturesToSeries(data.precip.features, "PL_monthly", precipSeriesData);
            }
            if (data.t_mean?.features) {
                console.log("Mapping Mean Temperature Data:", data.t_mean.features);
                mapFeaturesToSeries(data.t_mean.features, "MT_monthly", meanTempSeriesData);
            }
            if (data.t_max?.features) {
                console.log("Mapping Max Temperature Data:", data.t_max.features);
                mapFeaturesToSeries(data.t_max.features, "MX_monthly", maxTempSeriesData);
            }
            if (data.t_min?.features) {
                console.log("Mapping Min Temperature Data:", data.t_min.features);
                mapFeaturesToSeries(data.t_min.features, "MN_monthly", minTempSeriesData);
            }
    
            // Log the series data to debug
            console.log("Precipitation Series Data:", precipSeriesData);
            console.log("Mean Temperature Series Data:", meanTempSeriesData);
            console.log("Max Temperature Series Data:", maxTempSeriesData);
            console.log("Min Temperature Series Data:", minTempSeriesData);
    
            // Update the chart options
            setChartOptions({
                chart: {
                    type: "column",
                    zoomType: "x"
                },
                title: { text: intl.formatMessage({ id: "global.plot.header_precip" }) },
                xAxis: { categories, title: { text: "Date" } },
                yAxis: [
                    {
                        // Left axis for precipitation
                        title: { text: "Precipitation (mm)" },
                        //min: 0,
                        opposite: false, // Default: left
                    },
                    {
                        // Right axis for temperature
                        title: { text: "Temperature (°C)" },
                        //min: 0,
                        opposite: true, // Display on the right
                    },
                ],
                series: [
                    {
                        name: "Precipitation",
                        data: precipSeriesData?.length ? precipSeriesData : [],
                        type: "column",
                        color: "blue",
                        yAxis: 0, // Left axis,
                    },
                    {
                        name: "Mean Temperature",
                        data: meanTempSeriesData?.length ? meanTempSeriesData : [],
                        //connectNulls: true,
                        type: "spline",
                        color: "orange",
                        yAxis: 1, // Right axis
                    },
                    {
                        name: "Max Temperature",
                        data: maxTempSeriesData?.length ? maxTempSeriesData : [],
                        //connectNulls: true,
                        type: "spline",
                        color: "red",
                        yAxis: 1, // Right axis
                    },
                    {
                        name: "Min Temperature",
                        data: minTempSeriesData?.length ? minTempSeriesData : [],
                        //connectNulls: true,
                        type: "spline",
                        color: "green",
                        yAxis: 1, // Right axis
                    },
                ],
            });
            
        }
    }, [data, intl]);
    
    

    useEffect(() => {
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            const stationsLayer = olMap.getLayers().getArray().find(layer => layer.get('title') === 'Stations');
            if (stationsLayer) {
                stationsLayer.setVisible(stationsVisibleMap1);
            }
        }
    }, [stationsVisibleMap1, mapState]);

    useEffect(() => {
        if (mapState2?.map?.olMap) {
            const olMap = mapState2.map.olMap;
            const stationsLayer = olMap.getLayers().getArray().find(layer => layer.get('title') === 'Stations');
            if (stationsLayer) {
                stationsLayer.setVisible(stationsVisibleMap2);
            }
        }
    }, [stationsVisibleMap2, mapState2]);

    return (
        <Container minWidth={"container.xl"}>
            <Header subpage={'historic_compare'} />
            <VStack>
                <Container flex={2} minWidth={"container.xl"}>
                    {/* First map section */}
                    <div style={{ flex: 1 }}>
                        {/* Year and month selection */}
                        <div style={{ margin: 20 }}>
                            <HStack>
                                <>
                                    {intl.formatMessage({ id: "global.controls.sel_year" })}
                                </>
                                <Select placeholder={intl.formatMessage({ id: "global.vars.year" })}>
                                    {[...Array(20)].map((_, i) => 2000 + i).map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                            <ChangeMonth />
                        </div>
                        {/* Variable selection */}
                        <RadioGroup defaultValue="1">
                            <p>{intl.formatMessage({ id: "global.controls.sel_var" })}:</p>
                            <VStack gap="1">
                                <HStack>
                                    <Radio
                                        value="1">{intl.formatMessage({ id: "global.vars.temp" })}</Radio>
                                    <InfoTooltip i18n_path="historic_compare.info.temp" />
                                </HStack>
                                <HStack>
                                    <Radio
                                        value="2">{intl.formatMessage({ id: "global.vars.precip" })}</Radio>
                                    <InfoTooltip i18n_path="historic_compare.info.precip" />
                                </HStack>
                            </VStack>
                        </RadioGroup>
                    </div>
                    <Box width="100%" height="500px" position="relative">
                        <MainMap MAP_ID={MAP_ID} />
                        <DynamicPrecipitationLegend />
                        <Box position="absolute" bottom="10px" left="10px">
                            <Switch
                                isChecked={stationsVisibleMap1}
                                onChange={() => setStationsVisibleMap1(!stationsVisibleMap1)}
                            >
                                {intl.formatMessage({ id: "global.controls.toggle_stations" })}
                            </Switch>
                        </Box>
                    </Box>
                </Container>

                <Box margin={50}></Box>



                <Box width="100%" height="300px" position="relative" mt={4}>
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                </Box>
            </VStack>
        </Container>
    );
};

export default HistoricClimateData1;
