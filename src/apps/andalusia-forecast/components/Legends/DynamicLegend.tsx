// components/Legends/StaticPrecipitationLegend.tsx
import React from "react";
import {Box, Text} from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";
import {phenoColors, speicolors, uncertaintyColors} from "../utils/globals";

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





export const DynamicLegend = ({ variable, position }: { variable: string, position: "right" | "left" }) => {
    
    const intl = useIntl();
    let colorMapping = []
    let text = "";
    if (variable === 'temp'){
        text = intl.formatMessage({id: "global.vars.temp"})
        colorMapping = [
            { value: 0, color: pink, label: "<  0 ºC" },
            { value: 5, color: cold_blue, label: "0 - 5 ºC" },
            { value: 15, color: ice_blue, label: "5 - 10 ºC" },
            { value: 30, color: green, label: "10 - 15 ºC" },
            { value: 50, color: yellow, label: "15 - 20 ºC" },
            { value: 75, color: orange, label: "20 - 25 ºC" },
            { value: 100, color: red, label: "25 - 30 ºC" },
            { value: 150, color: dark_red, label: ">  30 ºC" },

        ];
    } else if (variable === 'precip'){
        text = intl.formatMessage({id: "global.vars.precip"})
        colorMapping = [
            { value: 0, color: p_01, label: "0 - 5 mm" },
            { value: 5, color: p_02, label: "5 - 15 mm" },
            { value: 15, color: p_03, label: "15 - 30 mm" },
            { value: 30, color: p_04, label: "30 - 50 mm" },
            { value: 50, color: p_05, label: "50 - 75 mm" },
            { value: 75, color: p_06, label: "75 - 100 mm" },
            { value: 100, color: p_07, label: "100 - 150 mm" },
            { value: 150, color: p_08, label: "> 150 mm" },

        ];
    } else if (variable.startsWith("spei")){
        text = intl.formatMessage({id: "global.vars.SPEI"})
        colorMapping = [
            { value: -2, color: speicolors.extrem_dry, label: "< -2" },
            { value: -1.5, color: speicolors.very_dry, label: "-2 - -1.5" },
            { value: -1, color: speicolors.dry, label: "-1.5 - -1" },
            { value: -0.25, color: speicolors.little_dry, label: "-1 - -0.25" },
            { value: 0.25, color:speicolors.normal, label: "-0.25 - 0.25" },
            { value: 1, color: speicolors.little_wet, label: "0.25 - 1" },
            { value: 1.5, color: speicolors.wet, label: "1 - 1.5" },
            { value: 2, color: speicolors.very_wet, label: "1.5 - 2" },
            { value: 3, color: speicolors.extrem_wet, label: "> 2" }
        ]
    } else if (variable === "CDD"){
        text = intl.formatMessage({id: "global.vars.csd"})
        colorMapping = [
            { value: 0, color: phenoColors.cdd_01, label: "0 - 20 días" },
            { value: 20, color: phenoColors.cdd_02, label: "21 - 40 días" },
            { value: 40, color: phenoColors.cdd_03, label: "41 - 60 días" },
            { value: 60, color: phenoColors.cdd_04, label: "61 - 80 días" },
            { value: 80, color: phenoColors.cdd_05, label: "81 - 100 días" },
        ];
    } else if (variable === "uncertainty"){
        text = intl.formatMessage({id: "global.vars.uncertainty"})
        colorMapping = [
            { value: 1, color: uncertaintyColors.red, label: intl.formatMessage({id: "global.legend.uncertainty.red"})},
            { value: 2, color: uncertaintyColors.yellow, label: intl.formatMessage({id: "global.legend.uncertainty.yellow"})},
            { value: 3, color: uncertaintyColors.green, label: intl.formatMessage({id: "global.legend.uncertainty.green"})},
        ]
    }
    
    
    const positionStyle = position === "right" ? { right: "10px" } : { left: "10px" };

    return (
        <Box
            position="absolute"
            top="10px"
            {...positionStyle}
            bg="white"
            p={2}
            borderRadius="md"
            boxShadow="md"
        >
            <Text fontWeight="bold" mb={2}>{text}</Text>
            {colorMapping.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                    <Box width="12px" height="12px" bg={item.color} mr={2} />
                    <Box>{item.label}</Box>
                </Box>
            ))}
        </Box>
    );
};
