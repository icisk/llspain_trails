import React, { useEffect, useRef, useState } from 'react';
import { Box, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@open-pioneer/chakra-integration";
import { HStack, Select, VStack } from "@chakra-ui/react";
import { Container } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { ChangeMonth } from "../controls/ChangeMonth";
import { MapAnchor, MapContainer } from "@open-pioneer/map";
import { MAP_ID } from "../services/MapProvider";
import { ZoomIn, ZoomOut } from "@open-pioneer/map-navigation";
import { RadioGroup, Radio } from "@open-pioneer/chakra-integration";

import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import View from 'ol/View.js';
import { getRenderPixel } from 'ol/render.js';
import XYZ from 'ol/source/XYZ';

import { InfoTooltip } from "../components/InfoTooltip/InfoTooltip";
import { RegionZoom } from "../components/RegionZoom/RegionZoom";
import { Header } from "../components/MainComponents/Header";
import { MainMap } from "../components/MainComponents/MainMap";

const HistoricClimateData1 = () => {
    const intl = useIntl();

    const mapRef = useRef<HTMLDivElement>(null);
    const [swipeValue, setSwipeValue] = useState<number>(50);

    const key = '2sau1xauZfmyliK5rhUv';

    useEffect(() => {
        if (!mapRef.current) return;

        const tile1 = new TileLayer({
            source: new XYZ({
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            }),
        });

        const tile2 = new TileLayer({
            source: new XYZ({
                url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${key}`,
                maxZoom: 20,
                attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            }),
        });

        const mapForMapSlider = new Map({
            layers: [tile1, tile2],
            target: mapRef.current,
            view: new View({
                center: [-460000, 4540000],
                zoom: 8,
            }),
        });

        tile2.on('prerender', (event: any) => {
            const ctx = event.context;
            const mapSize = mapForMapSlider.getSize();
            if (!mapSize) return;
      
            const width = mapSize[0] * (swipeValue / 100);
            const tl = getRenderPixel(event, [width, 0]);
            const tr = getRenderPixel(event, [mapSize[0], 0]);
            const bl = getRenderPixel(event, [width, mapSize[1]]);
            const br = getRenderPixel(event, mapSize);
      
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(tl[0], tl[1]);
            ctx.lineTo(bl[0], bl[1]);
            ctx.lineTo(br[0], br[1]);
            ctx.lineTo(tr[0], tr[1]);
            ctx.closePath();
            ctx.clip();
        });

        tile2.on('postrender', (event: any) => {
            const ctx = event.context;
            ctx.restore();
        });

        return () => {
            mapForMapSlider.setTarget(null);
        };

    }, [swipeValue]);   

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
                                <Select placeholder="year">
                                    {[1990, 2000].map(year => (
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
                                <Select placeholder="year">
                                    {[1990, 2000].map(year => (
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

                <Box>
                    <Box ref={mapRef} w="100%" h="500px" />
                    <Box>
                        <Slider aria-label="slider-ex" defaultValue={50} onChange={(val) => setSwipeValue(val)}>
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb />
                        </Slider>
                    </Box>
                </Box>
            </Container>
        </Container>
    );
};

export default HistoricClimateData1;
