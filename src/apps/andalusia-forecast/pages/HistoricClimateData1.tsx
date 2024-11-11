import React from 'react';
import {Box, Flex} from "@open-pioneer/chakra-integration";
import {HStack, Select, VStack} from "@chakra-ui/react";
import {Container} from "@open-pioneer/chakra-integration";
import {InfoBoxComponent} from "info-box";
import {useIntl} from "open-pioneer:react-hooks";
import {ChangeMonth} from "../controls/ChangeMonth";
import {MapAnchor, MapContainer} from "@open-pioneer/map";
import {MAP_ID} from "../services/MapProvider";
import {ZoomIn, ZoomOut} from "@open-pioneer/map-navigation";
import {RadioGroup, Radio} from "@open-pioneer/chakra-integration";


import {InfoTooltip} from "../components/InfoTooltip/InfoTooltip";
import {RegionZoom} from "../components/RegionZoom/RegionZoom";
import {Header} from "../components/MainComponents/Header";
import {Map} from "../components/MainComponents/Map";



const HistoricClimateData1 = () => {
    const intl = useIntl();
    return (
        <Container minWidth={"container.xl"}>
            <Header subpage={'historic_compare'} />


            <Container flex={2} minWidth={"container.xl"}>
                <HStack width="100%">
                    <div style={{flex: 1}}>
                        <div style={{margin: 20}}>
                            <HStack>
                                <>
                                    {intl.formatMessage({id: "global.controls.sel_year"})}
                                </>
                                <Select placeholder="year">
                                    {[1990, 2000].map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                            <ChangeMonth/>
                        </div>

                        <RadioGroup defaultValue="1">
                            <p>{intl.formatMessage({id: "global.controls.sel_var"})}:</p>
                            <VStack gap="1">
                                <HStack>
                                    <Radio
                                        value="1">{intl.formatMessage({id: "global.vars.temp"})}</Radio>
                                    <InfoTooltip i18n_path="historic_compare.info.temp"/>
                                </HStack>
                                <HStack>
                                    <Radio
                                        value="2">{intl.formatMessage({id: "global.vars.precip"})}</Radio>
                                    <InfoTooltip i18n_path="historic_compare.info.precip"/>
                                </HStack>
                            </VStack>
                        </RadioGroup>


                    </div>
                    <div style={{flex: 1}}>

                        <div style={{margin: 20}}>
                            <HStack>
                                <>
                                    {intl.formatMessage({id: "global.controls.sel_year"})}
                                </>
                                <Select placeholder="year">
                                    {[1990, 2000].map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </Select>
                            </HStack>
                            <ChangeMonth/>
                        </div>

                        <RadioGroup defaultValue="1">
                            <p>{intl.formatMessage({id: "global.controls.sel_var"})}:</p>
                            <VStack gap="1">
                                <HStack>
                                    <Radio
                                        value="1">{intl.formatMessage({id: "global.vars.temp"})}</Radio>
                                    <InfoTooltip i18n_path="historic_compare.info.temp"/>
                                </HStack>
                                <HStack>
                                    <Radio
                                        value="2">{intl.formatMessage({id: "global.vars.precip"})}</Radio>
                                    <InfoTooltip i18n_path="historic_compare.info.precip"/>
                                </HStack>
                            </VStack>
                        </RadioGroup>


                    </div>
                </HStack>
                <p style={{
                    fontSize: '30px',
                    color: 'red'
                }}>https://openlayers.org/en/latest/examples/layer-swipe.html</p>
                <Map MAP_ID={MAP_ID}/>


            </Container>
        </Container>


    )
};

export default HistoricClimateData1;
