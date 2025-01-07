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
        if (mapState?.map?.olMap) {
            const olMap = mapState.map.olMap;
            const stationsLayer = olMap.getLayers().getArray().find(layer => layer.get('title') === 'Stations');
            if (stationsLayer) {
                stationsLayer.setVisible(stationsVisibleMap1);
            }
        }
    }, [stationsVisibleMap1, mapState]);

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
