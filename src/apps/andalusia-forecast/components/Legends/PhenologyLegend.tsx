// components/Legends/RainbowLegend.tsx
import React from "react";
import { Box, Text } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";

// Rainbow colors with 75% transparency
const red = '#FF0000BF';
const orange = '#FF7F00BF';
const yellow = '#FFFF00BF';
const green = '#00FF00BF';
const turquoise = '#00FFFFBF';
const blue = '#0000FFBF';
const indigo = '#4B0082BF';
const violet = '#8B00FFBF';
const pink = '#FF69B4BF';
const purple = '#800080BF';

// Color mapping based on range
const colorMapping = [
    { value: 0, color: red, label: "0 - 10" },
    { value: 10, color: orange, label: "10 - 20" },
    { value: 20, color: yellow, label: "20 - 30" },
    { value: 30, color: green, label: "30 - 40" },
    { value: 40, color: turquoise, label: "40 - 50" },
    { value: 50, color: blue, label: "50 - 60" },
    { value: 60, color: indigo, label: "60 - 70" },
    { value: 70, color: violet, label: "70 - 80" },
    { value: 80, color: pink, label: "80 - 90" },
    { value: 90, color: purple, label: "90 - 100" },
];

export const PhenologyLegend = () => {
    const intl = useIntl();

    return (
        <Box position="absolute" top="10px" left="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={2}>{intl.formatMessage({ id: "global.vars.csd" })}</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
