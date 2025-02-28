import React, { useEffect, useState } from "react";
import { useMapModel } from "@open-pioneer/map";
import { MainMap } from "../components/MainComponents/MainMap";
import { MAP_ID } from "../services/HydrologicalMapProvider";
import { Container, Flex, Box, VStack, Checkbox, Radio, RadioGroup } from "@open-pioneer/chakra-integration";
import { InfoBoxComponent } from "info-box";
import { useIntl } from "open-pioneer:react-hooks";

export function HydrologicalService() {
    const mapModel = useMapModel(MAP_ID);
    const intl = useIntl();

    const [thematicMap, setThematicMap] = useState<string>("");

    const [activeVectorLayers, setActiveVectorLayers] = useState<string[]>([]);

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
            }
        }

        // Vektor Layer control
        mapLayers.forEach((layer) => {
            if (layer.get("vector")) {
                const layerId = layer.get("id");
                layer.setVisible(activeVectorLayers.includes(layerId));
            }
        });

    }, [thematicMap, activeVectorLayers, mapModel]);

    // toggle vector layer visibility
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

            {/* Container für Raster- und Vektor-Layer */}
            <Flex gap={8} p={4} bg="white" borderRadius="md" mb={4}>

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
                </VStack>

                <VStack align="start" flex="1">
                    <p>{intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.title" })}</p>
                    <VStack align="start">
                        <Checkbox
                            isChecked={activeVectorLayers.includes("groundwater")}
                            onChange={() => toggleVectorLayer("groundwater")}
                        >
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.groundwater" })}
                        </Checkbox>
                        <Checkbox
                            isChecked={activeVectorLayers.includes("authorities")}
                            onChange={() => toggleVectorLayer("authorities_boundaries")}
                        >
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.authorities_boundaries" })}
                        </Checkbox>
                        <Checkbox
                            isChecked={activeVectorLayers.includes("municipalities")}
                            onChange={() => toggleVectorLayer("municipalities")}
                        >
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.municipalities" })}
                        </Checkbox>
                        <Checkbox
                            isChecked={activeVectorLayers.includes("network")}
                            onChange={() => toggleVectorLayer("network")}
                        >
                            {intl.formatMessage({ id: "hydro_service.selection_options.hydro_data.network" })}
                        </Checkbox>
                    </VStack>
                </VStack>

            </Flex>

            <Box height={"500px"}>
                <MainMap MAP_ID={MAP_ID} />
            </Box>
        </Container>
    );
}

export default HydrologicalService;
