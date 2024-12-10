import React, { useRef, useState } from 'react';
import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@open-pioneer/chakra-integration";
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
import HistoricClimatehook from '../hooks/HistoricClimatehook';

import { MAP_ID } from '../services/HistoricClimateMapProvider';
import { MAP_ID as MAP_ID2} from '../services/HistoricClimateMapProvider2';

const HistoricClimateData1 = () => {
    const intl = useIntl();

    const mapRef = useRef<HTMLDivElement>(null);

    HistoricClimatehook(mapRef);

    return (
        <Container minWidth={"container.xl"}>
            <Header subpage={'historic_compare'} />

            <Container flex={2} minWidth={"container.xl"}>
                <HStack width="100%">
                    <div style={{ flex: 1 }}>
                        <div style={{ margin: 20 }}>
                            <HStack>
                                <>
                                    {intl.formatMessage({ id: "global.controls.sel_year" })}
                                </>
                                <Select placeholder={intl.formatMessage({ id: "global.vars.year"})}>
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

                    <div style={{ flex: 1 }}>
                        <div style={{ margin: 20 }}>
                            <HStack>
                                <>
                                    {intl.formatMessage({ id: "global.controls.sel_year" })}
                                </>
                                <Select placeholder={intl.formatMessage({ id: "global.vars.year"})}>
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
                </HStack> 
                <HStack>
                    <Box width="100%" height ="500px">
                        <MainMap MAP_ID={MAP_ID}/>
                    </Box>
                    <Box width="100%" height ="500px">
                        <MainMap MAP_ID={MAP_ID2}/>
                    </Box>
                </HStack>
            </Container>
        </Container>
    );
};

export default HistoricClimateData1;