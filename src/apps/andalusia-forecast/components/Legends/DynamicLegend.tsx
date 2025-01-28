// components/Legends/StaticPrecipitationLegend.tsx
import React from "react";
import {Box, Text} from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";

//temperature colors
const pink = '#eb7fe9BC'
const cold_blue = '#4f59cdBC'
const ice_blue = '#1ceae1BC'
const green = '#5fdf65BC'
const yellow = '#eade57BC'
const orange = '#ec8647BC'
const red = '#832525BC'
const dark_red = '#53050aBC'


//precip colors
const p_01 = '#C4DAF6BC'
const p_02 = '#588fe1BC'
const p_03 = '#1f569eBC'
const p_04 = '#103278BC'
const p_05 = '#AA4DD8BC'
const p_06 = '#912198BC'
const p_07 = '#591061BC'
const p_08 = '#290A47BC'
const p_09 = '#11011eBC'



const colorMapping = [
    { value: 0, color: pink, label: "<  0 ºC" },
    { value: 5, color: cold_blue, label: "0 - 5 ºC" },
    { value: 15, color: ice_blue, label: "5 - 10 ºC" },
    { value: 30, color: green, label: "10 - 15 ºC" },
    { value: 50, color: yellow, label: "15 - 20 ºC" },
    { value: 75, color: orange, label: "20 - 25 ºC" },
    { value: 100, color: red, label: "25 - 30 ºC" },
    { value: 150, color: dark_red, label: ">  30 ºC" },
    //{ value: 300, color: p_09, label: "> 100 ºC" },
];

export const DynamicPrecipitationLegend = () => {
    const intl = useIntl();

    return (
        <Box position="absolute" top="10px" right="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Text fontWeight="bold" mb={2}>{intl.formatMessage({id: "global.vars.temp"})}</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
