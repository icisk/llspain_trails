// components/Legends/StaticPrecipitationLegend.tsx
import React from "react";
import {Box, Text, HStack, VStack} from "@open-pioneer/chakra-integration";
import {useIntl} from "open-pioneer:react-hooks";
import {phenoColors, phenocolors_SU, speicolors, uncertaintyColors, oliveOilColors} from "../utils/globals";

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

function hextoRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const DynamicLegend = ({ variable, position }: { variable: string, position: "right" | "left" }) => {
    
    const intl = useIntl();
    let colorMapping = []
    let text = "";
    if (variable === 'temp'){
        text = intl.formatMessage({id: "global.vars.temp"})
        colorMapping = [
            { value: 0, color: pink, label: "<  0 ºC" },
            { value: 5, color: cold_blue, label: "5 ºC" },
            { value: 15, color: ice_blue, label: "10 ºC" },
            { value: 30, color: green, label: "15 ºC" },
            { value: 50, color: yellow, label: "20 ºC" },
            { value: 75, color: orange, label: "25 ºC" },
            { value: 100, color: red, label: "30 ºC" },
            { value: 150, color: dark_red, label: ">  30 ºC" },

        ];
    } else if (variable === 'precip'){
        text = intl.formatMessage({id: "global.vars.precip"})
        colorMapping = [
            { value: 0, color: p_01, label: "0 mm" },
            { value: 5, color: p_02, label: "5 mm" },
            { value: 15, color: p_03, label: "15 mm" },
            { value: 30, color: p_04, label: "30 mm" },
            { value: 50, color: p_05, label: "50 mm" },
            { value: 75, color: p_06, label: "75 mm" },
            { value: 100, color: p_07, label: "100 mm" },
            { value: 150, color: p_08, label: "> 150 mm" },

        ];
    } else if (variable.startsWith("spei")){
        text = intl.formatMessage({id: "global.vars.SPEI"})
        colorMapping = [
            { value: -2, color: speicolors.extrem_dry, label: "-2" },
            { value: -1.5, color: speicolors.very_dry, label: "-1.5" },
            { value: -1, color: speicolors.dry, label: "-1" },
            { value: -0.25, color: speicolors.little_dry, label: "-0.25" },
            { value: 0.25, color:speicolors.normal, label: "0.25" },
            { value: 1, color: speicolors.little_wet, label: "1" },
            { value: 1.5, color: speicolors.wet, label: "1.5" },
            { value: 2, color: speicolors.very_wet, label: "2" },
            { value: 3, color: speicolors.extrem_wet, label: "> 2" }
        ]
    } else if (variable.startsWith("spi")){
        text = intl.formatMessage({id: "global.vars.SPI"})
        colorMapping = [
            { value: -2, color: speicolors.extrem_dry, label: "-2" },
            { value: -1.5, color: speicolors.very_dry, label: "-1.5" },
            { value: -1, color: speicolors.dry, label: "-1" },
            { value: -0.25, color: speicolors.little_dry, label: "-0.25" },
            { value: 0.25, color:speicolors.normal, label: "0.25" },
            { value: 1, color: speicolors.little_wet, label: "1" },
            { value: 1.5, color: speicolors.wet, label: "1.5" },
            { value: 2, color: speicolors.very_wet, label: "2" },
            { value: 3, color: speicolors.extrem_wet, label: "> 2" }
        ]
    } else if (variable === "CDD"){
        text = intl.formatMessage({id: "global.vars.DSC"})
        colorMapping = [
            { value: 0, color: hextoRGBA(phenoColors.cdd_01, 0.75), label: "0 días" },
            { value: 20, color: hextoRGBA(phenoColors.cdd_02, 0.75), label: "25 días" },
            { value: 40, color: hextoRGBA(phenoColors.cdd_03, 0.75), label: "50 días" },
            { value: 60, color: hextoRGBA(phenoColors.cdd_04, 0.75), label: "75 días" },
            { value: 80, color: hextoRGBA(phenoColors.cdd_05, 0.75), label: "100 días" },
        ];
    } else if (variable === "uncertainty"){
        text = intl.formatMessage({id: "global.vars.uncertainty"})
        colorMapping = [
            { value: 1, color: uncertaintyColors.red, label: intl.formatMessage({id: "global.legend.uncertainty.red"})},
            { value: 2, color: uncertaintyColors.yellow, label: intl.formatMessage({id: "global.legend.uncertainty.yellow"})},
            { value: 3, color: uncertaintyColors.green, label: intl.formatMessage({id: "global.legend.uncertainty.green"})},
        ]
    } else if (variable === "CSU"){
        text = intl.formatMessage({ id: "global.vars.DVC" });
        colorMapping = [
            { value: 0, color: hextoRGBA(phenoColors.cdd_01, 0.75), label: "0 días" },
            { value: 20, color: hextoRGBA(phenoColors.cdd_02, 0.75), label: "25 días" },
            { value: 40, color: hextoRGBA(phenoColors.cdd_03, 0.75), label: "50 días" },
            { value: 60, color: hextoRGBA(phenoColors.cdd_04, 0.75), label: "75 días" },
            { value: 80, color: hextoRGBA(phenoColors.cdd_05, 0.75), label: "100 días" },
        ];
    } else if (variable === "SU") {
        text = intl.formatMessage({ id: "global.vars.DV" });
        colorMapping = [
            { value: 0,  color: hextoRGBA(phenocolors_SU.su_00, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_00" }) },
            { value: 2,  color: hextoRGBA(phenocolors_SU.su_01, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_01" }) },
            { value: 4,  color: hextoRGBA(phenocolors_SU.su_02, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_02" }) },
            { value: 6,  color: hextoRGBA(phenocolors_SU.su_03, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_03" }) },
            { value: 8,  color: hextoRGBA(phenocolors_SU.su_04, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_04" }) },
            { value: 10, color: hextoRGBA(phenocolors_SU.su_05, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_05" }) },
            { value: 12, color: hextoRGBA(phenocolors_SU.su_06, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_06" }) },
            { value: 14, color: hextoRGBA(phenocolors_SU.su_07, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_07" }) },
            { value: 16, color: hextoRGBA(phenocolors_SU.su_08, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_08" }) },
            { value: 18, color: hextoRGBA(phenocolors_SU.su_09, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_09" }) },
            { value: 20, color: hextoRGBA(phenocolors_SU.su_10, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_10" }) },
            { value: 25, color: hextoRGBA(phenocolors_SU.su_11, 0.75), label: intl.formatMessage({ id: "global.legend.su.su_11" }) },
        ];
    } else if (variable === 'oliveoil') {
        text = 'producción [Kg/ha]'
        colorMapping = [
            { value: 0,    color: hextoRGBA(oliveOilColors.oo1, 0.75),  label: "0" },
            { value: 500,  color: hextoRGBA(oliveOilColors.oo2, 0.75),  label: "500" },
            { value: 1000, color: hextoRGBA(oliveOilColors.oo3, 0.75),  label: "1000" },
            { value: 1500, color: hextoRGBA(oliveOilColors.oo4, 0.75),  label: "1500" },
            { value: 2000, color: hextoRGBA(oliveOilColors.oo5, 0.75),  label: "2000" },
            { value: 2500, color: hextoRGBA(oliveOilColors.oo6, 0.75),  label: "2500" },
            { value: 3000, color: hextoRGBA(oliveOilColors.oo7, 0.75),  label: "3000" },
            { value: 3500, color: hextoRGBA(oliveOilColors.oo8, 0.75),  label: "3500" },
            { value: 4000, color: hextoRGBA(oliveOilColors.oo9, 0.75),  label: "4000" },
            { value: 4500, color: hextoRGBA(oliveOilColors.oo10, 0.75), label: "4500" },
            { value: 5000, color: hextoRGBA(oliveOilColors.oo11, 0.75), label: "5000" },
            { value: 5500, color: hextoRGBA(oliveOilColors.oo12, 0.75), label: "5500" },
            { value: 6000, color: hextoRGBA(oliveOilColors.oo13, 0.75), label: "6000" },
            { value: 6500, color: hextoRGBA(oliveOilColors.oo14, 0.75), label: "6500" }
        ];
    }
    
  
    const positionStyle = position === "right" ? { right: "10px" } : { left: "10px" };

    return (
        <Box
            position="absolute"
            top="10px"
            {...positionStyle}
            bg="#efefef"
            p={2}
            borderRadius="md"
            boxShadow="md"
        >
            <Text fontWeight="bold" mb={2}>{text}</Text>
            <HStack alignItems="flex-start">
                {variable === "SU" ? (
                    // Einzelne Kästchen für SU
                    <VStack spacing={0} align="flex-start">
                        {colorMapping.map((item, index) => (
                            <HStack key={index} spacing={2}>
                                <Box
                                    width="12px"
                                    height="12px"
                                    background={item.color}
                                    border="1px solid #ccc"
                                />
                                <Text fontSize="xs">{item.label}</Text>
                            </HStack>
                        ))}
                    </VStack>
                ) : (
                    // Farbverlauf für andere Variablen
                    <>
                        <Box
                            width="20px"
                            height="250px"
                            background={`linear-gradient(to bottom, ${colorMapping.map((item) => item.color).join(', ')})`}
                            mb={2}
                        />
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            height="250px"
                            flexDirection="column"
                            alignItems="flex-start"
                        >
                            {colorMapping.map((item, index) => (
                                <Text key={index} fontSize="xs">
                                    {item.label}
                                </Text>
                            ))}
                        </Box>
                    </>
                )}
            </HStack>

        </Box>
    );
};
