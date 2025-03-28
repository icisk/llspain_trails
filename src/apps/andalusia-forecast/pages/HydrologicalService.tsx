import React, { useEffect, useState } from "react";
import { useMapModel } from "@open-pioneer/map";
import { MainMap } from "../components/MainComponents/MainMap";
import { MAP_ID } from "../services/HydrologicalMapProvider";
import { Container, Flex, Box, VStack, Checkbox, Radio, RadioGroup, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text, HStack } from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";

export function HydrologicalService() {
    const mapModel = useMapModel(MAP_ID);
    const intl = useIntl();

    const [thematicMap, setThematicMap] = useState<string>("");
    const [activeVectorLayers, setActiveVectorLayers] = useState<string[]>([]);
    const [opacity, setOpacity] = useState(1);
    const [chismorreosActive, setChismorreosActive] = useState(false);

    useEffect(() => {
        if (!mapModel || !mapModel.map?.olMap) return;

        const mapLayers = mapModel.map.olMap.getLayers().getArray();

        // Raster layer control
        mapLayers.forEach((layer) => {
            if (layer.get("thematic")) {
                layer.setVisible(false);
            }
        });

        if (thematicMap) {
            const selectedLayer = mapLayers.find((layer) => layer.get("id") === `thematic-${thematicMap}`);
            if (selectedLayer) {
                selectedLayer.setVisible(true);
                selectedLayer.setOpacity(opacity);
            }
        }

        // Vector layer control
        mapLayers.forEach((layer) => {
            if (layer.get("vector")) {
                const layerId = layer.get("id");
                layer.setVisible(activeVectorLayers.includes(layerId));
            }
        });

        // Toggle "Chismorreos del Acuífero" visibility
        const chismorreosLayer = mapLayers.find((layer) => layer.get("id") === "chismorreos");
        if (chismorreosLayer) {
            chismorreosLayer.setVisible(chismorreosActive);
        }

    }, [thematicMap, activeVectorLayers, opacity, chismorreosActive, mapModel]);

    // Toggle vector layer visibility
    const toggleVectorLayer = (layerId: string) => {
        setActiveVectorLayers((prev) =>
            prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
        );
    };

    return (
        <Container minWidth={"container.xl"}>
            <InfoBoxComponent
                header={intl.formatMessage({ id: "hydro_service.heading" })}
                description={intl.formatMessage({ id: "hydro_service.heading_descr" })}
            />

            <Flex gap={8} p={4} bg="white" borderRadius="md" mb={4}>
                {/* Thematic Maps Selection */}
                <VStack align="start" flex="1">
                    <p>{intl.formatMessage({ id: "hydro_service.selection_options.thematic_maps.title" })}</p>
                    <RadioGroup onChange={setThematicMap} value={thematicMap}>
                        <VStack align="start">
                            <Radio value="">{intl.formatMessage({ id: "hydro_service.selection_options.thematic_maps.none" })}</Radio>
                            <Radio value="1">{intl.formatMessage({ id: "hydro_service.selection_options.thematic_maps.land_use" })}</Radio>
                            <Radio value="2">{intl.formatMessage({ id: "hydro_service.selection_options.thematic_maps.geological" })}</Radio>
                            <Radio value="3">{intl.formatMessage({ id: "hydro_service.selection_options.thematic_maps.groundwater" })}</Radio>
                        </VStack>
                    </RadioGroup>

                    {/* Transparency Slider */}
                    {thematicMap && (
                        <VStack align="start" mt={4} w="full">
                            <p>{intl.formatMessage({ id: "hydro_service.selection_options.thematic_maps.opacity" })}</p>
                            <Slider
                                min={0} max={1} step={0.05}
                                value={opacity}
                                onChange={(val) => setOpacity(val)}
                                w="full"
                            >
                                <SliderTrack>
                                    <SliderFilledTrack />
                                </SliderTrack>
                                <SliderThumb />
                            </Slider>
                            <Text fontSize="sm" color="gray.600">{Math.round(opacity * 100)}%</Text>
                        </VStack>
                    )}
                </VStack>

                {/* Vector Layers & Chismorreos Selection */}
                <VStack align="start" flex="1">
                    <p>{intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.title" })}</p>
                    <VStack align="start">
                        <Checkbox isChecked={activeVectorLayers.includes("groundwater")} onChange={() => toggleVectorLayer("groundwater")}>
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.groundwater" })}
                        </Checkbox>
                        <Checkbox isChecked={activeVectorLayers.includes("authorities")} onChange={() => toggleVectorLayer("authorities_boundaries")}>
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.authorities_boundaries" })}
                        </Checkbox>
                        <Checkbox isChecked={activeVectorLayers.includes("municipalities")} onChange={() => toggleVectorLayer("municipalities")}>
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.municipalities" })}
                        </Checkbox>
                        <Checkbox isChecked={activeVectorLayers.includes("network")} onChange={() => toggleVectorLayer("network")}>
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.network" })}
                        </Checkbox>
                    </VStack>
                </VStack>

                {/* Chismorreos del Acuífero Checkbox */}
                <VStack align="start">
                    <HStack>
                        <Checkbox isChecked={chismorreosActive} onChange={() => setChismorreosActive(!chismorreosActive)}>
                            {intl.formatMessage({ id: "hydro_service.selection_options.aquifer_info" })}
                        </Checkbox>
                    </HStack>
                </VStack>
            </Flex>

            {/* Map Container */}
            <Box height={"500px"}>
                <MainMap MAP_ID={MAP_ID} />
            </Box>
        </Container>
    );
}

export default HydrologicalService;
