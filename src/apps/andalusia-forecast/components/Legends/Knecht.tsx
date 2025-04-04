// components/Legends/StaticPrecipitationLegend.tsx
import React from "react";
import { Box, Text } from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";
import {speicolors} from "../utils/globals";

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
    { value: 0, color: p_01, label: "0 - 5 mm" },
    { value: 5, color: p_02, label: "5 - 15 mm" },
    { value: 15, color: p_03, label: "15 - 30 mm" },
    { value: 30, color: p_04, label: "30 - 50 mm" },
    { value: 50, color: p_05, label: "50 - 75 mm" },
    { value: 75, color: p_06, label: "75 - 100 mm" },
    { value: 100, color: p_07, label: "100 - 150 mm" },
    { value: 150, color: p_08, label: "> 150 mm" },
    //{ value: 300, color: p_09, label: "> 100 mm" },
];

export const LeftLegend = () => {
    const intl = useIntl();

    return (
        <Box position="absolute" top="10px" left="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
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
