// components/Legends/StaticPrecipitationLegend.tsx
import React from "react";
import { Box, Text } from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";

const colorMapping = [
    { value: 0, color: "red", label: "0 - 7.5 mm" },
    { value: 7.5, color: "orange", label: "7.5 - 15 mm" },
    { value: 15, color: "yellow", label: "15 - 22.5 mm" },
    { value: 22.5, color: "green", label: "22.5 - 30 mm" },
    { value: 30, color: "blue", label: "30 - 37.5 mm" },
    { value: 37.5, color: "indigo", label: "37.5 - 45 mm" },
    { value: 45, color: "violet", label: "45 - 50 mm" },
    { value: 50, color: "purple", label: "> 50 mm" }
];

export const StaticPrecipitationLegend = () => {
    const intl = useIntl();
    
    return (
        <Box position="absolute" top="10px" right="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={2}>{intl.formatMessage({id: "global.vars.precip"})}</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
