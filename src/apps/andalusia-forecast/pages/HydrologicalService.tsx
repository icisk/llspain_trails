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
    VStack,
    Select
} from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";
import { buildCustomLegend } from "../components/Legends/buildCustomLegendHydroService";
import { InfoTooltip } from "../components/InfoTooltip/InfoTooltip";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import GeoTIFF from "ol/source/GeoTIFF";
import { map } from "highcharts";

export function HydrologicalService() {
    const mapModel = useMapModel(MAP_ID);
    const intl = useIntl();

    const [thematicMap, setThematicMap] = useState<string>("");
    const [activeVectorLayers, setActiveVectorLayers] = useState<string[]>([]);
    const [opacity, setOpacity] = useState(1);
    const [chismorreosActive, setChismorreosActive] = useState(false);
    const [visibleLegends, setVisibleLegends] = useState<legendEntry[]>([]);
    const [showLegends, setShowLegends] = useState(true);

    const [selectedMonth_groundwater, setSelectedMonth_groundwater] = useState("abril_2023");
    type legendEntry = 
        | { type: "image"; url: string }
        | { type: "custom"; content: React.ReactNode, id: string };

    const legendUrls: Record<string, string> = {
        groundwater: "",
        authorities_boundaries: "",
        municipalities: "",
        network:"",
        springs: "",
        measure_stations: "",
        catchmentGuadiana:"",
        catchmentGuadalquivir:"",
        "thematic-1":
            "https://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_siose_2020?language=spa&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=raster_recon_siose20&format=image/png&STYLE=default",
        "thematic-2":"",
        "thematic-3":"",
        hydro_description: ""
    };

    const updateVisibleLegends = (layerId: string, show: boolean) => {
        console.log(`Updating legend for layer: ${layerId}, show: ${show}`);

        const legendUrl = legendUrls[layerId];
        const customLegend = buildCustomLegend(layerId);
    
        if (!legendUrl && !customLegend) return;
    
        setVisibleLegends((prev) => {
            const filtered = prev.filter((entry) => {
                if (entry.type === "image") {
                    return entry.url !== legendUrl;
                }
                if (entry.type === "custom") {
                    return entry.id !== layerId;
                }
                return true;
            });
    
            if (!show) return filtered;
    
            if (customLegend) {
                return [...filtered, { type: "custom", content: customLegend, id: layerId }];
            }
    
            if (legendUrl) {
                return [...filtered, { type: "image", url: legendUrl }];
            }
    
            return filtered;
        });
    }; 

    useEffect(() => {
        if (!mapModel || !mapModel.map?.olMap) return;
        const mapLayers = mapModel.map.olMap.getLayers().getArray();
    
        // Thematische Layer
        mapLayers.forEach((layer) => {
            if (layer.get("thematic")) {
                const isActive = layer.get("id") === `thematic-${thematicMap}`;
                layer.setVisible(isActive);
                if (isActive) layer.setOpacity(opacity);
            }
        });
    
        // Vektor-Layer
        mapLayers.forEach((layer) => {
            if (layer.get("vector")) {
                const id = layer.get("id");
                const isActive = activeVectorLayers.includes(id);
                layer.setVisible(isActive);
                updateVisibleLegends(id, isActive);
            }
        });
    
        // Chismorreos / hydro_desc Layer
        mapLayers.forEach((layer) => {
            if (layer.get("id") === "hydro_description") {
                const id = layer.get("id");
                const isActive = chismorreosActive;
                layer.setVisible(isActive);
                updateVisibleLegends(id, isActive);
            }
        });
    
        // Legenden für thematische Layer aktualisieren
        Object.keys(legendUrls)
            .filter((id) => id.startsWith("thematic-"))
            .forEach((id) => {
                updateVisibleLegends(id, id === `thematic-${thematicMap}`);
            });
    }, [thematicMap, activeVectorLayers, opacity, chismorreosActive, mapModel]);
    

    const toggleVectorLayer = (layerId: string) => {
        setActiveVectorLayers((prev) => {
            const isActive = prev.includes(layerId);
            return isActive ? prev.filter((id) => id !== layerId) : [...prev, layerId];
        });
    };

    // debug use effect to track visibleLegends changes
    useEffect(() => {
        console.log("Visible Legends Updated:", visibleLegends);
    }, [visibleLegends]);

    // Display different groundwater layer based on selected month
    useEffect(() => {
        if (!mapModel?.map?.olMap) return;    
        const mapLayers = mapModel.map.olMap.getLayers().getArray();
        console.log("mapLayers:", mapLayers);

        const groundwaterLayer = mapLayers.find(l => l.get("id") === "thematic-3");

        if (groundwaterLayer) {

            console.log("groundwaterLayer found:", groundwaterLayer);
            const newSource = new GeoTIFF({
                sources: [
                    {
                        url: `https://52n-i-cisk.obs.eu-de.otc.t-systems.com/cog/spain/data/HYDROMAP/isolines/COG_ICISK_${selectedMonth_groundwater}.tiff`,
                        nodata: -99999,
                        bands: [1],
                    }
                ],
                projection: "EPSG:25830"
            });
    
            groundwaterLayer.setSource(newSource);    

            groundwaterLayer.setVisible(thematicMap === "3");
            groundwaterLayer.setOpacity(opacity);
        }
    }, [selectedMonth_groundwater, thematicMap, opacity, mapModel]);
    

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
                            {["", "1", "2", "3"].map((value) => {
                                const legendKey = value ? `thematic-${value}` : null;
                                const hasLegend = legendKey && !!legendUrls[legendKey];
                                const labelId =
                                    value === ""
                                        ? "none"
                                        : ["land_use", "geological", "groundwater"][+value - 1];
                                const label = `${intl.formatMessage({
                                    id: `hydro_service.selection_options.thematic_maps.${labelId}`
                                })}${hasLegend ? " 🗺️" : ""}`;

                                return (
                                    <VStack key={value} align="start">
                                        <HStack>
                                            <Radio value={value}>{label}</Radio>
                                            {value !== "" && (
                                                <InfoTooltip
                                                    i18n_path={`hydro_service.info.${[
                                                        "land_use",
                                                        "geological",
                                                        "groundwater"
                                                    ][+value - 1]}`}
                                                />
                                            )}
                                        </HStack>
                                        {thematicMap === "3" && value === "3" && (
                                            <Select
                                                value={selectedMonth_groundwater}
                                                onChange={(e) =>
                                                    setSelectedMonth_groundwater(e.target.value)
                                                }
                                                w="200px"
                                            >
                                                <option value="abril_2023">Abril 2023</option>
                                                <option value="noviembre_2023">Noviembre 2023</option>
                                                <option value="abril_2024">Abril 2024</option>
                                                <option value="noviembre_2024">Noviembre 2024</option>
                                                <option value="abril_2025">Abril 2025</option>
                                            </Select>
                                        )}
                                    </VStack>
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
                            "groundwater_bounds",
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
                                <HStack>
                                    <Checkbox
                                        key={layerId}
                                        isChecked={activeVectorLayers.includes(layerId)}
                                        onChange={() => toggleVectorLayer(layerId)}
                                    >
                                        {label}
                                    </Checkbox>
                                    <InfoTooltip i18n_path={`hydro_service.info.${layerId}`}/>
                                </HStack>  
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
                        <InfoTooltip i18n_path={'hydro_service.info.desc_hydro'}/>
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
                            {visibleLegends.map((entry, index) => (
                                <Box key={index} mb={2}>
                                    {entry.type === "image" ? (
                                        <img src={entry.url} alt={`Legend ${index}`} style={{ maxWidth: "200px" }} />
                                    ) : (
                                        entry.content
                                    )}
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
