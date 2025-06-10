import React, { useEffect, useState } from "react";
import { useMapModel } from "@open-pioneer/map";
import { MainMap } from "../components/MainComponents/MainMap";
import { MAP_ID } from "../services/HydrologicalMapProvider";
import {
    Box,
    Button,
    Checkbox,
    Container,
    Flex,
    HStack,
    Radio,
    RadioGroup,
    Slider,
    SliderFilledTrack,
    SliderThumb,
    SliderTrack,
    Text,
    VStack
} from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";

export function HydrologicalService() {
    const mapModel = useMapModel(MAP_ID);
    const intl = useIntl();

    const [thematicMap, setThematicMap] = useState<string>("");
    const [activeVectorLayers, setActiveVectorLayers] = useState<string[]>([]);
    const [opacity, setOpacity] = useState(1);
    const [chismorreosActive, setChismorreosActive] = useState(false);
    const [visibleLegends, setVisibleLegends] = useState<string[]>([]);
    const [showLegends, setShowLegends] = useState(true);

    const legendUrls: Record<string, string> = {
        groundwater: "",
        authorities_boundaries: "",
        municipalities: "",
        network:
            "https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_masas_agua_andalucia_phc_2022_27?language=spa&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=red_hidrografica&format=image/png&STYLE=default",
        springs: "",
        measure_stations: "",
        catchmentGuadiana:
            "https://geoguadiana.chguadiana.es/geoserver/usos/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image%2Fpng&width=20&height=20&layer=captaciones",
        catchmentGuadalquivir:
            "http://idechg.chguadalquivir.es/inspire/wms?language=spa&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=CaptacionesDPH&format=image/png&STYLE=default",
        "thematic-1":
            "https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_siose_2020?language=spa&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=raster_recon_siose20&format=image/png&STYLE=default",
        "thematic-5":
            "https://mapas.igme.es/gis/services/Cartografia_Geologica/IGME_Geode_50/MapServer/WmsServer?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=1"
    };

    const updateVisibleLegends = (layerId: string, show: boolean) => {
        const legendUrl = legendUrls[layerId];
        if (!legendUrl) return;

        setVisibleLegends((prev) => {
            if (show) {
                return prev.includes(legendUrl) ? prev : [...prev, legendUrl];
            } else {
                return prev.filter((url) => url !== legendUrl);
            }
        });
    };

    useEffect(() => {
        if (!mapModel || !mapModel.map?.olMap) return;
        const mapLayers = mapModel.map.olMap.getLayers().getArray();

        mapLayers.forEach((layer) => {
            if (layer.get("thematic")) {
                const isActive = layer.get("id") === `thematic-${thematicMap}`;
                layer.setVisible(isActive);
                if (isActive) {
                    layer.setOpacity(opacity);
                }
            }
        });

        Object.keys(legendUrls)
            .filter((id) => id.startsWith("thematic-"))
            .forEach((id) => {
                updateVisibleLegends(id, id === `thematic-${thematicMap}`);
            });

        mapLayers.forEach((layer) => {
            if (layer.get("vector")) {
                const id = layer.get("id");
                const isActive = activeVectorLayers.includes(id);
                layer.setVisible(isActive);
                updateVisibleLegends(id, isActive);
            }
        });

        const chismorreosLayer = mapLayers.find((layer) => layer.get("id") === "chismorreos");
        if (chismorreosLayer) {
            chismorreosLayer.setVisible(chismorreosActive);
        }
    }, [thematicMap, activeVectorLayers, opacity, chismorreosActive, mapModel]);

    const toggleVectorLayer = (layerId: string) => {
        setActiveVectorLayers((prev) => {
            const isActive = prev.includes(layerId);
            return isActive ? prev.filter((id) => id !== layerId) : [...prev, layerId];
        });
    };

    return (
        <Container minWidth={"container.xl"}>
            <InfoBoxComponent
                header={intl.formatMessage({ id: "hydro_service.heading" })}
                description={intl.formatMessage({ id: "hydro_service.heading_descr" })}
            />

            <Flex gap={8} p={4} bg="white" borderRadius="md" mb={4}>
                {/* Thematic Maps */}
                <VStack align="start" flex="1">
                    <p>
                        {intl.formatMessage({
                            id: "hydro_service.selection_options.thematic_maps.title"
                        })}
                    </p>
                    <RadioGroup onChange={setThematicMap} value={thematicMap}>
                        <VStack align="start">
                            {["", "1", "2", "3", "4", "5"].map((value) => {
                                const legendKey = value ? `thematic-${value}` : null;
                                const hasLegend = legendKey && !!legendUrls[legendKey];
                                const labelId =
                                    value === ""
                                        ? "none"
                                        : [
                                              "land_use",
                                              "geological",
                                              "groundwater",
                                              "authorities",
                                              "geological"
                                          ][+value - 1];
                                const label = `${intl.formatMessage({ id: `hydro_service.selection_options.thematic_maps.${labelId}` })}${hasLegend ? " 🗺️" : ""}`;
                                return (
                                    <Radio key={value} value={value}>
                                        {label}
                                    </Radio>
                                );
                            })}
                        </VStack>
                    </RadioGroup>

                    {thematicMap && (
                        <VStack align="start" mt={4} w="full">
                            <p>
                                {intl.formatMessage({
                                    id: "hydro_service.selection_options.thematic_maps.opacity"
                                })}
                            </p>
                            <Slider
                                min={0}
                                max={1}
                                step={0.05}
                                value={opacity}
                                onChange={(val) => setOpacity(val)}
                                w="full"
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                            <Text fontSize="sm" color="gray.600">
                                {Math.round(opacity * 100)}%
                            </Text>
                        </VStack>
                    )}
                </VStack>

                {/* Vector Layers */}
                <VStack align="start" flex="1">
                    <p>
                        {intl.formatMessage({
                            id: "hydro_service.selection_options.hydro_data.title"
                        })}
                    </p>
                    <VStack align="start">
                        {[
                            "groundwater",
                            "authorities_boundaries",
                            "municipalities",
                            "network",
                            "springs",
                            // "aforos",
                            // "aguas_subter",
                            // "puntos_acui",
                            "measure_stations",
                            "catchmentGuadiana",
                            "catchmentGuadalquivir"
                        ].map((layerId) => {
                            const hasLegend = !!legendUrls[layerId];
                            const label = `${intl.formatMessage({ id: `hydro_service.selection_options.hydro_data.${layerId}` })}${hasLegend ? " 🗺️" : ""}`;
                            return (
                                <Checkbox
                                    key={layerId}
                                    isChecked={activeVectorLayers.includes(layerId)}
                                    onChange={() => toggleVectorLayer(layerId)}
                                >
                                    {label}
                                </Checkbox>
                            );
                        })}
                    </VStack>
                </VStack>

                {/* Chismorreos */}
                <VStack align="start">
                    <HStack>
                        <Checkbox
                            isChecked={chismorreosActive}
                            onChange={() => setChismorreosActive(!chismorreosActive)}
                        >
                            {intl.formatMessage({
                                id: "hydro_service.selection_options.aquifer_info"
                            })}
                        </Checkbox>
                    </HStack>
                </VStack>
            </Flex>

            {/* Kartencontainer */}
            <Box position="relative" height="500px">
                <MainMap MAP_ID={MAP_ID} />

                {/* Legenden-Anzeige */}
                <Box
                    position="absolute"
                    top="10px"
                    right="10px"
                    bg="rgba(255, 255, 255, 0.8)"
                    p={2}
                    borderRadius="md"
                    boxShadow="md"
                    zIndex={10}
                >
                    <Button size="sm" onClick={() => setShowLegends(!showLegends)} mb={2}>
                        {showLegends
                            ? intl.formatMessage({ id: "hydro_service.legend.hide" }) ||
                              "Legende ausblenden"
                            : intl.formatMessage({ id: "hydro_service.legend.show" }) ||
                              "Legende einblenden"}
                    </Button>

                    {showLegends && (
                        <Box maxHeight="300px" overflowY="auto">
                            {visibleLegends.map((url, index) => (
                                <Box key={index} mb={2}>
                                    <img
                                        src={url}
                                        alt={`Legend ${index}`}
                                        style={{ maxWidth: "200px" }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>
        </Container>
    );
}

export default HydrologicalService;
