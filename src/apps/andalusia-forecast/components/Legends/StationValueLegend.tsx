// components/Legends/StationValueLegend.tsx
import React from "react";
import { Box, Text } from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";
import { stationValueColors} from "../utils/globals";

//precip colors
const v_01 = stationValueColors.purple
const v_02 = stationValueColors.blue
const v_03 = stationValueColors.red

export const StationValueLegend = () => {
    const intl = useIntl();
    
    const colorMapping = [
        { value: 1, color: v_01, label: intl.formatMessage({id: "historic_climate_stations.radio_buttons.temp_precip"}) },
        { value: 2, color: v_02, label: intl.formatMessage({id: "historic_climate_stations.radio_buttons.precip"}) },
        { value: 3, color: v_03, label: intl.formatMessage({id: "historic_climate_stations.radio_buttons.temp"}) }
    ];

    return (
        <Box position="absolute" top="10px" right="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={2}>{intl.formatMessage({id: "historic_climate_stations.heading_legend"})}</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
