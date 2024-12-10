// components/Legends/StaticPrecipitationLegend.tsx
import React from "react";
import { Box, Text } from "@open-pioneer/chakra-integration";

const colorMapping = [
    { value: 0, color: "red", label: "0 - 15 mm" },
    { value: 15, color: "red", label: "15 - 30 mm" },
    { value: 30, color: "orange", label: "30 - 45 mm" },
    { value: 45, color: "yellow", label: "45 - 60 mm" },
    { value: 60, color: "green", label: "60 - 75 mm" },
    { value: 75, color: "blue", label: "75 - 90 mm" },
    { value: 90, color: "indigo", label: "90 - 100 mm" },
    { value: 100, color: "violet", label: "> 100 mm" }
];

export const StaticPrecipitationLegend = () => {
    return (
        <Box position="absolute" top="10px" right="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={2}>Precipitation Forecast</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};