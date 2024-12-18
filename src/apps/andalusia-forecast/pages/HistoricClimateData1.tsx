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

import SelectInteraction from "ol/interaction/Select";
import { click } from "ol/events/condition";


const HistoricClimateData1 = () => {
    const intl = useIntl();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapState = useMapModel(MAP_ID);
    const mapState2 = useMapModel(MAP_ID2);
    const [stationsVisibleMap1, setStationsVisibleMap1] = useState(true);
    const [stationsVisibleMap2, setStationsVisibleMap2] = useState(true);

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
                    const properties = feature.getProperties();
                    console.log("Selected feature properties:", properties);
                }
            });

            return () => {
                olMap.removeInteraction(selectInteraction);
            };
        }
    }, [mapState]);

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
        <Box>
            <Header subpage={'historic_compare'} />
            <Box>
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

                    {/* Second map section (similar to first) */}
                    <Container flex={2} minWidth={"container.xl"}>
                        {/* Similar structure to first map section */}
                        <div style={{ flex: 1 }}>
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
                            <MainMap MAP_ID={MAP_ID2} />
                            <DynamicPrecipitationLegend />
                            <Box position="absolute" bottom="10px" left="10px">
                                <Switch
                                    isChecked={stationsVisibleMap2}
                                    onChange={() => setStationsVisibleMap2(!stationsVisibleMap2)}
                                >
                                    {intl.formatMessage({ id: "global.controls.toggle_stations" })}
                                </Switch>
                            </Box>
                        </Box>
                    </Container>
                </VStack>
            </Box>
        </Box>
    );
};

export default HistoricClimateData1;